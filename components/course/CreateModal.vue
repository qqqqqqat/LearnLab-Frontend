<script setup lang="ts">
    import HSOverlay from '@preline/overlay'
    import { toast } from '@steveyuowo/vue-hot-toast'

    const courseName = ref<string>('')
    const courseDescription = ref<string>('')
    const passwordProtected = ref<boolean>(false)
    const coursePassword = ref<string>('')
    const coursePrivacy = ref<boolean>(false) // false = PUBLIC , true = PRIVATE
    const courseBanner = ref()

    function onFileChangedBanner($event: Event) {
        const target = $event.target as HTMLInputElement
        if (target && target.files) {
            courseBanner.value = target.files[0]
        }
    }

    const createModal = ref()
    function c_closeModal() {
        const instance = HSOverlay.getInstance(createModal.value, true)
        if ('element' in instance) {
            instance.element.close()
        }
    }

    function c_openModal() {
        const instance = HSOverlay.getInstance(createModal.value, true)
        if ('element' in instance) {
            instance.element.open()
        }
    }

    defineExpose({ c_closeModal, c_openModal })
    const emit = defineEmits(['refreshCourse'])

    async function createCourse() {
        const createCourseToast = toast.loading('กำลังสร้างคอร์ส')
        const formData = new FormData()
        formData.append('c_name', courseName.value)
        formData.append('c_description', courseDescription.value)
        formData.append('c_privacy', coursePrivacy.value ? 'PRIVATE' : 'PUBLIC')

        if (courseBanner.value) {
            formData.append('c_banner', courseBanner.value)
        }
        if (passwordProtected.value) {
            formData.append('c_password', coursePassword.value)
        }
        await $fetchWithHeader<CourseCreationResponse>('/api/courses/', {
            method: 'POST',
            body: formData,
        })
            .then((res) => {
                c_closeModal()
                emit('refreshCourse')
                toast.update(createCourseToast, {
                    type: 'success',
                    message: res?.message,
                })
            })
            .catch((err) => {
                toast.update(createCourseToast, {
                    type: 'error',
                    message: err?.data?.message,
                })
            })
    }
