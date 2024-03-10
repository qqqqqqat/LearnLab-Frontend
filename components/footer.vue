<script setup lang="ts">
const devname = [
  "65070030	นายจารุกิตติ์ ศรีพาเพลิน",
  "65070041	นายเจษฎา แต่งสุวรรณ์",
  "65070203	นางสาววรดา สาระคนธ์",
  "65070237	นางสาวสิริทัต จงศิริ",
];
</script>

<template>
  <div class="w-full bg-blue-700 text-white">
    <div
      class="flex md:flex-row flex-col gap-8 justify-between p-12 mx-auto max-w-screen-2xl"
    >
      <div class="flex flex-col">
        <span class="text-3xl font-bold font-title">LearnLab</span>
        <span class="text-lg mb-4">ระบบจัดการเนื้อหาเรียนแบบออนไลน์</span>
        <span class="text-lg"
          >เว็บไซต์นี้เป็นส่วนหนึ่งของวิชาการเขียนโปรแกรมเว็บพื้นฐาน รหัส
          06066302</span
        >
        <span class="mb-4"
          >ภาคเรียนที่ 2 ปีการศึกษา 2566<br />
          คณะเทคโนโลยีสารสนเทศ<br />สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง
        </span>
      </div>
      <div class="flex flex-col">
        <div class="flex flex-col gap-y-1">
          <span class="font-bold">จัดทำโดย</span>
          <div
            class="bg-gradient-to-r from-white to-white/0 h-[2px] w-full"
          ></div>
          <ul>
            <li v-for="name in devname">{{ name }}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
