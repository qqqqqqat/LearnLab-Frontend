<script setup lang="ts">
    import { toast } from '@steveyuowo/vue-hot-toast'
    import { useQueryStringAsNumber } from '~/composables/getQueryString'

    definePageMeta({
        layout: 'course',
    })
    const userState = useUserState()
    const runtimeConfig = useRuntimeConfig()
    const userCourseState = useUserCourseState()

    const crs_pending = ref(true)
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
        const updateCourseToast = toast.loading('กำลังแก้ไขคอร์ส')
        const formData = new FormData()
        formData.append(
            'c_id',
            useQueryStringAsNumber(route.query.id).toString()
        )
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
        await $fetchWithHeader<{ message: string }>('/api/courses/edit/', {
            method: 'POST',
            body: formData,
        })
            .then((res) => {
                toast.update(updateCourseToast, {
                    type: 'success',
                    message: res?.message,
                })
                fetchCourse(useQueryStringAsNumber(route.query.id))
            })
            .catch((err) => {
                toast.update(updateCourseToast, {
                    type: 'error',
                    message: err?.data?.message,
                })
            })
    }


    async function fetchCourse(id: number) {
        await $fetchWithHeader<CoursePageAPIPUTResponse>('/api/courses/', {
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
        await $fetchWithHeader('/api/courses/enroll/', {
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

    async function updateMemberRole(
        u_id: number,
        c_id: number,
        u_role: 'TA' | 'STUDENT'
    ) {
        const updateRoleToast = toast.loading('กำลังอัพเดทตำแหน่ง')

        await $fetchWithHeader<{ message: string }>('/api/courses/enroll/', {
            method: 'PATCH',
            body: { u_id: u_id, c_id: c_id, u_role: u_role },
        })
            .then((res) => {
                fetchMember(useQueryStringAsNumber(route.query.id))
                toast.update(updateRoleToast, {
                    type: 'success',
                    message: res?.message,
                })
                crs_pending.value = false
            })
            .catch((err) => {
                toast.update(updateRoleToast, {
                    type: 'error',
                    message: err?.data?.message,
                })
                navigateTo('/mycourse', { replace: true })
            })
    }

    async function deleteMember(u_id: number, c_id: number) {
        const updateRoleToast = toast.loading('กำลังอัพเดทตำแหน่ง')

        await $fetchWithHeader<{ message: string }>('/api/courses/enroll/', {
            method: 'DELETE',
            body: { u_id: u_id, c_id: c_id },
        })
            .then((res) => {
                fetchMember(useQueryStringAsNumber(route.query.id))
                crs_pending.value = false
                toast.update(updateRoleToast, {
                    type: 'success',
                    message: res?.message,
                })
            })
            .catch((err) => {
                toast.update(updateRoleToast, {
                    type: 'error',
                    message: err?.data?.message,
                })
                navigateTo('/mycourse', { replace: true })
            })
    }

    async function deleteCourse(id: number) {
        await $fetchWithHeader<{ status: number; message: string }>(
            '/api/courses/',
            {
                method: 'DELETE',
                body: { c_id: id },
            }
        )
            .then((res) => {
                toast.success(res.message)
                confirmModal.value.c_closeModal()
                setTimeout(
                    async () => navigateTo('/mycourse', { replace: true }),
                    1000
                )
            })
            .catch((err) => {
                toast.error(err?.data?.message)
            })
    }

    async function addMember(id: number, u_email: string) {
        isImporting.value = true
        await $fetchWithHeader<{ status: number; message: string }>(
            '/api/courses/enroll/mail/',
            {
                method: 'PUT',
                body: { c_id: id, u_email: u_email },
            }
        )
            .then((res) => {
                fetchMember(useQueryStringAsNumber(route.query.id))
                inviteUserEmail.value = ''
                isImporting.value = false
                toast.success(res.message)
            })
            .catch((err) => {
                isImporting.value = false
                toast.error(err?.data?.message)
            })
    }

    async function fetchUserRoleState() {
        await $fetchWithHeader<UserRoles>('/api/courses/me/', {
            params: {
                my_course_role: '',
            }
        })
            .then((res) => {
                userCourseState.value = res   
                if (route.query.id) {
                    if (getUserRoleInCurrentCourse(useQueryStringAsNumber(route.query.id)) !== 'INSTRUCTOR') {
                        toast.error('คุณไม่มีสิทธิ์ในการเข้าถึงหน้านี้')
                        navigateTo(`/courses/view/?id=${useQueryStringAsNumber(route.query.id)}`, { replace: true })
                    }
                    fetchCourse(useQueryStringAsNumber(route.query.id))
                    fetchMember(useQueryStringAsNumber(route.query.id))
                } else {
                    navigateTo('/courses', { replace: true })
                }
            })
            .catch((_err) => {})
    }

    const getUserRoleInCurrentCourse = (courseId: number) => {
        if (courseId === -1) return false
        if (!userCourseState.value) return false
        if (!userCourseState.value[courseId]) return false
        return userCourseState.value[courseId]
    }

    fetchUserRoleState()

    const confirmModal = ref()
    const actionName = ref('')
    const inviteUserEmail = ref('')
    const isImporting = ref(false)
</script>
<template>
    <CourseConfirmModal
        ref="confirmModal"
        :action="actionName"
        @do-action="deleteCourse(useQueryStringAsNumber(route.query.id))" />
    <div class="flex w-full flex-col gap-4">
        <div><span class="text-4xl font-bold">แก้ไขคอร์ส</span></div>
        <div class="flex flex-col gap-4 px-4">
            <div class="relative">
                <input
                    id="hs-floating-input-text-course-1"
                    v-model="courseName"
                    type="text"
                    :disabled="crs_pending"
                    class="disabled:pointer-events-non peer block w-full rounded-lg border-gray-200 p-4 text-sm placeholder:text-transparent autofill:pb-2 autofill:pt-6 focus:border-blue-500 focus:pb-2 focus:pt-6 focus:ring-blue-500 disabled:opacity-50 [&:not(:placeholder-shown)]:pb-2 [&:not(:placeholder-shown)]:pt-6"
                    placeholder="LearnLab Course-course" >
                <label
                    for="hs-floating-input-text-course-1"
                    class="pointer-events-none absolute start-0 top-0 h-full truncate border border-transparent p-4 text-sm transition duration-100 ease-in-out peer-focus:-translate-y-1.5 peer-focus:text-xs peer-focus:text-gray-500 peer-disabled:pointer-events-none peer-disabled:opacity-50 peer-[:not(:placeholder-shown)]:-translate-y-1.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-500">
                    ชื่อคอร์ส
                    <span class="text-red-600">*</span>
                </label>
            </div>
            <!-- Floating Textarea -->
            <div class="relative">
                <textarea
                    id="hs-floating-textarea-desc"
                    v-model="courseDescription"
                    :disabled="crs_pending"
                    rows="8"
                    class="peer block w-full rounded-lg border-gray-200 p-4 text-sm placeholder:text-transparent autofill:pb-2 autofill:pt-6 focus:border-blue-500 focus:pb-2 focus:pt-6 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 [&:not(:placeholder-shown)]:pb-2 [&:not(:placeholder-shown)]:pt-6"
                    placeholder="Course Description" />
                <label
                    for="hs-floating-textarea-desc"
                    class="pointer-events-none absolute start-0 top-0 h-full truncate border border-transparent p-4 text-sm transition duration-100 ease-in-out peer-focus:-translate-y-1.5 peer-focus:text-xs peer-focus:text-gray-500 peer-disabled:pointer-events-none peer-disabled:opacity-50 peer-[:not(:placeholder-shown)]:-translate-y-1.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-500">
                    คำอธิบายคอร์ส
                    <span class="text-red-600">*</span>
                </label>
            </div>
            <!-- End Floating Textarea -->
            <form>
                <label class="mb-2 text-sm">ปกคอร์ส</label>
                <label for="small-file-input-banner" class="sr-only">
                    ปกคอร์ส
                </label>
                <input
                    id="small-file-input-banner"
                    accept="image/*"
                    type="file"
                    :disabled="crs_pending"
                    name="small-file-input-banner"
                    class="block w-full rounded-lg border border-gray-200 text-sm shadow-sm file:me-4 file:border-0 file:bg-gray-50 file:px-4 file:py-2 focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50"
                    @change="onFileChangedBanner($event)" >
            </form>
            <div class="flex flex-row items-center gap-4">
                <div class="flex w-20">
                    <input
                        id="hs-checked-checkbox"
                        v-model="passwordProtected"
                        type="checkbox"
                        :disabled="crs_pending"
                        class="mt-0.5 shrink-0 rounded border-gray-200 text-blue-600 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50"
                        checked >
                    <label
                        for="hs-checked-checkbox"
                        class="ms-3 text-sm text-gray-500">
                        มีรหัส
                    </label>
                </div>
                <div v-if="passwordProtected" class="relative w-full">
                    <input
                        id="hs-floating-input-text"
                        v-model="coursePassword"
                        type="password"
                        :disabled="crs_pending"
                        class="disabled:pointer-events-non peer block w-full rounded-lg border-gray-200 p-4 text-sm placeholder:text-transparent autofill:pb-2 autofill:pt-6 focus:border-blue-500 focus:pb-2 focus:pt-6 focus:ring-blue-500 disabled:opacity-50 [&:not(:placeholder-shown)]:pb-2 [&:not(:placeholder-shown)]:pt-6"
                        placeholder="password" >
                    <label
                        for="hs-floating-input-text"
                        class="pointer-events-none absolute start-0 top-0 h-full truncate border border-transparent p-4 text-sm transition duration-100 ease-in-out peer-focus:-translate-y-1.5 peer-focus:text-xs peer-focus:text-gray-500 peer-disabled:pointer-events-none peer-disabled:opacity-50 peer-[:not(:placeholder-shown)]:-translate-y-1.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-500">
                        รหัสของคอร์ส
                        <span class="text-red-600">*</span>
                    </label>
                </div>
            </div>
            <div class="flex items-center">
                <label
                    for="hs-basic-with-description"
                    class="me-3 text-sm text-gray-500">
                    สาธารณะ
                </label>
                <input
                    id="hs-basic-with-description"
                    v-model="coursePrivacy"
                    type="checkbox"
                    :disabled="crs_pending"
                    class="relative h-7 w-[3.25rem] cursor-pointer rounded-full border-transparent bg-gray-100 p-px text-transparent transition-colors duration-200 ease-in-out before:inline-block before:size-6 before:translate-x-0 before:transform before:rounded-full before:bg-white before:shadow before:ring-0 before:transition before:duration-200 before:ease-in-out checked:border-blue-600 checked:bg-none checked:text-blue-600 checked:before:translate-x-full checked:before:bg-blue-200 focus:ring-blue-600 focus:checked:border-blue-600 disabled:pointer-events-none disabled:opacity-50" >
                <label
                    for="hs-basic-with-description"
                    class="ms-3 text-sm text-gray-500">
                    ส่วนตัว
                </label>
            </div>
        </div>
        <div class="flex items-center justify-end gap-x-2 px-4 py-3">
            <button
                type="button"
                class="transition-color inline-flex items-center gap-x-2 rounded-lg border border-transparent bg-red-600 px-4 py-3 text-sm font-semibold text-white duration-200 ease-in-out hover:bg-red-700 disabled:pointer-events-none disabled:opacity-50"
                @click="
                    () => {
                        actionName = 'ลบคอร์สนี้'
                        confirmModal.c_openModal()
                    }
                ">
                ลบคอร์ส
            </button>
            <button
                :disabled="!(courseName && courseDescription)"
                type="button"
                class="transition-color inline-flex items-center gap-x-2 rounded-lg border border-transparent bg-blue-600 px-4 py-3 text-sm font-semibold text-white duration-200 ease-in-out hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50"
                @click="updateCourse()">
                แก้ไข
            </button>
        </div>
        <hr >
        <div>
            <div class="mt-4 flex flex-col justify-between gap-4 md:flex-row">
                <span class="text-4xl font-bold">สมาชิก</span>
                <div class="flex flex-row gap-4">
                    <div class="relative w-64">
                        <input
                            id="hs-floating-input-text-course"
                            v-model="inviteUserEmail"
                            type="email"
                            :readonly="isImporting"
                            class="disabled:pointer-events-non peer block w-full rounded-lg border-gray-200 p-4 text-sm placeholder:text-transparent autofill:pb-2 autofill:pt-6 focus:border-blue-500 focus:pb-2 focus:pt-6 focus:ring-blue-500 disabled:opacity-50 [&:not(:placeholder-shown)]:pb-2 [&:not(:placeholder-shown)]:pt-6"
                            placeholder="LearnLab Course-course" >
                        <label
                            for="hs-floating-input-text-course"
                            class="pointer-events-none absolute start-0 top-0 h-full truncate border border-transparent p-4 text-sm transition duration-100 ease-in-out peer-focus:-translate-y-1.5 peer-focus:text-xs peer-focus:text-gray-500 peer-disabled:pointer-events-none peer-disabled:opacity-50 peer-[:not(:placeholder-shown)]:-translate-y-1.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-500">
                            E-Mail ของผู้ที่ต้องการนำเข้าคอร์ส
                            <span class="text-red-600">*</span>
                        </label>
                    </div>
                    <button
                        :disabled="isImporting && !inviteUserEmail"
                        type="button"
                        class="transition-color inline-flex items-center gap-x-2 rounded-lg border border-transparent bg-blue-600 px-4 py-3 text-sm font-semibold text-white duration-200 ease-in-out hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50"
                        @click="
                            addMember(
                                useQueryStringAsNumber(route.query.id),
                                inviteUserEmail
                            )
                        ">
                        นำเข้า
                    </button>
                </div>
            </div>
            <div class="mt-4 flex flex-col">
                <div class="-m-1.5 overflow-x-auto">
                    <div class="inline-block min-w-full p-1.5 align-middle">
                        <div class="overflow-hidden rounded-lg border">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th
                                            scope="col"
                                            class="px-6 py-3 text-start text-xs font-medium uppercase text-gray-500">
                                            รูป
                                        </th>
                                        <th
                                            scope="col"
                                            class="px-6 py-3 text-start text-xs font-medium uppercase text-gray-500">
                                            ชื่อ
                                        </th>
                                        <th
                                            scope="col"
                                            class="px-6 py-3 text-start text-xs font-medium uppercase text-gray-500">
                                            ตำแหน่ง
                                        </th>
                                        <th
                                            scope="col"
                                            class="px-6 py-3 text-end text-xs font-medium uppercase text-gray-500">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-200">
                                    <tr v-for="member in crs_member" :key="member.u_id">
                                        <td
                                            class="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-800">
                                            <div
                                                v-if="member.u_avatar"
                                                class="h-12 w-12 rounded-md">
                                                <img
                                                    class="bottom-1 aspect-square rounded-md border object-cover"
                                                    loading="lazy"
                                                    :src="`${runtimeConfig.public.apiBaseUrl}/api/avatar/?u_id=${member.u_id}`" >
                                            </div>
                                            <div
                                                v-if="!member?.u_avatar"
                                                class="flex h-12 w-12 select-none flex-col items-center justify-center rounded-md bg-slate-200 text-2xl">
                                                {{
                                                    `${member?.u_firstname.slice(0, 1)}${member?.u_lastname.slice(0, 1)}`
                                                }}
                                            </div>
                                        </td>
                                        <td
                                            class="whitespace-nowrap px-6 py-4 text-sm text-gray-800">
                                            {{ member.u_firstname }}
                                            {{ member.u_lastname }}
                                            <p class="text-xs text-slate-400">
                                                {{ member.u_email }}
                                            </p>
                                        </td>
                                        <td
                                            class="whitespace-nowrap px-6 py-4 text-sm text-gray-800">
                                            <span
                                                v-if="
                                                    member.u_role ===
                                                    'INSTRUCTOR'
                                                "
                                                class="inline-flex items-center gap-x-1.5 rounded-full bg-blue-600 px-3 py-1.5 text-xs font-medium text-white dark:bg-blue-500">
                                                {{ member.u_role }}
                                            </span>
                                            <span
                                                v-if="
                                                    member.u_role === 'STUDENT'
                                                "
                                                class="inline-flex items-center gap-x-1.5 rounded-full bg-teal-500 px-3 py-1.5 text-xs font-medium text-white">
                                                {{ member.u_role }}
                                            </span>
                                            <span
                                                v-if="member.u_role === 'TA'"
                                                class="inline-flex items-center gap-x-1.5 rounded-full bg-yellow-500 px-3 py-1.5 text-xs font-medium text-white">
                                                {{ member.u_role }}
                                            </span>
                                        </td>
                                        <td
                                            class="whitespace-nowrap px-6 py-4 text-end text-sm font-medium">
                                            <div
                                                v-if="
                                                    member.u_role !==
                                                        'INSTRUCTOR' &&
                                                    member.u_id !==
                                                        userState?.u_id
                                                "
                                                class="flex flex-row justify-end gap-4">
                                                <button
                                                    v-if="
                                                        member.u_role ===
                                                        'STUDENT'
                                                    "
                                                    type="button"
                                                    class="inline-flex items-center gap-x-2 rounded-lg border border-transparent text-sm font-semibold text-blue-600 hover:text-blue-800 disabled:pointer-events-none disabled:opacity-50"
                                                    @click="
                                                        updateMemberRole(
                                                            member.u_id,
                                                            useQueryStringAsNumber(
                                                                route.query.id
                                                            ),
                                                            'TA'
                                                        )
                                                    ">
                                                    ปรับเป็น TA
                                                </button>
                                                <button
                                                    v-else
                                                    type="button"
                                                    class="inline-flex items-center gap-x-2 rounded-lg border border-transparent text-sm font-semibold text-blue-600 hover:text-blue-800 disabled:pointer-events-none disabled:opacity-50"
                                                    @click="
                                                        updateMemberRole(
                                                            member.u_id,
                                                            useQueryStringAsNumber(
                                                                route.query.id
                                                            ),
                                                            'STUDENT'
                                                        )
                                                    ">
                                                    ปรับเป็น STUDENT
                                                </button>
                                                <button
                                                    type="button"
                                                    class="inline-flex items-center gap-x-2 rounded-lg border border-transparent text-sm font-semibold text-red-600 hover:text-red-800 disabled:pointer-events-none disabled:opacity-50"
                                                    @click="
                                                        deleteMember(
                                                            member.u_id,
                                                            useQueryStringAsNumber(
                                                                route.query.id
                                                            )
                                                        )
                                                    ">
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
    position: absolute;
    top: 0;
    left: 0;
    opacity: 0;
}
</style>
