<template>
  <section class="public-showcase-section">
    <v-container>
      <div class="showcase-heading">
        <v-chip color="primary" variant="flat" class="mb-4">
          <v-icon start size="18">mdi-star-four-points</v-icon>
          Platform Highlights
        </v-chip>

        <h2>Everything your assessment workflow needs</h2>
        <p>
          Explore the features that make YouTutor ERP useful for schools, teachers,
          academic coordinators, and SaaS customers.
        </p>
      </div>

      <Swiper
        :modules="swiperModules"
        :slides-per-view="1"
        :space-between="22"
        :loop="true"
        :speed="850"
        :autoplay="autoplayOptions"
        :pagination="paginationOptions"
        :breakpoints="breakpoints"
        :observer="true"
        :observe-parents="true"
        :watch-slides-progress="true"
        class="feature-swiper"
      >
        <SwiperSlide v-for="feature in features" :key="feature.title">
          <v-card class="showcase-card" rounded="xl" elevation="8">
            <div class="showcase-icon-wrap">
              <v-icon size="34" color="white">{{ feature.icon }}</v-icon>
            </div>

            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>

            <div class="showcase-stat">
              <span>{{ feature.stat }}</span>
              <small>{{ feature.caption }}</small>
            </div>
          </v-card>
        </SwiperSlide>
      </Swiper>
    </v-container>
  </section>
</template>

<script setup>
import { Autoplay, Navigation, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/vue'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const swiperModules = [Autoplay, Navigation, Pagination]

const autoplayOptions = {
  delay: 3300,
  disableOnInteraction: false,
  pauseOnMouseEnter: true
}

const paginationOptions = {
  clickable: true
}

const navigationOptions = true

const breakpoints = {
  0: {
    slidesPerView: 1,
    spaceBetween: 18
  },
  720: {
    slidesPerView: 2,
    spaceBetween: 22
  },
  1180: {
    slidesPerView: 3,
    spaceBetween: 24
  }
}

const features = [
  {
    icon: 'mdi-bank-outline',
    title: 'SaaS Ready Platform',
    description: 'Demo enquiries, subscriptions, license keys and Razorpay payment workflow are connected inside one platform.',
    stat: '15 Days',
    caption: 'free demo enabled'
  },
  {
    icon: 'mdi-file-tree-outline',
    title: 'Blueprint Compliance',
    description: 'Section-wise, marks-wise, question-type, Bloom and difficulty rules help papers stay academically valid.',
    stat: 'Strict',
    caption: 'paper validation'
  },
  {
    icon: 'mdi-brain',
    title: 'Bloom Taxonomy',
    description: 'Remember, Understand, Apply, Analyze, Evaluate and Create levels support smarter assessment planning.',
    stat: '6 Levels',
    caption: 'academic mapping'
  },
  {
    icon: 'mdi-account-tie-outline',
    title: 'Teacher Workflow',
    description: 'Assign question tasks, exam portions, lessons and due dates while tracking teacher progress in real time.',
    stat: 'Live',
    caption: 'progress tracking'
  },
  {
    icon: 'mdi-auto-fix',
    title: 'Auto Paper Generator',
    description: 'Generate papers from blueprint rules and export print-ready PDFs with preview support.',
    stat: 'Fast',
    caption: 'paper creation'
  }
]
</script>

<style scoped>
.public-showcase-section {
  position: relative;
  padding: 72px 0;
  overflow: hidden;
  background:
    radial-gradient(circle at 10% 10%, rgba(var(--v-theme-primary), 0.1), transparent 32%),
    linear-gradient(180deg, rgba(var(--v-theme-surface), 0.96), rgba(var(--v-theme-background), 1));
}

.showcase-heading {
  max-width: 760px;
  margin: 0 auto 32px;
  text-align: center;
}

.showcase-heading h2 {
  font-size: clamp(30px, 4vw, 46px);
  font-weight: 950;
  letter-spacing: -1.2px;
  color: rgb(var(--v-theme-on-background));
}

.showcase-heading p {
  margin-top: 14px;
  font-size: 17px;
  line-height: 1.75;
  color: rgba(var(--v-theme-on-background), 0.72);
}

.feature-swiper {
  width: 100%;
  padding: 12px 12px 58px;
}

:deep(.swiper-wrapper) {
  align-items: stretch;
}

:deep(.swiper-slide) {
  height: auto;
  display: flex;
}

.showcase-card {
  width: 100%;
  min-height: 292px;
  padding: 28px;
  overflow: hidden;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  background: rgba(var(--v-theme-surface), 0.92) !important;
}

.showcase-card::after {
  content: '';
  position: absolute;
  right: -50px;
  top: -50px;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: rgba(var(--v-theme-primary), 0.12);
}

.showcase-icon-wrap {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 22px;
  border-radius: 20px;
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)), rgb(var(--v-theme-secondary)));
  box-shadow: 0 16px 32px rgba(var(--v-theme-primary), 0.25);
}

.showcase-card h3,
.showcase-card p,
.showcase-stat {
  position: relative;
  z-index: 1;
}

.showcase-card h3 {
  font-size: 22px;
  font-weight: 900;
  margin-bottom: 12px;
  color: rgb(var(--v-theme-on-surface));
}

.showcase-card p {
  color: rgba(var(--v-theme-on-surface), 0.72);
  line-height: 1.65;
}

.showcase-stat {
  display: inline-flex;
  flex-direction: column;
  gap: 1px;
  margin-top: 18px;
  padding: 10px 14px;
  border-radius: 16px;
  background: rgba(var(--v-theme-primary), 0.1);
}

.showcase-stat span {
  font-size: 22px;
  font-weight: 950;
  color: rgb(var(--v-theme-primary));
}

.showcase-stat small {
  color: rgba(var(--v-theme-on-surface), 0.65);
}

:deep(.swiper-button-next),
:deep(.swiper-button-prev) {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-primary));
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
}

:deep(.swiper-button-next::after),
:deep(.swiper-button-prev::after) {
  font-size: 16px;
  font-weight: 900;
}

:deep(.swiper-pagination-bullet) {
  background: rgba(var(--v-theme-primary), 0.55);
}

:deep(.swiper-pagination-bullet-active) {
  background: rgb(var(--v-theme-primary));
}
</style>