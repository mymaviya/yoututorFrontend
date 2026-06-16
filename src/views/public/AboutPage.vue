<template>
  <v-container fluid class="about-page pa-0">
    <!-- HERO -->
    <section class="about-hero">
      <div class="hero-glow hero-glow-one"></div>
      <div class="hero-glow hero-glow-two"></div>

      <v-container class="hero-content">
        <v-row align="center" class="py-12">
          <v-col cols="12" md="7">
            <div class="animate-item">
              <v-chip color="primary" variant="flat" class="mb-5">
                <v-icon start size="18">mdi-information</v-icon>
                About {{ settings?.site_name || 'YouTutor ERP' }}
              </v-chip>

              <h1 class="hero-title">
                Transforming Question Paper Creation for Modern Schools
              </h1>

              <p class="hero-subtitle mt-5">
                {{ settings?.site_name || 'YouTutor ERP' }} is a smart assessment
                management platform built to help educational institutions create,
                validate and generate board-pattern question papers with speed,
                accuracy and academic discipline.
              </p>

              <div class="d-flex flex-wrap ga-3 mt-7">
                <v-btn color="primary" size="large" rounded="xl" to="/contact">
                  Book Free Demo
                  <v-icon end>mdi-arrow-right</v-icon>
                </v-btn>

                <v-btn variant="outlined" size="large" rounded="xl" to="/pricing">
                  View Pricing
                </v-btn>
              </div>
            </div>
          </v-col>

          <v-col cols="12" md="5">
            <v-card class="hero-card animate-item" rounded="xl" elevation="14">
              <v-avatar color="primary" size="70" rounded="xl" class="mb-5">
                <v-icon color="white" size="38">mdi-school</v-icon>
              </v-avatar>

              <h2>Built for Schools, Teachers and Academic Leaders</h2>

              <p>
                From question bank creation to final PDF export, the platform keeps
                the complete academic assessment workflow organized and reliable.
              </p>

              <div class="hero-check" v-for="point in heroPoints" :key="point">
                <v-icon color="success" size="20">mdi-check-circle</v-icon>
                <span>{{ point }}</span>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- STORY -->
    <section class="section-block">
      <v-container>
        <v-row align="center">
          <v-col cols="12" md="6">
            <v-card class="story-card animate-item" rounded="xl" elevation="8">
              <v-icon color="primary" size="48" class="mb-4">
                mdi-lightbulb-on
              </v-icon>

              <h2>Why We Built This Platform</h2>

              <p>
                Many schools still prepare question papers manually using scattered
                Word files, old PDFs, WhatsApp messages and unstructured question banks.
                This creates errors in marks distribution, blueprint compliance,
                question repetition and academic quality.
              </p>

              <p>
                {{ settings?.site_name || 'YouTutor ERP' }} solves this problem by
                giving schools a structured, secure and intelligent system for the
                entire question paper lifecycle.
              </p>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-row>
              <v-col
                v-for="problem in problems"
                :key="problem.title"
                cols="12"
                sm="6"
              >
                <v-card class="problem-card animate-item h-100" rounded="xl">
                  <v-icon :color="problem.color" size="34" class="mb-3">
                    {{ problem.icon }}
                  </v-icon>

                  <h3>{{ problem.title }}</h3>
                  <p>{{ problem.text }}</p>
                </v-card>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- MISSION VISION -->
    <section class="section-block soft-section">
      <v-container>
        <v-row>
          <v-col cols="12" md="6">
            <v-card class="mission-card animate-item h-100" rounded="xl" elevation="8">
              <v-icon color="primary" size="48" class="mb-4">
                mdi-target
              </v-icon>

              <h2>Our Mission</h2>

              <p>
                To empower schools with a modern, intelligent and efficient question
                paper management platform that saves time, improves quality and ensures
                academic excellence.
              </p>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card class="mission-card animate-item h-100" rounded="xl" elevation="8">
              <v-icon color="deep-purple" size="48" class="mb-4">
                mdi-eye
              </v-icon>

              <h2>Our Vision</h2>

              <p>
                To become a trusted assessment and examination ERP platform for
                schools, colleges, coaching institutes and educational institutions.
              </p>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- STATS -->
    <section class="stats-section">
      <v-container>
        <v-row>
          <v-col
            v-for="stat in stats"
            :key="stat.label"
            cols="6"
            md="3"
          >
            <v-card class="stat-card animate-item" rounded="xl" elevation="5">
              <v-icon :color="stat.color" size="36" class="mb-3">
                {{ stat.icon }}
              </v-icon>

              <div class="stat-number">
                {{ animatedStats[stat.key] }}{{ stat.suffix }}
              </div>

              <div class="stat-label">
                {{ stat.label }}
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- FEATURES -->
    <section class="section-block">
      <v-container>
        <div class="section-heading reveal-up animate-item">
          <v-chip color="primary" variant="tonal" class="mb-3">
            Why Choose Us
          </v-chip>

          <h2>Designed for Academic Accuracy and Speed</h2>

          <p>
            Every feature is created around real school workflow and question paper challenges.
          </p>
        </div>

        <v-row>
          <v-col
            v-for="feature in features"
            :key="feature.title"
            cols="12"
            sm="6"
            lg="4"
          >
            <v-card class="feature-card animate-item h-100" rounded="xl" elevation="5">
              <div class="feature-icon" :class="feature.class">
                <v-icon color="white" size="30">
                  {{ feature.icon }}
                </v-icon>
              </div>

              <h3>{{ feature.title }}</h3>

              <p>{{ feature.description }}</p>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- VALUES -->
    <section class="section-block soft-section">
      <v-container>
        <div class="section-heading animate-item">
          <v-chip color="success" variant="tonal" class="mb-3">
            Our Values
          </v-chip>

          <h2>What We Stand For</h2>

          <p>
            We believe technology should make school academics more transparent,
            efficient and reliable.
          </p>
        </div>

        <v-row>
          <v-col
            v-for="value in values"
            :key="value.title"
            cols="12"
            md="3"
          >
            <v-card class="value-card animate-item h-100" rounded="xl" elevation="4">
              <v-icon :color="value.color" size="40" class="mb-4">
                {{ value.icon }}
              </v-icon>

              <h3>{{ value.title }}</h3>

              <p>{{ value.description }}</p>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- BUSINESS DETAILS -->
    <section class="section-block">
      <v-container>
        <v-card class="business-card animate-item" rounded="xl" elevation="10">
          <v-row align="center">
            <v-col cols="12" md="5">
              <v-chip color="primary" variant="flat" class="mb-4">
                Business Details
              </v-chip>

              <h2>Company Information</h2>

              <p>
                These details are provided for customer transparency, support and
                payment gateway verification.
              </p>
            </v-col>

            <v-col cols="12" md="7">
              <div class="details-grid">
                <div
                  v-for="item in businessDetails"
                  :key="item.label"
                  class="detail-item"
                >
                  <v-icon :color="item.color" size="24">
                    {{ item.icon }}
                  </v-icon>

                  <div>
                    <strong>{{ item.label }}</strong>
                    <span>{{ item.value }}</span>
                  </div>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card>
      </v-container>
    </section>

    <!-- CTA -->
    <section class="final-cta">
      <v-container>
        <v-card class="final-cta-card animate-item" rounded="xl" elevation="14">
          <h2>Ready to Experience Smarter Question Paper Management?</h2>

          <p>
            Start your free demo and see how your school can save time while improving
            academic quality.
          </p>

          <div class="d-flex justify-center flex-wrap ga-3 mt-6">
            <v-btn color="primary" size="large" rounded="xl" to="/contact">
              Request Free Demo
            </v-btn>

            <v-btn variant="outlined" size="large" rounded="xl" to="/pricing">
              View Plans
            </v-btn>
          </div>
        </v-card>
      </v-container>
    </section>
  </v-container>
