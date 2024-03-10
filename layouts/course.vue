<script setup lang="ts">
    import { toast } from '@steveyuowo/vue-hot-toast'

    const route = useRoute()
    const userRole = useUserCourseState()
    let crs_info = ref()
    let crs_pending = ref(true)
    
    let sessionInfo = ref()
    watch(
        () => route.query.id,
        async (id) => {
            fetchCourse(id)
        }
    )

    async function fetchSessionID() {
        await $fetch('/api/session/', {
            credentials: 'include',
        }).then((res) => {
            sessionInfo.value = res
        })
    }

    async function destroySession() {
        await $fetch('/api/session/', {
            method: 'DELETE',
            credentials: 'include',
        }).then((res) => {
            sessionInfo.value = res
        })
    }

    async function fetchCourse(id: number) {
        await $fetch<CoursePageAPIPUTResponse>('/api/courses/', {
            method: 'PUT',
            body: { c_id: id },
        })
            .then((res) => {
                crs_info.value = res
                crs_pending.value = false
            })
            .catch((err) => {
                toast.error(err?.data?.message)
                navigateTo('/mycourse', { replace: true })
            })
    }

    async function fetchUserRoleState() {
        await $fetch<UserRoles>('/api/courses/me/?my_course_role', {})
            .then((res) => {
                userRole.value = res
            })
            .catch((err) => {})
    }

    if (route.query.id) {
        fetchCourse(route.query.id)
    }
    fetchUserRoleState()
</script>
<template>
    <NavigationBar />
    <AccountModal />
    <div class="mx-auto mt-20 max-w-screen-2xl">
        <div class="flex flex-col gap-4 pb-16 px-4">
            <div class="flex gap-x-4 relative">
                <button
                    @click="navigateTo('/mycourse')"
                    class="transition-all duration-200 ease-in-out py-2 px-3 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-blue-600 hover:bg-blue-100 hover:text-blue-800 disabled:opacity-50 disabled:pointer-events-none">
                    <span class="material-icons-outlined">home</span>
                    กลับหน้าคอร์ส
                </button>
                <div class="flex items-center">
                    Courses
                    <span class="material-icons-outlined">chevron_right</span>
                    View
                    <span class="material-icons-outlined">chevron_right</span>
                    {{ route.query.id }}
                </div>
            </div>
            <div class="flex relative">
                <img
                    class="w-full h-full min-h-56 max-h-96 object-cover object-[0%_50%] rounded-xl"
                    loading="lazy"
                    :src="crs_info?.c_banner ? `/api/courses/banner/?c_id=${crs_info?.c_id}` : '/images/CourseBannerDefault.svg'"
                    alt="Image Description" />
                <div class="absolute w-full h-full rounded-xl bg-gradient-to-b from-slate-50/0 sm:from-70% from-50% to-zinc-900"></div>
                <div v-if="userRole?.[route.query.id] === 'INSTRUCTOR'" class="absolute right-0">
                    <div class="flex flex-row pt-2 pr-2">
                        <button
                        @click="navigateTo(`/courses/edit?id=${route.query.id}`)"
                            type="button"
                            class="transition-color duration-200 ease-in-out py-2 px-3 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-gray-200 text-gray-500 hover:border-blue-600 hover:text-blue-600 disabled:opacity-50 disabled:pointer-events-none">
                            <span class="material-icons-outlined">edit</span>แก้ไข
                        </button>
                    </div>
                </div>
                <div v-if="!crs_pending" class="absolute flex flex-col gap-2 left-5 bottom-5">
                    <span class="text-4xl font-bold text-white line-clamp-1">{{ crs_info?.c_name }}</span>
                    <span class="bottom-0 text-sm font-light text-white h-auto max-h-10 overflow-auto">
                        {{ crs_info?.c_description }}
                    </span>
                </div>
                <div v-else class="absolute w-full flex flex-col gap-2 left-5 bottom-5 animate-pulse">
                    <span class="text-4xl font-bold text-white">
                        <h3 class="h-8 bg-white rounded-full w-[200px]"></h3>
                    </span>
                    <span class="bottom-0 text-sm font-light text-white max-h-10 w-full h-3 bg-white rounded-full" style="width: 90%"></span>
                </div>
            </div>
            <div class="flex md:flex-row flex-col gap-4">
                <nav class="flex flex-col border border-1 rounded-lg shadow-sm md:w-64 w-full h-fit">
                    <div
                        @click="
                            navigateTo({
                                path: '/courses/view',
                                query: { id: route.query.id },
                            })
                        "
                        :class="route.path === '/courses/view' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'hover:bg-blue-300/50 text-black'"
                        class="nav-menu">
                        <span class="material-icons-outlined">home</span>
                        หน้าหลัก
                    </div>
                    <div
                        @click="
                            navigateTo({
                                path: '/courses/material',
                                query: { id: route.query.id },
                            })
                        "
                        :class="route.path === '/courses/material' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'hover:bg-blue-300/50 text-black'"
                        class="nav-menu">
                        <span class="material-icons-outlined">menu_book</span>
                        เนื้อหาการสอน
                    </div>
                    <div
                        @click="
                            navigateTo({
                                path: '/courses/assignment',
                                query: { id: route.query.id },
                            })
                        "
                        :class="route.path === '/courses/assignment' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'hover:bg-blue-300/50 text-black'"
                        class="nav-menu">
                        <span class="material-icons-outlined">edit_note</span>
                        งานมอบหมาย
                    </div>
                </nav>
                <main class="flex flex-col gap-y-4 w-full">
                    <slot />
                </main>
            </div>
        </div>
    </div>
    <Footer />
</template>

<style scoped>
    .nav-menu {
        @apply flex transition-colors duration-200 ease-in-out items-center gap-4 h-12 p-4 rounded-lg cursor-pointer;
    }

    ::-webkit-scrollbar {
        width: 20px;
    }

    ::-webkit-scrollbar-track {
        background-color: transparent;
    }

    ::-webkit-scrollbar-thumb {
        background-color: #d6dee1;
        border-radius: 20px;
        border: 6px solid transparent;
        background-clip: content-box;
    }

    ::-webkit-scrollbar-thumb:hover {
        background-color: #a8bbbf;
    }
</style>
