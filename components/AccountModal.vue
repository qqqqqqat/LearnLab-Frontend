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
        const { element } = HSOverlay.getInstance(modalElem.value, true)
        element.close()
    }
    
    function openModal() {
        const { element } = HSOverlay.getInstance(modalElem.value, true)
        element.open()
    }

    function validateEmail(s_email: string) {
        return s_email.toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
    }

    function onFileChangedAvatar($event: Event) {
        const target = $event.target as HTMLInputElement
        if (target && target.files) {
            regis_avatar.value = target.files[0]
        }
    }

    async function loginUser() {
        const loginToast = toast.loading('กำลังเข้าสู่ระบบ')
        await $fetch<AuthPOSTAPIResponse>('/api/auth', {
            method: 'PUT',
            body: {
                u_email: email.value,
                u_password: password.value,
            },
        })
            .then(async (res) => {
                toast.update(loginToast, { type: 'loading', message: res.message })
                await $fetch<User>('/api/auth').then(async (res) => {
                    userState.value = res
                    await $fetch<Avatar>('/api/auth/?image=')
                        .then((res) => {
                            avatarState.value = res
                        })
                        .catch((err) => {
                            toast.error('โหลดรูปล้มเหลว')
                        })
                    toast.update(loginToast, { type: 'success', message: 'เข้าสู่ระบบสำเร็จ' })
                    closeModal()
                })
            })
            .catch((err) => {
                toast.update(loginToast, { type: 'error', message: err.data.message })
            })
    }

    async function registerUser() {
        const loginToast = toast.loading('กำลังสมัครสมาชิก')
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

        await $fetch<AuthPOSTAPIResponse>('/api/auth', {
            method: 'POST',
            body: formData,
        })
            .then(async (res) => {
                toast.update(loginToast, { type: 'success', message: 'สมัครสมาชิกสำเร็จ' })
                closeModal()
            })
            .catch((err) => {
                toast.update(loginToast, { type: 'error', message: err.data.message })
            })
    }
