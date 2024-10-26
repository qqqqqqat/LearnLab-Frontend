<script setup lang="ts">
    import { toast } from '@steveyuowo/vue-hot-toast'

    const route = useRoute()
    const userState = useUserState()
    const avatarState = useAvatarState()
    const userMenu = ref(false)
    const stripTrailingSlash = (str: string) => {
        return str.endsWith('/') ? str.slice(0, -1) : str
    }

    async function fetchUser() {
        if (userState.value && avatarState.value) return // Do not fetch if state is already set
        await $fetch<User>('/api/auth/')
            .then(async (res) => {
                userState.value = res
                await $fetch<Avatar>('/api/auth/?image=')
                    .then((res) => {
                        avatarState.value = res
                    })
                    .catch((_err) => {
                        toast.error('โหลดรูปล้มเหลว')
                    })
            })
            .catch(async (_err) => {
                if (
                    stripTrailingSlash(route.path) !== '/' &&
                    stripTrailingSlash(route.path) !== '/courses'
                )
                    await navigateTo('/', { replace: true })
            })
    }

    async function signOut() {
        userMenu.value = false
        const signoutToast = toast.loading('กำลังออกจากระบบ')
        await $fetch<User>('/api/session/', { method: 'DELETE' })
            .then(async (res) => {
                userState.value = null
                toast.update(signoutToast, {
                    type: 'success',
                    message: 'ออกจากระบบสำเร็จ',
                })
                await navigateTo('/', { replace: true })
            })
            .catch((err) => {
                toast.update(signoutToast, {
                    type: 'error',
                    message: 'ออกจากระบบล้มเหลว',
                })
            })
    }

    fetchUser()
