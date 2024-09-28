<script setup lang="ts">
    const featureRef = ref()
    const userState = useUserState()

    function scrollTo() {
        window.scrollTo({
            top: featureRef.value.$el.offsetTop - 65,
            behavior: 'smooth',
        })
    }
</script>
<template>
    <LandingJumbotron @scroll-to-content="scrollTo" />
    <LandingFeatures ref="featureRef" />
    <LandingPromozone />
    <LandingJoinnow v-if="!userState" />
</template>
