<script setup lang="ts">
    import { toast } from '@steveyuowo/vue-hot-toast'
    import { MdPreview } from 'md-editor-v3'
    import 'md-editor-v3/lib/preview.css'
    import { useQueryStringAsNumber } from '#imports'

    // const userRole = useUserCourseState()
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
        await $fetchWithHeader<StudentAssignmentGETResponse>(
            '/api/courses/assignment/',
            {
                query: {
                    c_id: id,
                    a_id: a_id,
                },
            }
        )
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
        await navigateTo(`/api/file/?f_id=${f_id}`, {
            open: { target: '_blank' },
        })
    }

    async function removeSubmission() {
        assignPending.value = true
        const deleteSubmissionToast = toast.loading('กำลังลบการส่งงาน')

        await $fetchWithHeader<{ status: number; message: string }>(
            '/api/courses/assignment/submit/',
            {
                method: 'DELETE',
                body: { a_id: useQueryStringAsNumber(route.query.a_id) },
            }
        )
            .then((Pres) => {
                toast.update(deleteSubmissionToast, {
                    type: 'success',
                    message: Pres?.message,
                })
                assignPending.value = false
                getOneAssignment(
                    useQueryStringAsNumber(route.query.id),
                    useQueryStringAsNumber(route.query.a_id)
                )
            })
            .catch((Perr) => {
                toast.update(deleteSubmissionToast, {
                    type: 'error',
                    message: Perr?.data?.message,
                })
                assignPending.value = false
            })
    }

    async function makeSubmission(postFile: number[]) {
        assignPending.value = true
        const createSubmissionToast = toast.loading('กำลังบันทึกการส่งงาน')
        const payload = {
            a_id: useQueryStringAsNumber(route.query.a_id),
            c_id: useQueryStringAsNumber(route.query.id),
            s_content: { files: [], text: '' },
        }
        if (postFile.length > 0)
            Object.assign(payload.s_content, { files: postFile })
        if (postContent.value)
            Object.assign(payload.s_content, { text: postContent.value })
        await $fetchWithHeader<{ message: string }>(
            '/api/courses/assignment/submit/',
            {
                method: 'PUT',
                body: payload,
            }
        )
            .then((Pres) => {
                toast.update(createSubmissionToast, {
                    type: 'success',
                    message: Pres?.message,
                })
                assignPending.value = false
                getOneAssignment(
                    useQueryStringAsNumber(route.query.id),
                    useQueryStringAsNumber(route.query.a_id)
                )
            })
            .catch((Perr) => {
                toast.update(createSubmissionToast, {
                    type: 'error',
                    message: Perr?.data?.message,
                })
                assignPending.value = false
            })
    }

    async function submitFile() {
        if (!submitFiles.value.length) {
            return
        }
        const uploadSubmitFileToast = toast.loading('กำลังอัพโหลดไฟล์แนบ')
        const formData = new FormData()
        formData.append(
            'c_id',
            useQueryStringAsNumber(route.query.id).toString()
        )
        formData.append(
            'a_id',
            useQueryStringAsNumber(route.query.a_id).toString()
        )
        for (let x = 0; x < submitFiles.value.length; x++) {
            formData.append('f_data[]', submitFiles.value[x].file)
        }
        await $fetchWithHeader<{ f_id: number[]; message: string }>(
            '/api/file/submit/',
            {
                method: 'POST',
                body: formData,
            }
        )
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

    const route = useRoute()
    if (route.query.id && route.query.a_id) {
        getOneAssignment(
            useQueryStringAsNumber(route.query.id),
            useQueryStringAsNumber(route.query.a_id)
        )
    } else {
        navigateTo('/courses', { replace: true })
    }
</script>
<template>
    <div>
        <div v-if="!assignPending" class="flex w-full flex-col">
            <div
                class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div class="flex items-center gap-2">
                    <div>
                        <button
                            class="inline-flex items-center gap-x-2 rounded-lg border border-transparent px-3 py-2 text-sm font-semibold text-blue-600 transition-all duration-200 ease-in-out hover:bg-blue-100 hover:text-blue-800 disabled:pointer-events-none disabled:opacity-50"
                            @click="
                                navigateTo(
                                    `/courses/assignment?id=${useQueryStringAsNumber(route.query.id)}`
                                )
                            ">
                            <span
                                class="material-icons-outlined size-6 overflow-hidden select-none">
                                arrow_back
                            </span>
                        </button>
                    </div>
                    <span class="text-2xl font-bold">
                        ส่งงาน : {{ assignments?.a_name }}
                        <div class="flex flex-col">
                            <span class="text-sm text-slate-400">
                                {{
                                    assignments?.a_due_date
                                        ? `กำหนดส่ง ${new Date(assignments?.a_due_date).toLocaleString()}`
                                        : 'ไม่มีกำหนดส่ง'
                                }}
                            </span>
                            <span class="text-sm text-slate-400">
                                {{
                                    assignments?.a_score
                                        ? `${assignments?.a_score} คะแนน`
                                        : 'ไม่มีคะแนน'
                                }}
                            </span>
                        </div>
                    </span>
                </div>
                <div class="w-full md:w-fit">
                    <button
                        v-if="!assignments?.s_datetime"
                        type="button"
                        :disabled="assignPending"
                        class="transition-color inline-flex w-full items-center justify-center gap-x-2 rounded-lg border border-transparent bg-blue-600 px-6 py-2 text-sm font-semibold text-white duration-200 ease-in-out hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50 md:w-fit"
                        @click="
                            () => {
                                if (submitFiles.length) {
                                    submitFile()
                                } else {
                                    makeSubmission([])
                                }
                            }
                        ">
                        ส่ง
                    </button>
                    <button
                        v-else-if="!assignments?.score"
                        type="button"
                        :disabled="assignPending"
                        class="transition-color inline-flex w-full items-center justify-center gap-x-2 rounded-lg border border-transparent bg-blue-600 px-6 py-2 text-sm font-semibold text-white duration-200 ease-in-out hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50 md:w-fit"
                        @click="removeSubmission()">
                        ยกเลิกการส่ง
                    </button>
                    <div v-else class="flex flex-col items-end justify-end">
                        <span class="text-xl">
                            คุณได้
                            {{
                                `${assignments?.score}/${assignments?.a_score}`
                            }}
                            คะแนน
                        </span>
                        <span
                            v-if="assignments?.s_feedback"
                            class="text-slate-800">
                            "{{ assignments?.s_feedback }}"
                        </span>
                    </div>
                </div>
            </div>
            <div v-if="assignments?.a_files?.length" class="mt-4">
                <span class="flex items-center gap-2">
                    <span
                        class="material-icons-outlined size-6 overflow-hidden select-none">
                        attach_file
                    </span>
                    ไฟล์แนบ
                </span>
                <hr class="mb-2" >
            </div>
            <div
                v-if="assignments?.a_files?.length"
                class="flex flex-row flex-wrap gap-2">
                <div
                    v-for="file in assignments?.a_files"
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
                                        file.f_mime_type?.split('/')[0] ===
                                        'image'
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
                                    class="overflow-hidden text-ellipsis whitespace-nowrap text-xs">
                                    {{ file.f_name }}
                                </span>
                            </div>
                        </div>
                        <div class="flex w-fit flex-row items-center gap-2">
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
        <div v-if="!assignPending" class="flex flex-col gap-4 overflow-y-auto">
            <div class="w-full">
                <span class="flex items-center gap-2 font-bold">
                    <span class="material-icons-outlined select-none">
                        article
                    </span>
                    ข้อความ
                </span>
                <hr class="mb-2" >
                <MdPreview
                    v-if="assignments?.s_datetime"
                    :model-value="postContent" />
                <RichEditor v-else @send-text="getRteText" />
            </div>
            <div class="flex w-full flex-col gap-2 md:flex-row md:flex-nowrap">
                <input
                    ref="inputFile"
                    type="file"
                    hidden
                    @change="onFileChangedMat" >
                <!-- End Floating Input -->
                <div>
                    <button
                        v-if="!assignments?.s_datetime"
                        type="button"
                        :disabled="assignPending"
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
                    v-if="!assignments?.s_datetime"
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
                <div class="">
                    <div
                        v-if="assignments?.s_content?.files?.length"
                        class="mt-4">
                        <span class="flex items-center gap-2 font-bold">
                            <span
                                class="material-icons-outlined size-6 overflow-hidden select-none">
                                attach_file
                            </span>
                            ไฟล์ที่ส่งไป
                        </span>
                        <hr class="mb-2" >
                    </div>
                    <div
                        v-if="assignments?.s_content?.files?.length"
                        class="flex flex-row flex-wrap gap-2">
                        <div
                            v-for="file in assignments?.s_content?.files"
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
                                            class="overflow-hidden text-ellipsis whitespace-nowrap text-xs">
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
            </div>
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
