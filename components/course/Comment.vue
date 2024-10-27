<script setup lang="ts">
    import { toast } from '@steveyuowo/vue-hot-toast'
    import { useElementVisibility } from '@vueuse/core'
    const userState = useUserState()

    const props = defineProps({
        p_id: { type: Number, required: true },
        c_id: { type: Number, required: true },
    })

    const commentStore = ref()
    const comment = ref()
    const commentReplyTo = ref()
    const commentReplyToSub = ref()
    const visibility = ref(true)
    const isSending = ref(false)
    const isCommentLoading = ref(false)
    const elemTarget = ref(null)
    const isVisibleInViewPort = useElementVisibility(elemTarget)

    watch(isVisibleInViewPort, (value) => {
        if (value && !commentStore.value) {
            loadComments()
        }
    })

    async function loadComments() {
        isCommentLoading.value = true
        await $fetchWithHeader<{
            status: number
            message: string
            comments: Comment[]
        }>('/api/message/', {
            query: {
                p_receiver: props.p_id,
                c_id: props.c_id,
            },
        })
            .then((res) => {
                isCommentLoading.value = false
                commentStore.value = res.comments
            })
            .catch((_err) => {
                isCommentLoading.value = false
            })
    }

    async function sendComment() {
        isSending.value = true
        const sendCommentToast = toast.loading('กำลังส่งคอมเมนต์')
        const payload = {
            p_receiver: props.p_id,
            c_id: props.c_id,
            m_content: comment.value,
        }
        if (commentReplyTo.value)
            Object.assign(payload, { m_thread: commentReplyTo.value })
        await $fetchWithHeader<{ status: number; message: string }>(
            '/api/message/',
            {
                method: 'PUT',
                body: payload,
            }
        )
            .then((res) => {
                loadComments()
                comment.value = null
                isSending.value = false
                toast.update(sendCommentToast, {
                    type: 'success',
                    message: res?.message,
                })
            })
            .catch((err) => {
                isSending.value = false
                toast.update(sendCommentToast, {
                    type: 'error',
                    message: err?.data?.message,
                })
            })
    }

    async function deleteComment(m_id: number) {
        isSending.value = true
        const sendCommentToast = toast.loading('กำลังลบคอมเมนต์')
        const payload = {
            m_id: m_id,
        }
        await $fetchWithHeader<{ status: number; message: string }>(
            '/api/message/',
            {
                method: 'DELETE',
                body: payload,
            }
        )
            .then((res) => {
                loadComments()
                isSending.value = false
                toast.update(sendCommentToast, {
                    type: 'success',
                    message: res?.message,
                })
            })
            .catch((err) => {
                isSending.value = false
                toast.update(sendCommentToast, {
                    type: 'error',
                    message: err?.data?.message,
                })
            })
    }
