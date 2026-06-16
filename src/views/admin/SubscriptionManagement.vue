<template>
  <v-container fluid>
    <v-card rounded="xl" elevation="3">
      <v-card-title class="d-flex flex-wrap align-center ga-3">
        <div>
          <h2 class="text-h5 font-weight-bold">Subscriptions</h2>
          <p class="text-body-2 text-medium-emphasis mb-0">
            Manage trials, paid plans, license keys, expiry, renewals and status.
          </p>
        </div>

        <v-spacer />

        <v-btn
          color="primary"
          prepend-icon="mdi-refresh"
          :loading="loading"
          @click="fetchSubscriptions"
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
              @keyup.enter="fetchSubscriptions"
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
              @update:model-value="fetchSubscriptions"
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-select
              v-model="filters.plan_id"
              label="Plan"
              :items="planOptions"
              variant="outlined"
              density="comfortable"
              clearable
              @update:model-value="fetchSubscriptions"
            />
          </v-col>

          <v-col cols="12" md="2">
            <v-btn color="primary" block height="48" @click="fetchSubscriptions">
              Search
            </v-btn>
          </v-col>
        </v-row>

        <v-data-table-server
          v-model:items-per-page="pagination.per_page"
          :headers="headers"
          :items="subscriptions"
          :items-length="pagination.total"
          :loading="loading"
          item-value="id"
          class="rounded-lg"
          @update:options="onTableOptions"
        >
          <template #item.school_name="{ item }">
            <div class="font-weight-bold">{{ item.school_name }}</div>
            <div class="text-caption text-medium-emphasis">
              {{ item.contact_person || 'N/A' }}
            </div>
          </template>

          <template #item.contact="{ item }">
            <div>{{ item.mobile || 'N/A' }}</div>
            <div class="text-caption text-medium-emphasis">
              {{ item.email || 'N/A' }}
            </div>
          </template>

          <template #item.plan="{ item }">
            <v-chip color="primary" variant="tonal" size="small">
              {{ item.plan?.name || 'No Plan' }}
            </v-chip>
          </template>

          <template #item.amount="{ item }">
            ₹{{ formatAmount(item.amount) }}
          </template>

          <template #item.status="{ item }">
            <v-chip :color="statusColor(item.status)" variant="flat" size="small">
              {{ formatStatus(item.status) }}
            </v-chip>
          </template>

          <template #item.license="{ item }">
            <div v-if="item.license_key">
              <v-chip
                :color="licenseColor(item.license_key.status)"
                variant="tonal"
                size="small"
              >
                {{ formatStatus(item.license_key.status) }}
              </v-chip>

              <div class="text-caption mt-1 license-text">
                {{ item.license_key.license_key }}
              </div>
            </div>

            <span v-else class="text-medium-emphasis">No License</span>
          </template>

          <template #item.period="{ item }">
            <div class="text-caption">
              Start: {{ formatDate(item.starts_at) }}
            </div>
            <div class="text-caption">
              End: {{ formatDate(item.ends_at) }}
            </div>
          </template>

          <template #item.actions="{ item }">
            <div class="d-flex ga-2 justify-end flex-wrap">
              <v-btn
                icon="mdi-eye"
                size="small"
                variant="tonal"
                color="primary"
                @click="openViewDialog(item)"
              />

              <v-btn
                icon="mdi-cash-check"
                size="small"
                variant="tonal"
                color="success"
                @click="openActivateDialog(item)"
              />

              <v-btn
                icon="mdi-calendar-plus"
                size="small"
                variant="tonal"
                color="info"
                @click="openExtendDialog(item)"
              />

              <v-btn
                icon="mdi-autorenew"
                size="small"
                variant="tonal"
                color="success"
                @click="openRenewDialog(item)"
              />

              <v-btn
                icon="mdi-pencil"
                size="small"
                variant="tonal"
                color="warning"
                @click="openStatusDialog(item)"
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
            <div class="font-weight-bold">Subscription Details</div>
            <div class="text-caption text-medium-emphasis">
              Subscription, license and renewal history
            </div>
          </div>

          <v-spacer />

          <v-chip
            v-if="selected"
            :color="statusColor(selected.status)"
            variant="flat"
            size="small"
          >
            {{ formatStatus(selected.status) }}
          </v-chip>
        </v-card-title>

        <v-divider />

        <v-card-text v-if="selected">
          <v-tabs v-model="activeTab" color="primary">
            <v-tab value="details">Details</v-tab>
            <v-tab value="license">License</v-tab>
            <v-tab value="renewals">Renewal History</v-tab>
          </v-tabs>

          <v-window v-model="activeTab" class="mt-5">
            <v-window-item value="details">
              <v-row>
                <v-col cols="12" md="6">
                  <v-card variant="tonal" rounded="lg" class="pa-4 h-100">
                    <h3 class="text-subtitle-1 font-weight-bold mb-4">
                      School Details
                    </h3>

                    <div class="detail-row">
                      <strong>School:</strong>
                      <span>{{ selected.school_name || 'N/A' }}</span>
                    </div>

                    <div class="detail-row">
                      <strong>Contact Person:</strong>
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
                  </v-card>
                </v-col>

                <v-col cols="12" md="6">
                  <v-card variant="tonal" rounded="lg" class="pa-4 h-100">
                    <h3 class="text-subtitle-1 font-weight-bold mb-4">
                      Subscription Details
                    </h3>

                    <div class="detail-row">
                      <strong>Plan:</strong>
                      <span>{{ selected.plan?.name || 'No Plan' }}</span>
                    </div>

                    <div class="detail-row">
                      <strong>Status:</strong>
                      <span>{{ formatStatus(selected.status) }}</span>
                    </div>

                    <div class="detail-row">
                      <strong>Amount:</strong>
                      <span>₹{{ formatAmount(selected.amount) }}</span>
                    </div>

                    <div class="detail-row">
                      <strong>Validity:</strong>
                      <span>{{ formatDate(selected.starts_at) }} to {{ formatDate(selected.ends_at) }}</span>
                    </div>
                  </v-card>
                </v-col>
              </v-row>
            </v-window-item>

            <v-window-item value="license">
              <v-row>
                <v-col cols="12">
                  <v-card variant="tonal" rounded="lg" class="pa-4">
                    <h3 class="text-subtitle-1 font-weight-bold mb-4">
                      License Details
                    </h3>

                    <div class="detail-row">
                      <strong>License Key:</strong>
                      <span>{{ selected.license_key?.license_key || 'No License' }}</span>
                    </div>

                    <div class="detail-row">
                      <strong>License Status:</strong>
                      <span>
                        {{ selected.license_key?.status ? formatStatus(selected.license_key.status) : 'N/A' }}
                      </span>
                    </div>

                    <div class="detail-row">
                      <strong>Activated At:</strong>
                      <span>{{ formatDate(selected.license_key?.activated_at) }}</span>
                    </div>

                    <div class="detail-row">
                      <strong>Expires At:</strong>
                      <span>{{ formatDate(selected.license_key?.expires_at) }}</span>
                    </div>
                  </v-card>
                </v-col>
              </v-row>
            </v-window-item>

            <v-window-item value="renewals">
              <v-alert
                v-if="!renewalHistory.length"
                color="info"
                variant="tonal"
                rounded="lg"
              >
                No renewal history found for this subscription.
              </v-alert>

              <v-table v-else density="comfortable">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Plan</th>
                    <th>Old End</th>
                    <th>New End</th>
                    <th>Days</th>
                    <th>Amount</th>
                    <th>Renewed By</th>
                    <th>Remarks</th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-for="renewal in renewalHistory" :key="renewal.id">
                    <td>
                      <v-chip color="primary" variant="tonal" size="small">
                        {{ formatStatus(renewal.renewal_type) }}
                      </v-chip>
                    </td>
                    <td>{{ renewal.plan?.name || selected.plan?.name || 'N/A' }}</td>
                    <td>{{ formatDate(renewal.old_end_date) }}</td>
                    <td>{{ formatDate(renewal.new_end_date) }}</td>
                    <td>{{ renewal.duration_days }}</td>
                    <td>₹{{ formatAmount(renewal.renewal_amount) }}</td>
                    <td>{{ renewal.renewed_by?.name || renewal.renewedBy?.name || 'N/A' }}</td>
                    <td>{{ renewal.remarks || 'N/A' }}</td>
                  </tr>
                </tbody>
              </v-table>
            </v-window-item>
          </v-window>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="viewDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Activate Paid Plan Dialog -->
    <v-dialog v-model="activateDialog" max-width="560">
      <v-card rounded="xl">
        <v-card-title class="font-weight-bold">Activate Paid Plan</v-card-title>
        <v-divider />

        <v-card-text>
          <v-select
            v-model="activateForm.subscription_plan_id"
            label="Select Plan"
            :items="paidPlanOptions"
            variant="outlined"
            density="comfortable"
            :error-messages="formErrors.subscription_plan_id"
            @update:model-value="setPlanAmount"
          />

          <v-text-field
            v-model="activateForm.amount"
            label="Amount"
            type="number"
            variant="outlined"
            density="comfortable"
            prefix="₹"
            :error-messages="formErrors.amount"
          />

          <v-text-field
            v-model="activateForm.starts_at"
            label="Start Date"
            type="date"
            variant="outlined"
            density="comfortable"
            :error-messages="formErrors.starts_at"
          />
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="activateDialog = false">Cancel</v-btn>
          <v-btn color="success" :loading="saving" @click="activatePaidPlan">
            Activate
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Extend Dialog -->
    <v-dialog v-model="extendDialog" max-width="480">
      <v-card rounded="xl">
        <v-card-title class="font-weight-bold">Extend Subscription</v-card-title>
        <v-divider />

        <v-card-text>
          <v-text-field
            v-model="extendForm.days"
            label="Extend Days"
            type="number"
            variant="outlined"
            density="comfortable"
            :error-messages="formErrors.days"
          />
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="extendDialog = false">Cancel</v-btn>
          <v-btn color="info" :loading="saving" @click="extendSubscription">
            Extend
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Renew Dialog -->
    <v-dialog v-model="renewDialog" max-width="720">
      <v-card rounded="xl">
        <v-card-title class="font-weight-bold">Renew / Upgrade Subscription</v-card-title>
        <v-divider />

        <v-card-text>
          <v-alert color="primary" variant="tonal" rounded="lg" class="mb-4">
            This will update subscription expiry, activate license and create renewal history.
          </v-alert>

          <v-row>
            <v-col cols="12" md="6">
              <v-select
                v-model="renewForm.subscription_plan_id"
                label="Subscription Plan"
                :items="paidPlanOptions"
                variant="outlined"
                density="comfortable"
                :error-messages="formErrors.subscription_plan_id"
                @update:model-value="setRenewPlanValues"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="renewForm.renewal_type"
                label="Renewal Type"
                :items="renewalTypeOptions"
                variant="outlined"
                density="comfortable"
                :error-messages="formErrors.renewal_type"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="renewForm.duration_days"
                label="Duration Days"
                type="number"
                variant="outlined"
                density="comfortable"
                :error-messages="formErrors.duration_days"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="renewForm.renewal_amount"
                label="Renewal Amount"
                type="number"
                prefix="₹"
                variant="outlined"
                density="comfortable"
                :error-messages="formErrors.renewal_amount"
              />
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="renewForm.remarks"
                label="Remarks"
                variant="outlined"
                density="comfortable"
                rows="3"
                :error-messages="formErrors.remarks"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="renewDialog = false">Cancel</v-btn>
          <v-btn color="success" :loading="saving" @click="renewSubscription">
            Renew Subscription
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Status Dialog -->
    <v-dialog v-model="statusDialog" max-width="480">
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
  </v-container>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import api from '../../plugins/api'
