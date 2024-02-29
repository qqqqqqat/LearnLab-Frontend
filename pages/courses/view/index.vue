<script setup lang="ts">
const route = useRoute();

if (!route.query.id) {
    navigateTo("/courses", {replace: true})
}

</script>
<template>
  <div class="mx-auto mt-20 max-w-screen-2xl">
    <div class="flex flex-col gap-16">
      <div class="flex relative">
        <img
          class="w-full h-72 object-cover rounded-xl"
          src='/images/CourseBannerDefault.svg'
          alt="Image Description"
        />
        <div class="absolute w-full h-full rounded-xl bg-gradient-to-b from-slate-50/0 from-70% to-zinc-900"></div>
        <span class="absolute bottom-0 text-4xl font-bold pb-4 pl-6 text-white">Course ID is {{ route.query.id }}</span>
      </div>
      
    </div>
  </div>
</template>
