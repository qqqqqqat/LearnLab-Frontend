<script setup lang="ts">
    import HSOverlay from '@preline/overlay'
    import { toast } from '@steveyuowo/vue-hot-toast'

    const props = defineProps({
        c_id: {
            type: Number,
            required: true,
        },
        f_path: {
            type: String,
            required: true,
        },
    })
    defineExpose({ c_closeModal, c_openModal })
    const uploadMaterial = ref()
    const isFileUploading = ref(false)

    const uploadMaterialModal = ref()
    function c_closeModal() {
        const instance = HSOverlay.getInstance(uploadMaterialModal.value, true)
        if ('element' in instance) {
            instance.element.close()
        }
    }

    function c_openModal() {
        const instance = HSOverlay.getInstance(uploadMaterialModal.value, true)
        if ('element' in instance) {
            instance.element.open()
        }
    }

    async function uploadFile() {
        isFileUploading.value = true
        const createFileToast = toast.loading('กำลังอัพโหลดไฟล์')
        const formData = new FormData()
        formData.append('c_id', props.c_id.toString())
        formData.append('f_path', props.f_path)
        formData.append('f_type', 'FILE')
        formData.append('f_data', uploadMaterial.value)
        await $fetch<{ message: string; status: number }>('/api/file/', {
            method: 'POST',
            body: formData,
        })
            .then((res) => {
                c_closeModal()
                emit('refreshFile')
                isFileUploading.value = false
                uploadMaterial.value = undefined
                toast.update(createFileToast, {
                    type: 'success',
                    message: res?.message,
                })
            })
            .catch((err) => {
                isFileUploading.value = false
                toast.update(createFileToast, {
                    type: 'error',
                    message: err?.data?.message,
                })
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
        id="upload-material-modal"
        ref="uploadMaterialModal"
        class="hs-overlay pointer-events-none fixed start-0 top-0 z-[80] hidden size-full overflow-y-auto overflow-x-hidden opacity-0 transition-all hs-overlay-open:opacity-100 hs-overlay-open:duration-500">
        <div
            class="m-3 opacity-0 transition-all hs-overlay-open:opacity-100 hs-overlay-open:duration-500 sm:mx-auto sm:w-full sm:max-w-lg">
            <div
                class="pointer-events-auto flex flex-col rounded-md border bg-white shadow-sm">
                <div
                    class="flex items-center justify-between border-b px-4 py-3">
                    <h3 class="font-bold text-gray-800">อัพโหลดไฟล์</h3>
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
                <div class="flex flex-col gap-4 p-6">
                    <div>
                        คุณกำลังจะอัพโหลดไฟล์ไปที่
                        <span class="font-mono">{{ f_path }}</span>
                    </div>
                    <form>
                        <label for="small-file-input-banner" class="sr-only">
                            อัพโหลดไฟล์
                        </label>
                        <input
                            id="small-file-input-banner"
                            type="file"
                            name="small-file-input-banner"
                            class="block w-full rounded-lg border border-gray-200 text-sm shadow-sm file:me-4 file:border-0 file:bg-gray-50 file:px-4 file:py-2 focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50"
                            @change="onFileChangedBanner($event)" />
                    </form>
                </div>
                <div class="flex items-center justify-end gap-x-2 px-4 py-3">
                    <button
                        type="button"
                        class="inline-flex items-center gap-x-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50"
                        data-hs-overlay="#upload-material-modal">
                        ยกเลิก
                    </button>
                    <button
                        type="button"
                        :disabled="!uploadMaterial || isFileUploading"
                        class="transition-color inline-flex items-center gap-x-2 rounded-lg border border-transparent bg-blue-600 px-3 py-2 text-sm font-semibold text-white duration-200 ease-in-out hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50"
                        @click="uploadFile()">
                        อัพโหลด
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
