<template>
  <v-container fluid>
    <v-row class="mb-4">
      <v-col
        v-for="card in summaryCards"
        :key="card.label"
        cols="12"
        sm="6"
        md="4"
        lg="2"
      >
        <v-card rounded="xl" elevation="3" class="pa-4 h-100">
          <v-icon :color="card.color" size="32" class="mb-2">
            {{ card.icon }}
          </v-icon>

          <div class="text-h5 font-weight-black">
            {{ card.value }}
          </div>

          <div class="text-caption text-medium-emphasis">
            {{ card.label }}
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-card rounded="xl" elevation="3">
      <v-card-title class="d-flex flex-wrap align-center ga-3">
        <div>
          <h2 class="text-h5 font-weight-bold">Demo Enquiries CRM</h2>
          <p class="text-body-2 text-medium-emphasis mb-0">
            Manage leads, follow-ups, remarks, trials and conversions.
          </p>
        </div>

        <v-spacer />

        <v-btn
          color="primary"
          prepend-icon="mdi-refresh"
          :loading="loading"
          @click="fetchEnquiries"
        >
          Refresh
        </v-btn>
      </v-card-title>

      <v-divider />

      <v-card-text>
        <v-row>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="filters.search"
              label="Search school, person, mobile, email"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-magnify"
              clearable
              @keyup.enter="fetchEnquiries"
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
              @update:model-value="fetchEnquiries"
            />
          </v-col>

          <v-col cols="12" md="2">
            <v-btn color="primary" block height="48" @click="fetchEnquiries">
              Search
            </v-btn>
          </v-col>
        </v-row>

        <v-data-table-server
          v-model:items-per-page="pagination.per_page"
          :headers="headers"
          :items="enquiries"
          :items-length="pagination.total"
          :loading="loading"
          item-value="id"
          class="rounded-lg"
          @update:options="onTableOptions"
        >
          <template #item.school_name="{ item }">
            <div class="font-weight-bold">{{ item.school_name }}</div>
            <div class="text-caption text-medium-emphasis">
              {{ item.school_type || 'N/A' }}
            </div>
          </template>

          <template #item.contact="{ item }">
            <div>{{ item.contact_person || 'N/A' }}</div>
            <div class="text-caption text-medium-emphasis">
              {{ item.mobile || 'N/A' }}
            </div>
          </template>

          <template #item.email="{ item }">
            <div>{{ item.email || 'N/A' }}</div>
          </template>

          <template #item.status="{ item }">
            <v-chip :color="statusColor(item.status)" variant="flat" size="small">
              {{ formatStatus(item.status) }}
            </v-chip>
          </template>

          <template #item.follow_up_date="{ item }">
            <span v-if="item.follow_up_date">
              {{ formatDateTime(item.follow_up_date) }}
            </span>
            <span v-else class="text-medium-emphasis">Not Set</span>
          </template>

          <template #item.demo_period="{ item }">
            <div v-if="item.demo_started_at">
              <div class="text-caption">
                Start: {{ formatDate(item.demo_started_at) }}
              </div>
              <div class="text-caption">
                End: {{ formatDate(item.demo_ends_at) }}
              </div>
            </div>

            <span v-else class="text-medium-emphasis">Not Started</span>
          </template>

          <template #item.created_at="{ item }">
            {{ formatDate(item.created_at) }}
          </template>

          <template #item.actions="{ item }">
            <div class="d-flex ga-2 justify-end">
              <v-btn
                icon="mdi-eye"
                size="small"
                variant="tonal"
                color="primary"
                @click="openViewDialog(item)"
              />

              <v-btn
                icon="mdi-message-text"
                size="small"
                variant="tonal"
                color="info"
                @click="openRemarkDialog(item)"
              />

              <v-btn
                icon="mdi-calendar-clock"
                size="small"
                variant="tonal"
                color="deep-purple"
                @click="openFollowUpDialog(item)"
              />

              <v-btn
                icon="mdi-pencil"
                size="small"
                variant="tonal"
                color="warning"
                @click="openStatusDialog(item)"
              />

              <v-btn
                icon="mdi-play-circle"
                size="small"
                variant="tonal"
                color="success"
                :disabled="['trial_started', 'converted'].includes(item.status)"
                @click="openStartDemoDialog(item)"
              />

              <v-btn
                icon="mdi-swap-horizontal-bold"
                size="small"
                variant="tonal"
                color="primary"
                :disabled="item.status === 'converted'"
                @click="openConvertDialog(item)"
              />
            </div>
          </template>
        </v-data-table-server>
      </v-card-text>
    </v-card>

    <!-- View Dialog -->
    <v-dialog v-model="viewDialog" max-width="980">
      <v-card rounded="xl">
        <v-card-title class="d-flex align-center">
          <div>
            <div class="font-weight-bold">Enquiry Details</div>
            <div class="text-caption text-medium-emphasis">
              Lead profile, trial details and CRM timeline
            </div>
          </div>

          <v-spacer />

          <v-chip v-if="selected" :color="statusColor(selected.status)" variant="flat" size="small">
            {{ formatStatus(selected.status) }}
          </v-chip>
        </v-card-title>

        <v-divider />

        <v-card-text v-if="selected">
          <v-tabs v-model="activeTab" color="primary">
            <v-tab value="details">Details</v-tab>
            <v-tab value="timeline">Timeline</v-tab>
            <v-tab value="trial">Trial</v-tab>
          </v-tabs>

          <v-window v-model="activeTab" class="mt-5">
            <v-window-item value="details">
              <v-row>
                <v-col cols="12" md="6">
                  <v-card variant="tonal" rounded="lg" class="pa-4 h-100">
                    <h3 class="text-subtitle-1 font-weight-bold mb-4">School Details</h3>

                    <div class="detail-row">
                      <strong>School:</strong>
                      <span>{{ selected.school_name || 'N/A' }}</span>
                    </div>

                    <div class="detail-row">
                      <strong>School Type:</strong>
                      <span>{{ selected.school_type || 'N/A' }}</span>
                    </div>

                    <div class="detail-row">
                      <strong>Interested Plan:</strong>
                      <span>{{ selected.interested_plan || 'Free Demo' }}</span>
                    </div>

                    <div class="detail-row">
                      <strong>Created:</strong>
                      <span>{{ formatDateTime(selected.created_at) }}</span>
                    </div>
                  </v-card>
                </v-col>

                <v-col cols="12" md="6">
                  <v-card variant="tonal" rounded="lg" class="pa-4 h-100">
                    <h3 class="text-subtitle-1 font-weight-bold mb-4">Contact Details</h3>

                    <div class="detail-row">
                      <strong>Person:</strong>
                      <span>{{ selected.contact_person || 'N/A' }}</span>
                    </div>

                    <div class="detail-row">
                      <strong>Mobile:</strong>
                      <span>{{ selected.mobile || 'N/A' }}</span>
                    </div>

                    <div class="detail-row">
                      <strong>Email:</strong>
                      <span>{{ selected.email || 'N/A' }}</span>
                    </div>

                    <div class="detail-row">
                      <strong>Last Contact:</strong>
                      <span>{{ formatDateTime(selected.last_contact_at) }}</span>
                    </div>
                  </v-card>
                </v-col>

                <v-col cols="12">
                  <v-card variant="tonal" rounded="lg" class="pa-4">
                    <h3 class="text-subtitle-1 font-weight-bold mb-2">Admin Note</h3>
                    <p class="mb-0 text-medium-emphasis">
                      {{ selected.admin_note || 'No admin note added.' }}
                    </p>
                  </v-card>
                </v-col>
              </v-row>
            </v-window-item>

            <v-window-item value="timeline">
              <v-timeline density="compact" side="end">
                <v-timeline-item
                  v-for="remark in selected.remarks || []"
                  :key="remark.id"
                  :dot-color="remarkColor(remark.type)"
                  size="small"
                >
                  <v-card rounded="lg" variant="tonal" class="pa-3">
                    <div class="d-flex flex-wrap align-center ga-2 mb-1">
                      <v-chip :color="remarkColor(remark.type)" size="x-small">
                        {{ formatStatus(remark.type) }}
                      </v-chip>

                      <span class="text-caption text-medium-emphasis">
                        {{ formatDateTime(remark.created_at) }}
                      </span>
                    </div>

                    <div>{{ remark.remark }}</div>

                    <div v-if="remark.follow_up_at" class="text-caption text-medium-emphasis mt-1">
                      Follow-up: {{ formatDateTime(remark.follow_up_at) }}
                    </div>
                  </v-card>
                </v-timeline-item>
              </v-timeline>

              <v-alert
                v-if="!selected.remarks?.length"
                color="info"
                variant="tonal"
                rounded="lg"
              >
                No CRM timeline found for this enquiry.
              </v-alert>
            </v-window-item>

            <v-window-item value="trial">
              <v-row>
                <v-col cols="12" md="6">
                  <v-card variant="tonal" rounded="lg" class="pa-4 h-100">
                    <h3 class="text-subtitle-1 font-weight-bold mb-4">Trial Period</h3>

                    <div class="detail-row">
                      <strong>Started:</strong>
                      <span>{{ formatDateTime(selected.demo_started_at) }}</span>
                    </div>

                    <div class="detail-row">
                      <strong>Ends:</strong>
                      <span>{{ formatDateTime(selected.demo_ends_at) }}</span>
                    </div>

                    <div class="detail-row">
                      <strong>Follow-up:</strong>
                      <span>{{ formatDateTime(selected.follow_up_date) }}</span>
                    </div>
                  </v-card>
                </v-col>

                <v-col cols="12" md="6">
                  <v-card variant="tonal" rounded="lg" class="pa-4 h-100">
                    <h3 class="text-subtitle-1 font-weight-bold mb-4">Conversion</h3>

                    <div class="detail-row">
                      <strong>Status:</strong>
                      <span>{{ formatStatus(selected.status) }}</span>
                    </div>

                    <div class="detail-row">
                      <strong>Subscription ID:</strong>
                      <span>{{ selected.converted_subscription_id || 'Not Converted' }}</span>
                    </div>
                  </v-card>
                </v-col>
              </v-row>
            </v-window-item>
          </v-window>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="viewDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Status Dialog -->
    <v-dialog v-model="statusDialog" max-width="520">
      <v-card rounded="xl">
        <v-card-title class="font-weight-bold">Update Status</v-card-title>
        <v-divider />

        <v-card-text>
          <v-select
            v-model="statusForm.status"
            label="Status"
            :items="statusOptions"
            variant="outlined"
            density="comfortable"
            :error-messages="formErrors.status"
          />

          <v-textarea
            v-model="statusForm.admin_note"
            label="Admin Note"
            variant="outlined"
            density="comfortable"
            rows="3"
            :error-messages="formErrors.admin_note"
          />
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="statusDialog = false">Cancel</v-btn>
          <v-btn color="warning" :loading="saving" @click="updateStatus">
            Update
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Start Demo Dialog -->
    <v-dialog v-model="startDemoDialog" max-width="520">
      <v-card rounded="xl">
        <v-card-title class="font-weight-bold">Start 15 Days Demo</v-card-title>
        <v-divider />

        <v-card-text>
          <v-alert color="success" variant="tonal" rounded="lg" class="mb-4">
            This will mark the lead as Trial Started and set demo validity for 15 days.
          </v-alert>

          <v-textarea
            v-model="startDemoForm.admin_note"
            label="Admin Note"
            variant="outlined"
            density="comfortable"
            rows="3"
            :error-messages="formErrors.admin_note"
          />
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="startDemoDialog = false">Cancel</v-btn>
          <v-btn color="success" :loading="saving" @click="startDemo">
            Start Demo
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Remark Dialog -->
    <v-dialog v-model="remarkDialog" max-width="560">
      <v-card rounded="xl">
        <v-card-title class="font-weight-bold">Add CRM Remark</v-card-title>
        <v-divider />

        <v-card-text>
          <v-select
            v-model="remarkForm.type"
            label="Remark Type"
            :items="remarkTypeOptions"
            variant="outlined"
            density="comfortable"
            :error-messages="formErrors.type"
          />

          <v-textarea
            v-model="remarkForm.remark"
            label="Remark"
            variant="outlined"
            density="comfortable"
            rows="4"
            :error-messages="formErrors.remark"
          />

          <v-text-field
            v-model="remarkForm.follow_up_at"
            label="Follow-up Date/Time"
            type="datetime-local"
            variant="outlined"
            density="comfortable"
            :error-messages="formErrors.follow_up_at"
          />
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="remarkDialog = false">Cancel</v-btn>
          <v-btn color="primary" :loading="saving" @click="addRemark">
            Save Remark
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Follow-up Dialog -->
    <v-dialog v-model="followUpDialog" max-width="520">
      <v-card rounded="xl">
        <v-card-title class="font-weight-bold">Schedule Follow-up</v-card-title>
        <v-divider />

        <v-card-text>
          <v-text-field
            v-model="followUpForm.follow_up_date"
            label="Follow-up Date/Time"
            type="datetime-local"
            variant="outlined"
            density="comfortable"
            :error-messages="formErrors.follow_up_date"
          />

          <v-textarea
            v-model="followUpForm.remarks"
            label="Remarks"
            variant="outlined"
            density="comfortable"
            rows="3"
            :error-messages="formErrors.remarks"
          />
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="followUpDialog = false">Cancel</v-btn>
          <v-btn color="deep-purple" :loading="saving" @click="updateFollowUp">
            Save Follow-up
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Convert Dialog -->
    <v-dialog v-model="convertDialog" max-width="560">
      <v-card rounded="xl">
        <v-card-title class="font-weight-bold">Convert to Subscription</v-card-title>
        <v-divider />

        <v-card-text>
          <v-select
            v-model="convertForm.subscription_plan_id"
            label="Subscription Plan"
            :items="planOptions"
            variant="outlined"
            density="comfortable"
            :error-messages="formErrors.subscription_plan_id"
          />

          <v-text-field
            v-model="convertForm.days"
            label="Custom Days Optional"
            type="number"
            variant="outlined"
            density="comfortable"
            :error-messages="formErrors.days"
          />
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="convertDialog = false">Cancel</v-btn>
          <v-btn color="primary" :loading="saving" @click="convertToSubscription">
            Convert
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import api from '../../plugins/api'
import { useUIStore } from '../../stores/snackBar'

