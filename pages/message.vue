<script setup lang="ts">


    const search = ref<string>('')
    const currentPage = ref<number>(0)
    const totalPages = ref<number>(0)
    const isLocked = ref({ title: 'ทั้งหมด', value: 'false' })
    const courses = ref<CourseListing | null>()
    const pending = ref();

    const once = ref(true)

    watch(courses, () => {
        if (once.value) {
            currentPage.value = courses.value?.page || 1
            totalPages.value = courses.value?.total_page || 1
            once.value = false
        }
    })

    async function updateQuery(searchQuery: string) {
        pending.value = true
        await $fetch<CourseListing>('/api/courses/', {
            query: {
                search: searchQuery,
                page: currentPage.value,
                limit: 9,
                locked: isLocked.value.value,
            },
        }).then((res) => {
            pending.value = false
            courses.value = res
            totalPages.value = res.total_page
        })
    }

    // updateQuery(search.value)

    // watch(currentPage, () => {
    //     if (currentPage.value > totalPages.value) {
    //         currentPage.value = totalPages.value
    //     } else if (currentPage.value < 1) {
    //         currentPage.value = 1
    //     }
    //     updateQuery(search.value)
    // })

    watch(isLocked, () => {
        currentPage.value = 1
        updateQuery(search.value)
    })

    async function goToCourse(c_id: number, is_locked: boolean) {
        console.log(c_id)
        if (!is_locked) {
            await navigateTo({
                path: '/courses/view',
                query: {
                    id: c_id,
                },
            })
        }
    }
</script>
<template>
    <div class="max-w-screen-2xl mx-auto mb-8">
        <div class="flex flex-col items-center w-full h-full">
            <h1 class="text-5xl mt-24 font-bold mb-4">กล่องข้อความ</h1>

            <!-- Pagination -->
            <nav class="flex items-center gap-x-1 mt-8">
                <button
                    type="button"
                    @click="
                        () => {
                            if (currentPage > 1) {
                                currentPage--
                            }
                        }
                    "
                    :disabled="currentPage === 1"
                    class="min-h-[38px] min-w-[38px] py-2 px-2.5 inline-flex justify-center items-center gap-x-2 text-sm rounded-lg text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none">
                    <svg
                        class="flex-shrink-0 size-3.5"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round">
                        <path d="m15 18-6-6 6-6" />
                    </svg>
                    <span aria-hidden="true" class="sr-only">Previous</span>
                </button>
                <div class="flex items-center gap-x-1">
                    <input
                        v-model="currentPage"
                        type="number"
                        :oninput="`this.value = (this.value >= ${totalPages}) ? ${totalPages} : Math.abs(this.value)`"
                        class="min-h-[38px] min-w-[38px] w-16 text-center flex justify-center items-center border border-gray-200 text-gray-800 py-2 px-3 text-sm rounded-lg focus:outline-none focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none" />
                    <span class="min-h-[38px] flex justify-center items-center text-gray-500 py-2 px-1.5 text-sm">จาก</span>
                    <span class="min-h-[38px] flex justify-center items-center text-gray-500 py-2 px-1.5 text-sm">{{ totalPages }}</span>
                </div>
                <button
                    type="button"
                    @click="
                        () => {
                            if (currentPage < totalPages) {
                                currentPage++
                            }
                        }
                    "
                    :disabled="currentPage === totalPages"
                    class="min-h-[38px] min-w-[38px] py-2 px-2.5 inline-flex justify-center items-center gap-x-2 text-sm rounded-lg text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none">
                    <span aria-hidden="true" class="sr-only">Next</span>
                    <svg
                        class="flex-shrink-0 size-3.5"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round">
                        <path d="m9 18 6-6-6-6" />
                    </svg>
                </button>
            </nav>
            <!-- End Pagination -->
        </div>
    </div>
</template>
<style scoped>
    .fade-enter-active,
    .fade-leave-active {
        transition: opacity 0.25s ease;
    }

    .fade-enter-from,
    .fade-leave-to {
        opacity: 0;
    }
</style>
