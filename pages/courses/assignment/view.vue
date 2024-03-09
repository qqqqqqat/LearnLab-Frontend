<script setup lang="ts">
    definePageMeta({
        layout: 'course',
    })
    import { toast } from '@steveyuowo/vue-hot-toast'

    const crs_pending = ref(true)
    const assignments = ref()
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

    async function openAssignment(a_id: number) {
        // await navigateTo(`/courses/submission?a_id=${a_id}&id=${route.query.id}`)
    }

    fetchSubmission(route.query.id, route.query.a_id)
</script>
<template>
    <div class="flex flex-col gap-4 w-full">
        <div v-if="(assignments?.data?.length || 0) > 0" v-for="assign in assignments.data" class="flex flex-row justify-between border border-1 rounded-md gap-2 w-full p-4">
            <div class="flex items-center gap-2">
                <div v-if="assign.u_avatar" class="rounded-md w-12 h-12"><img class="rounded-md aspect-square object-cover border bottom-1" :src="`/api/avatar/?u_id=${assign.u_id}`" /></div>
                <div class="rounded-md w-12 h-12 bg-slate-200 flex flex-col justify-center items-center text-2xl select-none" v-if="!assign?.u_avatar">
                    {{ `${assign?.u_firstname.slice(0, 1)}${assign?.u_lastname.slice(0, 1)}` }}
                </div>
                <div class="flex justify-center">{{ assign.u_firstname }} {{ assign.u_firstname }}</div>
            </div>
            <div class="flex gap-4 items-center">
                <div class="">
                    {{ assign.s_datetime ? 'ส่งแล้ว' : 'ยังไม่ส่ง' }}
                </div>
                <button
                    type="button"
                    @click="openAssignment(assign.a_id)"
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
