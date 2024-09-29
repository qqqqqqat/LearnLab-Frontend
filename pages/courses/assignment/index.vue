<script setup lang="ts">
    definePageMeta({
        layout: 'course',
    })
    import HSOverlay from '@preline/overlay'
    import { toast } from '@steveyuowo/vue-hot-toast'
    import type { LocationQueryValue } from 'vue-router'
    const delName = ref()
    const delID = ref()
    const userRole = useUserCourseState()
    const route = useRoute()
    const assignments = ref()
    const assignPending = ref(true)
    async function fetchAssignment(
        id: LocationQueryValue | LocationQueryValue[]
    ) {
        assignPending.value = true
        await $fetch('/api/courses/assignment/', {
            query: {
                c_id: id,
            },
        })
            .then((res) => {
                assignments.value = res
                assignPending.value = false
            })
            .catch((err) => {
                toast.error(err?.data?.message)
                navigateTo('/mycourse', { replace: true })
            })
    }

    async function deleteAssignment(a_id: number) {
        const deleteAssignmentToast = toast.loading('กำลังลบงานมอบหมาย')

        await $fetch<AssignmentApiResponse>('/api/courses/assignment/', {
            method: 'DELETE',
            body: {
                a_id: a_id,
            },
        })
            .then((res) => {
                c_closeModal()
                fetchAssignment(route.query.id)
                assignPending.value = true
                toast.update(deleteAssignmentToast, {
                    type: 'success',
                    message: res?.message,
                })
            })
            .catch((err) => {
                toast.update(deleteAssignmentToast, {
                    type: 'error',
                    message: err?.data?.message,
                })
                navigateTo('/mycourse', { replace: true })
            })
    }

    async function editAssignment(a_id: number | null) {
        if (!a_id) {
            return
        }
        const deleteAssignmentToast = toast.loading('กำลังลบงานมอบหมาย')

        await $fetch<AssignmentApiResponse>('/api/courses/assignment/', {
            method: 'PATCH',
            body: {
                a_id: a_id,
                a_name: eName.value,
                a_due_date: eDueDate.value,
                a_score: eScore.value,
            },
        })
            .then((res) => {
                e_closeModal()
                fetchAssignment(route.query.id)
                assignPending.value = true
                toast.update(deleteAssignmentToast, {
                    type: 'success',
                    message: res?.message,
                })
            })
            .catch((err) => {
                toast.update(deleteAssignmentToast, {
                    type: 'error',
                    message: err?.data?.message,
                })
                navigateTo('/mycourse', { replace: true })
            })
    }

    const getAssignmentLink = (a_id: number) => {
        const studentId =
            typeof route.query.id === 'string' ? route.query.id : null
        if (studentId && userRole?.value?.[studentId] === 'STUDENT') {
            return `/courses/submission?a_id=${a_id}&id=${studentId}`
        } else {
            return `/courses/assignment/view?a_id=${a_id}&id=${studentId || route.query.id}`
        }
    }

    const getButtonText = (assign: any) => {
        // Replace 'any' with the actual type of 'assign'
        const studentId =
            typeof route.query.id === 'string' ? route.query.id : null // Extract studentId here
        return studentId && userRole?.value?.[studentId] === 'STUDENT' // Use studentId for indexing
            ? assign?.s_datetime
                ? 'ดูงาน'
                : 'ส่งงาน'
            : 'ดูงาน'
    }

    const getButtonIcon = (assign: any) => {
        // Replace 'any' with the actual type of 'assign'
        const studentId =
            typeof route.query.id === 'string' ? route.query.id : null // Extract studentId here
        return studentId && userRole?.value?.[studentId] === 'STUDENT' // Use studentId for indexing
            ? assign?.s_datetime
                ? 'remove_red_eye'
                : 'send'
            : 'remove_red_eye'
    }

    const isUserNotStudent = computed(() => {
        const studentId =
            typeof route.query.id === 'string' ? route.query.id : null
        return !(studentId && userRole?.value?.[studentId] === 'STUDENT')
    })

    const openEditModal = (assign: any) => {
        // Replace 'any' with actual type
        eAID.value = assign.a_id
        eName.value = assign.a_name
        eDueDate.value = assign.a_due_date
        eScore.value = assign.a_score
        e_openModal()
    }

    const openDeleteModal = (assign: any) => {
        // Replace 'any' with actual type
        delName.value = assign.a_name
        delID.value = assign.a_id
        c_openModal()
    }

    if (route.query.id) {
        fetchAssignment(route.query.id)
    } else {
        navigateTo('/courses', { replace: true })
    }

    function c_closeModal() {
        const instance = HSOverlay.getInstance(deleteModal.value, true)
        if ('element' in instance) {
            instance.element.close()
        }
    }

    function c_openModal() {
        const instance = HSOverlay.getInstance(deleteModal.value, true)
        if ('element' in instance) {
            instance.element.open()
        }
    }

    function e_closeModal() {
        const instance = HSOverlay.getInstance(editModal.value, true)
        if ('element' in instance) {
            instance.element.close()
        }
    }

    function e_openModal() {
        const instance = HSOverlay.getInstance(editModal.value, true)
        if ('element' in instance) {
            instance.element.open()
        }
    }
    const deleteModal = ref()
    const editModal = ref()

    const eName = ref(null)
    const eAID = ref(null)
    const eDueDate = ref(null)
    const eScore = ref(null)
