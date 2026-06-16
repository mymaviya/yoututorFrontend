<template>
  <v-container fluid class="policy-page pa-0">
    <!-- HERO -->
    <section class="policy-hero">
      <div class="hero-glow hero-glow-one"></div>
      <div class="hero-glow hero-glow-two"></div>

      <v-container class="hero-content">
        <div class="policy-heading animate-item">
          <v-chip color="primary" variant="flat" class="mb-5">
            <v-icon start size="18">mdi-file-document-check</v-icon>
            Terms & Conditions
          </v-chip>

          <h1>Terms & Conditions</h1>

          <p>
            Please read these terms carefully before using
            {{ settings?.site_name || 'YouTutor ERP' }}.
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
                <v-icon color="primary" size="22">mdi-calendar-clock</v-icon>
                <span>Last updated: {{ currentDate }}</span>
              </div>

              <div
                v-for="section in sections"
                :key="section.title"
                class="policy-section animate-item"
              >
                <div class="section-icon">
                  <v-icon color="primary" size="24">
                    {{ section.icon }}
                  </v-icon>
                </div>

                <div>
                  <h2>{{ section.title }}</h2>
                  <p>{{ section.text }}</p>
                </div>
              </div>

              <v-divider class="my-8" />

              <v-alert color="primary" variant="tonal" rounded="lg">
                <strong>Contact:</strong>
                For any terms-related query, please contact
                {{ settings?.contact_email || 'mhmasti@gmail.com' }}.
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
import { useSettings } from '../../composables/useSettings'

gsap.registerPlugin(ScrollTrigger)

const { settings, fetchSettings } = useSettings()

const currentDate = new Date().toLocaleDateString('en-IN', {
  day: '2-digit',
  month: 'long',
  year: 'numeric'
})

const sections = [
  {
    title: '1. Service Usage',
    icon: 'mdi-school',
    text: 'YouTutor ERP is provided for educational institutions to manage question banks, blueprints, examination content, teacher workflows and question paper generation.'
  },
  {
    title: '2. Account Responsibility',
    icon: 'mdi-account-lock',
    text: 'The institution is responsible for maintaining confidentiality of login credentials and for all activities performed through its account.'
  },
  {
    title: '3. Subscription',
    icon: 'mdi-card-account-details-star',
    text: 'Access to paid services is provided based on the selected subscription plan. Subscription validity starts from the date of activation or successful payment confirmation.'
  },
  {
    title: '4. Free Demo',
    icon: 'mdi-gift',
    text: 'A 15-day free demo may be provided with major features enabled. After the demo period, access may be restricted unless a paid plan is activated.'
  },
  {
    title: '5. Payments',
    icon: 'mdi-cash-check',
    text: 'Payments are collected through secure third-party payment gateways such as Razorpay. We do not store card, UPI or banking information on our servers.'
  },
  {
    title: '6. Data Responsibility',
    icon: 'mdi-database-lock',
    text: 'Institutions are responsible for the correctness of the data entered into the ERP. We provide reasonable security and backup practices for hosted services.'
  },
  {
    title: '7. Service Changes',
    icon: 'mdi-update',
    text: 'We may update, improve or modify ERP features from time to time to improve performance, security and user experience.'
  },
  {
    title: '8. Limitation of Liability',
    icon: 'mdi-alert-circle',
    text: 'We are not liable for losses arising due to incorrect data entry, misuse of credentials, third-party service downtime or unauthorized access caused by user negligence.'
  }
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
  fetchSettings()
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
.policy-page {
  overflow: hidden;
  background:
    radial-gradient(circle at top left, rgba(var(--v-theme-primary), 0.15), transparent 34%),
    radial-gradient(circle at 90% 12%, rgba(124, 58, 237, 0.13), transparent 30%),
    rgb(var(--v-theme-background));
}

.policy-hero {
  position: relative;
  padding: 86px 0;
  background:
    linear-gradient(135deg, rgba(var(--v-theme-primary), 0.12), rgba(124, 58, 237, 0.08)),
    rgb(var(--v-theme-surface));
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.hero-content {
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
  bottom: -150px;
}

.policy-heading {
  max-width: 850px;
  margin: 0 auto;
  text-align: center;
}

.policy-heading h1 {
  font-size: clamp(40px, 6vw, 68px);
  font-weight: 950;
  line-height: 1.05;
  letter-spacing: -2px;
  color: rgb(var(--v-theme-on-background));
}

.policy-heading p {
  max-width: 720px;
  margin: 18px auto 0;
  font-size: 18px;
  line-height: 1.8;
  color: rgba(var(--v-theme-on-background), 0.72);
}

.policy-content {
  padding: 70px 0 90px;
}

.policy-card {
  padding: 36px;
  background: rgba(var(--v-theme-surface), 0.94);
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  backdrop-filter: blur(14px);
}

.updated-box {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 999px;
  background: rgba(var(--v-theme-primary), 0.08);
  border: 1px solid rgba(var(--v-theme-primary), 0.18);
  color: rgba(var(--v-theme-on-surface), 0.76);
  font-weight: 700;
}

.policy-section {
  display: flex;
  gap: 18px;
  padding: 22px 0;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.policy-section:last-child {
  border-bottom: none;
}

.section-icon {
  width: 48px;
  height: 48px;
  min-width: 48px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  background: rgba(var(--v-theme-primary), 0.1);
}

.policy-section h2 {
  font-size: 20px;
  font-weight: 900;
  margin-bottom: 8px;
  color: rgb(var(--v-theme-on-surface));
}

.policy-section p {
  margin: 0;
  line-height: 1.8;
  color: rgba(var(--v-theme-on-surface), 0.72);
}

@media (max-width: 600px) {
  .policy-hero {
    padding: 58px 0;
  }

  .policy-content {
    padding: 44px 0 62px;
  }

  .policy-card {
    padding: 24px;
  }

  .policy-section {
    flex-direction: column;
  }

  .policy-heading h1 {
    letter-spacing: -1.2px;
  }
}


/* GSAP animation helper: keeps elements visible before GSAP takes over */
.gsap-animate {
  will-change: transform, opacity;
}

</style>