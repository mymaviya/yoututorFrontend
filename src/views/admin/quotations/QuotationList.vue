<template>
  <v-container fluid>
    <v-card elevation="2">
      <v-card-title class="d-flex align-center justify-space-between">
        <div>
          <h2 class="text-h5 font-weight-bold">Quotations</h2>
          <p class="text-body-2 text-medium-emphasis mb-0">
            Manage quotations converted from approved proposals
          </p>
        </div>
      </v-card-title>

      <v-divider />

      <v-card-text>
        <v-text-field
          v-model="search"
          label="Search quotation, client, organization..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="comfortable"
          clearable
          class="mb-4"
        />

        <v-data-table
          :headers="headers"
          :items="filteredQuotations"
          :loading="loading"
          item-value="id"
        >
          <template #item.quotation_no="{ item }">
            <strong>{{ item.quotation_no }}</strong>
          </template>

          <template #item.status="{ item }">
            <v-chip :color="statusColor(item.status)" size="small" variant="flat">
              {{ formatStatus(item.status) }}
            </v-chip>
          </template>

          <template #item.grand_total="{ item }">
            ₹{{ Number(item.grand_total || 0).toLocaleString('en-IN') }}
          </template>

          <template #item.quotation_date="{ item }">
            {{ formatDate(item.quotation_date) }}
          </template>

          <template #item.actions="{ item }">
            <v-btn icon size="small" variant="text" color="primary" @click="editQuotation(item.id)">
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
import quotationService from '../../../services/quotationService'
import { useUIStore } from '../../../stores/snackBar'

const router = useRouter()
const ui = useUIStore()

const loading = ref(false)
const quotations = ref([])
const search = ref('')

const headers = [
  { title: 'Quotation No', key: 'quotation_no' },
  { title: 'Client', key: 'client_name' },
  { title: 'Organization', key: 'organization_name' },
  { title: 'Project', key: 'project_name' },
  { title: 'Status', key: 'status' },
  { title: 'Amount', key: 'grand_total' },
  { title: 'Date', key: 'quotation_date' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
]

const filteredQuotations = computed(() => {
  if (!search.value) return quotations.value

  const keyword = search.value.toLowerCase()

  return quotations.value.filter((item) => {
    return (
      item.quotation_no?.toLowerCase().includes(keyword) ||
      item.client_name?.toLowerCase().includes(keyword) ||
      item.organization_name?.toLowerCase().includes(keyword) ||
      item.project_name?.toLowerCase().includes(keyword)
    )
  })
})

const fetchQuotations = async () => {
  loading.value = true

  try {
    const response = await quotationService.getQuotations()
    quotations.value = response.data.data.data || response.data.data || []
  } catch (error) {
    ui.showSnackbar?.('Failed to load quotations.', 'error')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const editQuotation = (id) => {
  router.push(`/admin/quotations/${id}/edit`)
}

const downloadPdf = (id) => {
  ui.showSnackbar?.('Opening quotation PDF...', 'info')
  window.open(quotationService.pdfUrl(id), '_blank')
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
    accepted: 'success',
    rejected: 'error',
    converted_to_invoice: 'purple',
  }

  return colors[status] || 'grey'
}

onMounted(fetchQuotations)
</script>