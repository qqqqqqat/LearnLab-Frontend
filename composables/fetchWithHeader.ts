import { toast } from '@steveyuowo/vue-hot-toast'
import { jwtDecode } from 'jwt-decode'

export function $fetchWithHeader<T>(
    request: Parameters<typeof $fetch<T>>[0],
    opts?: Parameters<typeof $fetch<T>>[1]
) {
    const jwt = useCookie('access_token')
    const userState = useUserState()
    const runtimeConfig = useRuntimeConfig()

    if (jwt.value) {
        const decoded = jwtDecode(jwt.value)
        if (decoded.exp && Date.now() > decoded.exp * 1000 - 5000) {
            const refresh = useCookie('refresh_token')
            $fetch<AuthPOSTAPIResponse>('/api/auth/refresh/', {
                baseURL: runtimeConfig.public.apiBaseUrl,
                headers: {
                    Authorization: `Bearer ${refresh.value}`,
                },
            })
                .then((res) => {
                    jwt.value = res.access_token
                    refresh.value = res.refresh_token
                })
                .catch(() => {
                    jwt.value = null
                    refresh.value = null
                    userState.value = null
                    navigateTo('/', { replace: true })
                    toast.error('Token หมดอายุ กรุณาเข้าสู่ระบบใหม่')
                })
        }
    }
    const headers = jwt.value
        ? { Authorization: `Bearer ${jwt.value}`, ...opts?.headers }
        : { ...opts?.headers }

    return $fetch<T>(request, {
        baseURL: runtimeConfig.public.apiBaseUrl,
        ...opts,
        headers,
    })
}