</script>
<template>
    <div
        id="create-course-modal"
        ref="createModal"
        class="hs-overlay pointer-events-none fixed start-0 top-0 z-[80] hidden size-full overflow-y-auto overflow-x-hidden opacity-0 transition-all hs-overlay-open:opacity-100 hs-overlay-open:duration-500">
        <div
            class="m-3 opacity-0 transition-all hs-overlay-open:opacity-100 hs-overlay-open:duration-500 sm:mx-auto sm:w-full sm:max-w-lg">
            <div
                class="pointer-events-auto flex flex-col rounded-md border bg-white shadow-sm">
                <div
                    class="flex items-center justify-between border-b px-4 py-3">
                    <h3 class="font-bold text-gray-800">สร้างคอร์ส</h3>
                    <button
                        type="button"
                        class="flex size-7 items-center justify-center rounded-full border border-transparent text-sm font-semibold text-gray-800 hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-50"
                        data-hs-overlay="#create-course-modal">
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
                    <div class="relative">
                        <input
                            id="hs-floating-input-text-course"
                            v-model="courseName"
                            type="text"
                            class="disabled:pointer-events-non peer block w-full rounded-lg border-gray-200 p-4 text-sm placeholder:text-transparent autofill:pb-2 autofill:pt-6 focus:border-blue-500 focus:pb-2 focus:pt-6 focus:ring-blue-500 disabled:opacity-50 [&:not(:placeholder-shown)]:pb-2 [&:not(:placeholder-shown)]:pt-6"
                            placeholder="LearnLab Course-course" >
                        <label
                            for="hs-floating-input-text"
                            class="pointer-events-none absolute start-0 top-0 h-full truncate border border-transparent p-4 text-sm transition duration-100 ease-in-out peer-focus:-translate-y-1.5 peer-focus:text-xs peer-focus:text-gray-500 peer-disabled:pointer-events-none peer-disabled:opacity-50 peer-[:not(:placeholder-shown)]:-translate-y-1.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-500">
                            ชื่อคอร์ส
                            <span class="text-red-600">*</span>
                        </label>
                    </div>
                    <!-- Floating Textarea -->
                    <div class="relative">
                        <textarea
                            id="hs-floating-textarea-desc"
                            v-model="courseDescription"
                            class="peer block w-full rounded-lg border-gray-200 p-4 text-sm placeholder:text-transparent autofill:pb-2 autofill:pt-6 focus:border-blue-500 focus:pb-2 focus:pt-6 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 [&:not(:placeholder-shown)]:pb-2 [&:not(:placeholder-shown)]:pt-6"
                            placeholder="Course Description" />
                        <label
                            for="hs-floating-textarea-desc"
                            class="pointer-events-none absolute start-0 top-0 h-full truncate border border-transparent p-4 text-sm transition duration-100 ease-in-out peer-focus:-translate-y-1.5 peer-focus:text-xs peer-focus:text-gray-500 peer-disabled:pointer-events-none peer-disabled:opacity-50 peer-[:not(:placeholder-shown)]:-translate-y-1.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-500">
                            คำอธิบายคอร์ส
                            <span class="text-red-600">*</span>
                        </label>
                    </div>
                    <!-- End Floating Textarea -->
                    <form>
                        <label class="mb-2 text-sm">ปกคอร์ส</label>
                        <label for="small-file-input-banner" class="sr-only">
                            ปกคอร์ส
                        </label>
                        <input
                            id="small-file-input-banner"
                            type="file"
                            accept="image/*"
                            name="small-file-input-banner"
                            class="block w-full rounded-lg border border-gray-200 text-sm shadow-sm file:me-4 file:border-0 file:bg-gray-50 file:px-4 file:py-2 focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50"
                            @change="onFileChangedBanner($event)" >
                    </form>
                    <div class="flex flex-row items-center gap-4">
                        <div class="flex w-20">
                            <input
                                id="hs-checked-checkbox"
                                v-model="passwordProtected"
                                type="checkbox"
                                class="mt-0.5 shrink-0 rounded border-gray-200 text-blue-600 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50"
                                checked >
                            <label
                                for="hs-checked-checkbox"
                                class="ms-3 text-sm text-gray-500">
                                มีรหัส
                            </label>
                        </div>
                        <div v-if="passwordProtected" class="relative w-full">
                            <input
                                id="hs-floating-input-text"
                                v-model="coursePassword"
                                type="password"
                                class="disabled:pointer-events-non peer block w-full rounded-lg border-gray-200 p-4 text-sm placeholder:text-transparent autofill:pb-2 autofill:pt-6 focus:border-blue-500 focus:pb-2 focus:pt-6 focus:ring-blue-500 disabled:opacity-50 [&:not(:placeholder-shown)]:pb-2 [&:not(:placeholder-shown)]:pt-6"
                                placeholder="password" >
                            <label
                                for="hs-floating-input-text"
                                class="pointer-events-none absolute start-0 top-0 h-full truncate border border-transparent p-4 text-sm transition duration-100 ease-in-out peer-focus:-translate-y-1.5 peer-focus:text-xs peer-focus:text-gray-500 peer-disabled:pointer-events-none peer-disabled:opacity-50 peer-[:not(:placeholder-shown)]:-translate-y-1.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-500">
                                รหัสของคอร์ส
                                <span class="text-red-600">*</span>
                            </label>
                        </div>
                    </div>
                    <div class="flex items-center">
                        <label
                            for="hs-basic-with-description"
                            class="me-3 text-sm text-gray-500">
                            สาธารณะ
                        </label>
                        <input
                            id="hs-basic-with-description"
                            v-model="coursePrivacy"
                            type="checkbox"
                            class="relative h-7 w-[3.25rem] cursor-pointer rounded-full border-transparent bg-gray-100 p-px text-transparent transition-colors duration-200 ease-in-out before:inline-block before:size-6 before:translate-x-0 before:transform before:rounded-full before:bg-white before:shadow before:ring-0 before:transition before:duration-200 before:ease-in-out checked:border-blue-600 checked:bg-none checked:text-blue-600 checked:before:translate-x-full checked:before:bg-blue-200 focus:ring-blue-600 focus:checked:border-blue-600 disabled:pointer-events-none disabled:opacity-50" >
                        <label
                            for="hs-basic-with-description"
                            class="ms-3 text-sm text-gray-500">
                            ส่วนตัว
                        </label>
                    </div>
                </div>
                <div class="flex items-center justify-end gap-x-2 px-4 py-3">
                    <button
                        type="button"
                        class="inline-flex items-center gap-x-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50"
                        data-hs-overlay="#create-course-modal">
                        ยกเลิก
                    </button>
                    <button
                        :disabled="!(courseName && courseDescription)"
                        type="button"
                        class="transition-color inline-flex items-center gap-x-2 rounded-lg border border-transparent bg-blue-600 px-3 py-2 text-sm font-semibold text-white duration-200 ease-in-out hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50"
                        @click="createCourse()">
                        สร้าง
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
