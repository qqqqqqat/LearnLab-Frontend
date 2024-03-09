<script setup lang="ts">
    import { toast } from '@steveyuowo/vue-hot-toast'
    import { MdPreview } from 'md-editor-v3'
    const userRole = useUserCourseState()
    const assignments = ref()
    const assignPending = ref(true)
    const postContent = ref<string>('')
    const submitFiles = ref<{ name: string; file: File }[]>([])
    const inputFile = ref()
    definePageMeta({
        layout: 'course',
    })

    async function getOneAssignment(id: number, a_id: number) {
        await $fetch('/api/courses/assignment/', {
            query: {
                c_id: id,
                a_id: a_id
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

    function getRteText(text: string) {
        postContent.value = text
    }
    async function makeSubmission(postFile: number[]) {
        assignPending.value = true
        const createSubmissionToast = toast.loading('กำลังบันทึกการส่งงาน')
        let payload = {
            a_id: route.query.a_id,
            c_id: route.query.id,
            s_content: { files: [], text: "" }
        }
        if (postFile.length > 0) Object.assign(payload.s_content, {files: postFile})
        if (postContent.value) Object.assign(payload.s_content, {text: postContent.value})
        await $fetch<{ message: string }>('/api/courses/assignment/submit', {
            method: 'PUT',
            body: payload,
        })
            .then((Pres) => {
                toast.update(createSubmissionToast, { type: 'success', message: Pres?.message })
                assignPending.value = false
            })
            .catch((Perr) => {
                toast.update(createSubmissionToast, { type: 'error', message: Perr?.data?.message })
                assignPending.value = false
            })
    }

    async function submitFile() {
        if (!submitFiles.value.length) {
            return
        }
        const uploadSubmitFileToast = toast.loading('กำลังอัพโหลดไฟล์แนบ')
        const formData = new FormData()
        formData.append('c_id', route.query.id)
        formData.append('a_id', route.query.a_id)
        for (let x = 0; x < submitFiles.value.length; x++) {
            formData.append('f_data[]', submitFiles.value[x].file)
        }
        await $fetch<{ f_id: number[]; message: string }>('/api/file/submit/', {
            method: 'POST',
            body: formData,
        })
            .then(async (res) => {
                await makeSubmission(res.f_id)
            })
            .catch((err) => {
                toast.update(uploadSubmitFileToast, { type: 'error', message: err?.data?.message })
            })
    }
    function onFileChangedMat($event: Event) {
        const target = $event.target as HTMLInputElement
        if (target && target.files) {
            submitFiles.value.push({ name: target.files[0].name, file: target.files[0] })
        }
    }

    const route = useRoute()
    if (route.query.id && route.query.a_id) {
        getOneAssignment(route.query.id, route.query.a_id)
    }
</script>
<template>
    <div class="flex flex-col gap-4 w-full">
        <div class="flex md:flex-row flex-col md:justify-between md:items-center gap-2">
            <div class="flex items-center gap-2">
                <div>
                    <button
                        @click="navigateTo(`/courses/assignment?id=${route.query.id}`)"
                        class="transition-all duration-200 ease-in-out py-2 px-3 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-blue-600 hover:bg-blue-100 hover:text-blue-800 disabled:opacity-50 disabled:pointer-events-none">
                        <span class="material-icons-outlined">arrow_back</span>
                    </button>
                </div>
                <span class="text-2xl font-bold">
                    ส่งงาน : {{ assignments?.a_name }}
                    <div class="flex flex-col">
                        <span class="text-sm text-slate-400">{{ assignments?.a_due_date ? `กำหนดส่ง ${new Date(assignments?.a_due_date).toLocaleString()}` : 'ไม่มีกำหนดส่ง' }}</span>
                        <span class="text-sm text-slate-400">{{ assignments?.a_score ? `${assignments?.a_score} คะแนน` : 'ไม่มีคะแนน' }}</span>
                    </div>
                </span>
            </div>
            <div class="md:w-fit w-full">
                <button
                    @click="
                        () => {
                            if (submitFiles.length) {
                                submitFile()
                            } else {
                                makeSubmission([])
                            }
                        }
                    "
                    type="button"
                    :disabled="assignPending"
                    class="md:w-fit w-full justify-center transition-color duration-200 ease-in-out py-2 px-6 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none">
                    ส่ง
                </button>
            </div>
        </div>
        
    </div>
        <div class="flex flex-col gap-4 overflow-y-auto">
            <div>
                <RichEditor @send-text="getRteText" />
            </div>
            <div class="flex md:flex-row md:flex-nowrap flex-col gap-2 w-full">
                <input @change="onFileChangedMat" ref="inputFile" type="file" hidden />
                <!-- End Floating Input -->
                <div>
                    <button
                        @click="inputFile.click()"
                        type="button"
                        :disabled="assignPending"
                        class="transition-color duration-200 ease-in-out py-2 px-3 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none">
                        <span class="material-icons-outlined">upload_file</span>
                        เพิ่มไฟล์แนบ
                    </button>
                </div>
                <div class="flex md:flex-row flex-col overflow-auto gap-x-4 gap-y-2">
                    <TransitionGroup name="fade">
                        <div v-for="(file, index) in submitFiles" :key="index + file.name" class="flex gap-2 justify-between items-center px-2 py-1.5 rounded-md bg-blue-100 text-blue-600">
                            <div class="flex flex-row flex-nowrap items-center gap-2 w-full overflow-hidden">
                                <span class="material-icons-outlined select-none">insert_drive_file</span>
                                <span class="md:w-24 w-full text-xs whitespace-nowrap text-ellipsis overflow-hidden">{{ file.name }}</span>
                            </div>
                            <span
                                class="material-icons-outlined select-none cursor-pointer text-red-500"
                                @click="
                                    () => {
                                        if (index > -1) {
                                            submitFiles.splice(index, 1)
                                        }
                                    }
                                ">
                                delete
                            </span>
                        </div>
                    </TransitionGroup>
                </div>
            </div>
        </div>
        
</template>
