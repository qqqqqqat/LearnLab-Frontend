<script setup lang="ts">
    import { toast } from '@steveyuowo/vue-hot-toast'
    definePageMeta({
        layout: 'course',
    })

    const crs_pending = ref(true)
    const assignments = ref<SubmissionGETApiResponse | null>()
    const route = useRoute()
    async function fetchSubmission(id: number, a_id: number) {
        await $fetch<SubmissionGETApiResponse>(
            '/api/courses/assignment/submit/',
            {
                query: { c_id: id, a_id: a_id },
            }
        )
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
        await navigateTo(
            `/courses/assignment/submissionview?a_id=${a_id}&id=${route.query.id}&u_id=${u_id}`
        )
    }

    function getTimeDiff(due_date: string, submit_date: string) {
        const millis =
            new Date(due_date).getTime() - new Date(submit_date).getTime()
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
    if (route.query.id && route.query.a_id) {
        fetchSubmission(route.query.id, route.query.a_id)
    } else {
        navigateTo('/courses', { replace: true })
    }
</script>
<template>
    <div class="flex w-full flex-col gap-4">
        <div class="flex flex-row items-center gap-2">
            <button
                class="inline-flex items-center gap-x-2 rounded-lg border border-transparent px-3 py-2 text-sm font-semibold text-blue-600 transition-all duration-200 ease-in-out hover:bg-blue-100 hover:text-blue-800 disabled:pointer-events-none disabled:opacity-50"
                @click="navigateTo(`/courses/assignment?id=${route.query.id}`)">
                <span class="material-icons-outlined">arrow_back</span>
            </button>
            <div class="flex flex-col">
                <span class="text-2xl font-bold">
                    {{ assignments?.a_name }}
                </span>
                <span class="text-sm">
                    {{
                        assignments?.a_due_date
                            ? `กำหนดส่ง ${new Date(assignments?.a_due_date).toLocaleString()}`
                            : 'ไม่มีกำหนดส่ง'
                    }}
                </span>
            </div>
        </div>
        <div
            v-for="assign in assignments?.data"
            v-if="(assignments?.data?.length || 0) > 0"
            class="border-1 flex w-full flex-col gap-2 rounded-md border p-4 md:flex-row md:justify-between">
            <div class="flex items-center gap-2">
                <div v-if="assign.u_avatar" class="h-12 w-12 rounded-md">
                    <img
                        class="bottom-1 aspect-square rounded-md border object-cover"
                        :src="`/api/avatar/?u_id=${assign.u_id}`" >
                </div>
                <div
                    v-if="!assign?.u_avatar"
                    class="flex h-12 w-12 select-none flex-col items-center justify-center rounded-md bg-slate-200 text-2xl">
                    {{
                        `${assign?.u_firstname.slice(0, 1)}${assign?.u_lastname.slice(0, 1)}`
                    }}
                </div>
                <div class="flex justify-center">
                    {{ assign.u_firstname }} {{ assign.u_lastname }}
                </div>
            </div>
            <div
                class="flex items-center justify-between gap-4 md:justify-normal">
                <div
                    class="flex flex-row-reverse items-center gap-2 md:flex-row">
                    <div class="flex flex-col items-start md:items-end">
                        {{ assign.s_datetime ? 'ส่งแล้ว' : 'ยังไม่ส่ง' }}
                        {{ assign?.score ? 'ให้คะแนนแล้ว' : '' }}
                        <span
                            v-if="
                                assignments?.a_due_date &&
                                assign?.s_datetime &&
                                getTimeDiff(
                                    assignments.a_due_date,
                                    assign?.s_datetime
                                ).isLate
                            "
                            class="text-xs text-red-400">
                            {{
                                getTimeDiff(
                                    assignments.a_due_date,
                                    assign?.s_datetime
                                ).isLate
                                    ? 'ส่งช้า'
                                    : ''
                            }}
                            {{
                                getTimeDiff(
                                    assignments.a_due_date,
                                    assign?.s_datetime
                                )?.day
                                    ? `${getTimeDiff(assignments.a_due_date, assign?.s_datetime).day} วัน`
                                    : ''
                            }}
                            {{
                                getTimeDiff(
                                    assignments.a_due_date,
                                    assign?.s_datetime
                                )?.hour
                                    ? `${getTimeDiff(assignments.a_due_date, assign?.s_datetime).hour} ชั่วโมง`
                                    : ''
                            }}
                            {{
                                getTimeDiff(
                                    assignments.a_due_date,
                                    assign?.s_datetime
                                )?.minute
                                    ? `${getTimeDiff(assignments.a_due_date, assign?.s_datetime).minute} นาที`
                                    : ''
                            }}
                            {{
                                getTimeDiff(
                                    assignments.a_due_date,
                                    assign?.s_datetime
                                )?.second
                                    ? `${getTimeDiff(assignments.a_due_date, assign?.s_datetime).second} วินาที`
                                    : ''
                            }}
                        </span>
                    </div>
                    <div class="material-icons-outlined">
                        {{ assign.s_datetime ? 'check_circle' : 'close' }}
                    </div>
                </div>
                <button
                    type="button"
                    :disabled="!assign.s_datetime"
                    class="inline-flex flex-shrink-0 items-center justify-center gap-x-2 rounded-lg border border-transparent bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition-colors duration-150 ease-in-out hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50"
                    @click="openAssignment(assign.a_id, assign.u_id)">
                    ดูงาน
                    <span class="material-icons-outlined">remove_red_eye</span>
                </button>
            </div>
        </div>
        <div
            v-else-if="!crs_pending && (assignments?.data?.length || 0) === 0"
            class="border-1 flex w-full flex-col items-center gap-2 rounded-md border p-4 md:flex-row">
            <img class="w-64" src="~/assets/images/content.svg" >
            <span class="text-3xl font-bold">ยังไม่มีการส่งงาน</span>
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
