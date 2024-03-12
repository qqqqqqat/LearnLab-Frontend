<script setup lang="ts">
    import { toast } from '@steveyuowo/vue-hot-toast'
    import { MdPreview } from 'md-editor-v3'
    import 'md-editor-v3/lib/preview.css'

    const userRole = useUserCourseState()
    const assignments = ref()
    const assignPending = ref(true)
    const postContent = ref<string>('')
    const submitFiles = ref<{ name: string; file: File }[]>([])
    const inputFile = ref()
    definePageMeta({
        layout: 'course',
    })

    async function getOneAssignment(id: number, a_id: number) {
        assignPending.value = true
        await $fetch<StudentAssignmentGETResponse>('/api/courses/assignment/', {
            query: {
                c_id: id,
                a_id: a_id,
            },
        })
            .then((res) => {
                assignments.value = res
                postContent.value = res?.s_content?.text || ''
                assignPending.value = false
            })
            .catch((err) => {
                toast.error(err?.data?.message)
                navigateTo('/mycourse', { replace: true })
            })
    }

    function getRteText(text: string) {
        postContent.value = text
    }
    async function downloadFile(f_id: number) {
        await navigateTo(`/api/file?f_id=${f_id}`, { open: { target: '_blank' } })
    }

    async function removeSubmission() {
        assignPending.value = true
        const deleteSubmissionToast = toast.loading('กำลังลบการส่งงาน')

        await $fetch<{ status: number; message: string }>('/api/courses/assignment/submit', {
            method: 'DELETE',
            body: { a_id: route.query.a_id },
        })
            .then((Pres) => {
                toast.update(deleteSubmissionToast, { type: 'success', message: Pres?.message })
                assignPending.value = false
                getOneAssignment(route.query.id, route.query.a_id)
            })
            .catch((Perr) => {
                toast.update(deleteSubmissionToast, { type: 'error', message: Perr?.data?.message })
                assignPending.value = false
            })
    }

    async function makeSubmission(postFile: number[]) {
        assignPending.value = true
        const createSubmissionToast = toast.loading('กำลังบันทึกการส่งงาน')
        let payload = {
            a_id: route.query.a_id,
            c_id: route.query.id,
            s_content: { files: [], text: '' },
        }
        if (postFile.length > 0) Object.assign(payload.s_content, { files: postFile })
        if (postContent.value) Object.assign(payload.s_content, { text: postContent.value })
        await $fetch<{ message: string }>('/api/courses/assignment/submit', {
            method: 'PUT',
            body: payload,
        })
            .then((Pres) => {
                toast.update(createSubmissionToast, { type: 'success', message: Pres?.message })
                assignPending.value = false
                getOneAssignment(route.query.id, route.query.a_id)
            })
            .catch((Perr) => {
                toast.update(createSubmissionToast, { type: 'error', message: Perr?.data?.message })
                assignPending.value = false
            })
    }

    async function submitFile() {
        if (!submitFiles.value.length) {
            return
        }
        const uploadSubmitFileToast = toast.loading('กำลังอัพโหลดไฟล์แนบ')
        const formData = new FormData()
        formData.append('c_id', route.query.id)
        formData.append('a_id', route.query.a_id)
        for (let x = 0; x < submitFiles.value.length; x++) {
            formData.append('f_data[]', submitFiles.value[x].file)
        }
        await $fetch<{ f_id: number[]; message: string }>('/api/file/submit/', {
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

    const route = useRoute()
    if (route.query.id && route.query.a_id) {
        getOneAssignment(route.query.id, route.query.a_id)
    } else {
        navigateTo('/courses', { replace: true })
    }
</script>
<template>
    <div v-if="!assignPending" class="flex flex-col w-full">
        <div class="flex md:flex-row flex-col md:justify-between md:items-center gap-2">
            <div class="flex items-center gap-2">
                <div>
                    <button
                        @click="navigateTo(`/courses/assignment?id=${route.query.id}`)"
                        class="transition-all duration-200 ease-in-out py-2 px-3 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-blue-600 hover:bg-blue-100 hover:text-blue-800 disabled:opacity-50 disabled:pointer-events-none">
                        <span class="material-icons-outlined">arrow_back</span>
                    </button>
                </div>
                <span class="text-2xl font-bold">
                    ส่งงาน : {{ assignments?.a_name }}
                    <div class="flex flex-col">
                        <span class="text-sm text-slate-400">{{ assignments?.a_due_date ? `กำหนดส่ง ${new Date(assignments?.a_due_date).toLocaleString()}` : 'ไม่มีกำหนดส่ง' }}</span>
                        <span class="text-sm text-slate-400">{{ assignments?.a_score ? `${assignments?.a_score} คะแนน` : 'ไม่มีคะแนน' }}</span>
                    </div>
                </span>
            </div>
            <div class="md:w-fit w-full">
                <button
                    v-if="!assignments?.s_datetime"
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
                    :disabled="assignPending"
                    class="md:w-fit w-full justify-center transition-color duration-200 ease-in-out py-2 px-6 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none">
                    ส่ง
                </button>
                <button
                    v-else-if="!assignments?.score"
                    @click="removeSubmission()"
                    type="button"
                    :disabled="assignPending"
                    class="md:w-fit w-full justify-center transition-color duration-200 ease-in-out py-2 px-6 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none">
                    ยกเลิกการส่ง
                </button>
                <div class="flex flex-col justify-end items-end" v-else>
                    <span class="text-xl">คุณได้ {{ `${assignments?.score}/${assignments?.a_score}` }} คะแนน</span>
                    <span class="text-slate-800" v-if="assignments?.s_feedback">"{{ assignments?.s_feedback }}"</span>
                </div>
            </div>
        </div>
        <div class="mt-4" v-if="assignments?.a_files?.length">
            <span class="flex items-center gap-2">
                <span class="material-icons-outlined">attach_file</span>
                ไฟล์แนบ
            </span>
            <hr class="mb-2" />
        </div>
        <div class="flex flex-row flex-wrap gap-2" v-if="assignments?.a_files?.length">
            <div v-for="file in assignments?.a_files" class="flex flex-row border border-1 rounded-md md:w-72 w-full p-2 mt-1">
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
                            <span class="text-xs whitespace-nowrap text-ellipsis overflow-hidden">{{ file.f_name }}</span>
                        </div>
                    </div>
                    <div class="flex flex-row items-center gap-2 w-fit">
                        <span class="material-icons-outlined select-none cursor-pointer text-gray-500" @click="downloadFile(file.f_id)">download</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div v-if="!assignPending" class="flex flex-col gap-4 overflow-y-auto">
        <div class="w-full">
            <span class="flex items-center gap-2 font-bold">
                <span class="material-icons-outlined select-none">article</span>
                ข้อความ
            </span>
            <hr class="mb-2" />
            <MdPreview v-if="assignments?.s_datetime" :model-value="postContent" />
            <RichEditor v-else @send-text="getRteText" />
        </div>
        <div class="flex md:flex-row md:flex-nowrap flex-col gap-2 w-full">
            <input @change="onFileChangedMat" ref="inputFile" type="file" hidden />
            <!-- End Floating Input -->
            <div>
                <button
                    v-if="!assignments?.s_datetime"
                    @click="inputFile.click()"
                    type="button"
                    :disabled="assignPending"
                    class="transition-color duration-200 ease-in-out py-2 px-3 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none">
                    <span class="material-icons-outlined">upload_file</span>
                    เพิ่มไฟล์แนบ
                </button>
            </div>
            <div v-if="!assignments?.s_datetime" class="flex md:flex-row flex-col overflow-auto gap-x-4 gap-y-2">
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
            <div class="">
                <div class="mt-4" v-if="assignments?.s_content?.files?.length">
                    <span class="flex items-center gap-2 font-bold">
                        <span class="material-icons-outlined">attach_file</span>
                        ไฟล์ที่ส่งไป
                    </span>
                    <hr class="mb-2" />
                </div>
                <div class="flex flex-row flex-wrap gap-2" v-if="assignments?.s_content?.files?.length">
                    <div v-for="file in assignments?.s_content?.files" class="flex flex-row border border-1 rounded-md md:w-72 w-full p-2 mt-1">
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
                                    <span class="text-xs whitespace-nowrap text-ellipsis overflow-hidden">{{ file.f_name }}</span>
                                </div>
                            </div>
                            <div class="flex flex-row items-center gap-2 w-fit">
                                <span class="material-icons-outlined select-none cursor-pointer text-gray-500" @click="downloadFile(file.f_id)">download</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div v-else class="flex flex-row border border-1 rounded-md gap-2 w-full p-4">
            <div class="animate-spin inline-block size-6 border-[3px] border-current border-t-transparent text-blue-600 rounded-full dark:text-blue-500" role="status" aria-label="loading">
                <span class="sr-only">Loading...</span>
            </div>
            กำลังโหลดข้อมูล
        </div>
</template>
