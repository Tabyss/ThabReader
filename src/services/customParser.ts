import JSZip from 'jszip';

export interface EpubChapter {
  id: string;
  html: string;
}

export const parsePdfNative = (blob: Blob): string => {
  return URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
};

// Fungsi helper untuk menyelesaikan path relatif (misal: "OEBPS/Text" + "../Images/pic.jpg" -> "OEBPS/Images/pic.jpg")
const resolvePath = (basePath: string, relativePath: string): string => {
  const stack = basePath.split('/');
  stack.pop(); // buang nama file saat ini
  const parts = relativePath.split('/');
  for (const part of parts) {
    if (part === '.') continue;
    if (part === '..') stack.pop();
    else stack.push(part);
  }
  return stack.join('/');
};

export const parseEpubCustom = async (blob: Blob): Promise<EpubChapter[]> => {
  const zip = await JSZip.loadAsync(blob);
  const parser = new DOMParser();

  const containerXml = await zip.file('META-INF/container.xml')?.async('text');
  if (!containerXml) throw new Error('Bukan file EPUB yang valid');

  const containerDoc = parser.parseFromString(containerXml, 'application/xml');
  const rootFilePath = containerDoc.querySelector('rootfile')?.getAttribute('full-path');
  if (!rootFilePath) throw new Error('Rootfile tidak ditemukan');

  const rootPathDir = rootFilePath.split('/').slice(0, -1).join('/');
  const opfText = await zip.file(rootFilePath)?.async('text');
  const opfDoc = parser.parseFromString(opfText!, 'application/xml');

  const manifestItems = Array.from(opfDoc.querySelectorAll('manifest > item'));
  const spineItemRefs = Array.from(opfDoc.querySelectorAll('spine > itemref'));

  const chapters: EpubChapter[] = [];
  const imageCache = new Map<string, string>(); // Cache untuk Blob URL gambar

  for (const ref of spineItemRefs) {
    const idref = ref.getAttribute('idref');
    const item = manifestItems.find(i => i.getAttribute('id') === idref);
    
    if (item) {
      const href = item.getAttribute('href');
      const fullHref = rootPathDir ? `${rootPathDir}/${href}` : href;
      const fileData = await zip.file(fullHref!)?.async('text');
      
      if (fileData) {
        const htmlDoc = parser.parseFromString(fileData, 'text/html');
        
        // --- PROSES GAMBAR & COVER ---
        // Cari semua tag <img> dan <image> (biasanya di dalam <svg> cover)
        const images = htmlDoc.querySelectorAll('img, image');
        
        for (const img of images) {
          // Dapatkan sumber asli, bisa dari 'src', 'href' (SVG image), atau 'xlink:href'
          const rawSrc = img.getAttribute('src') || img.getAttribute('href') || img.getAttribute('xlink:href');
          
          if (rawSrc && !rawSrc.startsWith('http') && !rawSrc.startsWith('data:')) {
            const decodedSrc = decodeURIComponent(rawSrc);
            const absoluteImagePath = resolvePath(fullHref!, decodedSrc);
            
            // Cek apakah gambar sudah ada di cache
            if (!imageCache.has(absoluteImagePath)) {
              const imgFile = zip.file(absoluteImagePath);
              if (imgFile) {
                // Ekstrak sebagai Blob dan ubah ke URL lokal
                const imgBlob = await imgFile.async('blob');
                const blobUrl = URL.createObjectURL(imgBlob);
                imageCache.set(absoluteImagePath, blobUrl);
              }
            }

            // Ganti attribute sumber dengan URL Blob lokal
            const cachedUrl = imageCache.get(absoluteImagePath);
            if (cachedUrl) {
              if (img.hasAttribute('src')) img.setAttribute('src', cachedUrl);
              if (img.hasAttribute('href')) img.setAttribute('href', cachedUrl);
              if (img.hasAttribute('xlink:href')) img.setAttribute('xlink:href', cachedUrl);
            }
          }
        }
        // --- END PROSES GAMBAR ---

        const bodyContent = htmlDoc.body.innerHTML;
        chapters.push({ id: idref!, html: bodyContent });
      }
    }
  }

  return chapters;
};