<script setup lang="ts">
    import { toast } from '@steveyuowo/vue-hot-toast'
    const userRole = useUserCourseState()

    definePageMeta({
        layout: 'course',
    })
    const route = useRoute()
    const file_post = ref<APIGETFilesResponse>()
    const file_path = ref<string>('/')
    const file_pending = ref(true)
    const uploadFileModal = ref()
    const createFolderModal = ref()
    const deleteConfirmModal = ref()

    const delFileName = ref('')
    const delFilePath = ref('')
    const delFileID = ref<number>(0)
    const delFileType = ref<'FOLDER' | 'FILE'>('FILE')

    async function fetchFile(id: number) {
        file_pending.value = true
        file_post.value = []
        await $fetch<APIGETFilesResponse>('/api/file/', {
            query: {
                c_id: id,
                f_path: file_path.value,
            },
        })
            .then((res) => {
                file_post.value = res
                file_pending.value = false
            })
            .catch((err) => {
                toast.error(err?.data?.message)
                navigateTo('/mycourse', { replace: true })
            })
    }

    async function deleteFile(f_id: number, f_type: string) {
        deleteConfirmModal.value.c_closeModal()
        const deleteFileToast = toast.loading('กำลังลบ')
        await $fetch<{ message: string; status: number }>('/api/file/', {
            method: 'DELETE',
            body: {
                f_id: f_id,
                c_id: route.query.id,
                f_type: f_type,
            },
        })
            .then((res) => {
                file_pending.value = true
                fetchFile(route.query.id)
                toast.update(deleteFileToast, {
                    type: 'success',
                    message: res?.message,
                })
            })
            .catch((err) => {
                toast.update(deleteFileToast, {
                    type: 'error',
                    message: err?.data?.message,
                })
            })
    }

    async function downloadFile(f_id: number) {
        await navigateTo(`/api/file/?f_id=${f_id}`, {
            open: { target: '_blank' },
        })
    }

    function goUpDirectory(path: string): string {
        const pathParts = path.split('/')
        pathParts.pop()
        pathParts.pop()
        return pathParts.length === 1 ? '/' : pathParts.join('/') + '/'
    }

    function traverseFile(directory: string) {
        file_path.value = directory
        file_pending.value = true
        fetchFile(route.query.id)
    }

    if (route.query.id) {
        fetchFile(route.query.id)
    } else {
        navigateTo('/courses', { replace: true })
    }