import { useUIStore } from '../../stores/snackBar'

const ui = useUIStore()

const loading = ref(false)
const saving = ref(false)

const subscriptions = ref([])
const plans = ref([])
const renewalHistory = ref([])
const selected = ref(null)
const activeTab = ref('details')

const viewDialog = ref(false)
const activateDialog = ref(false)
const extendDialog = ref(false)
const statusDialog = ref(false)
const renewDialog = ref(false)

const filters = reactive({
  search: '',
  status: null,
  plan_id: null
})

const pagination = reactive({
  page: 1,
  per_page: 50,
  total: 0
})

const activateForm = reactive({
  subscription_plan_id: null,
  amount: '',
  starts_at: new Date().toISOString().slice(0, 10)
})

const extendForm = reactive({
  days: 365
})

const renewForm = reactive({
  subscription_plan_id: null,
  duration_days: 365,
  renewal_amount: 0,
  renewal_type: 'renewal',
  remarks: ''
})

const statusForm = reactive({
  status: ''
})

const formErrors = reactive({
  subscription_plan_id: [],
  amount: [],
  starts_at: [],
  days: [],
  status: [],
  duration_days: [],
  renewal_amount: [],
  renewal_type: [],
  remarks: []
})

const headers = [
  { title: 'School', key: 'school_name', sortable: false },
  { title: 'Contact', key: 'contact', sortable: false },
  { title: 'Plan', key: 'plan', sortable: false },
  { title: 'Amount', key: 'amount', sortable: false },
  { title: 'Status', key: 'status', sortable: false },
  { title: 'License', key: 'license', sortable: false },
  { title: 'Period', key: 'period', sortable: false },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' }
]