const ui = useUIStore()

const loading = ref(false)
const saving = ref(false)

const enquiries = ref([])
const plans = ref([])
const selected = ref(null)
const activeTab = ref('details')

const viewDialog = ref(false)
const statusDialog = ref(false)
const startDemoDialog = ref(false)
const remarkDialog = ref(false)
const followUpDialog = ref(false)
const convertDialog = ref(false)

const filters = reactive({
  search: '',
  status: null
})

const pagination = reactive({
  page: 1,
  per_page: 20,
  total: 0
})

const statusForm = reactive({
  status: '',
  admin_note: ''
})

const startDemoForm = reactive({
  admin_note: ''
})

const remarkForm = reactive({
  type: 'remark',
  remark: '',
  follow_up_at: ''
})

const followUpForm = reactive({
  follow_up_date: '',
  remarks: ''
})

const convertForm = reactive({
  subscription_plan_id: null,
  days: ''
})

const formErrors = reactive({
  status: [],
  admin_note: [],
  type: [],
  remark: [],
  follow_up_at: [],
  follow_up_date: [],
  remarks: [],
  subscription_plan_id: [],
  days: []
})

const headers = [
  { title: 'School', key: 'school_name', sortable: false },
  { title: 'Contact', key: 'contact', sortable: false },
  { title: 'Email', key: 'email', sortable: false },
  { title: 'Status', key: 'status', sortable: false },
  { title: 'Follow-up', key: 'follow_up_date', sortable: false },
  { title: 'Demo Period', key: 'demo_period', sortable: false },
  { title: 'Created', key: 'created_at', sortable: false },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' }
]

