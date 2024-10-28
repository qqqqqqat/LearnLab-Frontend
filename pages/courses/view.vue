<script setup lang="ts">
    import { toast } from '@steveyuowo/vue-hot-toast'
    import { MdPreview } from 'md-editor-v3'
    import { useQueryStringAsNumber } from '#imports'
    import 'md-editor-v3/lib/preview.css'
    const userRole = useUserCourseState()
    const userState = useUserState()
    definePageMeta({
        layout: 'course',
    })

    const route = useRoute()
    const runtimeConfig = useRuntimeConfig()

    const crs_post = ref<PostGETAPIResponse>()
    const crs_pending = ref(true)
    const postModal = ref()
    const delPostId = ref<number>(0)
    const delPostConfirm = ref()
    const unenroll = ref()

    const editPostModal = ref()
    const editPostId = ref<number | null>(null)
    const editPostTitle = ref<string | null>(null)
    const editPostContent = ref<string | null>(null)

    watch(
        () => route.query.id,
        async (id) => {
            fetchPost(useQueryStringAsNumber(id))
        }
    )

    async function fetchPost(id: number) {
        await $fetchWithHeader<PostGETAPIResponse>('/api/post/', {
            query: {
                c_id: id,
            },
        })
            .then((res) => {
                crs_post.value = res
                crs_pending.value = false
            })
            .catch((err) => {
                toast.error(err?.data?.message)
                navigateTo('/mycourse', { replace: true })
            })
    }

    async function deletePost(p_id: number) {
        delPostConfirm.value.c_closeModal()
        const deletePostToast = toast.loading('กำลังลบโพสต์')
        await $fetchWithHeader<{ status: number; message: string }>(
            '/api/post/',
            {
                method: 'DELETE',
                body: {
                    c_id: useQueryStringAsNumber(route.query.id),
                    p_id: p_id,
                },
            }
        )
            .then((res) => {
                fetchPost(useQueryStringAsNumber(route.query.id))
                toast.update(deletePostToast, {
                    type: 'success',
                    message: res?.message,
                })
            })
            .catch((err) => {
                toast.update(deletePostToast, {
                    type: 'error',
                    message: err?.data?.message,
                })
            })
    }

    async function unenrollCourse() {
        const deletePostToast = toast.loading('กำลังออกจากคอร์ส')
        await $fetchWithHeader<{ status: number; message: string }>(
            '/api/courses/enroll/',
            {
                method: 'DELETE',
                body: {
                    c_id: useQueryStringAsNumber(route.query.id),
                },
            }
        )
            .then(async (res) => {
                toast.update(deletePostToast, {
                    type: 'success',
                    message: res?.message,
                })
                setTimeout(
                    async () =>
                        await navigateTo('/mycourse', { replace: true }),
                    1000
                )
            })
            .catch((err) => {
                toast.update(deletePostToast, {
                    type: 'error',
                    message: err?.data?.message,
                })
            })
    }

    async function downloadFile(f_id: number) {
        await navigateTo(`${runtimeConfig.public.apiBaseUrl}/api/file/?f_id=${f_id}`, {
            open: { target: '_blank' },
        })
    }

    async function openQuiz(q_id: number) {
        await navigateTo(
            `/courses/quiz/begin?id=${useQueryStringAsNumber(route.query.id)}&q_id=${q_id}`
        )
    }

    if (route.query.id) {
        fetchPost(useQueryStringAsNumber(route.query.id))
    } else {
        navigateTo('/courses', { replace: true })
    }