const statusOptions = [
  { title: 'Trial', value: 'trial' },
  { title: 'Active', value: 'active' },
  { title: 'Expired', value: 'expired' },
  { title: 'Suspended', value: 'suspended' },
  { title: 'Cancelled', value: 'cancelled' },
  { title: 'Pending Payment', value: 'pending_payment' }
]

const renewalTypeOptions = [
  { title: 'Renewal', value: 'renewal' },
  { title: 'Upgrade', value: 'upgrade' },
  { title: 'Downgrade', value: 'downgrade' },
  { title: 'Trial Conversion', value: 'trial_conversion' },
  { title: 'Manual Extension', value: 'manual_extension' }
]

const planOptions = computed(() => {
  return plans.value.map(plan => ({
    title: plan.name,
    value: plan.id
  }))
})

const paidPlanOptions = computed(() => {
  return plans.value
    .filter(plan => !Boolean(plan.is_trial))
    .map(plan => ({
      title: `${plan.name} - ₹${formatAmount(plan.yearly_price)}`,
      value: plan.id
    }))
})

const clearErrors = () => {
  Object.keys(formErrors).forEach(key => {
    formErrors[key] = []
  })
}

const fetchPlans = async () => {
  try {
    const response = await api.get('/public/plans')
    plans.value = response.data.data || []
  } catch (error) {
    ui.showSnackbar(error.response?.data?.message || 'Unable to load plans.', 'error')
  }
}

