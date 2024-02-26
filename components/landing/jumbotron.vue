<script setup>
import 'material-icons/iconfont/outlined.css';

</script>

<template>
  <main class="flex items-center relative h-screen">
    <img
      class="absolute object-cover object-center h-full -z-10"
      src="~/assets/landing/LiftOff.png"
    />
    <div class="md:mx-16 mx-8 flex flex-col justify-center h-fit gap-y-4 max-w-screen-2xl">
      <span class="text-6xl font-bold text-white ">LearnLab</span>
      <div class=" bg-gradient-to-r from-orange-600 to-orange-50/0 w-full h-1"></div>
      <span class="text-4xl text-white"
        >เริ่มต้นการเดินทางแห่งการเรียนรู้ของคุณ!</span
      >
        <div>
            <button type="button" class="py-2 px-3 inline-flex items-center gap-x-2 rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600">
          <span class="material-icons-outlined">chevron_right</span>ดูคุณสมบัติ
        </button>
        </div>
    </div>
  </main>
</template>
