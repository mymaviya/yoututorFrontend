<template>
  <v-container fluid class="contact-page pa-0">
    <!-- HERO -->
    <section class="contact-hero">
      <v-container>
        <v-row align="center" class="py-12">
          <v-col cols="12" md="7">
            <v-chip color="primary" variant="flat" class="mb-4">
              Request Free Demo
            </v-chip>

            <h1 class="hero-title">
              Start Your 15 Days Free Demo
            </h1>

            <p class="hero-subtitle mt-4">
              Experience {{ settings?.site_name || 'YouTutor ERP' }} with all features enabled.
              Our team will help you set up question bank, blueprint, Bloom taxonomy,
              teacher workflow and auto paper generation.
            </p>

            <div class="hero-points mt-6">
              <div
                v-for="point in heroPoints"
                :key="point"
                class="hero-point"
              >
                <v-icon color="success" size="22">mdi-check-circle</v-icon>
                <span>{{ point }}</span>
              </div>
            </div>
          </v-col>

          <v-col cols="12" md="5">
            <v-card class="hero-card pa-6" rounded="xl" elevation="10">
              <div class="text-center mb-4">
                <v-avatar color="primary" size="64" class="mb-3">
                  <v-icon color="white" size="34">mdi-school</v-icon>
                </v-avatar>

                <h2 class="text-h5 font-weight-bold">
                  Book a Demo
                </h2>

                <p class="text-body-2 text-medium-emphasis mb-0">
                  Fill details and we will contact you shortly.
                </p>
              </div>

              <v-divider class="my-4" />

              <div class="demo-feature" v-for="feature in demoFeatures" :key="feature">
                <v-icon color="success" size="20" class="mr-2">mdi-check-circle</v-icon>
                <span>{{ feature }}</span>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- FORM + INFO -->
    <section class="contact-content">
      <v-container>
        <v-row>
          <!-- FORM -->
          <v-col cols="12" md="7">
            <v-card class="glass-card pa-6" rounded="xl" elevation="6">
              <div class="mb-6">
                <h2 class="text-h5 font-weight-bold mb-1">
                  Send Demo Enquiry
                </h2>

                <p class="text-body-2 text-medium-emphasis mb-0">
                  Please provide accurate details so we can activate your demo quickly.
                </p>
              </div>

              <v-alert
                v-if="successMessage"
                type="success"
                variant="tonal"
                rounded="lg"
                class="mb-4"
                closable
                @click:close="successMessage = ''"
              >
                {{ successMessage }}
              </v-alert>

              <v-alert
                v-if="errorMessage"
                type="error"
                variant="tonal"
                rounded="lg"
                class="mb-4"
                closable
                @click:close="errorMessage = ''"
              >
                {{ errorMessage }}
              </v-alert>

              <v-form @submit.prevent="submitForm">
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="form.school_name"
                      label="School / Institution Name"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-domain"
                      :error-messages="formErrors.school_name"
                    />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="form.contact_person"
                      label="Contact Person"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-account"
                      :error-messages="formErrors.contact_person"
                    />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="form.mobile"
                      label="Mobile Number"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-phone"
                      :error-messages="formErrors.mobile"
                    />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="form.email"
                      label="Email Address"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-email"
                      :error-messages="formErrors.email"
                    />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-select
                      v-model="form.interested_plan"
                      label="Interested Plan"
                      :items="plans"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-card-account-details-star"
                      :error-messages="formErrors.interested_plan"
                    />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-select
                      v-model="form.school_type"
                      label="Institution Type"
                      :items="schoolTypes"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-school-outline"
                      :error-messages="formErrors.school_type"
                    />
                  </v-col>

                  <v-col cols="12">
                    <v-textarea
                      v-model="form.message"
                      label="Message / Requirement"
                      variant="outlined"
                      rows="4"
                      auto-grow
                      prepend-inner-icon="mdi-message-text-outline"
                      :error-messages="formErrors.message"
                    />
                  </v-col>

                  <v-col cols="12">
                    <v-btn
                      type="submit"
                      color="primary"
                      size="large"
                      rounded="lg"
                      :loading="loading"
                      block
                    >
                      Submit Demo Request
                    </v-btn>
                  </v-col>
                </v-row>
              </v-form>
            </v-card>
          </v-col>

          <!-- INFO -->
          <v-col cols="12" md="5">
            <v-card class="glass-card pa-6 mb-5" rounded="xl" elevation="6">
              <h2 class="text-h5 font-weight-bold mb-5">
                Contact Information
              </h2>

              <div
                v-for="item in contactInfo"
                :key="item.title"
                class="contact-item"
              >
                <v-avatar :color="item.color" size="46" class="mr-4">
                  <v-icon color="white">{{ item.icon }}</v-icon>
                </v-avatar>

                <div>
                  <div class="font-weight-bold">{{ item.title }}</div>
                  <div class="text-body-2 text-medium-emphasis">
                    {{ item.value }}
                  </div>
                </div>
              </div>
            </v-card>

            <v-card class="gradient-card pa-6" rounded="xl" elevation="8">
              <v-icon size="44" color="white" class="mb-3">
                mdi-lightning-bolt
              </v-icon>

              <h3 class="text-h5 font-weight-bold text-white mb-3">
                Why Choose YouTutor ERP?
              </h3>

              <p class="text-body-2 text-white opacity-text mb-5">
                A complete academic assessment platform for modern schools.
              </p>

              <div
                v-for="benefit in benefits"
                :key="benefit"
                class="benefit-item"
              >
                <v-icon color="white" size="20" class="mr-2">
                  mdi-check-bold
                </v-icon>
                <span>{{ benefit }}</span>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>
  </v-container>
