<script setup lang="ts">
    import HSOverlay from '@preline/overlay'
    const unenrollModal = ref()
    defineExpose({ c_closeModal, c_openModal })

    function c_closeModal() {
        const { element } = HSOverlay.getInstance(unenrollModal.value, true)
        element.close()
    }

    function c_openModal() {
        const { element } = HSOverlay.getInstance(unenrollModal.value, true)
        element.open()
    }

    const emit = defineEmits(['unenroll'])
</script>
<template>
    <div
        ref="unenrollModal"
        id="unenroll-modal"
        class="hs-overlay hs-overlay-open:opacity-100 hs-overlay-open:duration-500 hidden size-full fixed top-0 start-0 z-[80] opacity-0 overflow-x-hidden transition-all overflow-y-auto pointer-events-none">
        <div class="hs-overlay-open:opacity-100 hs-overlay-open:duration-500 opacity-0 transition-all sm:max-w-lg sm:w-full m-3 sm:mx-auto">
            <div class="flex flex-col bg-white border shadow-sm rounded-md pointer-events-auto">
                <div class="flex justify-between items-center py-3 px-4 border-b">
                    <h3 class="font-bold text-gray-800">คุณแน่ใจนะ</h3>
                    <button
                        type="button"
                        class="flex justify-center items-center size-7 text-sm font-semibold rounded-full border border-transparent text-gray-800 hover:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none"
                        data-hs-overlay="#unenroll-modal">
                        <span class="sr-only">Close</span>
                        <svg
                            class="flex-shrink-0 size-4"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round">
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                        </svg>
                    </button>
                </div>
                <div class="flex flex-col p-6 gap-4">
                    <div>คุณกำลังจะออกจากคอร์ส คุณแน่ใจใช่ไหม</div>
                </div>
                <div class="flex justify-end items-center gap-x-2 py-3 px-4">
                    <button
                        type="button"
                        class="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
                        data-hs-overlay="#unenroll-modal">
                        ไม่ใช่
                    </button>
                    <button
                        type="button"
                        @click="() => {c_closeModal(); emit('unenroll')}"
                        class="transition-color duration-200 ease-in-out py-2 px-3 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none">
                        ใช่
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
