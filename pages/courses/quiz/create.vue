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
    const tempQuizItem = ref<{
        title: string
        type: 'CHOICE' | 'FILL'
        choice?: string | undefined[]
        correct: string
    }>({ title: '', type: 'CHOICE', choice: ['', '', '', ''], correct: '' })
    const quizItem = ref<
        {
            title: string
            type: 'CHOICE' | 'FILL'
            choice?: string | undefined[]
            correct: string
        }[]
    >([])
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
                tempQuizItem.value = JSON.parse(
                    JSON.stringify(quizItem.value[editQuizIndex.value])
                )
            } catch (e) {}
        }
    })

    async function uploadQuiz() {
        const createQuizToast = toast.loading('กำลังสร้างแบบทดสอบ')
        const payload = {
            c_id: route.query.id,
            q_name: quizName.value,
            q_begin_date: beginDate.value,
            q_due_date: dueDate.value,
            q_items: quizItem.value,
        }

        await $fetch<{ message: string }>('/api/courses/quiz/', {
            method: 'PUT',
            body: payload,
        })
            .then(async (Pres) => {
                toast.update(createQuizToast, {
                    type: 'success',
                    message: Pres?.message,
                })
                navigateTo(`/courses/quiz/?id=${route.query.id}`)
            })
            .catch((Perr) => {
                toast.update(createQuizToast, {
                    type: 'error',
                    message: Perr?.data?.message,
                })
            })
    }

    if (!route.query.id) {
        navigateTo('/courses', { replace: true })
    }