const statusOptions = [
  { title: 'New', value: 'new' },
  { title: 'Contacted', value: 'contacted' },
  { title: 'Demo Scheduled', value: 'demo_scheduled' },
  { title: 'Demo Completed', value: 'demo_completed' },
  { title: 'Trial Started', value: 'trial_started' },
  { title: 'Converted', value: 'converted' },
  { title: 'Rejected', value: 'rejected' }
]

const remarkTypeOptions = [
  { title: 'Remark', value: 'remark' },
  { title: 'Call', value: 'call' },
  { title: 'WhatsApp', value: 'whatsapp' },
  { title: 'Email', value: 'email' },
  { title: 'Follow-up', value: 'follow_up' },
  { title: 'Demo Scheduled', value: 'demo_scheduled' }
]

const planOptions = computed(() => {
  return plans.value.map(plan => ({
    title: `${plan.name} - ₹${formatAmount(plan.yearly_price)}`,
    value: plan.id
  }))
})

const summaryCards = computed(() => {
  const total = enquiries.value.length
  const today = new Date().toISOString().slice(0, 10)

  return [
    {
      label: 'Total Leads',
      value: pagination.total || total,
      icon: 'mdi-account-group',
      color: 'primary'
    },
    {
      label: "Today's Leads",
      value: enquiries.value.filter(item => String(item.created_at || '').startsWith(today)).length,
      icon: 'mdi-calendar-today',
      color: 'info'
    },
    {
      label: 'Trial Started',
      value: enquiries.value.filter(item => item.status === 'trial_started').length,
      icon: 'mdi-play-circle',
      color: 'success'
    },
    {
      label: 'Converted',
      value: enquiries.value.filter(item => item.status === 'converted').length,
      icon: 'mdi-check-decagram',
      color: 'deep-purple'
    },
    {
      label: 'Follow-ups',
      value: enquiries.value.filter(item => item.follow_up_date).length,
      icon: 'mdi-calendar-clock',
      color: 'warning'
    },
    {
      label: 'Rejected',
      value: enquiries.value.filter(item => item.status === 'rejected').length,
      icon: 'mdi-close-circle',
      color: 'error'
    }
  ]
})