</script>
<template>
    <div ref="modalElem" id="hs-slide-down-animation-modal" class="hs-overlay hidden size-full fixed top-0 start-0 z-[80] overflow-x-hidden overflow-y-auto pointer-events-none">
        <div class="hs-overlay-open:mt-7 hs-overlay-open:opacity-100 hs-overlay-open:duration-500 mt-0 opacity-0 ease-out transition-all sm:max-w-2xl sm:w-full m-3 sm:mx-auto">
            <div class="flex flex-col bg-white border shadow-sm rounded-md pointer-events-auto">
                <div class="flex justify-between items-center py-3 px-4">
                    <h3 class="font-bold text-gray-800">ยินดีต้อนรับ</h3>
                    <button
                        type="button"
                        class="flex justify-center items-center size-7 text-sm font-semibold rounded-full border border-transparent text-gray-800 hover:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none"
                        data-hs-overlay="#hs-slide-down-animation-modal">
                        <span class="sr-only">Close</span>
                        <svg
                            class="flex-shrink-0 size-4"
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
                                :class="activeTab === 0 ? 'font-semibold text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 border-transparent '"
                                @click="activeTab = 0"
                                class="transition-all duration-300 ease-in-out py-4 px-1 inline-flex items-center gap-x-2 text-sm whitespace-nowrap hover:text-blue-600 focus:outline-none focus:text-blue-600 disabled:opacity-50 disabled:pointer-events-none active">
                                เข้าสู่ระบบ
                            </button>
                            <button
                                type="button"
                                :class="activeTab === 1 ? 'font-semibold text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 border-transparent '"
                                @click="activeTab = 1"
                                class="transition-all duration-300 ease-in-out py-4 px-1 inline-flex items-center gap-x-2 text-sm whitespace-nowrap hover:text-blue-600 focus:outline-none focus:text-blue-600 disabled:opacity-50 disabled:pointer-events-none">
                                ลงทะเบียน
                            </button>
                        </nav>
                    </div>
                    <div class="flex md:flex-row flex-col justify-center items-center w-full gap-4 md:pl-8 md:pt-0 pt-8">
                        <img src="~/assets/images/login.svg" class="w-48" />
                        <div class="grow w-full">
                            <TransitionGroup name="fade">
                                <form v-show="activeTab === 0" class="flex flex-col gap-y-8 p-8" key="login1" @submit.prevent="">
                                    <div class="relative">
                                        <input
                                            type="email"
                                            class="peer py-3 px-4 ps-11 block w-full bg-gray-100 border-transparent rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                                            placeholder="อีเมล์"
                                            name="email"
                                            v-model="email" />
                                        <div class="absolute inset-y-0 start-0 flex items-center pointer-events-none ps-4 peer-disabled:opacity-50 peer-disabled:pointer-events-none">
                                            <svg
                                                class="flex-shrink-0 size-4 text-gray-500"
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                stroke-width="2"
                                                stroke-linecap="round"
                                                stroke-linejoin="round">
                                                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                                <circle cx="12" cy="7" r="4" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div class="relative">
                                        <input
                                            type="password"
                                            class="peer py-3 px-4 ps-11 block w-full bg-gray-100 border-transparent rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                                            placeholder="รหัสผ่าน"
                                            name="password"
                                            v-model="password" />
                                        <div class="absolute inset-y-0 start-0 flex items-center pointer-events-none ps-4 peer-disabled:opacity-50 peer-disabled:pointer-events-none">
                                            <svg
                                                class="flex-shrink-0 size-4 text-gray-500"
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                stroke-width="2"
                                                stroke-linecap="round"
                                                stroke-linejoin="round">
                                                <path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z" />
                                                <circle cx="16.5" cy="7.5" r=".5" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div class="flex md:justify-end justify-center items-center gap-x-2 py-3 px-4">
                                        <button
                                            type="button"
                                            @click="
                                                () => {
                                                    if (validateEmail(email) && password.length > 4) {
                                                        loginUser()
                                                    } else if (!validateEmail(regis_email)) {
                                                        toast.error('อีเมล์ผิดรูปแบบ')
                                                    } else {
                                                        toast.error('กรุณากรอกข้อมูลให้ครบ')
                                                    }
                                                }
                                            "
                                            class="transition-color duration-200 ease-in-out py-2 px-3 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none">
                                            เข้าสู่ระบบ
                                        </button>
                                    </div>
                                </form>
                                <div v-show="activeTab === 1" class="flex flex-col gap-y-8 p-8" key="regis1">
                                    <div class="hs-dropdown relative">
                                        <button
                                            id="hs-dropdown-default"
                                            type="button"
                                            class="hs-dropdown-toggle py-3 px-4 inline-flex justify-between w-full items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none">
                                            {{ position.title }}
                                            <svg
                                                class="hs-dropdown-open:rotate-180 size-4"
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
                                            class="hs-dropdown-menu transition-[opacity,margin] duration hs-dropdown-open:opacity-100 opacity-0 hidden w-64 z-[100] bg-white shadow-md rounded-lg p-2 mt-2 after:h-4 after:absolute after:-bottom-4 after:start-0 after:w-full before:h-4 before:absolute before:-top-4 before:start-0 before:w-full"
                                            aria-labelledby="hs-dropdown-default">
                                            <a
                                                class="flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                                                @click="position = { title: 'ผู้เรียน', role: 'STUDENT' }">
                                                ผู้เรียน
                                            </a>
                                            <a
                                                class="flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                                                @click="position = { title: 'ผู้สอน', role: 'INSTRUCTOR' }">
                                                ผู้สอน
                                            </a>
                                        </div>
                                    </div>
                                    <div class="hs-dropdown relative">
                                        <button
                                            id="hs-dropdown-default"
                                            type="button"
                                            class="hs-dropdown-toggle py-3 px-4 inline-flex justify-between w-full items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none">
                                            {{ gender.title }}
                                            <svg
                                                class="hs-dropdown-open:rotate-180 size-4"
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
                                            class="hs-dropdown-menu transition-[opacity,margin] duration hs-dropdown-open:opacity-100 opacity-0 hidden w-64 z-[100] bg-white shadow-md rounded-lg p-2 mt-2 after:h-4 after:absolute after:-bottom-4 after:start-0 after:w-full before:h-4 before:absolute before:-top-4 before:start-0 before:w-full"
                                            aria-labelledby="hs-dropdown-default">
                                            <a
                                                class="flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                                                @click="gender = { title: 'ชาย', role: 'MALE' }">
                                                ชาย
                                            </a>
                                            <a
                                                class="flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                                                @click="gender = { title: 'หญิง', role: 'FEMALE' }">
                                                หญิง
                                            </a>
                                        </div>
                                    </div>
                                    <div class="relative">
                                        <input
                                            type="text"
                                            class="peer py-3 px-4 ps-11 block w-full bg-gray-100 border-transparent rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                                            placeholder="ชื่อ"
                                            v-model.lazy="name" />
                                        <div class="absolute inset-y-0 start-0 flex items-center pointer-events-none ps-4 peer-disabled:opacity-50 peer-disabled:pointer-events-none">
                                            <svg
                                                class="flex-shrink-0 size-4 text-gray-500"
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                stroke-width="2"
                                                stroke-linecap="round"
                                                stroke-linejoin="round">
                                                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                                <circle cx="12" cy="7" r="4" />
                                            </svg>
                                        </div>
                                    </div>

                                    <div class="relative">
                                        <input
                                            type="text"
                                            class="peer py-3 px-4 ps-11 block w-full bg-gray-100 border-transparent rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                                            placeholder="นามสกุล"
                                            v-model.lazy="surname" />
                                        <div class="absolute inset-y-0 start-0 flex items-center pointer-events-none ps-4 peer-disabled:opacity-50 peer-disabled:pointer-events-none">
                                            <svg
                                                class="flex-shrink-0 size-4 text-gray-500"
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                stroke-width="2"
                                                stroke-linecap="round"
                                                stroke-linejoin="round">
                                                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                                <circle cx="12" cy="7" r="4" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div class="relative">
                                        <input
                                            type="email"
                                            class="peer py-3 px-4 ps-11 block w-full bg-gray-100 border-transparent rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                                            placeholder="อีเมล์"
                                            v-model="regis_email" />
                                        <div class="absolute inset-y-0 start-0 flex items-center pointer-events-none ps-4 peer-disabled:opacity-50 peer-disabled:pointer-events-none">
                                            <svg
                                                class="flex-shrink-0 size-4 text-gray-500"
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                stroke-width="2"
                                                stroke-linecap="round"
                                                stroke-linejoin="round">
                                                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                                <circle cx="12" cy="7" r="4" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div class="relative">
                                        <input
                                            type="tel"
                                            class="peer py-3 px-4 ps-11 block w-full bg-gray-100 border-transparent rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                                            placeholder="หมายเลขโทรศัพท์"
                                            v-model="phone" />
                                        <div class="absolute inset-y-0 start-0 flex items-center pointer-events-none ps-4 peer-disabled:opacity-50 peer-disabled:pointer-events-none">
                                            <svg
                                                class="flex-shrink-0 size-4 text-gray-500"
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                stroke-width="2"
                                                stroke-linecap="round"
                                                stroke-linejoin="round">
                                                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                                <circle cx="12" cy="7" r="4" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div class="relative">
                                        <input
                                            type="password"
                                            class="peer py-3 px-4 ps-11 block w-full bg-gray-100 border-transparent rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                                            placeholder="รหัสผ่าน"
                                            v-model="regis_passw" />
                                        <div class="absolute inset-y-0 start-0 flex items-center pointer-events-none ps-4 peer-disabled:opacity-50 peer-disabled:pointer-events-none">
                                            <svg
                                                class="flex-shrink-0 size-4 text-gray-500"
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                stroke-width="2"
                                                stroke-linecap="round"
                                                stroke-linejoin="round">
                                                <path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z" />
                                                <circle cx="16.5" cy="7.5" r=".5" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div class="relative">
                                        <input
                                            type="password"
                                            class="peer py-3 px-4 ps-11 block w-full bg-gray-100 border-transparent rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                                            placeholder="ยืนยันรหัสผ่าน"
                                            v-model="regis_passw_conf" />
                                        <div class="absolute inset-y-0 start-0 flex items-center pointer-events-none ps-4 peer-disabled:opacity-50 peer-disabled:pointer-events-none">
                                            <svg
                                                class="flex-shrink-0 size-4 text-gray-500"
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                stroke-width="2"
                                                stroke-linecap="round"
                                                stroke-linejoin="round">
                                                <path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z" />
                                                <circle cx="16.5" cy="7.5" r=".5" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div>
                                    <div class="pb-2">รูปโปรไฟล์</div>
                                    <label for="small-file-input" class="sr-only">เลือกไฟล์</label>
                                    <input
                                        type="file"
                                        @change="onFileChangedAvatar($event)"
                                        accept=".gif,.png,.jpg,.jpeg,.svg,.webp,.avif"
                                        name="small-file-input"
                                        id="small-file-input"
                                        class="block w-full border border-gray-200 shadow-sm rounded-lg text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none file:bg-gray-50 file:border-0 file:me-4 file:py-2 file:px-4" />
                                      </div>
                                  
                                        <div class="flex md:justify-end justify-center items-center gap-x-2 py-3 px-4">
                                        <button
                                            type="button"
                                            @click="
                                                () => {
                                                    if (validateEmail(regis_email) && regis_passw === regis_passw_conf && phone.length === 10 && name && surname && regis_passw.length > 4) {
                                                        registerUser()
                                                    } else if (regis_passw !== regis_passw_conf) {
                                                        toast.error('รหัสและยืนยันรหัสผ่านไม่ตรงกัน')
                                                    } else if (!(phone.length === 10)) {
                                                        toast.error('เบอร์โทรศัพท์ไม่ถูกต้อง')
                                                    } else if (!(name && surname)) {
                                                        toast.error('กรุณาใส่ชื่อและนามสกุล')
                                                    } else if (!validateEmail(regis_email)) {
                                                        toast.error('อีเมล์ผิดรูปแบบ')
                                                    } else {
                                                        toast.error('กรุณากรอกข้อมูลให้ครบ')
                                                    }
                                                }
                                            "
                                            class="transition-color duration-200 ease-in-out py-2 px-3 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none">
                                            ลงทะเบียน
                                        </button>
                                    </div>
                                </div>
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
        transition: opacity 0.25s ease;
    }

    .fade-enter-from,
    .fade-leave-to {
        opacity: 0;
    }
</style>
