<template>
  <v-container ref="pageRoot" fluid class="pricing-page pa-0">
    <section class="pricing-hero">
      <div class="hero-glow hero-glow-one"></div>
      <div class="hero-glow hero-glow-two"></div>

      <v-container class="position-relative">
        <div class="pricing-heading gsap-animate">
          <v-chip color="primary" variant="flat" class="mb-5">
            <v-icon start size="18">mdi-currency-inr</v-icon>
            Simple Annual Pricing
          </v-chip>

          <h1>Choose the Best Plan for Your School</h1>

          <p>
            Start with a 15 days free demo with all major features enabled.
            Monthly price is shown for affordability, but billing is yearly.
          </p>

          <div class="billing-pill mt-7">
            <v-icon color="success" size="20">mdi-check-circle</v-icon>
            <span>Monthly price shown for affordability. Billing is yearly.</span>
          </div>
        </div>
      </v-container>
    </section>

    <section class="demo-section">
      <v-container>
        <v-card class="demo-card gsap-animate" rounded="xl" elevation="12">
          <v-row align="center">
            <v-col cols="12" md="8">
              <v-chip color="success" variant="flat" class="mb-4">
                <v-icon start size="18">mdi-gift</v-icon>
                {{ trialPlan?.name || '15 Days Free Demo' }}
              </v-chip>

              <h2>Try Before You Subscribe</h2>

              <p>
                Get full access to Question Bank, Blueprint Management, Bloom Distribution,
                Auto Paper Generator, Teacher Tasks, PDF Export and Reports.
              </p>

              <div class="demo-features">
                <div v-for="feature in trialFeatures" :key="feature">
                  <v-icon color="success" size="18">mdi-check-circle</v-icon>
                  <span>{{ feature }}</span>
                </div>
              </div>
            </v-col>

            <v-col cols="12" md="4" class="text-md-end">
              <div class="free-price">₹0</div>
              <div class="text-medium-emphasis mb-5">
                {{ trialPlan?.trial_days || 15 }} days free access
              </div>

              <v-btn color="success" size="large" rounded="xl" to="/contact">
                Request Free Demo
              </v-btn>
            </v-col>
          </v-row>
        </v-card>
      </v-container>
    </section>

    <section class="plans-section">
      <v-container>
        <div class="section-heading gsap-animate">
          <v-chip color="primary" variant="tonal" class="mb-3">
            Subscription Plans
          </v-chip>

          <h2>Annual Plans for Every Institution</h2>

          <p>
            Select a plan based on your school size, users, and automation requirement.
          </p>
        </div>

        <v-row v-if="loading">
          <v-col v-for="i in 3" :key="i" cols="12" md="4">
            <v-skeleton-loader type="card" class="rounded-xl" />
          </v-col>
        </v-row>

        <v-alert
          v-else-if="!paidPlans.length"
          type="warning"
          variant="tonal"
          rounded="xl"
        >
          No paid subscription plans found. Please run SubscriptionPlanSeeder.
        </v-alert>

        <div v-else class="pricing-swiper-wrap gsap-animate">
          <Swiper
            :modules="swiperModules"
            :slides-per-view="1.08"
            :space-between="22"
            :centered-slides="true"
            :loop="paidPlans.length > 3"
            :speed="850"
            :autoplay="{
              delay: 3600,
              disableOnInteraction: true,
              pauseOnMouseEnter: true
            }"
            :pagination="{ clickable: true }"
            :observer="true"
            :observe-parents="true"
            :breakpoints="{
              600: {
                slidesPerView: 1.35,
                spaceBetween: 24,
                centeredSlides: true
              },
              900: {
                slidesPerView: 2,
                spaceBetween: 26,
                centeredSlides: false
              },
              1280: {
                slidesPerView: 3,
                spaceBetween: 30,
                centeredSlides: false
              }
            }"
            class="pricing-swiper"
          >
            <SwiperSlide v-for="plan in paidPlans" :key="plan.id">
              <v-card
                class="plan-card h-100"
                :class="{ 'popular-plan': plan.is_popular }"
                rounded="xl"
                elevation="8"
              >
                <div v-if="plan.is_popular" class="popular-ribbon">
                  Recommended
                </div>

                <div class="plan-head">
                  <v-avatar
                    :color="planColor(plan.slug)"
                    rounded="lg"
                    size="60"
                    class="mb-4"
                  >
                    <v-icon color="white" size="32">
                      {{ planIcon(plan.slug) }}
                    </v-icon>
                  </v-avatar>

                  <h3>{{ plan.name }}</h3>
                  <p>{{ planSubtitle(plan) }}</p>
                </div>

                <div class="price-box">
                  <div class="monthly-label">
                    {{ plan.slug === 'lifetime' ? 'One Time Payment' : 'Starting at' }}
                  </div>

                  <div class="monthly-price">
                    <template v-if="plan.slug === 'lifetime'">
                      ₹{{ formatAmount(plan.yearly_price) }}
                      <span>one-time</span>
                    </template>

                    <template v-else>
                      ₹{{ formatAmount(plan.monthly_display_price) }}
                      <span>/month</span>
                    </template>
                  </div>

                  <div v-if="plan.slug !== 'lifetime'" class="yearly-price">
                    Yearly billing:
                    <strong>₹{{ formatAmount(plan.yearly_price) }}</strong>
                  </div>

                  <div v-else class="yearly-price">
                    Lifetime license:
                    <strong>₹{{ formatAmount(plan.yearly_price) }}</strong>
                  </div>

                  <v-chip
                    v-if="plan.yearly_saving > 0"
                    color="success"
                    variant="tonal"
                    size="small"
                    class="mt-3"
                  >
                    Save ₹{{ formatAmount(plan.yearly_saving) }} yearly
                  </v-chip>
                </div>

                <v-btn
                  :color="plan.is_popular ? 'primary' : 'secondary'"
                  :variant="plan.is_popular ? 'flat' : 'outlined'"
                  block
                  size="large"
                  rounded="xl"
                  class="mt-6"
                  :to="`/checkout?plan=${plan.slug}`"
                >
                  Subscribe Now
                </v-btn>

                <v-divider class="my-6" />

                <div class="feature-list">
                  <div
                    v-for="feature in plan.features"
                    :key="feature"
                    class="feature-item"
                  >
                    <v-icon color="success" size="19">
                      mdi-check-circle
                    </v-icon>
                    <span>{{ feature }}</span>
                  </div>
                </div>
              </v-card>
            </SwiperSlide>
          </Swiper>
        </div>
      </v-container>
    </section>

    <section class="addons-section">
      <v-container>
        <v-row align="stretch">
          <v-col cols="12" md="6">
            <v-card class="info-card gsap-animate h-100" rounded="xl" elevation="6">
              <v-icon color="primary" size="42" class="mb-4">
                mdi-shield-check
              </v-icon>

              <h2>What Every Paid Plan Includes</h2>

              <div
                v-for="item in commonFeatures"
                :key="item"
                class="included-item"
              >
                <v-icon color="success" size="20">mdi-check-decagram</v-icon>
                <span>{{ item }}</span>
              </div>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card class="info-card gsap-animate h-100" rounded="xl" elevation="6">
              <v-icon color="warning" size="42" class="mb-4">
                mdi-puzzle-plus
              </v-icon>

              <h2>Optional Add-ons</h2>

              <div class="addon-list">
                <div
                  v-for="addon in addons"
                  :key="addon.name"
                  class="addon-item"
                >
                  <span>{{ addon.name }}</span>
                  <strong>{{ addon.price }}</strong>
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <section class="faq-section">
      <v-container>
        <div class="section-heading gsap-animate">
          <v-chip color="info" variant="tonal" class="mb-3">
            Pricing FAQ
          </v-chip>

          <h2>Questions About Subscription?</h2>

          <p>
            Clear answers before your school starts the demo or yearly subscription.
          </p>
        </div>

        <v-row justify="center">
          <v-col cols="12" md="9">
            <v-expansion-panels variant="accordion" class="faq-panels gsap-animate">
              <v-expansion-panel
                v-for="faq in faqs"
                :key="faq.question"
                rounded="xl"
              >
                <v-expansion-panel-title>
                  {{ faq.question }}
                </v-expansion-panel-title>

                <v-expansion-panel-text>
                  {{ faq.answer }}
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <section class="final-cta">
      <v-container>
        <v-card class="final-cta-card gsap-animate" rounded="xl" elevation="14">
          <h2>Not Sure Which Plan Is Right?</h2>

          <p>
            Start with the free demo. We will guide you based on your school size,
            users and academic workflow.
          </p>

          <div class="d-flex justify-center flex-wrap ga-3 mt-6">
            <v-btn color="primary" size="large" rounded="xl" to="/contact">
              Book Free Demo
            </v-btn>

            <v-btn variant="outlined" size="large" rounded="xl" to="/contact">
              Talk to Sales
            </v-btn>
          </div>
        </v-card>
      </v-container>
    </section>
  </v-container>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Autoplay, Navigation, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/vue'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

