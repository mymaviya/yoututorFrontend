<template>
  <v-container fluid>
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">Question Bank Purchases</h1>
        <p class="text-grey">
          Assign premium question bank packages to school subscriptions.
        </p>
      </div>

      <v-btn color="primary" prepend-icon="mdi-plus" @click="openAdd">
        Assign Package
      </v-btn>
    </div>

    <v-card class="rounded-xl mb-4" elevation="0">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="4">
            <v-select
              v-model="filters.subscription_id"
              :items="subscriptions"
              item-title="school_name"
              item-value="id"
              label="School"
              clearable
              variant="outlined"
              density="comfortable"
              @update:model-value="fetchPurchases"
            />
          </v-col>

          <v-col cols="12" md="4">
            <v-select
              v-model="filters.question_bank_package_id"
              :items="packages"
              item-title="name"
              item-value="id"
              label="Package"
              clearable
              variant="outlined"
              density="comfortable"
              @update:model-value="fetchPurchases"
            />
          </v-col>

          <v-col cols="12" md="2">
            <v-select
              v-model="filters.status"
              :items="statusOptions"
              item-title="title"
              item-value="value"
              label="Status"
              clearable
              variant="outlined"
              density="comfortable"
              @update:model-value="fetchPurchases"
            />
          </v-col>

          <v-col cols="12" md="2">
            <v-btn block color="primary" variant="tonal" @click="fetchPurchases">
              Filter
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card class="rounded-xl" elevation="0">
      <v-data-table-server
        v-model:page="pagination.page"
        v-model:items-per-page="pagination.per_page"
        :headers="headers"
        :items="purchases"
        :items-length="pagination.total"
        :loading="loading"
        @update:options="onTableOptions"
      >
        <template #item.subscription="{ item }">
          <div class="py-2">
            <div class="font-weight-medium">
              {{ item.subscription?.school_name || '-' }}
            </div>
            <div class="text-caption text-grey">
              {{ item.subscription?.school_code || '' }}
            </div>
          </div>
        </template>

        <template #item.package="{ item }">
          {{ item.package?.name || '-' }}
        </template>

        <template #item.amount="{ item }">
          ₹{{ Number(item.amount || 0).toFixed(2) }}
        </template>

        <template #item.status="{ item }">
          <v-chip
            size="small"
            variant="tonal"
            :color="statusColor(item.status)"
          >
            {{ item.status }}
          </v-chip>
        </template>

        <template #item.starts_at="{ item }">
          {{ item.starts_at ? formatDate(item.starts_at) : '-' }}
        </template>

        <template #item.ends_at="{ item }">
          {{ item.ends_at ? formatDate(item.ends_at) : 'Lifetime' }}
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex ga-1 justify-end">
            <v-btn
              icon="mdi-pencil"
              size="small"
              variant="text"
              color="primary"
              @click="openEdit(item)"
            />

            <v-btn
              icon="mdi-delete"
              size="small"
              variant="text"
              color="error"
              @click="deletePurchase(item)"
            />
          </div>
        </template>
      </v-data-table-server>
    </v-card>

    <v-dialog v-model="dialog" max-width="700" persistent>
      <v-card class="rounded-xl">
        <v-card-title class="d-flex justify-space-between align-center">
          {{ editMode ? 'Edit Package Access' : 'Assign Package Access' }}

          <v-btn icon="mdi-close" variant="text" @click="dialog = false" />
        </v-card-title>

        <v-divider />

        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-select
                v-model="form.subscription_id"
                :items="subscriptions"
                item-title="school_name"
                item-value="id"
                label="School Subscription"
                variant="outlined"
                :disabled="editMode"
                :error-messages="errors.subscription_id"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="form.question_bank_package_id"
                :items="packages"
                item-title="name"
                item-value="id"
                label="Question Bank Package"
                variant="outlined"
                :disabled="editMode"
                :error-messages="errors.question_bank_package_id"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.amount"
                label="Amount"
                type="number"
                prefix="₹"
                variant="outlined"
                :error-messages="errors.amount"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-select
                v-model="form.status"
                :items="statusOptions"
                item-title="title"
                item-value="value"
                label="Status"
                variant="outlined"
                :error-messages="errors.status"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.starts_at"
                type="date"
                label="Starts At"
                variant="outlined"
                :error-messages="errors.starts_at"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.ends_at"
                type="date"
                label="Ends At"
                hint="Leave blank for lifetime"
                persistent-hint
                variant="outlined"
                :error-messages="errors.ends_at"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />

          <v-btn variant="text" @click="dialog = false">
            Cancel
          </v-btn>

          <v-btn color="primary" :loading="saving" @click="savePurchase">
            {{ editMode ? 'Update' : 'Assign' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import api from '../../../plugins/api'
import { useUIStore } from '../../../stores/snackBar'
import { formatDate } from '../../../utils/date'

const ui = useUIStore()

const loading = ref(false)
const saving = ref(false)
const dialog = ref(false)
const editMode = ref(false)

const purchases = ref([])
const subscriptions = ref([])
const packages = ref([])
const errors = ref({})

const filters = reactive({
  subscription_id: null,
  question_bank_package_id: null,
  status: null,
})

const pagination = reactive({
  page: 1,
  per_page: 20,
  total: 0,
})

const form = ref({
  id: null,
  subscription_id: null,
  question_bank_package_id: null,
  amount: 0,
  status: 'active',
  starts_at: null,
  ends_at: null,
})

const headers = [
  { title: 'School', key: 'subscription', sortable: false },
  { title: 'Package', key: 'package', sortable: false },
  { title: 'Amount', key: 'amount', sortable: false },
  { title: 'Status', key: 'status', sortable: false },
  { title: 'Starts At', key: 'starts_at', sortable: false },
  { title: 'Ends At', key: 'ends_at', sortable: false },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
]

const statusOptions = [
  { title: 'Pending', value: 'pending' },
  { title: 'Active', value: 'active' },
  { title: 'Expired', value: 'expired' },
  { title: 'Cancelled', value: 'cancelled' },
]

const statusColor = (status) => {
  return {
    active: 'success',
    pending: 'warning',
    expired: 'error',
    cancelled: 'grey',
  }[status] || 'grey'
}

const resetForm = () => {
  errors.value = {}

  form.value = {
    id: null,
    subscription_id: null,
    question_bank_package_id: null,
    amount: 0,
    status: 'active',
    starts_at: null,
    ends_at: null,
  }
}

const toDateInput = (value) => {
  if (!value) return null
  return String(value).slice(0, 10)
}

const fetchMeta = async () => {
  try {
    const [subscriptionRes, packageRes] = await Promise.all([
      api.get('/admin/subscriptions', { params: { per_page: 1000 } }),
      api.get('/admin/question-bank-packages', { params: { per_page: 1000 } }),
    ])

    subscriptions.value = subscriptionRes.data.data?.data || []
    packages.value = packageRes.data.data?.data || []
  } catch (err) {
    ui.showSnackbar('Failed to load subscriptions/packages', 'error')
  }
}

const fetchPurchases = async () => {
  loading.value = true

  try {
    const res = await api.get('/admin/question-bank-purchases', {
      params: {
        ...filters,
        page: pagination.page,
        per_page: pagination.per_page,
      },
    })

    const payload = res.data.data

    purchases.value = payload.data || []
    pagination.total = payload.total || 0
    pagination.page = payload.current_page || 1
    pagination.per_page = payload.per_page || 20
  } catch (err) {
    ui.showSnackbar(
      err.response?.data?.message || 'Failed to load package purchases',
      'error'
    )
  } finally {
    loading.value = false
  }
}

const onTableOptions = (options) => {
  pagination.page = options.page
  pagination.per_page = options.itemsPerPage
  fetchPurchases()
}

const openAdd = () => {
  editMode.value = false
  resetForm()
  form.value.starts_at = new Date().toISOString().slice(0, 10)
  dialog.value = true
}

const openEdit = (item) => {
  editMode.value = true
  errors.value = {}

  form.value = {
    id: item.id,
    subscription_id: item.subscription_id,
    question_bank_package_id: item.question_bank_package_id,
    amount: item.amount,
    status: item.status,
    starts_at: toDateInput(item.starts_at),
    ends_at: toDateInput(item.ends_at),
  }

  dialog.value = true
}

const savePurchase = async () => {
  saving.value = true
  errors.value = {}

  try {
    if (editMode.value) {
      await api.put(`/admin/question-bank-purchases/${form.value.id}`, form.value)
      ui.showSnackbar('Package access updated successfully')
    } else {
      await api.post('/admin/question-bank-purchases', form.value)
      ui.showSnackbar('Package access assigned successfully')
    }

    dialog.value = false
    fetchPurchases()
  } catch (err) {
    if (err.response?.status === 422) {
      errors.value = err.response.data.errors || {}
      ui.showSnackbar('Please fix the validation errors', 'error')
    } else {
      ui.showSnackbar(
        err.response?.data?.message || 'Failed to save package access',
        'error'
      )
    }
  } finally {
    saving.value = false
  }
}

const deletePurchase = async (item) => {
  const ok = await ui.confirmDialog(
    'Remove Package Access',
    `Remove ${item.package?.name || 'this package'} access from ${item.subscription?.school_name || 'this school'}?`
  )

  if (!ok) return

  try {
    await api.delete(`/admin/question-bank-purchases/${item.id}`)
    ui.showSnackbar('Package access removed successfully')
    fetchPurchases()
  } catch (err) {
    ui.showSnackbar(
      err.response?.data?.message || 'Failed to remove package access',
      'error'
    )
  }
}

onMounted(async () => {
  await fetchMeta()
  await fetchPurchases()
})
</script>