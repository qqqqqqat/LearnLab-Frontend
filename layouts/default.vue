<script setup lang="ts">
const route = useRoute();
</script>
<template>
  <header
    class="flex fixed top-0 flex-wrap sm:justify-start sm:flex-nowrap z-50 w-full bg-white text-sm py-4 border border-1 select-none"
  >
    <nav
      class="max-w-screen-2xl w-full mx-auto px-4 sm:flex sm:items-center sm:justify-between"
      aria-label="Global"
    >
      <div class="flex items-center justify-between">
        <NuxtLink class="flex-none text-xl text-blue-600 font-bold" to="/"
          >LearnLab</NuxtLink
        >
        <div class="sm:hidden">
          <button
            type="button"
            class="hs-collapse-toggle p-2 inline-flex justify-center items-center gap-x-2 rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
            data-hs-collapse="#navbar-collapse-with-animation"
            aria-controls="navbar-collapse-with-animation"
            aria-label="Toggle navigation"
          >
            <svg
              class="hs-collapse-open:hidden flex-shrink-0 size-4"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="3" x2="21" y1="6" y2="6" />
              <line x1="3" x2="21" y1="12" y2="12" />
              <line x1="3" x2="21" y1="18" y2="18" />
            </svg>
            <svg
              class="hs-collapse-open:block hidden flex-shrink-0 size-4"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
      </div>
      <div
        id="navbar-collapse-with-animation"
        class="hs-collapse hidden overflow-hidden transition-all duration-300 basis-full grow sm:block"
      >
        <div
          class="flex flex-col gap-5 mt-5 sm:flex-row sm:items-center sm:justify-end sm:mt-0 sm:ps-5"
        >
          <NuxtLink
            to="/"
            class="transition-color duration-200 ease-in-out font-medium"
            :class="
              route.path === '/'
                ? 'text-blue-600 hover:text-blue-400'
                : 'hover:text-gray-400'
            "
            aria-current="page"
            >หน้าหลัก</NuxtLink
          >
          <NuxtLink
            class="transition-color duration-200 ease-in-out font-medium"
            :class="
              route.path === '/courses'
                ? 'text-blue-600 hover:text-blue-400'
                : 'hover:text-gray-400'
            "
            to="/courses"
            aria-label="Read more our courses offering"
          >
            หลักสูตร
            <span
              class="inline-flex items-center gap-x-1.5 py-1 px-2 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >ใหม่</span
            >
          </NuxtLink>
          <button
            type="button"
            data-hs-overlay="#hs-slide-down-animation-modal"
            class="py-2 px-3 inline-flex items-center gap-x-2 font-bold rounded-lg transition-colors duration-200 ease-in-out border border-gray-200 hover:border-blue-600 hover:text-blue-600 disabled:opacity-50 disabled:pointer-events-none"
          >
            <div class="flex justify-center items-center gap-2">
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11.0834 12.25V11.0833C11.0834 10.4645 10.8376 9.871 10.4 9.43342C9.96241 8.99583 9.36892 8.75 8.75008 8.75H5.25008C4.63124 8.75 4.03775 8.99583 3.60017 9.43342C3.16258 9.871 2.91675 10.4645 2.91675 11.0833V12.25"
                  stroke="#1F2937"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M7.00008 6.41667C8.28875 6.41667 9.33341 5.372 9.33341 4.08333C9.33341 2.79467 8.28875 1.75 7.00008 1.75C5.71142 1.75 4.66675 2.79467 4.66675 4.08333C4.66675 5.372 5.71142 6.41667 7.00008 6.41667Z"
                  stroke="#1F2937"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              เข้าสู่ระบบ
            </div>
          </button>
        </div>
      </div>
    </nav>
  </header>
  <AccountModal/>
  <slot />
  <Footer />
</template>
