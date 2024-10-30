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
): Promise<T> {

    const makeRequestWithToken = (token: string | null) => makeRequest<T>(request, opts, token);

    if (jwt.value && jwt.value !== 'null') {
        const decoded = jwtDecode<JwtPayload>(jwt.value);
        if (!decoded.exp) {
            logoutAndToastError('ถอดรหัส Token ล้มเหลว กรุณาเข้าสู่ระบบใหม่');
        }
        const exp = decoded.exp * 1000;
        if (exp && Date.now() > exp - 5000) {
            if (isRefreshing.value) {
                await waitForRefresh();
                return makeRequestWithToken(jwt.value);
            }

            try {
                isRefreshing.value = true;
                const res = await $fetch<AuthPOSTAPIResponse>('/api/auth/refresh/', {
                    baseURL: runtimeConfig.public.apiBaseUrl,
                    headers: {
                        Authorization: `Bearer ${refresh.value}`,
                    },
                });

                jwt.value = res.access_token;
                refresh.value = res.refresh_token;
                isRefreshing.value = false;

                return makeRequestWithToken(jwt.value);

            } catch (error) {
                logoutAndToastError('Token หมดอายุ กรุณาเข้าสู่ระบบใหม่');
            }
        }
        return makeRequestWithToken(jwt.value);
    }
    return makeRequestWithToken(null);
}



function logoutAndToastError(text: string): never {
    jwt.value = null;
    refresh.value = null;
    userState.value = null;
    isRefreshing.value = false;
    navigateTo('/', { replace: true });
    toast.error(text);
    throw new Error(text);
}


const waitForRefresh = async () => {
    await new Promise<void>((resolve) => {
        const stop = watch(isRefreshing, (newVal) => {
            if (!newVal) {
                stop();
                resolve();
            }
        });
    });
}

function makeRequest<T>(
    request: Parameters<typeof $fetch<T>>[0],
    opts: Parameters<typeof $fetch<T>>[1] | undefined,
    token: string | null
): Promise<T> {
    const headers = token
        ? { Authorization: `Bearer ${token}`, ...opts?.headers }
        : { ...opts?.headers };

    return $fetch<T>(request, {
        baseURL: runtimeConfig.public.apiBaseUrl,
        ...opts,
        headers,
    });
}


interface JwtPayload {
    exp: number;
    aud: number;
    iat: number;
    nbf: number;
    u_id: number;
    u_role: "STUDENT" | "INSTRUCTOR";
}

interface AuthPOSTAPIResponse {
    status: number;
    message: string;
    access_token: string;
    refresh_token: string;
}