<template>
  <v-container fluid class="policy-page pa-0">
    <!-- HERO -->
    <section class="policy-hero">
      <div class="hero-glow hero-glow-one"></div>
      <div class="hero-glow hero-glow-two"></div>

      <v-container class="hero-content">
        <div class="policy-heading animate-item">
          <v-chip color="success" variant="flat" class="mb-5">
            <v-icon start size="18">mdi-shield-lock</v-icon>
            Privacy Policy
          </v-chip>

          <h1>Privacy Policy</h1>

          <p>
            Your privacy and data security are important to us. This policy explains
            how we collect, use and protect your information.
          </p>
        </div>
      </v-container>
    </section>

    <!-- CONTENT -->
    <section class="policy-content">
      <v-container>
        <v-row justify="center">
          <v-col cols="12" lg="9">
            <v-card class="policy-card animate-item" rounded="xl" elevation="10">
              <div class="updated-box mb-6">
                <v-icon color="success" size="22">mdi-calendar-clock</v-icon>
                <span>Last Updated: {{ currentDate }}</span>
              </div>

              <div
                v-for="section in sections"
                :key="section.title"
                class="policy-section animate-item"
              >
                <div class="section-icon">
                  <v-icon color="success" size="24">
                    {{ section.icon }}
                  </v-icon>
                </div>

                <div>
                  <h2>{{ section.title }}</h2>
                  <p>{{ section.text }}</p>
                </div>
              </div>

              <v-divider class="my-8" />

              <v-alert color="success" variant="tonal" rounded="lg">
                We do not sell, rent or share customer data with third parties for
                marketing purposes.
              </v-alert>
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
const currentDate = new Date().toLocaleDateString('en-IN')

const sections = [
  {
    title: 'Information We Collect',
    icon: 'mdi-database',
    text: 'We may collect institution details, user information, contact details, subscription information and ERP usage data necessary to provide our services.'
  },
  {
    title: 'How We Use Information',
    icon: 'mdi-cog',
    text: 'Information is used for account management, subscription activation, customer support, system improvements and service delivery.'
  },
  {
    title: 'Data Security',
    icon: 'mdi-shield-lock',
    text: 'We implement appropriate technical and organizational security measures to protect user data from unauthorized access, disclosure or loss.'
  },
  {
    title: 'Payment Information',
    icon: 'mdi-credit-card-lock',
    text: 'Payments are processed through Razorpay and other trusted payment providers. We do not store credit card, debit card or UPI credentials.'
  },
  {
    title: 'Cookies',
    icon: 'mdi-cookie',
    text: 'Cookies may be used to improve user experience, authentication and website functionality.'
  },
  {
    title: 'Data Retention',
    icon: 'mdi-database-clock',
    text: 'Data is retained as long as required to provide services, comply with legal obligations and maintain customer records.'
  },
  {
    title: 'Policy Updates',
    icon: 'mdi-update',
    text: 'We may update this Privacy Policy periodically. Changes become effective immediately after publication.'
  }
]

const setupRevealAnimation = () => {
  const elements = document.querySelectorAll('.animate-item')

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        entry.target.classList.toggle('show', entry.isIntersecting)
      })
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    }
  )

  elements.forEach((el, index) => {
    el.style.transitionDelay = `${Math.min(index * 60, 260)}ms`
    observer.observe(el)
  })
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
/* Use same CSS as TermsPage.vue */


/* GSAP animation helper: keeps elements visible before GSAP takes over */
.gsap-animate {
  will-change: transform, opacity;
}

</style>