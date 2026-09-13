const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';

export const initGoogleAuth = (onSuccess: (token: string) => void) => {
  const client = window.google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: (response: any) => {
      if (response.access_token) {
        onSuccess(response.access_token);
      }
    },
  });
  client.requestAccessToken();
};

export const fetchDriveFiles = async (token: string) => {
  // Hanya ambil EPUB dan PDF
  const query = "mimeType='application/epub+zip' or mimeType='application/pdf'";
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType)`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.json();
};

export const downloadDriveFile = async (token: string, fileId: string): Promise<Blob> => {
  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.blob();
};