</script>
<template>
    <LazyCourseCreatePostModal
        ref="postModal"
        :c_id="useQueryStringAsNumber(route.query.id)"
        @refresh-post="fetchPost(useQueryStringAsNumber(route.query.id))" />
    <LazyCourseDeletePostConfirm
        ref="delPostConfirm"
        :p_id="delPostId"
        @delete-post="deletePost" />
    <CourseUnenrollConfirmModal ref="unenroll" @unenroll="unenrollCourse()" />
    <LazyCourseEditPostModal
        ref="editPostModal"
        :p_id="editPostId || 0"
        :p_title="editPostTitle || ''"
        :p_content="editPostContent || ''"
        :c_id="useQueryStringAsNumber(route.query.id)"
        @refresh-post="fetchPost(useQueryStringAsNumber(route.query.id))" />
    <div class="flex w-full flex-col gap-4">
        <div
            v-show="!crs_pending"
            class="flex flex-row items-center justify-between gap-4">
            <div />
            <div>
                <button
                    type="button"
                    class="mr-2 inline-flex flex-shrink-0 items-center justify-center gap-x-2 rounded-lg border border-transparent bg-red-600 px-3 py-2 text-sm font-semibold text-white transition-colors duration-150 ease-in-out hover:bg-red-700 disabled:pointer-events-none disabled:opacity-50"
                    @click="unenroll.c_openModal()">
                    <span
                        class="material-icons-outlined size-6 overflow-hidden select-none">
                        remove
                    </span>
                    ออกจากคอร์ส
                </button>
                <button
                    v-if="
                        userRole?.[useQueryStringAsNumber(route.query.id)] !==
                        'STUDENT'
                    "
                    type="button"
                    class="inline-flex flex-shrink-0 items-center justify-center gap-x-2 rounded-lg border border-transparent bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition-colors duration-150 ease-in-out hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50"
                    @click="postModal.c_openModal">
                    <span
                        class="material-icons-outlined size-6 overflow-hidden select-none">
                        add
                    </span>
                    เพิ่มโพสต์ในคอร์ส
                </button>
            </div>
        </div>
        <div
            v-if="(crs_post?.data.length || 0) > 0"
            class="flex w-full flex-col gap-2">
            <div
                v-for="post in crs_post?.data"
                :key="post.p_id"
                class="border-1 rounded-md border p-4 flex w-full flex-col gap-2">
                <div
                    class="flex w-full flex-wrap items-center justify-between gap-4">
                    <div class="flex flex-row items-center gap-4">
                        <div v-if="post.u_avatar" class="h-12 w-12 rounded-md">
                            <img
                                class="bottom-1 aspect-square rounded-md border object-cover"
                                :src="`${runtimeConfig.public.apiBaseUrl}/api/avatar/?u_id=${post.u_id}`" >
                        </div>
                        <div
                            v-if="!post?.u_avatar"
                            class="flex h-12 w-12 select-none flex-col items-center justify-center rounded-md bg-slate-200 text-2xl">
                            {{
                                `${post?.u_firstname.slice(0, 1)}${post?.u_lastname.slice(0, 1)}`
                            }}
                        </div>
                        <div class="flex flex-col">
                            <span class="flex gap-2">
                                <span class="font-black">
                                    {{ post.u_firstname }} {{ post.u_lastname }}
                                </span>
                                <span
                                    class="inline-flex items-center gap-x-1.5 rounded-full bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-800">
                                    {{
                                        post.u_role === 'INSTRUCTOR'
                                            ? 'ผู้สอน'
                                            : post.u_role
                                    }}
                                </span>
                            </span>
                            <span class="text-sm text-slate-400">
                                {{
                                    new Date(post.p_updated_at).toLocaleString()
                                }}
                                {{
                                    post.p_updated_at === post.p_created_at
                                        ? ''
                                        : '(ถูกแก้ไข)'
                                }}
                            </span>
                        </div>
                        <div
                            v-if="post.p_type === 'ASSIGNMENT'"
                            class="flex flex-col">
                            <span
                                class="inline-flex items-center gap-x-2 rounded-md bg-emerald-100 px-2 py-1 text-sm font-medium text-emerald-800">
                                งานมอบหมาย
                            </span>
                            <div class="flex flex-row flex-wrap" />
                        </div>
                        <div
                            v-else-if="post.p_type === 'QUIZ'"
                            class="flex flex-col">
                            <span
                                class="inline-flex items-center gap-x-2 rounded-md bg-orange-100 px-2 py-1 text-sm font-medium text-orange-800">
                                แบบทดสอบ
                            </span>
                            <div class="flex flex-row flex-wrap" />
                        </div>
                    </div>
                    <div
                        v-if="userState?.u_id === post?.u_id"
                        class="flex gap-2">
                        <button
                            type="button"
                            class="transition-color inline-flex items-center gap-x-2 rounded-lg border border-gray-200 px-2 py-1 text-sm font-semibold text-gray-500 duration-200 ease-in-out hover:border-blue-600 hover:text-blue-600 disabled:pointer-events-none disabled:opacity-50"
                            @click="
                                () => {
                                    editPostId = post.p_id
                                    editPostTitle = post.p_title
                                    editPostContent = post.p_content
                                    editPostModal.c_openModal()
                                }
                            ">
                            <span
                                class="material-icons-outlined size-6 overflow-hidden select-none">
                                edit
                            </span>
                        </button>
                        <button
                            type="button"
                            class="transition-color inline-flex items-center gap-x-2 rounded-lg border border-gray-200 px-2 py-1 text-sm font-semibold text-gray-500 duration-200 ease-in-out hover:border-rose-600 hover:text-rose-600 disabled:pointer-events-none disabled:opacity-50"
                            @click="
                                () => {
                                    delPostId = post.p_id
                                    delPostConfirm.c_openModal()
                                }
                            ">
                            <span
                                class="material-icons-outlined size-6 overflow-hidden select-none">
                                delete
                            </span>
                        </button>
                    </div>
                </div>
                <div class="text-xl font-black">{{ post.p_title }}</div>
                <div v-if="post.p_content" class="md-prev-div">
                    <MdPreview language="en-US" :model-value="post.p_content" />
                </div>
                <div v-if="post.p_item_list.files.length" class="flex flex-col">
                    <span class="flex items-center gap-2 font-bold">
                        <span
                            class="material-icons-outlined size-6 overflow-hidden select-none">
                            attach_file
                        </span>
                        ไฟล์แนบ
                    </span>
                    <hr class="mb-2" >
                    <div class="flex flex-row flex-wrap gap-2">
                        <div
                            v-for="file in post?.p_item_list?.files"
                            :key="file.f_id"
                            class="border-1 mt-1 flex w-full flex-row rounded-md border p-2 md:w-72">
                            <div
                                class="flex w-full flex-row items-center justify-between gap-2 md:w-72">
                                <div
                                    class="flex flex-row items-center gap-2 overflow-hidden">
                                    <div
                                        class="flex h-8 w-8 flex-shrink-0 select-none items-center justify-center rounded-md bg-slate-100">
                                        <span
                                            class="material-icons-outlined size-6 overflow-hidden select-none">
                                            {{
                                                file.f_mime_type?.split(
                                                    '/'
                                                )[0] === 'image'
                                                    ? 'image'
                                                    : file.f_mime_type?.split(
                                                            '/'
                                                        )[0] === 'audio'
                                                      ? 'audio_file'
                                                      : file.f_mime_type ===
                                                          'application/pdf'
                                                        ? 'description'
                                                        : file.f_mime_type?.split(
                                                                '/'
                                                            )[0] === 'video'
                                                          ? 'video_file'
                                                          : 'insert_drive_file'
                                            }}
                                        </span>
                                    </div>
                                    <div class="flex w-10/12 flex-col md:w-48">
                                        <span
                                            class="overflow-hidden text-ellipsis whitespace-nowrap text-xs font-bold">
                                            {{ file.f_name }}
                                        </span>
                                    </div>
                                </div>
                                <div
                                    class="flex w-fit flex-row items-center gap-2">
                                    <span
                                        class="material-icons-outlined cursor-pointer select-none text-gray-500"
                                        @click="downloadFile(file.f_id)">
                                        download
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    v-if="post.p_item_list.quizzes.length"
                    class="flex flex-col">
                    <span class="flex items-center gap-2 font-bold">
                        <span
                            class="material-icons-outlined size-6 overflow-hidden select-none">
                            quiz
                        </span>
                        แบบทดสอบ
                    </span>
                    <hr class="mb-2" >
                    <div class="flex flex-row flex-wrap gap-2">
                        <div
                            v-for="quiz in post?.p_item_list?.quizzes"
                            :key="quiz.q_id"
                            class="border-1 mt-1 flex w-full flex-row rounded-md border p-2 md:w-72">
                            <div
                                class="flex w-full flex-row items-center justify-between gap-2 md:w-72">
                                <div
                                    class="flex flex-row items-center gap-2 overflow-hidden">
                                    <div
                                        class="flex h-8 w-8 flex-shrink-0 select-none items-center justify-center rounded-md bg-slate-100">
                                        <span
                                            class="material-icons-outlined size-6 overflow-hidden select-none">
                                            quiz
                                        </span>
                                    </div>
                                    <div class="flex w-10/12 flex-col md:w-48">
                                        <span
                                            class="overflow-hidden text-ellipsis whitespace-nowrap text-xs font-bold">
                                            {{ quiz.q_name }}
                                        </span>
                                        <span
                                            class="whitespace-nowrap text-xs text-slate-400">
                                            {{
                                                quiz.q_due_date
                                                    ? `กำหนดส่ง ${new Date(quiz.q_due_date).toLocaleString()}`
                                                    : 'ไม่มีกำหนดส่ง'
                                            }}
                                        </span>
                                        <span
                                            v-if="quiz.q_time_limit"
                                            class="whitespace-nowrap text-xs text-slate-400">
                                            {{
                                                quiz.q_time_limit
                                                    ? `จำกัดเวลาทำ ${quiz.q_time_limit} นาที`
                                                    : ''
                                            }}
                                        </span>
                                    </div>
                                </div>
                                <div
                                    class="flex w-fit flex-row items-center gap-2">
                                    <span
                                        class="material-icons-outlined cursor-pointer select-none text-gray-500"
                                        @click="openQuiz(quiz.q_id)">
                                        open_in_new
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    v-if="post.p_item_list.assignments.length"
                    class="flex flex-col">
                    <span class="flex items-center gap-2 font-bold">
                        <span
                            class="material-icons-outlined size-6 overflow-hidden select-none">
                            assignment
                        </span>
                        งานมอบหมาย
                    </span>
                    <hr class="mb-2" >
                    <div class="flex flex-row flex-wrap gap-2">
                        <div
                            v-for="assign in post?.p_item_list?.assignments"
                            :key="assign.a_id"
                            class="border-1 mt-1 flex w-full flex-row rounded-md border p-2 md:w-72">
                            <div
                                class="flex w-full flex-row items-center justify-between gap-2 md:w-72">
                                <div
                                    class="flex flex-row items-center gap-2 overflow-hidden">
                                    <div
                                        class="flex h-8 w-8 flex-shrink-0 select-none items-center justify-center rounded-md bg-slate-100">
                                        <span
                                            class="material-icons-outlined size-6 overflow-hidden select-none">
                                            quiz
                                        </span>
                                    </div>
                                    <div class="flex w-10/12 flex-col md:w-48">
                                        <span
                                            class="overflow-hidden text-ellipsis whitespace-nowrap text-xs font-bold">
                                            {{ assign.a_name }}
                                        </span>
                                        <span
                                            class="whitespace-nowrap text-xs text-slate-400">
                                            {{
                                                assign.a_due_date
                                                    ? `กำหนดส่ง ${new Date(assign.a_due_date).toLocaleString()}`
                                                    : 'ไม่มีกำหนดส่ง'
                                            }}
                                        </span>
                                        <span
                                            v-if="assign.a_score"
                                            class="whitespace-nowrap text-xs text-slate-400">
                                            {{ assign.a_score }} คะแนน
                                        </span>
                                    </div>
                                </div>
                                <div
                                    class="flex w-fit flex-row items-center gap-2">
                                    <span
                                        v-if="
                                            userRole?.[
                                                useQueryStringAsNumber(
                                                    route.query.id
                                                )
                                            ] === 'STUDENT'
                                        "
                                        class="material-icons-outlined cursor-pointer select-none text-gray-500"
                                        @click="
                                            navigateTo(
                                                `/courses/submission?a_id=${assign.a_id}&id=${useQueryStringAsNumber(route.query.id)}`
                                            )
                                        ">
                                        open_in_new
                                    </span>
                                    <span
                                        v-else
                                        class="material-icons-outlined cursor-pointer select-none text-gray-500"
                                        @click="
                                            navigateTo(
                                                `/courses/assignment/view?a_id=${assign.a_id}&id=${useQueryStringAsNumber(route.query.id)}`
                                            )
                                        ">
                                        open_in_new
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <hr >
                <div class="flex flex-col gap-4">
                    <div class="flex flex-col gap-2">
                        <span class="text-xl font-bold">Comments</span>
                        <CourseComment
                            :c_id="useQueryStringAsNumber(route.query.id)"
                            :p_id="post.p_id" />
                    </div>
                </div>
            </div>
        </div>
        <div
            v-else-if="!crs_pending && (crs_post?.data.length || 0) === 0"
            class="border-1 flex w-full flex-col items-center gap-2 rounded-md border p-4 md:flex-row">
            <img class="w-64" src="~/assets/images/content.svg" >
            <span class="text-3xl font-bold">ยังไม่มีโพสต์ในคอร์สนี้</span>
        </div>
        <div
            v-else
            class="border-1 flex w-full flex-row gap-2 rounded-md border p-4">
            <div
                class="inline-block size-6 animate-spin rounded-full border-[3px] border-current border-t-transparent text-blue-600 dark:text-blue-500"
                role="status"
                aria-label="loading">
                <span class="sr-only">Loading...</span>
            </div>
            กำลังโหลดข้อมูล
        </div>
    </div>
</template>
<style scoped>
:deep(.md-editor-preview) {
    word-break: auto-phrase !important;
    white-space: normal !important;
    font-family: 'Bai Jamjuree', 'sans-serif' !important;
}

.md-prev-div iframe { 
    width: fit-content !important; 
    aspect-ratio: 16 / 9 !important; 
    overflow: hidden !important;
}

:deep(.md-editor-mermaid) {
    border-radius: 8px;
    border: 1px solid #e2e8f0;
}

:deep(.md-editor-preview-wrapper) {
    padding: 0;
}
</style>