const fetchEnquiries = async () => {
  loading.value = true

  try {
    const response = await api.get('/admin/demo-enquiries', {
      params: {
        page: pagination.page,
        per_page: pagination.per_page,
        search: filters.search,
        status: filters.status
      }
    })

    const result = response.data.data

    enquiries.value = result.data || []
    pagination.total = result.total || 0
    pagination.page = result.current_page || 1
    pagination.per_page = result.per_page || 20
  } catch (error) {
    ui.showSnackbar(error.response?.data?.message || 'Unable to load enquiries.', 'error')
  } finally {
    loading.value = false
  }
}

const fetchPlans = async () => {
  try {
    const response = await api.get('/public/plans')
    plans.value = response.data.data || []
  } catch {
    plans.value = []
  }
}

const fetchSingleEnquiry = async (id) => {
  const response = await api.get(`/admin/demo-enquiries/${id}`)
  return response.data.data
}

const onTableOptions = (options) => {
  pagination.page = options.page
  pagination.per_page = options.itemsPerPage
  fetchEnquiries()
}

const clearSearch = () => {
  filters.search = ''
  fetchEnquiries()
}

const clearErrors = () => {
  Object.keys(formErrors).forEach(key => {
    formErrors[key] = []
  })
}

const openViewDialog = async (item) => {
  activeTab.value = 'details'
  selected.value = await fetchSingleEnquiry(item.id)
  viewDialog.value = true
}