</template>

<script setup>
import { computed, onMounted, reactive, nextTick, onUnmounted } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useSettings } from '../../composables/useSettings'

gsap.registerPlugin(ScrollTrigger)

const { settings, fetchSettings } = useSettings()

const animatedStats = reactive({
  questions: 0,
  exams: 0,
  time: 0,
  compliance: 0
})

const heroPoints = [
  'Blueprint based paper generation',
  "Bloom's Taxonomy support",
  'Teacher task workflow',
  'PDF export and academic reports'
]

const problems = [
  {
    title: 'Manual Errors',
    text: 'Marks and question count mismatch while preparing papers manually.',
    icon: 'mdi-alert-circle',
    color: 'error'
  },
  {
    title: 'Scattered Content',
    text: 'Questions are often stored in files, notebooks and old PDFs.',
    icon: 'mdi-folder-alert',
    color: 'warning'
  },
  {
    title: 'No Blueprint Control',
    text: 'Paper creation becomes difficult without strict section-wise rules.',
    icon: 'mdi-file-cancel',
    color: 'deep-purple'
  },
  {
    title: 'Teacher Tracking',
    text: 'Admin cannot easily track question creation work assigned to teachers.',
    icon: 'mdi-account-clock',
    color: 'info'
  }
]

const stats = [
  { key: 'questions', label: 'Questions Managed', value: 5000, suffix: '+', icon: 'mdi-database', color: 'primary' },
  { key: 'exams', label: 'Exams Supported', value: 100, suffix: '+', icon: 'mdi-file-document', color: 'success' },
  { key: 'time', label: 'Time Saved', value: 80, suffix: '%', icon: 'mdi-clock-fast', color: 'warning' },
  { key: 'compliance', label: 'Blueprint Compliance', value: 100, suffix: '%', icon: 'mdi-check-decagram', color: 'deep-purple' }
]

