<template>
  <v-container fluid class="landing-page pa-0">
    <!-- HERO -->
    <section class="hero-section">
      <div class="hero-glow hero-glow-one"></div>
      <div class="hero-glow hero-glow-two"></div>

      <v-container class="hero-container">
        <v-row align="center" class="hero-row">
          <v-col cols="12" lg="6" class="hero-left reveal-up">
            <v-chip color="primary" variant="flat" class="hero-chip mb-5">
              <v-icon start size="18">mdi-school</v-icon>
              Smart Assessment Management SaaS
            </v-chip>

            <h1 class="hero-title">
              Create Board-Pattern Question Papers in Minutes, Not Hours
            </h1>

            <p class="hero-subtitle mt-5">
              {{ settings?.site_name || 'YouTutor ERP' }} helps schools manage question banks,
              blueprints, Bloom's Taxonomy, teacher tasks, approvals, exam portions,
              and auto-generated question papers from one powerful platform.
            </p>

            <div class="hero-actions mt-8">
              <v-btn
                color="primary"
                size="x-large"
                rounded="xl"
                class="primary-cta"
                to="/contact"
              >
                Start 15 Days Free Demo
                <v-icon end>mdi-arrow-right</v-icon>
              </v-btn>

              <v-btn
                size="x-large"
                rounded="xl"
                variant="outlined"
                class="secondary-cta"
                to="/pricing"
              >
                View Pricing
              </v-btn>
            </div>

            <div class="trust-row mt-8">
              <div
                v-for="item in trustItems"
                :key="item.title"
                class="trust-item"
              >
                <v-icon :color="item.color" size="22">{{ item.icon }}</v-icon>
                <span>{{ item.title }}</span>
              </div>
            </div>
          </v-col>

          <v-col cols="12" lg="6" class="reveal-up delay-1">
            <div class="dashboard-shell">
              <v-card class="dashboard-card" rounded="xl" elevation="16">
                <div class="dashboard-topbar">
                  <div class="window-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>

                  <div class="dashboard-label">
                    Live ERP Preview
                  </div>
                </div>

                <div class="dashboard-header">
                  <div>
                    <h3>Question Paper Dashboard</h3>
                    <p>Blueprint compliance, Bloom balance and teacher progress</p>
                  </div>

                  <v-chip color="success" variant="flat" size="small">
                    Active
                  </v-chip>
                </div>

                <v-row>
                  <v-col
                    v-for="card in dashboardCards"
                    :key="card.label"
                    cols="6"
                  >
                    <div class="mini-card">
                      <v-icon :color="card.color" size="28">
                        {{ card.icon }}
                      </v-icon>

                      <div class="mini-value">
                        {{ card.value }}
                      </div>

                      <div class="mini-label">
                        {{ card.label }}
                      </div>
                    </div>
                  </v-col>
                </v-row>

                <div class="progress-panel">
                  <div class="d-flex align-center justify-space-between mb-3">
                    <strong>Paper Readiness</strong>
                    <span class="text-caption">92%</span>
                  </div>

                  <v-progress-linear
                    model-value="92"
                    color="primary"
                    height="10"
                    rounded
                  />

                  <div class="readiness-list mt-4">
                    <div
                      v-for="item in readiness"
                      :key="item"
                      class="readiness-item"
                    >
                      <v-icon color="success" size="18">mdi-check-circle</v-icon>
                      <span>{{ item }}</span>
                    </div>
                  </div>
                </div>
              </v-card>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- LOGO STRIP / TRUST -->
    <section class="trust-section reveal-up">
      <v-container>
        <div class="trust-box">
          <span>Built for academic institutions that need</span>

          <div class="trust-badges">
            <v-chip variant="tonal" color="primary">CBSE Pattern</v-chip>
            <v-chip variant="tonal" color="success">Blueprint Rules</v-chip>
            <v-chip variant="tonal" color="deep-purple">Bloom Taxonomy</v-chip>
            <v-chip variant="tonal" color="orange">Teacher Workflow</v-chip>
          </div>
        </div>
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
            <v-card class="stat-card reveal-up" rounded="xl" elevation="4">
              <v-icon :color="stat.color" size="34" class="mb-3">
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

    <!-- PRODUCT MODULES -->
    <section class="section-block modules-section">
      <v-container>
        <div class="section-heading reveal-up">
          <v-chip color="primary" variant="tonal" class="mb-3">
            Product Modules
          </v-chip>

          <h2>Everything Your School Needs in One Assessment ERP</h2>

          <p>
            A complete workflow from question creation to verified PDF paper generation.
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
            <v-card class="feature-card reveal-up h-100" rounded="xl" elevation="5">
              <div class="feature-icon" :class="feature.class">
                <v-icon color="white" size="30">
                  {{ feature.icon }}
                </v-icon>
              </div>

              <h3>{{ feature.title }}</h3>

              <p>{{ feature.description }}</p>

              <div class="feature-link">
                <span>Learn more</span>
                <v-icon size="18">mdi-arrow-right</v-icon>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- PRODUCT SHOWCASE -->
    <section class="showcase-section">
      <v-container>
        <v-row align="center">
          <v-col cols="12" md="5" class="reveal-left">
            <v-chip color="success" variant="tonal" class="mb-4">
              Blueprint Engine
            </v-chip>

            <h2 class="showcase-title">
              Strict Blueprint Control with Bloom Distribution
            </h2>

            <p class="showcase-text">
              Define section-wise marks, question type count, difficulty distribution,
              and Bloom taxonomy rules. The system prevents invalid paper creation
              and keeps every generated paper academically balanced.
            </p>

            <div
              v-for="point in showcasePoints"
              :key="point"
              class="showcase-point"
            >
              <v-icon color="success" size="22">mdi-check-decagram</v-icon>
              <span>{{ point }}</span>
            </div>
          </v-col>

          <v-col cols="12" md="7" class="reveal-right">
            <v-card class="showcase-card" rounded="xl" elevation="14">
              <div class="mock-table-header">
                <div>
                  <strong>CBSE Class 10 English Blueprint</strong>
                  <p>80 Marks • 37 Questions • Bloom Balanced</p>
                </div>

                <v-chip color="primary" variant="flat" size="small">
                  Validated
                </v-chip>
              </div>

              <div class="mock-rows">
                <div
                  v-for="row in blueprintRows"
                  :key="row.type"
                  class="mock-row"
                >
                  <div>
                    <strong>{{ row.type }}</strong>
                    <span>{{ row.section }}</span>
                  </div>

                  <div class="mock-chips">
                    <v-chip size="x-small" color="primary" variant="tonal">
                      {{ row.count }} Q
                    </v-chip>

                    <v-chip size="x-small" color="success" variant="tonal">
                      {{ row.marks }} Marks
                    </v-chip>

                    <v-chip size="x-small" color="deep-purple" variant="tonal">
                      {{ row.bloom }}
                    </v-chip>
                  </div>
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- HOW IT WORKS -->
    <section class="section-block process-section">
      <v-container>
        <div class="section-heading reveal-up">
          <v-chip color="warning" variant="tonal" class="mb-3">
            Workflow
          </v-chip>

          <h2>How It Works</h2>

          <p>
            A clean and controlled academic process for teachers and administrators.
          </p>
        </div>

        <div class="process-wrapper">
          <div
            v-for="(step, index) in steps"
            :key="step.title"
            class="process-card reveal-up"
          >
            <div class="process-number">
              {{ index + 1 }}
            </div>

            <v-icon :color="step.color" size="40">
              {{ step.icon }}
            </v-icon>

            <h3>{{ step.title }}</h3>

            <p>{{ step.description }}</p>
          </div>
        </div>
      </v-container>
    </section>

    <!-- PRICING PREVIEW -->
    <section class="pricing-preview">
      <v-container>
        <v-card class="pricing-preview-card reveal-up" rounded="xl" elevation="14">
          <v-row align="center">
            <v-col cols="12" md="8">
              <v-chip color="primary" variant="flat" class="mb-4">
                15 Days Free Demo
              </v-chip>

              <h2>Start Free. Upgrade When Your School Is Ready.</h2>

              <p>
                Try all major features before purchasing. Annual plans start from
                ₹24,999/year with complete question paper workflow support.
              </p>
            </v-col>

            <v-col cols="12" md="4" class="text-md-end">
              <v-btn color="primary" size="large" rounded="xl" to="/pricing">
                View Plans
              </v-btn>

              <v-btn variant="outlined" size="large" rounded="xl" class="ml-md-3 mt-3 mt-md-0" to="/contact">
                Book Demo
              </v-btn>
            </v-col>
          </v-row>
        </v-card>
      </v-container>
    </section>

    <!-- FAQ -->
    <section class="section-block faq-section">
      <v-container>
        <div class="section-heading reveal-up">
          <v-chip color="info" variant="tonal" class="mb-3">
            FAQ
          </v-chip>

          <h2>Frequently Asked Questions</h2>

          <p>
            Answers to common questions schools ask before starting.
          </p>
        </div>

        <v-row justify="center">
          <v-col cols="12" md="9">
            <v-expansion-panels variant="accordion" class="faq-panels reveal-up">
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

    <PublicShowcaseSwiper />
    <!-- FINAL CTA -->
    <section class="final-cta">
      <v-container>
        <v-card class="final-cta-card reveal-up" rounded="xl" elevation="16">
          <h2>Ready to Make Paper Generation Faster and Smarter?</h2>

          <p>
            Book your free demo and experience a complete Assessment Management ERP.
          </p>

          <div class="d-flex justify-center flex-wrap ga-3 mt-6">
            <v-btn color="primary" size="x-large" rounded="xl" to="/contact">
              Request Free Demo
            </v-btn>

            <v-btn variant="outlined" size="x-large" rounded="xl" to="/pricing">
              See Pricing
            </v-btn>
          </div>
        </v-card>
      </v-container>
    </section>

  </v-container>
