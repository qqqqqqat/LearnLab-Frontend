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

    const enrolled = ref<EnrolledCourse>([])
    const course = ref<{} | null>({})

    watch(userState, () => {
        getEnrolledCourse()
    })

    if (userState.value) {
        getEnrolledCourse()
    }

    async function getEnrolledCourse() {
        await $fetch<EnrolledCourse>('/api/courses/me/?mycourse').then(
            (res) => {
                enrolled.value = res
            }
        )
    }

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

    watch(
        () => userState.value?.u_role,
        (role) => {
            console.log(role)
            if (role === 'INSTRUCTOR') {
                navigateTo('/mycourse', { replace: true })
            }
        }
    )
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
    const enrollModal = ref()

    function closeModal() {
        crspassword.value = ''
        const instance = HSOverlay.getInstance(modalElemOne.value, true)
        if ('element' in instance) {
            instance.element.close()
        }
    }

    function openModal() {
        const instance = HSOverlay.getInstance(modalElemOne.value, true)
        if ('element' in instance) {
            instance.element.open()
        }
    }

    async function joinCourse() {
        const joinToast = toast.loading('กำลังเข้าร่วมคอร์ส')
        let crspayload = { c_id: modalCourseID.value }
        if (modalLockedCourse)
            Object.assign(crspayload, { c_password: crspassword.value })
        await $fetch<JoinCoursePOSTAPIResponse>('/api/courses/enroll/', {
            method: 'POST',
            body: crspayload,
        })
            .then((res) => {
                getEnrolledCourse()
                closeModal()
                toast.update(joinToast, {
                    type: 'success',
                    message: res?.message,
                })
            })
            .catch((err) => {
                if (err?.data?.message === 'คุณเป็นสมาชิกของคอร๋สนี้อยู่แล้ว')
                    closeModal()
                toast.update(joinToast, {
                    type: 'error',
                    message: err?.data?.message,
                })
            })
    }

    async function findCourse() {
        const joinCodeToast = toast.loading('กำลังเข้าร่วมคอร์ส')
        let payload = { c_code: crscode.value }
        await $fetch('/api/courses/enroll/', {
            method: 'PUT',
            body: payload,
        })
            .then((res) => {
                goToCourse(res?.c_id, res?.c_name, res?.c_hashed_password)
                crscode.value = ''
                toast.update(joinCodeToast, {
                    type: 'success',
                    message: res?.message,
                })
            })
            .catch((err) => {
                if (err?.data?.message)
                    toast.update(joinCodeToast, {
                        type: 'error',
                        message: err?.data?.message,
                    })
                crscode.value = ''
            })
    }

    async function goToCourse(
        c_id: number,
        c_name: string,
        is_locked: boolean
    ) {
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
        class="hs-overlay pointer-events-none fixed start-0 top-0 z-[80] hidden size-full overflow-y-auto overflow-x-hidden opacity-0 transition-all hs-overlay-open:opacity-100 hs-overlay-open:duration-500">
        <div
            class="m-3 opacity-0 transition-all hs-overlay-open:opacity-100 hs-overlay-open:duration-500 sm:mx-auto sm:w-full sm:max-w-lg">
            <div
                class="pointer-events-auto flex flex-col rounded-md border bg-white shadow-sm">
                <div class="flex items-center justify-between px-4 py-3">
                    <h3 class="font-bold text-gray-800">เข้าร่วมคอร์ส</h3>
                    <button
                        type="button"
                        class="flex size-7 items-center justify-center rounded-full border border-transparent text-sm font-semibold text-gray-800 hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-50"
                        data-hs-overlay="#hs-join-modal">
                        <span class="sr-only">Close</span>
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
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                        </svg>
                    </button>
                </div>
                <div class="flex flex-col gap-4 overflow-y-auto p-4">
                    <p class="mt-1 text-gray-800">
                        {{
                            modalLockedCourse
                                ? `คอร์ส ${modalCourseName} ได้ถูกล็อกไว้ กรุณากรอกรหัสเพื่อเข้าร่วม`
                                : `คุณกำลังจะเข้าร่วมคอร์ส ${modalCourseName} คุณแน่ใจหรือไม่ว่าต้องการเข้าหรือไม่`
                        }}
                    </p>
                    <div class="relative" v-if="modalLockedCourse">
                        <input
                            type="password"
                            class="peer block w-full rounded-lg border-transparent bg-gray-100 px-4 py-3 ps-11 text-sm focus:border-blue-500 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50"
                            v-model="crspassword"
                            placeholder="ใส่รหัส" />
                        <div
                            class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 peer-disabled:pointer-events-none peer-disabled:opacity-50">
                            <svg
                                class="size-4 flex-shrink-0 text-gray-500"
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round">
                                <path
                                    d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z" />
                                <circle cx="16.5" cy="7.5" r=".5" />
                            </svg>
                        </div>
                    </div>
                </div>
                <div
                    class="flex items-center justify-end gap-x-2 border-t px-4 py-3">
                    <button
                        type="button"
                        class="inline-flex items-center gap-x-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50"
                        data-hs-overlay="#hs-join-modal">
                        ยกเลิก
                    </button>
                    <button
                        type="button"
                        @click="joinCourse"
                        class="inline-flex items-center gap-x-2 rounded-lg border border-transparent bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                        เข้าร่วม
                    </button>
                </div>
            </div>
        </div>
    </div>

    <div class="mx-auto mb-8 max-w-screen-2xl">
        <div class="flex h-full w-full flex-col items-center">
            <h1 class="mb-4 mt-24 font-title text-5xl font-bold">คอร์สเรียน</h1>
            <div class="flex flex-col gap-4 xl:flex-row">
                <div
                    class="border-1 flex h-fit flex-col items-center justify-center rounded-lg border p-8">
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
                                        v-model="search"
                                        type="text"
                                        id="hs-trailing-button-add-on-with-icon"
                                        name="hs-trailing-button-add-on-with-icon"
                                        class="border-1 block w-full rounded-s-lg border border-gray-200 px-4 py-3 text-sm shadow-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50" />
                                    <button
                                        @click="
                                            () => {
                                                currentPage = 1
                                                updateQuery(search)
                                            }
                                        "
                                        type="button"
                                        class="inline-flex h-[2.875rem] w-[2.875rem] flex-shrink-0 items-center justify-center gap-x-2 rounded-e-md border border-transparent bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50">
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
                            <div class="flex w-64 flex-col">
                                <span class="w-full text-left text-lg">
                                    การแสดงผล
                                </span>
                                <div
                                    class="hs-dropdown relative inline-flex [--placement:bottom-right]">
                                    <button
                                        id="hs-dropdown"
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
                                        class="hs-dropdown-menu duration z-10 hidden max-w-72 rounded-lg bg-white p-2 opacity-0 shadow-md transition-[opacity,margin] hs-dropdown-open:opacity-100"
                                        aria-labelledby="hs-dropdown">
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
                            <hr
                                class="mb-2 mt-4 block md:hidden xl:block"
                                v-if="userState" />
                            <div
                                class="hidden h-20 w-[2px] rounded-full bg-slate-200 md:block xl:hidden"
                                v-if="userState"></div>
                            <div class="flex flex-col">
                                <TransitionGroup name="fade">
                                    <span
                                        class="w-full text-left text-lg"
                                        key="enterCourseWithCodeLabel"
                                        v-if="userState">
                                        เข้าคอร์สด้วยรหัส
                                    </span>
                                    <div
                                        class="flex flex-row justify-between gap-x-2"
                                        key="enterCourseWithCode"
                                        v-if="userState">
                                        <input
                                            type="text"
                                            v-model="crscode"
                                            class="block w-40 rounded-lg border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50"
                                            placeholder="รหัสคอร์ส" />
                                        <button
                                            type="button"
                                            @click="findCourse()"
                                            :disabled="!(crscode.length === 8)"
                                            class="inline-flex items-center gap-x-2 rounded-lg border border-transparent bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition-colors duration-150 ease-in-out hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50">
                                            <span
                                                class="material-icons-outlined"
                                                style="font-size: 18px">
                                                add
                                            </span>
                                            เข้า
                                        </button>
                                    </div>
                                </TransitionGroup>
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    class="grid-flow-cols-1 relative grid justify-center gap-8 rounded-lg md:grid-cols-2 lg:grid-cols-3 xl:min-w-[1024px]"
                    :class="!courses?.data.length ? 'border-1 border' : ''">
                    <TransitionGroup name="fade">
                        <div
                            v-if="pending"
                            v-for="crs in 9"
                            :key="`crs${crs}`"
                            class="flex items-center justify-center rounded-xl">
                            <div
                                class="flex w-80 flex-col rounded-xl border bg-white shadow-sm">
                                <div
                                    class="aspect-[17/9] max-h-96 w-full max-w-96 animate-pulse rounded-t-xl bg-gray-200 object-cover"></div>
                                <div class="p-4 md:p-5">
                                    <h3 class="text-lg font-bold text-gray-800">
                                        <span
                                            class="block size-6 w-full rounded-full bg-gray-200"></span>
                                    </h3>
                                    <p class="mt-2 text-gray-500">
                                        <span
                                            class="mb-2 block size-3 w-full rounded-full bg-gray-200"></span>
                                        <span
                                            class="mb-2 block size-3 w-full rounded-full bg-gray-200"></span>
                                    </p>
                                    <div
                                        class="flex flex-row items-end justify-between">
                                        <button
                                            class="mt-2 inline-flex items-center justify-center gap-x-2 rounded-lg border border-transparent bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition-colors duration-150 ease-in-out hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50"
                                            href="#"
                                            disabled>
                                            ดูคอร์ส
                                        </button>
                                        <div></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div
                            v-else
                            v-for="crs in courses?.data"
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
                                    alt="Image Description" />
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
                                            :disabled="
                                                enrolled?.includes(crs.c_id)
                                            "
                                            @click="
                                                () => {
                                                    if (
                                                        userState &&
                                                        !enrolled?.includes(
                                                            crs.c_id
                                                        )
                                                    ) {
                                                        goToCourse(
                                                            crs.c_id,
                                                            crs.c_name,
                                                            crs.c_hashed_password
                                                        )
                                                    } else {
                                                        toast.error(
                                                            'กรุณาลงชื่อเข้าใช้ก่อน'
                                                        )
                                                    }
                                                }
                                            ">
                                            <span
                                                class="material-icons-outlined"
                                                style="font-size: 17px">
                                                {{
                                                    enrolled?.includes(crs.c_id)
                                                        ? 'check'
                                                        : crs.c_hashed_password
                                                          ? 'key'
                                                          : 'login'
                                                }}
                                            </span>
                                            {{
                                                enrolled?.includes(crs.c_id)
                                                    ? 'เข้าร่วมแล้ว'
                                                    : crs.c_hashed_password
                                                      ? 'ใส่รหัสเพื่อเข้า'
                                                      : 'เข้าร่วมคอร์ส'
                                            }}
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
                        class="col-span-3 flex items-center justify-center pb-96 pt-16"
                        v-if="!courses?.data.length && !pending">
                        <h1 class="text-xl">ไม่พบคำค้นหานั้น</h1>
                    </div>
                </div>
            </div>
            <!-- Pagination -->
            <nav class="mt-8 flex items-center gap-x-1">
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
                    class="inline-flex min-h-[38px] min-w-[38px] items-center justify-center gap-x-2 rounded-lg px-2.5 py-2 text-sm text-gray-800 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none disabled:pointer-events-none disabled:opacity-50">
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
                        class="flex min-h-[38px] w-16 min-w-[38px] items-center justify-center rounded-lg border border-gray-200 px-3 py-2 text-center text-sm text-gray-800 focus:bg-gray-50 focus:outline-none disabled:pointer-events-none disabled:opacity-50" />
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
                    @click="
                        () => {
                            if (currentPage < totalPages) {
                                currentPage++
                            }
                        }
                    "
                    :disabled="currentPage === totalPages"
                    class="inline-flex min-h-[38px] min-w-[38px] items-center justify-center gap-x-2 rounded-lg px-2.5 py-2 text-sm text-gray-800 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none disabled:pointer-events-none disabled:opacity-50">
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