import api from '../../plugins/api'
import { useSettings } from '../../composables/useSettings'

gsap.registerPlugin(ScrollTrigger)

const { fetchSettings } = useSettings()

const pageRoot = ref(null)
const loading = ref(false)
const plans = ref([])
const swiperModules = [Autoplay, Navigation, Pagination]

let pageGsapContext = null

const fetchPlans = async () => {
  loading.value = true

  try {
    const response = await api.get('/public/plans')
    plans.value = response.data.data || []
  } catch (error) {
    console.error('Unable to load plans:', error)
  } finally {
    loading.value = false
    await nextTick()
    initPageGsapAnimations()
  }
}

const normalizedPlans = computed(() => {
  return plans.value.map((plan) => ({
    ...plan,
    is_trial: Boolean(plan.is_trial),
    is_popular: Boolean(plan.is_popular),
    is_active: Boolean(plan.is_active),
    monthly_display_price: Number(plan.monthly_display_price || 0),
    yearly_price: Number(plan.yearly_price || 0),
    yearly_saving: Number(plan.yearly_saving || 0),
    trial_days: Number(plan.trial_days || 0),
    features: normalizedFeatures(plan.features),
  }))
})

const trialPlan = computed(() => {
  return normalizedPlans.value.find(plan => plan.is_trial)
})