</template>

<script setup>
import { onMounted, reactive, nextTick, onUnmounted } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useSettings } from '../../composables/useSettings'
import PublicShowcaseSwiper from '../../components/public/PublicShowcaseSwiper.vue'

gsap.registerPlugin(ScrollTrigger)

const { settings, fetchSettings } = useSettings()

const animatedStats = reactive({
  questions: 0,
  time: 0,
  compliance: 0,
  demo: 0
})

const trustItems = [
  { title: '15 Days Free Demo', icon: 'mdi-gift', color: 'success' },
  { title: 'Blueprint Based', icon: 'mdi-file-check', color: 'primary' },
  { title: 'Bloom Taxonomy Ready', icon: 'mdi-brain', color: 'deep-purple' }
]

const dashboardCards = [
  { label: 'Questions', value: '5,000+', icon: 'mdi-database', color: 'primary' },
  { label: 'Time Saved', value: '80%', icon: 'mdi-clock-fast', color: 'success' },
  { label: 'Blueprints', value: '100%', icon: 'mdi-file-check', color: 'warning' },
  { label: 'Workflow', value: 'Live', icon: 'mdi-sitemap', color: 'info' }
]

const readiness = [
  'Section rules matched',
  'Bloom distribution balanced',
  'Difficulty validation ready',
  'PDF export available'
]

