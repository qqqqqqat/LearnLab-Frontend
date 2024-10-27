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
    const folderName = ref('')
    const isFolderCreating = ref(false)

    const creteFolderlModal = ref()
    function c_closeModal() {
        const instance = HSOverlay.getInstance(creteFolderlModal.value, true)
        if ('element' in instance) {
            instance.element.close()
        }
    }

    function c_openModal() {
        const instance = HSOverlay.getInstance(creteFolderlModal.value, true)
        if ('element' in instance) {
            instance.element.open()
        }
    }

    async function uploadFile() {
        isFolderCreating.value = true
        const createFileToast = toast.loading('กำลังสร้างโฟลเดอร์')
        const formData = new FormData()
        formData.append('c_id', props.c_id.toString())
        formData.append('f_path', props.f_path)
        formData.append('f_name', folderName.value)
        formData.append('f_type', 'FOLDER')
        await $fetch<{ status: number; message: string }>('/api/file/', {
            method: 'POST',
            body: formData,
        })
            .then((res) => {
                c_closeModal()
                isFolderCreating.value = false
                folderName.value = ''
                emit('refreshFile')
                toast.update(createFileToast, {
                    type: 'success',
                    message: res?.message,
                })
            })
            .catch((err) => {
                isFolderCreating.value = false
                toast.update(createFileToast, {
                    type: 'error',
                    message: err?.data?.message,
                })
            })
    }

    const emit = defineEmits(['refreshFile'])
</script>
<template>
    <div
        id="create-folder-modal"
        ref="creteFolderlModal"
        class="hs-overlay pointer-events-none fixed start-0 top-0 z-[80] hidden size-full overflow-y-auto overflow-x-hidden opacity-0 transition-all hs-overlay-open:opacity-100 hs-overlay-open:duration-500">
        <div
            class="m-3 opacity-0 transition-all hs-overlay-open:opacity-100 hs-overlay-open:duration-500 sm:mx-auto sm:w-full sm:max-w-lg">
            <div
                class="pointer-events-auto flex flex-col rounded-md border bg-white shadow-sm">
                <div
                    class="flex items-center justify-between border-b px-4 py-3">
                    <h3 class="font-bold text-gray-800">สร้างโฟลเดอร์</h3>
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
                        คุณกำลังจะสร้างโฟลเดอร์ใหม่ที่
                        <span class="font-mono">{{ f_path }}</span>
                    </div>
                    <div class="relative">
                        <input
                            id="hs-floating-input-text-course"
                            v-model="folderName"
                            type="text"
                            class="disabled:pointer-events-non peer block w-full rounded-lg border-gray-200 p-4 text-sm placeholder:text-transparent autofill:pb-2 autofill:pt-6 focus:border-blue-500 focus:pb-2 focus:pt-6 focus:ring-blue-500 disabled:opacity-50 [&:not(:placeholder-shown)]:pb-2 [&:not(:placeholder-shown)]:pt-6"
                            placeholder="LearnLab Course-course" />
                        <label
                            for="hs-floating-input-text"
                            class="pointer-events-none absolute start-0 top-0 h-full truncate border border-transparent p-4 text-sm transition duration-100 ease-in-out peer-focus:-translate-y-1.5 peer-focus:text-xs peer-focus:text-gray-500 peer-disabled:pointer-events-none peer-disabled:opacity-50 peer-[:not(:placeholder-shown)]:-translate-y-1.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-500">
                            ชื่อโฟลเดอร์
                            <span class="text-red-600">*</span>
                        </label>
                    </div>
                </div>
                <div class="flex items-center justify-end gap-x-2 px-4 py-3">
                    <button
                        type="button"
                        class="inline-flex items-center gap-x-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50"
                        data-hs-overlay="#create-folder-modal">
                        ยกเลิก
                    </button>
                    <button
                        type="button"
                        :disabled="!folderName || isFolderCreating"
                        class="transition-color inline-flex items-center gap-x-2 rounded-lg border border-transparent bg-blue-600 px-3 py-2 text-sm font-semibold text-white duration-200 ease-in-out hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50"
                        @click="uploadFile()">
                        สร้าง
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
