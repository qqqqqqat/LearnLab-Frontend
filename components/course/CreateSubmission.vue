<script setup lang="ts">
    import HSOverlay from '@preline/overlay'
    import { toast } from '@steveyuowo/vue-hot-toast'
    const props = defineProps({
        c_id: {
            type: String,
            required: true,
        },
        a_id: {
            type: Number,
            required: true,
        },
    })
    const createSubmission = ref()
    const postContent = ref<string>('')
    const submitFiles = ref<{ name: string; file: File }[]>([])
    const inputFile = ref()

    function c_closeModal() {
        const instance = HSOverlay.getInstance(createSubmission.value, true)
        if ('element' in instance) {
            instance.element.close()
        }
    }

    function c_openModal() {
        const instance = HSOverlay.getInstance(createSubmission.value, true)
        if ('element' in instance) {
            instance.element.open()
        }
    }

    defineExpose({ c_closeModal, c_openModal })
    const emit = defineEmits(['refreshAssignment'])

    function getRteText(text: string) {
        postContent.value = text
    }
    async function makeSubmission(postFile: number[]) {
        const createSubmissionToast = toast.loading('กำลังสร้างโพสต์')
        let payload = {
            p_id: props.p_id,
            s_content: { files: [], text: '' },
        }
        if (postFile.length > 0)
            Object.assign(payload.s_content, { files: postFile })
        if (postContent.value)
            Object.assign(payload.s_content, { text: postContent.value })
        await $fetch<{ message: string }>('/api/post/', {
            method: 'PUT',
            body: payload,
        })
            .then((Pres) => {
                c_closeModal()
                emit('refreshAssignment')
                toast.update(createSubmissionToast, {
                    type: 'success',
                    message: Pres?.message,
                })
            })
            .catch((Perr) => {
                toast.update(createSubmissionToast, {
                    type: 'error',
                    message: Perr?.data?.message,
                })
            })
    }

    async function submitFile() {
        if (!submitFiles.value.length) {
            return
        }
        const uploadSubmitFileToast = toast.loading('กำลังอัพโหลดไฟล์แนบ')
        const formData = new FormData()
        formData.append('c_id', props.c_id)
        for (let x = 0; x < submitFiles.value.length; x++) {
            formData.append('f_data[]', submitFiles.value[x].file)
        }
        await $fetch<{ f_id: number[]; message: string }>('/api/file/post/', {
            method: 'POST',
            body: formData,
        })
            .then(async (res) => {
                await makeSubmission(res.f_id)
            })
            .catch((err) => {
                toast.update(uploadSubmitFileToast, {
                    type: 'error',
                    message: err?.data?.message,
                })
            })
    }
    function onFileChangedMat($event: Event) {
        const target = $event.target as HTMLInputElement
        if (target && target.files) {
            submitFiles.value.push({
                name: target.files[0].name,
                file: target.files[0],
            })
        }
    }
</script>
<template>
    <div
        ref="createSubmission"
        id="create-submission-modal"
        class="hs-overlay pointer-events-none fixed start-0 top-0 z-[80] hidden size-full overflow-y-auto overflow-x-hidden opacity-0 transition-all hs-overlay-open:opacity-100 hs-overlay-open:duration-500">
        <div
            class="m-3 opacity-0 transition-all hs-overlay-open:opacity-100 hs-overlay-open:duration-500 sm:mx-auto sm:w-full sm:max-w-screen-xl">
            <div
                class="pointer-events-auto flex flex-col rounded-md border bg-white shadow-sm">
                <div
                    class="flex items-center justify-between border-b px-4 py-3">
                    <h3 class="font-bold text-gray-800">สร้างโพสต์ใหม่</h3>
                    <button
                        type="button"
                        class="flex size-7 items-center justify-center rounded-full border border-transparent text-sm font-semibold text-gray-800 hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-50"
                        data-hs-overlay="#create-submission-modal">
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
                    <div>
                        <label>เนื้อหาของโพสต์</label>
                        <RichEditor @send-text="getRteText" />
                    </div>
                    <div
                        class="flex w-full flex-col gap-2 md:flex-row md:flex-nowrap">
                        <input
                            @change="onFileChangedMat"
                            ref="inputFile"
                            type="file"
                            hidden />
                        <!-- End Floating Input -->
                        <div>
                            <button
                                @click="inputFile.click()"
                                type="button"
                                class="transition-color inline-flex items-center gap-x-2 rounded-lg border border-transparent bg-blue-600 px-3 py-2 text-sm font-semibold text-white duration-200 ease-in-out hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50">
                                <span class="material-icons-outlined">
                                    upload_file
                                </span>
                                เพิ่มไฟล์แนบ
                            </button>
                        </div>
                        <div
                            class="flex flex-col gap-x-4 gap-y-2 overflow-auto md:flex-row">
                            <TransitionGroup name="fade">
                                <div
                                    v-for="(file, index) in submitFiles"
                                    :key="index + file.name"
                                    class="flex items-center justify-between gap-2 rounded-md bg-blue-100 px-2 py-1.5 text-blue-600">
                                    <div
                                        class="flex w-full flex-row flex-nowrap items-center gap-2 overflow-hidden">
                                        <span
                                            class="material-icons-outlined select-none">
                                            insert_drive_file
                                        </span>
                                        <span
                                            class="w-full overflow-hidden text-ellipsis whitespace-nowrap text-xs md:w-24">
                                            {{ file.name }}
                                        </span>
                                    </div>
                                    <span
                                        class="material-icons-outlined cursor-pointer select-none text-red-500"
                                        @click="
                                            () => {
                                                if (index > -1) {
                                                    submitFiles.splice(index, 1)
                                                }
                                            }
                                        ">
                                        delete
                                    </span>
                                </div>
                            </TransitionGroup>
                        </div>
                    </div>
                </div>
                <div class="flex items-center justify-end gap-x-2 px-4 py-3">
                    <button
                        type="button"
                        class="inline-flex items-center gap-x-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50"
                        data-hs-overlay="#create-submission-modal">
                        ยกเลิก
                    </button>
                    <button
                        @click="
                            () => {
                                if (submitFiles.length) {
                                    submitFile()
                                } else {
                                    makeSubmission([])
                                }
                            }
                        "
                        type="button"
                        class="transition-color inline-flex items-center gap-x-2 rounded-lg border border-transparent bg-blue-600 px-3 py-2 text-sm font-semibold text-white duration-200 ease-in-out hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50">
                        สร้าง
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