const fetchSubscriptions = async () => {
  loading.value = true

  try {
    const response = await api.get('/admin/subscriptions', {
      params: {
        page: pagination.page,
        per_page: pagination.per_page,
        search: filters.search,
        status: filters.status,
        plan_id: filters.plan_id
      }
    })

    const result = response.data.data

    subscriptions.value = result.data || []
    pagination.total = result.total || 0
    pagination.page = result.current_page || 1
    pagination.per_page = result.per_page || 50
  } catch (error) {
    ui.showSnackbar(error.response?.data?.message || 'Unable to load subscriptions.', 'error')
  } finally {
    loading.value = false
  }
}

const fetchRenewalHistory = async (subscriptionId) => {
  try {
    const response = await api.get('/admin/subscription-renewals', {
      params: {
        subscription_id: subscriptionId,
        per_page: 100
      }
    })

    renewalHistory.value = response.data.data?.data || []
  } catch {
    renewalHistory.value = []
  }
}

const onTableOptions = (options) => {
  pagination.page = options.page
  pagination.per_page = options.itemsPerPage
  fetchSubscriptions()
}

const clearSearch = () => {
  filters.search = ''
  fetchSubscriptions()
}

const openViewDialog = async (item) => {
  selected.value = item
  activeTab.value = 'details'
  renewalHistory.value = []
  viewDialog.value = true
  await fetchRenewalHistory(item.id)
}

const openActivateDialog = (item) => {
  clearErrors()
  selected.value = item

  activateForm.subscription_plan_id = item.subscription_plan_id || null
  activateForm.amount = item.amount || ''
  activateForm.starts_at = new Date().toISOString().slice(0, 10)

  activateDialog.value = true
}

const openExtendDialog = (item) => {
  clearErrors()
  selected.value = item
  extendForm.days = 365
  extendDialog.value = true
}

