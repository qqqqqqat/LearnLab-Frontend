<script setup>
import 'material-icons/iconfont/outlined.css';
const emit = defineEmits(['scrollToContent'])
</script>

<template>
  <main class="flex items-center w-full h-screen relative">
    <img
      class="object-cover object-[65%_50%] h-full w-full -z-20 fixed"
      src="~assets/images/landing/LiftOff.webp"
      alt="Rocker Lift off image"
    />
    <div class="px-8 mx-auto flex flex-col sm:justify-center h-fit gap-y-4 w-full max-w-screen-2xl pt-12 overflow-auto select-none">
      <span class="text-6xl font-bold text-white drop-shadow-[0_0_6px_rgba(0,0,0,0.75)]">LearnLab</span>
      <div class=" bg-gradient-to-r from-orange-600 to-orange-50/0 md:w-1/2 w-full h-1"></div>
      <span class="text-4xl text-white  drop-shadow-[0_0_6px_rgba(0,0,0,0.75)]"
        >เริ่มต้นการเดินทางแห่งการเรียนรู้ของคุณ!</span
      >
        <div class="flex sm:flex-row flex-col sm:items-center items-start gap-4">
          <button type="button" @click="navigateTo('/courses')" class="py-2 px-3 text-left transition-colors duration-200 ease-in-out inline-flex items-center gap-x-2 rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none">
            <span class="material-icons-outlined">rocket_launch</span>สำรวจหลักสูตร
          </button>
          <button type="button" @click="emit('scrollToContent')" class="py-2 px-3 text-left transition-colors duration-200 ease-in-out inline-flex items-center gap-x-2 rounded-lg border border-transparent bg-transparent text-white hover:bg-gray-200/10 disabled:opacity-50 disabled:pointer-events-none ">
          <span class="material-icons-outlined">chevron_right</span>ดูคุณสมบัติ
        </button>
        </div>
    </div>
  </main>
</template>
