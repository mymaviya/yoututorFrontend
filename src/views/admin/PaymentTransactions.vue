<template>
  <v-container fluid>
    <v-card rounded="xl" elevation="3">
      <v-card-title class="d-flex flex-wrap align-center ga-3">
        <div>
          <h2 class="text-h5 font-weight-bold">Payment Transactions</h2>
          <p class="text-body-2 text-medium-emphasis mb-0">
            View Razorpay orders, payments, statuses and customer subscription details.
          </p>
        </div>

        <v-spacer />

        <v-btn
          color="primary"
          prepend-icon="mdi-refresh"
          :loading="loading"
          @click="fetchTransactions"
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
              label="Search school, email, mobile, order/payment ID"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-magnify"
              clearable
              @keyup.enter="fetchTransactions"
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
              @update:model-value="fetchTransactions"
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-select
              v-model="filters.gateway"
              label="Gateway"
              :items="gatewayOptions"
              variant="outlined"
              density="comfortable"
              clearable
              @update:model-value="fetchTransactions"
            />
          </v-col>

          <v-col cols="12" md="2">
            <v-btn color="primary" block height="48" @click="fetchTransactions">
              Search
            </v-btn>
          </v-col>
        </v-row>

        <v-data-table-server
          v-model:items-per-page="pagination.per_page"
          :headers="headers"
          :items="transactions"
          :items-length="pagination.total"
          :loading="loading"
          item-value="id"
          class="rounded-lg"
          @update:options="onTableOptions"
        >
          <template #item.school="{ item }">
            <div class="font-weight-bold">
              {{ item.subscription?.school_name || 'N/A' }}
            </div>
            <div class="text-caption text-medium-emphasis">
              {{ item.subscription?.contact_person || 'N/A' }}
            </div>
          </template>

          <template #item.plan="{ item }">
            <v-chip color="primary" variant="tonal" size="small">
              {{ item.subscription?.plan?.name || 'No Plan' }}
            </v-chip>
          </template>

          <template #item.amount="{ item }">
            <div class="font-weight-bold">
              ₹{{ formatAmount(item.amount) }}
            </div>
            <div class="text-caption text-medium-emphasis">
              {{ item.currency || 'INR' }}
            </div>
          </template>

          <template #item.gateway="{ item }">
            <v-chip color="info" variant="tonal" size="small">
              {{ formatStatus(item.gateway) }}
            </v-chip>
          </template>

          <template #item.razorpay_order_id="{ item }">
            <div class="transaction-id">
              {{ item.razorpay_order_id || 'N/A' }}
            </div>
          </template>

          <template #item.razorpay_payment_id="{ item }">
            <div class="transaction-id">
              {{ item.razorpay_payment_id || 'N/A' }}
            </div>
          </template>

          <template #item.status="{ item }">
            <v-chip :color="statusColor(item.status)" variant="flat" size="small">
              {{ formatStatus(item.status) }}
            </v-chip>
          </template>

          <template #item.created_at="{ item }">
            {{ formatDateTime(item.created_at) }}
          </template>

          <template #item.actions="{ item }">
            <div class="d-flex justify-end ga-2">
              <v-btn
                icon="mdi-eye"
                size="small"
                color="primary"
                variant="tonal"
                @click="openViewDialog(item)"
              />

              <v-btn
                icon="mdi-content-copy"
                size="small"
                color="secondary"
                variant="tonal"
                @click="copyTransaction(item)"
              />
            </div>
          </template>
        </v-data-table-server>
      </v-card-text>
    </v-card>

    <!-- View Dialog -->
    <v-dialog v-model="viewDialog" max-width="900">
      <v-card rounded="xl">
        <v-card-title class="d-flex align-center">
          <div>
            <div class="font-weight-bold">Transaction Details</div>
            <div class="text-caption text-medium-emphasis">
              Payment, subscription and gateway response
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
          <v-row>
            <v-col cols="12" md="6">
              <v-card variant="tonal" rounded="lg" class="pa-4 h-100">
                <h3 class="text-subtitle-1 font-weight-bold mb-4">
                  Customer Details
                </h3>

                <div class="detail-row">
                  <strong>School:</strong>
                  <span>{{ selected.subscription?.school_name || 'N/A' }}</span>
                </div>

                <div class="detail-row">
                  <strong>Contact:</strong>
                  <span>{{ selected.subscription?.contact_person || 'N/A' }}</span>
                </div>

                <div class="detail-row">
                  <strong>Mobile:</strong>
                  <span>{{ selected.subscription?.mobile || 'N/A' }}</span>
                </div>

                <div class="detail-row">
                  <strong>Email:</strong>
                  <span>{{ selected.subscription?.email || 'N/A' }}</span>
                </div>

                <div class="detail-row">
                  <strong>Plan:</strong>
                  <span>{{ selected.subscription?.plan?.name || 'N/A' }}</span>
                </div>

                <div class="detail-row">
                  <strong>License:</strong>
                  <span>{{ selected.subscription?.license_key?.license_key || 'N/A' }}</span>
                </div>
              </v-card>
            </v-col>

            <v-col cols="12" md="6">
              <v-card variant="tonal" rounded="lg" class="pa-4 h-100">
                <h3 class="text-subtitle-1 font-weight-bold mb-4">
                  Payment Details
                </h3>

                <div class="detail-row">
                  <strong>Amount:</strong>
                  <span>₹{{ formatAmount(selected.amount) }}</span>
                </div>

                <div class="detail-row">
                  <strong>Currency:</strong>
                  <span>{{ selected.currency || 'INR' }}</span>
                </div>

                <div class="detail-row">
                  <strong>Gateway:</strong>
                  <span>{{ formatStatus(selected.gateway) }}</span>
                </div>

                <div class="detail-row">
                  <strong>Status:</strong>
                  <span>{{ formatStatus(selected.status) }}</span>
                </div>

                <div class="detail-row">
                  <strong>Created:</strong>
                  <span>{{ formatDateTime(selected.created_at) }}</span>
                </div>

                <div class="detail-row">
                  <strong>Updated:</strong>
                  <span>{{ formatDateTime(selected.updated_at) }}</span>
                </div>
              </v-card>
            </v-col>

            <v-col cols="12">
              <v-card variant="tonal" rounded="lg" class="pa-4">
                <h3 class="text-subtitle-1 font-weight-bold mb-4">
                  Razorpay IDs
                </h3>

                <div class="copy-row">
                  <strong>Order ID:</strong>
                  <code>{{ selected.razorpay_order_id || 'N/A' }}</code>
                  <v-btn
                    icon="mdi-content-copy"
                    size="x-small"
                    variant="text"
                    @click="copyText(selected.razorpay_order_id)"
                  />
                </div>

                <div class="copy-row">
                  <strong>Payment ID:</strong>
                  <code>{{ selected.razorpay_payment_id || 'N/A' }}</code>
                  <v-btn
                    icon="mdi-content-copy"
                    size="x-small"
                    variant="text"
                    @click="copyText(selected.razorpay_payment_id)"
                  />
                </div>

                <div class="copy-row">
                  <strong>Signature:</strong>
                  <code>{{ selected.razorpay_signature || 'N/A' }}</code>
                  <v-btn
                    icon="mdi-content-copy"
                    size="x-small"
                    variant="text"
                    @click="copyText(selected.razorpay_signature)"
                  />
                </div>
              </v-card>
            </v-col>

            <v-col cols="12">
              <v-card variant="tonal" rounded="lg" class="pa-4">
                <div class="d-flex align-center mb-3">
                  <h3 class="text-subtitle-1 font-weight-bold">
                    Gateway Response
                  </h3>

                  <v-spacer />

                  <v-btn
                    size="small"
                    variant="tonal"
                    prepend-icon="mdi-content-copy"
                    @click="copyText(prettyGatewayResponse)"
                  >
                    Copy JSON
                  </v-btn>
                </div>

                <pre class="json-box">{{ prettyGatewayResponse }}</pre>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="viewDialog = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="2500">
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import api from '../../plugins/api'