const paidPlans = computed(() => {
  return normalizedPlans.value
    .filter(plan => !plan.is_trial && plan.is_active)
    .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
})

const trialFeatures = computed(() => {
  return trialPlan.value?.features?.length
    ? trialPlan.value.features
    : demoFeatures
})

const demoFeatures = [
  'All major features enabled',
  'Question Bank Management',
  'Blueprint Based Paper Creation',
  "Bloom's Taxonomy Distribution",
  'Auto Paper Generator',
  'Teacher Task Management',
  'PDF Export',
]

const commonFeatures = [
  'Secure Admin and Teacher Login',
  'Question Bank Management',
  'Blueprint Based Validation',
  'PDF Export and Print',
  'Teacher Workflow Support',
  'Subscription and License Tracking',
]

const addons = [
  { name: 'Installation & Training', price: '₹10,000' },
  { name: 'Data Migration', price: '₹15,000' },
  { name: 'Custom Reports', price: '₹10,000 onwards' },
  { name: 'Custom Branding', price: '₹5,000' },
  { name: 'Question Bank Digitization', price: '₹2,000 / subject' },
  { name: 'Custom Features', price: 'As per requirement' },
]

const faqs = [
  {
    question: 'Is the 15 days demo free?',
    answer: 'Yes, the demo is free and includes all major ERP features so your school can test the complete workflow.',
  },
  {
    question: 'Is billing monthly or yearly?',
    answer: 'The monthly price is shown for affordability, but the actual billing is yearly.',
  },
  {
    question: 'Can we upgrade later?',
    answer: 'Yes, you can upgrade from Essential to Professional or Enterprise based on your institution requirement.',
  },
  {
    question: 'Do you provide setup support?',
    answer: 'Yes, setup, training, data migration and custom branding are available as optional services.',
  },
]

