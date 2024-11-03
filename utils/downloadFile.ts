import { toast } from "@steveyuowo/vue-hot-toast"

const runtimeConfig = useRuntimeConfig()

export async function downloadFile(f_id: number) {
    const loadingToast = toast.loading('Downloading file...')
    try {
        const response = await $fetchWithHeader<{
            status: number
            message: string
        }>(`${runtimeConfig.public.apiBaseUrl}/api/file/?f_id=${f_id}`, {
            params: {
                f_id: f_id,
                'get-presigned': true,
            },
        })

        if (!response.message) {
            throw new Error('Download link not found')
        }

        const link = document.createElement('a')
        link.href = response.message
        link.rel = 'noopener noreferrer'
        link.target = '_blank'
        link.download = ''

        try {
            link.click()
            toast.update(loadingToast, {
                type: 'success',
                message: 'File download started',
            })
        } catch (clickError) {
            toast.update(loadingToast, {
                type: 'error',
                message: 'Failed to start download',
            })
        }
    } catch (err: any) {
        toast.update(loadingToast, {
            type: 'error',
            message:
                err?.message || err?.data?.message || 'Error downloading file',
        })
    }
}