const features = [
  {
    title: 'Question Bank Management',
    description: 'Organize questions by grade, subject, lesson, marks, difficulty and Bloom level.',
    icon: 'mdi-database-edit',
    class: 'blue'
  },
  {
    title: 'Blueprint Engine',
    description: 'Enforce section-wise question count, marks distribution and question type rules.',
    icon: 'mdi-file-tree',
    class: 'green'
  },
  {
    title: "Bloom's Taxonomy",
    description: 'Maintain academic balance across Remember, Understand, Apply and Analyze levels.',
    icon: 'mdi-brain',
    class: 'purple'
  },
  {
    title: 'Auto Paper Generator',
    description: 'Generate complete papers automatically based on blueprint and approved questions.',
    icon: 'mdi-auto-fix',
    class: 'orange'
  },
  {
    title: 'Teacher Workflow',
    description: 'Assign tasks to teachers and monitor question creation progress easily.',
    icon: 'mdi-account-clock',
    class: 'cyan'
  },
  {
    title: 'PDF Export',
    description: 'Export clean and professional question papers ready for printing.',
    icon: 'mdi-file-pdf-box',
    class: 'red'
  }
]

const values = [
  {
    title: 'Innovation',
    description: 'We simplify academic work using practical and modern technology.',
    icon: 'mdi-lightbulb-on',
    color: 'warning'
  },
  {
    title: 'Reliability',
    description: 'We focus on stable workflows that schools can depend on daily.',
    icon: 'mdi-shield-check',
    color: 'success'
  },
  {
    title: 'Academic Quality',
    description: 'We help institutions maintain better question paper standards.',
    icon: 'mdi-school',
    color: 'primary'
  },
  {
    title: 'Security',
    description: 'We value secure access, role permissions and controlled data usage.',
    icon: 'mdi-lock-check',
    color: 'deep-purple'
  }
]

const businessDetails = computed(() => [
  {
    label: 'Business Name',
    value: settings.value?.company_name || 'Maviya IT Services',
    icon: 'mdi-domain',
    color: 'primary'
  },
  {
    label: 'Product',
    value: settings.value?.site_name || 'YouTutor ERP',
    icon: 'mdi-laptop',
    color: 'success'
  },
  {
    label: 'Service Type',
    value: 'SaaS-based Educational ERP Software',
    icon: 'mdi-cloud',
    color: 'info'
  },
  {
    label: 'Email',
    value: settings.value?.contact_email || 'mhmasti@gmail.com',
    icon: 'mdi-email',
    color: 'warning'
  },
  {
    label: 'Location',
    value: settings.value?.business_address || 'Siddharth Nagar, Uttar Pradesh, India',
    icon: 'mdi-map-marker',
    color: 'error'
  },
  {
    label: 'GST Number',
    value: settings.value?.gst_number || 'Available on request',
    icon: 'mdi-file-certificate',
    color: 'deep-purple'
  }
])

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
    el.style.transitionDelay = `${Math.min(index * 70, 280)}ms`
    observer.observe(el)
  })
}

const animateStats = () => {
  stats.forEach((stat) => {
    const duration = 1400
    const stepsCount = 45
    const increment = stat.value / stepsCount
    let current = 0

    const timer = setInterval(() => {
      current += increment

      if (current >= stat.value) {
        animatedStats[stat.key] = stat.value
        clearInterval(timer)
      } else {
        animatedStats[stat.key] = Math.floor(current)
      }
    }, duration / stepsCount)
  })
}