</template>

<script setup>
import { computed, onMounted, reactive, ref, nextTick, onUnmounted } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import api from '../../plugins/api'
import { useSettings } from '../../composables/useSettings'

gsap.registerPlugin(ScrollTrigger)

const { settings, fetchSettings } = useSettings()

const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const form = reactive({
  school_name: '',
  contact_person: '',
  mobile: '',
  email: '',
  interested_plan: '15 Days Free Demo',
  school_type: '',
  message: ''
})

const formErrors = reactive({
  school_name: [],
  contact_person: [],
  mobile: [],
  email: [],
  interested_plan: [],
  school_type: [],
  message: []
})

const plans = [
  '15 Days Free Demo',
  'Essential Plan',
  'Professional Plan',
  'Enterprise Plan',
  'Custom Plan'
]

const schoolTypes = [
  'CBSE School',
  'ICSE School',
  'State Board School',
  'Coaching Institute',
  'School Group',
  'College / Institute',
  'Other'
]

const heroPoints = [
  'No payment required for demo',
  'All major features enabled',
  'Admin and teacher workflow included',
  'Guided onboarding support'
]

const demoFeatures = [
  'Question Bank Management',
  'Blueprint Based Paper Creation',
  "Bloom's Taxonomy Distribution",
  'Auto Paper Generator',
  'Teacher Task Management',
  'PDF Export'
]

const benefits = [
  'Board-pattern paper generation',
  'Teacher task monitoring',
  'Academic quality control',
  'Time-saving automation'
]

const contactInfo = computed(() => [
  {
    title: 'Company',
    value: settings.value?.company_name || 'Maviya IT Services',
    icon: 'mdi-domain',
    color: 'primary'
  },
  {
    title: 'Email',
    value: settings.value?.contact_email || 'mhmasti@gmail.com',
    icon: 'mdi-email',
    color: 'success'
  },
  {
    title: 'Phone',
    value: settings.value?.contact_phone || 'Not Available',
    icon: 'mdi-phone',
    color: 'warning'
  },
  {
    title: 'Location',
    value: settings.value?.business_address || 'Siddharth Nagar, Uttar Pradesh',
    icon: 'mdi-map-marker',
    color: 'error'
  },
  {
    title: 'Support',
    value: settings.value?.support_text || 'Demo, Installation, Training & Customization',
    icon: 'mdi-headset',
    color: 'info'
  }
])