const normalizedFeatures = (features) => {
  if (!features) return []

  if (Array.isArray(features)) {
    return features
  }

  if (typeof features === 'string') {
    try {
      return JSON.parse(features)
    } catch {
      return features
        .split(',')
        .map(item => item.trim())
        .filter(Boolean)
    }
  }

  return []
}

const formatAmount = (amount) => {
  return Number(amount || 0).toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  })
}

const planIcon = (slug) => {
  const icons = {
    essential: 'mdi-seed',
    professional: 'mdi-rocket-launch',
    enterprise: 'mdi-domain',
    lifetime: 'mdi-infinity',
  }

  return icons[slug] || 'mdi-card-account-details-star'
}

const planColor = (slug) => {
  const colors = {
    essential: 'success',
    professional: 'primary',
    enterprise: 'deep-purple',
    lifetime: 'warning',
  }

  return colors[slug] || 'primary'
}

const planSubtitle = (plan) => {
  const subtitles = {
    essential: 'For small schools starting digital question paper creation.',
    professional: 'Best for CBSE and ICSE schools needing full automation.',
    enterprise: 'For school groups and institutions needing advanced control.',
    lifetime: 'One-time license for institutions preferring lifetime usage.',
  }

  return subtitles[plan.slug] || `${plan.duration_days} days access for your institution.`
}

const initPageGsapAnimations = async () => {
  await nextTick()

  pageGsapContext?.revert()

  pageGsapContext = gsap.context(() => {
    gsap.fromTo(
      '.hero-glow',
      {
        autoAlpha: 0,
        scale: 0.75,
      },
      {
        autoAlpha: 1,
        scale: 1,
        duration: 1.15,
        ease: 'power3.out',
        stagger: 0.12,
      }
    )

    const elements = gsap.utils.toArray('.gsap-animate')

    elements.forEach((element, index) => {
      gsap.fromTo(
        element,
        {
          autoAlpha: 0,
          y: 46,
          scale: 0.985,
        },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.85,
          ease: 'power3.out',
          delay: index < 3 ? index * 0.08 : 0,
          scrollTrigger: {
            trigger: element,
            start: 'top 88%',
            once: true,
          },
        }
      )
    })
  }, pageRoot.value)
}

onMounted(async () => {
  fetchSettings()
  await fetchPlans()
})

onUnmounted(() => {
  pageGsapContext?.revert()
  ScrollTrigger.getAll().forEach(trigger => trigger.kill())
})
</script>

<style scoped>
.pricing-page {
  overflow: hidden;
  background:
    radial-gradient(circle at top left, rgba(var(--v-theme-primary), 0.16), transparent 34%),
    radial-gradient(circle at 90% 12%, rgba(124, 58, 237, 0.14), transparent 30%),
    rgb(var(--v-theme-background));
}

