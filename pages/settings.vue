<script setup lang="ts">
    import { toast } from '@steveyuowo/vue-hot-toast'
    const userState = useUserState()
    const avatarState = useAvatarState()
    const name = ref<string | undefined>(userState.value?.u_firstname)
    const surname = ref<string | undefined>(userState.value?.u_lastname)
    const phone = ref<string | undefined>(userState.value?.u_tel)

    const regis_passw = ref<string>('')
    const regis_avatar = ref()

    function onFileChangedAvatar($event: Event) {
        const target = $event.target as HTMLInputElement
        if (target && target.files) {
            regis_avatar.value = target.files[0]
        }
    }

    async function fetchUser() {
        await $fetch<User>('/api/auth/')
            .then(async (res) => {
                userState.value = res
                await $fetch<Avatar>('/api/auth/?image=')
                    .then((res) => {
                        avatarState.value = res
                    })
                    .catch(async (err) => {
                        toast.error('โหลดรูปล้มเหลว')
                    })
            })
            .catch((err) => {})
    }

    async function updateUser() {
        const loginToast = toast.loading('กำลังอัพเดทโปรไฟล์')
        const formData = new FormData()
        formData.append('u_firstname', name.value || '')
        formData.append('u_lastname', surname.value || '')
        formData.append('u_tel', phone.value || '')
        formData.append('u_password', regis_passw.value || '')

        if (regis_avatar.value) {
            formData.append('u_avatar', regis_avatar.value)
        }

        await $fetch<AuthPOSTAPIResponse>('/api/auth/edit/', {
            method: 'POST',
            body: formData,
        })
            .then(async (res) => {
                await fetchUser()
                regis_passw.value = ''
                toast.update(loginToast, { type: 'success', message: res?.message })
            })
            .catch((err) => {
                toast.update(loginToast, { type: 'error', message: err?.data?.message })
            })
    }
</script>
<template>
    <div class="max-w-screen-2xl mx-auto mb-8">
        <div class="flex flex-col items-center w-full h-full gap-y-8">
            <h1 class="text-5xl mt-24 font-bold mb-4 font-title">ตั้งค่าผู้ใช้</h1>
            <div class="flex md:flex-row md:items-start flex-col items-center gap-8">
                <div class="rounded-md w-64 h-64 bg-slate-200 flex flex-col justify-center items-center text-[140px]" v-if="!avatarState?.u_avatar">
                    {{ userState?.u_firstname ? `${userState?.u_firstname.slice(0, 1)}${userState?.u_lastname.slice(0, 1)}` : '' }}
                </div>
                <div class="rounded-md w-64 h-64" v-else>
                    <img class="rounded-md w-64 h-64 aspect-square object-cover" :src="`data:${avatarState?.u_avatar_mime_type};base64,${avatarState?.u_avatar}`" />
                </div>
                <div class="flex flex-col rounded-md max-w-full md:h-64 bg-gradient-to-r from-slate-100 to-slate-50/0 gap-4 py-4 pl-8 md:pr-16 pr-8 justify-center">
                    <span class="font-bold text-5xl">{{ userState?.u_firstname ? userState?.u_firstname : '' }} {{ userState?.u_lastname ? userState?.u_lastname : '' }}</span>
                    <span class="text-2xl">{{ userState?.u_role ? (userState?.u_role === 'STUDENT' ? 'นักศึกษา' : 'ผู้สอน') : '' }} | {{ userState?.u_email ? userState?.u_email : '' }}</span>
                    <span class="text-2xl">{{ userState?.u_tel || '' }}</span>
                    <span class="text-lg">สร้างบัญชีเมื่อ {{ userState?.u_created_at ? new Date(userState?.u_created_at).toLocaleString() : '' }}</span>
                </div>
            </div>
            <div class="relative w-72">
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

            <div class="relative w-72">
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
            <div class="relative w-72">
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
            <div>
                <div class="pb-2">รูปโปรไฟล์</div>
                <label for="small-file-input" class="sr-only">เลือกไฟล์</label>
                <input
                    type="file"
                    @change="onFileChangedAvatar($event)"
                    accept="image/*"
                    name="small-file-input"
                    id="small-file-input"
                    class="block w-72 border border-gray-200 shadow-sm rounded-lg text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none file:bg-gray-50 file:border-0 file:me-4 file:py-2 file:px-4" />
            </div>
            <div class="bg-slate-200 w-72 h-[1px]"></div>
            <div class="flex flex-col gap-2">
                <h2>กรุณาใส่รหัสเพื่อบันทึกข้อมูล</h2>
                <div class="relative w-72">
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
            </div>

            <button
                class="mt-2 py-2 px-3 transition-colors duration-150 ease-in-out inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                href="#"
                :disabled="regis_passw?.length < 3"
                @click="updateUser">
                <span class="material-icons-outlined" style="font-size: 18px">save</span>
                บันทึกค่า
            </button>
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