</script>
<template>
    <div
        ref="deleteModal"
        id="assignment-delete-confirm-modal"
        class="hs-overlay pointer-events-none fixed start-0 top-0 z-[80] hidden size-full overflow-y-auto overflow-x-hidden opacity-0 transition-all hs-overlay-open:opacity-100 hs-overlay-open:duration-500">
        <div
            class="m-3 opacity-0 transition-all hs-overlay-open:opacity-100 hs-overlay-open:duration-500 sm:mx-auto sm:w-full sm:max-w-lg">
            <div
                class="pointer-events-auto flex flex-col rounded-md border bg-white shadow-sm">
                <div
                    class="flex items-center justify-between border-b px-4 py-3">
                    <h3 class="font-bold text-gray-800">คุณแน่ใจนะ</h3>
                    <button
                        type="button"
                        class="flex size-7 items-center justify-center rounded-full border border-transparent text-sm font-semibold text-gray-800 hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-50"
                        data-hs-overlay="#assignment-delete-confirm-modal">
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
                <div class="flex flex-col gap-4 p-6">
                    <div>
                        คุณกำลังจะลบ {{ delName }} คุณแน่ใจว่าต้องการลบใช่ไหม
                    </div>
                </div>
                <div class="flex items-center justify-end gap-x-2 px-4 py-3">
                    <button
                        type="button"
                        class="inline-flex items-center gap-x-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50"
                        data-hs-overlay="#assignment-delete-confirm-modal">
                        ไม่ใช่
                    </button>
                    <button
                        type="button"
                        @click="deleteAssignment(delID)"
                        class="transition-color inline-flex items-center gap-x-2 rounded-lg border border-transparent bg-blue-600 px-3 py-2 text-sm font-semibold text-white duration-200 ease-in-out hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50">
                        ใช่
                    </button>
                </div>
            </div>
        </div>
    </div>

    <div
        ref="editModal"
        id="assignment-edit-modal"
        class="hs-overlay pointer-events-none fixed start-0 top-0 z-[80] hidden size-full overflow-y-auto overflow-x-hidden opacity-0 transition-all hs-overlay-open:opacity-100 hs-overlay-open:duration-500">
        <div
            class="m-3 opacity-0 transition-all hs-overlay-open:opacity-100 hs-overlay-open:duration-500 sm:mx-auto sm:w-full sm:max-w-lg">
            <div
                class="pointer-events-auto flex flex-col rounded-md border bg-white shadow-sm">
                <div
                    class="flex items-center justify-between border-b px-4 py-3">
                    <h3 class="font-bold text-gray-800">แก้ไขงานมอบหมาย</h3>
                    <button
                        type="button"
                        class="flex size-7 items-center justify-center rounded-full border border-transparent text-sm font-semibold text-gray-800 hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-50"
                        data-hs-overlay="#assignment-edit-modal">
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
                <div class="flex flex-col gap-4 p-6">
                    <div class="relative flex-grow">
                        <input
                            type="text"
                            v-model="eName"
                            id="hs-floating-crs-name"
                            placeholder="หัวข้อโพสต์"
                            class="peer block w-full rounded-lg border-gray-200 p-4 text-sm placeholder:text-transparent autofill:pb-2 autofill:pt-6 focus:border-blue-500 focus:pb-2 focus:pt-6 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 [&:not(:placeholder-shown)]:pb-2 [&:not(:placeholder-shown)]:pt-6" />
                        <label
                            for="hs-floating-crs-name"
                            class="pointer-events-none absolute start-0 top-0 h-full truncate border border-transparent p-4 text-sm transition duration-100 ease-in-out peer-focus:-translate-y-1.5 peer-focus:text-xs peer-focus:text-gray-500 peer-disabled:pointer-events-none peer-disabled:opacity-50 peer-[:not(:placeholder-shown)]:-translate-y-1.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-500">
                            ชื่องานมอบหมาย
                            <span class="text-red-400">*</span>
                        </label>
                    </div>
                    <div class="relative flex-grow">
                        <input
                            type="number"
                            v-model="eScore"
                            id="hs-floating-crs-name"
                            placeholder="หัวข้อโพสต์"
                            class="peer block w-full rounded-lg border-gray-200 p-4 text-sm placeholder:text-transparent autofill:pb-2 autofill:pt-6 focus:border-blue-500 focus:pb-2 focus:pt-6 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 [&:not(:placeholder-shown)]:pb-2 [&:not(:placeholder-shown)]:pt-6" />
                        <label
                            for="hs-floating-crs-name"
                            class="pointer-events-none absolute start-0 top-0 h-full truncate border border-transparent p-4 text-sm transition duration-100 ease-in-out peer-focus:-translate-y-1.5 peer-focus:text-xs peer-focus:text-gray-500 peer-disabled:pointer-events-none peer-disabled:opacity-50 peer-[:not(:placeholder-shown)]:-translate-y-1.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-500">
                            คะแนน
                            <span class="text-red-400">*</span>
                        </label>
                    </div>
                    <div class="relative flex-grow">
                        <input
                            type="datetime-local"
                            v-model="eDueDate"
                            id="hs-floating-crs-name"
                            placeholder="หัวข้อโพสต์"
                            class="peer block w-full rounded-lg border-gray-200 p-4 text-sm placeholder:text-transparent autofill:pb-2 autofill:pt-6 focus:border-blue-500 focus:pb-2 focus:pt-6 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 [&:not(:placeholder-shown)]:pb-2 [&:not(:placeholder-shown)]:pt-6" />
                        <label
                            for="hs-floating-crs-name"
                            class="pointer-events-none absolute start-0 top-0 h-full truncate border border-transparent p-4 text-sm transition duration-100 ease-in-out peer-focus:-translate-y-1.5 peer-focus:text-xs peer-focus:text-gray-500 peer-disabled:pointer-events-none peer-disabled:opacity-50 peer-[:not(:placeholder-shown)]:-translate-y-1.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-500">
                            วันส่ง
                            <span class="text-red-400">*</span>
                        </label>
                    </div>
                </div>
                <div class="flex items-center justify-end gap-x-2 px-4 py-3">
                    <button
                        type="button"
                        class="inline-flex items-center gap-x-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50"
                        data-hs-overlay="#assignment-edit-modal">
                        ยกเลิก
                    </button>
                    <button
                        type="button"
                        @click="editAssignment(eAID)"
                        class="transition-color inline-flex items-center gap-x-2 rounded-lg border border-transparent bg-blue-600 px-3 py-2 text-sm font-semibold text-white duration-200 ease-in-out hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50">
                        บันทึก
                    </button>
                </div>
            </div>
        </div>
    </div>

    <div class="flex w-full flex-col gap-4">
        <div class="flex flex-row items-center justify-between gap-4">
            <div></div>
            <NuxtLink
                v-if="isUserNotStudent && !assignPending"
                :to="`/courses/assignment/create?id=${route.query.id}`"
                type="button"
                class="inline-flex flex-shrink-0 items-center justify-center gap-x-2 rounded-lg select-none border border-transparent bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition-colors duration-150 ease-in-out hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50">
                <span class="material-icons-outlined">add</span>
                เพิ่มงานมอบหมายในคอร์ส
            </NuxtLink>
        </div>
        <div
            v-if="(assignments?.length || 0) > 0"
            v-for="assign in assignments"
            class="border-1 flex w-full flex-row justify-between gap-2 rounded-md border p-4">
            <div>
                <div class="flex w-full flex-wrap items-center gap-4">
                    <div class="flex flex-col">
                        <span class="text-sm text-slate-400">
                            {{
                                assign.a_due_date
                                    ? `กำหนดส่ง ${new Date(assign.a_due_date).toLocaleString()}`
                                    : 'ไม่มีกำหนดส่ง'
                            }}
                        </span>
                        <span class="text-sm text-slate-400">
                            {{
                                assign.a_score
                                    ? `${assign.a_score} คะแนน`
                                    : 'ไม่มีคะแนน'
                            }}
                        </span>
                    </div>
                </div>
                <div
                    class="flex flex-row flex-nowrap items-center gap-2 text-xl font-bold">
                    <span
                        class="flex items-center justify-center rounded-full bg-blue-500 px-2 py-1 text-xs font-normal text-white"
                        v-if="isUserNotStudent">
                        ID: {{ assign?.a_id }}
                    </span>
                    {{ assign.a_name }}
                </div>
            </div>
            <div class="flex items-center gap-2">
                <span
                    v-if="isUserNotStudent"
                    @click="openEditModal(assign)"
                    class="material-icons-outlined cursor-pointer select-none hover:text-blue-600">
                    edit
                </span>
                <span
                    v-if="isUserNotStudent"
                    @click="openDeleteModal(assign)"
                    class="material-icons-outlined cursor-pointer select-none hover:text-rose-600">
                    delete
                </span>
                <NuxtLink
                    :to="getAssignmentLink(assign.a_id)"
                    class="inline-flex flex-shrink-0 select-none items-center justify-center gap-x-2 rounded-lg border border-transparent bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition-colors duration-150 ease-in-out hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50">
                    {{ getButtonText(assign) }}
                    <span class="material-icons-outlined select-none">
                        {{ getButtonIcon(assign) }}
                    </span>
                </NuxtLink>
            </div>
        </div>
        <div
            v-else-if="!assignPending && (assignments?.data?.length || 0) === 0"
            class="border-1 flex w-full flex-col items-center gap-2 rounded-md border p-4 md:flex-row">
            <img class="w-48 p-4" src="/images/exam.svg" />
            <span class="text-3xl font-bold">ยังไม่มีงานมอบหมายในคอร์สนี้</span>
        </div>
        <div
            v-else
            class="border-1 flex w-full flex-row gap-2 rounded-md border p-4">
            <div
                class="inline-block size-6 animate-spin rounded-full border-[3px] border-current border-t-transparent text-blue-600 dark:text-blue-500"
                role="status"
                aria-label="loading">
                <span class="sr-only">Loading...</span>
            </div>
            กำลังโหลดข้อมูล
        </div>
    </div>
</template>