const loading = ref(false)
const viewDialog = ref(false)
const selected = ref(null)

const transactions = ref([])

const snackbar = reactive({
  show: false,
  message: '',
  color: 'success'
})

const filters = reactive({
  search: '',
  status: null,
  gateway: null
})

const pagination = reactive({
  page: 1,
  per_page: 50,
  total: 0
})

const headers = [
  { title: 'School', key: 'school', sortable: false },
  { title: 'Plan', key: 'plan', sortable: false },
  { title: 'Amount', key: 'amount', sortable: false },
  { title: 'Gateway', key: 'gateway', sortable: false },
  { title: 'Order ID', key: 'razorpay_order_id', sortable: false },
  { title: 'Payment ID', key: 'razorpay_payment_id', sortable: false },
  { title: 'Status', key: 'status', sortable: false },
  { title: 'Date', key: 'created_at', sortable: false },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' }
]

const statusOptions = [
  { title: 'Created', value: 'created' },
  { title: 'Paid', value: 'paid' },
  { title: 'Failed', value: 'failed' },
  { title: 'Refunded', value: 'refunded' }
]

const gatewayOptions = [
  { title: 'Razorpay', value: 'razorpay' }
]

const prettyGatewayResponse = computed(() => {
  if (!selected.value?.gateway_response) {
    return '{}'
  }

  return JSON.stringify(selected.value.gateway_response, null, 2)
})

