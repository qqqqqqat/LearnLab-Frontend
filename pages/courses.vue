<script setup lang="ts">

const { data: courses, refresh, error, pending  } = useFetch('http://localhost:8000/api/courses')

</script>
<template>
    <div class="max-w-screen-2xl">
        <div class="flex flex-col items-center w-full h-full">
            <h1 class="text-4xl mt-24 font-bold">หลักสูตร</h1>
            <ClientOnly>
                <div v-for="crs in courses?.data" class="flex flex-col">
                    <span>{{ crs.c_id }}</span>
                    <span>{{ crs.c_name }}</span>
                    <span>{{ crs.c_description }}</span>
                </div>
            </ClientOnly>
        </div>
    </div>
</template>