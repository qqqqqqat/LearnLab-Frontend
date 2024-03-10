<script setup lang="ts">
    import { toast } from '@steveyuowo/vue-hot-toast'
    import { MdPreview } from 'md-editor-v3'
    import 'md-editor-v3/lib/preview.css'
    const userRole = useUserCourseState()
    const userState = useUserState()
    definePageMeta({
        layout: 'course',
    })

    const route = useRoute()

    const crs_post = ref<PostGETAPIResponse>()
    const crs_pending = ref(true)
    const postModal = ref()
    const delPostId = ref()
    const delPostConfirm = ref()

    watch(
        () => route.query.id,
        async (id) => {
            fetchPost(id)
        }
    )

    async function fetchPost(id: number) {
        await $fetch<PostGETAPIResponse>('/api/post/', {
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
        await $fetch<{ status: number; message: string }>('/api/post/', {
            method: 'DELETE',
            body: {
                c_id: route.query.id,
                p_id: p_id,
            },
        })
            .then((res) => {
                fetchPost(route.query.id)
                toast.update(deletePostToast, { type: 'success', message: res?.message })
            })
            .catch((err) => {
                toast.update(deletePostToast, { type: 'error', message: err?.data?.message })
            })
    }

    async function downloadFile(f_id: number) {
        await navigateTo(`/api/file?f_id=${f_id}`, { open: { target: '_blank' } })
    }

    async function openQuiz(q_id: number) {
        await navigateTo(`/courses/quiz?q_id=${q_id}`)
    }

    if (route.query.id) {
        fetchPost(route.query.id)
    }

    // console.log(userRole?.value[route.query.id])
</script>
<template>
    <LazyCourseCreatePostModal ref="postModal" :c_id="route.query.id" @refresh-post="fetchPost(route.query.id)" />
    <LazyCourseDeletePostConfirm ref="delPostConfirm" :p_id="delPostId" @delete-post="deletePost"/>
    <div class="flex flex-col gap-4 w-full">
        <div class="flex flex-row justify-between items-center gap-4">
            <div></div>
            <button
                v-if="userRole?.[route.query.id] !== 'STUDENT'"
                type="button"
                @click="postModal.c_openModal"
                class="py-2 px-3 flex-shrink-0 transition-colors duration-150 ease-in-out inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none">
                <span class="material-icons-outlined">add</span>
                เพิ่มโพสต์ในคอร์ส
            </button>
        </div>
        <div v-if="(crs_post?.data.length || 0) > 0" v-for="post in crs_post?.data" class="flex flex-col border border-1 rounded-md gap-2 w-full p-4">
            <div class="flex flex-wrap items-center justify-between gap-4 w-full">
                <div class="flex flex-row gap-4 items-center">
                    <div v-if="post.u_avatar" class="rounded-md w-12 h-12"><img class="rounded-md aspect-square object-cover border bottom-1" :src="`/api/avatar/?u_id=${post.u_id}`" /></div>
                    <div class="rounded-md w-12 h-12 bg-slate-200 flex flex-col justify-center items-center text-2xl select-none" v-if="!post?.u_avatar">
                        {{ `${post?.u_firstname.slice(0, 1)}${post?.u_lastname.slice(0, 1)}` }}
                    </div>
                    <div class="flex flex-col">
                        <span class="flex gap-2">
                            <span class="font-black">{{ post.u_firstname }} {{ post.u_lastname }}</span>
                            <span class="inline-flex items-center gap-x-1.5 py-0.5 px-1.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {{ post.u_role === 'INSTRUCTOR' ? 'ผู้สอน' : post.u_role }}
                            </span>
                        </span>
                        <span class="text-sm text-slate-400">{{ new Date(post.p_updated_at).toLocaleString() }} {{ post.p_updated_at === post.p_created_at ? '' : '(ถูกแก้ไข)' }}</span>
                    </div>
                    <div v-if="post.p_type === 'ASSIGNMENT'" class="flex flex-col">
                        <span class="inline-flex items-center gap-x-2 py-1 px-2 rounded-md text-sm font-medium bg-emerald-100 text-emerald-800">งานมอบหมาย</span>
                        <div class="flex flex-row flex-wrap"></div>
                    </div>
                    <div v-else-if="post.p_type === 'QUIZ'" class="flex flex-col">
                        <span class="inline-flex items-center gap-x-2 py-1 px-2 rounded-md text-sm font-medium bg-orange-100 text-orange-800">แบบทดสอบ</span>
                        <div class="flex flex-row flex-wrap"></div>
                    </div>
                </div>
                <div class="flex gap-2" v-if="userState?.u_id === post?.u_id">
                    <button
                        type="button"
                        class="transition-color duration-200 ease-in-out py-1 px-2 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-gray-200 text-gray-500 hover:border-blue-600 hover:text-blue-600 disabled:opacity-50 disabled:pointer-events-none">
                        <span class="material-icons-outlined">edit</span>
                    </button>
                    <button
                        @click="
                            () => {
                                delPostId = post.p_id
                                delPostConfirm.c_openModal()
                            }
                        "
                        type="button"
                        class="transition-color duration-200 ease-in-out py-1 px-2 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-gray-200 text-gray-500 hover:border-rose-600 hover:text-rose-600 disabled:opacity-50 disabled:pointer-events-none">
                        <span class="material-icons-outlined">delete</span>
                    </button>
                </div>
            </div>

            <div class="text-xl font-black">{{ post.p_title }}</div>
            <div v-if="post.p_content">
                <MdPreview language="en-US" :modelValue="post.p_content" />
            </div>
            <div class="flex flex-col" v-if="post.p_item_list.files.length">
                <span class="flex items-center gap-2 font-bold">
                    <span class="material-icons-outlined">attach_file</span>
                    ไฟล์แนบ
                </span>
                <hr class="mb-2" />
                <div class="flex flex-row flex-wrap gap-2">
                    <div v-for="file in post?.p_item_list?.files" class="flex flex-row border border-1 rounded-md md:w-72 w-full p-2 mt-1">
                        <div class="flex flex-row justify-between items-center gap-2 md:w-72 w-full">
                            <div class="flex flex-row items-center gap-2 overflow-hidden">
                                <div class="bg-slate-100 w-8 h-8 rounded-md flex flex-shrink-0 justify-center items-center select-none">
                                    <span class="material-icons-outlined">
                                        {{
                                            file.f_mime_type?.split('/')[0] === 'image'
                                                ? 'image'
                                                : file.f_mime_type?.split('/')[0] === 'audio'
                                                ? 'audio_file'
                                                : file.f_mime_type === 'application/pdf'
                                                ? 'description'
                                                : file.f_mime_type?.split('/')[0] === 'video'
                                                ? 'video_file'
                                                : 'insert_drive_file'
                                        }}
                                    </span>
                                </div>
                                <div class="flex flex-col md:w-48 w-10/12">
                                    <span class="text-xs whitespace-nowrap text-ellipsis overflow-hidden font-bold">{{ file.f_name }}</span>
                                </div>
                            </div>
                            <div class="flex flex-row items-center gap-2 w-fit">
                                <span class="material-icons-outlined select-none cursor-pointer text-gray-500" @click="downloadFile(file.f_id)">download</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="flex flex-col" v-if="post.p_item_list.quizzes.length">
                <span class="flex items-center gap-2 font-bold">
                    <span class="material-icons-outlined">quiz</span>
                    แบบทดสอบ
                </span>
                <hr class="mb-2" />
                <div class="flex flex-row flex-wrap gap-2">
                    <div v-for="quiz in post?.p_item_list?.quizzes" class="flex flex-row border border-1 rounded-md md:w-72 w-full p-2 mt-1">
                        <div class="flex flex-row justify-between items-center gap-2 md:w-72 w-full">
                            <div class="flex flex-row items-center gap-2 overflow-hidden">
                                <div class="bg-slate-100 w-8 h-8 rounded-md flex flex-shrink-0 justify-center items-center select-none">
                                    <span class="material-icons-outlined">quiz</span>
                                </div>
                                <div class="flex flex-col md:w-48 w-10/12">
                                    <span class="text-xs whitespace-nowrap text-ellipsis overflow-hidden font-bold">{{ quiz.q_name }}</span>
                                    <span class="text-xs whitespace-nowrap text-slate-400">{{ quiz.q_due_date ? `กำหนดส่ง ${new Date(quiz.q_due_date).toLocaleString()}` : 'ไม่มีกำหนดส่ง' }}</span>
                                    <span class="text-xs whitespace-nowrap text-slate-400" v-if="quiz.q_time_limit">{{ quiz.q_time_limit ? `จำกัดเวลาทำ ${quiz.q_time_limit} นาที` : '' }}</span>
                                </div>
                            </div>
                            <div class="flex flex-row items-center gap-2 w-fit">
                                <span class="material-icons-outlined select-none cursor-pointer text-gray-500" @click="downloadFile(quiz.q_id)">open_in_new</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="flex flex-col" v-if="post.p_item_list.assignments.length">
                <span class="flex items-center gap-2 font-bold">
                    <span class="material-icons-outlined">assignment</span>
                    งานมอบหมาย
                </span>
                <hr class="mb-2" />
                <div class="flex flex-row flex-wrap gap-2">
                    <div v-for="assign in post?.p_item_list?.assignments" class="flex flex-row border border-1 rounded-md md:w-72 w-full p-2 mt-1">
                        <div class="flex flex-row justify-between items-center gap-2 md:w-72 w-full">
                            <div class="flex flex-row items-center gap-2 overflow-hidden">
                                <div class="bg-slate-100 w-8 h-8 rounded-md flex flex-shrink-0 justify-center items-center select-none">
                                    <span class="material-icons-outlined">quiz</span>
                                </div>
                                <div class="flex flex-col md:w-48 w-10/12">
                                    <span class="text-xs whitespace-nowrap text-ellipsis overflow-hidden font-bold">{{ assign.a_name }}</span>
                                    <span class="text-xs whitespace-nowrap text-slate-400">{{ assign.a_due_date ? `กำหนดส่ง ${new Date(assign.a_due_date).toLocaleString()}` : 'ไม่มีกำหนดส่ง' }}</span>
                                    <span class="text-xs whitespace-nowrap text-slate-400" v-if="assign.a_score">{{ assign.a_score }} คะแนน</span>
                                </div>
                            </div>
                            <div class="flex flex-row items-center gap-2 w-fit">
                                <span class="material-icons-outlined select-none cursor-pointer text-gray-500" @click="downloadFile(quiz.q_id)">open_in_new</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div v-else-if="!crs_pending && (crs_post?.data.length || 0) === 0" class="flex md:flex-row flex-col items-center border border-1 rounded-md gap-2 w-full p-4">
            <img class="w-64" src="~/assets/images/content.svg" />
            <span class="text-3xl font-bold">ยังไม่มีโพสต์ในคอร์สนี้</span>
        </div>
        <div v-else class="flex flex-row border border-1 rounded-md gap-2 w-full p-4">
            <div class="animate-spin inline-block size-6 border-[3px] border-current border-t-transparent text-blue-600 rounded-full dark:text-blue-500" role="status" aria-label="loading">
                <span class="sr-only">Loading...</span>
            </div>
            กำลังโหลดข้อมูล
        </div>
    </div>
</template>
