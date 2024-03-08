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
    const postType = ref<{ title: string; type: 'ANNOUNCEMENT' | 'ASSIGNMENT' | 'QUIZ' }>({ title: 'เลือกประเภท', type: 'ANNOUNCEMENT' })
    const uploadFiles = ref<{ name: string; file: File }[]>([])

    const inputFile = ref()
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


    function getRteText(text: string) {
        postContent.value = text
    }

    async function uploadPost(postFile: number[]) {
        const createPostFileToast = toast.loading('กำลังสร้างโพสต์')
        let payload = {
            c_id: props.c_id,
            p_title: postTitle.value,
            p_type: postType.value.type,
            p_content: postContent.value,
            p_item_list: { files: [], assignments: [], quizzes: [] }
        }
        if (postShowTime.value) Object.assign(payload, { p_show_time: new Date(postShowTime.value).toUTCString() })
        if (postFile.length > 0) Object.assign(payload, { p_item_list: { files: postFile, assignments: [], quizzes: [] } })
        await $fetch<{ message: string }>('/api/post/', {
            method: 'PUT',
            body: payload,
        })
            .then((Pres) => {
                toast.update(createPostFileToast, { type: 'success', message: Pres?.message })
                c_closeModal()
                emit('refreshPost')
            })
            .catch((Perr) => {
                toast.update(createPostFileToast, { type: 'error', message: Perr?.data?.message })
            })
    }

    async function uploadFile() {
        if (!uploadFiles.value.length) {
            return
        }
        const uploadPostFileToast = toast.loading('กำลังอัพโหลดไฟล์แนบ')
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
                await uploadPost(res.f_id);
            })
            .catch((err) => {
                toast.update(uploadPostFileToast, { type: 'error', message: err?.data?.message })
            })
    }

    function onFileChangedMat($event: Event) {
        const target = $event.target as HTMLInputElement
        if (target && target.files) {
            uploadFiles.value.push({ name: target.files[0].name, file: target.files[0] })
        }
    }
