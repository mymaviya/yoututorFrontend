<template>
  <v-container fluid>
    <v-card elevation="2">
      <v-card-title class="d-flex align-center justify-space-between">
        <div>
          <h2 class="text-h5 font-weight-bold">Proposals</h2>
          <p class="text-body-2 text-medium-emphasis mb-0">
            Manage project proposals for Maviya IT Services
          </p>
        </div>

        <v-btn color="primary" prepend-icon="mdi-plus" @click="$router.push('/admin/proposals/create')">
          Create Proposal
        </v-btn>
      </v-card-title>

      <v-divider />

      <v-card-text>
        <v-text-field
          v-model="search"
          label="Search proposal, client, organization..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="comfortable"
          clearable
          class="mb-4"
        />

        <v-data-table
          :headers="headers"
          :items="filteredProposals"
          :loading="loading"
          item-value="id"
        >
          <template #item.proposal_no="{ item }">
            <strong>{{ item.proposal_no }}</strong>
          </template>

          <template #item.status="{ item }">
            <v-chip :color="statusColor(item.status)" size="small" variant="flat">
              {{ formatStatus(item.status) }}
            </v-chip>
          </template>

          <template #item.grand_total="{ item }">
            ₹{{ Number(item.grand_total || 0).toLocaleString('en-IN') }}
          </template>

          <template #item.created_at="{ item }">
            {{ formatDate(item.created_at) }}
          </template>

          <template #item.actions="{ item }">
            <v-btn icon size="small" variant="text" color="primary" @click="editProposal(item.id)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>

            <v-btn icon size="small" variant="text" color="info" @click="previewProposal(item.id)">
              <v-icon>mdi-eye</v-icon>
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
import proposalService from '../../../services/proposalService'
import { useUIStore } from '../../../stores/snackBar'

const router = useRouter()
const ui = useUIStore()

const loading = ref(false)
const proposals = ref([])
const search = ref('')

const headers = [
  { title: 'Proposal No', key: 'proposal_no' },
  { title: 'Client', key: 'client_name' },
  { title: 'Organization', key: 'organization_name' },
  { title: 'Project', key: 'project_name' },
  { title: 'Status', key: 'status' },
  { title: 'Amount', key: 'grand_total' },
  { title: 'Date', key: 'created_at' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
]

const filteredProposals = computed(() => {
  if (!search.value) return proposals.value

  const keyword = search.value.toLowerCase()

  return proposals.value.filter((item) => {
    return (
      item.proposal_no?.toLowerCase().includes(keyword) ||
      item.client_name?.toLowerCase().includes(keyword) ||
      item.organization_name?.toLowerCase().includes(keyword) ||
      item.project_name?.toLowerCase().includes(keyword)
    )
  })
})

const fetchProposals = async () => {
  loading.value = true

  try {
    const response = await proposalService.getProposals()
    proposals.value = response.data.data.data || response.data.data || []
  } catch (error) {
    console.error(error)
    ui.showSnackbar?.('Failed to load proposals.', 'error')
  } finally {
    loading.value = false
  }
}

const editProposal = (id) => {
  router.push(`/admin/proposals/${id}/edit`)
}

const previewProposal = (id) => {
  router.push(`/admin/proposals/${id}/preview`)
}

const downloadPdf = async (proposalId) => {
  try {
    const selectedProposal = proposals.value.find(inv => inv.id === proposalId)

    const res = await proposalService.downloadProposalPdf(proposalId)

    const blob = new Blob([res.data], {
      type: 'application/pdf',
    })

    const url = window.URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.setAttribute(
      'download',
      `${selectedProposal?.proposal_no || 'proposal-' + proposalId}.pdf`
    )

    document.body.appendChild(link)
    link.click()
    link.remove()

    window.URL.revokeObjectURL(url)

    ui.showSnackbar?.('Invoice PDF downloaded successfully.', 'success')
  } catch (error) {
    console.error(error)
    ui.showSnackbar?.('Failed to download invoice PDF.', 'error')
  }
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
    approved: 'success',
    rejected: 'error',
    change_requested: 'warning',
    converted_to_quotation: 'purple',
  }

  return colors[status] || 'grey'
}

onMounted(fetchProposals)
</script>