.pricing-hero {
  position: relative;
  padding: 90px 0 76px;
  background:
    linear-gradient(135deg, rgba(var(--v-theme-primary), 0.13), rgba(124, 58, 237, 0.07)),
    rgb(var(--v-theme-surface));
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.position-relative {
  position: relative;
  z-index: 2;
}

.hero-glow {
  position: absolute;
  border-radius: 999px;
  filter: blur(70px);
  opacity: 0.45;
  pointer-events: none;
}

.hero-glow-one {
  width: 340px;
  height: 340px;
  background: rgba(var(--v-theme-primary), 0.42);
  top: -110px;
  left: -100px;
}

.hero-glow-two {
  width: 390px;
  height: 390px;
  background: rgba(124, 58, 237, 0.38);
  right: -120px;
  bottom: -160px;
}

.pricing-heading {
  max-width: 880px;
  margin: 0 auto;
  text-align: center;
}

.pricing-heading h1 {
  font-size: clamp(40px, 6vw, 68px);
  font-weight: 950;
  line-height: 1.05;
  letter-spacing: -2px;
  color: rgb(var(--v-theme-on-background));
}

.pricing-heading p {
  max-width: 760px;
  margin: 20px auto 0;
  color: rgba(var(--v-theme-on-background), 0.72);
  font-size: 18px;
  line-height: 1.8;
}

.billing-pill {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  border-radius: 999px;
  background: rgba(var(--v-theme-surface), 0.76);
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  font-weight: 700;
  color: rgba(var(--v-theme-on-surface), 0.78);
}

.section-heading {
  text-align: center;
  max-width: 850px;
  margin: 0 auto 44px;
  padding: 0 16px;
  background: transparent !important;
  border: none !important;
}


.demo-section {
  padding: 44px 0;
}

.demo-card {
  padding: 34px;
  background:
    radial-gradient(circle at top right, rgba(var(--v-theme-success), 0.13), transparent 42%),
    rgba(var(--v-theme-surface), 0.92);
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.demo-card h2,
.section-heading h2,
.info-card h2,
.final-cta-card h2 {
  font-size: clamp(28px, 4vw, 44px);
  font-weight: 950;
  line-height: 1.14;
  letter-spacing: -1px;
  color: rgb(var(--v-theme-on-background));
}

.demo-card p,
.section-heading p,
.final-cta-card p {
  color: rgba(var(--v-theme-on-background), 0.7);
  line-height: 1.8;
}

.demo-features {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 18px;
  margin-top: 20px;
}

.demo-features div,
.included-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(var(--v-theme-on-surface), 0.78);
  font-weight: 600;
}

.free-price {
  font-size: 54px;
  font-weight: 950;
  line-height: 1;
  color: rgb(var(--v-theme-success));
}

.plans-section {
  padding: 70px 0 90px;
}

.section-heading {
  text-align: center;
  max-width: 820px;
  margin: 0 auto 44px;
  padding: 0 16px;
}

.pricing-swiper-wrap {
  position: relative;
  max-width: 1480px;
  margin: 0 auto;
}

.pricing-swiper {
  width: 100%;
  padding: 18px 18px 72px;
}

:deep(.swiper-wrapper) {
  align-items: stretch;
}

:deep(.swiper-slide) {
  height: auto;
  display: flex;
  transition: transform 0.35s ease, opacity 0.35s ease;
}

:deep(.swiper-slide > *) {
  width: 100%;
}

:deep(.swiper-button-next),
:deep(.swiper-button-prev) {
  width: 46px;
  height: 46px;
  border-radius: 999px;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-primary));
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.14);
}

:deep(.swiper-button-next::after),
:deep(.swiper-button-prev::after) {
  font-size: 17px;
  font-weight: 900;
}

:deep(.swiper-pagination-bullet) {
  width: 9px;
  height: 9px;
  background: rgba(var(--v-theme-primary), 0.5);
}

:deep(.swiper-pagination-bullet-active) {
  width: 26px;
  border-radius: 999px;
  background: rgb(var(--v-theme-primary));
}

.plan-card {
  position: relative;
  width: 100%;
  min-height: 720px;
  padding: 34px;
  background: rgba(var(--v-theme-surface), 0.94);
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  overflow: hidden;
  transition: 0.35s ease;
}

.plan-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 24px 54px rgba(0, 0, 0, 0.18);
}

