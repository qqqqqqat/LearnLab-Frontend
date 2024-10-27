<script setup lang="ts">
    import { toast } from '@steveyuowo/vue-hot-toast'
    import HSOverlay from '@preline/overlay'

    const userState = useUserState()
    const avatarState = useAvatarState()

    const activeTab = ref(0)
    const email = ref<string>('')
    const password = ref<string>('')
    const phone = ref<string>('')

    const position = ref({ title: 'ตำแหน่ง', role: '' })
    const gender = ref({ title: 'เพศ', role: '' })
    const name = ref<string>('')
    const surname = ref<string>('')
    const regis_email = ref<string>('')
    const regis_passw = ref<string>('')
    const regis_passw_conf = ref<string>('')
    const regis_avatar = ref()

    const modalElem = ref()
    function closeModal() {
        const instance = HSOverlay.getInstance(modalElem.value, true)
        if ('element' in instance) {
            instance.element.close()
        }

        email.value = ''
        password.value = ''
        name.value = ''
        surname.value = ''
        regis_email.value = ''
        regis_passw.value = ''
        regis_passw_conf.value = ''
        regis_avatar.value = ''
    }

    // function openModal() {
    //     const instance = HSOverlay.getInstance(modalElem.value, true)
    //     if ('element' in instance) {
    //         instance.element.open()
    //     }
    // }

    function validateEmail(s_email: string) {
        return s_email
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            )
    }

    function onFileChangedAvatar($event: Event) {
        const target = $event.target as HTMLInputElement
        if (target && target.files) {
            regis_avatar.value = target.files[0]
        }
    }

    async function loginUser() {
        const loginToast = toast.loading('กำลังเข้าสู่ระบบ')
        await $fetch<AuthPOSTAPIResponse>('/api/auth/', {
            method: 'PUT',
            body: {
                u_email: email.value,
                u_password: password.value,
            },
        })
            .then(async (res) => {
                email.value = ''
                password.value = ''
                name.value = ''
                surname.value = ''
                regis_email.value = ''
                regis_passw.value = ''
                regis_passw_conf.value = ''
                regis_avatar.value = ''
                toast.update(loginToast, {
                    type: 'loading',
                    message: res?.message,
                })
                await $fetch<User>('/api/auth/').then(async (res) => {
                    userState.value = res
                    await $fetch<Avatar>('/api/auth/?image=')
                        .then((res) => {
                            avatarState.value = res
                        })
                        .catch((_err) => {
                            toast.update(loginToast, {
                                type: 'error',
                                message: 'โหลดรูปล้มเหลว',
                            })
                        })
                    toast.update(loginToast, {
                        type: 'success',
                        message: 'เข้าสู่ระบบสำเร็จ',
                    })
                    closeModal()
                })
            })
            .catch((err) => {
                toast.update(loginToast, {
                    type: 'error',
                    message: err?.data?.message,
                })
            })
    }

    async function registerUser() {
        toast.loading('กำลังสมัครสมาชิก')
        const formData = new FormData()
        formData.append('u_firstname', name.value)
        formData.append('u_lastname', surname.value)
        formData.append('u_tel', phone.value)
        formData.append('u_gender', gender.value.role)
        formData.append('u_role', position.value.role)
        formData.append('u_email', regis_email.value)
        formData.append('u_password', regis_passw.value)

        if (regis_avatar.value) {
            formData.append('u_avatar', regis_avatar.value)
        }

        await $fetch<AuthPOSTAPIResponse>('/api/auth/', {
            method: 'POST',
            body: formData,
        })
            .then(async (_res) => {
                email.value = ''
                password.value = ''
                name.value = ''
                surname.value = ''
                regis_email.value = ''
                regis_passw.value = ''
                regis_passw_conf.value = ''
                regis_avatar.value = ''
                toast.success('สมัครสมาชิกสำเร็จ')
                closeModal()
            })
            .catch((err) => {
                toast.error(err?.data?.message)
            })
    }
