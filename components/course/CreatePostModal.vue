<script setup lang="ts">
    import HSOverlay from '@preline/overlay'
    import { toast } from '@steveyuowo/vue-hot-toast'

    const props = defineProps({
        c_id: {
            type: String,
            required: true,
        },
        p_id: {
            type: Number,
            required: false,
        },
    })

    const postTitle = ref<string>('')
    const postContent = ref<string>('')
    const postShowTime = ref<string>('')
    const postAssignID = ref<string>('')
    const postQuizID = ref<string>('')
    const postType = ref<{
        title: string
        type: 'ANNOUNCEMENT' | 'ASSIGNMENT' | 'QUIZ'
    }>({ title: 'เลือกประเภท', type: 'ANNOUNCEMENT' })
    const uploadFiles = ref<{ name: string; file: File }[]>([])

    const inputFile = ref()
    const createCourseModal = ref()
    function c_closeModal() {
        const instance = HSOverlay.getInstance(createCourseModal.value, true)
        if ('element' in instance) {
            instance.element.close()
        }
    }

    function c_openModal() {
        const instance = HSOverlay.getInstance(createCourseModal.value, true)
        if ('element' in instance) {
            instance.element.open()
        }
    }

    defineExpose({ c_closeModal, c_openModal })
    const emit = defineEmits(['refreshPost'])

    function getRteText(text: string) {
        postContent.value = text
    }

    async function uploadPost(postFile: number[]) {
        const uploadToast = toast.loading('กำลังสร้างโพสต์')
        if (postAssignID.value.slice(-1) === ',') {
            postAssignID.value = postAssignID.value.slice(0, -1)
        }

        if (postQuizID.value.slice(-1) === ',') {
            postQuizID.value = postQuizID.value.slice(0, -1)
        }
        const payload = {
            c_id: props.c_id,
            p_title: postTitle.value,
            p_type: postType.value.type,
            p_content: postContent.value,
            p_item_list: { files: [], assignments: [], quizzes: [] },
        }
        if (postShowTime.value)
            Object.assign(payload, {
                p_show_time: new Date(postShowTime.value).toUTCString(),
            })

        if (postFile.length > 0) {
            Object.assign(payload, {
                p_item_list: {
                    files: postFile,
                    assignments: JSON.parse(`[${postAssignID.value}]`),
                    quizzes: JSON.parse(`[${postQuizID.value}]`),
                },
            })
        } else {
            Object.assign(payload, {
                p_item_list: {
                    files: [],
                    assignments: JSON.parse(`[${postAssignID.value}]`),
                    quizzes: JSON.parse(`[${postQuizID.value}]`),
                },
            })
        }

        await $fetch<{ message: string }>('/api/post/', {
            method: 'PUT',
            body: payload,
        })
            .then((Pres) => {
                c_closeModal()
                emit('refreshPost')
                postTitle.value = ''
                postContent.value = ''
                postShowTime.value = ''
                postAssignID.value = ''
                postQuizID.value = ''
                uploadFiles.value = []
                toast.update(uploadToast, {
                    type: 'success',
                    message: Pres?.message,
                })
            })
            .catch((Perr) => {
                toast.update(uploadToast, {
                    type: 'error',
                    message: Perr?.data?.message,
                })
            })
    }

    async function uploadFile() {
        if (!uploadFiles.value.length) {
            return
        }
        toast.loading('กำลังอัพโหลดไฟล์แนบ')
        const formData = new FormData()
        formData.append('c_id', props.c_id)
        for (let x = 0; x < uploadFiles.value.length; x++) {
            formData.append('f_data[]', uploadFiles.value[x].file)
        }
        await $fetch<{ f_id: number[]; message: string }>('/api/file/post/', {
            method: 'POST',
            body: formData,
        })
            .then(async (res) => {
                await uploadPost(res.f_id)
                toast.success(res?.message)
            })
            .catch((err) => {
                toast.error(err?.data?.message)
            })
    }

    function onFileChangedMat($event: Event) {
        const target = $event.target as HTMLInputElement
        if (target && target.files) {
            uploadFiles.value.push({
                name: target.files[0].name,
                file: target.files[0],
            })
        }
    }
    function onlyNumbersAndComma(event: KeyboardEvent) {
        const input = event.target as HTMLInputElement // Type assertion
        const key = event.key

        // Check for allowed characters (numbers, comma, backspace, delete, arrow keys, etc.)
        const allowedKeys =
            /[0-9,]|Backspace|Delete|ArrowLeft|ArrowRight|ArrowUp|ArrowDown|Home|End|Tab/
        if (!allowedKeys.test(key)) {
            event.preventDefault()
            return
        }

        // Prevent leading comma
        if (key === ',' && input.value === '') {
            event.preventDefault()
            return
        }

        // Prevent multiple commas in a row and other invalid comma placements
        if (key === ',') {
            const lastChar = input.value.slice(-1)
            if (lastChar === ',') {
                event.preventDefault()
                return
            }
        }
    }