const fetchTransactions = async () => {
  loading.value = true

  try {
    const response = await api.get('/admin/payment-transactions', {
      params: {
        page: pagination.page,
        per_page: pagination.per_page,
        search: filters.search,
        status: filters.status,
        gateway: filters.gateway
      }
    })

    const result = response.data.data

    transactions.value = result.data || []
    pagination.total = result.total || 0
    pagination.page = result.current_page || 1
    pagination.per_page = result.per_page || 50
  } catch (error) {
    showSnackbar(
      error.response?.data?.message || 'Unable to load transactions.',
      'error'
    )
  } finally {
    loading.value = false
  }
}

const onTableOptions = (options) => {
  pagination.page = options.page
  pagination.per_page = options.itemsPerPage
  fetchTransactions()
}

const clearSearch = () => {
  filters.search = ''
  fetchTransactions()
}

const openViewDialog = (item) => {
  selected.value = item
  viewDialog.value = true
}

const copyTransaction = (item) => {
  const text = [
    `School: ${item.subscription?.school_name || 'N/A'}`,
    `Plan: ${item.subscription?.plan?.name || 'N/A'}`,
    `Amount: ₹${formatAmount(item.amount)}`,
    `Status: ${formatStatus(item.status)}`,
    `Order ID: ${item.razorpay_order_id || 'N/A'}`,
    `Payment ID: ${item.razorpay_payment_id || 'N/A'}`
  ].join('\n')

  copyText(text)
}

const copyText = async (text) => {
  if (!text || text === 'N/A') return

  try {
    await navigator.clipboard.writeText(text)
    showSnackbar('Copied successfully.', 'success')
  } catch {
    showSnackbar('Unable to copy.', 'error')
  }
}

const showSnackbar = (message, color = 'success') => {
  snackbar.message = message
  snackbar.color = color
  snackbar.show = true
}

const statusColor = (status) => {
  const colors = {
    paid: 'success',
    failed: 'error',
    created: 'info',
    refunded: 'warning'
  }

  return colors[status] || 'grey'
}

const formatStatus = (status) => {
  return String(status || '')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, char => char.toUpperCase())
}

const formatAmount = (amount) => {
  return Number(amount || 0).toLocaleString('en-IN', {
    maximumFractionDigits: 0
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

onMounted(fetchTransactions)
</script>

<style scoped>
.transaction-id {
  max-width: 170px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: monospace;
  font-size: 12px;
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

.copy-row {
  display: grid;
  grid-template-columns: 110px 1fr 36px;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.copy-row code {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 8px 10px;
  border-radius: 8px;
  background: rgba(var(--v-theme-primary), 0.08);
}

.json-box {
  max-height: 320px;
  overflow: auto;
  padding: 16px;
  border-radius: 12px;
  background: rgba(var(--v-theme-on-surface), 0.06);
  font-size: 12px;
  line-height: 1.6;
}

@media (max-width: 600px) {
  .detail-row {
    flex-direction: column;
    gap: 3px;
  }

  .detail-row span {
    text-align: left;
  }

  .copy-row {
    grid-template-columns: 1fr;
  }
}
</style>