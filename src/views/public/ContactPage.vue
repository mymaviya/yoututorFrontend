<template>
  <v-container fluid class="contact-page pa-0">
    <section class="contact-hero py-12">
      <v-container>
        <div class="text-center">
          <v-chip color="primary" variant="flat" class="mb-4">
            Contact Us
          </v-chip>

          <h1 class="page-title">
            Request a Free Demo
          </h1>

          <p class="page-subtitle">
            Fill the form and our team will contact you for a 15 days free demo.
          </p>
        </div>
      </v-container>
    </section>

    <v-container class="py-10">
      <v-row>
        <!-- CONTACT FORM -->
        <v-col cols="12" md="7">
          <v-card rounded="xl" elevation="5" class="pa-6">
            <h2 class="text-h5 font-weight-bold mb-5">
              Send Enquiry
            </h2>

            <v-form ref="formRef" @submit.prevent="submitForm">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.school_name"
                    label="School / Institution Name"
                    variant="outlined"
                    density="comfortable"
                    :error-messages="formErrors.school_name"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.contact_person"
                    label="Contact Person"
                    variant="outlined"
                    density="comfortable"
                    :error-messages="formErrors.contact_person"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.mobile"
                    label="Mobile Number"
                    variant="outlined"
                    density="comfortable"
                    :error-messages="formErrors.mobile"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.email"
                    label="Email Address"
                    variant="outlined"
                    density="comfortable"
                    :error-messages="formErrors.email"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-select
                    v-model="form.plan"
                    label="Interested Plan"
                    :items="plans"
                    variant="outlined"
                    density="comfortable"
                    :error-messages="formErrors.plan"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-select
                    v-model="form.school_type"
                    label="School Type"
                    :items="schoolTypes"
                    variant="outlined"
                    density="comfortable"
                    :error-messages="formErrors.school_type"
                  />
                </v-col>

                <v-col cols="12">
                  <v-textarea
                    v-model="form.message"
                    label="Message"
                    variant="outlined"
                    rows="4"
                    auto-grow
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
                  >
                    Submit Enquiry
                  </v-btn>
                </v-col>
              </v-row>
            </v-form>
          </v-card>
        </v-col>

        <!-- CONTACT INFO -->
        <v-col cols="12" md="5">
          <v-card rounded="xl" elevation="5" class="pa-6 mb-5">
            <h2 class="text-h5 font-weight-bold mb-5">
              Contact Details
            </h2>

            <div
              v-for="item in contactInfo"
              :key="item.title"
              class="contact-item"
            >
              <v-avatar :color="item.color" size="44" class="mr-4">
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

          <v-card rounded="xl" elevation="5" class="pa-6 demo-box">
            <h3 class="text-h6 font-weight-bold mb-3">
              What You Get in Free Demo
            </h3>

            <div
              v-for="feature in demoFeatures"
              :key="feature"
              class="demo-feature"
            >
              <v-icon color="success" size="20" class="mr-2">
                mdi-check-circle
              </v-icon>
              <span>{{ feature }}</span>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-container>
</template>

<script setup>
import { reactive, ref } from 'vue'

const loading = ref(false)

const form = reactive({
  school_name: '',
  contact_person: '',
  mobile: '',
  email: '',
  plan: '15 Days Free Demo',
  school_type: '',
  message: ''
})

const formErrors = reactive({
  school_name: [],
  contact_person: [],
  mobile: [],
  email: [],
  plan: [],
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
  'Other'
]

const contactInfo = [
  {
    title: 'Company',
    value: 'Maviya IT Services',
    icon: 'mdi-domain',
    color: 'primary'
  },
  {
    title: 'Email',
    value: 'contact@yoututor.in',
    icon: 'mdi-email',
    color: 'success'
  },
  {
    title: 'Location',
    value: 'Lucknow, Uttar Pradesh',
    icon: 'mdi-map-marker',
    color: 'error'
  },
  {
    title: 'Support',
    value: 'Demo, Installation, Training & Customization',
    icon: 'mdi-headset',
    color: 'info'
  }
]

const demoFeatures = [
  'All features enabled',
  'Question Bank Management',
  'Blueprint Based Paper Creation',
  "Bloom's Taxonomy Distribution",
  'Auto Paper Generator',
  'Teacher Task Management',
  'PDF Export',
  'Admin & Teacher Login'
]

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
    formErrors.mobile = ['Enter a valid 10 digit mobile number']
    valid = false
  }

  if (!form.email) {
    formErrors.email = ['Email address is required']
    valid = false
  } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
    formErrors.email = ['Enter a valid email address']
    valid = false
  }

  if (!form.plan) {
    formErrors.plan = ['Please select a plan']
    valid = false
  }

  if (!form.school_type) {
    formErrors.school_type = ['Please select school type']
    valid = false
  }

  return valid
}

const submitForm = async () => {
  if (!validateForm()) return

  loading.value = true

  try {
    /*
      Later connect this with backend subscription/enquiry API.

      Example:

      await api.post('/public/demo-enquiries', form)
    */

    console.log('Demo enquiry submitted:', form)

    alert('Thank you! Your enquiry has been submitted successfully.')

    form.school_name = ''
    form.contact_person = ''
    form.mobile = ''
    form.email = ''
    form.plan = '15 Days Free Demo'
    form.school_type = ''
    form.message = ''
  } catch (error) {
    console.error(error)
    alert('Something went wrong. Please try again.')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.contact-hero {
  background: linear-gradient(135deg, #e3f2fd, #f8f9ff);
}

.page-title {
  font-size: 40px;
  font-weight: 800;
}

.page-subtitle {
  font-size: 17px;
  color: #666;
  margin-top: 10px;
}

.contact-item {
  display: flex;
  align-items: center;
  margin-bottom: 22px;
}

.demo-box {
  background: linear-gradient(135deg, #ffffff, #eef7ff);
}

.demo-feature {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
}

@media (max-width: 600px) {
  .page-title {
    font-size: 30px;
  }
}
</style>