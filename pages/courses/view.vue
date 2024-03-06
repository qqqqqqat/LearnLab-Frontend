<script setup lang="ts">
    import { toast } from '@steveyuowo/vue-hot-toast'
    const userRole = useUserCourseState()
    definePageMeta({
        layout: 'course',
    })

    const route = useRoute()

    const crs_post = ref<PostGETAPIResponse>()
    const crs_pending = ref(true)
    const sessionInfo = ref()

    watch(
        () => route.query.id,
        async (id) => {
            fetchPost(id)
        }
    )

    async function fetchPost(id: number) {
        await $fetch<PostGETAPIResponse>('/api/post/', {
            query: {
                c_id: id,
            },
        })
            .then((res) => {
                crs_post.value = res
                crs_pending.value = false
            })
            .catch((err) => {
                toast.error(err.data.message)
                navigateTo('/mycourse', { replace: true })
            })
    }

    if (route.query.id) {
        fetchPost(route.query.id)
    }

    // console.log(userRole?.value[route.query.id])
</script>
<template>
    <div class="flex flex-col gap-8 w-full">
        <div v-if="(crs_post?.data.length || 0) > 0" v-for="post in crs_post?.data" class="flex flex-col border border-1 rounded-md gap-2 w-full p-4">
            <div class="flex items-center gap-4 w-full">
                <div v-if="post.u_avatar" class="rounded-md w-12 h-12"><img class="rounded-md aspect-square object-cover border bottom-1" :src="`/api/avatar/?u_id=${post.u_id}`" /></div>
                <div class="rounded-md w-12 h-12 bg-slate-200 flex flex-col justify-center items-center text-2xl select-none" v-if="!post?.u_avatar">
                    {{ `${post?.u_firstname.slice(0, 1)}${post?.u_lastname.slice(0, 1)}` }}
                </div>
                <div class="flex flex-col">
                    <span>{{ post.u_firstname }} {{ post.u_lastname }} <span class="inline-flex items-center gap-x-1.5 py-0.5 px-1.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ">{{ post.u_role === 'INSTRUCTOR' ? 'ผู้สอน' : post.u_role }}</span></span>
                    <span class="text-sm text-slate-400">{{ new Date(post.p_updated_at).toLocaleString() }} {{ post.p_updated_at === post.p_created_at ? '' : '(ถูกแก้ไข)' }}</span>
                </div>
            </div>

            <div class="text-xl font-bold">{{ post.p_title }}</div>
            <div v-if="post.p_content">{{ post.p_content }}</div>
        </div>
        <div v-else-if="!crs_pending && (crs_post?.data.length || 0) === 0" class="flex md:flex-row flex-col items-center border border-1 rounded-md gap-2 w-full p-4">
            <img class="w-64" src="~/assets/images/content.svg" />
            <span class="text-3xl font-bold">ยังไม่มีโพสต์ในคอร์สนี้</span>
        </div>
        <div v-else class="flex flex-row border border-1 rounded-md gap-2 w-full p-4">
            <div class="animate-spin inline-block size-6 border-[3px] border-current border-t-transparent text-blue-600 rounded-full dark:text-blue-500" role="status" aria-label="loading">
                <span class="sr-only">Loading...</span>
            </div>
            กำลังโหลดข้อมูล
        </div>
    </div>
</template>
