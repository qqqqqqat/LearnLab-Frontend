import { toast } from '@steveyuowo/vue-hot-toast'
import { $fetchWithHeader } from './fetchWithHeader'

export interface FetchBlobResult {
    blobUrl: string;
    blob: Blob;
}

export async function $fetchBlobWithHeader<T extends Blob>(
    request: Parameters<typeof $fetchWithHeader>[0],
    opts?: Parameters<typeof $fetchWithHeader>[1]
): Promise<FetchBlobResult> {
    try {
        const response = await $fetchWithHeader<T>(request, {
            ...opts,
            responseType: 'blob', 
        });
        const blob = response;
        const blobUrl = URL.createObjectURL(blob);
        return { blobUrl, blob };

    } catch (error) {
        // toast.error('Failed to fetch blob: ' + error)
        throw error; 
    }
}