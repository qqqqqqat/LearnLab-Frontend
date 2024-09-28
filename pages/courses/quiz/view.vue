<script setup lang="ts">
    definePageMeta({
        layout: 'course',
    })
    import { toast } from '@steveyuowo/vue-hot-toast'

    const _pending = ref(true)
    const quizzes = ref()
    const route = useRoute()
    async function fetchSubmission(id: number, q_id: number) {
        await $fetch('/api/courses/quiz/submit/', {
            query: { c_id: id, q_id: q_id },
        })
            .then((res) => {
                quizzes.value = res
                _pending.value = false
            })
            .catch((err) => {
                toast.error(err?.data?.message)
                navigateTo('/mycourse', { replace: true })
            })
    }

    // async function openAssignment(q_id: number, u_id: number) {
    //     await navigateTo(`/courses/assignment/submissionview?q_id=${q_id}&id=${route.query.id}&u_id=${u_id}`)
    // }

    function getTimeDiff(due_date: string, submit_date: string) {
        const millis =
            new Date(due_date).getTime() - new Date(submit_date).getTime()
        let timeRemainingSec = Math.floor(millis / 1000)
        let timeRemainingMin = Math.floor(millis / (1000 * 60))
        let timeRemainingHr = Math.floor(millis / (1000 * 60 * 60))
        let timeRemainingDay = Math.floor(millis / (1000 * 60 * 60 * 24))
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
    if (route.query.id && route.query.q_id) {
        fetchSubmission(route.query.id, route.query.q_id)
    } else {
        navigateTo('/courses', { replace: true })
    }
</script>
<template>
    <div class="flex w-full flex-col gap-4">
        <div class="flex flex-row items-center gap-2">
            <button
                @click="navigateTo(`/courses/quiz?id=${route.query.id}`)"
                class="inline-flex items-center gap-x-2 rounded-lg border border-transparent px-3 py-2 text-sm font-semibold text-blue-600 transition-all duration-200 ease-in-out hover:bg-blue-100 hover:text-blue-800 disabled:pointer-events-none disabled:opacity-50">
                <span class="material-icons-outlined">arrow_back</span>
            </button>
            <div class="flex flex-col">
                <span class="text-2xl font-bold">{{ quizzes?.q_name }}</span>
                <span class="text-sm">
                    {{
                        quizzes?.q_due_date
                            ? `กำหนดส่ง ${new Date(quizzes?.q_due_date).toLocaleString()}`
                            : 'ไม่มีกำหนดส่ง'
                    }}
                </span>
            </div>
        </div>
        <div
            v-if="(quizzes?.data?.length || 0) > 0"
            v-for="quiz in quizzes?.data"
            class="border-1 flex w-full flex-col gap-2 rounded-md border p-4 md:flex-row md:justify-between">
            <div class="flex items-center gap-2">
                <div v-if="quiz.u_avatar" class="h-12 w-12 rounded-md">
                    <img
                        class="bottom-1 aspect-square rounded-md border object-cover"
                        :src="`/api/avatar/?u_id=${quiz.u_id}`" />
                </div>
                <div
                    class="flex h-12 w-12 select-none flex-col items-center justify-center rounded-md bg-slate-200 text-2xl"
                    v-if="!quiz?.u_avatar">
                    {{
                        `${quiz?.u_firstname.slice(0, 1)}${quiz?.u_lastname.slice(0, 1)}`
                    }}
                </div>
                <div class="flex justify-center">
                    {{ quiz.u_firstname }} {{ quiz.u_lastname }}
                </div>
            </div>
            <div
                class="flex items-center justify-between gap-4 md:justify-normal">
                <div
                    class="flex flex-row-reverse items-center gap-2 md:flex-row">
                    <div class="flex flex-col items-start md:items-end">
                        {{ quiz.s_datetime ? 'ส่งแล้ว' : 'ยังไม่ส่ง' }}
                        {{
                            quiz?.score
                                ? `ได้ ${quiz?.score}/${quizzes?.full_score} คะแนน`
                                : ''
                        }}
                        <span
                            class="text-sm text-slate-400"
                            v-if="
                                quizzes?.q_due_date &&
                                quiz?.s_datetime &&
                                !getTimeDiff(
                                    quizzes.q_due_date,
                                    quiz?.s_datetime
                                ).isLate
                            ">
                            ส่งมาเวลา
                            {{ new Date(quiz?.s_datetime).toLocaleString() }}
                        </span>
                        <span
                            class="text-xs text-red-400"
                            v-if="
                                quizzes?.q_due_date &&
                                quiz?.s_datetime &&
                                getTimeDiff(
                                    quizzes.q_due_date,
                                    quiz?.s_datetime
                                ).isLate
                            ">
                            {{
                                getTimeDiff(
                                    quizzes.q_due_date,
                                    quiz?.s_datetime
                                ).isLate
                                    ? 'ส่งช้า'
                                    : ''
                            }}
                            {{
                                getTimeDiff(
                                    quizzes.q_due_date,
                                    quiz?.s_datetime
                                )?.day
                                    ? `${getTimeDiff(quizzes.q_due_date, quiz?.s_datetime).day} วัน`
                                    : ''
                            }}
                            {{
                                getTimeDiff(
                                    quizzes.q_due_date,
                                    quiz?.s_datetime
                                )?.hour
                                    ? `${getTimeDiff(quizzes.q_due_date, quiz?.s_datetime).hour} ชั่วโมง`
                                    : ''
                            }}
                            {{
                                getTimeDiff(
                                    quizzes.q_due_date,
                                    quiz?.s_datetime
                                )?.minute
                                    ? `${getTimeDiff(quizzes.q_due_date, quiz?.s_datetime).minute} นาที`
                                    : ''
                            }}
                            {{
                                getTimeDiff(
                                    quizzes.q_due_date,
                                    quiz?.s_datetime
                                )?.second
                                    ? `${getTimeDiff(quizzes.q_due_date, quiz?.s_datetime).second} วินาที`
                                    : ''
                            }}
                        </span>
                    </div>
                    <div class="material-icons-outlined">
                        {{ quiz.s_datetime ? 'check_circle' : 'close' }}
                    </div>
                </div>
            </div>
        </div>
        <div
            v-else-if="!_pending && (quizzes?.data?.length || 0) === 0"
            class="border-1 flex w-full flex-col items-center gap-2 rounded-md border p-4 md:flex-row">
            <img class="w-64" src="~/assets/images/content.svg" />
            <span class="text-3xl font-bold">ยังไม่มีการส่งแบบทดสอบ</span>
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