</script>
<template>
    <div
        id="hs-slide-down-animation-modal"
        ref="modalElem"
        class="hs-overlay pointer-events-none fixed start-0 top-0 z-[80] hidden size-full overflow-y-auto overflow-x-hidden">
        <div
            class="m-3 mt-0 opacity-0 transition-all ease-out hs-overlay-open:mt-7 hs-overlay-open:opacity-100 hs-overlay-open:duration-500 sm:mx-auto sm:w-full sm:max-w-2xl">
            <div
                class="pointer-events-auto flex flex-col rounded-md border bg-white shadow-sm">
                <div class="flex items-center justify-between px-4 py-3">
                    <h3 class="font-bold text-gray-800">ยินดีต้อนรับ</h3>
                    <button
                        type="button"
                        class="flex size-7 items-center justify-center rounded-full border border-transparent text-sm font-semibold text-gray-800 hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-50"
                        data-hs-overlay="#hs-slide-down-animation-modal">
                        <span class="sr-only">Close</span>
                        <svg
                            class="size-4 flex-shrink-0"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round">
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                        </svg>
                    </button>
                </div>
                <div class="flex flex-col overflow-y-auto">
                    <div class="border-b border-gray-200">
                        <nav class="-mb-0.5 flex justify-center space-x-6">
                            <button
                                type="button"
                                :class="
                                    activeTab === 0
                                        ? 'border-b-2 border-blue-600 font-semibold text-blue-600'
                                        : 'border-transparent text-gray-500'
                                "
                                class="active inline-flex items-center gap-x-2 whitespace-nowrap px-1 py-4 text-sm transition-all duration-300 ease-in-out hover:text-blue-600 focus:text-blue-600 focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                                @click="activeTab = 0">
                                เข้าสู่ระบบ
                            </button>
                            <button
                                type="button"
                                :class="
                                    activeTab === 1
                                        ? 'border-b-2 border-blue-600 font-semibold text-blue-600'
                                        : 'border-transparent text-gray-500'
                                "
                                class="inline-flex items-center gap-x-2 whitespace-nowrap px-1 py-4 text-sm transition-all duration-300 ease-in-out hover:text-blue-600 focus:text-blue-600 focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                                @click="activeTab = 1">
                                ลงทะเบียน
                            </button>
                        </nav>
                    </div>
                    <div
                        class="flex w-full flex-col items-center justify-center gap-4 pt-8 md:flex-row md:pl-8 md:pt-0">
                        <img src="~/assets/images/login.svg" class="w-48" />
                        <div
                            class="relative h-fit w-full grow overflow-x-hidden">
                            <TransitionGroup name="fade">
                                <form
                                    v-show="activeTab === 0"
                                    key="login1"
                                    class="flex flex-col gap-y-8 p-8"
                                    @submit.prevent="">
                                    <div class="relative">
                                        <input
                                            v-model="email"
                                            type="email"
                                            class="peer block w-full rounded-lg border-transparent bg-gray-100 px-4 py-3 ps-11 text-sm focus:border-blue-500 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50"
                                            placeholder="อีเมล์"
                                            name="email" />
                                        <div
                                            class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 peer-disabled:pointer-events-none peer-disabled:opacity-50">
                                            <svg
                                                class="size-4 flex-shrink-0 text-gray-500"
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                stroke-width="2"
                                                stroke-linecap="round"
                                                stroke-linejoin="round">
                                                <path
                                                    d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                                <circle cx="12" cy="7" r="4" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div class="relative">
                                        <input
                                            v-model="password"
                                            type="password"
                                            class="peer block w-full rounded-lg border-transparent bg-gray-100 px-4 py-3 ps-11 text-sm focus:border-blue-500 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50"
                                            placeholder="รหัสผ่าน"
                                            name="password" />
                                        <div
                                            class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 peer-disabled:pointer-events-none peer-disabled:opacity-50">
                                            <svg
                                                class="size-4 flex-shrink-0 text-gray-500"
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                stroke-width="2"
                                                stroke-linecap="round"
                                                stroke-linejoin="round">
                                                <path
                                                    d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z" />
                                                <circle
                                                    cx="16.5"
                                                    cy="7.5"
                                                    r=".5" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div
                                        class="flex items-center justify-center gap-x-2 px-4 py-3 md:justify-end">
                                        <button
                                            type="button"
                                            :disabled="!(email && password)"
                                            class="transition-color inline-flex items-center gap-x-2 rounded-lg border border-transparent bg-blue-600 px-3 py-2 text-sm font-semibold text-white duration-200 ease-in-out hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50"
                                            @click="
                                                () => {
                                                    if (
                                                        validateEmail(email) &&
                                                        password.length > 4
                                                    ) {
                                                        loginUser()
                                                    } else if (
                                                        !validateEmail(
                                                            regis_email
                                                        )
                                                    ) {
                                                        toast.error(
                                                            'อีเมล์ผิดรูปแบบ'
                                                        )
                                                    } else {
                                                        toast.error(
                                                            'กรุณากรอกข้อมูลให้ครบ'
                                                        )
                                                    }
                                                }
                                            ">
                                            เข้าสู่ระบบ
                                        </button>
                                    </div>
                                </form>
                                <form
                                    v-show="activeTab === 1"
                                    key="regis1"
                                    class="flex flex-col gap-y-8 p-8"
                                    @submit.prevent="">
                                    <div class="hs-dropdown relative">
                                        <button
                                            id="hs-dropdown-position"
                                            type="button"
                                            class="hs-dropdown-toggle inline-flex w-full items-center justify-between gap-x-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50">
                                            {{ position.title }}
                                            <svg
                                                class="size-4 transition duration-150 ease-in-out hs-dropdown-open:rotate-180"
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                stroke-width="2"
                                                stroke-linecap="round"
                                                stroke-linejoin="round">
                                                <path d="m6 9 6 6 6-6" />
                                            </svg>
                                        </button>

                                        <div
                                            class="hs-dropdown-menu duration z-[100] mt-2 hidden w-64 rounded-lg bg-white p-2 opacity-0 shadow-md transition-[opacity,margin] before:absolute before:-top-4 before:start-0 before:h-4 before:w-full after:absolute after:-bottom-4 after:start-0 after:h-4 after:w-full hs-dropdown-open:opacity-100"
                                            aria-labelledby="hs-dropdown-position">
                                            <a
                                                class="flex items-center gap-x-3.5 rounded-lg px-3 py-2 text-sm text-gray-800 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                                                @click="
                                                    position = {
                                                        title: 'ผู้เรียน',
                                                        role: 'STUDENT',
                                                    }
                                                ">
                                                ผู้เรียน
                                            </a>
                                            <a
                                                class="flex items-center gap-x-3.5 rounded-lg px-3 py-2 text-sm text-gray-800 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                                                @click="
                                                    position = {
                                                        title: 'ผู้สอน',
                                                        role: 'INSTRUCTOR',
                                                    }
                                                ">
                                                ผู้สอน
                                            </a>
                                        </div>
                                    </div>
                                    <div class="hs-dropdown relative">
                                        <button
                                            id="hs-dropdown-gender"
                                            type="button"
                                            class="hs-dropdown-toggle inline-flex w-full items-center justify-between gap-x-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50">
                                            {{ gender.title }}
                                            <svg
                                                class="size-4 transition duration-150 ease-in-out hs-dropdown-open:rotate-180"
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                stroke-width="2"
                                                stroke-linecap="round"
                                                stroke-linejoin="round">
                                                <path d="m6 9 6 6 6-6" />
                                            </svg>
                                        </button>

                                        <div
                                            class="hs-dropdown-menu duration z-[100] mt-2 hidden w-64 rounded-lg bg-white p-2 opacity-0 shadow-md transition-[opacity,margin] before:absolute before:-top-4 before:start-0 before:h-4 before:w-full after:absolute after:-bottom-4 after:start-0 after:h-4 after:w-full hs-dropdown-open:opacity-100"
                                            aria-labelledby="hs-dropdown-gender">
                                            <a
                                                class="flex items-center gap-x-3.5 rounded-lg px-3 py-2 text-sm text-gray-800 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                                                @click="
                                                    gender = {
                                                        title: 'ชาย',
                                                        role: 'MALE',
                                                    }
                                                ">
                                                ชาย
                                            </a>
                                            <a
                                                class="flex items-center gap-x-3.5 rounded-lg px-3 py-2 text-sm text-gray-800 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                                                @click="
                                                    gender = {
                                                        title: 'หญิง',
                                                        role: 'FEMALE',
                                                    }
                                                ">
                                                หญิง
                                            </a>
                                        </div>
                                    </div>
                                    <div class="relative">
                                        <input
                                            v-model.lazy="name"
                                            type="text"
                                            class="peer block w-full rounded-lg border-transparent bg-gray-100 px-4 py-3 ps-11 text-sm focus:border-blue-500 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50"
                                            placeholder="ชื่อ" />
                                        <div
                                            class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 peer-disabled:pointer-events-none peer-disabled:opacity-50">
                                            <svg
                                                class="size-4 flex-shrink-0 text-gray-500"
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                stroke-width="2"
                                                stroke-linecap="round"
                                                stroke-linejoin="round">
                                                <path
                                                    d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                                <circle cx="12" cy="7" r="4" />
                                            </svg>
                                        </div>
                                    </div>

                                    <div class="relative">
                                        <input
                                            v-model.lazy="surname"
                                            type="text"
                                            class="peer block w-full rounded-lg border-transparent bg-gray-100 px-4 py-3 ps-11 text-sm focus:border-blue-500 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50"
                                            placeholder="นามสกุล" />
                                        <div
                                            class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 peer-disabled:pointer-events-none peer-disabled:opacity-50">
                                            <svg
                                                class="size-4 flex-shrink-0 text-gray-500"
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                stroke-width="2"
                                                stroke-linecap="round"
                                                stroke-linejoin="round">
                                                <path
                                                    d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                                <circle cx="12" cy="7" r="4" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div class="relative">
                                        <input
                                            v-model="regis_email"
                                            type="email"
                                            class="peer block w-full rounded-lg border-transparent bg-gray-100 px-4 py-3 ps-11 text-sm focus:border-blue-500 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50"
                                            placeholder="อีเมล์" />
                                        <div
                                            class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 peer-disabled:pointer-events-none peer-disabled:opacity-50">
                                            <svg
                                                class="size-4 flex-shrink-0 text-gray-500"
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                stroke-width="2"
                                                stroke-linecap="round"
                                                stroke-linejoin="round">
                                                <path
                                                    d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                                <circle cx="12" cy="7" r="4" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div class="relative">
                                        <input
                                            v-model="phone"
                                            type="tel"
                                            class="peer block w-full rounded-lg border-transparent bg-gray-100 px-4 py-3 ps-11 text-sm focus:border-blue-500 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50"
                                            placeholder="หมายเลขโทรศัพท์" />
                                        <div
                                            class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 peer-disabled:pointer-events-none peer-disabled:opacity-50">
                                            <svg
                                                class="size-4 flex-shrink-0 text-gray-500"
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                stroke-width="2"
                                                stroke-linecap="round"
                                                stroke-linejoin="round">
                                                <path
                                                    d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                                <circle cx="12" cy="7" r="4" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div class="relative">
                                        <input
                                            v-model="regis_passw"
                                            type="password"
                                            class="peer block w-full rounded-lg border-transparent bg-gray-100 px-4 py-3 ps-11 text-sm focus:border-blue-500 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50"
                                            placeholder="รหัสผ่าน" />
                                        <div
                                            class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 peer-disabled:pointer-events-none peer-disabled:opacity-50">
                                            <svg
                                                class="size-4 flex-shrink-0 text-gray-500"
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                stroke-width="2"
                                                stroke-linecap="round"
                                                stroke-linejoin="round">
                                                <path
                                                    d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z" />
                                                <circle
                                                    cx="16.5"
                                                    cy="7.5"
                                                    r=".5" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div class="relative">
                                        <input
                                            v-model="regis_passw_conf"
                                            type="password"
                                            class="peer block w-full rounded-lg border-transparent bg-gray-100 px-4 py-3 ps-11 text-sm focus:border-blue-500 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50"
                                            placeholder="ยืนยันรหัสผ่าน" />
                                        <div
                                            class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 peer-disabled:pointer-events-none peer-disabled:opacity-50">
                                            <svg
                                                class="size-4 flex-shrink-0 text-gray-500"
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                stroke-width="2"
                                                stroke-linecap="round"
                                                stroke-linejoin="round">
                                                <path
                                                    d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z" />
                                                <circle
                                                    cx="16.5"
                                                    cy="7.5"
                                                    r=".5" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div>
                                        <div class="pb-2">รูปโปรไฟล์</div>
                                        <label
                                            for="small-file-input"
                                            class="sr-only">
                                            เลือกไฟล์
                                        </label>
                                        <input
                                            id="small-file-input"
                                            type="file"
                                            accept="image/*"
                                            name="small-file-input"
                                            class="block w-full rounded-lg border border-gray-200 text-sm shadow-sm file:me-4 file:border-0 file:bg-gray-50 file:px-4 file:py-2 focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50"
                                            @change="
                                                onFileChangedAvatar($event)
                                            " />
                                    </div>

                                    <div
                                        class="flex items-center justify-center gap-x-2 px-4 py-3 md:justify-end">
                                        <button
                                            type="button"
                                            :disabled="
                                                !(
                                                    regis_passw ===
                                                        regis_passw_conf &&
                                                    phone.length === 10 &&
                                                    name &&
                                                    surname &&
                                                    regis_passw.length > 4
                                                )
                                            "
                                            class="transition-color inline-flex items-center gap-x-2 rounded-lg border border-transparent bg-blue-600 px-3 py-2 text-sm font-semibold text-white duration-200 ease-in-out hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50"
                                            @click="
                                                () => {
                                                    if (
                                                        validateEmail(
                                                            regis_email
                                                        ) &&
                                                        regis_passw ===
                                                            regis_passw_conf &&
                                                        phone.length === 10 &&
                                                        name &&
                                                        surname &&
                                                        regis_passw.length > 4
                                                    ) {
                                                        registerUser()
                                                    } else if (
                                                        regis_passw.length <= 4
                                                    ) {
                                                        toast.error(
                                                            'รหัสต้องยาวกว่า 4 ตัวอักษร'
                                                        )
                                                    } else if (
                                                        regis_passw !==
                                                        regis_passw_conf
                                                    ) {
                                                        toast.error(
                                                            'รหัสและยืนยันรหัสผ่านไม่ตรงกัน'
                                                        )
                                                    } else if (
                                                        !(phone.length === 10)
                                                    ) {
                                                        toast.error(
                                                            'เบอร์โทรศัพท์ไม่ถูกต้อง'
                                                        )
                                                    } else if (
                                                        !(name && surname)
                                                    ) {
                                                        toast.error(
                                                            'กรุณาใส่ชื่อและนามสกุล'
                                                        )
                                                    } else if (
                                                        !validateEmail(
                                                            regis_email
                                                        )
                                                    ) {
                                                        toast.error(
                                                            'อีเมล์ผิดรูปแบบ'
                                                        )
                                                    } else {
                                                        toast.error(
                                                            'กรุณากรอกข้อมูลให้ครบ'
                                                        )
                                                    }
                                                }
                                            ">
                                            ลงทะเบียน
                                        </button>
                                    </div>
                                </form>
                            </TransitionGroup>
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
        transform: translateX(20px);
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