const stats = [
  { key: 'questions', label: 'Questions Managed', value: 5000, suffix: '+', icon: 'mdi-database', color: 'primary' },
  { key: 'time', label: 'Time Saved', value: 80, suffix: '%', icon: 'mdi-clock-fast', color: 'success' },
  { key: 'compliance', label: 'Blueprint Compliance', value: 100, suffix: '%', icon: 'mdi-file-check', color: 'deep-purple' },
  { key: 'demo', label: 'Free Demo Days', value: 15, suffix: '', icon: 'mdi-gift', color: 'warning' }
]

const features = [
  {
    title: 'Question Bank Management',
    description: 'Create, import, approve and organize questions with marks, type, difficulty and Bloom level.',
    icon: 'mdi-database-edit',
    class: 'blue'
  },
  {
    title: 'Blueprint Enforcement',
    description: 'Prevent invalid papers with strict section-wise, question-type-wise and marks-based validation.',
    icon: 'mdi-file-document-check',
    class: 'green'
  },
  {
    title: "Bloom's Taxonomy",
    description: 'Maintain academic balance using Remember, Understand, Apply, Analyze, Evaluate and Create.',
    icon: 'mdi-brain',
    class: 'purple'
  },
  {
    title: 'Auto Paper Generator',
    description: 'Generate complete question papers automatically based on blueprint and question bank health.',
    icon: 'mdi-auto-fix',
    class: 'orange'
  },
  {
    title: 'Teacher Task Workflow',
    description: 'Assign question creation work to teachers and track completion from admin dashboard.',
    icon: 'mdi-account-clock',
    class: 'cyan'
  },
  {
    title: 'PDF Export & Print',
    description: 'Export clean board-style papers with sections, marks, instructions and professional layout.',
    icon: 'mdi-file-pdf-box',
    class: 'red'
  }
]

