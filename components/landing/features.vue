<script setup lang="ts">
const roles = [
  {
    icon: "account_circle",
    name: "ผู้เรียน",
    description: "ศึกษาได้เต็มรูปแบบด้วยระบบการเรียนรู้แบบใหม่",
  },
  {
    icon: "school",
    name: "ผู้สอน",
    description: "จัดเนื้อหาการสอนและสื่อสอนแบบไร้ข้อจำกัด เพื่อการศึกษาที่ดียิ่งขึ้น",
  },
  {
    icon: "supervisor_account",
    name: "ผู้ช่วยสอน",
    description: "ตรวจสอบการส่งแบบฝึกหัดและการบ้านได้อย่างง่ายดาย",
  },
];
</script>

<template>
  <div class="bg-white drop-shadow-[0_-18px_12px_rgba(0,0,0,0.15)]">
    <div class="mx-auto max-w-screen-2xl flex flex-col py-8 gap-y-8">
    <span class="font-bold text-4xl 2xl:px-0 px-8 text-center">หลากหลายคุณสมบัติ</span>
    <div class="flex md:flex-row flex-col 2xl:gap-x-32 gap-x-16 gap-y-8 2xl:px-0 px-8 justify-center items-center">
      <div v-for="role in roles" class="flex md:flex-col sm:flex-row flex-col p-4 items-center md:w-64 sm:w-full w-64 md:h-64 sm:h-fit h-64 border border-1 rounded-lg gap-x-8 transition-shadow duration-200 ease-in-out hover:shadow-xl">
        <span class="material-icons-outlined select-none" style="font-size: 128px">{{role.icon}}</span>
        <div class="flex flex-col md:text-center sm:text-left text-center">
            <span class="text-xl font-bold">{{ role.name }}</span>
            <span class="">{{ role.description }}</span>
        </div>
      </div>
    </div>
  </div>  
  </div>

</template>
