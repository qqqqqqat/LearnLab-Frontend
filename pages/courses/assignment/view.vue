<script setup lang="ts">
    definePageMeta({
        layout: 'course',
    })
    import { toast } from '@steveyuowo/vue-hot-toast'

    const crs_pending = ref(true)
    const assignments = ref<SubmissionGETApiResponse | null>()
    const route = useRoute()
    async function fetchSubmission(id: number, a_id: number) {
        await $fetch<SubmissionGETApiResponse>('/api/courses/assignment/submit/', {
            query: { c_id: id, a_id: a_id },
        })
            .then((res) => {
                assignments.value = res
                crs_pending.value = false
            })
            .catch((err) => {
                toast.error(err?.data?.message)
                navigateTo('/mycourse', { replace: true })
            })
    }

    async function openAssignment(a_id: number, u_id: number) {
        await navigateTo(`/courses/assignment/submissionview?a_id=${a_id}&id=${route.query.id}&u_id=${u_id}`)
    }

    function getTimeDiff(due_date: string, submit_date: string) {
        const millis = new Date(due_date).getTime() - new Date(submit_date).getTime()
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
    if (route.query.id && route.query.a_id) {
        fetchSubmission(route.query.id, route.query.a_id)
    } else {
        navigateTo('/courses', { replace: true })
    }
</script>
<template>
    <div class="flex flex-col gap-4 w-full">
        <div class="flex flex-row gap-2 items-center">
            <button
                @click="navigateTo(`/courses/assignment?id=${route.query.id}`)"
                class="transition-all duration-200 ease-in-out py-2 px-3 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-blue-600 hover:bg-blue-100 hover:text-blue-800 disabled:opacity-50 disabled:pointer-events-none">
                <span class="material-icons-outlined">arrow_back</span>
            </button>
            <div class="flex flex-col">
                <span class="font-bold text-2xl">{{ assignments?.a_name }}</span>
                <span class="text-sm">{{ assignments?.a_due_date ? `กำหนดส่ง ${new Date(assignments?.a_due_date).toLocaleString()}` : 'ไม่มีกำหนดส่ง' }}</span>
            </div>
        </div>
        <div v-if="(assignments?.data?.length || 0) > 0" v-for="assign in assignments?.data" class="flex md:flex-row flex-col md:justify-between border border-1 rounded-md gap-2 w-full p-4">
            <div class="flex items-center gap-2">
                <div v-if="assign.u_avatar" class="rounded-md w-12 h-12"><img class="rounded-md aspect-square object-cover border bottom-1" :src="`/api/avatar/?u_id=${assign.u_id}`" /></div>
                <div class="rounded-md w-12 h-12 bg-slate-200 flex flex-col justify-center items-center text-2xl select-none" v-if="!assign?.u_avatar">
                    {{ `${assign?.u_firstname.slice(0, 1)}${assign?.u_lastname.slice(0, 1)}` }}
                </div>
                <div class="flex justify-center">{{ assign.u_firstname }} {{ assign.u_lastname }}</div>
            </div>
            <div class="flex gap-4 items-center md:justify-normal justify-between">
                <div class="flex md:flex-row flex-row-reverse items-center gap-2">
                    <div class="flex flex-col md:items-end items-start">
                        {{ assign.s_datetime ? 'ส่งแล้ว' : 'ยังไม่ส่ง' }} {{ assign?.score ? 'ให้คะแนนแล้ว' : '' }}
                        <span class="text-xs text-red-400" v-if="assignments?.a_due_date && assign?.s_datetime && getTimeDiff(assignments.a_due_date, assign?.s_datetime).isLate">
                            {{ getTimeDiff(assignments.a_due_date, assign?.s_datetime).isLate ? 'ส่งช้า' : '' }}
                            {{ getTimeDiff(assignments.a_due_date, assign?.s_datetime)?.day ? `${getTimeDiff(assignments.a_due_date, assign?.s_datetime).day} วัน` : '' }}
                            {{ getTimeDiff(assignments.a_due_date, assign?.s_datetime)?.hour ? `${getTimeDiff(assignments.a_due_date, assign?.s_datetime).hour} ชั่วโมง` : '' }}
                            {{ getTimeDiff(assignments.a_due_date, assign?.s_datetime)?.minute ? `${getTimeDiff(assignments.a_due_date, assign?.s_datetime).minute} นาที` : '' }}
                            {{ getTimeDiff(assignments.a_due_date, assign?.s_datetime)?.second ? `${getTimeDiff(assignments.a_due_date, assign?.s_datetime).second} วินาที` : '' }}
                        </span>
                    </div>
                    <div class="material-icons-outlined">{{ assign.s_datetime ? 'check_circle' : 'close' }}</div>
                </div>
                <button
                    type="button"
                    @click="openAssignment(assign.a_id, assign.u_id)"
                    :disabled="!assign.s_datetime"
                    class="py-2 px-3 flex-shrink-0 transition-colors duration-150 ease-in-out inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none">
                    ดูงาน
                    <span class="material-icons-outlined">remove_red_eye</span>
                </button>
            </div>
        </div>
        <div v-else-if="!crs_pending && (assignments?.data?.length || 0) === 0" class="flex md:flex-row flex-col items-center border border-1 rounded-md gap-2 w-full p-4">
            <img class="w-64" src="~/assets/images/content.svg" />
            <span class="text-3xl font-bold">ยังไม่มีการส่งงาน</span>
        </div>
        <div v-else class="flex flex-row border border-1 rounded-md gap-2 w-full p-4">
            <div class="animate-spin inline-block size-6 border-[3px] border-current border-t-transparent text-blue-600 rounded-full dark:text-blue-500" role="status" aria-label="loading">
                <span class="sr-only">Loading...</span>
            </div>
            กำลังโหลดข้อมูล
        </div>
    </div>
</template>
