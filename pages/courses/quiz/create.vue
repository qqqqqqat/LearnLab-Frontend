<script setup lang="ts">
    import { toast } from '@steveyuowo/vue-hot-toast'
    definePageMeta({
        layout: 'course',
    })
    const route = useRoute()
    const quizName = ref('')
    const quizScore = ref('')
    const dueDate = ref('')
    const beginDate = ref('')

    async function uploadQuiz(postFile: number[]) {
        const createQuizToast = toast.loading('กำลังสร้างแบบทดสอบ')
        let payload = {
            c_id: route.query.id,
            q_name: quizName.value,
            q_begin_date: beginDate.value,
            q_due_date: dueDate.value,
            q_items: [],
        }
        if (postFile.length > 0) Object.assign(payload, { a_files: postFile })
        if (dueDate.value) Object.assign(payload, { a_due_date: dueDate.value })

        await $fetch<{ message: string }>('/api/courses/assignment/', {
            method: 'PUT',
            body: payload,
        })
            .then(async (Pres) => {
                toast.update(createQuizToast, { type: 'success', message: Pres?.message })
                navigateTo(`/courses/assignment/?id=${route.query.id}`)
            })
            .catch((Perr) => {
                toast.update(createQuizToast, { type: 'error', message: Perr?.data?.message })
            })
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
                <span class="text-4xl font-bold">เพิ่มแบบทดสอบ</span>
            </div>
            <div class="flex justify-end">
                <button
                    type="button"
                    class="transition-color duration-200 ease-in-out py-2 px-3 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none">
                    สร้าง
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
            <div class="relative">
                <input
                    type="number"
                    v-model="quizScore"
                    id="hs-floating-crs-name"
                    placeholder="หัวข้อโพสต์"
                    class="peer p-4 block w-64 border-gray-200 rounded-lg text-sm placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none focus:pt-6 focus:pb-2 [&:not(:placeholder-shown)]:pt-6 [&:not(:placeholder-shown)]:pb-2 autofill:pt-6 autofill:pb-2" />
                <label
                    for="hs-floating-crs-name"
                    class="absolute top-0 start-0 p-4 h-full text-sm truncate pointer-events-none transition ease-in-out duration-100 border border-transparent peer-disabled:opacity-50 peer-disabled:pointer-events-none peer-focus:text-xs peer-focus:-translate-y-1.5 peer-focus:text-gray-500 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-translate-y-1.5 peer-[:not(:placeholder-shown)]:text-gray-500">
                    คะแนน
                </label>
            </div>
        </div>

        <div class="flex flex-row gap-4">
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
                    v-model="beginDate"
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
    </div>
</template>