const showcasePoints = [
  'Section-wise question type control',
  'Automatic Bloom count calculation',
  'Difficulty bypass through Moderate Mode',
  'Invalid paper creation prevention'
]

const blueprintRows = [
  { type: 'MCQ', section: 'Section A', count: 20, marks: 20, bloom: 'Mixed' },
  { type: 'Short Answer', section: 'Section B', count: 11, marks: 22, bloom: 'Apply' },
  { type: 'Extract Based', section: 'Section C', count: 2, marks: 10, bloom: 'Analyze' },
  { type: 'Long Answer', section: 'Section D', count: 2, marks: 16, bloom: 'Understand' },
  { type: 'Formal Letter', section: 'Section E', count: 1, marks: 6, bloom: 'Apply' }
]

const steps = [
  {
    title: 'Teachers Add Questions',
    description: 'Questions are created with lesson, type, marks, difficulty and Bloom level.',
    icon: 'mdi-account-edit',
    color: 'primary'
  },
  {
    title: 'Admin Approves Content',
    description: 'Only verified and approved questions become available for paper generation.',
    icon: 'mdi-check-decagram',
    color: 'success'
  },
  {
    title: 'Blueprint Rules Apply',
    description: 'System checks section rules, marks, Bloom and difficulty distribution.',
    icon: 'mdi-file-tree',
    color: 'deep-purple'
  },
  {
    title: 'Final Paper Generated',
    description: 'Export a professional PDF question paper in minutes.',
    icon: 'mdi-file-pdf-box',
    color: 'red'
  }
]

const faqs = [
  {
    question: 'Can we try the ERP before buying?',
    answer: 'Yes, you can start with a 15 days free demo with all major features enabled.'
  },
  {
    question: 'Does it support CBSE board pattern?',
    answer: 'Yes, it supports blueprint-based question paper creation suitable for CBSE-style paper patterns.'
  },
  {
    question: 'Can teachers create questions separately?',
    answer: 'Yes, teachers can be assigned question creation tasks, and admins can monitor their progress.'
  },
  {
    question: 'Does it support Bloom Taxonomy?',
    answer: 'Yes, Bloom distribution is supported and can be validated during paper creation.'
  }
]

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

const setupRevealAnimation = () => {
  const elements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right')

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
        } else {
          entry.target.classList.remove('is-visible')
        }
      })
    },
    {
      threshold: 0.18
    }
  )

  elements.forEach((element) => observer.observe(element))
}

onMounted(() => {
  fetchSettings()
  animateStats()
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
.landing-page {
  overflow: hidden;
  background:
    radial-gradient(circle at top left, rgba(var(--v-theme-primary), 0.18), transparent 34%),
    radial-gradient(circle at 90% 12%, rgba(124, 58, 237, 0.18), transparent 30%),
    rgb(var(--v-theme-background));
}

.hero-section {
  position: relative;
  min-height: calc(100vh - 76px);
  display: flex;
  align-items: center;
  background:
    linear-gradient(135deg, rgba(var(--v-theme-primary), 0.12), rgba(124, 58, 237, 0.08)),
    rgb(var(--v-theme-surface));
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.hero-container {
  position: relative;
  z-index: 2;
}

.hero-row {
  padding: 70px 0;
}

.hero-glow {
  position: absolute;
  border-radius: 999px;
  filter: blur(70px);
  opacity: 0.5;
  pointer-events: none;
}

.hero-glow-one {
  width: 380px;
  height: 380px;
  background: rgba(var(--v-theme-primary), 0.45);
  top: -120px;
  left: -120px;
}

.hero-glow-two {
  width: 420px;
  height: 420px;
  background: rgba(124, 58, 237, 0.42);
  right: -120px;
  bottom: -160px;
}

.hero-chip {
  font-weight: 700;
}

.hero-title {
  font-size: clamp(42px, 6vw, 74px);
  font-weight: 950;
  line-height: 1.02;
  letter-spacing: -2.4px;
  color: rgb(var(--v-theme-on-background));
}

.hero-subtitle {
  max-width: 720px;
  font-size: 18px;
  line-height: 1.85;
  color: rgba(var(--v-theme-on-background), 0.76);
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
}

.primary-cta {
  box-shadow: 0 18px 36px rgba(var(--v-theme-primary), 0.28);
}

.secondary-cta {
  border-color: rgba(var(--v-theme-primary), 0.35);
}

.trust-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.trust-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 999px;
  background: rgba(var(--v-theme-surface), 0.7);
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  font-weight: 700;
  font-size: 14px;
}

.dashboard-shell {
  position: relative;
  padding: 16px;
}

.dashboard-shell::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 32px;
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.5), rgba(124, 58, 237, 0.42));
  transform: rotate(-2deg);
  opacity: 0.55;
}