const openStatusDialog = (item) => {
  clearErrors()
  selected.value = item
  statusForm.status = item.status
  statusForm.admin_note = item.admin_note || ''
  statusDialog.value = true
}

const openStartDemoDialog = (item) => {
  clearErrors()
  selected.value = item
  startDemoForm.admin_note = ''
  startDemoDialog.value = true
}

const openRemarkDialog = (item) => {
  clearErrors()
  selected.value = item
  remarkForm.type = 'remark'
  remarkForm.remark = ''
  remarkForm.follow_up_at = ''
  remarkDialog.value = true
}

const openFollowUpDialog = (item) => {
  clearErrors()
  selected.value = item
  followUpForm.follow_up_date = ''
  followUpForm.remarks = ''
  followUpDialog.value = true
}

const openConvertDialog = (item) => {
  clearErrors()
  selected.value = item
  convertForm.subscription_plan_id = null
  convertForm.days = ''
  convertDialog.value = true
}

const updateStatus = async () => {
  clearErrors()
  saving.value = true

  try {
    await api.put(`/admin/demo-enquiries/${selected.value.id}/status`, statusForm)

    statusDialog.value = false
    ui.showSnackbar('Status updated successfully.')
    fetchEnquiries()
  } catch (error) {
    handleErrors(error, 'Unable to update status.')
  } finally {
    saving.value = false
  }
}

