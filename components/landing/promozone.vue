<script setup lang="ts">
    const promoText = [
        {
            tilte: 'ระบบการเรียนรู้ที่ออกแบบมาเพื่อคุณ',
            description:
                'LearnLab เข้าใจว่าทุกคนเรียนรู้ไม่เหมือนกัน เรามอบระบบการเรียนรู้แบบ Personalized ที่ปรับให้เข้ากับสไตล์การเรียนรู้ เป้าหมายและความสนใจของคุณโดยเฉพาะ ค้นพบหลักสูตรที่ตรงใจ พัฒนาทักษะที่จำเป็น และบรรลุเป้าหมายของคุณได้อย่างมีประสิทธิภาพ',
            image: '/images/learnonline.svg',
            bg_color: 'bg-zinc-100',
            flex_side: 'md:flex-row flex-col',
        },
        {
            tilte: 'ประเมินผลได้รวดเร็วทันใจ',
            description:
                'วัดผลและประเมินผลการเรียนรู้ของคุณได้อย่างรวดเร็วทันใจ ผ่านระบบการทดสอบออนไลน์ วิเคราะห์จุดแข็ง จุดอ่อน และติดตามความคืบหน้าของคุณได้อย่างมีประสิทธิภาพ',
            image: '/images/exam.svg',
            bg_color: 'bg-white',
            flex_side: 'md:flex-row-reverse flex-col',
        },
        {
            tilte: 'เรียนได้ทุกที่ทุกเวลา',
            description:
                'LearnLab มอบอิสระในการเรียนรู้ของคุณ เข้าถึงเนื้อหาการสอน ผ่านอุปกรณ์ต่างๆ ไม่ว่าจะเป็น คอมพิวเตอร์ สมาร์ทโฟน หรือแท็บเล็ต เรียนได้ทุกที่ทุกเวลา โดยไม่ต้องกังวลเรื่องสถานที่และเวลา สะดวก ตอบโจทย์ไลฟ์สไตล์ยุคดิจิทัล',
            image: '/images/man_working_in_front_of_computer.svg',
            bg_color: 'bg-zinc-100',
            flex_side: 'md:flex-row flex-col',
        },
        {
            tilte: 'จัดการระบบได้อย่างง่ายดาย',
            description:
                'LearnLab ใช้งานง่าย สะดวก และรวดเร็ว เข้าถึงเนื้อหาการสอน ติดตามความคืบหน้า จัดการตารางเรียน และสื่อสารกับผู้สอน ผ่านระบบออนไลน์ที่ใช้งานง่าย ช่วยให้คุณจัดการเวลาและวางแผนการเรียนรู้ได้อย่างลงตัว',
            image: '/images/easy_setup.svg',
            bg_color: 'bg-white',
            flex_side: 'md:flex-row-reverse flex-col',
        },
    ]
</script>

<template>
    <div v-for="promo in promoText" class="p-12" :class="promo.bg_color">
        <div
            class="mx-auto flex max-w-screen-xl items-center gap-16"
            :class="promo.flex_side">
            <img :src="promo.image" class="h-64" alt="Learning Online" />
            <div class="flex flex-col">
                <span class="mb-4 text-3xl font-bold">
                    {{ promo.tilte }}
                </span>
                <span class="text-lg">
                    {{ promo.description }}
                </span>
            </div>
        </div>
    </div>
</template>
