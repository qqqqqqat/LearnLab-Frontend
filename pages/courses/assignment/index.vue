<script setup lang="ts">
    definePageMeta({
        layout: 'course',
    })
    import { toast } from '@steveyuowo/vue-hot-toast'
    const delName = ref()
    const delID = ref()
    const userRole = useUserCourseState()
    const route = useRoute()
    const assignments = ref()
    const assignPending = ref(true)
    async function fetchAssignment(id: number) {
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

        await $fetch('/api/courses/assignment/', {
            method: 'DELETE',
            body: {
                a_id: a_id,
            },
        })
            .then((res) => {
                c_closeModal()
                fetchAssignment(route.query.id)
                assignPending.value = true
                toast.update(deleteAssignmentToast, { type: 'success', message: res?.message })
            })
            .catch((err) => {
                toast.update(deleteAssignmentToast, { type: 'error', message: err?.data?.message })
                navigateTo('/mycourse', { replace: true })
            })
    }

    async function editAssignment(a_id: number) {
        const deleteAssignmentToast = toast.loading('กำลังลบงานมอบหมาย')

        await $fetch('/api/courses/assignment/', {
            method: 'PATCH',
            body: {
                a_id: a_id,
                a_name: eName.value,
                a_due_date: eDueDate.value,
                a_score: eScore.value
            },
        })
            .then((res) => {
                e_closeModal()
                fetchAssignment(route.query.id)
                assignPending.value = true
                toast.update(deleteAssignmentToast, { type: 'success', message: res?.message })
            })
            .catch((err) => {
                toast.update(deleteAssignmentToast, { type: 'error', message: err?.data?.message })
                navigateTo('/mycourse', { replace: true })
            })
    }

    async function openAssignment(a_id: number) {
        if (userRole?.value?.[route.query.id] === 'STUDENT') {
            await navigateTo(`/courses/submission?a_id=${a_id}&id=${route.query.id}`)
        } else {
            await navigateTo(`/courses/assignment/view?a_id=${a_id}&id=${route.query.id}`)
        }
    }

    if (route.query.id) {
        fetchAssignment(route.query.id)
    } else {
        navigateTo('/courses', {replace: true})
    }

    function c_closeModal() {
        const { element } = HSOverlay.getInstance(deleteModal.value, true)
        element.close()
    }

    function c_openModal() {
        const { element } = HSOverlay.getInstance(deleteModal.value, true)
        element.open()
    }

    function e_closeModal() {
        const { element } = HSOverlay.getInstance(editModal.value, true)
        element.close()
    }

    function e_openModal() {
        const { element } = HSOverlay.getInstance(editModal.value, true)
        element.open()
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
        class="hs-overlay hs-overlay-open:opacity-100 hs-overlay-open:duration-500 hidden size-full fixed top-0 start-0 z-[80] opacity-0 overflow-x-hidden transition-all overflow-y-auto pointer-events-none">
        <div class="hs-overlay-open:opacity-100 hs-overlay-open:duration-500 opacity-0 transition-all sm:max-w-lg sm:w-full m-3 sm:mx-auto">
            <div class="flex flex-col bg-white border shadow-sm rounded-md pointer-events-auto">
                <div class="flex justify-between items-center py-3 px-4 border-b">
                    <h3 class="font-bold text-gray-800">คุณแน่ใจนะ</h3>
                    <button
                        type="button"
                        class="flex justify-center items-center size-7 text-sm font-semibold rounded-full border border-transparent text-gray-800 hover:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none"
                        data-hs-overlay="#assignment-delete-confirm-modal">
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
                <div class="flex flex-col p-6 gap-4">
                    <div>คุณกำลังจะลบ {{ delName }} คุณแน่ใจว่าต้องการลบใช่ไหม</div>
                </div>
                <div class="flex justify-end items-center gap-x-2 py-3 px-4">
                    <button
                        type="button"
                        class="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
                        data-hs-overlay="#assignment-delete-confirm-modal">
                        ไม่ใช่
                    </button>
                    <button
                        type="button"
                        @click="deleteAssignment(delID)"
                        class="transition-color duration-200 ease-in-out py-2 px-3 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none">
                        ใช่
                    </button>
                </div>
            </div>
        </div>
    </div>

    <div
        ref="editModal"
        id="assignment-edit-modal"
        class="hs-overlay hs-overlay-open:opacity-100 hs-overlay-open:duration-500 hidden size-full fixed top-0 start-0 z-[80] opacity-0 overflow-x-hidden transition-all overflow-y-auto pointer-events-none">
        <div class="hs-overlay-open:opacity-100 hs-overlay-open:duration-500 opacity-0 transition-all sm:max-w-lg sm:w-full m-3 sm:mx-auto">
            <div class="flex flex-col bg-white border shadow-sm rounded-md pointer-events-auto">
                <div class="flex justify-between items-center py-3 px-4 border-b">
                    <h3 class="font-bold text-gray-800">แก้ไขงานมอบหมาย</h3>
                    <button
                        type="button"
                        class="flex justify-center items-center size-7 text-sm font-semibold rounded-full border border-transparent text-gray-800 hover:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none"
                        data-hs-overlay="#assignment-edit-modal">
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
                <div class="flex flex-col p-6 gap-4">
                    <div class="relative flex-grow">
                <input
                    type="text"
                    v-model="eName"
                    id="hs-floating-crs-name"
                    placeholder="หัวข้อโพสต์"
                    class="peer p-4 block w-full border-gray-200 rounded-lg text-sm placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none focus:pt-6 focus:pb-2 [&:not(:placeholder-shown)]:pt-6 [&:not(:placeholder-shown)]:pb-2 autofill:pt-6 autofill:pb-2" />
                <label
                    for="hs-floating-crs-name"
                    class="absolute top-0 start-0 p-4 h-full text-sm truncate pointer-events-none transition ease-in-out duration-100 border border-transparent peer-disabled:opacity-50 peer-disabled:pointer-events-none peer-focus:text-xs peer-focus:-translate-y-1.5 peer-focus:text-gray-500 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-translate-y-1.5 peer-[:not(:placeholder-shown)]:text-gray-500">
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
                    class="peer p-4 block w-full border-gray-200 rounded-lg text-sm placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none focus:pt-6 focus:pb-2 [&:not(:placeholder-shown)]:pt-6 [&:not(:placeholder-shown)]:pb-2 autofill:pt-6 autofill:pb-2" />
                <label
                    for="hs-floating-crs-name"
                    class="absolute top-0 start-0 p-4 h-full text-sm truncate pointer-events-none transition ease-in-out duration-100 border border-transparent peer-disabled:opacity-50 peer-disabled:pointer-events-none peer-focus:text-xs peer-focus:-translate-y-1.5 peer-focus:text-gray-500 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-translate-y-1.5 peer-[:not(:placeholder-shown)]:text-gray-500">
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
                    class="peer p-4 block w-full border-gray-200 rounded-lg text-sm placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none focus:pt-6 focus:pb-2 [&:not(:placeholder-shown)]:pt-6 [&:not(:placeholder-shown)]:pb-2 autofill:pt-6 autofill:pb-2" />
                <label
                    for="hs-floating-crs-name"
                    class="absolute top-0 start-0 p-4 h-full text-sm truncate pointer-events-none transition ease-in-out duration-100 border border-transparent peer-disabled:opacity-50 peer-disabled:pointer-events-none peer-focus:text-xs peer-focus:-translate-y-1.5 peer-focus:text-gray-500 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-translate-y-1.5 peer-[:not(:placeholder-shown)]:text-gray-500">
                    วันส่ง
                    <span class="text-red-400">*</span>
                </label>
            </div>

                </div>
                <div class="flex justify-end items-center gap-x-2 py-3 px-4">
                    <button
                        type="button"
                        class="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
                        data-hs-overlay="#assignment-edit-modal">
                        ยกเลิก
                    </button>
                    <button
                        type="button"
                        @click="editAssignment(eAID)"
                        class="transition-color duration-200 ease-in-out py-2 px-3 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none">
                        บันทึก
                    </button>
                </div>
            </div>
        </div>
    </div>

    <div class="flex flex-col gap-4 w-full">
        <div class="flex flex-row justify-between items-center gap-4">
            <div></div>
            <button
                v-if="userRole?.[route.query.id] !== 'STUDENT' && !assignPending"
                @click="navigateTo(`/courses/assignment/create?id=${route.query.id}`)"
                type="button"
                class="py-2 px-3 flex-shrink-0 transition-colors duration-150 ease-in-out inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none">
                <span class="material-icons-outlined">add</span>
                เพิ่มงานมอบหมายในคอร์ส
            </button>
        </div>
        <div v-if="(assignments?.length || 0) > 0" v-for="assign in assignments" class="flex flex-row justify-between border border-1 rounded-md gap-2 w-full p-4">
            <div>
                <div class="flex flex-wrap items-center gap-4 w-full">
                    <div class="flex flex-col">
                        <span class="text-sm text-slate-400">{{ assign.a_due_date ? `กำหนดส่ง ${new Date(assign.a_due_date).toLocaleString()}` : 'ไม่มีกำหนดส่ง' }}</span>
                        <span class="text-sm text-slate-400">{{ assign.a_score ? `${assign.a_score} คะแนน` : 'ไม่มีคะแนน' }}</span>
                    </div>
                </div>
                <div class="text-xl font-bold">{{ assign.a_name }}</div>
            </div>
            <div class="flex items-center gap-2">
                <span @click="
                        () => {
                            eAID = assign.a_id
                            eName = assign.a_name
                            eDueDate = assign.a_due_date
                            eScore = assign.a_score
                            e_openModal()
                        }
                    " v-if="userRole?.[route.query.id] !== 'STUDENT'" class="material-icons-outlined cursor-pointer select-none hover:text-blue-600">edit</span>
                <span
                    v-if="userRole?.[route.query.id] !== 'STUDENT'"
                    @click="
                        () => {
                            delName = assign.a_name
                            delID = assign.a_id
                            c_openModal()
                        }
                    "
                    class="material-icons-outlined cursor-pointer select-none hover:text-rose-600">
                    delete
                </span>
                <button
                    type="button"
                    @click="openAssignment(assign.a_id)"
                    class="py-2 px-3 flex-shrink-0 select-none transition-colors duration-150 ease-in-out inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none">
                    {{ userRole?.[route.query.id] === 'STUDENT' ? (assign?.s_datetime ? 'ดูงาน' : 'ส่งงาน') : 'ดูงาน' }}
                    <span class="material-icons-outlined select-none">{{ userRole?.[route.query.id] === 'STUDENT' ? (assign?.s_datetime ? 'remove_red_eye' : 'send') : 'remove_red_eye' }}</span>
                </button>
            </div>
        </div>
        <div v-else-if="!assignPending && (assignments?.data?.length || 0) === 0" class="flex md:flex-row flex-col items-center border border-1 rounded-md gap-2 w-full p-4">
            <img class="w-48 p-4" src="/images/exam.svg" />
            <span class="text-3xl font-bold">ยังไม่มีงานมอบหมายในคอร์สนี้</span>
        </div>
        <div v-else class="flex flex-row border border-1 rounded-md gap-2 w-full p-4">
            <div class="animate-spin inline-block size-6 border-[3px] border-current border-t-transparent text-blue-600 rounded-full dark:text-blue-500" role="status" aria-label="loading">
                <span class="sr-only">Loading...</span>
            </div>
            กำลังโหลดข้อมูล
        </div>
    </div>
</template>
