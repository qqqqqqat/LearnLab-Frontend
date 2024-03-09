<script setup lang="ts">
    definePageMeta({
        layout: 'course',
    })
    import { toast } from '@steveyuowo/vue-hot-toast'

    const userRole = useUserCourseState()
    const route = useRoute()
    const assignments = ref()
    const assignPending = ref(true)
    async function fetchAssignment(id: number) {
        await $fetch('/api/courses/assignment/', {
            query: {
                c_id: id,
            },
        })
            .then((res) => {
                assignments.value = res
                assignPending.value = false
            })
            .catch((err) => {
                toast.error(err?.data?.message)
                navigateTo('/mycourse', { replace: true })
            })
    }

    async function downloadFile(f_id: number) {
        await navigateTo(`/api/file?f_id=${f_id}`, { open: { target: '_blank' } })
    }


    if (route.query.id) {
        fetchAssignment(route.query.id)
    }
</script>
<template>
    <div class="flex flex-col gap-4 w-full">
        <div class="flex flex-row justify-between items-center gap-4">
            <div></div>
            <button
                v-if="userRole?.[route.query.id] !== 'STUDENT'"
                type="button"
                class="py-2 px-3 flex-shrink-0 transition-colors duration-150 ease-in-out inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none">
                <span class="material-icons-outlined">add</span>
                เพิ่มงานมอบหมายในคอร์ส
            </button>
        </div>
        <div v-if="(assignments?.length || 0) > 0" v-for="assign in assignments" class="flex flex-col border border-1 rounded-md gap-2 w-full p-4">
            <div class="flex flex-wrap items-center gap-4 w-full">
                <div class="flex flex-col">
                    <span class="text-sm text-slate-400">{{ assign.a_due_date ? `กำหนดส่ง ${new Date(assign.a_due_date).toLocaleString()}` : 'ไม่มีกำหนดส่ง' }}</span>
                    <span class="text-sm text-slate-400">{{ assign.a_score ? `${assign.a_score} คะแนน` : 'ไม่มีคะแนน' }}</span>
                </div>
            </div>
            <div class="text-xl font-bold">{{ assign.a_name }}</div>
        </div>
        <div v-else-if="!assignPending && (assignments?.data?.length || 0) === 0" class="flex md:flex-row flex-col items-center border border-1 rounded-md gap-2 w-full p-4">
            <img class="w-64" src="~/assets/images/content.svg" />
            <span class="text-3xl font-bold">ยังไม่มีโพสต์ในคอร์สนี้</span>
        </div>
        <div v-else class="flex flex-row border border-1 rounded-md gap-2 w-full p-4">
            <div class="animate-spin inline-block size-6 border-[3px] border-current border-t-transparent text-blue-600 rounded-full dark:text-blue-500" role="status" aria-label="loading">
                <span class="sr-only">Loading...</span>
            </div>
            กำลังโหลดข้อมูล
        </div>
    </div>
</template>
