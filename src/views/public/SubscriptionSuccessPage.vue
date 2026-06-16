<template>
  <v-container fluid class="status-page pa-0">
    <section class="status-section success-bg">
      <div class="hero-glow hero-glow-one"></div>
      <div class="hero-glow hero-glow-two"></div>

      <v-container class="status-content">
        <v-row justify="center">
          <v-col cols="12" md="7" lg="5">
            <v-card class="status-card animate-item" rounded="xl" elevation="14">
              <v-avatar color="success" size="86" class="mb-6 status-avatar">
                <v-icon color="white" size="48">mdi-check-bold</v-icon>
              </v-avatar>

              <h1>Subscription Activated</h1>

              <p>
                Your payment has been verified successfully. Your ERP subscription
                is now active and ready to use.
              </p>

              <div class="status-list">
                <div v-for="item in successItems" :key="item">
                  <v-icon color="success" size="20">mdi-check-circle</v-icon>
                  <span>{{ item }}</span>
                </div>
              </div>

              <div class="d-flex justify-center flex-wrap ga-3 mt-7">
                <v-btn color="primary" size="large" rounded="xl" to="/login">
                  Login to ERP
                </v-btn>

                <v-btn variant="outlined" size="large" rounded="xl" to="/">
                  Go to Home
                </v-btn>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>
  </v-container>
</template>

<script setup>
import { onMounted, nextTick, onUnmounted } from 'vue'

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)
const successItems = [
  'Payment verified securely',
  'Subscription activated',
  'License generated',
  'ERP access enabled'
]

const setupRevealAnimation = () => {
  const elements = document.querySelectorAll('.animate-item')

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        entry.target.classList.toggle('show', entry.isIntersecting)
      })
    },
    { threshold: 0.12 }
  )

  elements.forEach(el => observer.observe(el))
}

onMounted(setupRevealAnimation)

// GSAP page animation setup
let pageGsapContext = null

const initPageGsapAnimations = async () => {
  await nextTick()

  pageGsapContext?.revert()

  pageGsapContext = gsap.context(() => {
    const revealSelectors = [
      '.gsap-animate',
      '.animate-item',
      '.reveal-up',
      '.reveal-left',
      '.reveal-right',
      '.section-heading',
      '.hero-card',
      '.dashboard-card',
      '.story-card',
      '.mission-card',
      '.business-card',
      '.feature-card',
      '.stat-card',
      '.problem-card',
      '.process-card',
      '.pricing-preview-card',
      '.faq-panels',
      '.final-cta-card',
      '.checkout-card',
      '.summary-card',
      '.secure-card',
      '.contact-card',
      '.glass-card',
      '.plan-card',
      '.demo-card',
      '.info-card',
      '.policy-card',
      '.status-card'
    ]

    const elements = gsap.utils.toArray(revealSelectors.join(','))
      .filter((element, index, array) => array.indexOf(element) === index)

    elements.forEach((element, index) => {
      gsap.fromTo(
        element,
        {
          autoAlpha: 0,
          y: 42,
          scale: 0.985
        },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.85,
          ease: 'power3.out',
          delay: index < 4 ? index * 0.06 : 0,
          scrollTrigger: {
            trigger: element,
            start: 'top 88%',
            once: true
          }
        }
      )
    })

    gsap.fromTo(
      '.hero-glow',
      { autoAlpha: 0, scale: 0.82 },
      {
        autoAlpha: 1,
        scale: 1,
        duration: 1.15,
        ease: 'power3.out',
        stagger: 0.12
      }
    )
  })
}

onMounted(() => {
  initPageGsapAnimations()
})

onUnmounted(() => {
  pageGsapContext?.revert()
})

</script>

<style scoped>
.status-page {
  overflow: hidden;
  background: rgb(var(--v-theme-background));
}

.status-section {
  min-height: calc(100vh - 76px);
  position: relative;
  display: flex;
  align-items: center;
  padding: 80px 0;
}

.success-bg {
  background:
    radial-gradient(circle at top left, rgba(var(--v-theme-success), 0.18), transparent 34%),
    radial-gradient(circle at 90% 12%, rgba(var(--v-theme-primary), 0.14), transparent 30%),
    rgb(var(--v-theme-background));
}

.status-content {
  position: relative;
  z-index: 2;
}

.hero-glow {
  position: absolute;
  border-radius: 999px;
  filter: blur(70px);
  opacity: 0.42;
  pointer-events: none;
}

.hero-glow-one {
  width: 360px;
  height: 360px;
  background: rgba(var(--v-theme-success), 0.4);
  top: -110px;
  left: -100px;
}

.hero-glow-two {
  width: 390px;
  height: 390px;
  background: rgba(var(--v-theme-primary), 0.35);
  right: -120px;
  bottom: -150px;
}

.status-card {
  text-align: center;
  padding: 44px 34px;
  background: rgba(var(--v-theme-surface), 0.94);
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  backdrop-filter: blur(14px);
}

.status-avatar {
  box-shadow: 0 18px 40px rgba(var(--v-theme-success), 0.3);
}

.status-card h1 {
  font-size: clamp(32px, 5vw, 48px);
  font-weight: 950;
  line-height: 1.08;
  color: rgb(var(--v-theme-on-background));
}

.status-card p {
  margin: 16px auto 0;
  max-width: 520px;
  color: rgba(var(--v-theme-on-background), 0.72);
  line-height: 1.8;
}

.status-list {
  display: grid;
  gap: 12px;
  margin-top: 26px;
  text-align: left;
}

.status-list div {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(var(--v-theme-success), 0.08);
  border: 1px solid rgba(var(--v-theme-success), 0.16);
  color: rgba(var(--v-theme-on-surface), 0.78);
  font-weight: 700;
}

@media (max-width: 600px) {
  .status-section {
    padding: 54px 0;
  }

  .status-card {
    padding: 32px 24px;
  }
}


/* GSAP animation helper: keeps elements visible before GSAP takes over */
.gsap-animate {
  will-change: transform, opacity;
}

</style>