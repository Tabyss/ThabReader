import { useState, useEffect } from 'react';

export type Theme = 'oled' | 'sepia' | 'night' | 'light';

export const useReaderState = (bookId: string) => {
  // Simpan posisi string CFI (bukan angka chapter lagi)
  const [currentLocation, setCurrentLocation] = useState<string | null>(() => 
    localStorage.getItem(`${bookId}-cfi`) || null
  );
  
  const [theme, setTheme] = useState<Theme>(() => 
    (localStorage.getItem('ThabReader-theme') as Theme) || 'oled'
  );
  
  const [fontSize, setFontSize] = useState(() => 
    Number(localStorage.getItem('ThabReader-fontSize')) || 18
  );

  // Auto-save setting
  useEffect(() => {
    localStorage.setItem('ThabReader-theme', theme);
    localStorage.setItem('ThabReader-fontSize', fontSize.toString());
  }, [theme, fontSize]);

  // Fungsi simpan CFI dipanggil dari event listener epub.js
  const saveLocation = (cfi: string) => {
    setCurrentLocation(cfi);
    localStorage.setItem(`${bookId}-cfi`, cfi);
  };

  return { currentLocation, saveLocation, theme, setTheme, fontSize, setFontSize };
};