<script setup lang="ts">
    import HSOverlay from '@preline/overlay'
    import { toast } from '@steveyuowo/vue-hot-toast'

    const props = defineProps({
        p_id: {
            type: Number,
            required: true,
        },
        p_title: {
            type: String,
            required: true,
        },
        p_content: {
            type: String,
            required: true,
        },
        c_id: {
            type: String,
            required: true,
        },
    })

    const postTitle = ref<string>('')
    const postContent = ref<string>('')

    const editPost = ref()

    watch(
        () => props.p_title,
        () => {
            postTitle.value = props.p_title
        }
    )
    watch(
        () => props.p_content,
        () => {
            postContent.value = props.p_content
        }
    )
    function c_closeModal() {
        const { element } = HSOverlay.getInstance(editPost.value, true)
        element.close()
    }

    function c_openModal() {
        const { element } = HSOverlay.getInstance(editPost.value, true)
        element.open()
    }

    defineExpose({ c_closeModal, c_openModal })
    const emit = defineEmits(['refreshPost'])

    function getRteText(text: string) {
        postContent.value = text
    }

    async function updatePost() {
        const updatePostToast = toast.loading('กำลังสร้างโพสต์')
        let payload = {
            c_id: props.c_id,
            p_id: props.p_id,
            p_title: postTitle.value,
            p_content: postContent.value,
        }

        await $fetch<{ message: string }>('/api/post/', {
            method: 'POST',
            body: payload,
        })
            .then((Pres) => {
                c_closeModal()
                emit('refreshPost')
                toast.update(updatePostToast, { type: 'success', message: Pres?.message })
            })
            .catch((Perr) => {
                toast.update(updatePostToast, { type: 'error', message: Perr?.data?.message })
            })
    }
</script>
<template>
    <div
        ref="editPost"
        id="edit-post-modal"
        class="hs-overlay hs-overlay-open:opacity-100 hs-overlay-open:duration-500 hidden size-full fixed top-0 start-0 z-[80] opacity-0 overflow-x-hidden transition-all overflow-y-auto pointer-events-none">
        <div class="hs-overlay-open:opacity-100 hs-overlay-open:duration-500 opacity-0 transition-all sm:max-w-screen-xl sm:w-full m-3 sm:mx-auto">
            <div class="flex flex-col bg-white border shadow-sm rounded-md pointer-events-auto">
                <div class="flex justify-between items-center py-3 px-4 border-b">
                    <h3 class="font-bold text-gray-800">แก้ไขโพสต์</h3>
                    <button
                        type="button"
                        class="flex justify-center items-center size-7 text-sm font-semibold rounded-full border border-transparent text-gray-800 hover:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none"
                        data-hs-overlay="#edit-post-modal">
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
                                id="hs-floating-crs-name-edit"
                                placeholder="หัวข้อโพสต์"
                                class="peer p-4 block w-full border-gray-200 rounded-lg text-sm placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none focus:pt-6 focus:pb-2 [&:not(:placeholder-shown)]:pt-6 [&:not(:placeholder-shown)]:pb-2 autofill:pt-6 autofill:pb-2" />
                            <label
                                for="hs-floating-crs-name-edit"
                                class="absolute top-0 start-0 p-4 h-full text-sm truncate pointer-events-none transition ease-in-out duration-100 border border-transparent peer-disabled:opacity-50 peer-disabled:pointer-events-none peer-focus:text-xs peer-focus:-translate-y-1.5 peer-focus:text-gray-500 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-translate-y-1.5 peer-[:not(:placeholder-shown)]:text-gray-500">
                                หัวข้อโพสต์
                                <span class="text-red-600">*</span>
                            </label>
                        </div>
                        <!-- End Floating Input -->
                    </div>
                    <div>
                        <label>เนื้อหาของโพสต์</label>
                        <RichEditor :content="props.p_content" @send-text="getRteText" />
                    </div>
                </div>
                <div class="flex justify-end items-center gap-x-2 py-3 px-4">
                    <button
                        type="button"
                        class="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
                        data-hs-overlay="#edit-post-modal">
                        ยกเลิก
                    </button>
                    <button
                        @click="
                            () => {
                                updatePost()
                            }
                        "
                        type="button"
                        class="transition-color duration-200 ease-in-out py-2 px-3 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none">
                        แก้ไข
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