</script>
<template>
    <div
        id="create-post-modal"
        ref="createCourseModal"
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
                        data-hs-overlay="#create-post-modal">
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
                    <div class="flex flex-col gap-4 md:flex-row">
                        <!-- Floating Input -->
                        <div class="relative flex-grow">
                            <input
                                id="hs-floating-crs-name"
                                v-model="postTitle"
                                type="text"
                                placeholder="หัวข้อโพสต์"
                                class="peer block w-full rounded-lg border-gray-200 p-4 text-sm placeholder:text-transparent autofill:pb-2 autofill:pt-6 focus:border-blue-500 focus:pb-2 focus:pt-6 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 [&:not(:placeholder-shown)]:pb-2 [&:not(:placeholder-shown)]:pt-6" />
                            <label
                                for="hs-floating-crs-name"
                                class="pointer-events-none absolute start-0 top-0 h-full truncate border border-transparent p-4 text-sm transition duration-100 ease-in-out peer-focus:-translate-y-1.5 peer-focus:text-xs peer-focus:text-gray-500 peer-disabled:pointer-events-none peer-disabled:opacity-50 peer-[:not(:placeholder-shown)]:-translate-y-1.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-500">
                                หัวข้อโพสต์
                                <span class="text-red-600">*</span>
                            </label>
                        </div>
                        <!-- End Floating Input -->
                    </div>
                    <div>
                        <label>เนื้อหาของโพสต์</label>
                        <RichEditor @send-text="getRteText" />
                    </div>
                    <div class="flex flex-col">
                        <!-- Floating Input -->
                    </div>
                    <!-- Floating Input -->
                    <div class="relative flex-grow">
                        <input
                            id="hs-floating-crs-ass-att"
                            v-model="postAssignID"
                            type="text"
                            placeholder="ID ของ Assignment ขั้นด้วย Comma (,)"
                            class="peer block w-full rounded-lg border-gray-200 p-4 text-sm placeholder:text-transparent autofill:pb-2 autofill:pt-6 focus:border-blue-500 focus:pb-2 focus:pt-6 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 [&:not(:placeholder-shown)]:pb-2 [&:not(:placeholder-shown)]:pt-6"
                            @keypress="onlyNumbersAndComma" />
                        <label
                            for="hs-floating-crs-ass-att"
                            class="pointer-events-none absolute start-0 top-0 h-full truncate border border-transparent p-4 text-sm transition duration-100 ease-in-out peer-focus:-translate-y-1.5 peer-focus:text-xs peer-focus:text-gray-500 peer-disabled:pointer-events-none peer-disabled:opacity-50 peer-[:not(:placeholder-shown)]:-translate-y-1.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-500">
                            ID ของ Assignment
                        </label>
                    </div>
                    <!-- End Floating Input -->
                    <!-- Floating Input -->
                    <div class="relative flex-grow">
                        <input
                            id="hs-floating-crs-quiz-att"
                            v-model="postQuizID"
                            type="text"
                            placeholder="ID ของ Quiz ขั้นด้วย Comma (,)"
                            class="peer block w-full rounded-lg border-gray-200 p-4 text-sm placeholder:text-transparent autofill:pb-2 autofill:pt-6 focus:border-blue-500 focus:pb-2 focus:pt-6 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 [&:not(:placeholder-shown)]:pb-2 [&:not(:placeholder-shown)]:pt-6"
                            @keypress="onlyNumbersAndComma" />
                        <label
                            for="hs-floating-crs-quiz-att"
                            class="pointer-events-none absolute start-0 top-0 h-full truncate border border-transparent p-4 text-sm transition duration-100 ease-in-out peer-focus:-translate-y-1.5 peer-focus:text-xs peer-focus:text-gray-500 peer-disabled:pointer-events-none peer-disabled:opacity-50 peer-[:not(:placeholder-shown)]:-translate-y-1.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-500">
                            ID ของ Quiz
                        </label>
                    </div>
                    <!-- End Floating Input -->
                    <div
                        class="flex w-full flex-col gap-2 md:flex-row md:flex-nowrap">
                        <input
                            ref="inputFile"
                            type="file"
                            hidden
                            @change="onFileChangedMat" />
                        <!-- End Floating Input -->
                        <div>
                            <button
                                type="button"
                                class="transition-color inline-flex items-center gap-x-2 rounded-lg border border-transparent bg-blue-600 px-3 py-2 text-sm font-semibold text-white duration-200 ease-in-out hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50"
                                @click="inputFile.click()">
                                <span
                                    class="material-icons-outlined size-6 overflow-hidden select-none">
                                    upload_file
                                </span>
                                เพิ่มไฟล์แนบ
                            </button>
                        </div>
                        <div
                            class="flex flex-col gap-x-4 gap-y-2 overflow-auto md:flex-row">
                            <TransitionGroup name="fade">
                                <div
                                    v-for="(file, index) in uploadFiles"
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
                                                    uploadFiles.splice(index, 1)
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
                        data-hs-overlay="#create-post-modal">
                        ยกเลิก
                    </button>
                    <button
                        type="button"
                        class="transition-color inline-flex items-center gap-x-2 rounded-lg border border-transparent bg-blue-600 px-3 py-2 text-sm font-semibold text-white duration-200 ease-in-out hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50"
                        @click="
                            () => {
                                if (uploadFiles.length) {
                                    uploadFile()
                                } else {
                                    uploadPost([])
                                }
                            }
                        ">
                        สร้าง
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
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

.fade-enter-active,
.fade-leave-active {
    height: inherit;
    transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
    position: absolute;
    top: 0;
    left: 0;
    opacity: 0;
}
</style>
