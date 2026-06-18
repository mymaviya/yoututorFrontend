<template>
  <v-container fluid>
    <v-card elevation="2">
      <v-card-title class="d-flex align-center justify-space-between">
        <div>
          <h2 class="text-h5 font-weight-bold">Invoices</h2>
          <p class="text-body-2 text-medium-emphasis mb-0">
            Manage invoices generated from accepted quotations
          </p>
        </div>
      </v-card-title>

      <v-divider />

      <v-card-text>
        <v-text-field
          v-model="search"
          label="Search invoice, client, organization..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="comfortable"
          clearable
          class="mb-4"
        />

        <v-data-table
          :headers="headers"
          :items="filteredInvoices"
          :loading="loading"
          item-value="id"
        >
          <template #item.invoice_no="{ item }">
            <strong>{{ item.invoice_no }}</strong>
          </template>

          <template #item.status="{ item }">
            <v-chip :color="statusColor(item.status)" size="small" variant="flat">
              {{ formatStatus(item.status) }}
            </v-chip>
          </template>

          <template #item.grand_total="{ item }">
            ₹{{ Number(item.grand_total || 0).toLocaleString('en-IN') }}
          </template>

          <template #item.balance_amount="{ item }">
            ₹{{ Number(item.balance_amount || 0).toLocaleString('en-IN') }}
          </template>

          <template #item.invoice_date="{ item }">
            {{ formatDate(item.invoice_date) }}
          </template>

          <template #item.actions="{ item }">
            <v-btn icon size="small" variant="text" color="primary" @click="editInvoice(item.id)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>

            <v-btn icon size="small" variant="text" color="success" @click="downloadPdf(item.id)">
              <v-icon>mdi-file-pdf-box</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import invoiceService from '../../../services/invoiceService'
import { useUIStore } from '../../../stores/snackBar'

const router = useRouter()
const ui = useUIStore()

const loading = ref(false)
const invoices = ref([])
const search = ref('')

const headers = [
  { title: 'Invoice No', key: 'invoice_no' },
  { title: 'Client', key: 'client_name' },
  { title: 'Organization', key: 'organization_name' },
  { title: 'Project', key: 'project_name' },
  { title: 'Status', key: 'status' },
  { title: 'Amount', key: 'grand_total' },
  { title: 'Balance', key: 'balance_amount' },
  { title: 'Date', key: 'invoice_date' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
]

const filteredInvoices = computed(() => {
  if (!search.value) return invoices.value

  const keyword = search.value.toLowerCase()

  return invoices.value.filter((item) => {
    return (
      item.invoice_no?.toLowerCase().includes(keyword) ||
      item.client_name?.toLowerCase().includes(keyword) ||
      item.organization_name?.toLowerCase().includes(keyword) ||
      item.project_name?.toLowerCase().includes(keyword)
    )
  })
})

const fetchInvoices = async () => {
  loading.value = true

  try {
    const response = await invoiceService.getInvoices()
    invoices.value = response.data.data.data || response.data.data || []
  } catch (error) {
    ui.showSnackbar?.('Failed to load invoices.', 'error')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const editInvoice = (id) => {
  router.push(`/admin/invoices/${id}/edit`)
}

const downloadPdf = (id) => {
  ui.showSnackbar?.('Opening invoice PDF...', 'info')
  window.open(invoiceService.pdfUrl(id), '_blank')
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-IN')
}

const formatStatus = (status) => {
  return String(status || '').replaceAll('_', ' ').toUpperCase()
}

const statusColor = (status) => {
  const colors = {
    draft: 'grey',
    sent: 'info',
    partially_paid: 'warning',
    paid: 'success',
    overdue: 'error',
    cancelled: 'error',
  }

  return colors[status] || 'grey'
}

onMounted(fetchInvoices)
</script>