<template>
  <v-container fluid>
    <v-card elevation="2">
      <v-card-title class="d-flex align-center justify-space-between">
        <div>
          <h2 class="text-h5 font-weight-bold">Quotation Builder</h2>
          <p class="text-body-2 text-medium-emphasis mb-0">
            Edit quotation, pricing, terms and convert to invoice
          </p>
        </div>

        <div class="d-flex gap-2">
          <v-btn variant="tonal" prepend-icon="mdi-arrow-left" @click="$router.push('/admin/quotations')">
            Back
          </v-btn>

          <v-btn color="success" prepend-icon="mdi-file-pdf-box" :disabled="!quotation" @click="downloadPdf">
            PDF
          </v-btn>
        </div>
      </v-card-title>

      <v-divider />

      <v-card-text v-if="loading">
        <v-skeleton-loader type="article, table" />
      </v-card-text>

      <v-card-text v-else-if="quotation">
        <v-alert type="info" variant="tonal" border="start" class="mb-4">
          <strong>{{ quotation.quotation_no }}</strong>
          —
          {{ quotation.client_name }}
          —
          <v-chip :color="statusColor(quotation.status)" size="small" variant="flat">
            {{ formatStatus(quotation.status) }}
          </v-chip>
        </v-alert>

        <v-row>
          <v-col cols="12" md="6">
            <v-text-field v-model="form.client_name" label="Client Name" variant="outlined" density="comfortable"
              :error-messages="formErrors.client_name" />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field v-model="form.organization_name" label="Organization Name" variant="outlined"
              density="comfortable" :error-messages="formErrors.organization_name" />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field v-model="form.project_name" label="Project Name" variant="outlined" density="comfortable"
              :error-messages="formErrors.project_name" />
          </v-col>

          <v-col cols="12" md="3">
            <v-text-field v-model="form.quotation_date" label="Quotation Date" type="date" variant="outlined"
              density="comfortable" :error-messages="formErrors.quotation_date" />
          </v-col>

          <v-col cols="12" md="3">
            <v-text-field v-model="form.valid_until" label="Valid Until" type="date" variant="outlined"
              density="comfortable" :error-messages="formErrors.valid_until" />
          </v-col>

          <v-col cols="12" md="3">
            <v-text-field v-model="form.gst_percentage" label="GST %" type="number" variant="outlined"
              density="comfortable" :error-messages="formErrors.gst_percentage" />
          </v-col>

          <v-col cols="12">
            <v-textarea v-model="form.terms" label="Terms" rows="3" variant="outlined" density="comfortable"
              :error-messages="formErrors.terms" />
          </v-col>
        </v-row>

        <v-card variant="outlined" class="mt-4">
          <v-card-title class="d-flex justify-space-between align-center">
            <span>Quotation Items</span>

            <v-btn color="primary" variant="tonal" prepend-icon="mdi-plus" @click="addItem">
              Add Item
            </v-btn>
          </v-card-title>

          <v-card-text>
            <v-table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Description</th>
                  <th style="width: 100px;">Qty</th>
                  <th style="width: 150px;">Unit Price</th>
                  <th style="width: 150px;">Total</th>
                  <th style="width: 70px;">Action</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="(item, index) in items" :key="index">
                  <td>
                    <v-text-field v-model="item.item_name" variant="outlined" density="compact" hide-details />
                  </td>

                  <td>
                    <v-textarea v-model="item.description" rows="1" auto-grow variant="outlined" density="compact"
                      hide-details />
                  </td>

                  <td>
                    <v-text-field v-model.number="item.quantity" type="number" variant="outlined" density="compact"
                      hide-details @input="calculateItem(item)" />
                  </td>

                  <td>
                    <v-text-field v-model.number="item.unit_price" type="number" variant="outlined" density="compact"
                      hide-details @input="calculateItem(item)" />
                  </td>

                  <td>
                    ₹{{ Number(item.total || 0).toLocaleString('en-IN') }}
                  </td>

                  <td>
                    <v-btn icon size="small" color="error" variant="text" @click="removeItem(index)">
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </td>
                </tr>
              </tbody>
            </v-table>

            <div class="d-flex justify-end mt-4">
              <v-card width="360" variant="tonal">
                <v-card-text>
                  <div class="d-flex justify-space-between mb-2">
                    <span>Subtotal</span>
                    <strong>₹{{ subtotal.toLocaleString('en-IN') }}</strong>
                  </div>

                  <div class="d-flex justify-space-between mb-2">
                    <span>GST {{ Number(form.gst_percentage || 0) }}%</span>
                    <strong>₹{{ gstAmount.toLocaleString('en-IN') }}</strong>
                  </div>

                  <v-divider class="my-2" />

                  <div class="d-flex justify-space-between text-h6">
                    <span>Grand Total</span>
                    <strong>₹{{ grandTotal.toLocaleString('en-IN') }}</strong>
                  </div>
                </v-card-text>
              </v-card>
            </div>

            <div class="d-flex justify-end mt-4">
              <v-btn color="primary" :loading="saving" prepend-icon="mdi-content-save" @click="saveQuotation">
                Save Quotation
              </v-btn>
            </div>
          </v-card-text>
        </v-card>

        <v-card variant="outlined" class="mt-4">
          <v-card-title>Workflow</v-card-title>

          <v-card-text>
            <v-row>
              <v-col cols="12" md="3">
                <v-btn block color="info" :loading="workflowLoading" @click="sendQuotation">
                  Send Email & Mark Sent
                </v-btn>
              </v-col>

              <v-col cols="12" md="3">
                <v-btn block color="success" :loading="workflowLoading" @click="acceptQuotation">
                  Accept
                </v-btn>
              </v-col>

              <v-col cols="12" md="3">
                <v-btn block color="error" :loading="workflowLoading" @click="rejectQuotation">
                  Reject
                </v-btn>
              </v-col>

              <v-col cols="12" md="3">
                <v-btn block color="purple" :loading="workflowLoading" @click="convertToInvoice">
                  Convert to Invoice
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-card-text>

      <v-card-text v-else>
        <v-alert type="error" variant="tonal">
          Quotation not found.
        </v-alert>
      </v-card-text>
    </v-card>
  </v-container>
  <v-dialog v-model="whatsappDialog" max-width="700">
    <v-card>
      <v-card-title class="bg-success text-white">
        Quotation Sent Successfully
      </v-card-title>

      <v-card-text class="pt-4">
        <v-alert type="success" variant="tonal" class="mb-4">
          Quotation email has been sent successfully.
        </v-alert>

        <v-textarea :model-value="whatsappMessage" readonly rows="8" variant="outlined" label="WhatsApp Message" />
      </v-card-text>

      <v-card-actions>
        <v-spacer />

        <v-btn variant="text" @click="whatsappDialog = false">
          Close
        </v-btn>

        <v-btn color="success" prepend-icon="mdi-whatsapp" @click="openWhatsapp">
          Open WhatsApp
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import quotationService from '../../../services/quotationService'
import { useUIStore } from '../../../stores/snackBar'