const openRenewDialog = (item) => {
  clearErrors()
  selected.value = item

  renewForm.subscription_plan_id = item.subscription_plan_id || null
  renewForm.duration_days = item.plan?.duration_days || 365
  renewForm.renewal_amount = item.plan?.yearly_price || item.amount || 0
  renewForm.renewal_type = item.status === 'trial' ? 'trial_conversion' : 'renewal'
  renewForm.remarks = ''

  renewDialog.value = true
}

const openStatusDialog = (item) => {
  clearErrors()
  selected.value = item
  statusForm.status = item.status
  statusDialog.value = true
}

const setPlanAmount = () => {
  const selectedPlan = plans.value.find(
    plan => Number(plan.id) === Number(activateForm.subscription_plan_id)
  )

  if (selectedPlan) {
    activateForm.amount = selectedPlan.yearly_price
  }
}

const setRenewPlanValues = () => {
  const selectedPlan = plans.value.find(
    plan => Number(plan.id) === Number(renewForm.subscription_plan_id)
  )

  if (selectedPlan) {
    renewForm.duration_days = selectedPlan.duration_days || 365
    renewForm.renewal_amount = selectedPlan.yearly_price || 0
  }
}

const activatePaidPlan = async () => {
  clearErrors()
  saving.value = true

  try {
    await api.put(`/admin/subscriptions/${selected.value.id}/activate-paid-plan`, {
      subscription_plan_id: activateForm.subscription_plan_id,
      amount: Number(activateForm.amount || 0),
      starts_at: activateForm.starts_at
    })

    activateDialog.value = false
    ui.showSnackbar('Subscription activated successfully.')
    fetchSubscriptions()
  } catch (error) {
    handleErrors(error, 'Unable to activate paid plan.')
  } finally {
    saving.value = false
  }
}

const extendSubscription = async () => {
  clearErrors()
  saving.value = true

  try {
    await api.put(`/admin/subscriptions/${selected.value.id}/extend`, {
      days: Number(extendForm.days || 0)
    })

    extendDialog.value = false
    ui.showSnackbar('Subscription extended successfully.')
    fetchSubscriptions()
  } catch (error) {
    handleErrors(error, 'Unable to extend subscription.')
  } finally {
    saving.value = false
  }
}

const renewSubscription = async () => {
  const confirmed = await ui.confirmDialog(
    'Renew Subscription',
    `Are you sure you want to renew subscription for <strong>${selected.value?.school_name || 'this school'}</strong>?`
  )

  if (!confirmed) return

  clearErrors()
  saving.value = true

  try {
    await api.post(`/admin/subscriptions/${selected.value.id}/renew`, {
      subscription_plan_id: renewForm.subscription_plan_id,
      duration_days: Number(renewForm.duration_days || 0),
      renewal_amount: Number(renewForm.renewal_amount || 0),
      renewal_type: renewForm.renewal_type,
      remarks: renewForm.remarks
    })

    renewDialog.value = false
    ui.showSnackbar('Subscription renewed successfully.')
    fetchSubscriptions()
  } catch (error) {
    handleErrors(error, 'Unable to renew subscription.')
  } finally {
    saving.value = false
  }
}

const updateStatus = async () => {
  clearErrors()
  saving.value = true

  try {
    await api.put(`/admin/subscriptions/${selected.value.id}/status`, {
      status: statusForm.status
    })

    statusDialog.value = false
    ui.showSnackbar('Subscription status updated successfully.')
    fetchSubscriptions()
  } catch (error) {
    handleErrors(error, 'Unable to update status.')
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
    trial: 'info',
    active: 'success',
    expired: 'error',
    suspended: 'deep-orange',
    cancelled: 'grey',
    pending_payment: 'warning'
  }

  return colors[status] || 'grey'
}

const licenseColor = (status) => {
  const colors = {
    active: 'success',
    inactive: 'grey',
    expired: 'error',
    suspended: 'deep-orange',
    cancelled: 'grey'
  }

  return colors[status] || 'grey'
}

const formatStatus = (status) => {
  return String(status || 'N/A')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, char => char.toUpperCase())
}

const formatAmount = (amount) => {
  return Number(amount || 0).toLocaleString('en-IN')
}

const formatDate = (date) => {
  if (!date) return 'N/A'

  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

onMounted(async () => {
  await fetchPlans()
  await fetchSubscriptions()
})
</script>

<style scoped>
.license-text {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: monospace;
}

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