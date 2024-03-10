<script setup lang="ts">
    import { toast } from '@steveyuowo/vue-hot-toast'
    import { MdPreview } from 'md-editor-v3'
    const userRole = useUserCourseState()
    const assignments = ref<GETOneSubmissionAPIResponse | null>(null)
    const assignPending = ref(true)
    const postContent = ref<string | null>('')
    const assignmentScore = ref<number | null >(null)
    const assignmentFeedback = ref<string>("")
    const submitTime = ref<{ isLate: boolean; day: number; hour: number; minute: number; second: number }>()
    definePageMeta({
        layout: 'course',
    })

    async function getOneAssignment(id: number, a_id: number, u_id: number) {
        await $fetch<GETOneSubmissionAPIResponse>('/api/courses/assignment/submit/', {
            query: {
                c_id: id,
                a_id: a_id,
                u_id: u_id,
            },
        })
            .then((res) => {
                assignments.value = res
                assignmentFeedback.value = res?.data.s_feedback
                assignmentScore.value = res?.data.score
                submitTime.value = getTimeDiff(new Date(assignments.value?.data?.a_due_date).getTime() - new Date(assignments.value?.data?.s_datetime).getTime())
                assignPending.value = false
            })
            .catch((err) => {
                toast.error(err?.data?.message)
                navigateTo('/mycourse', { replace: true })
            })
    }

    async function setStudentFeedback(id: number, a_id: number, u_id: number) {
        assignPending.value = true
        await $fetch<{status: number, message: string}>('/api/courses/assignment/submit/', {
            method: 'PATCH',
            body: {
                u_id: u_id,
                a_id: a_id,
                s_feedback: assignmentFeedback.value,
                score: assignmentScore.value
            },
        })
            .then((res) => {
                assignPending.value = false
                toast.success(res?.message)
            })
            .catch((err) => {
                assignPending.value = false
                toast.error(err?.data?.message)
            })
    }

    async function downloadFile(f_id: number) {
        await navigateTo(`/api/file?f_id=${f_id}`, { open: { target: '_blank' } })
    }

    const route = useRoute()
    if (route.query.id && route.query.a_id && route.query.u_id) {
        getOneAssignment(route.query.id, route.query.a_id, route.query.u_id)
    }

    function getTimeDiff(millis: number) {
        let timeRemainingSec = Math.floor(millis / 1000)
        let timeRemainingMin = Math.floor(millis / (1000 * 60))
        let timeRemainingHr = Math.floor(millis / (1000 * 60 * 60))
        let timeRemainingDay = Math.floor(millis / (1000 * 60 * 60 * 24))
        return {
            isLate: !(timeRemainingDay >= 0 && timeRemainingHr >= 0 && timeRemainingMin >= 0 && timeRemainingSec >= 0),
            day: Math.abs(timeRemainingDay),
            hour: Math.abs(timeRemainingHr) % 24,
            minute: Math.abs(timeRemainingMin) % 60,
            second: Math.abs(timeRemainingSec) % 60,
        }
    }
</script>
<template>
    <div class="flex flex-col w-full">
        <div class="flex md:flex-row flex-col md:justify-between md:items-center gap-2">
            <div class="flex items-start gap-2">
                <div>
                    <button
                        @click="navigateTo(`/courses/assignment/view?id=${route.query.id}&a_id=${route.query.a_id}`)"
                        class="transition-all duration-200 ease-in-out py-2 px-3 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-blue-600 hover:bg-blue-100 hover:text-blue-800 disabled:opacity-50 disabled:pointer-events-none">
                        <span class="material-icons-outlined">arrow_back</span>
                    </button>
                </div>
                <span class="text-2xl font-bold">
                    <span>งานของ {{ assignments?.data.u_firstname }} {{ assignments?.data.u_lastname }}</span>
                    <div class="flex flex-col">
                        <span class="text-sm text-slate-400">{{ assignments?.data.a_due_date ? `กำหนดส่ง ${new Date(assignments?.data.a_due_date).toLocaleString()}` : 'ไม่มีกำหนดส่ง' }}</span>
                        <span class="text-sm text-slate-400">{{ assignments?.data.a_score ? `${assignments?.data.a_score} คะแนน` : 'ไม่มีคะแนน' }}</span>
                    </div>
                    <hr class="my-2" />
                    <div class="flex flex-col font-normal">
                        <span class="text-sm text-slate-400">ส่งมาเวลา {{ new Date(assignments?.data?.s_datetime).toLocaleString() }}</span>
                        <span
                            class="text-xs"
                            :class="getTimeDiff(new Date(assignments?.data.a_due_date).getTime() - new Date(assignments?.data?.s_datetime).getTime()).isLate ? 'text-red-00' : 'text-emerald-500'"
                            v-if="assignments?.data?.a_due_date && assignments?.data.s_datetime">
                            {{ getTimeDiff(new Date(assignments?.data.a_due_date).getTime() - new Date(assignments?.data?.s_datetime).getTime()).isLate ? 'ส่งช้า' : 'ส่งก่อนกำหนด' }}
                            {{ submitTime?.day ? `${submitTime.day} วัน` : '' }} {{ submitTime?.hour ? `${submitTime.hour} ชั่วโมง` : '' }} {{ submitTime?.minute ? `${submitTime.minute} นาที` : '' }}
                            {{ submitTime?.second ? `${submitTime.second} วินาที` : '' }}
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
        <hr class="mb-2" />
        <div class="flex flex-col gap-2 mb-3">
            <div class="flex flex-row justify-between  items-center gap-x-2">
                <div class="flex flex-row items-center gap-x-2">
                    <input type="number" v-model="assignmentScore" class="py-2 px-3 block w-24 border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none" placeholder="คะแนน">
                    <span> / {{ assignments?.data.a_score }} คะแนน</span>
                </div>
                <div>
                    <button
                    @click="setStudentFeedback(route.query.id, route.query.a_id, route.query.u_id)"
                    type="button"
                    :disabled="assignPending || !assignmentScore"
                    class="md:w-fit w-full justify-center transition-color duration-200 ease-in-out py-2 px-6 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none">
                    บันทึก
                </button>
                </div>
            </div>
            <textarea v-model="assignmentFeedback" class="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none" rows="3" placeholder="Feedback"></textarea>
        </div>
        <div class="w-full" v-if="assignments?.data?.s_content?.text">
            <span class="flex items-center gap-2 font-bold">
                <span class="material-icons-outlined select-none">article</span>
                ข้อความจากนักเรียน
            </span>
            <hr class="mb-2" />
            <MdPreview language="en-US" :modelValue="assignments?.data?.s_content?.text" />
        </div>
        <div class="mt-4" v-if="assignments?.data?.s_content?.files.length">
            <span class="flex items-center gap-2 font-bold">
                <span class="material-icons-outlined select-none">attach_file</span>
                ไฟล์จากนักเรียน
            </span>
            <hr class="mb-2" />
        </div>
        <div class="flex md:flex-row flex-col overflow-auto gap-x-4 gap-y-2" v-if="assignments?.data?.s_content?.files.length">
            <div class="flex flex-row flex-wrap gap-2" v-if="assignments?.data?.s_content?.files">
                <div v-for="file in assignments?.data?.s_content?.files" class="flex flex-row border border-1 rounded-md md:w-72 w-full p-2 mt-1">
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
</template>
