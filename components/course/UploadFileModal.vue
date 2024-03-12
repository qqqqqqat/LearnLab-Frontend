<script setup lang="ts">
    import HSOverlay from '@preline/overlay'
    import { toast } from '@steveyuowo/vue-hot-toast'

    const props = defineProps({
        c_id: {
            type: String,
            required: true
        },
        f_path: {
            type: String,
            required: true
        },
    })
    defineExpose({ c_closeModal, c_openModal })
    const uploadMaterial = ref()
    const isFileUploading = ref(false)

    const uploadMaterialModal = ref()
    function c_closeModal() {
        const { element } = HSOverlay.getInstance(uploadMaterialModal.value, true)
        element.close()
    }

    function c_openModal() {
        const { element } = HSOverlay.getInstance(uploadMaterialModal.value, true)
        element.open()
    }

    async function uploadFile() {
        isFileUploading.value = true
        const createFileToast = toast.loading('กำลังอัพโหลดไฟล์')
        const formData = new FormData()
        formData.append('c_id', props.c_id.toString())
        formData.append('f_path', props.f_path)
        formData.append('f_type', 'FILE')
        formData.append('f_data', uploadMaterial.value)
        await $fetch<{message: string, status: number}>('/api/file/', {
            method: 'POST',
            body: formData,
        })
            .then((res) => {
                c_closeModal()
                emit('refreshFile')
                isFileUploading.value = false
                uploadMaterial.value = undefined
                toast.update(createFileToast, { type: 'success', message: res?.message })
            })
            .catch((err) => {
                isFileUploading.value = false
                toast.update(createFileToast, { type: 'error', message: err?.data?.message })
            })
    }

    const emit = defineEmits(['refreshFile'])
    function onFileChangedBanner($event: Event) {
        const target = $event.target as HTMLInputElement
        if (target && target.files) {
            uploadMaterial.value = target.files[0]
        }
    }
</script>
<template>
    <div
        ref="uploadMaterialModal"
        id="upload-material-modal"
        class="hs-overlay hs-overlay-open:opacity-100 hs-overlay-open:duration-500 hidden size-full fixed top-0 start-0 z-[80] opacity-0 overflow-x-hidden transition-all overflow-y-auto pointer-events-none">
        <div class="hs-overlay-open:opacity-100 hs-overlay-open:duration-500 opacity-0 transition-all sm:max-w-lg sm:w-full m-3 sm:mx-auto">
            <div class="flex flex-col bg-white border shadow-sm rounded-md pointer-events-auto">
                <div class="flex justify-between items-center py-3 px-4 border-b">
                    <h3 class="font-bold text-gray-800">อัพโหลดไฟล์</h3>
                    <button
                        type="button"
                        class="flex justify-center items-center size-7 text-sm font-semibold rounded-full border border-transparent text-gray-800 hover:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none"
                        data-hs-overlay="#create-course-modal">
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
                    <div>คุณกำลังจะอัพโหลดไฟล์ไปที่ <span class="font-mono">{{ f_path }}</span></div>
                    <form>
                        <label for="small-file-input-banner" class="sr-only">อัพโหลดไฟล์</label>
                        <input
                            @change="onFileChangedBanner($event)"
                            type="file"
                            name="small-file-input-banner"
                            id="small-file-input-banner"
                            class="block w-full border border-gray-200 shadow-sm rounded-lg text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none file:bg-gray-50 file:border-0 file:me-4 file:py-2 file:px-4" />
                    </form>
                </div>
                <div class="flex justify-end items-center gap-x-2 py-3 px-4">
                    <button
                        type="button"
                        class="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
                        data-hs-overlay="#upload-material-modal">
                        ยกเลิก
                    </button>
                    <button
                        type="button"
                        @click="uploadFile()"
                        :disabled="!uploadMaterial || isFileUploading"
                        class="transition-color duration-200 ease-in-out py-2 px-3 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none">
                        อัพโหลด
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
