<script setup lang="ts">
    import { MdEditor, en_US } from 'md-editor-v3'
    import 'md-editor-v3/lib/style.css'
    const text = ref()
    const props = defineProps({
        content: {
            required: false,
            type: String,
        },
    })
    watch(
        () => props.content,
        () => {
            text.value = props.content
        }
    )

    const emit = defineEmits(['sendText'])

    function showHTML(html: string) {
        // emit('sendText', text.value);
        setTimeout(() => {
            emit('sendText', text.value)
        }, 1)
    }
</script>
<template class="z-[10]">
    <MdEditor
        :preview="false"
        :noUploadImg="true"
        language="en-US"
        v-model="text"
        @onChange="showHTML" />
</template>
