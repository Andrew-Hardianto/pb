import { postUrlApi } from './http.service';

/**
 * Uploads a picture to the server using the provided category.
 * @param category - The category of the image (e.g., 'KTP', 'NPWP', 'TOKO')
 * @param fileUri - The local URI of the file
 * @param fileName - The name of the file
 * @returns Response from the API
 */
export const uploadPicture = async (category: string, fileUri: string, fileName: string) => {
    const urlApi = '/api/v1/utils/upload-file';
    
    const dataPost = new FormData();
    const fileType = fileName.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';

    dataPost.append("file", {
        uri: fileUri,
        name: fileName,
        type: fileType,
    } as any);
    dataPost.append("category", category);

    // We pass Content-Type: multipart/form-data. 
    // The http.service.ts will automatically handle deleting it for correct boundary assignment.
    return await postUrlApi(urlApi, dataPost);
};
