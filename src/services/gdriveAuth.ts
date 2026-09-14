const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCOPES = "https://www.googleapis.com/auth/drive.readonly";

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

export const fetchDriveFiles = async (
    token: string,
    folderName: string = "Books",
) => {
    const folderQuery = `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`;
    const folderResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(folderQuery)}&fields=files(id,name)`,
        { headers: { Authorization: `Bearer ${token}` } },
    );
    const folderData = await folderResponse.json();

    if (!folderData.files || folderData.files.length === 0) {
        console.warn(`Folder "${folderName}" tidak ditemukan di Google Drive.`);
        return { files: [] };
    }

    const folderId = folderData.files[0].id;

    const fileQuery = `'${folderId}' in parents and (mimeType='application/epub+zip' or mimeType='application/pdf') and trashed=false`;
    const fileResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(fileQuery)}&fields=files(id,name,mimeType)`,
        { headers: { Authorization: `Bearer ${token}` } },
    );

    return fileResponse.json();
};

export const downloadDriveFile = async (
    token: string,
    fileId: string,
): Promise<Blob> => {
    const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        {
            headers: { Authorization: `Bearer ${token}` },
        },
    );
    return response.blob();
};
