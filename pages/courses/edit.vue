<script setup lang="ts">
    definePageMeta({
        layout: 'course',
    })
    import { toast } from '@steveyuowo/vue-hot-toast'
    const userState = useUserState()

    let crs_pending = ref(true)
    const route = useRoute()

    const crs_member = ref()

    const courseName = ref<string>('')
    const courseDescription = ref<string>('')
    const wasPasswordProtected = ref<boolean>(false)
    const passwordProtected = ref<boolean>(false)
    const coursePassword = ref<string>('')
    const coursePrivacy = ref<boolean>(false) // false = PUBLIC , true = PRIVATE
    const courseBanner = ref()

    function onFileChangedBanner($event: Event) {
        const target = $event.target as HTMLInputElement
        if (target && target.files) {
            courseBanner.value = target.files[0]
        }
    }

    async function updateCourse() {
        const createCourseToast = toast.loading('กำลังสร้างคอร์ส')
        const formData = new FormData()
        formData.append('c_id', route.query.id)
        formData.append('c_name', courseName.value)
        formData.append('c_description', courseDescription.value)
        formData.append('c_privacy', coursePrivacy.value ? 'PRIVATE' : 'PUBLIC')

        if (courseBanner.value) {
            formData.append('c_banner', courseBanner.value)
        }
        if (passwordProtected.value && coursePassword.value) {
            formData.append('c_password', coursePassword.value)
        } else if (wasPasswordProtected.value && !passwordProtected.value) {
            formData.append('c_remove_password', '')
        }
        await $fetch<CourseCreationResponse>('/api/courses/edit/', {
            method: 'POST',
            body: formData,
        })
            .then((res) => {
                toast.update(createCourseToast, { type: 'success', message: res?.message })
                fetchCourse(route.query.id)
            })
            .catch((err) => {
                toast.update(createCourseToast, { type: 'error', message: err?.data?.message })
            })
    }

    async function fetchCourse(id: number) {
        await $fetch<CoursePageAPIPUTResponse>('/api/courses/', {
            method: 'PUT',
            body: { c_id: id },
        })
            .then((res) => {
                courseName.value = res.c_name
                courseDescription.value = res.c_description
                wasPasswordProtected.value = res.c_hashed_password
                passwordProtected.value = res.c_hashed_password
                coursePrivacy.value = res.c_privacy === 'PRIVATE'
                crs_pending.value = false
            })
            .catch((err) => {
                toast.error(err?.data?.message)
                navigateTo('/mycourse', { replace: true })
            })
    }

    async function fetchMember(id: number) {
        await $fetch('/api/courses/enroll/', {
            query: { c_id: id },
        })
            .then((res) => {
                crs_member.value = res
                crs_pending.value = false
            })
            .catch((err) => {
                toast.error(err?.data?.message)
                navigateTo('/mycourse', { replace: true })
            })
    }

    async function updateMemberRole(u_id: number, c_id: number, u_role: 'TA' | 'STUDENT') {
        const updateRoleToast = toast.loading('กำลังอัพเดทตำแหน่ง')

        await $fetch('/api/courses/enroll/', {
            method: 'PATCH',
            body: { u_id: u_id, c_id: c_id, u_role: u_role },
        })
            .then((res) => {
                fetchMember(route.query.id)
                toast.update(updateRoleToast, { type: 'success', message: res?.message })
                crs_pending.value = false
            })
            .catch((err) => {
                toast.update(updateRoleToast, { type: 'error', message: err?.data?.message })
                navigateTo('/mycourse', { replace: true })
            })
    }

    async function deleteMember(u_id: number, c_id: number) {
        const updateRoleToast = toast.loading('กำลังอัพเดทตำแหน่ง')

        await $fetch('/api/courses/enroll/', {
            method: 'DELETE',
            body: { u_id: u_id, c_id: c_id },
        })
            .then((res) => {
                fetchMember(route.query.id)
                toast.update(updateRoleToast, { type: 'success', message: res?.message })
                crs_pending.value = false
            })
            .catch((err) => {
                toast.update(updateRoleToast, { type: 'error', message: err?.data?.message })
                navigateTo('/mycourse', { replace: true })
            })
    }

    async function deleteCourse(id: number) {
        await $fetch<{ status: number; message: string }>('/api/courses/', {
            method: 'DELETE',
            body: { c_id: id },
        })
            .then((res) => {
                toast.success(res.message)
                confirmModal.value.c_closeModal()
                setTimeout(async () => navigateTo('/mycourse', { replace: true }), 1000)
            })
            .catch((err) => {
                toast.error(err?.data?.message)
            })
    }

    async function addMember(id: number, u_email: string) {
        isImporting.value = true
        await $fetch<{ status: number; message: string }>('/api/courses/enroll/mail/', {
            method: 'PUT',
            body: { c_id: id, u_email: u_email },
        })
            .then((res) => {
                fetchMember(route.query.id)
                inviteUserEmail.value = ''
                isImporting.value = false
                toast.success(res.message)
            })
            .catch((err) => {
                isImporting.value = false
                toast.error(err?.data?.message)
            })
    }

    if (route.query.id) {
        fetchCourse(route.query.id)
        fetchMember(route.query.id)
    }
    const confirmModal = ref()
    const actionName = ref('')
    const inviteUserEmail = ref('')
    const isImporting = ref(false)