.dashboard-card {
  position: relative;
  padding: 22px;
  background: rgba(var(--v-theme-surface), 0.92);
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  backdrop-filter: blur(16px);
}

.dashboard-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.window-dots {
  display: flex;
  gap: 7px;
}

.window-dots span {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(var(--v-theme-on-surface), 0.25);
}

.dashboard-label {
  font-size: 12px;
  color: rgba(var(--v-theme-on-surface), 0.6);
  font-weight: 700;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
}

.dashboard-header h3 {
  font-size: 22px;
  font-weight: 900;
}

.dashboard-header p {
  margin: 4px 0 0;
  color: rgba(var(--v-theme-on-surface), 0.62);
  font-size: 13px;
}

.mini-card,
.progress-panel,
.stat-card,
.feature-card,
.showcase-card,
.process-card,
.pricing-preview-card,
.final-cta-card {
  background: rgba(var(--v-theme-surface), 0.9);
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  backdrop-filter: blur(14px);
}

.mini-card {
  padding: 16px;
  border-radius: 20px;
}

.mini-value {
  font-size: 24px;
  font-weight: 950;
  margin-top: 8px;
}

.mini-label {
  color: rgba(var(--v-theme-on-surface), 0.62);
  font-size: 13px;
}

.progress-panel {
  padding: 18px;
  border-radius: 22px;
  margin-top: 16px;
}

.readiness-list {
  display: grid;
  gap: 10px;
}

.readiness-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(var(--v-theme-on-surface), 0.76);
  font-size: 14px;
}

.trust-section {
  padding: 26px 0;
  background: rgb(var(--v-theme-background));
}

.trust-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding: 18px 22px;
  border-radius: 24px;
  background: rgba(var(--v-theme-surface), 0.85);
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.trust-box > span {
  color: rgba(var(--v-theme-on-surface), 0.72);
  font-weight: 700;
}

.trust-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.stats-section {
  padding: 44px 0 30px;
}