const route = useRoute()
const router = useRouter()
const ui = useUIStore()

const quotationId = route.params.id
const whatsappDialog = ref(false)
const whatsappUrl = ref('')
const whatsappMessage = ref('')

const loading = ref(false)
const saving = ref(false)
const workflowLoading = ref(false)
const quotation = ref(null)
const formErrors = ref({})

const form = ref({
  client_name: '',
  organization_name: '',
  project_name: '',
  quotation_date: '',
  valid_until: '',
  gst_percentage: 18,
  terms: '',
})

const items = ref([])

const subtotal = computed(() => {
  return items.value.reduce((sum, item) => sum + Number(item.total || 0), 0)
})

const gstAmount = computed(() => {
  return subtotal.value * Number(form.value.gst_percentage || 0) / 100
})

const grandTotal = computed(() => {
  return subtotal.value + gstAmount.value
})

const openWhatsapp = () => {
  if (!whatsappUrl.value) return
  window.open(whatsappUrl.value, '_blank')
}

const formatStatus = (status) => {
  return String(status || 'draft')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

const toDateInput = (value) => {
  if (!value) return ''

  return String(value).slice(0, 10)
}

const fetchQuotation = async () => {
  loading.value = true

  try {
    const response = await quotationService.getQuotation(quotationId)
    quotation.value = response.data.data

    form.value = {
      client_name: quotation.value.client_name || '',
      organization_name: quotation.value.organization_name || '',
      project_name: quotation.value.project_name || '',
      quotation_date: toDateInput(quotation.value.quotation_date),
      valid_until: toDateInput(quotation.value.valid_until),
      gst_percentage: quotation.value.gst_percentage || 18,
      terms: quotation.value.terms || '',
    }

    items.value = JSON.parse(JSON.stringify(quotation.value.items || []))
  } catch (error) {
    ui.showSnackbar?.('Failed to load quotation.', 'error')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const addItem = () => {
  items.value.push({
    item_name: '',
    description: '',
    quantity: 1,
    unit_price: 0,
    total: 0,
  })
}

const removeItem = (index) => {
  items.value.splice(index, 1)
}

const calculateItem = (item) => {
  item.total = Number(item.quantity || 0) * Number(item.unit_price || 0)
}

const saveQuotation = async () => {
  saving.value = true
  formErrors.value = {}

  try {
    const payload = {
      ...form.value,
      quotation_date: toDateInput(form.value.quotation_date),
      valid_until: toDateInput(form.value.valid_until),
      gst_percentage: Number(form.value.gst_percentage || 0),
      items: items.value,
    }

    await quotationService.updateQuotation(quotationId, payload)

    ui.showSnackbar?.('Quotation saved successfully.', 'success')
    await fetchQuotation()
  } catch (error) {
    if (error.response?.status === 422) {
      formErrors.value = error.response.data.errors || {}
    }

    ui.showSnackbar?.(
      error.response?.data?.message || 'Failed to save quotation.',
      'error'
    )
  } finally {
    saving.value = false
  }
}

const sendQuotation = async () => {
  workflowLoading.value = true

  try {
    const response = await quotationService.sendQuotation(quotationId)

    ui.showSnackbar?.(
      response.data.message || 'Quotation sent successfully.',
      'success'
    )

    whatsappUrl.value = response.data.data?.whatsapp_url || ''
    whatsappMessage.value = response.data.data?.whatsapp_message || ''

    if (whatsappUrl.value) {
      whatsappDialog.value = true
    } else {
      ui.showSnackbar?.(
        'Email sent, but WhatsApp number is missing or invalid.',
        'warning'
      )
    }

    await fetchQuotation()
  } catch (error) {
    ui.showSnackbar?.(
      error.response?.data?.message || 'Failed to send quotation.',
      'error'
    )
  } finally {
    workflowLoading.value = false
  }
}

const acceptQuotation = async () => {
  workflowLoading.value = true

  try {
    await quotationService.acceptQuotation(quotationId)
    ui.showSnackbar?.('Quotation accepted successfully.', 'success')
    await fetchQuotation()
  } catch (error) {
    ui.showSnackbar?.('Failed to accept quotation.', 'error')
  } finally {
    workflowLoading.value = false
  }
}

const rejectQuotation = async () => {
  workflowLoading.value = true

  try {
    await quotationService.rejectQuotation(quotationId)
    ui.showSnackbar?.('Quotation rejected successfully.', 'success')
    await fetchQuotation()
  } catch (error) {
    ui.showSnackbar?.('Failed to reject quotation.', 'error')
  } finally {
    workflowLoading.value = false
  }
}

const convertToInvoice = async () => {
  workflowLoading.value = true

  try {
    const response = await quotationService.convertToInvoice(quotationId)
    const invoice = response.data.data

    ui.showSnackbar?.('Quotation converted to invoice.', 'success')
    router.push(`/admin/invoices/${invoice.id}/edit`)
  } catch (error) {
    ui.showSnackbar?.(
      error.response?.data?.message || 'Failed to convert quotation to invoice.',
      'error'
    )
  } finally {
    workflowLoading.value = false
  }
}

const downloadPdf = async () => {
  try {
    const res = await quotationService.downloadQuotationPdf(quotationId)

    const blob = new Blob([res.data], {
      type: 'application/pdf',
    })

    const url = window.URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `${quotation.value?.quotation_no || 'quotation-' + quotationId}.pdf`
    link.click()

    window.URL.revokeObjectURL(url)

    ui.showSnackbar?.('Quotation PDF downloaded successfully.', 'success')
  } catch (error) {
    ui.showSnackbar?.('Failed to download quotation PDF.', 'error')
  }
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

onMounted(fetchQuotation)
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
</style>