.popular-plan {
  border: 2px solid rgba(var(--v-theme-primary), 0.85);
  box-shadow: 0 24px 60px rgba(var(--v-theme-primary), 0.2);
}

.popular-ribbon {
  position: absolute;
  top: 22px;
  right: -42px;
  background: rgb(var(--v-theme-primary));
  color: white;
  padding: 7px 48px;
  transform: rotate(35deg);
  font-size: 12px;
  font-weight: 900;
  z-index: 2;
}

.plan-head h3 {
  font-size: 27px;
  font-weight: 950;
}

.plan-head p {
  margin-top: 8px;
  color: rgba(var(--v-theme-on-surface), 0.66);
  min-height: 56px;
  line-height: 1.55;
}

.price-box {
  margin-top: 24px;
  padding: 22px;
  border-radius: 24px;
  background: rgba(var(--v-theme-primary), 0.06);
  border: 1px solid rgba(var(--v-theme-primary), 0.16);
}

.monthly-label {
  font-size: 13px;
  font-weight: 800;
  color: rgba(var(--v-theme-on-surface), 0.62);
  margin-bottom: 5px;
}

.monthly-price {
  font-size: 38px;
  font-weight: 950;
  color: rgb(var(--v-theme-on-surface));
}

.monthly-price span {
  font-size: 14px;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.62);
}

.yearly-price {
  margin-top: 7px;
  color: rgba(var(--v-theme-on-surface), 0.7);
  font-size: 14px;
}

.feature-list {
  display: grid;
  gap: 13px;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  color: rgba(var(--v-theme-on-surface), 0.76);
  font-size: 14px;
  line-height: 1.55;
}

.addons-section {
  padding: 74px 0;
  background:
    linear-gradient(135deg, rgba(var(--v-theme-primary), 0.07), rgba(124, 58, 237, 0.05)),
    rgb(var(--v-theme-surface));
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.info-card {
  padding: 32px;
  background: rgba(var(--v-theme-surface), 0.92);
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.info-card h2 {
  margin-bottom: 22px;
}

.included-item {
  margin-bottom: 14px;
}

.addon-list {
  display: grid;
  gap: 12px;
}

.addon-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(var(--v-theme-primary), 0.06);
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  color: rgba(var(--v-theme-on-surface), 0.78);
}

.addon-item strong {
  color: rgb(var(--v-theme-on-surface));
  white-space: nowrap;
}

.faq-section {
  padding: 76px 0;
  background:
    radial-gradient(circle at top, rgba(var(--v-theme-primary), 0.10), transparent 36%),
    rgb(var(--v-theme-background));
}

.faq-panels :deep(.v-expansion-panel) {
  margin-bottom: 12px;
  border-radius: 18px !important;
  background: rgba(var(--v-theme-surface), 0.92) !important;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.faq-panels :deep(.v-expansion-panel-title) {
  font-weight: 800;
  color: rgb(var(--v-theme-on-surface));
}

.faq-panels :deep(.v-expansion-panel-text) {
  color: rgba(var(--v-theme-on-surface), 0.74);
}

.final-cta {
  padding: 30px 0 86px;
}

.final-cta-card {
  text-align: center;
  padding: 54px 28px;
  background:
    radial-gradient(circle at top, rgba(var(--v-theme-primary), 0.2), transparent 46%),
    linear-gradient(135deg, rgba(var(--v-theme-primary), 0.08), rgba(124, 58, 237, 0.08)),
    rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.gsap-animate {
  will-change: transform, opacity;
}

@media (max-width: 600px) {
  .pricing-hero {
    padding: 58px 0 48px;
  }

  .demo-card,
  .plan-card,
  .info-card,
  .final-cta-card {
    padding: 24px;
  }

  .plan-card {
    min-height: auto;
  }

  .plans-section,
  .addons-section,
  .faq-section {
    padding: 52px 0;
  }

  .pricing-swiper {
    padding-left: 4px;
    padding-right: 4px;
  }

  .addon-item {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>