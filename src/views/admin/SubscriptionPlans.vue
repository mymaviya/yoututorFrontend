<template>
  <v-container fluid>
    <v-card rounded="xl" elevation="3">
      <v-card-title class="d-flex flex-wrap align-center ga-3">
        <div>
          <h2 class="text-h5 font-weight-bold">Subscription Plans</h2>
          <p class="text-body-2 text-medium-emphasis mb-0">
            Manage pricing plans, display features, module access, popularity and status.
          </p>
        </div>

        <v-spacer />

        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="openCreateDialog"
        >
          Add Plan
        </v-btn>
      </v-card-title>

      <v-divider />

      <v-card-text>
        <v-row>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="filters.search"
              label="Search plan"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-magnify"
              clearable
              @keyup.enter="fetchPlans"
              @click:clear="clearSearch"
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-select
              v-model="filters.status"
              label="Status"
              :items="statusOptions"
              variant="outlined"
              density="comfortable"
              clearable
              @update:model-value="fetchPlans"
            />
          </v-col>

          <v-col cols="12" md="2">
            <v-btn color="primary" block height="48" @click="fetchPlans">
              Search
            </v-btn>
          </v-col>
        </v-row>

        <v-data-table-server
          v-model:items-per-page="pagination.per_page"
          :headers="headers"
          :items="plans"
          :items-length="pagination.total"
          :loading="loading"
          item-value="id"
          class="rounded-lg"
          @update:options="onTableOptions"
        >
          <template #item.name="{ item }">
            <div class="font-weight-bold">{{ item.name }}</div>
            <div class="text-caption text-medium-emphasis">{{ item.slug }}</div>
          </template>

          <template #item.price="{ item }">
            <div v-if="item.is_trial">
              <v-chip color="success" variant="tonal" size="small">
                {{ item.trial_days }} Days Free Demo
              </v-chip>
            </div>

            <div v-else-if="item.slug === 'lifetime'">
              <strong>₹{{ formatAmount(item.yearly_price) }}</strong>
              <div class="text-caption text-medium-emphasis">One-time</div>
            </div>

            <div v-else>
              <strong>₹{{ formatAmount(item.monthly_display_price) }}/month</strong>
              <div class="text-caption text-medium-emphasis">
                ₹{{ formatAmount(item.yearly_price) }}/year
              </div>
            </div>
          </template>

          <template #item.flags="{ item }">
            <div class="d-flex flex-wrap ga-2">
              <v-chip
                v-if="item.is_trial"
                color="success"
                variant="tonal"
                size="small"
              >
                Trial
              </v-chip>

              <v-chip
                v-if="item.is_popular"
                color="primary"
                variant="tonal"
                size="small"
              >
                Popular
              </v-chip>

              <v-chip
                :color="item.is_active ? 'success' : 'error'"
                variant="flat"
                size="small"
              >
                {{ item.is_active ? 'Active' : 'Inactive' }}
              </v-chip>
            </div>
          </template>

          <template #item.features="{ item }">
            <div class="d-flex flex-column ga-1">
              <v-chip color="info" variant="tonal" size="small" class="align-self-start">
                {{ normalizedFeatures(item.features).length }} Display Features
              </v-chip>
              <v-chip color="primary" variant="tonal" size="small" class="align-self-start">
                {{ enabledFeatureKeys(item).length }} Modules Enabled
              </v-chip>
            </div>
          </template>

          <template #item.actions="{ item }">
            <div class="d-flex justify-end ga-2">
              <v-btn
                icon="mdi-eye"
                size="small"
                variant="tonal"
                color="primary"
                @click="openViewDialog(item)"
              />

              <v-btn
                icon="mdi-pencil"
                size="small"
                variant="tonal"
                color="warning"
                @click="openEditDialog(item)"
              />

              <v-btn
                icon="mdi-delete"
                size="small"
                variant="tonal"
                color="error"
                @click="deletePlan(item)"
              />
            </div>
          </template>
        </v-data-table-server>
      </v-card-text>
    </v-card>

    <!-- Create/Edit Dialog -->
    <v-dialog v-model="formDialog" max-width="1100" persistent>
      <v-card rounded="xl">
        <v-card-title class="font-weight-bold">
          {{ isEditing ? 'Edit Subscription Plan' : 'Create Subscription Plan' }}
        </v-card-title>

        <v-divider />

        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.name"
                label="Plan Name"
                variant="outlined"
                density="comfortable"
                :error-messages="formErrors.name"
                @blur="generateSlug"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.slug"
                label="Slug"
                variant="outlined"
                density="comfortable"
                :error-messages="formErrors.slug"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.monthly_display_price"
                label="Monthly Display Price"
                type="number"
                prefix="₹"
                variant="outlined"
                density="comfortable"
                :error-messages="formErrors.monthly_display_price"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.yearly_price"
                label="Yearly / Lifetime Price"
                type="number"
                prefix="₹"
                variant="outlined"
                density="comfortable"
                :error-messages="formErrors.yearly_price"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.yearly_saving"
                label="Yearly Saving"
                type="number"
                prefix="₹"
                variant="outlined"
                density="comfortable"
                :error-messages="formErrors.yearly_saving"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.duration_days"
                label="Duration Days"
                type="number"
                variant="outlined"
                density="comfortable"
                :error-messages="formErrors.duration_days"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.trial_days"
                label="Trial Days"
                type="number"
                variant="outlined"
                density="comfortable"
                :error-messages="formErrors.trial_days"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.sort_order"
                label="Sort Order"
                type="number"
                variant="outlined"
                density="comfortable"
                :error-messages="formErrors.sort_order"
              />
            </v-col>

            <v-col cols="12">
              <div class="d-flex flex-wrap ga-4">
                <v-switch
                  v-model="form.is_trial"
                  color="success"
                  label="Trial Plan"
                  inset
                  hide-details
                />

                <v-switch
                  v-model="form.is_popular"
                  color="primary"
                  label="Popular Plan"
                  inset
                  hide-details
                />

                <v-switch
                  v-model="form.is_active"
                  color="success"
                  label="Active"
                  inset
                  hide-details
                />
              </div>
            </v-col>

            <v-col cols="12">
              <v-card variant="tonal" rounded="lg">
                <v-card-title class="text-subtitle-1 font-weight-bold d-flex align-center">
                  Website Display Features
                  <v-spacer />
                  <v-btn
                    size="small"
                    color="primary"
                    variant="tonal"
                    prepend-icon="mdi-plus"
                    @click="addFeature"
                  >
                    Add Feature
                  </v-btn>
                </v-card-title>

                <v-card-text>
                  <div
                    v-for="(feature, index) in form.features"
                    :key="index"
                    class="d-flex ga-2 mb-2"
                  >
                    <v-text-field
                      v-model="form.features[index]"
                      label="Feature shown on pricing page"
                      variant="outlined"
                      density="comfortable"
                      hide-details
                    />

                    <v-btn
                      icon="mdi-delete"
                      color="error"
                      variant="tonal"
                      @click="removeFeature(index)"
                    />
                  </div>

                  <div
                    v-if="formErrors.features?.length"
                    class="text-error text-caption mt-1"
                  >
                    {{ formErrors.features[0] }}
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12">
              <v-card variant="outlined" rounded="lg">
                <v-card-title class="text-subtitle-1 font-weight-bold d-flex align-center">
                  ERP Module Access
                  <v-spacer />
                  <v-btn size="small" variant="text" color="primary" @click="enableAllFeatures">
                    Enable All
                  </v-btn>
                  <v-btn size="small" variant="text" color="error" @click="disableAllFeatures">
                    Disable All
                  </v-btn>
                </v-card-title>

                <v-card-subtitle>
                  These values are saved in <code>subscription_plan_feature_items</code> and control backend middleware + sidebar visibility.
                </v-card-subtitle>

                <v-card-text>
                  <v-row>
                    <v-col
                      v-for="feature in featureCatalog"
                      :key="feature.key"
                      cols="12"
                      md="6"
                      lg="4"
                    >
                      <v-checkbox
                        v-model="form.enabled_feature_keys"
                        :value="feature.key"
                        color="primary"
                        hide-details
                      >
                        <template #label>
                          <div>
                            <div class="font-weight-medium">{{ feature.label }}</div>
                            <div class="text-caption text-medium-emphasis">{{ feature.key }}</div>
                          </div>
                        </template>
                      </v-checkbox>
                    </v-col>
                  </v-row>

                  <div
                    v-if="formErrors.feature_items?.length"
                    class="text-error text-caption mt-1"
                  >
                    {{ formErrors.feature_items[0] }}
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12">
              <v-card variant="outlined" rounded="lg">
                <v-card-title class="text-subtitle-1 font-weight-bold">
                  Included Master Question Bank Packages
                </v-card-title>

                <v-card-subtitle>
                  Schools on this subscription plan will automatically get access to selected premium question bank packages.
                </v-card-subtitle>

                <v-card-text>
                  <v-select
                    v-model="form.question_bank_package_ids"
                    :items="questionBankPackages"
                    item-title="name"
                    item-value="id"
                    label="Question Bank Packages"
                    variant="outlined"
                    density="comfortable"
                    multiple
                    chips
                    closable-chips
                    clearable
                    :error-messages="formErrors.question_bank_package_ids"
                  >
                    <template #item="{ props, item }">
                      <v-list-item v-bind="props">
                        <template #subtitle>
                          {{ item.raw?.grade_group || item.raw?.package_type || '' }}
                        </template>
                      </v-list-item>
                    </template>
                  </v-select>

                  <v-alert
                    type="info"
                    variant="tonal"
                    density="comfortable"
                    class="mt-3"
                  >
                    Manual purchases can still be assigned separately as add-ons. This selection is bundled with the plan itself.
                  </v-alert>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />

          <v-btn variant="text" @click="closeFormDialog">
            Cancel
          </v-btn>

          <v-btn color="primary" :loading="saving" @click="savePlan">
            {{ isEditing ? 'Update' : 'Create' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- View Dialog -->
    <v-dialog v-model="viewDialog" max-width="850">
      <v-card rounded="xl">
        <v-card-title class="font-weight-bold">
          Plan Details
        </v-card-title>

        <v-divider />

        <v-card-text v-if="selectedPlan">
          <v-row>
            <v-col cols="12" md="6">
              <strong>Name:</strong>
              <div>{{ selectedPlan.name }}</div>
            </v-col>

            <v-col cols="12" md="6">
              <strong>Slug:</strong>
              <div>{{ selectedPlan.slug }}</div>
            </v-col>

            <v-col cols="12" md="6">
              <strong>Monthly Display:</strong>
              <div>₹{{ formatAmount(selectedPlan.monthly_display_price) }}</div>
            </v-col>

            <v-col cols="12" md="6">
              <strong>Yearly Price:</strong>
              <div>₹{{ formatAmount(selectedPlan.yearly_price) }}</div>
            </v-col>

            <v-col cols="12" md="6">
              <strong>Duration:</strong>
              <div>{{ selectedPlan.duration_days }} days</div>
            </v-col>

            <v-col cols="12" md="6">
              <strong>Status:</strong>
              <div>{{ selectedPlan.is_active ? 'Active' : 'Inactive' }}</div>
            </v-col>

            <v-col cols="12">
              <strong>Website Display Features:</strong>

              <div class="d-flex flex-wrap ga-2 mt-2">
                <v-chip
                  v-for="feature in normalizedFeatures(selectedPlan.features)"
                  :key="feature"
                  color="info"
                  variant="tonal"
                  size="small"
                >
                  {{ feature }}
                </v-chip>
              </div>
            </v-col>

            <v-col cols="12">
              <strong>Enabled ERP Modules:</strong>

              <div class="d-flex flex-wrap ga-2 mt-2">
                <v-chip
                  v-for="featureKey in enabledFeatureKeys(selectedPlan)"
                  :key="featureKey"
                  color="primary"
                  variant="tonal"
                  size="small"
                >
                  {{ featureLabel(featureKey) }}
                </v-chip>
              </div>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="viewDialog = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import api from '../../plugins/api'
import { useUIStore } from '../../stores/snackBar'

const ui = useUIStore()

const loading = ref(false)
const saving = ref(false)
const formDialog = ref(false)
const viewDialog = ref(false)
const isEditing = ref(false)
const selectedPlan = ref(null)

const plans = ref([])
const questionBankPackages = ref([])

const filters = reactive({
  search: '',
  status: null
})

const pagination = reactive({
  page: 1,
  per_page: 50,
  total: 0
})

const featureCatalog = [
  { key: 'academic_setup', label: 'Academic Setup' },
  { key: 'question_bank', label: 'Question Bank' },
  { key: 'approval_workflow', label: 'Approval Workflow' },
  { key: 'manual_paper_creation', label: 'Manual Paper Creation' },
  { key: 'blueprint_management', label: 'Blueprint Management' },
  { key: 'auto_paper_generator', label: 'Auto Paper Generator' },
  { key: 'teacher_management', label: 'Teacher Management' },
  { key: 'teacher_tasks', label: 'Teacher Tasks' },
  { key: 'exam_portion', label: 'Exam Portion' },
  { key: 'basic_reports', label: 'Basic Reports' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'import_export', label: 'Import / Export' },
  { key: 'premium_question_bank', label: 'Premium Question Bank' },
  { key: 'user_management', label: 'User Management' },
  { key: 'role_permission_management', label: 'Roles & Permissions' },
  { key: 'security_settings', label: 'Security Settings' },
  { key: 'crm', label: 'CRM' },
]

const form = reactive({
  id: null,
  name: '',
  slug: '',
  monthly_display_price: 0,
  yearly_price: 0,
  yearly_saving: 0,
  duration_days: 365,
  trial_days: 0,
  features: [''],
  enabled_feature_keys: [],
  question_bank_package_ids: [],
  is_trial: false,
  is_popular: false,
  is_active: true,
  sort_order: 0
})

const formErrors = reactive({
  name: [],
  slug: [],
  monthly_display_price: [],
  yearly_price: [],
  yearly_saving: [],
  duration_days: [],
  trial_days: [],
  features: [],
  feature_items: [],
  question_bank_package_ids: [],
  is_trial: [],
  is_popular: [],
  is_active: [],
  sort_order: []
})

const headers = [
  { title: 'Plan', key: 'name', sortable: false },
  { title: 'Price', key: 'price', sortable: false },
  { title: 'Duration', key: 'duration_days', sortable: false },
  { title: 'Features', key: 'features', sortable: false },
  { title: 'Status', key: 'flags', sortable: false },
  { title: 'Order', key: 'sort_order', sortable: false },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' }
]

const statusOptions = [
  { title: 'Active', value: 'active' },
  { title: 'Inactive', value: 'inactive' }
]


const fetchQuestionBankPackages = async () => {
  try {
    const response = await api.get('/admin/question-bank-packages', {
      params: {
        per_page: 1000,
        status: 'active'
      }
    })

    questionBankPackages.value = response.data.data?.data || []
  } catch (error) {
    ui.showSnackbar(
      error.response?.data?.message || 'Failed to load question bank packages',
      'error'
    )
  }
}

const fetchPlans = async () => {
  loading.value = true

  try {
    const response = await api.get('/admin/subscription-plans', {
      params: {
        page: pagination.page,
        per_page: pagination.per_page,
        search: filters.search,
        status: filters.status
      }
    })

    const result = response.data.data

    plans.value = result.data || []
    pagination.total = result.total || 0
    pagination.page = result.current_page || 1
    pagination.per_page = result.per_page || 50
  } catch (error) {
    ui.showSnackbar(error.response?.data?.message || 'Failed to load subscription plans', 'error')
  } finally {
    loading.value = false
  }
}

const onTableOptions = (options) => {
  pagination.page = options.page
  pagination.per_page = options.itemsPerPage
  fetchPlans()
}

const clearSearch = () => {
  filters.search = ''
  fetchPlans()
}

const clearErrors = () => {
  Object.keys(formErrors).forEach(key => {
    formErrors[key] = []
  })
}

const resetForm = () => {
  form.id = null
  form.name = ''
  form.slug = ''
  form.monthly_display_price = 0
  form.yearly_price = 0
  form.yearly_saving = 0
  form.duration_days = 365
  form.trial_days = 0
  form.features = ['']
  form.enabled_feature_keys = []
  form.question_bank_package_ids = []
  form.is_trial = false
  form.is_popular = false
  form.is_active = true
  form.sort_order = 0
}

const openCreateDialog = () => {
  clearErrors()
  resetForm()
  isEditing.value = false
  formDialog.value = true
}

const openEditDialog = (item) => {
  clearErrors()
  resetForm()

  isEditing.value = true
  form.id = item.id
  form.name = item.name
  form.slug = item.slug
  form.monthly_display_price = item.monthly_display_price
  form.yearly_price = item.yearly_price
  form.yearly_saving = item.yearly_saving
  form.duration_days = item.duration_days
  form.trial_days = item.trial_days
  form.features = normalizedFeatures(item.features).length
    ? normalizedFeatures(item.features)
    : ['']
  form.enabled_feature_keys = enabledFeatureKeys(item)
  form.question_bank_package_ids = selectedQuestionBankPackageIds(item)
  form.is_trial = Boolean(item.is_trial)
  form.is_popular = Boolean(item.is_popular)
  form.is_active = Boolean(item.is_active)
  form.sort_order = item.sort_order

  formDialog.value = true
}

const openViewDialog = (item) => {
  selectedPlan.value = item
  viewDialog.value = true
}

const closeFormDialog = () => {
  formDialog.value = false
}

const generateSlug = () => {
  if (isEditing.value || form.slug) return

  form.slug = String(form.name || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
}

const addFeature = () => {
  form.features.push('')
}

const removeFeature = (index) => {
  form.features.splice(index, 1)

  if (!form.features.length) {
    form.features.push('')
  }
}

const enableAllFeatures = () => {
  form.enabled_feature_keys = featureCatalog.map(feature => feature.key)
}

const disableAllFeatures = () => {
  form.enabled_feature_keys = []
}

const savePlan = async () => {
  clearErrors()
  saving.value = true

  const enabledKeys = [...new Set(form.enabled_feature_keys)]

  const payload = {
    ...form,
    features: form.features.map(item => String(item || '').trim()).filter(Boolean),
    question_bank_package_ids: form.question_bank_package_ids,
    feature_items: featureCatalog.map(feature => ({
      feature_key: feature.key,
      is_enabled: enabledKeys.includes(feature.key)
    })),
    monthly_display_price: Number(form.monthly_display_price || 0),
    yearly_price: Number(form.yearly_price || 0),
    yearly_saving: Number(form.yearly_saving || 0),
    duration_days: Number(form.duration_days || 1),
    trial_days: Number(form.trial_days || 0),
    sort_order: Number(form.sort_order || 0)
  }

  delete payload.enabled_feature_keys

  try {
    if (isEditing.value) {
      await api.put(`/admin/subscription-plans/${form.id}`, payload)
      ui.showSnackbar('Subscription plan updated successfully')
    } else {
      await api.post('/admin/subscription-plans', payload)
      ui.showSnackbar('Subscription plan created successfully')
    }

    formDialog.value = false
    fetchPlans()
  } catch (error) {
    if (error.response?.data?.errors) {
      Object.assign(formErrors, error.response.data.errors)
      ui.showSnackbar('Please fix the validation errors', 'error')
    } else {
      ui.showSnackbar(error.response?.data?.message || 'Failed to save subscription plan', 'error')
    }
  } finally {
    saving.value = false
  }
}

const deletePlan = async (item) => {
  const ok = await ui.confirmDialog(
    'Delete Subscription Plan',
    `Are you sure you want to delete ${item.name}?`
  )

  if (!ok) return

  try {
    await api.delete(`/admin/subscription-plans/${item.id}`)
    ui.showSnackbar('Subscription plan deleted successfully')
    fetchPlans()
  } catch (error) {
    ui.showSnackbar(error.response?.data?.message || 'Unable to delete plan.', 'error')
  }
}

const normalizedFeatures = (features) => {
  if (!features) return []

  if (Array.isArray(features)) return features.filter(Boolean)

  if (typeof features === 'string') {
    try {
      const parsed = JSON.parse(features)
      return Array.isArray(parsed) ? parsed.filter(Boolean) : []
    } catch {
      return features.split(',').map(item => item.trim()).filter(Boolean)
    }
  }

  return []
}

const enabledFeatureKeys = (plan) => {
  const items = plan?.feature_items || plan?.featureItems || []

  if (!Array.isArray(items)) return []

  return items
    .filter(item => Boolean(item.is_enabled))
    .map(item => item.feature_key)
    .filter(Boolean)
}


const selectedQuestionBankPackageIds = (plan) => {
  const packages = plan?.question_bank_packages || plan?.questionBankPackages || []

  if (!Array.isArray(packages)) return []

  return packages
    .map(item => item?.id || item?.question_bank_package_id)
    .filter(Boolean)
}

const featureLabel = (featureKey) => {
  return featureCatalog.find(feature => feature.key === featureKey)?.label || featureKey
}

const formatAmount = (amount) => {
  return Number(amount || 0).toLocaleString('en-IN', {
    maximumFractionDigits: 0
  })
}

onMounted(async () => {
  await fetchQuestionBankPackages()
  await fetchPlans()
})
</script>