</script>
<template>
    <header
        class="border-1 fixed top-0 z-50 flex w-full select-none flex-wrap border bg-white py-4 text-sm transition-all duration-150 ease-in-out sm:flex-nowrap sm:justify-start">
        <nav
            class="mx-auto w-full max-w-screen-2xl px-4 sm:flex sm:items-center sm:justify-between"
            aria-label="Global">
            <div class="flex items-center justify-between">
                <NuxtLink
                    class="flex-none font-title text-xl font-bold text-blue-600"
                    to="/">
                    LearnLab
                </NuxtLink>
                <div class="sm:hidden">
                    <button
                        type="button"
                        class="hs-collapse-toggle inline-flex items-center justify-center gap-x-2 rounded-lg border border-gray-200 bg-white p-2 text-gray-800 shadow-sm hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50"
                        data-hs-collapse="#navbar-collapse-with-animation"
                        aria-controls="navbar-collapse-with-animation"
                        aria-label="Toggle navigation">
                        <svg
                            class="size-4 flex-shrink-0 hs-collapse-open:hidden"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round">
                            <line x1="3" x2="21" y1="6" y2="6" />
                            <line x1="3" x2="21" y1="12" y2="12" />
                            <line x1="3" x2="21" y1="18" y2="18" />
                        </svg>
                        <svg
                            class="hidden size-4 flex-shrink-0 hs-collapse-open:block"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round">
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                        </svg>
                    </button>
                </div>
            </div>
            <div
                id="navbar-collapse-with-animation"
                class="hs-collapse hidden grow basis-full overflow-hidden transition-all duration-300 sm:block">
                <div
                    class="mt-5 flex flex-col gap-5 sm:mt-0 sm:flex-row sm:items-center sm:justify-end sm:ps-5">
                    <NuxtLink
                        to="/"
                        class="transition-color font-medium duration-200 ease-in-out"
                        :class="
                            route.path === '/'
                                ? 'text-blue-600 hover:text-blue-400'
                                : 'hover:text-gray-400'
                        "
                        aria-current="page">
                        หน้าหลัก
                    </NuxtLink>
                    <NuxtLink
                        v-if="userState?.u_role !== 'INSTRUCTOR'"
                        class="transition-color font-medium duration-200 ease-in-out"
                        :class="
                            route.path === '/courses'
                                ? 'text-blue-600 hover:text-blue-400'
                                : 'hover:text-gray-400'
                        "
                        to="/courses"
                        aria-label="Read more our courses offering">
                        หลักสูตร
                        <span
                            v-if="!userState"
                            class="inline-flex items-center gap-x-1.5 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                            ใหม่
                        </span>
                    </NuxtLink>
                    <NuxtLink
                        v-if="userState"
                        class="transition-color font-medium duration-200 ease-in-out"
                        :class="
                            route.path === '/mycourse'
                                ? 'text-blue-600 hover:text-blue-400'
                                : 'hover:text-gray-400'
                        "
                        to="/mycourse"
                        aria-label="Read more our courses offering">
                        คอร์สเรียนของฉัน
                    </NuxtLink>
                    <TransitionGroup name="fade">
                        <button
                            v-show="!userState"
                            key="stateNone"
                            type="button"
                            data-hs-overlay="#hs-slide-down-animation-modal"
                            class="items-center gap-x-2 rounded-lg border border-gray-200 px-3 py-2 font-bold transition-colors duration-200 ease-in-out hover:border-blue-600 hover:text-blue-600 disabled:pointer-events-none disabled:opacity-50 md:inline-flex">
                            <div
                                class="w-22 flex items-center justify-center gap-2 overflow-hidden">
                                <span
                                    class="material-icons-outlined"
                                    style="font-size: 18px">
                                    login
                                </span>
                                เข้าสู่ระบบ
                            </div>
                        </button>
                        <div
                            v-if="userState"
                            key="stateLoggedIn"
                            class="flex cursor-pointer flex-row items-center gap-x-2 rounded-lg font-bold transition-colors duration-200 ease-in-out md:px-3"
                            @click="userMenu = !userMenu">
                            <div
                                v-if="!avatarState?.u_avatar"
                                class="flex h-8 w-8 select-none flex-col items-center justify-center rounded-md bg-slate-200 text-lg">
                                {{
                                    `${userState?.u_firstname?.slice(0, 1)}${userState?.u_lastname?.slice(0, 1)}`
                                }}
                            </div>
                            <div v-else class="h-8 w-8 rounded-md">
                                <img
                                    class="aspect-square h-8 w-8 rounded-md object-cover"
                                    :src="`data:${avatarState?.u_avatar_mime_type};base64,${avatarState?.u_avatar}`" >
                            </div>
                            <div class="flex items-center">
                                <span>
                                    {{ userState?.u_firstname }}
                                    {{ userState?.u_lastname }}
                                </span>
                                <span class="material-icons-outlined">
                                    arrow_drop_down
                                </span>
                            </div>
                        </div>
                        <Transition key="stateLoggedInName" name="fade">
                            <div
                                v-show="userMenu"
                                class="border-1 absolute -bottom-[115px] flex w-48 flex-col rounded-b-lg border shadow-md md:top-16">
                                <div class="flex flex-col rounded-b-lg">
                                    <NuxtLink
                                        to="/settings"
                                        :class="
                                            route.path === '/settings'
                                                ? 'bg-blue-600 text-white hover:bg-blue-400'
                                                : 'bg-white hover:text-gray-400'
                                        "
                                        class="flex cursor-pointer items-center gap-x-2 p-4 hover:bg-gray-200"
                                        @click="
                                            () => {
                                                userMenu = false
                                            }
                                        ">
                                        <span class="material-icons-outlined">
                                            settings
                                        </span>
                                        ตั้งค่าผู้ใช้
                                    </NuxtLink>
                                    <div
                                        class="flex cursor-pointer items-center gap-x-2 rounded-b-lg bg-white p-4 text-red-600 hover:bg-gray-200"
                                        @click="signOut">
                                        <span class="material-icons-outlined">
                                            logout
                                        </span>
                                        ออกจากระบบ
                                    </div>
                                </div>
                            </div>
                        </Transition>
                    </TransitionGroup>
                </div>
            </div>
        </nav>
    </header>
</template>
<style scoped>
    .fade-enter-active,
    .fade-leave-active {
        transition: opacity 0.25s ease;
    }

    .fade-enter-from,
    .fade-leave-to {
        opacity: 0;
    }
</style>