.stat-card {
  padding: 24px;
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

.section-block {
  padding: 78px 0;
}

.section-heading {
  text-align: center;
  max-width: 850px;
  margin: 0 auto 44px;
  padding: 0 16px;
  background: transparent !important;
  border: none !important;
}

.section-heading h2,
.showcase-title,
.pricing-preview-card h2,
.final-cta-card h2 {
  font-size: clamp(30px, 4.4vw, 48px);
  font-weight: 950;
  line-height: 1.12;
  letter-spacing: -1.4px;
  color: rgb(var(--v-theme-on-background)) !important;
}

.section-heading p,
.showcase-text,
.pricing-preview-card p,
.final-cta-card p {
  margin-top: 14px;
  color: rgba(var(--v-theme-on-background), 0.72) !important;
  line-height: 1.8;
  font-size: 16px;
}

.modules-section {
  background:
    radial-gradient(circle at 12% 10%, rgba(var(--v-theme-primary), 0.12), transparent 32%),
    rgb(var(--v-theme-background));
}

.feature-card {
  padding: 28px;
  transition: 0.35s ease;
  overflow: hidden;
  position: relative;
}

.feature-card::after {
  content: '';
  position: absolute;
  inset: auto 0 0 0;
  height: 4px;
  background: linear-gradient(90deg, rgb(var(--v-theme-primary)), #7c3aed);
  opacity: 0;
  transition: 0.35s ease;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 22px 48px rgba(0, 0, 0, 0.18);
}

.feature-card:hover::after {
  opacity: 1;
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

.feature-card h3 {
  font-size: 19px;
  font-weight: 900;
  margin-bottom: 10px;
}

.feature-card p {
  color: rgba(var(--v-theme-on-surface), 0.66);
  line-height: 1.7;
}

.feature-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 20px;
  color: rgb(var(--v-theme-primary));
  font-weight: 800;
}

.showcase-section {
  padding: 86px 0;
  background:
    linear-gradient(135deg, rgba(var(--v-theme-primary), 0.08), rgba(124, 58, 237, 0.06)),
    rgb(var(--v-theme-surface));
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.showcase-point {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 16px;
  font-weight: 700;
  color: rgba(var(--v-theme-on-background), 0.8);
}

.showcase-card {
  padding: 26px;
}

.mock-table-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
}

.mock-table-header p {
  margin: 4px 0 0;
  color: rgba(var(--v-theme-on-surface), 0.62);
}

.mock-rows {
  display: grid;
  gap: 12px;
}

.mock-row {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: center;
  padding: 15px;
  border-radius: 16px;
  background: rgba(var(--v-theme-primary), 0.06);
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.mock-row span {
  display: block;
  margin-top: 3px;
  color: rgba(var(--v-theme-on-surface), 0.62);
  font-size: 13px;
}

.mock-chips {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 6px;
}

.process-section {
  background: rgb(var(--v-theme-background));
}

.process-wrapper {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.process-card {
  padding: 28px;
  border-radius: 28px;
  position: relative;
  transition: 0.35s ease;
}

.process-card:hover {
  transform: translateY(-8px);
}

.process-number {
  width: 46px;
  height: 46px;
  border-radius: 16px;
  background: rgb(var(--v-theme-primary));
  color: white;
  font-weight: 950;
  display: grid;
  place-items: center;
  margin-bottom: 18px;
}

.process-card h3 {
  font-size: 18px;
  font-weight: 900;
  margin: 16px 0 8px;
}

.process-card p {
  color: rgba(var(--v-theme-on-surface), 0.66);
  line-height: 1.7;
}

.pricing-preview {
  padding: 80px 0;
  background:
    radial-gradient(circle at top right, rgba(124, 58, 237, 0.16), transparent 34%),
    rgb(var(--v-theme-surface));
}

.pricing-preview-card {
  padding: 38px;
}

.faq-section {
  background:
    radial-gradient(circle at top, rgba(var(--v-theme-primary), 0.10), transparent 36%),
    rgb(var(--v-theme-background));
}

.landing-page :deep(.v-chip) {
  font-weight: 700;
}

.landing-page h1,
.landing-page h2,
.landing-page h3 {
  color: rgb(var(--v-theme-on-background));
}

.landing-page p {
  color: rgba(var(--v-theme-on-background), 0.72);
}

.faq-panels :deep(.v-expansion-panel-title) {
  font-weight: 800;
  color: rgb(var(--v-theme-on-surface));
}

.faq-panels :deep(.v-expansion-panel-text) {
  color: rgba(var(--v-theme-on-surface), 0.74);
}

.faq-panels :deep(.v-expansion-panel) {
  margin-bottom: 12px;
  border-radius: 18px !important;
  background: rgba(var(--v-theme-surface), 0.92) !important;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.final-cta {
  padding: 80px 0 92px;
}

.final-cta-card {
  text-align: center;
  padding: 54px 28px;
  background:
    radial-gradient(circle at top, rgba(var(--v-theme-primary), 0.2), transparent 46%),
    linear-gradient(135deg, rgba(var(--v-theme-primary), 0.08), rgba(124, 58, 237, 0.08)),
    rgb(var(--v-theme-surface));
}

@media (max-width: 960px) {
  .process-wrapper {
    grid-template-columns: repeat(2, 1fr);
  }

  .hero-section {
    min-height: auto;
  }

  .hero-row {
    padding: 54px 0;
  }
}

@media (max-width: 600px) {
  .hero-title {
    letter-spacing: -1.4px;
  }

  .hero-actions .v-btn {
    width: 100%;
  }

  .process-wrapper {
    grid-template-columns: 1fr;
  }

  .mock-row {
    align-items: flex-start;
    flex-direction: column;
  }

  .mock-chips {
    justify-content: flex-start;
  }

  .section-block,
  .showcase-section,
  .pricing-preview,
  .final-cta {
    padding: 52px 0;
  }

  .pricing-preview-card {
    padding: 26px;
  }
}


/* GSAP animation helper: keeps elements visible before GSAP takes over */
.gsap-animate {
  will-change: transform, opacity;
}

</style>