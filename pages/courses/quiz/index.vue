<script setup lang="ts">
    import HSOverlay from '@preline/overlay'
    import { toast } from '@steveyuowo/vue-hot-toast'
    definePageMeta({
        layout: 'course',
    })
    const delQuizName = ref()
    const delQuizId = ref()
    const userRole = useUserCourseState()
    const route = useRoute()
    const quizs = ref()
    const quizPending = ref(true)
    async function fetchQuiz(id: number) {
        await $fetch('/api/courses/quiz/', {
            query: {
                c_id: id,
            },
        })
            .then((res) => {
                quizs.value = res
                quizPending.value = false
            })
            .catch((err) => {
                toast.error(err?.data?.message)
                navigateTo('/mycourse', { replace: true })
            })
    }

    async function deleteQuiz(q_id: number) {
        const deleteQuizToast = toast.loading('กำลังลบแบบประเมินผล')

        await $fetch('/api/courses/quiz/', {
            method: 'DELETE',
            body: {
                q_id: delQuizId.value,
                c_id: route.query.id,
            },
        })
            .then((res) => {
                d_closeModal()
                fetchQuiz(route.query.id)
                quizPending.value = true
                toast.update(deleteQuizToast, {
                    type: 'success',
                    message: res?.message,
                })
            })
            .catch((err) => {
                toast.update(deleteQuizToast, {
                    type: 'error',
                    message: err?.data?.message,
                })
                navigateTo('/mycourse', { replace: true })
            })
    }

    async function goToQuiz(q_id: number) {
        if (userRole.value?.[route.query.id] === 'STUDENT') {
            await navigateTo({
                path: '/courses/quiz/begin',
                query: { id: route.query.id, q_id: q_id },
            })
        } else {
            await navigateTo({
                path: '/courses/quiz/view',
                query: { id: route.query.id, q_id: q_id },
            })
        }
    }

    if (route.query.id) {
        fetchQuiz(route.query.id)
    } else {
        navigateTo('/courses', { replace: true })
    }

    function d_closeModal() {
        const instance = HSOverlay.getInstance(quizDeleteModal.value, true)
        if ('element' in instance) {
            instance.element.close()
        }
    }

    function d_openModal() {
        const instance = HSOverlay.getInstance(quizDeleteModal.value, true)
        if ('element' in instance) {
            instance.element.open()
        }
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

    const quizDeleteModal = ref()
</script>
<template>
    <div
        id="quiz-delete-confirm"
        ref="quizDeleteModal"
        class="hs-overlay pointer-events-none fixed start-0 top-0 z-[80] hidden size-full overflow-y-auto overflow-x-hidden opacity-0 transition-all hs-overlay-open:opacity-100 hs-overlay-open:duration-500">
        <div
            class="m-3 opacity-0 transition-all hs-overlay-open:opacity-100 hs-overlay-open:duration-500 sm:mx-auto sm:w-full sm:max-w-lg">
            <div
                class="pointer-events-auto flex flex-col rounded-md border bg-white shadow-sm">
                <div
                    class="flex items-center justify-between border-b px-4 py-3">
                    <h3 class="font-bold text-gray-800">ยืนยันการลบแบบทดสอบ</h3>
                    <button
                        type="button"
                        class="flex size-7 items-center justify-center rounded-full border border-transparent text-sm font-semibold text-gray-800 hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-50"
                        data-hs-overlay="#quiz-delete-confirm">
                        <span class="sr-only">Close</span>
                        <svg
                            class="size-4 flex-shrink-0"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round">
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                        </svg>
                    </button>
                </div>
                <div class="flex flex-col gap-4 p-6">
                    <div>
                        คุณกำลังจะลบ {{ delQuizName }},
                        คุณแน่ใจว่าต้องการลบใช่ไหม
                    </div>
                </div>
                <div class="flex items-center justify-end gap-x-2 px-4 py-3">
                    <button
                        type="button"
                        class="inline-flex items-center gap-x-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50"
                        data-hs-overlay="#quiz-delete-confirm">
                        ไม่ใช่
                    </button>
                    <button
                        type="button"
                        class="transition-color inline-flex items-center gap-x-2 rounded-lg border border-transparent bg-rose-600 px-3 py-2 text-sm font-semibold text-white duration-200 ease-in-out hover:bg-rose-700 disabled:pointer-events-none disabled:opacity-50"
                        @click="deleteQuiz(delQuizId)">
                        ใช่
                    </button>
                </div>
            </div>
        </div>
    </div>

    <div class="flex w-full flex-col gap-4">
        <div
            v-show="!quizPending"
            class="flex flex-row items-center justify-between gap-4">
            <div />
            <NuxtLink
                v-if="userRole?.[route.query.id] === 'INSTRUCTOR'"
                :to="`/courses/quiz/create?id=${route.query.id}`"
                class="inline-flex flex-shrink-0 items-center justify-center gap-x-2 rounded-lg border border-transparent bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition-colors duration-150 ease-in-out hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50">
                <span
                    class="material-icons-outlined size-6 overflow-hidden select-none">
                    add
                </span>
                สร้างแบบทดสอบ
            </NuxtLink>
        </div>
        <div
            v-for="quiz in quizs"
            v-if="(quizs?.length || 0) > 0"
            class="border-1 flex w-full flex-row justify-between gap-2 rounded-md border p-4">
            <div>
                <div class="flex w-full flex-wrap items-center gap-4">
                    <div class="flex flex-col">
                        <span class="text-sm text-slate-400">
                            {{
                                quiz.q_begin_date
                                    ? `เริ่มทำได้เมื่อ ${new Date(quiz.q_begin_date).toLocaleString()}`
                                    : ''
                            }}
                        </span>
                        <span class="text-sm text-slate-400">
                            {{
                                quiz.q_due_date
                                    ? `กำหนดส่ง ${new Date(quiz.q_due_date).toLocaleString()}`
                                    : 'ไม่มีกำหนดส่ง'
                            }}
                        </span>
                    </div>
                </div>
                <div
                    class="flex flex-row flex-nowrap items-center gap-2 text-xl font-bold">
                    <span
                        v-if="userRole?.[route.query.id] !== 'STUDENT'"
                        class="flex items-center justify-center rounded-full bg-blue-500 px-2 py-1 text-xs font-normal text-white">
                        ID: {{ quiz?.q_id }}
                    </span>
                    {{ quiz.q_name }}
                </div>
            </div>
            <div class="flex items-center gap-2">
                <span
                    v-if="userRole?.[route.query.id] !== 'STUDENT'"
                    class="material-icons-outlined cursor-pointer select-none hover:text-blue-600"
                    @click="
                        navigateTo(
                            `/courses/quiz/edit?id=${route.query.id}&q_id=${quiz.q_id}`
                        )
                    ">
                    edit
                </span>
                <span
                    v-if="userRole?.[route.query.id] !== 'STUDENT'"
                    class="material-icons-outlined cursor-pointer select-none hover:text-rose-600"
                    @click="
                        () => {
                            delQuizName = quiz.q_name
                            delQuizId = quiz.q_id
                            d_openModal()
                        }
                    ">
                    delete
                </span>
                <button
                    v-if="!quiz.s_datetime"
                    :disabled="
                        quiz.q_begin_date
                            ? new Date().getTime() -
                                  new Date(quiz.q_begin_date).getTime() <
                              0
                            : false
                    "
                    type="button"
                    class="inline-flex flex-shrink-0 select-none items-center justify-center gap-x-2 rounded-lg border border-transparent bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition-colors duration-150 ease-in-out hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50"
                    @click="goToQuiz(quiz.q_id)">
                    <span class="material-icons-outlined select-none">
                        remove_red_eye
                    </span>
                    {{
                        userRole?.[route.query.id] === 'STUDENT'
                            ? quiz.q_begin_date
                                ? new Date().getTime() -
                                      new Date(quiz.q_begin_date).getTime() <
                                  0
                                    ? 'ยังไม่ถึงเวลาเริ่มทำ'
                                    : 'ทำแบบทดสอบ'
                                : 'ทำแบบทดสอบ'
                            : 'ดูการส่ง'
                    }}
                </button>
                <div
                    v-if="userRole?.[route.query.id] === 'STUDENT'"
                    class="flex flex-col items-start md:items-end">
                    {{ quiz.s_datetime ? 'ส่งแล้ว' : '' }}
                    {{
                        quiz?.score
                            ? `ได้
                            ${quiz?.score}/${quiz?.full_score} คะแนน`
                            : ''
                    }}
                    <span
                        v-if="
                            quiz?.q_due_date &&
                            quiz?.s_datetime &&
                            !getTimeDiff(quiz.q_due_date, quiz?.s_datetime)
                                .isLate
                        "
                        class="text-sm text-slate-400">
                        ส่งมาเวลา
                        {{ new Date(quiz?.s_datetime).toLocaleString() }}
                    </span>
                    <span
                        v-if="
                            quiz?.q_due_date &&
                            quiz?.s_datetime &&
                            getTimeDiff(quiz.q_due_date, quiz?.s_datetime)
                                .isLate
                        "
                        class="text-xs text-red-400">
                        {{
                            getTimeDiff(quiz.q_due_date, quiz?.s_datetime)
                                .isLate
                                ? 'ส่งช้า'
                                : ''
                        }}
                        {{
                            getTimeDiff(quiz.q_due_date, quiz?.s_datetime)?.day
                                ? `${getTimeDiff(quiz.q_due_date, quiz?.s_datetime).day} วัน`
                                : ''
                        }}
                        {{
                            getTimeDiff(quiz.q_due_date, quiz?.s_datetime)?.hour
                                ? `${getTimeDiff(quiz.q_due_date, quiz?.s_datetime).hour} ชั่วโมง`
                                : ''
                        }}
                        {{
                            getTimeDiff(quiz.q_due_date, quiz?.s_datetime)
                                ?.minute
                                ? `${getTimeDiff(quiz.q_due_date, quiz?.s_datetime).minute} นาที`
                                : ''
                        }}
                        {{
                            getTimeDiff(quiz.q_due_date, quiz?.s_datetime)
                                ?.second
                                ? `${getTimeDiff(quiz.q_due_date, quiz?.s_datetime).second} วินาที`
                                : ''
                        }}
                    </span>
                </div>
            </div>
        </div>
        <div
            v-else-if="!quizPending && (quizs?.data?.length || 0) === 0"
            class="border-1 flex w-full flex-col items-center gap-2 rounded-md border p-4 md:flex-row">
            <img class="w-48 p-4" src="/images/exam.svg" />
            <span class="text-3xl font-bold">ยังไม่มีแบบทดสอบในคอร์สนี้</span>
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
