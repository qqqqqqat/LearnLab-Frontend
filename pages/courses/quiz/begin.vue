<script setup lang="ts">
    import { toast } from '@steveyuowo/vue-hot-toast'
    import { useQueryStringAsNumber } from '#imports';
    definePageMeta({
        layout: 'course',
    })
    const route = useRoute()
    const quizResponse = ref<QuizAPIResponse>()
    const quizAnswers = ref<string[]>([])
    const quizIndex = ref(0)
    const quiz = ref<QuizItems>()
    const choiceAnswer = ref()
    const fillAnswer = ref()
    const isFetching = ref(true)

    async function fetchQuiz(id: number, q_id: number) {
        isFetching.value = true
        await $fetchWithHeader<QuizAPIResponse>('/api/courses/quiz/', {
            query: {
                c_id: id,
                q_id: q_id,
            },
        })
            .then((res) => {
                quizResponse.value = res
                if (
                    quizResponse.value &&
                    new Date().getTime() -
                        new Date(quizResponse.value.q_begin_date).getTime() >=
                        0
                ) {
                    quizAnswers.value = []
                    for (
                        let i = 0;
                        i < quizResponse?.value?.q_items.length;
                        i++
                    ) {
                        quizAnswers.value.push('')
                    }
                    quiz.value = quizResponse?.value?.q_items?.[0]
                } else {
                    toast.error('ยังไม่ถึงเวลาทำ')
                    navigateTo('/mycourse', { replace: true })
                }
                isFetching.value = false
            })
            .catch((err) => {
                isFetching.value = false
                toast.error(err?.data?.message)
                navigateTo('/mycourse', { replace: true })
            })
    }

    async function submitQuiz() {
        const submitQuizToast = toast.loading('กำลังส่งแบบทดสอบ')
        const payload = {
            q_id: route.query.q_id,
            c_id: route.query.id,
            s_content: quizAnswers.value,
        }

        await $fetchWithHeader<{ message: string }>(
            '/api/courses/quiz/submit/',
            {
                method: 'PUT',
                body: payload,
            }
        )
            .then(async (Pres) => {
                toast.update(submitQuizToast, {
                    type: 'success',
                    message: Pres?.message,
                })
                navigateTo(`/courses/quiz/?id=${route.query.id}`)
            })
            .catch((Perr) => {
                toast.update(submitQuizToast, {
                    type: 'error',
                    message: Perr?.data?.message,
                })
            })
    }

    if (route.query.id && route.query.q_id) {
        fetchQuiz(useQueryStringAsNumber(route.query.id), useQueryStringAsNumber(route.query.q_id))
    } else {
        navigateTo('/courses', { replace: true })
    }
    function saveAndContinue(indx: number, type: string) {
        quizAnswers.value[indx] =
            type == 'CHOICE' ? choiceAnswer.value : fillAnswer.value
        // console.log(quizAnswers.value)
    }
