<script setup lang="ts">
    import { MdEditor, en_US } from 'md-editor-v3'
    import 'md-editor-v3/lib/style.css'
    const text = ref('')

    const emit =defineEmits(['sendText'])

    function showHTML(html: string){
        emit('sendText', html);
    }
</script>
<template class="z-[10]">
        <MdEditor :preview="false" :noUploadImg="true" language="en-US" v-model="text" @onHtmlChanged="showHTML" />
</template>
