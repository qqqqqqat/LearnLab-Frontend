<script setup lang="ts">
    import HSOverlay from '@preline/overlay'
    const unenrollModal = ref()
    defineExpose({ c_closeModal, c_openModal })

    function c_closeModal() {
        const instance = HSOverlay.getInstance(unenrollModal.value, true)
        if ('element' in instance) {
            instance.element.close()
        }
    }

    function c_openModal() {
        const instance = HSOverlay.getInstance(unenrollModal.value, true)
        if ('element' in instance) {
            instance.element.open()
        }
    }

    const emit = defineEmits(['unenroll'])
</script>
<template>
    <div
        id="unenroll-modal"
        ref="unenrollModal"
        class="hs-overlay pointer-events-none fixed start-0 top-0 z-[80] hidden size-full overflow-y-auto overflow-x-hidden opacity-0 transition-all hs-overlay-open:opacity-100 hs-overlay-open:duration-500">
        <div
            class="m-3 opacity-0 transition-all hs-overlay-open:opacity-100 hs-overlay-open:duration-500 sm:mx-auto sm:w-full sm:max-w-lg">
            <div
                class="pointer-events-auto flex flex-col rounded-md border bg-white shadow-sm">
                <div
                    class="flex items-center justify-between border-b px-4 py-3">
                    <h3 class="font-bold text-gray-800">คุณแน่ใจนะ</h3>
                    <button
                        type="button"
                        class="flex size-7 items-center justify-center rounded-full border border-transparent text-sm font-semibold text-gray-800 hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-50"
                        data-hs-overlay="#unenroll-modal">
                        <span class="sr-only">Close</span>
                        <svg
                            class="size-4 flex-shrink-0"
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
                <div class="flex flex-col gap-4 p-6">
                    <div>คุณกำลังจะออกจากคอร์ส คุณแน่ใจใช่ไหม</div>
                </div>
                <div class="flex items-center justify-end gap-x-2 px-4 py-3">
                    <button
                        type="button"
                        class="inline-flex items-center gap-x-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50"
                        data-hs-overlay="#unenroll-modal">
                        ไม่ใช่
                    </button>
                    <button
                        type="button"
                        class="transition-color inline-flex items-center gap-x-2 rounded-lg border border-transparent bg-blue-600 px-3 py-2 text-sm font-semibold text-white duration-200 ease-in-out hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50"
                        @click="
                            () => {
                                c_closeModal()
                                emit('unenroll')
                            }
                        ">
                        ใช่
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
