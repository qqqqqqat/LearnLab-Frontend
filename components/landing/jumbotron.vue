<script setup>
    import 'material-icons/iconfont/outlined.css'
    const emit = defineEmits(['scrollToContent'])
</script>

<template>
    <main class="relative flex h-screen w-full items-center">
        <img
            class="fixed -z-20 h-full w-full object-cover object-[65%_50%]"
            src="~assets/images/landing/LiftOff.webp"
            alt="Rocker Lift off image" >
        <div
            class="mx-auto flex h-fit w-full max-w-screen-2xl select-none flex-col gap-y-4 overflow-auto px-8 pt-12 sm:justify-center">
            <span
                class="font-title text-6xl font-bold text-white drop-shadow-[0_0_6px_rgba(0,0,0,0.75)]">
                LearnLab
            </span>
            <div
                class="h-1 w-full bg-gradient-to-r from-orange-600 to-orange-50/0 md:w-1/2" />
            <span
                class="font-title text-4xl text-white drop-shadow-[0_0_6px_rgba(0,0,0,0.75)]">
                เริ่มต้นการเดินทางแห่งการเรียนรู้ของคุณ!
            </span>
            <div
                class="flex flex-col items-start gap-4 font-title sm:flex-row sm:items-center">
                <button
                    type="button"
                    class="inline-flex items-center gap-x-2 rounded-lg border border-transparent bg-blue-600 px-3 py-2 text-left text-white transition-colors duration-200 ease-in-out hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50"
                    @click="navigateTo('/courses')">
                    <span
                        class="material-icons-outlined size-6 overflow-hidden select-none">
                        rocket_launch
                    </span>
                    สำรวจหลักสูตร
                </button>
                <button
                    type="button"
                    class="inline-flex items-center gap-x-2 rounded-lg border border-transparent bg-transparent px-3 py-2 text-left text-white transition-colors duration-200 ease-in-out hover:bg-gray-200/10 disabled:pointer-events-none disabled:opacity-50"
                    @click="emit('scrollToContent')">
                    <span
                        class="material-icons-outlined size-6 overflow-hidden select-none">
                        chevron_right
                    </span>
                    ดูคุณสมบัติ
                </button>
            </div>
        </div>
    </main>
</template>
