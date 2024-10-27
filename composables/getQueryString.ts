import type { LocationQueryValue } from 'vue-router'
import { toast } from '@steveyuowo/vue-hot-toast'

export function useQueryStringAsNumber(
    queryString: LocationQueryValue | LocationQueryValue[]
): number {
    const id = queryString
    if (id === null || id === undefined) {
        toast.error('Invalid ID')
        navigateTo('/mycourse', { replace: true })
        return -1
    }

    if (Array.isArray(id)) {
        if (id.length === 0) {
            toast.error('Invalid ID')
            navigateTo('/mycourse', { replace: true })
            return -1
        }
        return Number(id[0])
    }

    const numId = Number(id)
    if (!isNaN(numId)) return numId

    toast.error('Invalid ID')
    navigateTo('/mycourse', { replace: true })
    return -1
}
