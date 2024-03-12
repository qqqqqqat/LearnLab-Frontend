<script setup lang="ts">
    import { toast } from '@steveyuowo/vue-hot-toast'
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

    async function fetchQuiz(id: number, q_id: number) {
        await $fetch<QuizAPIResponse>('/api/courses/quiz/', {
            query: {
                c_id: id,
                q_id: q_id,
            },
        })
            .then((res) => {
                quizResponse.value = res
                quizAnswers.value = []
                for (let i = 0; i < quizResponse?.value?.q_items.length; i++) {
                    quizAnswers.value.push('')
                }
                quiz.value = quizResponse?.value?.q_items?.[0]
            })
            .catch((err) => {
                toast.error(err?.data?.message)
                navigateTo('/mycourse', { replace: true })
            })
    }

    async function submitQuiz() {
        const submitQuizToast = toast.loading('กำลังส่งแบบทดสอบ')
        let payload = {
            q_id: route.query.q_id,
            c_id: route.query.id,
            s_content: quizAnswers.value,
        }

        await $fetch<{ message: string }>('/api/courses/quiz/submit/', {
            method: 'PUT',
            body: payload,
        })
            .then(async (Pres) => {
                toast.update(submitQuizToast, { type: 'success', message: Pres?.message })
                navigateTo(`/courses/quiz/?id=${route.query.id}`)
            })
            .catch((Perr) => {
                toast.update(submitQuizToast, { type: 'error', message: Perr?.data?.message })
            })
    }

    if (route.query.id && route.query.q_id) {
        fetchQuiz(route.query.id, route.query.q_id)
    }
    function saveAndContinue(indx: number, type: string) {
        quizAnswers.value[indx] = type == 'CHOICE' ? choiceAnswer.value : fillAnswer.value
        console.log(quizAnswers.value)
    }
</script>
<template>
    <div class="flex flex-col gap-4 w-full">
        <div class="flex sm:flex-row flex-col justify-between sm:w-full gap-2">
            <div class="flex flex-row gap-2">
                <button
                    @click="navigateTo(`/courses/quiz/?id=${route.query.id}`)"
                    class="transition-all duration-200 ease-in-out py-2 px-3 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-blue-600 hover:bg-blue-100 hover:text-blue-800 disabled:opacity-50 disabled:pointer-events-none">
                    <span class="material-icons-outlined">arrow_back</span>
                </button>
                <span class="text-4xl font-bold">ทำแบบทดสอบ: {{ quizResponse?.q_name }}</span>
            </div>
        </div>
        <div class="flex md:flex-row flex-col gap-2">
            <div class="flex flex-col flex-grow gap-4">
                <div class="flex flex-col border border-1 rounded-md flex-grow p-4 gap-4">
                    <div class="flex flex-col gap-2">
                        <label class="text-2xl font-bold">{{ quizIndex + 1 }}.) {{ quiz?.title }}</label>
                    </div>
                    <div class="flex flex-col gap-2" v-if="quiz?.type === 'CHOICE'">
                        <!-- Choice 1 -->
                        <div class="flex items-center gap-4">
                            <input
                                v-model="choiceAnswer"
                                type="radio"
                                value="1"
                                name="hs-radio-vertical-group"
                                class="shrink-0 mt-0.5 border-gray-200 cursor-pointer rounded-full text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                                id="hs-radio-vertical-group-1" />
                            <div class="relative flex-grow">
                                <span>{{ quiz?.choice[0] }}</span>
                            </div>
                        </div>
                        <!-- End Choice 1 -->
                        <!-- Choice 2 -->
                        <div class="flex items-center gap-4">
                            <input
                                v-model="choiceAnswer"
                                type="radio"
                                value="2"
                                name="hs-radio-vertical-group"
                                class="shrink-0 mt-0.5 border-gray-200 cursor-pointer rounded-full text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                                id="hs-radio-vertical-group-2" />
                            <span>{{ quiz?.choice[1] }}</span>
                        </div>
                        <!-- End Choice 2 -->
                        <!-- Choice 3 -->
                        <div class="flex items-center gap-4">
                            <input
                                v-model="choiceAnswer"
                                type="radio"
                                value="3"
                                name="hs-radio-vertical-group"
                                class="shrink-0 mt-0.5 border-gray-200 cursor-pointer rounded-full text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                                id="hs-radio-vertical-group-3" />
                            <span>{{ quiz?.choice[2] }}</span>
                        </div>
                        <!-- End Choice 3 -->
                        <!-- Choice 4 -->
                        <div class="flex items-center gap-4">
                            <input
                                v-model="choiceAnswer"
                                type="radio"
                                value="4"
                                name="hs-radio-vertical-group"
                                class="shrink-0 mt-0.5 border-gray-200 cursor-pointer rounded-full text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                                id="hs-radio-vertical-group-4" />
                            <span>{{ quiz?.choice[3] }}</span>
                        </div>
                        <!-- End Choice 4 -->
                    </div>
                    <div class="flex flex-col gap-2" v-else>
                        <!-- Floating Input -->
                        <div class="relative flex-grow">
                            <input
                                type="text"
                                v-model="fillAnswer"
                                id="answer-fill-in"
                                placeholder="โจทย์"
                                class="peer p-4 block w-full border-gray-200 rounded-lg text-sm placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none focus:pt-6 focus:pb-2 [&:not(:placeholder-shown)]:pt-6 [&:not(:placeholder-shown)]:pb-2 autofill:pt-6 autofill:pb-2" />
                            <label
                                for="answer-fill-in"
                                class="absolute top-0 start-0 p-4 h-full text-sm truncate pointer-events-none transition ease-in-out duration-100 border border-transparent peer-disabled:opacity-50 peer-disabled:pointer-events-none peer-focus:text-xs peer-focus:-translate-y-1.5 peer-focus:text-gray-500 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-translate-y-1.5 peer-[:not(:placeholder-shown)]:text-gray-500">
                                คำตอบ
                                <span class="text-red-600">*</span>
                            </label>
                        </div>
                    </div>
                    <div class="flex flex-row justify-between items-center">
                        <button
                            :disabled="quizIndex == 0"
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
                            "
                            type="button"
                            class="transition-color duration-200 ease-in-out py-2 px-3 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none">
                            ย้อนกลับ
                        </button>
                        <button
                            v-show="quizIndex + 1 < quizResponse?.q_items.length"
                            :disabled="quizIndex + 1 == quizResponse?.q_items.length"
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
                            "
                            type="button"
                            class="transition-color duration-200 ease-in-out py-2 px-3 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none">
                            ไปต่อ
                        </button>
                        <button
                            v-show="quizIndex + 1 === quizResponse?.q_items.length"
                            :disabled="quizIndex + 1 < quizResponse?.q_items.length"
                            @click="
                                () => {
                                    saveAndContinue(quizIndex, quiz?.type)
                                    submitQuiz()
                                }
                            "
                            type="button"
                            class="transition-color duration-200 ease-in-out py-2 px-3 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none">
                            ไปต่อ
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
