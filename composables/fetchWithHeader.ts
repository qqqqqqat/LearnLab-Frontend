import { toast } from '@steveyuowo/vue-hot-toast'
import { jwtDecode } from 'jwt-decode'
import { useState } from '#app'

const isRefreshing = useState('isRefreshing', () => false)
const jwt = useCookie('access_token')
const refresh = useCookie('refresh_token')
const userState = useUserState()
const runtimeConfig = useRuntimeConfig()

export async function $fetchWithHeader<T>(
    request: Parameters<typeof $fetch<T>>[0],
    opts?: Parameters<typeof $fetch<T>>[1]
) {

    if (jwt.value && jwt.value !== 'null') {
        const decoded = jwtDecode(jwt.value)
        if (!decoded.exp) {
            return logoutAndToastError('ถอดรหัส Token ล้มเหลว กรุณาเข้าสู่ระบบใหม่')
        }
        const exp = decoded.exp * 1000
        if (exp && Date.now() > exp - 5000) {
            if (isRefreshing.value) {
                await new Promise<void>((resolve) => {
                    const stop = watch(isRefreshing, (newVal) => {
                        if (!newVal) {
                            stop()
                            resolve()
                        }
                    })
                })
                return makeRequest(request, opts, jwt.value)
            }

            try {
                isRefreshing.value = true
                const res = await $fetch<AuthPOSTAPIResponse>(
                    '/api/auth/refresh/',
                    {
                        baseURL: runtimeConfig.public.apiBaseUrl,
                        headers: {
                            Authorization: `Bearer ${refresh.value}`,
                        },
                    }
                )

                jwt.value = res.access_token
                refresh.value = res.refresh_token
                isRefreshing.value = false
                if (jwt.value) {
                    return makeRequest(request, opts, jwt.value)
                } else {
                    return logoutAndToastError('Token หมดอายุ กรุณาเข้าสู่ระบบใหม่')

                }
            } catch (error) {
                logoutAndToastError('Token หมดอายุ กรุณาเข้าสู่ระบบใหม่')
                throw error
            }
        }
        if (jwt.value) return makeRequest(request, opts, jwt.value)
        return null
    }
    return makeRequest(request, opts, null)
}

function logoutAndToastError(text: string): null {
    const jwt = useCookie('access_token')
    const refresh = useCookie('refresh_token')
    const userState = useUserState()
    jwt.value = null
    refresh.value = null
    userState.value = null
    isRefreshing.value = false
    navigateTo('/', { replace: true })
    toast.error(text)
    return null
}

function makeRequest<T>(
    request: Parameters<typeof $fetch<T>>[0],
    opts: Parameters<typeof $fetch<T>>[1] | undefined,
    token: string | null
) {
    const headers = token
        ? { Authorization: `Bearer ${token}`, ...opts?.headers }
        : { ...opts?.headers }

    return $fetch<T>(request, {
        baseURL: runtimeConfig.public.apiBaseUrl,
        ...opts,
        headers,
    })
}