</script>
<template>
    <LazyCourseCreateFolderModal
        ref="createFolderModal"
        :f_path="file_path"
        :c_id="route.query.id"
        @refresh-file="fetchFile(route.query.id)" />
    <LazyCourseUploadFileModal
        ref="uploadFileModal"
        :f_path="file_path"
        :c_id="route.query.id"
        @refresh-file="fetchFile(route.query.id)" />
    <LazyCourseDeleteFileConfirmModal
        ref="deleteConfirmModal"
        :f_name="delFileName"
        :f_path="delFilePath"
        :f_id="delFileID"
        :f_type="delFileType"
        @delete-file="deleteFile" />

    <div class="flex flex-col gap-2">
        <div class="flex flex-row items-center justify-between gap-4 pb-4">
            <input
                v-if="!file_pending"
                type="text"
                class="block w-full rounded-lg border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50"
                :value="file_path"
                placeholder="Readonly input"
                readonly >
            <button
                v-if="file_path !== '/'"
                class="inline-flex flex-shrink-0 items-center justify-center gap-x-2 rounded-lg border border-transparent bg-blue-600 px-3 py-3 text-sm font-semibold text-white transition-colors duration-150 ease-in-out hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50"
                href="#"
                @click="traverseFile(goUpDirectory(file_path))">
                <span class="material-icons-outlined" style="font-size: 18px">
                    arrow_upward
                </span>
            </button>
            <div
                v-show="
                    userRole?.[route.query.id] !== 'STUDENT' && !file_pending
                "
                class="hs-dropdown relative inline-flex">
                <button
                    id="hs-dropdown-create-file"
                    type="button"
                    class="hs-dropdown-toggle inline-flex flex-shrink-0 items-center justify-center gap-x-2 rounded-lg border border-transparent bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors duration-150 ease-in-out hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50">
                    เพิ่ม
                    <svg
                        class="size-4 transition duration-150 ease-in-out hs-dropdown-open:rotate-180"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round">
                        <path d="m6 9 6 6 6-6" />
                    </svg>
                </button>
                <div
                    class="hs-dropdown-menu duration z-[100] mt-2 hidden min-w-40 rounded-lg bg-white p-2 opacity-0 shadow-md transition-[opacity,margin] before:absolute before:-top-4 before:start-0 before:h-4 before:w-full after:absolute after:-bottom-4 after:start-0 after:h-4 after:w-full hs-dropdown-open:opacity-100"
                    aria-labelledby="hs-dropdown-create-file">
                    <a
                        class="flex cursor-pointer items-center gap-x-3.5 rounded-lg px-3 py-2 text-sm text-gray-800 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                        @click="uploadFileModal.c_openModal()">
                        <span class="material-icons-outlined">
                            insert_drive_file
                        </span>
                        ไฟล์
                    </a>
                    <a
                        class="flex cursor-pointer items-center gap-x-3.5 rounded-lg px-3 py-2 text-sm text-gray-800 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                        @click="createFolderModal.c_openModal()">
                        <span class="material-icons-outlined">folder</span>
                        โฟลเดอร์
                    </a>
                </div>
            </div>
        </div>
        <div
            v-for="file in file_post"
            v-if="(file_post?.length || 0) > 0"
            class="border-1 flex w-full flex-col rounded-md border p-2"
            :class="
                file.f_type === 'FOLDER'
                    ? 'transition-color duration-200 ease-in-out hover:bg-slate-50'
                    : ''
            ">
            <div
                class="flex w-full flex-row items-center justify-between gap-2"
                :class="file.f_privacy === 'PRIVATE' ? 'opacity-60' : ''">
                <div
                    class="flex w-full flex-row items-center gap-2"
                    :class="file.f_type === 'FOLDER' ? 'cursor-pointer' : ''"
                    @click="
                        () => {
                            if (file.f_type === 'FOLDER') {
                                traverseFile(`${file_path}${file.f_name}/`)
                            }
                        }
                    ">
                    <div
                        class="flex h-8 w-8 flex-shrink-0 select-none items-center justify-center rounded-md bg-slate-100">
                        <span class="material-icons-outlined">
                            {{
                                file.f_type === 'FOLDER'
                                    ? 'folder'
                                    : file.f_mime_type?.split('/')[0] ===
                                        'image'
                                      ? 'image'
                                      : file.f_mime_type?.split('/')[0] ===
                                          'audio'
                                        ? 'audio_file'
                                        : file.f_mime_type === 'application/pdf'
                                          ? 'description'
                                          : file.f_mime_type?.split('/')[0] ===
                                              'video'
                                            ? 'video_file'
                                            : 'insert_drive_file'
                            }}
                        </span>
                    </div>
                    <div class="flex flex-col">
                        <span>{{ file.f_name }}</span>
                        <span class="text-sm text-slate-400">
                            {{ new Date(file.updated_at).toLocaleString() }}
                            {{
                                file.updated_at === file.created_at
                                    ? ''
                                    : '(ถูกแก้ไข)'
                            }}
                        </span>
                        <span class="text-xs text-slate-400">
                            โดย {{ file.u_firstname }} {{ file.u_lastname }}
                        </span>
                    </div>
                </div>
                <div class="flex w-fit flex-row items-center gap-2">
                    <span
                        v-if="file.f_type === 'FILE'"
                        class="material-icons-outlined cursor-pointer select-none text-gray-500"
                        @click="downloadFile(file.f_id)">
                        download
                    </span>
                    <span
                        v-if="
                            file.f_privacy === 'PUBLIC' &&
                            userRole?.[route.query.id] !== 'STUDENT'
                        "
                        class="material-icons-outlined cursor-pointer select-none text-red-500"
                        @click="
                            () => {
                                delFileName = file.f_name
                                delFilePath = file_path
                                delFileID = file.f_id
                                delFileType = file.f_type
                                deleteConfirmModal.c_openModal()
                            }
                        ">
                        delete
                    </span>
                </div>
            </div>
        </div>
        <div
            v-else-if="!file_pending && (file_post?.length || 0) === 0"
            class="border-1 flex w-full flex-col items-center gap-2 rounded-md border p-4 md:flex-row">
            <img class="w-48 p-8" src="~/assets/images/nofile.svg" >
            <span class="text-3xl font-bold">
                {{
                    file_path === '/'
                        ? 'ยังไม่มีเนื้อหาการสอนในคอร์สนี้'
                        : 'ไม่มีไฟล์ในโฟลเดอร์นี้'
                }}
            </span>
        </div>
        <div
            v-else
            class="border-1 flex w-full flex-row gap-2 rounded-md border p-4">
            <div
                class="inline-block size-6 animate-spin rounded-full border-[3px] border-current border-t-transparent text-blue-600 dark:text-blue-500"
                role="status"
                aria-label="loading">
                <span class="sr-only">Loading...</span>
            </div>
            กำลังโหลดข้อมูล
        </div>
    </div>
</template>
