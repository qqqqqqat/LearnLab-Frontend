<script setup lang="ts">
    import { toast } from '@steveyuowo/vue-hot-toast'
    const userState = useUserState()
    const avatarState = useAvatarState()
    const name = ref<string | undefined>()
    const surname = ref<string | undefined>()
    const phone = ref<string | undefined>()

    watch(
        userState,
        (newUserState) => {
            name.value = newUserState?.u_firstname
            surname.value = newUserState?.u_lastname
            phone.value = newUserState?.u_tel
        },
        { immediate: true }
    )

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
                toast.update(loginToast, {
                    type: 'success',
                    message: res?.message,
                })
            })
            .catch((err) => {
                toast.update(loginToast, {
                    type: 'error',
                    message: err?.data?.message,
                })
            })
    }
</script>
<template>
    <div class="mx-auto mb-8 max-w-screen-2xl">
        <div class="flex h-full w-full flex-col items-center gap-y-8">
            <h1 class="mb-4 mt-24 font-title text-5xl font-bold">
                ตั้งค่าผู้ใช้
            </h1>
            <div
                class="flex flex-col items-center gap-8 md:flex-row md:items-start">
                <div
                    v-if="!avatarState?.u_avatar"
                    class="flex h-64 w-64 flex-col items-center justify-center rounded-md bg-slate-200 text-[140px]">
                    {{
                        userState?.u_firstname
                            ? `${userState?.u_firstname.slice(0, 1)}${userState?.u_lastname.slice(0, 1)}`
                            : ''
                    }}
                </div>
                <div v-else class="h-64 w-64 rounded-md">
                    <img
                        class="aspect-square h-64 w-64 rounded-md object-cover"
                        :src="`data:${avatarState?.u_avatar_mime_type};base64,${avatarState?.u_avatar}`" />
                </div>
                <div
                    class="flex max-w-full flex-col justify-center gap-4 rounded-md bg-gradient-to-r from-slate-100 to-slate-50/0 py-4 pl-8 pr-8 md:h-64 md:pr-16">
                    <span class="text-5xl font-bold">
                        {{
                            userState?.u_firstname ? userState?.u_firstname : ''
                        }}
                        {{ userState?.u_lastname ? userState?.u_lastname : '' }}
                    </span>
                    <span class="text-2xl">
                        {{
                            userState?.u_role
                                ? userState?.u_role === 'STUDENT'
                                    ? 'นักศึกษา'
                                    : 'ผู้สอน'
                                : ''
                        }}
                        | {{ userState?.u_email ? userState?.u_email : '' }}
                    </span>
                    <span class="text-2xl">{{ userState?.u_tel || '' }}</span>
                    <span class="text-lg">
                        สร้างบัญชีเมื่อ
                        {{
                            userState?.u_created_at
                                ? new Date(
                                      userState?.u_created_at
                                  ).toLocaleString()
                                : ''
                        }}
                    </span>
                </div>
            </div>
            <div class="relative w-72">
                <input
                    v-model="name"
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
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                </div>
            </div>

            <div class="relative w-72">
                <input
                    v-model="surname"
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
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                </div>
            </div>
            <div class="relative w-72">
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
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                </div>
            </div>
            <div>
                <div class="pb-2">รูปโปรไฟล์</div>
                <label for="small-file-input" class="sr-only">เลือกไฟล์</label>
                <input
                    id="small-file-input"
                    type="file"
                    accept="image/*"
                    name="small-file-input"
                    class="block w-72 rounded-lg border border-gray-200 text-sm shadow-sm file:me-4 file:border-0 file:bg-gray-50 file:px-4 file:py-2 focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50"
                    @change="onFileChangedAvatar($event)" />
            </div>
            <div class="h-[1px] w-72 bg-slate-200" />
            <div class="flex flex-col gap-2">
                <h2>กรุณาใส่รหัสเพื่อบันทึกข้อมูล</h2>
                <div class="relative w-72">
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
                            <circle cx="16.5" cy="7.5" r=".5" />
                        </svg>
                    </div>
                </div>
            </div>

            <button
                class="mt-2 inline-flex items-center justify-center gap-x-2 rounded-lg border border-transparent bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition-colors duration-150 ease-in-out hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50"
                href="#"
                :disabled="regis_passw?.length < 3"
                @click="updateUser">
                <span class="material-icons-outlined" style="font-size: 18px">
                    save
                </span>
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
