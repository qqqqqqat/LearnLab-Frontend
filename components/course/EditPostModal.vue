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
        const instance = HSOverlay.getInstance(editPost.value, true)
        if ('element' in instance) {
            instance.element.close()
        }
    }

    function c_openModal() {
        const instance = HSOverlay.getInstance(editPost.value, true)
        if ('element' in instance) {
            instance.element.open()
        }
    }

    defineExpose({ c_closeModal, c_openModal })
    const emit = defineEmits(['refreshPost'])

    function getRteText(text: string) {
        postContent.value = text
    }

    async function updatePost() {
        const updatePostToast = toast.loading('กำลังสร้างโพสต์')
        const payload = {
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
                toast.update(updatePostToast, {
                    type: 'success',
                    message: Pres?.message,
                })
            })
            .catch((Perr) => {
                toast.update(updatePostToast, {
                    type: 'error',
                    message: Perr?.data?.message,
                })
            })
    }
</script>
<template>
    <div
        id="edit-post-modal"
        ref="editPost"
        class="hs-overlay pointer-events-none fixed start-0 top-0 z-[80] hidden size-full overflow-y-auto overflow-x-hidden opacity-0 transition-all hs-overlay-open:opacity-100 hs-overlay-open:duration-500">
        <div
            class="m-3 opacity-0 transition-all hs-overlay-open:opacity-100 hs-overlay-open:duration-500 sm:mx-auto sm:w-full sm:max-w-screen-xl">
            <div
                class="pointer-events-auto flex flex-col rounded-md border bg-white shadow-sm">
                <div
                    class="flex items-center justify-between border-b px-4 py-3">
                    <h3 class="font-bold text-gray-800">แก้ไขโพสต์</h3>
                    <button
                        type="button"
                        class="flex size-7 items-center justify-center rounded-full border border-transparent text-sm font-semibold text-gray-800 hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-50"
                        data-hs-overlay="#edit-post-modal">
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
                                id="hs-floating-crs-name-edit"
                                v-model="postTitle"
                                type="text"
                                placeholder="หัวข้อโพสต์"
                                class="peer block w-full rounded-lg border-gray-200 p-4 text-sm placeholder:text-transparent autofill:pb-2 autofill:pt-6 focus:border-blue-500 focus:pb-2 focus:pt-6 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 [&:not(:placeholder-shown)]:pb-2 [&:not(:placeholder-shown)]:pt-6" />
                            <label
                                for="hs-floating-crs-name-edit"
                                class="pointer-events-none absolute start-0 top-0 h-full truncate border border-transparent p-4 text-sm transition duration-100 ease-in-out peer-focus:-translate-y-1.5 peer-focus:text-xs peer-focus:text-gray-500 peer-disabled:pointer-events-none peer-disabled:opacity-50 peer-[:not(:placeholder-shown)]:-translate-y-1.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-500">
                                หัวข้อโพสต์
                                <span class="text-red-600">*</span>
                            </label>
                        </div>
                        <!-- End Floating Input -->
                    </div>
                    <div>
                        <label>เนื้อหาของโพสต์</label>
                        <RichEditor
                            :content="props.p_content"
                            @send-text="getRteText" />
                    </div>
                </div>
                <div class="flex items-center justify-end gap-x-2 px-4 py-3">
                    <button
                        type="button"
                        class="inline-flex items-center gap-x-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50"
                        data-hs-overlay="#edit-post-modal">
                        ยกเลิก
                    </button>
                    <button
                        type="button"
                        class="transition-color inline-flex items-center gap-x-2 rounded-lg border border-transparent bg-blue-600 px-3 py-2 text-sm font-semibold text-white duration-200 ease-in-out hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50"
                        @click="
                            () => {
                                updatePost()
                            }
                        ">
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
        position: absolute;
        top: 0;
        left: 0;
        opacity: 0;
    }
</style>