</script>
<template>
    <span v-if="isCommentLoading" class="underline select-none">
        Loading Comments...
    </span>
    <span
        v-else-if="!isCommentLoading && !visibility"
        class="cursor-pointer underline select-none"
        @click="visibility = true">
        Show Comments
    </span>
    <span
        v-else-if="!isCommentLoading && visibility && commentStore"
        class="cursor-pointer underline select-none"
        @click="visibility = false">
        Hide Comments
    </span>
    <div ref="elemTarget" class="flex flex-row gap-2">
        <div class="relative flex-grow">
            <input
                :id="`hs-floating-comment-crs-${p_id}-${c_id}`"
                v-model="comment"
                type="text"
                placeholder="หัวข้อโพสต์"
                class="peer block max-w-full w-full rounded-lg border-gray-200 p-4 text-sm placeholder:text-transparent autofill:pb-2 autofill:pt-6 focus:border-blue-500 focus:pb-2 focus:pt-6 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 [&:not(:placeholder-shown)]:pb-2 [&:not(:placeholder-shown)]:pt-6" >
            <label
                :for="`hs-floating-comment-crs-${p_id}-${c_id}`"
                class="pointer-events-none absolute start-0 top-0 h-full truncate border border-transparent p-4 text-sm transition duration-100 ease-in-out peer-focus:-translate-y-1.5 peer-focus:text-xs peer-focus:text-gray-500 peer-disabled:pointer-events-none peer-disabled:opacity-50 peer-[:not(:placeholder-shown)]:-translate-y-1.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-500">
                {{
                    commentReplyTo
                        ? `คอมเมนต์ (กำลังตอบกลับ ${commentReplyTo})`
                        : 'คอมเมนต์'
                }}
            </label>
        </div>
        <button
            type="button"
            :disabled="!comment || isSending || isCommentLoading"
            class="transition-color inline-flex w-16 items-center justify-center gap-x-2 rounded-lg border border-transparent bg-blue-600 px-3 py-2 text-sm font-semibold text-white duration-200 ease-in-out hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50"
            @click="sendComment()">
            <span class="material-icons-outlined no-underline">send</span>
        </button>
    </div>
    <div v-if="!isCommentLoading && commentStore" class="flex flex-col gap-2">
        <div
            v-for="cmt in commentStore"
            v-show="visibility"
            :key="cmt.m_id"
            class="flex flex-col gap-2">
            <div
                class="transition-color border-1 ml-4 flex flex-col gap-1 rounded-md border px-4 py-2 duration-200 ease-in-out"
                :class="
                    commentReplyTo === cmt.m_id
                        ? 'border-2 border-blue-600'
                        : 'border-1'
                ">
                <div class="font-bold">
                    {{ cmt.u_firstname }} {{ cmt.u_lastname }}
                    <span class="text-sm font-light">
                        {{ new Date(cmt.created_at).toLocaleString() }}
                    </span>
                </div>
                <div>{{ cmt.m_content }}</div>
                <div class="flex flex-row">
                    <div
                        class="inline-flex cursor-pointer items-center text-xs hover:underline"
                        @click="
                            () => {
                                if (commentReplyTo == cmt.m_id) {
                                    commentReplyTo = null
                                } else {
                                    commentReplyTo = cmt.m_id
                                    commentReplyToSub = null
                                }
                            }
                        ">
                        <span
                            class="material-icons-outlined no-underline"
                            style="font-size: 20px">
                            reply
                        </span>
                        ตอบกลับ
                    </div>
                    <div
                        v-if="cmt.m_sender === userState?.u_id"
                        class="inline-flex cursor-pointer items-center text-xs hover:underline"
                        @click="deleteComment(cmt.m_id)">
                        <span
                            class="material-icons-outlined no-underline"
                            style="font-size: 20px">
                            delete
                        </span>
                        ลบ
                    </div>
                </div>
            </div>
            <div
                v-for="replies in cmt.replies"
                :key="replies.m_id"
                class="transition-color border-1 ml-12 flex flex-col gap-1 rounded-md border px-4 py-2 duration-200 ease-in-out"
                :class="
                    commentReplyToSub === replies.m_id
                        ? 'border-2 border-blue-600'
                        : 'border-1'
                ">
                <div class="font-bold">
                    {{ replies.u_firstname }} {{ replies.u_lastname }}
                    <span class="text-sm font-light">
                        {{ new Date(cmt.created_at).toLocaleString() }}
                    </span>
                </div>
                <div>{{ replies.m_content }}</div>
                <div class="flex flex-row">
                    <div
                        class="inline-flex cursor-pointer items-center text-xs hover:underline"
                        @click="
                            () => {
                                if (commentReplyToSub == replies.m_id) {
                                    commentReplyTo = null
                                    commentReplyToSub = null
                                } else {
                                    commentReplyToSub = replies.m_id
                                    commentReplyTo = replies.m_thread
                                }
                            }
                        ">
                        <span
                            class="material-icons-outlined no-underline"
                            style="font-size: 20px">
                            reply
                        </span>
                        ตอบกลับ
                    </div>
                    <div
                        v-if="replies.m_sender === userState?.u_id"
                        class="inline-flex cursor-pointer items-center text-xs hover:underline"
                        @click="deleteComment(replies.m_id)">
                        <span
                            class="material-icons-outlined no-underline"
                            style="font-size: 20px">
                            delete
                        </span>
                        ลบ
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div v-else />
</template>
