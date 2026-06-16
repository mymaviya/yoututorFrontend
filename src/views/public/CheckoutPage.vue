<template>
  <v-container fluid class="checkout-page pa-0">
    <section class="checkout-hero">
      <div class="hero-glow hero-glow-one"></div>
      <div class="hero-glow hero-glow-two"></div>

      <v-container class="hero-content">
        <div class="checkout-heading animate-item">
          <v-chip color="primary" variant="flat" class="mb-5">
            <v-icon start size="18">mdi-credit-card-check</v-icon>
            Secure Checkout
          </v-chip>

          <h1>Complete Your Subscription</h1>

          <p>
            Select your plan, fill institution details and activate your ERP subscription securely.
          </p>
        </div>
      </v-container>
    </section>

    <section class="checkout-content">
      <v-container>
        <v-row>
          <v-col cols="12" md="7">
            <v-card class="checkout-card animate-item" rounded="xl" elevation="10">
              <h2 class="mb-2">Institution Details</h2>

              <p class="text-medium-emphasis mb-6">
                These details will be used for subscription activation and support.
              </p>

              <v-alert
                v-if="errorMessage"
                type="error"
                variant="tonal"
                rounded="lg"
                class="mb-5"
                closable
                @click:close="errorMessage = ''"
              >
                {{ errorMessage }}
              </v-alert>

              <v-form @submit.prevent="createOrder">
                <v-row>
                  <v-col cols="12">
                    <v-select
                      v-model="form.subscription_plan_id"
                      label="Select Plan"
                      :items="paidPlanOptions"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-card-account-details-star"
                      :error-messages="formErrors.subscription_plan_id"
                      @update:model-value="setSelectedPlan"
                    />
                  </v-col>

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
                      type="email"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-email"
                      :error-messages="formErrors.email"
                    />
                  </v-col>

                  <v-col cols="12">
                    <v-checkbox
                      v-model="acceptedTerms"
                      color="primary"
                      :error-messages="formErrors.terms"
                    >
                      <template #label>
                        <span>
                          I agree to the
                          <router-link to="/terms-and-conditions">Terms & Conditions</router-link>,
                          <router-link to="/privacy-policy">Privacy Policy</router-link>
                          and
                          <router-link to="/refund-policy">Refund Policy</router-link>.
                        </span>
                      </template>
                    </v-checkbox>
                  </v-col>

                  <v-col cols="12">
                    <v-btn
                      type="submit"
                      color="primary"
                      size="large"
                      rounded="xl"
                      block
                      :loading="loading"
                      :disabled="!selectedPlan"
                    >
                      Pay ₹{{ formatAmount(selectedPlan?.yearly_price || 0) }} Securely
                      <v-icon end>mdi-lock-check</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-form>
            </v-card>
          </v-col>

          <v-col cols="12" md="5">
            <v-card class="summary-card animate-item" rounded="xl" elevation="10">
              <div class="d-flex align-center mb-5">
                <v-avatar color="primary" rounded="lg" size="54" class="mr-3">
                  <v-icon color="white" size="30">
                    {{ selectedPlan ? planIcon(selectedPlan.slug) : 'mdi-cart' }}
                  </v-icon>
                </v-avatar>

                <div>
                  <h3 class="font-weight-black">
                    {{ selectedPlan?.name || 'Select a Plan' }}
                  </h3>
                  <div class="text-caption text-medium-emphasis">
                    Annual ERP Subscription
                  </div>
                </div>
              </div>

              <v-divider class="mb-5" />

              <template v-if="selectedPlan">
                <div class="price-summary">
                  <div>
                    <span>Monthly Display Price</span>
                    <strong>₹{{ formatAmount(selectedPlan.monthly_display_price) }}/month</strong>
                  </div>

                  <div>
                    <span>Yearly Billing</span>
                    <strong>₹{{ formatAmount(selectedPlan.yearly_price) }}</strong>
                  </div>

                  <div v-if="selectedPlan.yearly_saving > 0">
                    <span>Yearly Saving</span>
                    <strong class="text-success">
                      ₹{{ formatAmount(selectedPlan.yearly_saving) }}
                    </strong>
                  </div>
                </div>

                <v-alert color="success" variant="tonal" rounded="lg" class="my-5">
                  Your subscription will be activated after successful Razorpay payment verification.
                </v-alert>

                <h4 class="mb-3">Plan Features</h4>

                <div class="feature-list">
                  <div
                    v-for="feature in selectedPlan.features"
                    :key="feature"
                    class="feature-item"
                  >
                    <v-icon color="success" size="18">mdi-check-circle</v-icon>
                    <span>{{ feature }}</span>
                  </div>
                </div>
              </template>

              <template v-else>
                <v-alert color="info" variant="tonal" rounded="lg">
                  Please select a subscription plan to continue.
                </v-alert>
              </template>
            </v-card>

            <v-card class="secure-card animate-item mt-5" rounded="xl" elevation="6">
              <v-icon color="success" size="42" class="mb-3">
                mdi-shield-lock
              </v-icon>

              <h3>Secure Payment</h3>

              <p>
                Payments are processed securely through Razorpay. We do not store card,
                banking or UPI credentials.
              </p>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>
  </v-container>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref, onUnmounted } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useRoute, useRouter } from 'vue-router'
