<script setup lang="ts">
    const devname = [
        '65070030	นายจารุกิตติ์ ศรีพาเพลิน',
        '65070041	นายเจษฎา แต่งสุวรรณ์',
        '65070135	นายปัณณวิชญ์ ปานช้าง',
        '65070195	นางสาวรตา อุณหะ',
        '65070203	นางสาววรดา สาระคนธ์',
        '65070242	นายสุภัศชัย โพธิชัย',
    ]
</script>

<template>
    <div class="w-full bg-blue-700 text-white">
        <div
            class="mx-auto flex max-w-screen-2xl flex-col justify-between gap-8 p-12 md:flex-row">
            <div class="flex flex-col">
                <span class="font-title text-3xl font-bold">LearnLab</span>
                <span class="mb-4 text-lg">
                    ระบบจัดการเนื้อหาเรียนแบบออนไลน์
                </span>
                <span class="text-lg">
                    เว็บไซต์นี้เป็นส่วนหนึ่งของวิชาเทคโนโลยีกลุ่มเมฆ รหัส
                    06016404
                </span>
                <span class="mb-4">
                    ภาคเรียนที่ 1 ปีการศึกษา 2567
                    <br >
                    คณะเทคโนโลยีสารสนเทศ
                    <br >
                    สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง
                </span>
            </div>
            <div class="flex flex-col">
                <div class="flex flex-col gap-y-1">
                    <span class="font-bold">จัดทำโดย</span>
                    <div
                        class="h-[2px] w-full bg-gradient-to-r from-white to-white/0" />
                    <ul>
                        <li v-for="name in devname" :key="name">{{ name }}</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>
