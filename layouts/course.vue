<script setup lang="ts">
import { toast } from "@steveyuowo/vue-hot-toast";

const toastID = toast.loading("กำลังโหลดข้อมูลคอร์ส");
const route = useRoute();

let crs_info = ref();
let crs_pending = ref(true);

watch(
  () => route.query.id,
  async (id) => {
    fetchCourse(id)
  }
);

async function fetchCourse(id: number){
    const fd = new FormData();
    fd.append("c_id", id);
    await $fetch("http://localhost:8000/api/courses", {
      method: "POST",
      body: fd,
    }).then((res) => {
      crs_info.value = res;
      crs_pending.value = false;
    });
}

fetchCourse(route.query.id)

watch(crs_pending, (state) => {
  toast.update(toastID, { type: "success", message: "โหลดสำเร็จ" });
});
</script>
<template>
  <NavigationBar />
  <AccountModal />
  <div class="mx-auto mt-20 max-w-screen-2xl">
    <div class="flex flex-col gap-4 pb-16 px-4">
    <div class="flex gap-x-4 relative">
        <button @click="navigateTo('/courses')" class="transition-all duration-200 ease-in-out py-2 px-3  inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-blue-600 hover:bg-blue-100 hover:text-blue-800 disabled:opacity-50 disabled:pointer-events-none">
            <span class="material-icons-outlined">home</span>กลับหน้าคอร์ส
        </button>
        <div class="flex items-center">
            Courses <span class="material-icons-outlined">chevron_right</span> View <span class="material-icons-outlined">chevron_right</span> {{ route.query.id }}
        </div>
    </div>
      <div class="flex relative">
        <img
          class="w-full max-h-96 object-cover object-[0%_50%] rounded-xl"
          :src="
            crs_info?.c_banner
              ? crs_info?.c_banner
              : '/images/CourseBannerDefault.svg'
          "
          alt="Image Description"
        />
        <div
          class="absolute w-full h-full rounded-xl bg-gradient-to-b from-slate-50/0 from-70% to-zinc-900"
        ></div>
        <div class="absolute flex flex-col gap-2 left-5 bottom-5">
            <span
            class="text-4xl font-bold text-white"
            >{{ crs_info?.c_name }}</span
            >
            <span class="bottom-0 text-sm font-light text-white h-full max-h-10 overflow-auto">
                {{ crs_info?.c_description }} Lorem, ipsum dolor sit amet consectetur adipisicing elit. Corrupti, id ut. Tempore fugit placeat doloremque, saepe libero et perferendis, inventore recusandae ex tenetur maiores sapiente iusto adipisci perspiciatis nihil facilis! Lorem ipsum dolor sit amet consectetur adipisicing elit. Rem adipisci ducimus nesciunt. Esse accusamus qui magni vero, sunt quaerat libero voluptates vitae facilis blanditiis, doloribus iste adipisci nesciunt eius suscipit. Lorem ipsum dolor sit amet consectetur, adipisicing elit. Perferendis error eius nulla, rerum obcaecati quia asperiores animi, ipsum hic aspernatur ad? Amet, alias et? Dolor vel sequi ex impedit asperiores?
            </span>
        </div>
      </div>
      <div class="flex md:flex-row flex-col gap-4">
        <nav
          class="border border-1 rounded-lg shadow-sm h-64 md:w-64 w-full"
        ></nav>
        <main class="flex flex-col gap-y-4">
          <slot />
        </main>
      </div>
    </div>
  </div>
  <Footer />
</template>
<style scoped>
::-webkit-scrollbar {
  width: 20px;
}

::-webkit-scrollbar-track {
  background-color: transparent;
}

::-webkit-scrollbar-thumb {
  background-color: #d6dee1;
  border-radius: 20px;
  border: 6px solid transparent;
  background-clip: content-box;
}

::-webkit-scrollbar-thumb:hover {
  background-color: #a8bbbf;
}
</style>
