<script setup lang="ts">
    const roles = [
        {
            icon: 'account_circle',
            name: 'ผู้เรียน',
            description: 'ศึกษาได้เต็มรูปแบบด้วยระบบการเรียนรู้แบบใหม่',
        },
        {
            icon: 'school',
            name: 'ผู้สอน',
            description:
                'จัดเนื้อหาการสอนและสื่อสอนแบบไร้ข้อจำกัด เพื่อการศึกษาที่ดียิ่งขึ้น',
        },
        {
            icon: 'supervisor_account',
            name: 'ผู้ช่วยสอน',
            description: 'ตรวจสอบการส่งแบบฝึกหัดและการบ้านได้อย่างง่ายดาย',
        },
    ]
</script>

<template>
    <div class="bg-white drop-shadow-[0_-18px_12px_rgba(0,0,0,0.15)]">
        <div class="mx-auto flex max-w-screen-2xl flex-col gap-y-8 py-8">
            <span class="px-8 text-center text-4xl font-bold 2xl:px-0">
                หลากหลายคุณสมบัติ
            </span>
            <div
                class="flex flex-col items-center justify-center gap-x-16 gap-y-8 px-8 md:flex-row 2xl:gap-x-32 2xl:px-0">
                <div
                    v-for="role in roles"
                    :key="role.name"
                    class="border-1 flex h-64 w-64 flex-col items-center gap-x-8 rounded-lg border p-4 transition-shadow duration-200 ease-in-out hover:shadow-xl sm:h-fit sm:w-full sm:flex-row md:h-64 md:w-64 md:flex-col">
                    <span
                        class="material-icons-outlined select-none"
                        style="font-size: 128px">
                        {{ role.icon }}
                    </span>
                    <div
                        class="flex flex-col text-center sm:text-left md:text-center">
                        <span class="text-xl font-bold">{{ role.name }}</span>
                        <span class="">{{ role.description }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