onMounted(() => {
  fetchSettings()
  setupRevealAnimation()
  animateStats()
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
.about-page {
  overflow: hidden;
  background:
    radial-gradient(circle at top left, rgba(var(--v-theme-primary), 0.15), transparent 34%),
    radial-gradient(circle at 90% 12%, rgba(124, 58, 237, 0.13), transparent 30%),
    rgb(var(--v-theme-background));
}

.about-hero {
  position: relative;
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
  width: 360px;
  height: 360px;
  background: rgba(var(--v-theme-primary), 0.42);
  top: -120px;
  left: -120px;
}

.hero-glow-two {
  width: 420px;
  height: 420px;
  background: rgba(124, 58, 237, 0.38);
  right: -140px;
  bottom: -160px;
}

.hero-title {
  font-size: clamp(40px, 6vw, 68px);
  font-weight: 950;
  line-height: 1.05;
  letter-spacing: -2px;
  color: rgb(var(--v-theme-on-background));
}

.section-heading {
  text-align: center;
  max-width: 850px;
  margin: 0 auto 44px;
  padding: 0 16px;
  background: transparent !important;
  border: none !important;
}


.hero-subtitle {
  font-size: 18px;
  line-height: 1.85;
  color: rgba(var(--v-theme-on-background), 0.72);
}

.hero-card,
.story-card,
.problem-card,
.mission-card,
.stat-card,
.feature-card,
.value-card,
.business-card,
.final-cta-card {
  background: rgba(var(--v-theme-surface), 0.92);
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  backdrop-filter: blur(14px);
}

.hero-card {
  padding: 32px;
}

.hero-card h2,
.story-card h2,
.mission-card h2,
.section-heading h2,
.business-card h2,
.final-cta-card h2 {
  font-size: clamp(28px, 4vw, 44px);
  font-weight: 950;
  line-height: 1.14;
  letter-spacing: -1px;
  color: rgb(var(--v-theme-on-background));
}

.hero-card p,
.story-card p,
.mission-card p,
.section-heading p,
.business-card p,
.final-cta-card p {
  color: rgba(var(--v-theme-on-background), 0.7);
  line-height: 1.8;
}

.hero-check {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 14px;
  font-weight: 700;
  color: rgba(var(--v-theme-on-surface), 0.78);
}

.section-block {
  padding: 78px 0;
}

.soft-section {
  background:
    linear-gradient(135deg, rgba(var(--v-theme-primary), 0.07), rgba(124, 58, 237, 0.05)),
    rgb(var(--v-theme-surface));
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.story-card,
.mission-card,
.business-card,
.final-cta-card {
  padding: 34px;
}

.problem-card,
.feature-card,
.value-card,
.stat-card {
  padding: 26px;
  transition: 0.35s ease;
}

.problem-card:hover,
.feature-card:hover,
.value-card:hover,
.stat-card:hover {
  transform: translateY(-8px);
}

.problem-card h3,
.feature-card h3,
.value-card h3 {
  font-size: 18px;
  font-weight: 900;
  margin-bottom: 8px;
}

.problem-card p,
.feature-card p,
.value-card p {
  color: rgba(var(--v-theme-on-surface), 0.66);
  line-height: 1.7;
}

.stats-section {
  padding: 54px 0;
}

.stat-card {
  text-align: center;
  height: 100%;
}

.stat-number {
  font-size: clamp(30px, 4vw, 46px);
  font-weight: 950;
  line-height: 1;
}

.stat-label {
  margin-top: 10px;
  color: rgba(var(--v-theme-on-surface), 0.64);
  font-weight: 700;
}

.section-heading {
  text-align: center;
  max-width: 820px;
  margin: 0 auto 44px;
}

.feature-icon {
  width: 58px;
  height: 58px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  margin-bottom: 22px;
}

.feature-icon.blue {
  background: linear-gradient(135deg, #2563eb, #38bdf8);
}

.feature-icon.green {
  background: linear-gradient(135deg, #16a34a, #86efac);
}

.feature-icon.purple {
  background: linear-gradient(135deg, #7c3aed, #c084fc);
}

.feature-icon.orange {
  background: linear-gradient(135deg, #f97316, #facc15);
}

.feature-icon.cyan {
  background: linear-gradient(135deg, #0891b2, #67e8f9);
}

.feature-icon.red {
  background: linear-gradient(135deg, #dc2626, #fb7185);
}

.details-grid {
  display: grid;
  gap: 14px;
}

.detail-item {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding: 16px;
  border-radius: 18px;
  background: rgba(var(--v-theme-primary), 0.06);
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.detail-item strong {
  display: block;
  margin-bottom: 3px;
}

.detail-item span {
  color: rgba(var(--v-theme-on-surface), 0.7);
}

.final-cta {
  padding: 40px 0 86px;
}

.final-cta-card {
  text-align: center;
  padding: 54px 28px;
  background:
    radial-gradient(circle at top, rgba(var(--v-theme-primary), 0.2), transparent 46%),
    linear-gradient(135deg, rgba(var(--v-theme-primary), 0.08), rgba(124, 58, 237, 0.08)),
    rgb(var(--v-theme-surface));
}

@media (max-width: 600px) {
  .section-block {
    padding: 52px 0;
  }

  .story-card,
  .mission-card,
  .business-card,
  .final-cta-card,
  .hero-card {
    padding: 24px;
  }

  .hero-title {
    letter-spacing: -1.3px;
  }
}


/* GSAP animation helper: keeps elements visible before GSAP takes over */
.gsap-animate {
  will-change: transform, opacity;
}

</style>