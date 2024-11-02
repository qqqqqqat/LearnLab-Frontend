<script setup lang="ts">
    import { toast } from '@steveyuowo/vue-hot-toast'
    import { MdPreview } from 'md-editor-v3'
    import { useQueryStringAsNumber } from '#imports'
    import { downloadFile } from '~/utils/downloadFile';

    const assignments = ref<GETOneSubmissionAPIResponse | null>(null)
    const assignPending = ref(true)
    const runtimeConfig = useRuntimeConfig()
    const assignmentScore = ref<number | null>(null)
    const assignmentFeedback = ref<string | null>('')
    const submitTime = ref<{
        isLate: boolean
        day: number
        hour: number
        minute: number
        second: number
    }>()
    definePageMeta({
        layout: 'course',
    })

    async function getOneAssignment(id: number, a_id: number, u_id: number) {
        await $fetchWithHeader<GETOneSubmissionAPIResponse>(
            '/api/courses/assignment/submit/',
            {
                query: {
                    c_id: id,
                    a_id: a_id,
                    u_id: u_id,
                },
            }
        )
            .then((res) => {
                assignments.value = res
                assignmentFeedback.value = res?.data.s_feedback
                assignmentScore.value = res?.data.score
                submitTime.value = getTimeDiff(
                    new Date(assignments.value?.data?.a_due_date).getTime() -
                        new Date(assignments.value?.data?.s_datetime).getTime()
                )
                assignPending.value = false
            })
            .catch((err) => {
                toast.error(err?.data?.message)
                navigateTo('/mycourse', { replace: true })
            })
    }

    async function setStudentFeedback(id: number, a_id: number, u_id: number) {
        assignPending.value = true
        await $fetchWithHeader<{ status: number; message: string }>(
            '/api/courses/assignment/submit/',
            {
                method: 'PATCH',
                body: {
                    u_id: u_id,
                    a_id: a_id,
                    s_feedback: assignmentFeedback.value,
                    score: assignmentScore.value,
                },
            }
        )
            .then((res) => {
                assignPending.value = false
                toast.success(res?.message)
            })
            .catch((err) => {
                assignPending.value = false
                toast.error(err?.data?.message)
            })
    }

    const route = useRoute()
    if (route.query.id && route.query.a_id && route.query.u_id) {
        getOneAssignment(
            useQueryStringAsNumber(route.query.id),
            useQueryStringAsNumber(route.query.a_id),
            useQueryStringAsNumber(route.query.u_id)
        )
    } else {
        navigateTo('/courses', { replace: true })
    }

    function getTimeDiff(millis: number) {
        const timeRemainingSec = Math.floor(millis / 1000)
        const timeRemainingMin = Math.floor(millis / (1000 * 60))
        const timeRemainingHr = Math.floor(millis / (1000 * 60 * 60))
        const timeRemainingDay = Math.floor(millis / (1000 * 60 * 60 * 24))
        return {
            isLate: !(
                timeRemainingDay >= 0 &&
                timeRemainingHr >= 0 &&
                timeRemainingMin >= 0 &&
                timeRemainingSec >= 0
            ),
            day: Math.abs(timeRemainingDay),
            hour: Math.abs(timeRemainingHr) % 24,
            minute: Math.abs(timeRemainingMin) % 60,
            second: Math.abs(timeRemainingSec) % 60,
        }
    }
