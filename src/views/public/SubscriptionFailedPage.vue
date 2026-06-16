<template>
  <v-container fluid class="status-page pa-0">
    <section class="status-section failed-bg">
      <div class="hero-glow hero-glow-one"></div>
      <div class="hero-glow hero-glow-two"></div>

      <v-container class="status-content">
        <v-row justify="center">
          <v-col cols="12" md="7" lg="5">
            <v-card
              class="status-card animate-item"
              rounded="xl"
              elevation="14"
            >
              <v-avatar
                color="error"
                size="86"
                class="mb-6 status-avatar"
              >
                <v-icon color="white" size="48">
                  mdi-close-thick
                </v-icon>
              </v-avatar>

              <h1>Payment Failed</h1>

              <p>
                We could not complete your subscription activation because
                the payment was unsuccessful or verification failed.
              </p>

              <v-alert
                color="error"
                variant="tonal"
                rounded="lg"
                class="my-5"
              >
                No amount will be deducted if the payment was not completed.
              </v-alert>

              <div class="status-list">
                <div
                  v-for="item in failedItems"
                  :key="item"
                >
                  <v-icon color="error" size="20">
                    mdi-alert-circle
                  </v-icon>

                  <span>{{ item }}</span>
                </div>
              </div>

              <div class="d-flex justify-center flex-wrap ga-3 mt-7">
                <v-btn
                  color="primary"
                  size="large"
                  rounded="xl"
                  to="/checkout"
                >
                  Try Again
                </v-btn>

                <v-btn
                  variant="outlined"
                  size="large"
                  rounded="xl"
                  to="/contact"
                >
                  Contact Support
                </v-btn>
              </div>

              <div class="support-box mt-8">
                <v-icon color="primary" size="22">
                  mdi-headset
                </v-icon>

                <span>
                  If money was deducted but subscription was not activated,
                  please contact our support team with your payment details.
                </span>
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
const failedItems = [
  'Payment was cancelled by user',
  'Bank or UPI transaction failed',
  'Payment verification failed',
  'Subscription not activated',
  'You can retry payment safely'
]

const setupRevealAnimation = () => {
  const elements = document.querySelectorAll('.animate-item')

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle('show', entry.isIntersecting)
      })
    },
    {
      threshold: 0.12
    }
  )

  elements.forEach((el) => observer.observe(el))
}

onMounted(() => {
  setupRevealAnimation()
})

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

.failed-bg {
  background:
    radial-gradient(circle at top left,
      rgba(var(--v-theme-error), 0.18),
      transparent 34%),
    radial-gradient(circle at 90% 12%,
      rgba(var(--v-theme-warning), 0.14),
      transparent 30%),
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
  background: rgba(var(--v-theme-error), 0.4);
  top: -110px;
  left: -100px;
}

.hero-glow-two {
  width: 390px;
  height: 390px;
  background: rgba(var(--v-theme-warning), 0.35);
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
  box-shadow: 0 18px 40px rgba(var(--v-theme-error), 0.3);
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
  background: rgba(var(--v-theme-error), 0.08);
  border: 1px solid rgba(var(--v-theme-error), 0.16);
  color: rgba(var(--v-theme-on-surface), 0.78);
  font-weight: 700;
}

.support-box {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 16px;
  border-radius: 16px;
  background: rgba(var(--v-theme-primary), 0.08);
  border: 1px solid rgba(var(--v-theme-primary), 0.15);
  text-align: left;
  color: rgba(var(--v-theme-on-surface), 0.75);
}

@media (max-width: 600px) {
  .status-section {
    padding: 54px 0;
  }

  .status-card {
    padding: 32px 24px;
  }

  .support-box {
    flex-direction: column;
  }
}


/* GSAP animation helper: keeps elements visible before GSAP takes over */
.gsap-animate {
  will-change: transform, opacity;
}

</style>