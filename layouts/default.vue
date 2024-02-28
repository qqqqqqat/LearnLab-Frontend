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
          <a
            class="font-medium hover:text-gray-400"
            href="#"
            aria-label="Search up our courses offering"
            ><svg
              width="20"
              height="20"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z"
                stroke="#6B7280"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M14 14L11.1333 11.1334"
                stroke="#6B7280"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </a>
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
  <div
    id="hs-slide-down-animation-modal"
    class="hs-overlay hidden size-full fixed top-0 start-0 z-[80] overflow-x-hidden overflow-y-auto pointer-events-none"
  >
    <div
      class="hs-overlay-open:mt-7 hs-overlay-open:opacity-100 hs-overlay-open:duration-500 mt-0 opacity-0 ease-out transition-all sm:max-w-lg sm:w-full m-3 sm:mx-auto"
    >
      <div
        class="flex flex-col bg-white border shadow-sm rounded-md pointer-events-auto"
      >
        <div class="flex justify-between items-center py-3 px-4">
          <h3 class="font-bold text-gray-800">เข้าสู่ระบบ</h3>
          <button
            type="button"
            class="flex justify-center items-center size-7 text-sm font-semibold rounded-full border border-transparent text-gray-800 hover:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none"
            data-hs-overlay="#hs-slide-down-animation-modal"
          >
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
              stroke-linejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
        <div class="flex flex-col overflow-y-auto">
          <div class="border-b border-gray-200 dark:border-gray-700">
            <nav
              class="-mb-0.5 flex justify-center space-x-6"
              aria-label="Tabs"
              role="tablist"
            >
              <button
                type="button"
                class="hs-tab-active:font-semibold hs-tab-active:border-blue-600 hs-tab-active:text-blue-600 py-4 px-1 inline-flex items-center gap-x-2 border-b-2 border-transparent text-sm whitespace-nowrap text-gray-500 hover:text-blue-600 focus:outline-none focus:text-blue-600 disabled:opacity-50 disabled:pointer-events-none active"
                id="horizontal-alignment-item-1"
                data-hs-tab="#horizontal-alignment-1"
                aria-controls="horizontal-alignment-1"
                role="tab"
              >
                เข้าสู่ระบบ
              </button>
              <button
                type="button"
                class="hs-tab-active:font-semibold hs-tab-active:border-blue-600 hs-tab-active:text-blue-600 py-4 px-1 inline-flex items-center gap-x-2 border-b-2 border-transparent text-sm whitespace-nowrap text-gray-500 hover:text-blue-600 focus:outline-none focus:text-blue-600 disabled:opacity-50 disabled:pointer-events-none"
                id="horizontal-alignment-item-2"
                data-hs-tab="#horizontal-alignment-2"
                aria-controls="horizontal-alignment-2"
                role="tab"
              >
                ลงทะเบียน
              </button>
            </nav>
          </div>
          <div class="mt-3">
            <div
              id="horizontal-alignment-1"
              role="tabpanel"
              aria-labelledby="horizontal-alignment-item-1"
              class="flex flex-col gap-y-8 p-8"
            >
          <div class="relative">
            <input
              type="email"
              class="peer py-3 px-4 ps-11 block w-full bg-gray-100 border-transparent rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
              placeholder="อีเมล์"
            />
            <div
              class="absolute inset-y-0 start-0 flex items-center pointer-events-none ps-4 peer-disabled:opacity-50 peer-disabled:pointer-events-none"
            >
              <svg
                class="flex-shrink-0 size-4 text-gray-500"
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
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
          </div>

          <div class="relative">
            <input
              type="password"
              class="peer py-3 px-4 ps-11 block w-full bg-gray-100 border-transparent rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
              placeholder="รหัสผ่าน"
            />
            <div
              class="absolute inset-y-0 start-0 flex items-center pointer-events-none ps-4 peer-disabled:opacity-50 peer-disabled:pointer-events-none"
            >
              <svg
                class="flex-shrink-0 size-4 text-gray-500"
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
                <path
                  d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z"
                />
                <circle cx="16.5" cy="7.5" r=".5" />
              </svg>
            </div>
          </div>

            </div>
            <div
              id="horizontal-alignment-2"
              class="hidden"
              role="tabpanel"
              aria-labelledby="horizontal-alignment-item-2"
            >
              <p class="text-gray-500">
                This is the
                <em class="font-semibold text-gray-800">second</em> item's tab
                body.
              </p>
            </div>
          </div>
        </div>
        <div class="flex justify-center items-center gap-x-2 py-3 px-4">
          <button
            type="button"
            class="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
          >
            เข้าสู่ระบบ
          </button>
        </div>
      </div>
    </div>
  </div>
  <slot />
  <Footer />
</template>
