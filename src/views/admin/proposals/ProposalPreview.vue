<template>
  <v-container fluid class="preview-wrapper">
    <v-card elevation="2" class="mb-4">
      <v-card-title class="d-flex align-center justify-space-between">
        <div>
          <h2 class="text-h5 font-weight-bold">Proposal Preview</h2>
          <p class="text-body-2 text-medium-emphasis mb-0">
            Letterhead preview before PDF download
          </p>
        </div>

        <div class="d-flex gap-2">
          <v-btn variant="tonal" prepend-icon="mdi-arrow-left"
            @click="$router.push(`/admin/proposals/${proposalId}/edit`)">
            Back
          </v-btn>

          <v-btn color="success" prepend-icon="mdi-download" :disabled="!proposal" @click="downloadPdf">
            Download PDF
          </v-btn>
        </div>
      </v-card-title>
    </v-card>

    <v-skeleton-loader v-if="loading" type="article, article" />

    <template v-else-if="proposal">
      <!-- PAGE 1 COVER -->
      <div class="a4-page cover-page" :style="{ backgroundImage: `url(${letterheadUrl})` }">
        <div class="cover-content">
          <h1>PROJECT PROPOSAL</h1>

          <h2>{{ proposal.project_name }}</h2>

          <div class="client-box">
            <p><strong>Prepared For:</strong></p>
            <h3>{{ proposal.organization_name || proposal.client_name }}</h3>

            <p><strong>Client Name:</strong> {{ proposal.client_name }}</p>
            <p><strong>Proposal No:</strong> {{ proposal.proposal_no }}</p>
            <p><strong>Date:</strong> {{ formatDate(proposal.created_at) }}</p>
          </div>
        </div>
      </div>

      <!-- PAGE 2 SECTIONS -->
      <div class="a4-page" :style="{ backgroundImage: `url(${letterheadUrl})` }">
        <div v-for="section in visibleSections" :key="section.id" class="proposal-section">
          <h3>{{ section.title }}</h3>
          <div v-html="section.content"></div>
        </div>
      </div>

      <!-- PAGE 3 COMMERCIALS -->
      <div class="a4-page commercial-page" :style="{ backgroundImage: `url(${letterheadUrl})` }">
        <h3 class="section-heading">Commercial Details</h3>

        <table class="items-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Module</th>
              <th>Description</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Total</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(item, index) in proposal.items || []" :key="item.id">
              <td>{{ index + 1 }}</td>
              <td>{{ item.module_name }}</td>
              <td>{{ item.description }}</td>
              <td class="text-right">{{ Number(item.quantity || 0).toFixed(2) }}</td>
              <td class="text-right">₹{{ money(item.unit_price) }}</td>
              <td class="text-right">₹{{ money(item.total) }}</td>
            </tr>
          </tbody>
        </table>

        <table class="totals-table">
          <tr>
            <td>Subtotal</td>
            <td class="text-right">₹{{ money(proposal.subtotal) }}</td>
          </tr>

          <tr>
            <td>GST {{ proposal.gst_percentage }}%</td>
            <td class="text-right">₹{{ money(proposal.gst_amount) }}</td>
          </tr>

          <tr class="grand">
            <td>Grand Total</td>
            <td class="text-right">₹{{ money(proposal.grand_total) }}</td>
          </tr>
        </table>

        <div v-if="proposal.payment_terms" class="payment-terms">
          <h3>Payment Terms</h3>
          <p>{{ proposal.payment_terms }}</p>
        </div>

        <div class="declaration">
          This is a computer-generated proposal and does not require a physical signature or seal.
          <br>
          <strong>Maviya IT Services</strong><br>
          Professional Software & Technology Solutions
        </div>
      </div>
    </template>

    <v-alert v-else type="error" variant="tonal">
      Proposal not found.
    </v-alert>
  </v-container>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import proposalService from '../../../services/proposalService'
import { useUIStore } from '../../../stores/snackBar'

const route = useRoute()
const ui = useUIStore()

const proposalId = route.params.id
const loading = ref(false)
const proposal = ref(null)

const backendBaseUrl = import.meta.env.VITE_API_BASE_URL
  .replace('/api', '')
  .replace(/\/$/, '')

const letterheadUrl = `${backendBaseUrl}/proposal-assets/maviya-letterhead.png`

