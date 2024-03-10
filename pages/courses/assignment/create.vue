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
            assignmentFile.value.push({ name: target.files[0].name, file: target.files[0] })
        }
    }

    async function uploadPost(postFile: number[]) {
        const createAssignmentToast = toast.loading('กำลังสร้างโพสต์')
        let payload = {
            c_id: route.query.id,
            a_name: assignmentName.value,
            a_files: []
        }
        if (postFile.length > 0) Object.assign(payload, { a_files: postFile })
        if (assignmentScore.value) Object.assign(payload, { a_score: assignmentScore.value })
        if (dueDate.value) Object.assign(payload, { a_due_date: dueDate.value })

        await $fetch<{ message: string }>('/api/courses/assignment/', {
            method: 'PUT',
            body: payload,
        })
            .then(async (Pres) => {
                toast.update(createAssignmentToast, { type: 'success', message: Pres?.message })
                navigateTo(`/courses/assignment/?id=${route.query.id}`)
            })
            .catch((Perr) => {
                toast.update(createAssignmentToast, { type: 'error', message: Perr?.data?.message })
            })
    }

    async function uploadFile() {
        if (!assignmentFile.value.length) {
            return
        }
        const uploadAssignmentFileToast = toast.loading('กำลังอัพโหลดไฟล์แนบ')
        const formData = new FormData()
        formData.append('c_id', route.query.id)
        for (let x = 0; x < assignmentFile.value.length; x++) {
            formData.append('f_data[]', assignmentFile.value[x].file)
        }
        await $fetch<{ f_id: number[]; message: string }>('/api/file/post/', {
            method: 'POST',
            body: formData,
        })
            .then(async (res) => {
                toast.update(uploadAssignmentFileToast, { type: 'success', message: res?.message })
                await uploadPost(res.f_id);
            })
            .catch((err) => {
                toast.update(uploadAssignmentFileToast, { type: 'error', message: err?.data?.message })
            })
    }

</script>
<template>
    <div class="flex flex-col gap-4 w-full">
        <div class="flex sm:flex-row flex-col justify-between sm:w-full gap-2">
            <div class="flex flex-row gap-2">
                <button
                    @click="navigateTo(`/courses/assignment/?id=${route.query.id}`)"
                    class="transition-all duration-200 ease-in-out py-2 px-3 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-blue-600 hover:bg-blue-100 hover:text-blue-800 disabled:opacity-50 disabled:pointer-events-none">
                    <span class="material-icons-outlined">arrow_back</span>
                </button>
                <span class="text-4xl font-bold">เพิ่มงานมอบหมาย</span>
            </div>
            <div class="flex justify-end">
                <button
                        @click="() => {
                            if (assignmentFile.length) {
                                uploadFile()
                            } else {
                                uploadPost([])
                            }
                        }"
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
                    v-model="assignmentName"
                    id="hs-floating-crs-name"
                    placeholder="หัวข้อโพสต์"
                    class="peer p-4 block w-full border-gray-200 rounded-lg text-sm placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none focus:pt-6 focus:pb-2 [&:not(:placeholder-shown)]:pt-6 [&:not(:placeholder-shown)]:pb-2 autofill:pt-6 autofill:pb-2" />
                <label
                    for="hs-floating-crs-name"
                    class="absolute top-0 start-0 p-4 h-full text-sm truncate pointer-events-none transition ease-in-out duration-100 border border-transparent peer-disabled:opacity-50 peer-disabled:pointer-events-none peer-focus:text-xs peer-focus:-translate-y-1.5 peer-focus:text-gray-500 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-translate-y-1.5 peer-[:not(:placeholder-shown)]:text-gray-500">
                    ชื่องานมอบหมาย
                    <span class="text-red-400">*</span>
                </label>
            </div>
            <div class="relative">
                <input
                    type="number"
                    v-model="assignmentScore"
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

        <div class="relative flex-grow">
            <input
                type="datetime-local"
                v-model="dueDate"
                id="hs-floating-crs-name"
                placeholder="หัวข้อโพสต์"
                class="peer p-4 block w-full border-gray-200 rounded-lg text-sm placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none focus:pt-6 focus:pb-2 [&:not(:placeholder-shown)]:pt-6 [&:not(:placeholder-shown)]:pb-2 autofill:pt-6 autofill:pb-2" />
            <label
                for="hs-floating-crs-name"
                class="absolute top-0 start-0 p-4 h-full text-sm truncate pointer-events-none transition ease-in-out duration-100 border border-transparent peer-disabled:opacity-50 peer-disabled:pointer-events-none peer-focus:text-xs peer-focus:-translate-y-1.5 peer-focus:text-gray-500 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-translate-y-1.5 peer-[:not(:placeholder-shown)]:text-gray-500">
                กำหนดเวลาส่ง
            </label>
        </div>
        <div class="flex md:flex-row md:flex-nowrap flex-col gap-2 w-full">
            <input @change="onFileChangedAss" ref="inputFile" type="file" hidden />
            <!-- End Floating Input -->
            <div>
                <button
                    @click="inputFile.click()"
                    type="button"
                    class="transition-color duration-200 ease-in-out py-2 px-3 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none">
                    <span class="material-icons-outlined">upload_file</span>
                    เพิ่มไฟล์แนบ
                </button>
            </div>
            <div class="flex md:flex-row flex-col overflow-auto gap-x-4 gap-y-2">
                <TransitionGroup name="fade">
                    <div v-for="(file, index) in assignmentFile" :key="index + file.name" class="flex gap-2 justify-between items-center px-2 py-1.5 rounded-md bg-blue-100 text-blue-600">
                        <div class="flex flex-row flex-nowrap items-center gap-2 w-full overflow-hidden">
                            <span class="material-icons-outlined select-none">insert_drive_file</span>
                            <span class="md:w-24 w-full text-xs whitespace-nowrap text-ellipsis overflow-hidden">{{ file.name }}</span>
                        </div>
                        <span
                            class="material-icons-outlined select-none cursor-pointer text-red-500"
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