</script>
<template>
    <div class="flex w-full flex-col">
        <div
            class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div class="flex items-start gap-2">
                <div>
                    <button
                        class="inline-flex items-center gap-x-2 rounded-lg border border-transparent px-3 py-2 text-sm font-semibold text-blue-600 transition-all duration-200 ease-in-out hover:bg-blue-100 hover:text-blue-800 disabled:pointer-events-none disabled:opacity-50"
                        @click="
                            navigateTo(
                                `/courses/assignment/view?id=${useQueryStringAsNumber(route.query.id)}&a_id=${useQueryStringAsNumber(route.query.a_id)}`
                            )
                        ">
                        <span
                            class="material-icons-outlined size-6 overflow-hidden select-none">
                            arrow_back
                        </span>
                    </button>
                </div>
                <span class="text-2xl font-bold">
                    <span>
                        งานของ {{ assignments?.data.u_firstname }}
                        {{ assignments?.data.u_lastname }}
                    </span>
                    <div class="flex flex-col">
                        <span class="text-sm text-slate-400">
                            {{
                                assignments?.data.a_due_date
                                    ? `กำหนดส่ง ${new Date(assignments?.data.a_due_date).toLocaleString()}`
                                    : 'ไม่มีกำหนดส่ง'
                            }}
                        </span>
                        <span class="text-sm text-slate-400">
                            {{
                                assignments?.data.a_score
                                    ? `${assignments?.data.a_score} คะแนน`
                                    : 'ไม่มีคะแนน'
                            }}
                        </span>
                    </div>
                    <hr class="my-2" >
                    <div class="flex flex-col font-normal">
                        <span class="text-sm text-slate-400">
                            ส่งมาเวลา
                            {{
                                new Date(
                                    assignments?.data?.s_datetime
                                ).toLocaleString()
                            }}
                        </span>
                        <span
                            v-if="
                                assignments?.data?.a_due_date &&
                                assignments?.data.s_datetime
                            "
                            class="text-xs"
                            :class="
                                getTimeDiff(
                                    new Date(
                                        assignments?.data.a_due_date
                                    ).getTime() -
                                        new Date(
                                            assignments?.data?.s_datetime
                                        ).getTime()
                                ).isLate
                                    ? 'text-red-00'
                                    : 'text-emerald-500'
                            ">
                            {{
                                getTimeDiff(
                                    new Date(
                                        assignments?.data.a_due_date
                                    ).getTime() -
                                        new Date(
                                            assignments?.data?.s_datetime
                                        ).getTime()
                                ).isLate
                                    ? 'ส่งช้า'
                                    : 'ส่งก่อนกำหนด'
                            }}
                            {{ submitTime?.day ? `${submitTime.day} วัน` : '' }}
                            {{
                                submitTime?.hour
                                    ? `${submitTime.hour} ชั่วโมง`
                                    : ''
                            }}
                            {{
                                submitTime?.minute
                                    ? `${submitTime.minute} นาที`
                                    : ''
                            }}
                            {{
                                submitTime?.second
                                    ? `${submitTime.second} วินาที`
                                    : ''
                            }}
                        </span>
                    </div>
                </span>
            </div>
        </div>
    </div>
    <div class="flex flex-col overflow-y-auto">
        <span class="flex items-center gap-2 font-bold">
            <span class="material-icons-outlined select-none">feedback</span>
            Feedback
        </span>
        <hr class="mb-2" >
        <div class="mb-3 flex flex-col gap-2">
            <div class="flex flex-row items-center justify-between gap-x-2">
                <div class="flex flex-row items-center gap-x-2">
                    <input
                        v-model="assignmentScore"
                        type="number"
                        class="block w-24 rounded-lg border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50"
                        placeholder="คะแนน" >
                    <span>/ {{ assignments?.data.a_score }} คะแนน</span>
                </div>
                <div>
                    <button
                        type="button"
                        :disabled="assignPending || !assignmentScore"
                        class="transition-color inline-flex w-full items-center justify-center gap-x-2 rounded-lg border border-transparent bg-blue-600 px-6 py-2 text-sm font-semibold text-white duration-200 ease-in-out hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50 md:w-fit"
                        @click="
                            setStudentFeedback(
                                useQueryStringAsNumber(route.query.id),
                                useQueryStringAsNumber(route.query.a_id),
                                useQueryStringAsNumber(route.query.u_id)
                            )
                        ">
                        บันทึก
                    </button>
                </div>
            </div>
            <textarea
                v-model="assignmentFeedback"
                class="block w-full rounded-lg border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50"
                rows="3"
                placeholder="Feedback" />
        </div>
        <div v-if="assignments?.data?.s_content?.text" class="w-full">
            <span class="flex items-center gap-2 font-bold">
                <span class="material-icons-outlined select-none">article</span>
                ข้อความจากนักเรียน
            </span>
            <hr class="mb-2" >
            <MdPreview
                language="en-US"
                :model-value="assignments?.data?.s_content?.text" />
        </div>
        <div v-if="assignments?.data?.s_content?.files.length" class="mt-4">
            <span class="flex items-center gap-2 font-bold">
                <span class="material-icons-outlined select-none">
                    attach_file
                </span>
                ไฟล์จากนักเรียน
            </span>
            <hr class="mb-2" >
        </div>
        <div
            v-if="assignments?.data?.s_content?.files.length"
            class="flex flex-col gap-x-4 gap-y-2 overflow-auto md:flex-row">
            <div
                v-if="assignments?.data?.s_content?.files"
                class="flex flex-row flex-wrap gap-2">
                <div
                    v-for="file in assignments?.data?.s_content?.files"
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