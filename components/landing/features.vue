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
    description: "จัดเนื้อการสื่อสอนแบบไร้ข้อจำกัด เพื่อการศึกษาที่ดียิ่งขึ้น",
  },
  {
    icon: "supervisor_account",
    name: "ผู้ช่วยสอน",
    description: "ตรวจสอบการส่งแบบฝึกหัดและการบ้านได้อย่างง่ายดาย",
  },
];
</script>

<template>
  <div class="mx-auto max-w-screen-2xl flex flex-col min-h-screen py-8 gap-y-4">
    <span class="font-bold text-4xl">หลากหลายคุณสมบัติ</span>
    <div class="flex flex-row gap-8 items-center">
      <div v-for="role in roles" class="flex flex-col p-4 items-center w-64 h-64 border border-1 rounded-lg">
        <span class="material-icons-outlined" style="font-size: 128px">{{role.icon}}</span>
        <span class="text-lg font-bold">{{ role.name }}</span>
        <span class="text-center">{{ role.description }}</span>
      </div>
    </div>
  </div>
</template>
