<script setup lang="ts">
    import { toast } from '@steveyuowo/vue-hot-toast'
    import HSOverlay from '@preline/overlay'

    const userState = useUserState()

    const modalLockedCourse = ref<boolean>(false)
    const modalCourseID = ref<number>(0)
    const modalCourseName = ref<string>('')

    const search = ref<string>('')
    const crscode = ref<string>('')
    const crspassword = ref<string>('')
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

    const { data: enrolled } = await useLazyFetch<EnrolledCourse>('/api/courses/me/?mycourse');

    async function updateQuery(searchQuery: string) {
        pending.value = true
        await $fetch<CourseListing>('/api/courses/', {
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

    const modalElemOne = ref()

    function closeModal() {
        crspassword.value = ''
        const { element } = HSOverlay.getInstance(modalElemOne.value, true)
        element.close()
    }

    function openModal() {
        const { element } = HSOverlay.getInstance(modalElemOne.value, true)
        element.open()
    }

    async function joinCourse() {
        const joinToast = toast.loading('กำลังเข้าร่วมคอร์ส')
        let crspayload = { c_id: modalCourseID.value }
        if (modalLockedCourse) Object.assign(crspayload, { c_password: crspassword.value })
        await $fetch<JoinCoursePOSTAPIResponse>('/api/courses/enroll/', {
            method: 'POST',
            body: crspayload,
        })
            .then((res) => {
                toast.update(joinToast, { type: 'success', message: res.message })
                closeModal()
            })
            .catch((err) => {
                if (err.data.message === 'คุณเป็นสมาชิกของคอร๋สนี้อยู่แล้ว') closeModal()
                toast.update(joinToast, { type: 'error', message: err.data.message })
            })
    }

    async function goToCourse(c_id: number, c_name: string, is_locked: boolean) {
        modalCourseID.value = c_id
        modalCourseName.value = c_name
        if (!is_locked) {
            modalLockedCourse.value = false
            openModal()
        } else {
            modalLockedCourse.value = true
            openModal()
        }
    }

    watch(crscode, () => {
        if (crscode.value.length > 8) {
            crscode.value = crscode.value.slice(0, 8)
        }
    })

    
</script>
<template>
    <div
        id="hs-join-modal"
        ref="modalElemOne"
        class="hs-overlay hs-overlay-open:opacity-100 hs-overlay-open:duration-500 hidden size-full fixed top-0 start-0 z-[80] opacity-0 overflow-x-hidden transition-all overflow-y-auto pointer-events-none">
        <div class="hs-overlay-open:opacity-100 hs-overlay-open:duration-500 opacity-0 transition-all sm:max-w-lg sm:w-full m-3 sm:mx-auto">
            <div class="flex flex-col bg-white border shadow-sm rounded-md pointer-events-auto">
                <div class="flex justify-between items-center py-3 px-4">
                    <h3 class="font-bold text-gray-800">เข้าร่วมคอร์ส</h3>
                    <button
                        type="button"
                        class="flex justify-center items-center size-7 text-sm font-semibold rounded-full border border-transparent text-gray-800 hover:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none"
                        data-hs-overlay="#hs-join-modal">
                        <span class="sr-only">Close</span>
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
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                        </svg>
                    </button>
                </div>
                <div class="p-4 flex flex-col gap-4 overflow-y-auto">
                    <p class="mt-1 text-gray-800">
                        {{
                            modalLockedCourse ? `คอร์ส ${modalCourseName} ได้ถูกล็อกไว้ กรุณากรอกรหัสเพื่อเข้าร่วม` : `คุณกำลังจะเข้าร่วมคอร์ส ${modalCourseName} คุณแน่ใจหรือไม่ว่าต้องการเข้าหรือไม่`
                        }}
                    </p>
                    <div class="relative" v-if="modalLockedCourse">
                        <input
                            type="password"
                            class="peer py-3 px-4 ps-11 block w-full bg-gray-100 border-transparent rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                            v-model="crspassword"
                            placeholder="ใส่รหัส" />
                        <div class="absolute inset-y-0 start-0 flex items-center pointer-events-none ps-4 peer-disabled:opacity-50 peer-disabled:pointer-events-none">
                            <svg
                                class="flex-shrink-0 size-4 text-gray-500"
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round">
                                <path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z" />
                                <circle cx="16.5" cy="7.5" r=".5" />
                            </svg>
                        </div>
                    </div>
                </div>
                <div class="flex justify-end items-center gap-x-2 py-3 px-4 border-t">
                    <button
                        type="button"
                        class="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
                        data-hs-overlay="#hs-join-modal">
                        ยกเลิก
                    </button>
                    <button
                        type="button"
                        @click="joinCourse"
                        class="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
                        เข้าร่วม
                    </button>
                </div>
            </div>
        </div>
    </div>

    <div class="max-w-screen-2xl mx-auto mb-8">
        <div class="flex flex-col items-center w-full h-full">
            <h1 class="text-5xl mt-24 font-bold mb-4">คอร์สเรียน</h1>
            <div class="flex xl:flex-row flex-col gap-4">
                <div class="flex flex-col justify-center items-center border border-1 rounded-lg p-8 h-fit">
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
                            <div class="flex flex-col w-64">
                                <span class="text-lg text-left w-full">การแสดงผล</span>
                                <div class="hs-dropdown relative inline-flex [--placement:bottom-right]">
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
                                        class="hs-dropdown-menu max-w-72 transition-[opacity,margin] duration hs-dropdown-open:opacity-100 opacity-0 hidden z-10 bg-white shadow-md rounded-lg p-2"
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
                            <hr class="mb-2 mt-4 xl:block md:hidden block" v-if="userState" />
                            <div class="w-[2px] rounded-full bg-slate-200 h-20 xl:hidden md:block hidden" v-if="userState"></div>
                            <div class="flex flex-col">
                                    <TransitionGroup name="fade">
                                    <span class="text-lg text-left w-full" key="enterCourseWithCodeLabel" v-if="userState">เข้าคอร์สด้วยรหัส</span>
                                    <div class="flex flex-row gap-x-2 justify-between" key="enterCourseWithCode" v-if="userState">
                                        <input
                                            type="text"
                                            v-model="crscode"
                                            class="py-3 px-4 block w-40 border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                                            placeholder="รหัสคอร์ส" />
                                        <button
                                            type="button"
                                            :disabled="!(crscode.length === 8)"
                                            class="transition-colors duration-150 ease-in-out py-2 px-3 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none">
                                            <span class="material-icons-outlined" style="font-size: 18px">add</span>
                                            เข้า
                                        </button>
                                    </div>
                                </TransitionGroup>
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
                                <img class="w-full h-full object-cover aspect-[17/9] rounded-t-xl" :src="crs.c_banner || '/images/CourseBannerDefault.svg'" alt="Image Description" />
                                <div class="p-4 md:p-5">
                                    <h3 class="text-lg font-bold text-gray-800 line-clamp-2">{{ crs.c_name }}</h3>
                                    <p class="mt-1 text-gray-500 h-12 overflow-auto">
                                        {{ crs.c_description }}
                                    </p>
                                    <div class="flex flex-row justify-between items-end">
                                        <button
                                            class="mt-2 py-2 px-3 transition-colors duration-150 ease-in-out inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                                            href="#"
                                            :disabled="enrolled?.includes(crs.c_id)"
                                            @click="
                                                () => {
                                                    if (userState && !enrolled?.includes(crs.c_id)) {
                                                        goToCourse(crs.c_id, crs.c_name, crs.c_hashed_password)
                                                    } else {
                                                        toast.error('กรุณาลงชื่อเข้าใช้ก่อน')
                                                    }
                                                }
                                            ">
                                            <span class="material-icons-outlined" style="font-size: 17px;">
                                                {{ enrolled?.includes(crs.c_id) ? 'check' : crs.c_hashed_password ? 'key' : 'login' }}
                                            </span>
                                            {{ enrolled?.includes(crs.c_id) ? 'เข้าร่วมแล้ว' : crs.c_hashed_password ? 'ใส่รหัสเพื่อเข้า' : 'เข้าร่วมคอร์ส' }}
                                        </button>
                                        <div v-if="crs.c_hashed_password" class="hs-tooltip">
                                            <span class="material-icons-outlined text-gray-500 select-none">lock</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TransitionGroup>

                    <div class="flex justify-center items-center col-span-3 pt-16 pb-96" v-if="!courses?.data.length && !pending">
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
