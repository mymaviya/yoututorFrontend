<template>
  <v-container fluid>
    <v-row>
      <v-col
        v-for="card in cards"
        :key="card.title"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-card rounded="xl" elevation="3" class="pa-4 h-100">
          <div class="d-flex align-center">
            <v-avatar :color="card.color" rounded="lg" size="52" class="mr-4">
              <v-icon color="white" size="30">{{ card.icon }}</v-icon>
            </v-avatar>

            <div>
              <div class="text-h5 font-weight-black">
                {{ card.prefix || '' }}{{ card.value }}
              </div>
              <div class="text-caption text-medium-emphasis">
                {{ card.title }}
              </div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12" md="6">
        <v-card rounded="xl" elevation="3">
          <v-card-title class="font-weight-bold">
            Subscription Status
          </v-card-title>

          <v-divider />

          <v-card-text>
            <div
              v-for="item in statusList"
              :key="item.label"
              class="status-row"
            >
              <div class="d-flex align-center ga-2">
                <v-icon :color="item.color" size="20">
                  {{ item.icon }}
                </v-icon>
                <span>{{ item.label }}</span>
              </div>

              <v-chip :color="item.color" size="small" variant="flat">
                {{ item.value }}
              </v-chip>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card rounded="xl" elevation="3">
          <v-card-title class="d-flex align-center">
            <span class="font-weight-bold">Quick Actions</span>
            <v-spacer />
            <v-btn
              icon="mdi-refresh"
              variant="tonal"
              size="small"
              :loading="loading"
              @click="fetchDashboard"
            />
          </v-card-title>

          <v-divider />

          <v-card-text>
            <v-row>
              <v-col cols="12" sm="6">
                <v-btn
                  block
                  color="primary"
                  variant="tonal"
                  prepend-icon="mdi-card-account-details"
                  to="/admin/subscriptions"
                >
                  Subscriptions
                </v-btn>
              </v-col>

              <v-col cols="12" sm="6">
                <v-btn
                  block
                  color="success"
                  variant="tonal"
                  prepend-icon="mdi-key"
                  to="/admin/license-keys"
                >
                  License Keys
                </v-btn>
              </v-col>

              <v-col cols="12" sm="6">
                <v-btn
                  block
                  color="warning"
                  variant="tonal"
                  prepend-icon="mdi-cash-multiple"
                  to="/admin/payment-transactions"
                >
                  Payments
                </v-btn>
              </v-col>

              <v-col cols="12" sm="6">
                <v-btn
                  block
                  color="info"
                  variant="tonal"
                  prepend-icon="mdi-account-question"
                  to="/admin/demo-enquiries"
                >
                  Demo Enquiries
                </v-btn>
              </v-col>
            </v-row>

            <v-alert
              color="primary"
              variant="tonal"
              rounded="lg"
              class="mt-4"
            >
              Use this dashboard to monitor SaaS subscriptions, trials, renewals and revenue.
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import api from '../../plugins/api'
import { useUIStore } from '../../stores/snackBar'

const ui = useUIStore()

const loading = ref(false)

const dashboard = ref({
  total: 0,
  active: 0,
  trial: 0,
  expired: 0,
  suspended: 0,
  cancelled: 0,
  pending_payment: 0,
  revenue: 0,
  expiring_soon: 0
})

const cards = computed(() => [
  {
    title: 'Total Subscriptions',
    value: dashboard.value.total,
    icon: 'mdi-account-group',
    color: 'primary'
  },
  {
    title: 'Active Subscribers',
    value: dashboard.value.active,
    icon: 'mdi-check-decagram',
    color: 'success'
  },
  {
    title: 'Active Trials',
    value: dashboard.value.trial,
    icon: 'mdi-gift',
    color: 'info'
  },
  {
    title: 'Active Revenue',
    value: formatAmount(dashboard.value.revenue),
    prefix: '₹',
    icon: 'mdi-currency-inr',
    color: 'warning'
  },
  {
    title: 'Pending Payments',
    value: dashboard.value.pending_payment,
    icon: 'mdi-timer-sand',
    color: 'orange'
  },
  {
    title: 'Expiring Soon',
    value: dashboard.value.expiring_soon,
    icon: 'mdi-calendar-alert',
    color: 'deep-purple'
  },
  {
    title: 'Expired',
    value: dashboard.value.expired,
    icon: 'mdi-alert-circle',
    color: 'error'
  },
  {
    title: 'Suspended',
    value: dashboard.value.suspended,
    icon: 'mdi-pause-circle',
    color: 'grey'
  }
])

const statusList = computed(() => [
  {
    label: 'Active',
    value: dashboard.value.active,
    icon: 'mdi-check-circle',
    color: 'success'
  },
  {
    label: 'Trial',
    value: dashboard.value.trial,
    icon: 'mdi-gift',
    color: 'info'
  },
  {
    label: 'Pending Payment',
    value: dashboard.value.pending_payment,
    icon: 'mdi-timer-sand',
    color: 'warning'
  },
  {
    label: 'Expiring Soon',
    value: dashboard.value.expiring_soon,
    icon: 'mdi-calendar-alert',
    color: 'deep-purple'
  },
  {
    label: 'Expired',
    value: dashboard.value.expired,
    icon: 'mdi-alert-circle',
    color: 'error'
  },
  {
    label: 'Suspended',
    value: dashboard.value.suspended,
    icon: 'mdi-pause-circle',
    color: 'grey'
  },
  {
    label: 'Cancelled',
    value: dashboard.value.cancelled,
    icon: 'mdi-close-circle',
    color: 'grey-darken-2'
  }
])

const fetchDashboard = async () => {
  loading.value = true

  try {
    const response = await api.get('/admin/subscriptions/dashboard')
    dashboard.value = response.data.data || dashboard.value
  } catch (error) {
    ui.showSnackbar(
      error.response?.data?.message || 'Unable to load SaaS dashboard.',
      'error'
    )
  } finally {
    loading.value = false
  }
}

const formatAmount = (amount) => {
  return Number(amount || 0).toLocaleString('en-IN', {
    maximumFractionDigits: 0
  })
}

onMounted(fetchDashboard)
</script>

<style scoped>
.status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 0;
  border-bottom: 1px dashed rgba(var(--v-border-color), var(--v-border-opacity));
}

.status-row:last-child {
  border-bottom: none;
}
</style>