</script>
<template>
    <div class="flex w-full flex-col gap-4">
        <div class="flex flex-col justify-between gap-2 sm:w-full sm:flex-row">
            <div class="flex flex-row gap-2">
                <NuxtLink
                    :to="`/courses/quiz/?id=${route.query.id}`"
                    class="inline-flex items-center gap-x-2 rounded-lg border border-transparent px-3 py-2 text-sm font-semibold text-blue-600 transition-all duration-200 ease-in-out hover:bg-blue-100 hover:text-blue-800 disabled:pointer-events-none disabled:opacity-50">
                    <span class="material-icons-outlined">arrow_back</span>
                </NuxtLink>
                <span class="text-4xl font-bold">เพิ่มแบบทดสอบ</span>
            </div>
            <div class="flex justify-end">
                <button
                    :disabled="!(quizName && quizItem.length > 0)"
                    type="button"
                    class="transition-color inline-flex items-center gap-x-2 rounded-lg border border-transparent bg-blue-600 px-3 py-2 text-sm font-semibold text-white duration-200 ease-in-out hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50"
                    @click="uploadQuiz">
                    สร้าง
                </button>
            </div>
        </div>
        <div class="flex flex-col gap-4 md:flex-row">
            <div class="relative flex-grow">
                <input
                    id="hs-floating-crs-name"
                    v-model="quizName"
                    type="text"
                    placeholder="หัวข้อโพสต์"
                    class="peer block w-full rounded-lg border-gray-200 p-4 text-sm placeholder:text-transparent autofill:pb-2 autofill:pt-6 focus:border-blue-500 focus:pb-2 focus:pt-6 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 [&:not(:placeholder-shown)]:pb-2 [&:not(:placeholder-shown)]:pt-6" >
                <label
                    for="hs-floating-crs-name"
                    class="pointer-events-none absolute start-0 top-0 h-full truncate border border-transparent p-4 text-sm transition duration-100 ease-in-out peer-focus:-translate-y-1.5 peer-focus:text-xs peer-focus:text-gray-500 peer-disabled:pointer-events-none peer-disabled:opacity-50 peer-[:not(:placeholder-shown)]:-translate-y-1.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-500">
                    ชื่อแบบทดสอบ
                    <span class="text-red-400">*</span>
                </label>
            </div>
        </div>

        <div class="flex flex-col gap-4 md:flex-row">
            <div class="relative flex-grow">
                <input
                    id="hs-floating-quiz-begin"
                    v-model="beginDate"
                    type="datetime-local"
                    placeholder="เวลาเริ่มทำแบบทดสอบ"
                    class="peer block w-full rounded-lg border-gray-200 p-4 text-sm placeholder:text-transparent autofill:pb-2 autofill:pt-6 focus:border-blue-500 focus:pb-2 focus:pt-6 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 [&:not(:placeholder-shown)]:pb-2 [&:not(:placeholder-shown)]:pt-6" >
                <label
                    for="hs-floating-quiz-begin"
                    class="pointer-events-none absolute start-0 top-0 h-full truncate border border-transparent p-4 text-sm transition duration-100 ease-in-out peer-focus:-translate-y-1.5 peer-focus:text-xs peer-focus:text-gray-500 peer-disabled:pointer-events-none peer-disabled:opacity-50 peer-[:not(:placeholder-shown)]:-translate-y-1.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-500">
                    กำหนดเวลาเปิดแบบทดสอบ
                </label>
            </div>
            <div class="relative flex-grow">
                <input
                    id="hs-floating-quiz-duedate"
                    v-model="dueDate"
                    type="datetime-local"
                    placeholder="เวลาเริ่มทำแบบทดสอบ"
                    class="peer block w-full rounded-lg border-gray-200 p-4 text-sm placeholder:text-transparent autofill:pb-2 autofill:pt-6 focus:border-blue-500 focus:pb-2 focus:pt-6 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 [&:not(:placeholder-shown)]:pb-2 [&:not(:placeholder-shown)]:pt-6" >
                <label
                    for="hs-floating-quiz-duedate"
                    class="pointer-events-none absolute start-0 top-0 h-full truncate border border-transparent p-4 text-sm transition duration-100 ease-in-out peer-focus:-translate-y-1.5 peer-focus:text-xs peer-focus:text-gray-500 peer-disabled:pointer-events-none peer-disabled:opacity-50 peer-[:not(:placeholder-shown)]:-translate-y-1.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-500">
                    กำหนดเวลาส่ง
                </label>
            </div>
        </div>
        <span class="mt-4 text-4xl font-bold">สร้างโจทย์</span>
        <hr >
        <div class="flex flex-col gap-2 md:flex-row">
            <div class="flex flex-col gap-2">
                <span class="font-bold">รายการโจทย์</span>
                <div
                    class="border-1 flex max-h-64 w-full flex-col overflow-auto rounded-md border md:w-64">
                    <div
                        v-for="(item, index) in quizItem"
                        class="flex min-h-10 flex-col flex-nowrap px-4 py-2 transition-all duration-300 ease-in-out"
                        :class="
                            index === editQuizIndex
                                ? 'bg-blue-600 text-white'
                                : 'cursor-pointer bg-white'
                        "
                        @click="
                            () => {
                                if (quizTypeTemp !== (item.type === 'FILL')) {
                                    quizTypeTemp = item.type === 'FILL'
                                }
                                tempQuizItem = JSON.parse(
                                    JSON.stringify(quizItem[index])
                                )
                                editQuizIndex = index
                            }
                        ">
                        <span
                            class="w-full overflow-hidden text-ellipsis whitespace-nowrap">
                            {{ index + 1 }}.) {{ item.title }}
                        </span>
                    </div>
                    <div
                        v-if="!quizItem?.length"
                        class="flex w-full flex-col items-center justify-center px-4 py-4 font-bold ease-in-out">
                        ยังไม่ได้เพิ่มข้อ
                    </div>
                </div>
            </div>

            <div class="border-1 flex flex-grow flex-col rounded-md border p-4">
                <div class="flex flex-row items-center gap-2">
                    <button
                        v-if="editQuizIndex >= 0"
                        type="button"
                        class="transition-color inline-flex items-center gap-x-2 rounded-lg border border-transparent bg-blue-600 px-3 py-2 text-sm font-semibold text-white duration-200 ease-in-out hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50"
                        @click="
                            () => {
                                editQuizIndex = -1
                                tempQuizItem.title = ''
                                tempQuizItem.correct = ''
                                if (tempQuizItem.type === 'CHOICE')
                                    tempQuizItem.choice = []
                            }
                        ">
                        <span class="material-icons-outlined">logout</span>
                        เลิกแก้ไข
                    </button>
                    <button
                        v-else
                        :disabled="
                            !(
                                tempQuizItem.title &&
                                tempQuizItem.correct &&
                                (tempQuizItem.type === 'CHOICE'
                                    ? tempQuizItem.choice?.[0] &&
                                      tempQuizItem.choice?.[1] &&
                                      tempQuizItem.choice?.[2] &&
                                      tempQuizItem.choice?.[3]
                                    : true)
                            )
                        "
                        type="button"
                        class="transition-color inline-flex items-center gap-x-2 rounded-lg border border-transparent bg-blue-600 px-3 py-2 text-sm font-semibold text-white duration-200 ease-in-out hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50"
                        @click="
                            () => {
                                quizItem.push(
                                    JSON.parse(JSON.stringify(tempQuizItem))
                                )
                                tempQuizItem.title = ''
                                tempQuizItem.correct = ''
                                if (tempQuizItem.type === 'CHOICE')
                                    tempQuizItem.choice = []
                                editQuizIndex = -1
                            }
                        ">
                        <span class="material-icons-outlined">add</span>
                        เพิ่มข้อ
                    </button>
                    <button
                        v-if="editQuizIndex >= 0"
                        :disabled="
                            !(
                                tempQuizItem.title &&
                                tempQuizItem.correct &&
                                (tempQuizItem.type === 'CHOICE'
                                    ? tempQuizItem.choice?.[0] &&
                                      tempQuizItem.choice?.[1] &&
                                      tempQuizItem.choice?.[2] &&
                                      tempQuizItem.choice?.[3]
                                    : true)
                            )
                        "
                        type="button"
                        class="transition-color inline-flex items-center gap-x-2 rounded-lg border border-transparent bg-blue-600 px-3 py-2 text-sm font-semibold text-white duration-200 ease-in-out hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50"
                        @click="
                            () => {
                                quizItem[editQuizIndex] = JSON.parse(
                                    JSON.stringify(tempQuizItem)
                                )
                                tempQuizItem.title = ''
                                tempQuizItem.correct = ''
                                if (tempQuizItem.type === 'CHOICE')
                                    tempQuizItem.choice = []
                                editQuizIndex = -1
                            }
                        ">
                        <span class="material-icons-outlined">save</span>
                        บันทึก
                    </button>
                    <button
                        v-if="editQuizIndex >= 0"
                        type="button"
                        class="transition-color inline-flex items-center gap-x-2 rounded-lg border border-transparent bg-blue-600 px-3 py-2 text-sm font-semibold text-white duration-200 ease-in-out hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50"
                        @click="
                            () => {
                                if (editQuizIndex > -1) {
                                    // only splice array when item is found
                                    quizItem.splice(editQuizIndex, 1) // 2nd parameter means remove one item only
                                }
                                tempQuizItem.title = ''
                                tempQuizItem.correct = ''
                                if (tempQuizItem.type === 'CHOICE')
                                    tempQuizItem.choice = []
                                editQuizIndex = -1
                            }
                        ">
                        <span class="material-icons-outlined">delete</span>
                        ลบ
                    </button>
                    <div
                        class="flex flex-col items-center justify-end lg:flex-row">
                        <span class="font-bold">ประเภทของข้อ</span>
                        <div class="flex items-center gap-2">
                            <label
                                for="switch-quiz-type"
                                class="ms-3 text-sm text-gray-500">
                                ตัวเลือก
                            </label>
                            <input
                                id="switch-quiz-type"
                                v-model="quizTypeTemp"
                                :disabled="editQuizIndex >= 0"
                                type="checkbox"
                                class="relative h-7 w-[3.25rem] cursor-pointer rounded-full border-transparent bg-gray-100 p-px text-transparent transition-colors duration-200 ease-in-out before:inline-block before:size-6 before:translate-x-0 before:transform before:rounded-full before:bg-white before:shadow before:ring-0 before:transition before:duration-200 before:ease-in-out checked:border-blue-600 checked:bg-none checked:text-blue-600 checked:before:translate-x-full checked:before:bg-blue-200 focus:ring-blue-600 focus:checked:border-blue-600 disabled:pointer-events-none disabled:opacity-50" >
                            <label
                                for="switch-quiz-type"
                                class="ms-3 text-sm text-gray-500">
                                เติมคำ
                            </label>
                        </div>
                    </div>
                </div>
                <div class="my-2 text-xl font-bold">
                    {{ quizTypeTemp ? 'เติมคำ' : 'ตัวเลือก' }}
                </div>
                <div class="flex flex-col gap-2">
                    <!-- Floating Input -->
                    <div class="relative flex-grow">
                        <input
                            id="problem-title"
                            v-model="tempQuizItem.title"
                            type="text"
                            placeholder="โจทย์"
                            class="peer block w-full rounded-lg border-gray-200 p-4 text-sm placeholder:text-transparent autofill:pb-2 autofill:pt-6 focus:border-blue-500 focus:pb-2 focus:pt-6 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 [&:not(:placeholder-shown)]:pb-2 [&:not(:placeholder-shown)]:pt-6" >
                        <label
                            for="problem-title"
                            class="pointer-events-none absolute start-0 top-0 h-full truncate border border-transparent p-4 text-sm transition duration-100 ease-in-out peer-focus:-translate-y-1.5 peer-focus:text-xs peer-focus:text-gray-500 peer-disabled:pointer-events-none peer-disabled:opacity-50 peer-[:not(:placeholder-shown)]:-translate-y-1.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-500">
                            โจทย์
                            <span class="text-red-600">*</span>
                        </label>
                    </div>
                    <!-- End Floating Input -->
                    <div v-if="quizTypeTemp" class="flex flex-col gap-2">
                        <!-- Floating Input -->
                        <div class="relative flex-grow">
                            <input
                                id="problem-key"
                                v-model="tempQuizItem.correct"
                                type="text"
                                placeholder="คำตอบที่ถูก"
                                class="peer block w-full rounded-lg border-gray-200 p-4 text-sm placeholder:text-transparent autofill:pb-2 autofill:pt-6 focus:border-blue-500 focus:pb-2 focus:pt-6 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 [&:not(:placeholder-shown)]:pb-2 [&:not(:placeholder-shown)]:pt-6" >
                            <label
                                for="problem-key"
                                class="pointer-events-none absolute start-0 top-0 h-full truncate border border-transparent p-4 text-sm transition duration-100 ease-in-out peer-focus:-translate-y-1.5 peer-focus:text-xs peer-focus:text-gray-500 peer-disabled:pointer-events-none peer-disabled:opacity-50 peer-[:not(:placeholder-shown)]:-translate-y-1.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-500">
                                คำตอบที่ถูก
                                <span class="text-red-600">*</span>
                            </label>
                        </div>
                        <!-- End Floating Input -->
                    </div>
                    <div v-else class="flex flex-col gap-2">
                        <!-- Floating Input -->
                        <div class="flex items-center gap-4">
                            <input
                                id="hs-radio-vertical-group-1"
                                v-model="tempQuizItem.correct"
                                type="radio"
                                value="1"
                                name="hs-radio-vertical-group"
                                class="mt-0.5 shrink-0 rounded-full border-gray-200 text-blue-600 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50" >
                            <div class="relative flex-grow">
                                <input
                                    id="problem-c1"
                                    v-model="tempQuizItem.choice[0]"
                                    type="text"
                                    placeholder="คำตอบที่ถูก"
                                    class="peer block w-full cursor-pointer rounded-lg border-gray-200 p-4 text-sm placeholder:text-transparent autofill:pb-2 autofill:pt-6 focus:border-blue-500 focus:pb-2 focus:pt-6 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 [&:not(:placeholder-shown)]:pb-2 [&:not(:placeholder-shown)]:pt-6" >
                                <label
                                    for="problem-c1"
                                    class="pointer-events-none absolute start-0 top-0 h-full truncate border border-transparent p-4 text-sm transition duration-100 ease-in-out peer-focus:-translate-y-1.5 peer-focus:text-xs peer-focus:text-gray-500 peer-disabled:pointer-events-none peer-disabled:opacity-50 peer-[:not(:placeholder-shown)]:-translate-y-1.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-500">
                                    ตัวเลือก 1
                                    <span class="text-red-600">*</span>
                                </label>
                            </div>
                        </div>
                        <!-- End Floating Input -->
                        <!-- Floating Input -->
                        <div class="flex items-center gap-4">
                            <input
                                id="hs-radio-vertical-group-2"
                                v-model="tempQuizItem.correct"
                                type="radio"
                                value="2"
                                name="hs-radio-vertical-group"
                                class="mt-0.5 shrink-0 rounded-full border-gray-200 text-blue-600 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50" >
                            <div class="relative flex-grow">
                                <input
                                    id="problem-c2"
                                    v-model="tempQuizItem.choice[1]"
                                    type="text"
                                    placeholder="คำตอบที่ถูก"
                                    class="peer block w-full cursor-pointer rounded-lg border-gray-200 p-4 text-sm placeholder:text-transparent autofill:pb-2 autofill:pt-6 focus:border-blue-500 focus:pb-2 focus:pt-6 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 [&:not(:placeholder-shown)]:pb-2 [&:not(:placeholder-shown)]:pt-6" >
                                <label
                                    for="problem-c2"
                                    class="pointer-events-none absolute start-0 top-0 h-full truncate border border-transparent p-4 text-sm transition duration-100 ease-in-out peer-focus:-translate-y-1.5 peer-focus:text-xs peer-focus:text-gray-500 peer-disabled:pointer-events-none peer-disabled:opacity-50 peer-[:not(:placeholder-shown)]:-translate-y-1.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-500">
                                    ตัวเลือก 2
                                    <span class="text-red-600">*</span>
                                </label>
                            </div>
                        </div>
                        <!-- End Floating Input -->
                        <!-- Floating Input -->
                        <div class="flex items-center gap-4">
                            <input
                                id="hs-radio-vertical-group-3"
                                v-model="tempQuizItem.correct"
                                type="radio"
                                value="3"
                                name="hs-radio-vertical-group"
                                class="mt-0.5 shrink-0 rounded-full border-gray-200 text-blue-600 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50" >
                            <div class="relative flex-grow">
                                <input
                                    id="problem-c3"
                                    v-model="tempQuizItem.choice[2]"
                                    type="text"
                                    placeholder="คำตอบที่ถูก"
                                    class="peer block w-full cursor-pointer rounded-lg border-gray-200 p-4 text-sm placeholder:text-transparent autofill:pb-2 autofill:pt-6 focus:border-blue-500 focus:pb-2 focus:pt-6 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 [&:not(:placeholder-shown)]:pb-2 [&:not(:placeholder-shown)]:pt-6" >
                                <label
                                    for="problem-c3"
                                    class="pointer-events-none absolute start-0 top-0 h-full truncate border border-transparent p-4 text-sm transition duration-100 ease-in-out peer-focus:-translate-y-1.5 peer-focus:text-xs peer-focus:text-gray-500 peer-disabled:pointer-events-none peer-disabled:opacity-50 peer-[:not(:placeholder-shown)]:-translate-y-1.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-500">
                                    ตัวเลือก 3
                                    <span class="text-red-600">*</span>
                                </label>
                            </div>
                        </div>
                        <!-- End Floating Input -->
                        <!-- Floating Input -->
                        <div class="flex items-center gap-4">
                            <input
                                id="hs-radio-vertical-group-4"
                                v-model="tempQuizItem.correct"
                                type="radio"
                                value="4"
                                name="hs-radio-vertical-group"
                                class="mt-0.5 shrink-0 rounded-full border-gray-200 text-blue-600 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50" >
                            <div class="relative flex-grow">
                                <input
                                    id="problem-c4"
                                    v-model="tempQuizItem.choice[3]"
                                    type="text"
                                    placeholder="คำตอบที่ถูก"
                                    class="peer block w-full cursor-pointer rounded-lg border-gray-200 p-4 text-sm placeholder:text-transparent autofill:pb-2 autofill:pt-6 focus:border-blue-500 focus:pb-2 focus:pt-6 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 [&:not(:placeholder-shown)]:pb-2 [&:not(:placeholder-shown)]:pt-6" >
                                <label
                                    for="problem-c4"
                                    class="pointer-events-none absolute start-0 top-0 h-full truncate border border-transparent p-4 text-sm transition duration-100 ease-in-out peer-focus:-translate-y-1.5 peer-focus:text-xs peer-focus:text-gray-500 peer-disabled:pointer-events-none peer-disabled:opacity-50 peer-[:not(:placeholder-shown)]:-translate-y-1.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-500">
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