const startDemo = async () => {
  const confirmed = await ui.confirmDialog(
    'Start 15 Days Demo',
    `Are you sure you want to start demo for <strong>${selected.value?.school_name || 'this school'}</strong>?`
  )

  if (!confirmed) return

  clearErrors()
  saving.value = true

  try {
    await api.put(`/admin/demo-enquiries/${selected.value.id}/start-demo`, startDemoForm)

    startDemoDialog.value = false
    ui.showSnackbar('15 days demo started successfully.')
    fetchEnquiries()
  } catch (error) {
    handleErrors(error, 'Unable to start demo.')
  } finally {
    saving.value = false
  }
}

const addRemark = async () => {
  clearErrors()
  saving.value = true

  try {
    await api.post(`/admin/demo-enquiries/${selected.value.id}/remarks`, remarkForm)

    remarkDialog.value = false
    ui.showSnackbar('Remark added successfully.')
    fetchEnquiries()
  } catch (error) {
    handleErrors(error, 'Unable to add remark.')
  } finally {
    saving.value = false
  }
}

const updateFollowUp = async () => {
  clearErrors()
  saving.value = true

  try {
    await api.put(`/admin/demo-enquiries/${selected.value.id}/follow-up`, followUpForm)

    followUpDialog.value = false
    ui.showSnackbar('Follow-up scheduled successfully.')
    fetchEnquiries()
  } catch (error) {
    handleErrors(error, 'Unable to update follow-up.')
  } finally {
    saving.value = false
  }
}

const convertToSubscription = async () => {
  const confirmed = await ui.confirmDialog(
    'Convert to Subscription',
    `Are you sure you want to convert <strong>${selected.value?.school_name || 'this lead'}</strong> to subscription?`
  )

  if (!confirmed) return

  clearErrors()
  saving.value = true

  try {
    const payload = {
      subscription_plan_id: convertForm.subscription_plan_id
    }

    if (convertForm.days) {
      payload.days = Number(convertForm.days)
    }

    await api.post(`/admin/demo-enquiries/${selected.value.id}/convert`, payload)

    convertDialog.value = false
    ui.showSnackbar('Lead converted to subscription successfully.')
    fetchEnquiries()
  } catch (error) {
    handleErrors(error, 'Unable to convert lead.')
  } finally {
    saving.value = false
  }
}

const handleErrors = (error, fallback) => {
  if (error.response?.data?.errors) {
    Object.assign(formErrors, error.response.data.errors)
  } else {
    ui.showSnackbar(error.response?.data?.message || fallback, 'error')
  }
}

const statusColor = (status) => {
  const colors = {
    new: 'info',
    contacted: 'primary',
    demo_scheduled: 'deep-purple',
    demo_completed: 'teal',
    trial_started: 'success',
    converted: 'green-darken-2',
    rejected: 'error'
  }

  return colors[status] || 'grey'
}

const remarkColor = (type) => {
  const colors = {
    remark: 'primary',
    call: 'success',
    whatsapp: 'green',
    email: 'info',
    follow_up: 'warning',
    status_change: 'deep-purple',
    demo_scheduled: 'indigo',
    trial_started: 'success',
    converted: 'green-darken-2'
  }

  return colors[type] || 'grey'
}

const formatStatus = (status) => {
  return String(status || 'N/A')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, char => char.toUpperCase())
}

const formatAmount = (amount) => {
  return Number(amount || 0).toLocaleString('en-IN', {
    maximumFractionDigits: 0
  })
}

const formatDate = (date) => {
  if (!date) return 'N/A'

  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

const formatDateTime = (date) => {
  if (!date) return 'N/A'

  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(async () => {
  await fetchPlans()
  await fetchEnquiries()
})
</script>

<style scoped>
.detail-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 9px 0;
  border-bottom: 1px dashed rgba(var(--v-border-color), var(--v-border-opacity));
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row span {
  text-align: right;
  color: rgba(var(--v-theme-on-surface), 0.72);
}

@media (max-width: 600px) {
  .detail-row {
    flex-direction: column;
    gap: 3px;
  }

  .detail-row span {
    text-align: left;
  }
}
</style>