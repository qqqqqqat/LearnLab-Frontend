<script setup lang="ts">
const featureRef = ref();

function scrollTo() {
  window.scrollTo({
    top: featureRef.value.$el.offsetTop - 65,
    behavior: "smooth",
  });
}
</script>
<template>
  <LandingJumbotron @scroll-to-content="scrollTo" />
  <LandingFeatures ref="featureRef" />
  
  <LandingPromozone/>
  <LandingJoinnow/>
</template>
