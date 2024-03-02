<script setup lang="ts">
import { toast } from "@steveyuowo/vue-hot-toast";

    const route = useRoute()
    const userState = useUserState()
    const avatarState = useAvatarState()
    const userMenu = ref(false)
    async function fetchUser() {
        await $fetch<User>('/api/auth/')
            .then(async (res) => {
                userState.value = res
                await $fetch<Avatar>('/api/auth/?image=').then(res => {
                    avatarState.value = res
                }).catch(err => {
                    toast.error('โหลดรูปล้มเหลว')
                })
            })
            .catch((err) => {
            })
    }
    async function signOut() {
      userMenu.value = false
      const signoutToast = toast.loading('กำลังออกจากระบบ')
      await $fetch<User>('/api/session/', {method: 'DELETE'})
            .then(async (res) => {
                userState.value = null
                toast.update(signoutToast, {type: 'success', message: 'ออกจากระบบสำเร็จ'})
                await navigateTo('/', {replace: true})
            })
            .catch((err) => {
              toast.update(signoutToast, {type: 'error', message: 'ออกจากระบบล้มเหลว'})
            })
    }

    fetchUser()
</script>
<template>
    <header class="flex fixed top-0 flex-wrap transition-all duration-150 ease-in-out sm:justify-start sm:flex-nowrap z-50 w-full bg-white text-sm py-4 border border-1 select-none">
        <nav class="max-w-screen-2xl w-full mx-auto px-4 sm:flex sm:items-center sm:justify-between" aria-label="Global">
            <div class="flex items-center justify-between">
                <NuxtLink class="flex-none text-xl text-blue-600 font-bold" to="/">LearnLab</NuxtLink>
                <div class="sm:hidden">
                    <button
                        type="button"
                        class="hs-collapse-toggle p-2 inline-flex justify-center items-center gap-x-2 rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
                        data-hs-collapse="#navbar-collapse-with-animation"
                        aria-controls="navbar-collapse-with-animation"
                        aria-label="Toggle navigation">
                        <svg
                            class="hs-collapse-open:hidden flex-shrink-0 size-4"
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
                            class="hs-collapse-open:block hidden flex-shrink-0 size-4"
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
            <div id="navbar-collapse-with-animation" class="hs-collapse hidden overflow-hidden transition-all duration-300 basis-full grow sm:block">
                <div class="flex flex-col gap-5 mt-5 sm:flex-row sm:items-center sm:justify-end sm:mt-0 sm:ps-5">
                    <NuxtLink
                        to="/"
                        class="transition-color duration-200 ease-in-out font-medium"
                        :class="route.path === '/' ? 'text-blue-600 hover:text-blue-400' : 'hover:text-gray-400'"
                        aria-current="page">
                        หน้าหลัก
                    </NuxtLink>
                    <NuxtLink
                        class="transition-color duration-200 ease-in-out font-medium"
                        :class="route.path === '/courses' ? 'text-blue-600 hover:text-blue-400' : 'hover:text-gray-400'"
                        to="/courses"
                        aria-label="Read more our courses offering">
                        หลักสูตร
                        <span v-if="!userState" class="inline-flex items-center gap-x-1.5 py-1 px-2 rounded-full text-xs font-medium bg-blue-100 text-blue-800">ใหม่</span>
                    </NuxtLink>
                    <NuxtLink
                        v-if="userState"
                        class="transition-color duration-200 ease-in-out font-medium"
                        :class="route.path === '/mycourse' ? 'text-blue-600 hover:text-blue-400' : 'hover:text-gray-400'"
                        to="/mycourse"
                        aria-label="Read more our courses offering">
                        คอร์สเรียนของฉัน
                    </NuxtLink>
                    <NuxtLink
                    v-if="userState"
                        class="transition-color duration-200 ease-in-out font-medium"
                        :class="route.path === '/message' ? 'text-blue-600 hover:text-blue-400' : 'hover:text-gray-400'"
                        to="/message"
                        aria-label="Read more our courses offering">
                        กล่องข้อความ
                    </NuxtLink>
                    <TransitionGroup name="fade">
                        <button
                            v-show="!userState"
                            key="stateNone"
                            type="button"
                            data-hs-overlay="#hs-slide-down-animation-modal"
                            class="py-2 px-3 md:inline-flex items-center gap-x-2 font-bold rounded-lg transition-colors duration-200 ease-in-out border border-gray-200 hover:border-blue-600 hover:text-blue-600 disabled:opacity-50 disabled:pointer-events-none">
                            <div class="flex justify-center items-center gap-2">
                                <span class="material-icons-outlined" style="font-size: 18px;">login</span>
                                เข้าสู่ระบบ
                            </div>
                        </button>
                        <div key="stateLoggedIn" v-if="userState" @click="userMenu = !userMenu" class="md:px-3 flex flex-row cursor-pointer items-center gap-x-2 font-bold rounded-lg transition-colors duration-200 ease-in-out">
                            <div class="rounded-md w-8 h-8 bg-slate-200 flex flex-col justify-center items-center text-lg" v-if="!avatarState?.u_avatar">{{ `${userState?.u_firstname.slice(0, 1)}${userState?.u_lastname.slice(0, 1)}` }}</div>
                            <div class="rounded-md w-8 h-8" v-else><img :src="`data:${avatarState.u_avatar_mime_type};base64,${avatarState.u_avatar}`" /></div>
                            <div class="flex items-center">
                                <span>{{ userState?.u_firstname }} {{ userState?.u_lastname }}</span>
                                <span class="material-icons-outlined">arrow_drop_down</span>
                            </div>
                        </div>
                        <Transition key="stateLoggedInName" name="fade">
                            <div v-show="userMenu" class="absolute md:top-16 top-48 flex flex-col border border-1 w-48 rounded-b-lg shadow-md">
                                <div class="flex flex-col rounded-b-lg">
                                    <div class="flex items-center p-4 gap-x-2 cursor-pointer hover:bg-gray-200 bg-white">
                                        <span class="material-icons-outlined">settings</span>
                                        ตั้งค่าผู้ใช้
                                    </div>
                                    <div @click="signOut" class="flex items-center p-4 gap-x-2 cursor-pointer hover:bg-gray-200 bg-white text-red-600 rounded-b-lg">
                                        <span class="material-icons-outlined">logout</span>
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
