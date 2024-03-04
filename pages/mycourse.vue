<script setup lang="ts">
    const search = ref<string>('')
    const currentPage = ref<number>(0)
    const totalPages = ref<number>(0)
    const isLocked = ref({ title: 'ทั้งหมด', value: 'false' })
    const courses = ref<CourseListing | null>()
    const pending = ref()

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
        }).then((res) => {
            pending.value = false
            courses.value = res
            totalPages.value = res.total_page
        })
    }

    updateQuery(search.value)

    watch(currentPage, () => {
        if (currentPage.value > totalPages.value) {
            currentPage.value = totalPages.value
        } else if (currentPage.value < 1) {
            currentPage.value = 1
        }
        updateQuery(search.value)
    })

    watch(isLocked, () => {
        currentPage.value = 1
        updateQuery(search.value)
    })

    async function goToCourse(c_id: number, is_locked: boolean) {
        console.log(c_id)
        if (!is_locked) {
            await navigateTo({
                path: '/courses/view',
                query: {
                    id: c_id,
                },
            })
        }
    }
</script>
<template>
    <div class="max-w-screen-2xl mx-auto mb-8">
        <div class="flex flex-col items-center w-full h-full">
            <h1 class="text-5xl mt-24 font-bold mb-4">คอร์สเรียนของฉัน</h1>
            <div class="flex xl:flex-row flex-col gap-4">
                <div class="flex flex-col justify-center items-center border border-1 rounded-lg shadow-sm p-8 h-fit">
                    <div class="flex flex-col">
                        <div class="flex xl:flex-col md:flex-row flex-col gap-x-8 gap-2 rounded-lg">
                            <div class="flex flex-col">
                                <h4 class="text-lg text-left w-full">กรองข้อมูล</h4>
                                <label for="hs-trailing-button-add-on-with-icon" class="sr-only">Label</label>
                                <div class="flex">
                                    <input
                                        v-model="search"
                                        type="text"
                                        id="hs-trailing-button-add-on-with-icon"
                                        name="hs-trailing-button-add-on-with-icon"
                                        class="py-3 px-4 block w-full border border-1 border-gray-200 shadow-sm rounded-s-lg text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none" />
                                    <button
                                        @click="
                                            () => {
                                                currentPage = 1
                                                updateQuery(search)
                                            }
                                        "
                                        type="button"
                                        class="w-[2.875rem] h-[2.875rem] flex-shrink-0 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-e-md border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none">
                                        <svg
                                            class="flex-shrink-0 size-4"
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
                            <div class="flex flex-col">
                                <span class="text-lg text-left w-full">การแสดงผล</span>
                                <div class="hs-dropdown max-w-64 relative inline-flex [--placement:bottom-right]">
                                    <button
                                        id="hs-dropdown"
                                        type="button"
                                        class="hs-dropdown-toggle py-3 px-4 inline-flex justify-between w-full items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none">
                                        {{ isLocked.title }}
                                        <svg
                                            class="hs-dropdown-open:rotate-180 size-4"
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
                                        class="hs-dropdown-menu w-72 transition-[opacity,margin] duration hs-dropdown-open:opacity-100 opacity-0 hidden z-10 bg-white shadow-md rounded-lg p-2"
                                        aria-labelledby="hs-dropdown">
                                        <a
                                            class="flex items-center cursor-pointer gap-x-3.5 py-2 px-3 rounded-lg text-sm text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                                            @click="isLocked = { title: 'ทั้งหมด', value: 'false' }">
                                            ทั้งหมด
                                        </a>
                                        <a
                                            class="flex items-center cursor-pointer gap-x-3.5 py-2 px-3 rounded-lg text-sm text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                                            @click="isLocked = { title: 'ไม่มีรหัส', value: 'free' }">
                                            ไม่มีรหัส
                                        </a>
                                        <a
                                            class="flex items-center cursor-pointer gap-x-3.5 py-2 px-3 rounded-lg text-sm text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                                            @click="isLocked = { title: 'มีรหัส', value: 'true' }">
                                            มีรหัส
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="grid relative lg:grid-cols-3 md:grid-cols-2 grid-flow-cols-1 justify-center gap-8 xl:min-w-[1024px] rounded-lg" :class="!courses?.data.length ? 'border border-1' : ''">
                    <TransitionGroup name="fade">
                        <div v-if="pending" v-for="crs in 9" :key="`crs${crs}`" class="flex justify-center items-center rounded-xl">
                            <div class="flex flex-col bg-white border shadow-sm rounded-xl w-80">
                                <div class="max-w-96 max-h-96 animate-pulse bg-gray-200 object-cover w-full aspect-[17/9] rounded-t-xl"></div>
                                <div class="p-4 md:p-5">
                                    <h3 class="text-lg font-bold text-gray-800">
                                        <span class="size-6 w-full block bg-gray-200 rounded-full"></span>
                                    </h3>
                                    <p class="text-gray-500 mt-2">
                                        <span class="size-3 w-full block bg-gray-200 rounded-full mb-2"></span>
                                        <span class="size-3 w-full block bg-gray-200 rounded-full mb-2"></span>
                                    </p>
                                    <div class="flex flex-row justify-between items-end">
                                        <button
                                            class="mt-2 py-2 px-3 transition-colors duration-150 ease-in-out inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                                            href="#"
                                            disabled>
                                            ดูคอร์ส
                                        </button>
                                        <div></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div v-else v-for="crs in courses?.data" class="flex justify-center items-center rounded-xl">
                            <div class="flex flex-col bg-white border shadow-sm rounded-xl w-80">
                                <img class="w-full h-full object-cover aspect-[17/9] rounded-t-xl" loading="lazy" :src="crs.c_banner ? `/api/courses/banner/?c_id=${crs.c_id}` : '/images/CourseBannerDefault.svg'" alt="Image Description" />
                                <div class="p-4 md:p-5">
                                    <h3 class="text-lg font-bold text-gray-800 line-clamp-2">{{ crs.c_name }}</h3>
                                    <p class="mt-1 text-gray-500 h-12 overflow-auto">
                                        {{ crs.c_description }}
                                    </p>
                                    <div class="flex flex-row justify-between items-end">
                                        <button
                                            class="mt-2 py-2 px-3 transition-colors duration-150 ease-in-out inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                                            href="#"
                                            @click="goToCourse(crs.c_id, crs.c_hashed_password)">
                                            ดูคอร์ส
                                        </button>
                                        <div v-if="crs.c_hashed_password" class="hs-tooltip">
                                            <span class="material-icons-outlined text-gray-500 select-none">lock</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TransitionGroup>

                    <div class="flex flex-col justify-center items-center col-span-3 pt-16 pb-96" v-if="!courses?.data.length && !pending && !search">
                        <h1 class="text-xl">คุณไม่ได้เป็นสมาชิกของคอร์สใด ๆ</h1>
                        <button
                            class="mt-2 py-2 px-3 transition-colors duration-150 ease-in-out inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                            href="#"
                            @click="navigateTo('/courses')">
                            ไปดูคอร์ส
                        </button>
                    </div>
                    <div class="flex justify-center items-center col-span-3 pt-16 pb-96" v-if="!courses?.data.length && !pending && search">
                        <h1 class="text-xl">ไม่พบคำค้นหานั้น</h1>
                    </div>
                </div>
            </div>
            <!-- Pagination -->
            <nav class="flex items-center gap-x-1 mt-8">
                <button
                    type="button"
                    @click="
                        () => {
                            if (currentPage > 1) {
                                currentPage--
                            }
                        }
                    "
                    :disabled="currentPage === 1"
                    class="min-h-[38px] min-w-[38px] py-2 px-2.5 inline-flex justify-center items-center gap-x-2 text-sm rounded-lg text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none">
                    <svg
                        class="flex-shrink-0 size-3.5"
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
                        class="min-h-[38px] min-w-[38px] w-16 text-center flex justify-center items-center border border-gray-200 text-gray-800 py-2 px-3 text-sm rounded-lg focus:outline-none focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none" />
                    <span class="min-h-[38px] flex justify-center items-center text-gray-500 py-2 px-1.5 text-sm">จาก</span>
                    <span class="min-h-[38px] flex justify-center items-center text-gray-500 py-2 px-1.5 text-sm">{{ totalPages }}</span>
                </div>
                <button
                    type="button"
                    @click="
                        () => {
                            if (currentPage < totalPages) {
                                currentPage++
                            }
                        }
                    "
                    :disabled="currentPage === totalPages"
                    class="min-h-[38px] min-w-[38px] py-2 px-2.5 inline-flex justify-center items-center gap-x-2 text-sm rounded-lg text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none">
                    <span aria-hidden="true" class="sr-only">Next</span>
                    <svg
                        class="flex-shrink-0 size-3.5"
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
    .fade-enter-active,
    .fade-leave-active {
        transition: opacity 0.25s ease;
    }

    .fade-enter-from,
    .fade-leave-to {
        opacity: 0;
    }
</style>