const visibleSections = computed(() => {
  return (proposal.value?.sections || []).filter((section) => {
    return (
      section.is_visible &&
      section.section_key !== 'cover_page' &&
      section.section_key !== 'commercials'
    )
  })
})

const fetchProposal = async () => {
  loading.value = true

  try {
    const response = await proposalService.getProposal(proposalId)
    proposal.value = response.data.data
  } catch (error) {
    ui.showSnackbar?.('Failed to load proposal preview.', 'error')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const downloadPdf = async () => {
  try {
    const res = await proposalService.downloadProposalPdf(proposalId)

    const blob = new Blob([res.data], {
      type: 'application/pdf',
    })

    const url = window.URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `${proposal.value?.proposal_no || 'proposal-' + proposalId}.pdf`
    link.click()

    window.URL.revokeObjectURL(url)

    ui.showSnackbar?.('Proposal PDF downloaded successfully.', 'success')
  } catch (error) {
    ui.showSnackbar?.('Failed to download proposal PDF.', 'error')
    console.error(error)
  }
}

const money = (value) => Number(value || 0).toLocaleString('en-IN')

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-IN')
}

onMounted(fetchProposal)
</script>

<style scoped>
.preview-wrapper {
  background: #f4f7fb;
  padding-bottom: 40px;
}

.gap-2 {
  gap: 8px;
}

.a4-page {
  width: 210mm;
  min-height: 297mm;
  margin: 0 auto 24px;
  background-size: 210mm 297mm;
  background-repeat: no-repeat;
  background-position: top center;
  padding: 5.5cm 1.5cm 2.5cm;
  box-sizing: border-box;
  background-color: #fff;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.18);
  overflow: hidden;
}

.cover-page {
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.cover-content {
  width: 100%;
  text-align: center;
  margin-top: 1.2cm;
}

.cover-content h1 {
  font-size: 34px;
  font-weight: 900;
  color: #0b2f63;
  letter-spacing: 1px;
  margin-bottom: 24px;
}

.cover-content h2 {
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 34px;
}

.client-box {
  max-width: 165mm;
  margin: 0 auto;
  padding: 22px;
  border: 1px solid #cfcfcf;
  background: rgba(255, 255, 255, 0.9);
}

.client-box h3 {
  font-size: 21px;
  font-weight: 800;
  margin: 10px 0 18px;
}

.proposal-section {
  margin-bottom: 18px;
}

.proposal-section h3,
.section-heading,
.payment-terms h3 {
  color: #0b2f63;
  border-bottom: 1px solid #0b2f63;
  padding-bottom: 6px;
  margin-bottom: 10px;
  font-size: 17px;
  font-weight: 800;
}

.proposal-section :deep(p) {
  line-height: 1.5;
  margin-bottom: 8px;
}

.proposal-section :deep(ul) {
  margin-top: 6px;
}

.proposal-section :deep(li) {
  margin-bottom: 4px;
}

.commercial-page {
  font-size: 11px;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
}

.items-table th,
.items-table td {
  border: 1px solid #999;
  padding: 5px;
  vertical-align: top;
}

.items-table th {
  background: #eef3fb;
  font-weight: 800;
  text-align: center;
}

.items-table td {
  font-size: 10px;
}

.items-table th:nth-child(1) {
  width: 4%;
}

.items-table th:nth-child(2) {
  width: 23%;
}

.items-table th:nth-child(3) {
  width: 39%;
}

.items-table th:nth-child(4) {
  width: 6%;
}

.items-table th:nth-child(5) {
  width: 14%;
}

.items-table th:nth-child(6) {
  width: 14%;
}

.text-right {
  text-align: right;
}

.totals-table {
  width: 42%;
  margin-left: auto;
  margin-top: 12px;
  border-collapse: collapse;
}

.totals-table td {
  border: 1px solid #999;
  padding: 7px;
}

.grand {
  background: #eef3fb;
  font-weight: 900;
}

.payment-terms {
  margin-top: 18px;
}

.payment-terms p {
  margin-top: 6px;
}

.declaration {
  margin-top: 18px;
  padding-top: 12px;
  border-top: 1px solid #bbb;
  text-align: center;
  font-size: 11px;
  color: #555;
  line-height: 1.5;
}

@media print {
  .v-card {
    display: none !important;
  }

  .preview-wrapper {
    padding: 0;
    background: #fff;
  }

  .a4-page {
    box-shadow: none;
    margin: 0;
    page-break-after: always;
  }
}
</style>