<script setup lang="ts">
    import HSOverlay from '@preline/overlay'
    import { toast } from '@steveyuowo/vue-hot-toast'

    const courseName = ref<string>('')
    const courseDescription = ref<string>('')
    const passwordProtected = ref<boolean>(false)
    const coursePassword = ref<string>('')
    const coursePrivacy = ref<boolean>(false) // false = PUBLIC , true = PRIVATE
    const courseBanner = ref()

    const createCourseModal = ref()
    function c_closeModal() {
        const { element } = HSOverlay.getInstance(createCourseModal.value, true)
        element.close()
    }

    function c_openModal() {
        const { element } = HSOverlay.getInstance(createCourseModal.value, true)
        element.open()
    }

    defineExpose({ c_closeModal, c_openModal })
    const emit = defineEmits(['refreshPost'])

    async function createCourse(){
        const createPostToast = toast.loading('กำลังสร้างคอร์ส')
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
        await $fetch('/api/post', {
            method: 'PUT',
            body: formData
        }).then(res => {
            toast.update(createPostToast, {type: 'success', message: res?.message})
            c_closeModal()
            emit('refreshPost')
        }).catch(err => {
            toast.update(createPostToast, {type: 'error', message: err?.data?.message})
        })
    }

</script>
<template>
    <div
        ref="createCourseModal"
        id="create-post-modal"
        class="hs-overlay hs-overlay-open:opacity-100 hs-overlay-open:duration-500 hidden size-full fixed top-0 start-0 z-[80] opacity-0 overflow-x-hidden transition-all overflow-y-auto pointer-events-none">
        <div class="hs-overlay-open:opacity-100 hs-overlay-open:duration-500 opacity-0 transition-all sm:max-w-lg sm:w-full m-3 sm:mx-auto">
            <div class="flex flex-col bg-white border shadow-sm rounded-md pointer-events-auto">
                <div class="flex justify-between items-center py-3 px-4 border-b">
                    <h3 class="font-bold text-gray-800">สร้างคอร์ส</h3>
                    <button
                        type="button"
                        class="flex justify-center items-center size-7 text-sm font-semibold rounded-full border border-transparent text-gray-800 hover:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none"
                        data-hs-overlay="#create-post-modal">
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
                <div class="flex flex-col gap-4 p-4 overflow-y-auto">
                    <div class="relative">
                        <input
                            type="text"
                            v-model="courseName"
                            id="hs-floating-input-text-course"
                            class="peer p-4 block w-full border-gray-200 rounded-lg text-sm placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-non focus:pt-6 focus:pb-2 [&:not(:placeholder-shown)]:pt-6 [&:not(:placeholder-shown)]:pb-2 autofill:pt-6 autofill:pb-2"
                            placeholder="LearnLab Course-course" />
                        <label
                            for="hs-floating-input-text"
                            class="absolute top-0 start-0 p-4 h-full text-sm truncate pointer-events-none transition ease-in-out duration-100 border border-transparent peer-disabled:opacity-50 peer-disabled:pointer-events-none peer-focus:text-xs peer-focus:-translate-y-1.5 peer-focus:text-gray-500 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-translate-y-1.5 peer-[:not(:placeholder-shown)]:text-gray-500">
                            ชื่อคอร์ส
                            <span class="text-red-600">*</span>
                        </label>
                    </div>
                    <!-- Floating Textarea -->
                    <div class="relative">
                        <textarea
                            v-model="courseDescription"
                            id="hs-floating-textarea-desc"
                            class="peer p-4 block w-full border-gray-200 rounded-lg text-sm placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none focus:pt-6 focus:pb-2 [&:not(:placeholder-shown)]:pt-6 [&:not(:placeholder-shown)]:pb-2 autofill:pt-6 autofill:pb-2"
                            placeholder="Course Description"></textarea>
                        <label
                            for="hs-floating-textarea-desc"
                            class="absolute top-0 start-0 p-4 h-full text-sm truncate pointer-events-none transition ease-in-out duration-100 border border-transparent peer-disabled:opacity-50 peer-disabled:pointer-events-none peer-focus:text-xs peer-focus:-translate-y-1.5 peer-focus:text-gray-500 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-translate-y-1.5 peer-[:not(:placeholder-shown)]:text-gray-500">
                            คำอธิบายคอร์ส 
                            <span class="text-red-600">*</span>
                        </label>
                    </div>
                    <!-- End Floating Textarea -->
                    <form>
                        <label class="text-sm mb-2">ปกคอร์ส</label>
                        <label for="small-file-input-banner" class="sr-only">ปกคอร์ส</label>
                        <input
                        @change="onFileChangedBanner($event)"
                            type="file"
                            name="small-file-input-banner"
                            id="small-file-input-banner"
                            class="block w-full border border-gray-200 shadow-sm rounded-lg text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none file:bg-gray-50 file:border-0 file:me-4 file:py-2 file:px-4" />
                    </form>
                    <div class="flex flex-row items-center gap-4">
                        <div class="flex w-20">
                            <input
                                v-model="passwordProtected"
                                type="checkbox"
                                class="shrink-0 mt-0.5 border-gray-200 rounded text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                                id="hs-checked-checkbox"
                                checked />
                            <label for="hs-checked-checkbox" class="text-sm text-gray-500 ms-3">มีรหัส</label>
                        </div>
                        <div v-if="passwordProtected" class="relative w-full">
                            <input
                            v-model="coursePassword"
                                type="password"
                                id="hs-floating-input-text"
                                class="peer p-4 block w-full border-gray-200 rounded-lg text-sm placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-non focus:pt-6 focus:pb-2 [&:not(:placeholder-shown)]:pt-6 [&:not(:placeholder-shown)]:pb-2 autofill:pt-6 autofill:pb-2"
                                placeholder="password" />
                            <label
                                for="hs-floating-input-text"
                                class="absolute top-0 start-0 p-4 h-full text-sm truncate pointer-events-none transition ease-in-out duration-100 border border-transparent peer-disabled:opacity-50 peer-disabled:pointer-events-none peer-focus:text-xs peer-focus:-translate-y-1.5 peer-focus:text-gray-500 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-translate-y-1.5 peer-[:not(:placeholder-shown)]:text-gray-500">
                                รหัสของคอร์ส <span class="text-red-600">*</span>
                            </label>
                        </div>
                    </div>
                    <div class="flex items-center">
                        <label for="hs-basic-with-description" class="text-sm text-gray-500 me-3">สาธารณะ</label>
                        <input
                            v-model="coursePrivacy"
                            type="checkbox"
                            id="hs-basic-with-description"
                            class="relative w-[3.25rem] h-7 p-px bg-gray-100 border-transparent text-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:ring-blue-600 disabled:opacity-50 disabled:pointer-events-none checked:bg-none checked:text-blue-600 checked:border-blue-600 focus:checked:border-blue-600 before:inline-block before:size-6 before:bg-white checked:before:bg-blue-200 before:translate-x-0 checked:before:translate-x-full before:rounded-full before:shadow before:transform before:ring-0 before:transition before:ease-in-out before:duration-200" />
                        <label for="hs-basic-with-description" class="text-sm text-gray-500 ms-3">ส่วนตัว</label>
                    </div>
                </div>
                <div class="flex justify-end items-center gap-x-2 py-3 px-4">
                    <button
                        type="button"
                        class="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
                        data-hs-overlay="#create-post-modal">
                        ยกเลิก
                    </button>
                    <button
                        :disabled="!(courseName && courseDescription)"
                        @click="createCourse()"
                        type="button"
                        class="transition-color duration-200 ease-in-out py-2 px-3 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none">
                        สร้าง
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
