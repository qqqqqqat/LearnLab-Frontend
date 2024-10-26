<script setup lang="ts">
    const userState = useUserState()

    const search = ref<string>('')
    const currentPage = ref<number>(0)
    const totalPages = ref<number>(0)
    const isLocked = ref({ title: 'ทั้งหมด', value: 'false' })
    const courses = ref<CourseListing | null>()
    const pending = ref()

    const createCourseModal = ref()

    const once = ref(true)

    watch(courses, () => {
        if (once.value) {
            currentPage.value = courses.value?.page || 1
            totalPages.value = courses.value?.total_page || 1
            once.value = false
        }
    })

    async function updateQuery(searchQuery: string) {
        pending.value = true
        await $fetch<CourseListing>('/api/courses/me/', {
            query: {
                search: searchQuery,
                page: currentPage.value,
                limit: 9,
                locked: isLocked.value.value,
            },
        })
            .then((res) => {
                pending.value = false
                courses.value = res
                totalPages.value = res.total_page
            })
            .catch(async (err) => {
                await navigateTo('/courses', { replace: true })
            })
    }

    if (!userState) {
        navigateTo('/courses', { replace: true })
    }

    if (!pending.value) {
        updateQuery(search.value)
    }

    watch(currentPage, () => {
        if (currentPage.value > totalPages.value) {
            currentPage.value = totalPages.value
        } else if (currentPage.value < 1) {
            currentPage.value = 1
        }
        if (!pending.value) {
            updateQuery(search.value)
        }
    })

    watch(isLocked, () => {
        currentPage.value = 1
        if (!pending.value) {
            updateQuery(search.value)
        }
    })

    async function goToCourse(c_id: number, is_locked: boolean) {
        await navigateTo({
            path: '/courses/view',
            query: {
                id: c_id,
            },
        })
    }
