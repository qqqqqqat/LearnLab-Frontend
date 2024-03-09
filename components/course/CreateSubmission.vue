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
        const { element } = HSOverlay.getInstance(createSubmission.value, true)
        element.close()
    }

    function c_openModal() {
        const { element } = HSOverlay.getInstance(createSubmission.value, true)
        element.open()
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
            s_content: { files: [], text: "" }
        }
        if (postFile.length > 0) Object.assign(payload.s_content, {files: postFile})
        if (postContent.value) Object.assign(payload.s_content, {text: postContent.value})
        await $fetch<{ message: string }>('/api/post/', {
            method: 'PUT',
            body: payload,
        })
            .then((Pres) => {
                toast.update(createSubmissionToast, { type: 'success', message: Pres?.message })
                c_closeModal()
                emit('refreshAssignment')
            })
            .catch((Perr) => {
                toast.update(createSubmissionToast, { type: 'error', message: Perr?.data?.message })
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
                toast.update(uploadSubmitFileToast, { type: 'error', message: err?.data?.message })
            })
    }
    function onFileChangedMat($event: Event) {
        const target = $event.target as HTMLInputElement
        if (target && target.files) {
            submitFiles.value.push({ name: target.files[0].name, file: target.files[0] })
        }
    }
</script>
<template>
    <div
        ref="createSubmission"
        id="create-submission-modal"
        class="hs-overlay hs-overlay-open:opacity-100 hs-overlay-open:duration-500 hidden size-full fixed top-0 start-0 z-[80] opacity-0 overflow-x-hidden transition-all overflow-y-auto pointer-events-none">
        <div class="hs-overlay-open:opacity-100 hs-overlay-open:duration-500 opacity-0 transition-all sm:max-w-screen-xl sm:w-full m-3 sm:mx-auto">
            <div class="flex flex-col bg-white border shadow-sm rounded-md pointer-events-auto">
                <div class="flex justify-between items-center py-3 px-4 border-b">
                    <h3 class="font-bold text-gray-800">สร้างโพสต์ใหม่</h3>
                    <button
                        type="button"
                        class="flex justify-center items-center size-7 text-sm font-semibold rounded-full border border-transparent text-gray-800 hover:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none"
                        data-hs-overlay="#create-submission-modal">
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
                    <div>
                        <label>เนื้อหาของโพสต์</label>
                        <RichEditor @send-text="getRteText" />
                    </div>
                    <div class="flex md:flex-row md:flex-nowrap flex-col gap-2 w-full">
                        <input @change="onFileChangedMat" ref="inputFile" type="file" hidden />
                        <!-- End Floating Input -->
                        <div>
                            <button
                                @click="inputFile.click()"
                                type="button"
                                class="transition-color duration-200 ease-in-out py-2 px-3 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none">
                                <span class="material-icons-outlined">upload_file</span>
                                เพิ่มไฟล์แนบ
                            </button>
                        </div>
                        <div class="flex md:flex-row flex-col overflow-auto gap-x-4 gap-y-2">
                            <TransitionGroup name="fade">
                                <div v-for="(file, index) in submitFiles" :key="index + file.name" class="flex gap-2 justify-between items-center px-2 py-1.5 rounded-md bg-blue-100 text-blue-600">
                                    <div class="flex flex-row flex-nowrap items-center gap-2 w-full overflow-hidden">
                                        <span class="material-icons-outlined select-none">insert_drive_file</span>
                                        <span class="md:w-24 w-full text-xs whitespace-nowrap text-ellipsis overflow-hidden">{{ file.name }}</span>
                                    </div>
                                    <span
                                        class="material-icons-outlined select-none cursor-pointer text-red-500"
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
                <div class="flex justify-end items-center gap-x-2 py-3 px-4">
                    <button
                        type="button"
                        class="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
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
                        class="transition-color duration-200 ease-in-out py-2 px-3 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none">
                        สร้าง
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
