<script setup lang="ts">
    import { toast } from '@steveyuowo/vue-hot-toast'
    definePageMeta({
        layout: 'course',
    })
    const route = useRoute()
    const quizName = ref('')
    const dueDate = ref('')
    const beginDate = ref('')
    const editQuizIndex = ref(-1)
    const tempQuizItem = ref<{ title: string; type: 'CHOICE' | 'FILL'; choice?: string | undefined[]; correct: string }>({ title: '', type: 'CHOICE', choice: ['', '', '', ''], correct: '' })
    const quizItem = ref<{ title: string; type: 'CHOICE' | 'FILL'; choice?: string | undefined[]; correct: string }[]>([])
    const quizTypeTemp = ref(false)

    watch(quizTypeTemp, (val) => {
        tempQuizItem.value.correct = ''
        tempQuizItem.value.type = val ? 'FILL' : 'CHOICE'
        if (val) {
            delete tempQuizItem.value?.choice
        } else {
            Object.assign(tempQuizItem.value, { choice: ['', '', '', ''] })
        }

        if (editQuizIndex.value >= 0) {
            try {
                tempQuizItem.value = JSON.parse(JSON.stringify(quizItem.value[editQuizIndex.value]))
            } catch (e) {}
        }
    })

    async function fetchQuiz(id: number, q_id: number) {
        await $fetch('/api/courses/quiz/', {
            query: {
                c_id: id,
                q_id: q_id,
            },
        })
            .then((res) => {
                quizItem.value = res?.q_items
                beginDate.value = res?.q_begin_date
                dueDate.value = res?.q_due_date
                quizName.value = res?.q_name
            })
            .catch((err) => {
                toast.error(err?.data?.message)
                navigateTo('/mycourse', { replace: true })
            })
    }


    async function uploadQuiz() {
        const createQuizToast = toast.loading('กำลังบันทึกแบบทดสอบ')
        let payload = {
            q_id: route.query.q_id,
            c_id: route.query.id,
            q_name: quizName.value,
            q_begin_date: beginDate.value,
            q_due_date: dueDate.value,
            q_items: quizItem.value,
        }

        await $fetch<{ message: string }>('/api/courses/quiz/', {
            method: 'POST',
            body: payload,
        })
            .then(async (Pres) => {
                toast.update(createQuizToast, { type: 'success', message: Pres?.message })
                navigateTo(`/courses/quiz/?id=${route.query.id}`)
            })
            .catch((Perr) => {
                toast.update(createQuizToast, { type: 'error', message: Perr?.data?.message })
            })
    }

    if (route.query.id && route.query.q_id) {
        fetchQuiz(route.query.id, route.query.q_id)
    } else {
        navigateTo('/courses', {replace: true})
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
                <span class="text-4xl font-bold">แก้ไขแบบทดสอบ: {{ quizName }}</span>
            </div>
            <div class="flex justify-end">
                <button
                @click="uploadQuiz"
                :disabled="!(quizName && quizItem.length > 0)"
                    type="button"
                    class="transition-color duration-200 ease-in-out py-2 px-3 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none">
                    บันทึก
                </button>
            </div>
        </div>
        <div class="flex md:flex-row flex-col gap-4">
            <div class="relative flex-grow">
                <input
                    type="text"
                    v-model="quizName"
                    id="hs-floating-crs-name"
                    placeholder="หัวข้อโพสต์"
                    class="peer p-4 block w-full border-gray-200 rounded-lg text-sm placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none focus:pt-6 focus:pb-2 [&:not(:placeholder-shown)]:pt-6 [&:not(:placeholder-shown)]:pb-2 autofill:pt-6 autofill:pb-2" />
                <label
                    for="hs-floating-crs-name"
                    class="absolute top-0 start-0 p-4 h-full text-sm truncate pointer-events-none transition ease-in-out duration-100 border border-transparent peer-disabled:opacity-50 peer-disabled:pointer-events-none peer-focus:text-xs peer-focus:-translate-y-1.5 peer-focus:text-gray-500 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-translate-y-1.5 peer-[:not(:placeholder-shown)]:text-gray-500">
                    ชื่อแบบทดสอบ
                    <span class="text-red-400">*</span>
                </label>
            </div>
        </div>

        <div class="flex md:flex-row flex-col gap-4">
            <div class="relative flex-grow">
                <input
                    type="datetime-local"
                    v-model="beginDate"
                    id="hs-floating-quiz-begin"
                    placeholder="เวลาเริ่มทำแบบทดสอบ"
                    class="peer p-4 block w-full border-gray-200 rounded-lg text-sm placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none focus:pt-6 focus:pb-2 [&:not(:placeholder-shown)]:pt-6 [&:not(:placeholder-shown)]:pb-2 autofill:pt-6 autofill:pb-2" />
                <label
                    for="hs-floating-quiz-begin"
                    class="absolute top-0 start-0 p-4 h-full text-sm truncate pointer-events-none transition ease-in-out duration-100 border border-transparent peer-disabled:opacity-50 peer-disabled:pointer-events-none peer-focus:text-xs peer-focus:-translate-y-1.5 peer-focus:text-gray-500 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-translate-y-1.5 peer-[:not(:placeholder-shown)]:text-gray-500">
                    กำหนดเวลาเปิดแบบทดสอบ
                </label>
            </div>
            <div class="relative flex-grow">
                <input
                    type="datetime-local"
                    v-model="dueDate"
                    id="hs-floating-quiz-duedate"
                    placeholder="เวลาเริ่มทำแบบทดสอบ"
                    class="peer p-4 block w-full border-gray-200 rounded-lg text-sm placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none focus:pt-6 focus:pb-2 [&:not(:placeholder-shown)]:pt-6 [&:not(:placeholder-shown)]:pb-2 autofill:pt-6 autofill:pb-2" />
                <label
                    for="hs-floating-quiz-duedate"
                    class="absolute top-0 start-0 p-4 h-full text-sm truncate pointer-events-none transition ease-in-out duration-100 border border-transparent peer-disabled:opacity-50 peer-disabled:pointer-events-none peer-focus:text-xs peer-focus:-translate-y-1.5 peer-focus:text-gray-500 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-translate-y-1.5 peer-[:not(:placeholder-shown)]:text-gray-500">
                    กำหนดเวลาส่ง
                </label>
            </div>
        </div>
        <span class="text-4xl font-bold mt-4">สร้างโจทย์</span>
        <hr />
        <div class="flex md:flex-row flex-col gap-2">
            <div class="flex flex-col gap-2">
                <span class="font-bold">รายการโจทย์</span>
                <div class="flex flex-col md:max-w-64 w-full border border-1 rounded-md max-h-64 overflow-auto">
                    <div
                        @click="
                            () => {
                                if (quizTypeTemp !== (item.type === 'FILL')) {
                                    quizTypeTemp = item.type === 'FILL'
                                }
                                tempQuizItem = JSON.parse(JSON.stringify(quizItem[index]))
                                editQuizIndex = index
                            }
                        "
                        class="transition-all duration-300 ease-in-out flex flex-col flex-nowrap px-4 py-2 min-h-10"
                        :class="index === editQuizIndex ? 'bg-blue-600 text-white' : 'cursor-pointer bg-white'"
                        v-for="(item, index) in quizItem">
                        <span class="text-ellipsis whitespace-nowrap w-full overflow-hidden ">{{ index + 1 }}.) {{ item.title }}</span>
                    </div>
                    <div class="ease-in-out flex flex-col justify-center items-center w-full px-4 py-4 font-bold" v-if="!quizItem?.length">ยังไม่ได้เพิ่มข้อ</div>
                </div>
            </div>

            <div class="flex flex-col border border-1 rounded-md flex-grow p-4">
                <div class="flex md:flex-row flex-col md:items-center items-start gap-2">
                    <div class="flex flex-row items-center gap-2">
                    <button
                    v-if="editQuizIndex >= 0"
                        @click="
                            () => {
                                editQuizIndex = -1
                                tempQuizItem.title = ''
                                tempQuizItem.correct = ''
                                if (tempQuizItem.type === 'CHOICE') tempQuizItem.choice = []
                            }
                        "
                        type="button"
                        class="transition-color duration-200 ease-in-out py-2 px-3 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none">
                        <span class="material-icons-outlined">logout</span>
                        เลิกแก้ไข
                    </button>
                    <button
                    v-else
                        :disabled="
                            !(
                                tempQuizItem.title &&
                                tempQuizItem.correct &&
                                (tempQuizItem.type === 'CHOICE' ? tempQuizItem.choice?.[0] && tempQuizItem.choice?.[1] && tempQuizItem.choice?.[2] && tempQuizItem.choice?.[3] : true)
                            )
                        "
                        @click="
                            () => {
                                quizItem.push(JSON.parse(JSON.stringify(tempQuizItem)))
                                tempQuizItem.title = ''
                                tempQuizItem.correct = ''
                                if (tempQuizItem.type === 'CHOICE') tempQuizItem.choice = []
                                editQuizIndex = -1
                            }
                        "
                        type="button"
                        class="transition-color duration-200 ease-in-out py-2 px-3 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none">
                        <span class="material-icons-outlined">add</span>
                        เพิ่มข้อ
                    </button>
                    <button
                        v-if="editQuizIndex >= 0"
                        :disabled="
                            !(
                                tempQuizItem.title &&
                                tempQuizItem.correct &&
                                (tempQuizItem.type === 'CHOICE' ? tempQuizItem.choice?.[0] && tempQuizItem.choice?.[1] && tempQuizItem.choice?.[2] && tempQuizItem.choice?.[3] : true)
                            )
                        "
                        @click="
                            () => {
                                quizItem[editQuizIndex] = JSON.parse(JSON.stringify(tempQuizItem))
                                tempQuizItem.title = ''
                                tempQuizItem.correct = ''
                                if (tempQuizItem.type === 'CHOICE') tempQuizItem.choice = []
                                editQuizIndex = -1
                            }
                        "
                        type="button"
                        class="transition-color duration-200 ease-in-out py-2 px-3 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none">
                        <span class="material-icons-outlined">save</span>
                        บันทึก
                    </button>
                    <button
                        v-if="editQuizIndex >= 0"
                        @click="
                            () => {
                                if (editQuizIndex > -1) {
                                    // only splice array when item is found
                                    quizItem.splice(editQuizIndex, 1) // 2nd parameter means remove one item only
                                }
                                tempQuizItem.title = ''
                                tempQuizItem.correct = ''
                                if (tempQuizItem.type === 'CHOICE') tempQuizItem.choice = []
                                editQuizIndex = -1
                            }
                        "
                        type="button"
                        class="transition-color duration-200 ease-in-out py-2 px-3 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none">
                        <span class="material-icons-outlined">delete</span>
                        ลบ
                    </button>
                    </div>
                    <div class="flex lg:flex-row flex-col justify-end md:items-center items-start">
                        <span class="font-bold">ประเภทของข้อ</span>
                        <div class="flex items-center gap-2">
                            <label for="switch-quiz-type" class="text-sm text-gray-500 ms-3">ตัวเลือก</label>
                            <input
                            :disabled="editQuizIndex >= 0"
                            v-model="quizTypeTemp"
                            type="checkbox"
                            id="switch-quiz-type"
                            class="relative w-[3.25rem] h-7 p-px bg-gray-100 border-transparent text-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:ring-blue-600 disabled:opacity-50 disabled:pointer-events-none checked:bg-none checked:text-blue-600 checked:border-blue-600 focus:checked:border-blue-600 before:inline-block before:size-6 before:bg-white checked:before:bg-blue-200 before:translate-x-0 checked:before:translate-x-full before:rounded-full before:shadow before:transform before:ring-0 before:transition before:ease-in-out before:duration-200" />
                            <label for="switch-quiz-type" class="text-sm text-gray-500 ms-3">เติมคำ</label>
                        </div>
                    </div>
                </div>
                <div class="font-bold text-xl my-2">{{ quizTypeTemp ? 'เติมคำ' : 'ตัวเลือก' }}</div>
                <div class="flex flex-col gap-2">
                    <!-- Floating Input -->
                    <div class="relative flex-grow">
                        <input
                            type="text"
                            v-model="tempQuizItem.title"
                            id="problem-title"
                            placeholder="โจทย์"
                            class="peer p-4 block w-full border-gray-200 rounded-lg text-sm placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none focus:pt-6 focus:pb-2 [&:not(:placeholder-shown)]:pt-6 [&:not(:placeholder-shown)]:pb-2 autofill:pt-6 autofill:pb-2" />
                        <label
                            for="problem-title"
                            class="absolute top-0 start-0 p-4 h-full text-sm truncate pointer-events-none transition ease-in-out duration-100 border border-transparent peer-disabled:opacity-50 peer-disabled:pointer-events-none peer-focus:text-xs peer-focus:-translate-y-1.5 peer-focus:text-gray-500 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-translate-y-1.5 peer-[:not(:placeholder-shown)]:text-gray-500">
                            โจทย์
                            <span class="text-red-600">*</span>
                        </label>
                    </div>
                    <!-- End Floating Input -->
                    <div class="flex flex-col gap-2" v-if="quizTypeTemp">
                        <!-- Floating Input -->
                        <div class="relative flex-grow">
                            <input
                                type="text"
                                v-model="tempQuizItem.correct"
                                id="problem-key"
                                placeholder="คำตอบที่ถูก"
                                class="peer p-4 block w-full border-gray-200 rounded-lg text-sm placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none focus:pt-6 focus:pb-2 [&:not(:placeholder-shown)]:pt-6 [&:not(:placeholder-shown)]:pb-2 autofill:pt-6 autofill:pb-2" />
                            <label
                                for="problem-key"
                                class="absolute top-0 start-0 p-4 h-full text-sm truncate pointer-events-none transition ease-in-out duration-100 border border-transparent peer-disabled:opacity-50 peer-disabled:pointer-events-none peer-focus:text-xs peer-focus:-translate-y-1.5 peer-focus:text-gray-500 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-translate-y-1.5 peer-[:not(:placeholder-shown)]:text-gray-500">
                                คำตอบที่ถูก
                                <span class="text-red-600">*</span>
                            </label>
                        </div>
                        <!-- End Floating Input -->
                    </div>
                    <div class="flex flex-col gap-2" v-else>
                        <!-- Floating Input -->
                        <div class="flex items-center gap-4">
                            <input
                                type="radio"
                                v-model="tempQuizItem.correct"
                                value="1"
                                name="hs-radio-vertical-group"
                                class="shrink-0 mt-0.5 border-gray-200 rounded-full text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                                id="hs-radio-vertical-group-1" />
                            <div class="relative flex-grow">
                                <input
                                    type="text"
                                    v-model="tempQuizItem.choice[0]"
                                    id="problem-c1"
                                    placeholder="คำตอบที่ถูก"
                                    class="peer p-4 block w-full border-gray-200 cursor-pointer rounded-lg text-sm placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none focus:pt-6 focus:pb-2 [&:not(:placeholder-shown)]:pt-6 [&:not(:placeholder-shown)]:pb-2 autofill:pt-6 autofill:pb-2" />
                                <label
                                    for="problem-c1"
                                    class="absolute top-0 start-0 p-4 h-full text-sm truncate pointer-events-none transition ease-in-out duration-100 border border-transparent peer-disabled:opacity-50 peer-disabled:pointer-events-none peer-focus:text-xs peer-focus:-translate-y-1.5 peer-focus:text-gray-500 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-translate-y-1.5 peer-[:not(:placeholder-shown)]:text-gray-500">
                                    ตัวเลือก 1
                                    <span class="text-red-600">*</span>
                                </label>
                            </div>
                        </div>
                        <!-- End Floating Input -->
                        <!-- Floating Input -->
                        <div class="flex items-center gap-4">
                            <input
                                type="radio"
                                v-model="tempQuizItem.correct"
                                value="2"
                                name="hs-radio-vertical-group"
                                class="shrink-0 mt-0.5 border-gray-200 rounded-full text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                                id="hs-radio-vertical-group-2" />
                            <div class="relative flex-grow">
                                <input
                                    type="text"
                                    v-model="tempQuizItem.choice[1]"
                                    id="problem-c2"
                                    placeholder="คำตอบที่ถูก"
                                    class="peer p-4 block w-full border-gray-200 cursor-pointer rounded-lg text-sm placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none focus:pt-6 focus:pb-2 [&:not(:placeholder-shown)]:pt-6 [&:not(:placeholder-shown)]:pb-2 autofill:pt-6 autofill:pb-2" />
                                <label
                                    for="problem-c2"
                                    class="absolute top-0 start-0 p-4 h-full text-sm truncate pointer-events-none transition ease-in-out duration-100 border border-transparent peer-disabled:opacity-50 peer-disabled:pointer-events-none peer-focus:text-xs peer-focus:-translate-y-1.5 peer-focus:text-gray-500 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-translate-y-1.5 peer-[:not(:placeholder-shown)]:text-gray-500">
                                    ตัวเลือก 2
                                    <span class="text-red-600">*</span>
                                </label>
                            </div>
                        </div>
                        <!-- End Floating Input -->
                        <!-- Floating Input -->
                        <div class="flex items-center gap-4">
                            <input
                                type="radio"
                                v-model="tempQuizItem.correct"
                                value="3"
                                name="hs-radio-vertical-group"
                                class="shrink-0 mt-0.5 border-gray-200 cursor-pointer rounded-full text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                                id="hs-radio-vertical-group-3" />
                            <div class="relative flex-grow">
                                <input
                                    type="text"
                                    v-model="tempQuizItem.choice[2]"
                                    id="problem-c3"
                                    placeholder="คำตอบที่ถูก"
                                    class="peer p-4 block w-full border-gray-200 rounded-lg text-sm placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none focus:pt-6 focus:pb-2 [&:not(:placeholder-shown)]:pt-6 [&:not(:placeholder-shown)]:pb-2 autofill:pt-6 autofill:pb-2" />
                                <label
                                    for="problem-c3"
                                    class="absolute top-0 start-0 p-4 h-full text-sm truncate pointer-events-none transition ease-in-out duration-100 border border-transparent peer-disabled:opacity-50 peer-disabled:pointer-events-none peer-focus:text-xs peer-focus:-translate-y-1.5 peer-focus:text-gray-500 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-translate-y-1.5 peer-[:not(:placeholder-shown)]:text-gray-500">
                                    ตัวเลือก 3
                                    <span class="text-red-600">*</span>
                                </label>
                            </div>
                        </div>
                        <!-- End Floating Input -->
                        <!-- Floating Input -->
                        <div class="flex items-center gap-4">
                            <input
                                type="radio"
                                v-model="tempQuizItem.correct"
                                value="4"
                                name="hs-radio-vertical-group"
                                class="shrink-0 mt-0.5 border-gray-200 cursor-pointer rounded-full text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                                id="hs-radio-vertical-group-4" />
                            <div class="relative flex-grow">
                                <input
                                    type="text"
                                    id="problem-c4"
                                    v-model="tempQuizItem.choice[3]"
                                    placeholder="คำตอบที่ถูก"
                                    class="peer p-4 block w-full border-gray-200 rounded-lg text-sm placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none focus:pt-6 focus:pb-2 [&:not(:placeholder-shown)]:pt-6 [&:not(:placeholder-shown)]:pb-2 autofill:pt-6 autofill:pb-2" />
                                <label
                                    for="problem-c4"
                                    class="absolute top-0 start-0 p-4 h-full text-sm truncate pointer-events-none transition ease-in-out duration-100 border border-transparent peer-disabled:opacity-50 peer-disabled:pointer-events-none peer-focus:text-xs peer-focus:-translate-y-1.5 peer-focus:text-gray-500 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-translate-y-1.5 peer-[:not(:placeholder-shown)]:text-gray-500">
                                    ตัวเลือก 4
                                    <span class="text-red-600">*</span>
                                </label>
                            </div>
                        </div>
                        <!-- End Floating Input -->
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