</script>
<template>
    <div class="flex w-full flex-col gap-4">
        <div class="flex flex-col justify-between gap-2 sm:w-full sm:flex-row">
            <div class="flex flex-row gap-2">
                <button
                    class="inline-flex items-center gap-x-2 rounded-lg border border-transparent px-3 py-2 text-sm font-semibold text-blue-600 transition-all duration-200 ease-in-out hover:bg-blue-100 hover:text-blue-800 disabled:pointer-events-none disabled:opacity-50"
                    @click="navigateTo(`/courses/quiz/?id=${route.query.id}`)">
                    <span
                        class="material-icons-outlined size-6 overflow-hidden select-none">
                        arrow_back
                    </span>
                </button>
                <span class="text-4xl font-bold">
                    แบบทดสอบ {{ quizResponse?.q_name }}
                </span>
            </div>
        </div>
        <div v-if="!isFetching" class="flex flex-col gap-2 md:flex-row">
            <div
                class="border-1 flex w-full flex-row items-center gap-4 rounded-md border p-2 md:w-16 md:flex-col">
                <div
                    v-for="(q, indx) in quizAnswers"
                    :key="indx"
                    class="transition-color border-1 flex h-12 w-12 items-center justify-center rounded-md border p-4 duration-200 ease-in-out"
                    :class="q ? 'bg-blue-600 text-white' : 'bg-transparent'">
                    {{ indx + 1 }}
                </div>
            </div>
            <div class="flex flex-grow flex-col gap-4">
                <div
                    class="border-1 flex flex-grow flex-col gap-4 rounded-md border p-4">
                    <div class="flex flex-col gap-2">
                        <label class="text-2xl font-bold">
                            {{ quizIndex + 1 }}.) {{ quiz?.title }}
                        </label>
                    </div>
                    <div
                        v-if="quiz?.type === 'CHOICE'"
                        class="flex flex-col gap-2">
                        <!-- Choice 1 -->
                        <div class="flex items-center gap-4">
                            <input
                                id="hs-radio-vertical-group-1"
                                v-model="choiceAnswer"
                                type="radio"
                                value="1"
                                name="hs-radio-vertical-group"
                                class="mt-0.5 shrink-0 cursor-pointer rounded-full border-gray-200 text-blue-600 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50" >
                            <div class="relative flex-grow">
                                <span>{{ quiz?.choice[0] }}</span>
                            </div>
                        </div>
                        <!-- End Choice 1 -->
                        <!-- Choice 2 -->
                        <div class="flex items-center gap-4">
                            <input
                                id="hs-radio-vertical-group-2"
                                v-model="choiceAnswer"
                                type="radio"
                                value="2"
                                name="hs-radio-vertical-group"
                                class="mt-0.5 shrink-0 cursor-pointer rounded-full border-gray-200 text-blue-600 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50" >
                            <span>{{ quiz?.choice[1] }}</span>
                        </div>
                        <!-- End Choice 2 -->
                        <!-- Choice 3 -->
                        <div class="flex items-center gap-4">
                            <input
                                id="hs-radio-vertical-group-3"
                                v-model="choiceAnswer"
                                type="radio"
                                value="3"
                                name="hs-radio-vertical-group"
                                class="mt-0.5 shrink-0 cursor-pointer rounded-full border-gray-200 text-blue-600 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50" >
                            <span>{{ quiz?.choice[2] }}</span>
                        </div>
                        <!-- End Choice 3 -->
                        <!-- Choice 4 -->
                        <div class="flex items-center gap-4">
                            <input
                                id="hs-radio-vertical-group-4"
                                v-model="choiceAnswer"
                                type="radio"
                                value="4"
                                name="hs-radio-vertical-group"
                                class="mt-0.5 shrink-0 cursor-pointer rounded-full border-gray-200 text-blue-600 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50" >
                            <span>{{ quiz?.choice[3] }}</span>
                        </div>
                        <!-- End Choice 4 -->
                    </div>
                    <div v-else class="flex flex-col gap-2">
                        <!-- Floating Input -->
                        <div class="relative flex-grow">
                            <input
                                id="answer-fill-in"
                                v-model="fillAnswer"
                                type="text"
                                placeholder="โจทย์"
                                class="peer block w-full rounded-lg border-gray-200 p-4 text-sm placeholder:text-transparent autofill:pb-2 autofill:pt-6 focus:border-blue-500 focus:pb-2 focus:pt-6 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 [&:not(:placeholder-shown)]:pb-2 [&:not(:placeholder-shown)]:pt-6" >
                            <label
                                for="answer-fill-in"
                                class="pointer-events-none absolute start-0 top-0 h-full truncate border border-transparent p-4 text-sm transition duration-100 ease-in-out peer-focus:-translate-y-1.5 peer-focus:text-xs peer-focus:text-gray-500 peer-disabled:pointer-events-none peer-disabled:opacity-50 peer-[:not(:placeholder-shown)]:-translate-y-1.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-500">
                                คำตอบ
                                <span class="text-red-600">*</span>
                            </label>
                        </div>
                    </div>
                    <div class="flex flex-row items-center justify-between">
                        <button
                            :disabled="quizIndex == 0 || isFetching"
                            type="button"
                            class="transition-color inline-flex items-center gap-x-2 rounded-lg border border-transparent bg-blue-600 px-3 py-2 text-sm font-semibold text-white duration-200 ease-in-out hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50"
                            @click="
                                () => {
                                    saveAndContinue(quizIndex, quiz?.type)
                                    quizIndex--
                                    quiz = quizResponse?.q_items?.[quizIndex]
                                    if (quiz?.type === 'CHOICE') {
                                        choiceAnswer = quizAnswers[quizIndex]
                                    } else {
                                        fillAnswer = quizAnswers[quizIndex]
                                    }
                                }
                            ">
                            <span
                                class="material-icons-outlined size-6 overflow-hidden select-none">
                                arrow_left
                            </span>
                            ย้อนกลับ
                        </button>
                        <button
                            v-show="
                                quizIndex + 1 < quizResponse?.q_items.length
                            "
                            :disabled="
                                quizIndex + 1 == quizResponse?.q_items.length ||
                                isFetching
                            "
                            type="button"
                            class="transition-color inline-flex items-center gap-x-2 rounded-lg border border-transparent bg-blue-600 px-3 py-2 text-sm font-semibold text-white duration-200 ease-in-out hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50"
                            @click="
                                () => {
                                    saveAndContinue(quizIndex, quiz?.type)
                                    quizIndex++
                                    quiz = quizResponse?.q_items?.[quizIndex]
                                    if (quiz?.type === 'CHOICE') {
                                        choiceAnswer = quizAnswers[quizIndex]
                                    } else {
                                        fillAnswer = quizAnswers[quizIndex]
                                    }
                                }
                            ">
                            ไปต่อ
                            <span
                                class="material-icons-outlined size-6 overflow-hidden select-none">
                                arrow_right
                            </span>
                        </button>
                        <button
                            v-show="
                                quizIndex + 1 === quizResponse?.q_items.length
                            "
                            :disabled="
                                quizIndex + 1 < quizResponse?.q_items.length ||
                                isFetching
                            "
                            type="button"
                            class="transition-color inline-flex items-center gap-x-2 rounded-lg border border-transparent bg-blue-600 px-3 py-2 text-sm font-semibold text-white duration-200 ease-in-out hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50"
                            @click="
                                () => {
                                    saveAndContinue(quizIndex, quiz?.type)
                                    submitQuiz()
                                }
                            ">
                            <span
                                class="material-icons-outlined size-6 overflow-hidden select-none">
                                send
                            </span>
                            ส่ง
                        </button>
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