</script>
<template>
    <div
        ref="createCourseModal"
        id="create-post-modal"
        class="hs-overlay hs-overlay-open:opacity-100 hs-overlay-open:duration-500 hidden size-full fixed top-0 start-0 z-[80] opacity-0 overflow-x-hidden transition-all overflow-y-auto pointer-events-none">
        <div class="hs-overlay-open:opacity-100 hs-overlay-open:duration-500 opacity-0 transition-all sm:max-w-screen-xl sm:w-full m-3 sm:mx-auto">
            <div class="flex flex-col bg-white border shadow-sm rounded-md pointer-events-auto">
                <div class="flex justify-between items-center py-3 px-4 border-b">
                    <h3 class="font-bold text-gray-800">สร้างโพสต์ใหม่</h3>
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
                    <div class="flex md:flex-row flex-col gap-4">
                        <!-- Floating Input -->
                        <div class="relative flex-grow">
                            <input
                                type="text"
                                v-model="postTitle"
                                id="hs-floating-crs-name"
                                placeholder="หัวข้อโพสต์"
                                class="peer p-4 block w-full border-gray-200 rounded-lg text-sm placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none focus:pt-6 focus:pb-2 [&:not(:placeholder-shown)]:pt-6 [&:not(:placeholder-shown)]:pb-2 autofill:pt-6 autofill:pb-2" />
                            <label
                                for="hs-floating-crs-name"
                                class="absolute top-0 start-0 p-4 h-full text-sm truncate pointer-events-none transition ease-in-out duration-100 border border-transparent peer-disabled:opacity-50 peer-disabled:pointer-events-none peer-focus:text-xs peer-focus:-translate-y-1.5 peer-focus:text-gray-500 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-translate-y-1.5 peer-[:not(:placeholder-shown)]:text-gray-500">
                                หัวข้อโพสต์
                                <span class="text-red-600">*</span>
                            </label>
                        </div>
                        <!-- End Floating Input -->

                        <div class="hs-dropdown relative inline-flex">
                            <button
                                id="hs-select-post-type-dropdown"
                                type="button"
                                class="hs-dropdown-toggle py-3 px-4 inline-flex justify-between w-48 items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none">
                                {{ postType.title }}
                                <svg
                                    class="hs-dropdown-open:rotate-180 size-4"
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round">
                                    <path d="m6 9 6 6 6-6" />
                                </svg>
                            </button>
                            <div
                                class="hs-dropdown-menu transition-[opacity,margin] z-[20] duration hs-dropdown-open:opacity-100 opacity-0 hidden min-w-60 bg-white shadow-md rounded-lg p-2 mt-2 after:h-4 after:absolute after:-bottom-4 after:start-0 after:w-full before:h-4 before:absolute before:-top-4 before:start-0 before:w-full"
                                aria-labelledby="hs-select-post-type-dropdown">
                                <a
                                    class="flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 cursor-pointer"
                                    @click="postType = { title: 'ประกาศ', type: 'ANNOUNCEMENT' }">
                                    ประกาศ (Announcement)
                                </a>
                                <a
                                    class="flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 cursor-pointer"
                                    @click="postType = { title: 'งานมอบหมาย', type: 'ASSIGNMENT' }">
                                    งานมอบหมาย (Assignment)
                                </a>
                                <a
                                    class="flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 cursor-pointer"
                                    @click="postType = { title: 'แบบทดสอบ', type: 'QUIZ' }">
                                    แบบทดสอบ (Quiz)
                                </a>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label>เนื้อหาของโพสต์</label>
                        <RichEditor @send-text="getRteText" />
                    </div>
                    <div class="flex flex-col">
                        <!-- Floating Input -->
                        <div class="relative flex-grow">
                            <input
                                type="datetime-local"
                                v-model="postShowTime"
                                id="hs-floating-crs-name"
                                placeholder="หัวข้อโพสต์"
                                class="peer p-4 block w-full border-gray-200 rounded-lg text-sm placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none focus:pt-6 focus:pb-2 [&:not(:placeholder-shown)]:pt-6 [&:not(:placeholder-shown)]:pb-2 autofill:pt-6 autofill:pb-2" />
                            <label
                                for="hs-floating-crs-name"
                                class="absolute top-0 start-0 p-4 h-full text-sm truncate pointer-events-none transition ease-in-out duration-100 border border-transparent peer-disabled:opacity-50 peer-disabled:pointer-events-none peer-focus:text-xs peer-focus:-translate-y-1.5 peer-focus:text-gray-500 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-translate-y-1.5 peer-[:not(:placeholder-shown)]:text-gray-500">
                                เวลาแสดงโพสต์
                            </label>
                        </div>
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
                                <div v-for="(file, index) in uploadFiles" :key="index + file.name" class="flex gap-2 justify-between items-center px-2 py-1.5 rounded-md bg-blue-100 text-blue-600">
                                    <div class="flex flex-row flex-nowrap items-center gap-2 w-full overflow-hidden">
                                        <span class="material-icons-outlined select-none">insert_drive_file</span>
                                        <span class="md:w-24 w-full text-xs whitespace-nowrap text-ellipsis overflow-hidden">{{ file.name }}</span>
                                    </div>
                                    <span
                                        class="material-icons-outlined select-none cursor-pointer text-red-500"
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
                <div class="flex justify-end items-center gap-x-2 py-3 px-4">
                    <button
                        type="button"
                        class="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
                        data-hs-overlay="#create-post-modal">
                        ยกเลิก
                    </button>
                    <button
                        @click="() => {
                            if (uploadFiles.length) {
                                uploadFile()
                            } else {
                                uploadPost([])
                            }
                        }"
                        type="button"
                        class="transition-color duration-200 ease-in-out py-2 px-3 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none">
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
        opacity: 0;
    }
</style>
