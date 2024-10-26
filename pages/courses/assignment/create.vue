<script setup lang="ts">
    import { toast } from '@steveyuowo/vue-hot-toast'

    definePageMeta({
        layout: 'course',
    })
    const route = useRoute()
    const assignmentName = ref('')
    const assignmentScore = ref('')
    const dueDate = ref('')
    const assignmentFile = ref<{ name: string; file: File }[]>([])
    const inputFile = ref()
    function onFileChangedAss($event: Event) {
        const target = $event.target as HTMLInputElement
        if (target && target.files) {
            assignmentFile.value.push({
                name: target.files[0].name,
                file: target.files[0],
            })
        }
    }

    async function uploadPost(postFile: number[]) {
        const createAssignmentToast = toast.loading('กำลังสร้างโพสต์')
        const payload = {
            c_id: route.query.id,
            a_name: assignmentName.value,
            a_files: [],
        }
        if (postFile.length > 0) Object.assign(payload, { a_files: postFile })
        if (assignmentScore.value)
            Object.assign(payload, { a_score: assignmentScore.value })
        if (dueDate.value) Object.assign(payload, { a_due_date: dueDate.value })

        await $fetch<{ message: string }>('/api/courses/assignment/', {
            method: 'PUT',
            body: payload,
        })
            .then(async (Pres) => {
                toast.update(createAssignmentToast, {
                    type: 'success',
                    message: Pres?.message,
                })
                navigateTo(`/courses/assignment/?id=${route.query.id}`)
            })
            .catch((Perr) => {
                toast.update(createAssignmentToast, {
                    type: 'error',
                    message: Perr?.data?.message,
                })
            })
    }

    async function uploadFile() {
        if (!assignmentFile.value.length) {
            return
        }

        const courseId =
            typeof route.query.id === 'string' ? route.query.id : null // Extract courseId

        if (!courseId) {
            // Handle the case where courseId is not a string (e.g., display an error)
            toast.error('Course ID is not available.')
            console.error('Course ID is not available.')
            return
        }

        const uploadAssignmentFileToast = toast.loading('กำลังอัพโหลดไฟล์แนบ')
        const formData = new FormData()

        formData.append('c_id', courseId) // Use courseId here
        for (let x = 0; x < assignmentFile.value.length; x++) {
            formData.append('f_data[]', assignmentFile.value[x].file)
        }

        await $fetch<{ f_id: number[]; message: string }>('/api/file/post/', {
            method: 'POST',
            body: formData,
        })
            .then(async (res) => {
                toast.update(uploadAssignmentFileToast, {
                    type: 'success',
                    message: res?.message,
                })
                await uploadPost(res.f_id)
            })
            .catch((err) => {
                toast.update(uploadAssignmentFileToast, {
                    type: 'error',
                    message: err?.data?.message,
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
                <button
                    class="inline-flex items-center gap-x-2 rounded-lg border border-transparent px-3 py-2 text-sm font-semibold text-blue-600 transition-all duration-200 ease-in-out hover:bg-blue-100 hover:text-blue-800 disabled:pointer-events-none disabled:opacity-50"
                    @click="
                        navigateTo(`/courses/assignment/?id=${route.query.id}`)
                    ">
                    <span class="material-icons-outlined">arrow_back</span>
                </button>
                <span class="text-4xl font-bold">เพิ่มงานมอบหมาย</span>
            </div>
            <div class="flex justify-end">
                <button
                    type="button"
                    class="transition-color inline-flex items-center gap-x-2 rounded-lg border border-transparent bg-blue-600 px-3 py-2 text-sm font-semibold text-white duration-200 ease-in-out hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50"
                    @click="
                        () => {
                            if (assignmentFile.length) {
                                uploadFile()
                            } else {
                                uploadPost([])
                            }
                        }
                    ">
                    สร้าง
                </button>
            </div>
        </div>
        <div class="flex flex-col gap-4 md:flex-row">
            <div class="relative flex-grow">
                <input
                    id="hs-floating-crs-name"
                    v-model="assignmentName"
                    type="text"
                    placeholder="หัวข้อโพสต์"
                    class="peer block w-full rounded-lg border-gray-200 p-4 text-sm placeholder:text-transparent autofill:pb-2 autofill:pt-6 focus:border-blue-500 focus:pb-2 focus:pt-6 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 [&:not(:placeholder-shown)]:pb-2 [&:not(:placeholder-shown)]:pt-6" >
                <label
                    for="hs-floating-crs-name"
                    class="pointer-events-none absolute start-0 top-0 h-full truncate border border-transparent p-4 text-sm transition duration-100 ease-in-out peer-focus:-translate-y-1.5 peer-focus:text-xs peer-focus:text-gray-500 peer-disabled:pointer-events-none peer-disabled:opacity-50 peer-[:not(:placeholder-shown)]:-translate-y-1.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-500">
                    ชื่องานมอบหมาย
                    <span class="text-red-400">*</span>
                </label>
            </div>
            <div class="relative">
                <input
                    id="hs-floating-crs-name"
                    v-model="assignmentScore"
                    type="number"
                    placeholder="หัวข้อโพสต์"
                    class="peer block w-64 rounded-lg border-gray-200 p-4 text-sm placeholder:text-transparent autofill:pb-2 autofill:pt-6 focus:border-blue-500 focus:pb-2 focus:pt-6 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 [&:not(:placeholder-shown)]:pb-2 [&:not(:placeholder-shown)]:pt-6" >
                <label
                    for="hs-floating-crs-name"
                    class="pointer-events-none absolute start-0 top-0 h-full truncate border border-transparent p-4 text-sm transition duration-100 ease-in-out peer-focus:-translate-y-1.5 peer-focus:text-xs peer-focus:text-gray-500 peer-disabled:pointer-events-none peer-disabled:opacity-50 peer-[:not(:placeholder-shown)]:-translate-y-1.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-500">
                    คะแนน
                </label>
            </div>
        </div>

        <div class="relative flex-grow">
            <input
                id="hs-floating-crs-name"
                v-model="dueDate"
                type="datetime-local"
                placeholder="หัวข้อโพสต์"
                class="peer block w-full rounded-lg border-gray-200 p-4 text-sm placeholder:text-transparent autofill:pb-2 autofill:pt-6 focus:border-blue-500 focus:pb-2 focus:pt-6 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 [&:not(:placeholder-shown)]:pb-2 [&:not(:placeholder-shown)]:pt-6" >
            <label
                for="hs-floating-crs-name"
                class="pointer-events-none absolute start-0 top-0 h-full truncate border border-transparent p-4 text-sm transition duration-100 ease-in-out peer-focus:-translate-y-1.5 peer-focus:text-xs peer-focus:text-gray-500 peer-disabled:pointer-events-none peer-disabled:opacity-50 peer-[:not(:placeholder-shown)]:-translate-y-1.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-500">
                กำหนดเวลาส่ง
            </label>
        </div>
        <div class="flex w-full flex-col gap-2 md:flex-row md:flex-nowrap">
            <input
                ref="inputFile"
                type="file"
                hidden
                @change="onFileChangedAss" >
            <!-- End Floating Input -->
            <div>
                <button
                    type="button"
                    class="transition-color inline-flex items-center gap-x-2 rounded-lg border border-transparent bg-blue-600 px-3 py-2 text-sm font-semibold text-white duration-200 ease-in-out hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50"
                    @click="inputFile.click()">
                    <span class="material-icons-outlined">upload_file</span>
                    เพิ่มไฟล์แนบ
                </button>
            </div>
            <div
                class="flex flex-col gap-x-4 gap-y-2 overflow-auto md:flex-row">
                <TransitionGroup name="fade">
                    <div
                        v-for="(file, index) in assignmentFile"
                        :key="index + file.name"
                        class="flex items-center justify-between gap-2 rounded-md bg-blue-100 px-2 py-1.5 text-blue-600">
                        <div
                            class="flex w-full flex-row flex-nowrap items-center gap-2 overflow-hidden">
                            <span class="material-icons-outlined select-none">
                                insert_drive_file
                            </span>
                            <span
                                class="w-full overflow-hidden text-ellipsis whitespace-nowrap text-xs md:w-24">
                                {{ file.name }}
                            </span>
                        </div>
                        <span
                            class="material-icons-outlined cursor-pointer select-none text-red-500"
                            @click="
                                () => {
                                    if (index > -1) {
                                        assignmentFile.splice(index, 1)
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