const clearErrors = () => {
  Object.keys(formErrors).forEach((key) => {
    formErrors[key] = []
  })
}

const validateForm = () => {
  clearErrors()

  let valid = true

  if (!form.school_name) {
    formErrors.school_name = ['School name is required']
    valid = false
  }

  if (!form.contact_person) {
    formErrors.contact_person = ['Contact person is required']
    valid = false
  }

  if (!form.mobile) {
    formErrors.mobile = ['Mobile number is required']
    valid = false
  } else if (!/^[6-9]\d{9}$/.test(form.mobile)) {
    formErrors.mobile = ['Enter a valid 10 digit Indian mobile number']
    valid = false
  }

  if (!form.email) {
    formErrors.email = ['Email address is required']
    valid = false
  } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
    formErrors.email = ['Enter a valid email address']
    valid = false
  }

  if (!form.interested_plan) {
    formErrors.interested_plan = ['Please select a plan']
    valid = false
  }

  if (!form.school_type) {
    formErrors.school_type = ['Please select institution type']
    valid = false
  }

  return valid
}

const submitForm = async () => {
  successMessage.value = ''
  errorMessage.value = ''

  if (!validateForm()) return

  loading.value = true

  try {
    const response = await api.post('/public/demo-enquiries', form)

    successMessage.value =
      response.data.message || 'Thank you! Your demo request has been submitted successfully.'

    form.school_name = ''
    form.contact_person = ''
    form.mobile = ''
    form.email = ''
    form.interested_plan = '15 Days Free Demo'
    form.school_type = ''
    form.message = ''
  } catch (error) {
    if (error.response?.data?.errors) {
      Object.assign(formErrors, error.response.data.errors)
    }

    errorMessage.value =
      error.response?.data?.message || 'Something went wrong. Please try again.'
  } finally {
    loading.value = false
  }
}

onMounted(fetchSettings)

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
.contact-page {
  background:
    radial-gradient(circle at top left, rgba(var(--v-theme-primary), 0.12), transparent 34%),
    rgb(var(--v-theme-background));
}

.contact-hero {
  background:
    linear-gradient(135deg, rgba(var(--v-theme-primary), 0.12), rgba(var(--v-theme-secondary), 0.06)),
    rgb(var(--v-theme-surface));
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.hero-title {
  font-size: clamp(34px, 5vw, 58px);
  font-weight: 900;
  line-height: 1.1;
  letter-spacing: -1.5px;
  color: rgb(var(--v-theme-on-background));
}

.hero-subtitle {
  font-size: 18px;
  line-height: 1.8;
  color: rgba(var(--v-theme-on-background), 0.72);
  max-width: 760px;
}

.hero-points {
  display: grid;
  gap: 12px;
}

.hero-point {
  display: flex;
  align-items: center;
  gap: 10px;
  color: rgba(var(--v-theme-on-background), 0.86);
  font-weight: 500;
}

.hero-card,
.glass-card {
  background: rgba(var(--v-theme-surface), 0.92);
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  backdrop-filter: blur(16px);
}

.contact-content {
  padding: 56px 0;
}

.demo-feature {
  display: flex;
  align-items: center;
  margin-bottom: 13px;
  color: rgba(var(--v-theme-on-surface), 0.88);
  font-size: 14px;
}

.contact-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 24px;
}

.gradient-card {
  background: linear-gradient(135deg, #2563eb, #7c3aed);
}

.opacity-text {
  opacity: 0.9;
}

.benefit-item {
  display: flex;
  align-items: center;
  color: white;
  margin-bottom: 12px;
  font-size: 14px;
}

:deep(.v-field) {
  border-radius: 14px;
}

@media (max-width: 600px) {
  .contact-content {
    padding: 32px 0;
  }
}


/* GSAP animation helper: keeps elements visible before GSAP takes over */
.gsap-animate {
  will-change: transform, opacity;
}

</style>