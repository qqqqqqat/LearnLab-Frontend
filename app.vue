<script setup lang="ts">
import '@fontsource/noto-sans-thai';
useSeoMeta({
        title: 'LearnLab',
        ogTitle: 'LearnLab',
        description: 'LearnLab มากกว่าแค่แพลตฟอร์มการเรียนรู้แบบออนไลน์ แต่มันคือจุดปล่อยตัวสู่การผจญภัยทางปัญญาของคุณ ที่นี่ ความอยากรู้อยากเห็นของคุณไม่เพียงแค่ได้รับการต้อนรับ แต่ยังถูกจุดประกายอีกด้วย',
        ogDescription: 'LearnLab มากกว่าแค่แพลตฟอร์มการเรียนรู้แบบออนไลน์ แต่มันคือจุดปล่อยตัวสู่การผจญภัยทางปัญญาของคุณ ที่นี่ ความอยากรู้อยากเห็นของคุณไม่เพียงแค่ได้รับการต้อนรับ แต่ยังถูกจุดประกายอีกด้วย',
        ogImage: '/meta_image.png',
        twitterCard: 'summary_large_image',
    })
</script>
<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<style scoped>
body {
  scroll-behavior: smooth !important;
}
</style>