import api from '../../plugins/api'
import { useSettings } from '../../composables/useSettings'

gsap.registerPlugin(ScrollTrigger)

const route = useRoute()
const router = useRouter()

const { settings, fetchSettings } = useSettings()

const loading = ref(false)
const plans = ref([])
const selectedPlan = ref(null)
const acceptedTerms = ref(false)
const errorMessage = ref('')

const form = reactive({
  subscription_plan_id: null,
  school_name: '',
  contact_person: '',
  mobile: '',
  email: ''
})

const formErrors = reactive({
  subscription_plan_id: [],
  school_name: [],
  contact_person: [],
  mobile: [],
  email: [],
  terms: []
})

const normalizedPlans = computed(() => {
  return plans.value.map((plan) => ({
    ...plan,
    is_trial: Boolean(plan.is_trial),
    is_popular: Boolean(plan.is_popular),
    monthly_display_price: Number(plan.monthly_display_price || 0),
    yearly_price: Number(plan.yearly_price || 0),
    yearly_saving: Number(plan.yearly_saving || 0),
    features: normalizedFeatures(plan.features)
  }))
})

const paidPlans = computed(() => {
  return normalizedPlans.value
    .filter(plan => !plan.is_trial)
    .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
})

const paidPlanOptions = computed(() => {
  return paidPlans.value.map(plan => ({
    title: `${plan.name} - ₹${formatAmount(plan.yearly_price)}/year`,
    value: plan.id
  }))
})

const fetchPlans = async () => {
  try {
    const response = await api.get('/public/plans')
    plans.value = response.data.data || []

    await nextTick()

    if (route.query.plan) {
      const plan = paidPlans.value.find(item => item.slug === route.query.plan)

      if (plan) {
        form.subscription_plan_id = plan.id
        selectedPlan.value = plan
      }
    }
  } catch (error) {
    errorMessage.value = 'Unable to load subscription plans.'
  }
}

const setSelectedPlan = () => {
  selectedPlan.value = paidPlans.value.find(
    plan => Number(plan.id) === Number(form.subscription_plan_id)
  )
}

const clearErrors = () => {
  Object.keys(formErrors).forEach(key => {
    formErrors[key] = []
  })
}

const validateForm = () => {
  clearErrors()
  let valid = true

  if (!form.subscription_plan_id) {
    formErrors.subscription_plan_id = ['Please select a plan']
    valid = false
  }

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

  if (!acceptedTerms.value) {
    formErrors.terms = ['Please accept terms and policies']
    valid = false
  }

  return valid
}

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

const createOrder = async () => {
  errorMessage.value = ''

  if (!validateForm()) return

  loading.value = true

  try {
    const scriptLoaded = await loadRazorpayScript()

    if (!scriptLoaded) {
      errorMessage.value = 'Unable to load Razorpay checkout. Please try again.'
      return
    }

    const response = await api.post('/public/payment/create-order', form)
    const data = response.data.data

    const options = {
      key: data.key,
      amount: data.amount,
      currency: data.currency,
      name: settings.value?.site_name || 'YouTutor ERP',
      description: `${data.plan.name} Subscription`,
      order_id: data.order_id,
      image: settings.value?.site_logo || '/logo.png',
      prefill: {
        name: data.customer.name,
        email: data.customer.email,
        contact: data.customer.contact
      },
      notes: {
        school_name: form.school_name,
        plan: data.plan.name
      },
      theme: {
        color: '#2563EB'
      },
      handler: async (paymentResponse) => {
        await verifyPayment(data.subscription_id, paymentResponse)
      }
    }

    const razorpay = new window.Razorpay(options)
    razorpay.open()
  } catch (error) {
    if (error.response?.data?.errors) {
      Object.assign(formErrors, error.response.data.errors)
    }

    errorMessage.value = error.response?.data?.message || 'Unable to create payment order.'
  } finally {
    loading.value = false
  }
}