</script>
<template>
    <CourseConfirmModal ref="confirmModal" :action="actionName" @do-action="deleteCourse(route.query.id)" />
    <div class="flex flex-col gap-4 w-full">
        <div><span class="text-4xl font-bold">แก้ไขคอร์ส</span></div>
        <div class="flex flex-col gap-4 px-4">
            <div class="relative">
                <input
                    type="text"
                    v-model="courseName"
                    id="hs-floating-input-text-course-1"
                    class="peer p-4 block w-full border-gray-200 rounded-lg text-sm placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-non focus:pt-6 focus:pb-2 [&:not(:placeholder-shown)]:pt-6 [&:not(:placeholder-shown)]:pb-2 autofill:pt-6 autofill:pb-2"
                    placeholder="LearnLab Course-course" />
                <label
                    for="hs-floating-input-text-course-1"
                    class="absolute top-0 start-0 p-4 h-full text-sm truncate pointer-events-none transition ease-in-out duration-100 border border-transparent peer-disabled:opacity-50 peer-disabled:pointer-events-none peer-focus:text-xs peer-focus:-translate-y-1.5 peer-focus:text-gray-500 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-translate-y-1.5 peer-[:not(:placeholder-shown)]:text-gray-500">
                    ชื่อคอร์ส
                    <span class="text-red-600">*</span>
                </label>
            </div>
            <!-- Floating Textarea -->
            <div class="relative">
                <textarea
                    v-model="courseDescription"
                    id="hs-floating-textarea-desc"
                    class="peer p-4 block w-full border-gray-200 rounded-lg text-sm placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none focus:pt-6 focus:pb-2 [&:not(:placeholder-shown)]:pt-6 [&:not(:placeholder-shown)]:pb-2 autofill:pt-6 autofill:pb-2"
                    placeholder="Course Description"></textarea>
                <label
                    for="hs-floating-textarea-desc"
                    class="absolute top-0 start-0 p-4 h-full text-sm truncate pointer-events-none transition ease-in-out duration-100 border border-transparent peer-disabled:opacity-50 peer-disabled:pointer-events-none peer-focus:text-xs peer-focus:-translate-y-1.5 peer-focus:text-gray-500 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-translate-y-1.5 peer-[:not(:placeholder-shown)]:text-gray-500">
                    คำอธิบายคอร์ส
                    <span class="text-red-600">*</span>
                </label>
            </div>
            <!-- End Floating Textarea -->
            <form>
                <label class="text-sm mb-2">ปกคอร์ส</label>
                <label for="small-file-input-banner" class="sr-only">ปกคอร์ส</label>
                <input
                    @change="onFileChangedBanner($event)"
                    accept="image/*"
                    type="file"
                    name="small-file-input-banner"
                    id="small-file-input-banner"
                    class="block w-full border border-gray-200 shadow-sm rounded-lg text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none file:bg-gray-50 file:border-0 file:me-4 file:py-2 file:px-4" />
            </form>
            <div class="flex flex-row items-center gap-4">
                <div class="flex w-20">
                    <input
                        v-model="passwordProtected"
                        type="checkbox"
                        class="shrink-0 mt-0.5 border-gray-200 rounded text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                        id="hs-checked-checkbox"
                        checked />
                    <label for="hs-checked-checkbox" class="text-sm text-gray-500 ms-3">มีรหัส</label>
                </div>
                <div v-if="passwordProtected" class="relative w-full">
                    <input
                        v-model="coursePassword"
                        type="password"
                        id="hs-floating-input-text"
                        class="peer p-4 block w-full border-gray-200 rounded-lg text-sm placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-non focus:pt-6 focus:pb-2 [&:not(:placeholder-shown)]:pt-6 [&:not(:placeholder-shown)]:pb-2 autofill:pt-6 autofill:pb-2"
                        placeholder="password" />
                    <label
                        for="hs-floating-input-text"
                        class="absolute top-0 start-0 p-4 h-full text-sm truncate pointer-events-none transition ease-in-out duration-100 border border-transparent peer-disabled:opacity-50 peer-disabled:pointer-events-none peer-focus:text-xs peer-focus:-translate-y-1.5 peer-focus:text-gray-500 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-translate-y-1.5 peer-[:not(:placeholder-shown)]:text-gray-500">
                        รหัสของคอร์ส
                        <span class="text-red-600">*</span>
                    </label>
                </div>
            </div>
            <div class="flex items-center">
                <label for="hs-basic-with-description" class="text-sm text-gray-500 me-3">สาธารณะ</label>
                <input
                    v-model="coursePrivacy"
                    type="checkbox"
                    id="hs-basic-with-description"
                    class="relative w-[3.25rem] h-7 p-px bg-gray-100 border-transparent text-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:ring-blue-600 disabled:opacity-50 disabled:pointer-events-none checked:bg-none checked:text-blue-600 checked:border-blue-600 focus:checked:border-blue-600 before:inline-block before:size-6 before:bg-white checked:before:bg-blue-200 before:translate-x-0 checked:before:translate-x-full before:rounded-full before:shadow before:transform before:ring-0 before:transition before:ease-in-out before:duration-200" />
                <label for="hs-basic-with-description" class="text-sm text-gray-500 ms-3">ส่วนตัว</label>
            </div>
        </div>
        <div class="flex justify-end items-center gap-x-2 py-3 px-4">
            <button
                @click="
                    () => {
                        actionName = 'ลบคอร์สนี้'
                        confirmModal.c_openModal()
                    }
                "
                type="button"
                class="transition-color duration-200 ease-in-out py-3 px-4 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:pointer-events-none">
                ลบคอร์ส
            </button>
            <button
                :disabled="!(courseName && courseDescription)"
                @click="updateCourse()"
                type="button"
                class="transition-color duration-200 ease-in-out py-3 px-4 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none">
                แก้ไข
            </button>
        </div>
        <hr />
        <div>
            <div class="flex md:flex-row flex-col justify-between mt-4 gap-4">
                <span class="text-4xl font-bold">สมาชิก</span>
                <div class="flex flex-row gap-4">
                    <div class="relative w-64">
                        <input
                            type="email"
                            :readonly="isImporting"
                            v-model="inviteUserEmail"
                            id="hs-floating-input-text-course"
                            class="peer p-4 block w-full border-gray-200 rounded-lg text-sm placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-non focus:pt-6 focus:pb-2 [&:not(:placeholder-shown)]:pt-6 [&:not(:placeholder-shown)]:pb-2 autofill:pt-6 autofill:pb-2"
                            placeholder="LearnLab Course-course" />
                        <label
                            for="hs-floating-input-text-course"
                            class="absolute top-0 start-0 p-4 h-full text-sm truncate pointer-events-none transition ease-in-out duration-100 border border-transparent peer-disabled:opacity-50 peer-disabled:pointer-events-none peer-focus:text-xs peer-focus:-translate-y-1.5 peer-focus:text-gray-500 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-translate-y-1.5 peer-[:not(:placeholder-shown)]:text-gray-500">
                            E-Mail ของผู้ที่ต้องการนำเข้าคอร์ส
                            <span class="text-red-600">*</span>
                        </label>
                    </div>
                    <button
                        @click="addMember(route.query.id, inviteUserEmail)"
                        :disabled="isImporting"
                        type="button"
                        class="transition-color duration-200 ease-in-out py-3 px-4 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none">
                        นำเข้า
                    </button>
                </div>
            </div>
            <div class="flex flex-col mt-4">
                <div class="-m-1.5 overflow-x-auto">
                    <div class="p-1.5 min-w-full inline-block align-middle">
                        <div class="border rounded-lg overflow-hidden">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th scope="col" class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">รูป</th>
                                        <th scope="col" class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">ชื่อ</th>
                                        <th scope="col" class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">ตำแหน่ง</th>
                                        <th scope="col" class="px-6 py-3 text-end text-xs font-medium text-gray-500 uppercase">Action</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-200">
                                    <tr v-for="member in crs_member">
                                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                                            <div v-if="member.u_avatar" class="rounded-md w-12 h-12">
                                                <img class="rounded-md aspect-square object-cover border bottom-1" loading="lazy" :src="`/api/avatar/?u_id=${member.u_id}`" />
                                            </div>
                                            <div class="rounded-md w-12 h-12 bg-slate-200 flex flex-col justify-center items-center text-2xl select-none" v-if="!member?.u_avatar">
                                                {{ `${member?.u_firstname.slice(0, 1)}${member?.u_lastname.slice(0, 1)}` }}
                                            </div>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{{ member.u_firstname }} {{ member.u_lastname }}</td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                            <span
                                                v-if="member.u_role === 'INSTRUCTOR'"
                                                class="inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-blue-600 text-white dark:bg-blue-500">
                                                {{ member.u_role }}
                                            </span>
                                            <span v-if="member.u_role === 'STUDENT'" class="inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-teal-500 text-white">
                                                {{ member.u_role }}
                                            </span>
                                            <span v-if="member.u_role === 'TA'" class="inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-yellow-500 text-white">
                                                {{ member.u_role }}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                                            <div class="flex flex-row justify-end gap-4" v-if="member.u_role !== 'INSTRUCTOR' && member.u_id !== userState?.u_id">
                                                <button
                                                    v-if="member.u_role === 'STUDENT'"
                                                    type="button"
                                                    @click="updateMemberRole(member.u_id, route.query.id, 'TA')"
                                                    class="inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:pointer-events-none">
                                                    ปรับเป็น TA
                                                </button>
                                                <button
                                                    v-else
                                                    type="button"
                                                    @click="updateMemberRole(member.u_id, route.query.id, 'STUDENT')"
                                                    class="inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:pointer-events-none">
                                                    ปรับเป็น STUDENT
                                                </button>
                                                <button
                                                    type="button"
                                                    @click="deleteMember(member.u_id, route.query.id)"
                                                    class="inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-red-600 hover:text-red-800 disabled:opacity-50 disabled:pointer-events-none">
                                                    ลบ
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
    .fade-enter-active,
    .fade-leave-active {
        transition: opacity 0.25s ease;
    }

    .fade-enter-from,
    .fade-leave-to {
        opacity: 0;
    }
</style>