</script>
<template>
    <CourseCreateModal
        ref="createCourseModal"
        @refresh-course="updateQuery(search)" />
    <div class="mx-auto mb-8 max-w-screen-2xl">
        <div class="flex h-full w-full flex-col items-center">
            <h1 class="mb-4 mt-24 font-title text-5xl font-bold">
                คอร์สเรียนของฉัน
            </h1>
            <div class="flex flex-col gap-4 xl:flex-row">
                <div
                    class="border-1 flex h-fit flex-col items-center justify-center rounded-lg border p-8 shadow-sm">
                    <div class="flex flex-col">
                        <div
                            class="flex flex-col gap-2 gap-x-8 rounded-lg md:flex-row xl:flex-col">
                            <div class="flex flex-col">
                                <h4 class="w-full text-left text-lg">
                                    กรองข้อมูล
                                </h4>
                                <label
                                    for="hs-trailing-button-add-on-with-icon"
                                    class="sr-only">
                                    Label
                                </label>
                                <div class="flex">
                                    <input
                                        id="hs-trailing-button-add-on-with-icon"
                                        v-model="search"
                                        type="text"
                                        name="hs-trailing-button-add-on-with-icon"
                                        class="border-1 block w-full rounded-s-lg border border-gray-200 px-4 py-3 text-sm shadow-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50" >
                                    <button
                                        type="button"
                                        class="inline-flex h-[2.875rem] w-[2.875rem] flex-shrink-0 items-center justify-center gap-x-2 rounded-e-md border border-transparent bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50"
                                        @click="
                                            () => {
                                                currentPage = 1
                                                updateQuery(search)
                                            }
                                        ">
                                        <svg
                                            class="size-4 flex-shrink-0"
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            stroke-width="2"
                                            stroke-linecap="round"
                                            stroke-linejoin="round">
                                            <circle cx="11" cy="11" r="8" />
                                            <path d="m21 21-4.3-4.3" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <div
                                class="flex flex-col gap-4 md:flex-row xl:flex-col">
                                <div class="flex flex-col">
                                    <span class="w-full text-left text-lg">
                                        การแสดงผล
                                    </span>
                                    <div
                                        class="hs-dropdown relative inline-flex w-full max-w-64 [--placement:bottom-right]">
                                        <button
                                            id="hs-dropdown-mycourse"
                                            type="button"
                                            class="hs-dropdown-toggle inline-flex w-full items-center justify-between gap-x-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50">
                                            {{ isLocked.title }}
                                            <svg
                                                class="size-4 transition duration-150 ease-in-out hs-dropdown-open:rotate-180"
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                stroke-width="2"
                                                stroke-linecap="round"
                                                stroke-linejoin="round">
                                                <path d="m6 9 6 6 6-6" />
                                            </svg>
                                        </button>
                                        <div
                                            class="hs-dropdown-menu duration z-10 hidden w-72 rounded-lg bg-white p-2 opacity-0 shadow-md transition-[opacity,margin] hs-dropdown-open:opacity-100"
                                            aria-labelledby="hs-dropdown-mycourse">
                                            <a
                                                class="flex cursor-pointer items-center gap-x-3.5 rounded-lg px-3 py-2 text-sm text-gray-800 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                                                @click="
                                                    isLocked = {
                                                        title: 'ทั้งหมด',
                                                        value: 'false',
                                                    }
                                                ">
                                                ทั้งหมด
                                            </a>
                                            <a
                                                class="flex cursor-pointer items-center gap-x-3.5 rounded-lg px-3 py-2 text-sm text-gray-800 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                                                @click="
                                                    isLocked = {
                                                        title: 'ไม่มีรหัส',
                                                        value: 'free',
                                                    }
                                                ">
                                                ไม่มีรหัส
                                            </a>
                                            <a
                                                class="flex cursor-pointer items-center gap-x-3.5 rounded-lg px-3 py-2 text-sm text-gray-800 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                                                @click="
                                                    isLocked = {
                                                        title: 'มีรหัส',
                                                        value: 'true',
                                                    }
                                                ">
                                                มีรหัส
                                            </a>
                                        </div>
                                    </div>
                                </div>
                                <div class="flex items-end">
                                    <button
                                        v-if="
                                            userState?.u_role === 'INSTRUCTOR'
                                        "
                                        class="mt-2 inline-flex items-center justify-center gap-x-2 rounded-lg border border-transparent bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition-colors duration-150 ease-in-out hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50"
                                        href="#"
                                        @click="
                                            createCourseModal.c_openModal()
                                        ">
                                        สร้างคอร์ส
                                    </button>
                                </div>
                                <div/>
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    class="grid-flow-cols-1 relative grid justify-center gap-8 rounded-lg md:grid-cols-2 lg:grid-cols-3 xl:min-w-[1024px]"
                    :class="!courses?.data.length ? 'border-1 border' : ''">
                    <TransitionGroup name="fade">
                        <div
                            v-for="crs in 9"
                            v-if="pending"
                            :key="`crs${crs}`"
                            class="flex items-center justify-center rounded-xl">
                            <div
                                class="flex w-80 flex-col rounded-xl border bg-white shadow-sm">
                                <div
                                    class="aspect-[17/9] max-h-96 w-full max-w-96 animate-pulse rounded-t-xl bg-gray-200 object-cover"/>
                                <div class="p-4 md:p-5">
                                    <h3 class="text-lg font-bold text-gray-800">
                                        <span
                                            class="block size-6 w-full rounded-full bg-gray-200"/>
                                    </h3>
                                    <p class="mt-2 text-gray-500">
                                        <span
                                            class="mb-2 block size-3 w-full rounded-full bg-gray-200"/>
                                        <span
                                            class="mb-2 block size-3 w-full rounded-full bg-gray-200"/>
                                    </p>
                                    <div
                                        class="flex flex-row items-end justify-between">
                                        <button
                                            class="mt-2 inline-flex items-center justify-center gap-x-2 rounded-lg border border-transparent bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition-colors duration-150 ease-in-out hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50"
                                            href="#"
                                            disabled>
                                            ดูคอร์ส
                                        </button>
                                        <div/>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div
                            v-for="crs in courses?.data"
                            v-else
                            class="flex items-center justify-center rounded-xl">
                            <div
                                class="flex w-80 flex-col rounded-xl border bg-white shadow-sm">
                                <img
                                    class="aspect-[17/9] h-full w-full rounded-t-xl object-cover"
                                    loading="lazy"
                                    :src="
                                        crs.c_banner
                                            ? `/api/courses/banner/?c_id=${crs.c_id}`
                                            : '/images/CourseBannerDefault.svg'
                                    "
                                    alt="Image Description" >
                                <div class="p-4 md:p-5">
                                    <h3
                                        class="line-clamp-1 text-lg font-bold text-gray-800">
                                        {{ crs.c_name }}
                                    </h3>
                                    <p
                                        class="mt-1 h-12 overflow-auto text-gray-500">
                                        {{ crs.c_description }}
                                    </p>
                                    <div
                                        class="flex flex-row items-end justify-between">
                                        <button
                                            class="mt-2 inline-flex items-center justify-center gap-x-2 rounded-lg border border-transparent bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition-colors duration-150 ease-in-out hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50"
                                            href="#"
                                            @click="
                                                goToCourse(
                                                    crs.c_id,
                                                    crs.c_hashed_password
                                                )
                                            ">
                                            ดูคอร์ส
                                        </button>
                                        <div
                                            v-if="crs.c_hashed_password"
                                            class="hs-tooltip">
                                            <span
                                                class="material-icons-outlined select-none text-gray-500">
                                                lock
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TransitionGroup>

                    <div
                        v-if="!courses?.data.length && !pending && !search"
                        class="col-span-3 flex flex-col items-center justify-center pb-96 pt-16">
                        <h1
                            v-if="userState?.u_role === 'STUDENT'"
                            class="text-xl">
                            คุณไม่ได้เป็นสมาชิกของคอร์สใด ๆ
                        </h1>
                        <button
                            v-if="userState?.u_role === 'STUDENT'"
                            class="mt-2 inline-flex items-center justify-center gap-x-2 rounded-lg border border-transparent bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition-colors duration-150 ease-in-out hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50"
                            href="#"
                            @click="navigateTo('/courses')">
                            ไปดูคอร์ส
                        </button>
                        <h1
                            v-if="userState?.u_role === 'INSTRUCTOR'"
                            class="text-xl">
                            คุณไม่ได้เป็นผู้จัดการคอร์สใด ๆ
                        </h1>
                        <button
                            v-if="userState?.u_role === 'INSTRUCTOR'"
                            class="mt-2 inline-flex items-center justify-center gap-x-2 rounded-lg border border-transparent bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition-colors duration-150 ease-in-out hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50"
                            href="#"
                            @click="createCourseModal.c_openModal()">
                            สร้างคอร์ส
                        </button>
                    </div>
                    <div
                        v-if="!courses?.data.length && !pending && search"
                        class="col-span-3 flex items-center justify-center pb-96 pt-16">
                        <h1 class="text-xl">ไม่พบคำค้นหานั้น</h1>
                    </div>
                </div>
            </div>
            <!-- Pagination -->
            <nav class="mt-8 flex items-center gap-x-1">
                <button
                    type="button"
                    :disabled="currentPage === 1"
                    class="inline-flex min-h-[38px] min-w-[38px] items-center justify-center gap-x-2 rounded-lg px-2.5 py-2 text-sm text-gray-800 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                    @click="
                        () => {
                            if (currentPage > 1) {
                                currentPage--
                            }
                        }
                    ">
                    <svg
                        class="size-3.5 flex-shrink-0"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round">
                        <path d="m15 18-6-6 6-6" />
                    </svg>
                    <span aria-hidden="true" class="sr-only">Previous</span>
                </button>
                <div class="flex items-center gap-x-1">
                    <input
                        v-model="currentPage"
                        type="number"
                        :oninput="`this.value = (this.value >= ${totalPages}) ? ${totalPages} : Math.abs(this.value)`"
                        class="flex min-h-[38px] w-16 min-w-[38px] items-center justify-center rounded-lg border border-gray-200 px-3 py-2 text-center text-sm text-gray-800 focus:bg-gray-50 focus:outline-none disabled:pointer-events-none disabled:opacity-50" >
                    <span
                        class="flex min-h-[38px] items-center justify-center px-1.5 py-2 text-sm text-gray-500">
                        จาก
                    </span>
                    <span
                        class="flex min-h-[38px] items-center justify-center px-1.5 py-2 text-sm text-gray-500">
                        {{ totalPages }}
                    </span>
                </div>
                <button
                    type="button"
                    :disabled="currentPage === totalPages"
                    class="inline-flex min-h-[38px] min-w-[38px] items-center justify-center gap-x-2 rounded-lg px-2.5 py-2 text-sm text-gray-800 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                    @click="
                        () => {
                            if (currentPage < totalPages) {
                                currentPage++
                            }
                        }
                    ">
                    <span aria-hidden="true" class="sr-only">Next</span>
                    <svg
                        class="size-3.5 flex-shrink-0"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round">
                        <path d="m9 18 6-6-6-6" />
                    </svg>
                </button>
            </nav>
            <!-- End Pagination -->
        </div>
    </div>
</template>
<style scoped>
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
    .fade-enter-active,
    .fade-leave-active {
        transition: opacity 0.25s ease;
    }

    .fade-enter-from,
    .fade-leave-to {
        position: absolute;
        top: 0;
        left: 0;
        opacity: 0;
    }
</style>