const verifyPayment = async (subscriptionId, paymentResponse) => {
  loading.value = true

  try {
    await api.post('/public/payment/verify', {
      subscription_id: subscriptionId,
      razorpay_order_id: paymentResponse.razorpay_order_id,
      razorpay_payment_id: paymentResponse.razorpay_payment_id,
      razorpay_signature: paymentResponse.razorpay_signature
    })

    router.push('/subscription-success')
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Payment verification failed.'
  } finally {
    loading.value = false
  }
}

const normalizedFeatures = (features) => {
  if (!features) return []

  if (Array.isArray(features)) return features

  if (typeof features === 'string') {
    try {
      return JSON.parse(features)
    } catch {
      return features.split(',').map(item => item.trim()).filter(Boolean)
    }
  }

  return []
}

const formatAmount = (amount) => {
  return Number(amount || 0).toLocaleString('en-IN', {
    maximumFractionDigits: 0
  })
}

const planIcon = (slug) => {
  const icons = {
    essential: 'mdi-seed',
    professional: 'mdi-rocket-launch',
    enterprise: 'mdi-domain',
    lifetime: 'mdi-infinity'
  }

  return icons[slug] || 'mdi-card-account-details-star'
}

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
    el.style.transitionDelay = `${Math.min(index * 70, 280)}ms`
    observer.observe(el)
  })
}

onMounted(async () => {
  fetchSettings()
  await fetchPlans()
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
.checkout-page {
  overflow: hidden;
  background:
    radial-gradient(circle at top left, rgba(var(--v-theme-primary), 0.15), transparent 34%),
    radial-gradient(circle at 90% 12%, rgba(124, 58, 237, 0.13), transparent 30%),
    rgb(var(--v-theme-background));
}

.checkout-hero {
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

.checkout-heading {
  max-width: 850px;
  margin: 0 auto;
  text-align: center;
}

.checkout-heading h1 {
  font-size: clamp(40px, 6vw, 68px);
  font-weight: 950;
  line-height: 1.05;
  letter-spacing: -2px;
  color: rgb(var(--v-theme-on-background));
}

.checkout-heading p {
  max-width: 720px;
  margin: 18px auto 0;
  font-size: 18px;
  line-height: 1.8;
  color: rgba(var(--v-theme-on-background), 0.72);
}

.checkout-content {
  padding: 70px 0 90px;
}

.checkout-card,
.summary-card,
.secure-card {
  padding: 32px;
  background: rgba(var(--v-theme-surface), 0.94);
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  backdrop-filter: blur(14px);
}

.checkout-card h2 {
  font-size: 30px;
  font-weight: 950;
}

.summary-card h3,
.secure-card h3 {
  font-weight: 950;
}

.price-summary {
  display: grid;
  gap: 14px;
}

.price-summary div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(var(--v-theme-primary), 0.06);
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.price-summary span {
  color: rgba(var(--v-theme-on-surface), 0.68);
}

.price-summary strong {
  color: rgb(var(--v-theme-on-surface));
}

.feature-list {
  display: grid;
  gap: 11px;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  color: rgba(var(--v-theme-on-surface), 0.76);
  font-size: 14px;
}

.secure-card p {
  color: rgba(var(--v-theme-on-surface), 0.7);
  line-height: 1.7;
}

:deep(.v-field) {
  border-radius: 14px;
}

@media (max-width: 600px) {
  .checkout-hero {
    padding: 58px 0;
  }

  .checkout-content {
    padding: 44px 0 62px;
  }

  .checkout-card,
  .summary-card,
  .secure-card {
    padding: 24px;
  }

  .price-summary div {
    flex-direction: column;
    align-items: flex-start;
  }
}


/* GSAP animation helper: keeps elements visible before GSAP takes over */
.gsap-animate {
  will-change: transform, opacity;
}

</style>