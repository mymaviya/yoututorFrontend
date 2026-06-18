<template>
  <v-container fluid>
    <v-card elevation="2">
      <v-card-title class="d-flex align-center justify-space-between">
        <div>
          <h2 class="text-h5 font-weight-bold">Invoice Builder</h2>
          <p class="text-body-2 text-medium-emphasis mb-0">
            Edit invoice, payment status and download invoice PDF
          </p>
        </div>

        <div class="d-flex gap-2">
          <v-btn variant="tonal" prepend-icon="mdi-arrow-left" @click="$router.push('/admin/invoices')">
            Back
          </v-btn>

          <v-btn color="success" prepend-icon="mdi-file-pdf-box" :disabled="!invoice" @click="downloadPdf">
            PDF
          </v-btn>
        </div>
      </v-card-title>

      <v-divider />

      <v-card-text v-if="loading">
        <v-skeleton-loader type="article, table" />
      </v-card-text>

      <v-card-text v-else-if="invoice">
        <v-alert type="info" variant="tonal" border="start" class="mb-4">
          <strong>{{ invoice.invoice_no }}</strong>
          —
          {{ invoice.client_name }}
          —
          <v-chip :color="statusColor(invoice.status)" size="small" variant="flat">
            {{ formatStatus(invoice.status) }}
          </v-chip>
        </v-alert>

        <v-card class="mt-4" v-if="invoice?.payments?.length">
          <v-card-title>
            Payment History
          </v-card-title>

          <v-table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Mode</th>
                <th>Reference</th>
                <th>Bank</th>
                <th>Amount</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="payment in invoice.payments" :key="payment.id">
                <td>{{ payment.payment_date }}</td>
                <td>{{ payment.payment_mode }}</td>
                <td>{{ payment.reference_no }}</td>
                <td>{{ payment.bank_name }}</td>
                <td>₹ {{ Number(payment.amount).toLocaleString() }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card>

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
            <v-text-field v-model="form.invoice_date" label="Invoice Date" type="date" variant="outlined"
              density="comfortable" :error-messages="formErrors.invoice_date" />
          </v-col>

          <v-col cols="12" md="3">
            <v-text-field v-model="form.due_date" label="Due Date" type="date" variant="outlined" density="comfortable"
              :error-messages="formErrors.due_date" />
          </v-col>

          <v-col cols="12" md="1">
            <v-text-field v-model="form.gst_percentage" label="GST %" type="number" variant="outlined"
              density="comfortable" :error-messages="formErrors.gst_percentage" />
          </v-col>

          <v-col cols="12" md="2">
            <v-text-field v-model="form.paid_amount" label="Paid Amount" type="number" variant="outlined"
              density="comfortable" :error-messages="formErrors.paid_amount" />
          </v-col>
          <v-col cols="12" md="3">
            <v-select v-model="form.payment_mode" label="Mode of Payment"
              :items="['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Online Payment', 'Other']" variant="outlined"
              density="comfortable" :error-messages="formErrors.payment_mode" />
          </v-col>
          <v-col cols="12" md="3" v-if="form.payment_mode !== 'Cash'">
            <v-text-field v-model="form.reference_no" :label="form.payment_mode === 'Cheque'
              ? 'Cheque Number'
              : 'Transaction / Reference Number'
              " variant="outlined" density="comfortable" />
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field v-model="form.payment_date" label="Payment Date" type="date" variant="outlined"
              density="comfortable" />
          </v-col>

          <v-col cols="12">
            <v-textarea v-model="form.remarks" label="Payment Remarks" rows="2" variant="outlined"
              density="comfortable" />
          </v-col>

          <v-col cols="12">
            <v-textarea v-model="form.notes" label="Notes" rows="3" variant="outlined" density="comfortable"
              :error-messages="formErrors.notes" />
          </v-col>
        </v-row>

        <v-card variant="outlined" class="mt-4">
          <v-card-title class="d-flex justify-space-between align-center">
            <span>Invoice Items</span>

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
              <v-card width="380" variant="tonal">
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

                  <div class="d-flex justify-space-between text-h6 mb-2">
                    <span>Grand Total</span>
                    <strong>₹{{ grandTotal.toLocaleString('en-IN') }}</strong>
                  </div>

                  <div class="d-flex justify-space-between mb-2">
                    <span>Paid</span>
                    <strong>₹{{ Number(form.paid_amount || 0).toLocaleString('en-IN') }}</strong>
                  </div>

                  <div class="d-flex justify-space-between text-h6">
                    <span>Balance</span>
                    <strong>₹{{ balanceAmount.toLocaleString('en-IN') }}</strong>
                  </div>
                </v-card-text>
              </v-card>
            </div>

            <div class="d-flex justify-end mt-4">
              <v-btn color="primary" :loading="saving" prepend-icon="mdi-content-save" @click="saveInvoice">
                Save Invoice
              </v-btn>
            </div>
          </v-card-text>
        </v-card>

        <v-card variant="outlined" class="mt-4">
          <v-card-title>Workflow</v-card-title>

          <v-card-text>
            <v-row>
              <v-col cols="12" md="4">
                <v-btn block color="info" :loading="workflowLoading" @click="sendInvoice">
                  Mark Sent
                </v-btn>
              </v-col>

              <v-col cols="12" md="4">
                <v-btn block color="success" :loading="workflowLoading" @click="markPaid">
                  Update Payment
                </v-btn>
              </v-col>

              <v-col cols="12" md="4">
                <v-btn block color="error" :loading="workflowLoading" @click="cancelInvoice">
                  Cancel Invoice
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-card-text>

      <v-card-text v-else>
        <v-alert type="error" variant="tonal">
          Invoice not found.
        </v-alert>
      </v-card-text>
    </v-card>
  </v-container>
  <v-dialog v-model="whatsappDialog" max-width="700">
    <v-card>
      <v-card-title class="bg-success text-white">
        Invoice Sent Successfully
      </v-card-title>

      <v-card-text class="pt-4">
        <v-textarea :model-value="whatsappMessage" readonly rows="8" variant="outlined" label="WhatsApp Message" />
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="whatsappDialog = false">Close</v-btn>
        <v-btn color="success" prepend-icon="mdi-whatsapp" @click="openWhatsapp">
          Open WhatsApp
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import invoiceService from '../../../services/invoiceService'
import { useUIStore } from '../../../stores/snackBar'

const route = useRoute()
const ui = useUIStore()

const invoiceId = route.params.id

const loading = ref(false)
const saving = ref(false)
const workflowLoading = ref(false)
const invoice = ref(null)
const formErrors = ref({})

const whatsappDialog = ref(false)
const whatsappUrl = ref('')
const whatsappMessage = ref('')

const form = ref({
  client_name: '',
  organization_name: '',
  project_name: '',
  invoice_date: '',
  due_date: '',
  gst_percentage: 18,
  paid_amount: 0,
  notes: '',
  payment_date: new Date().toISOString().slice(0, 10),
  payment_mode: 'Bank Transfer',
  reference_no: '',
  bank_name: '',
  remarks: '',
})

const items = ref([])

const toDateInput = (value) => {
  if (!value) return ''
  return String(value).slice(0, 10)
}

const subtotal = computed(() => {
  return items.value.reduce((sum, item) => sum + Number(item.total || 0), 0)
})

const gstAmount = computed(() => {
  return subtotal.value * Number(form.value.gst_percentage || 0) / 100
})

const grandTotal = computed(() => {
  return subtotal.value + gstAmount.value
})

const balanceAmount = computed(() => {
  return Math.max(grandTotal.value - Number(form.value.paid_amount || 0), 0)
})

const fetchInvoice = async () => {
  loading.value = true

  try {
    const response = await invoiceService.getInvoice(invoiceId)
    invoice.value = response.data.data

    invoice.value = response.data.data
    items.value = JSON.parse(JSON.stringify(invoice.value.items || []))

    const totalForDefaultPayment = Number(invoice.value.grand_total || grandTotal.value || 0)

    form.value = {
      client_name: invoice.value.client_name || '',
      organization_name: invoice.value.organization_name || '',
      project_name: invoice.value.project_name || '',
      invoice_date: toDateInput(invoice.value.invoice_date),
      due_date: toDateInput(invoice.value.due_date),
      gst_percentage: invoice.value.gst_percentage || 18,

      // default 50% only when no payment is recorded
      paid_amount: Number(invoice.value.paid_amount || 0) > 0
        ? Number(invoice.value.paid_amount)
        : Number((totalForDefaultPayment * 0.5).toFixed(2)),

      payment_date: new Date().toISOString().slice(0, 10),
      payment_mode: 'Bank Transfer',
      reference_no: '',
      bank_name: '',
      remarks: '',
      notes: invoice.value.notes || '',
    }

    items.value = JSON.parse(JSON.stringify(invoice.value.items || []))
  } catch (error) {
    ui.showSnackbar?.('Failed to load invoice.', 'error')
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

const saveInvoice = async () => {
  saving.value = true
  formErrors.value = {}

  try {
    await invoiceService.updateInvoice(invoiceId, {
      ...form.value,
      items: items.value,
    })

    ui.showSnackbar?.('Invoice saved successfully.', 'success')
    await fetchInvoice()
  } catch (error) {
    if (error.response?.status === 422) {
      formErrors.value = error.response.data.errors || {}
    }

    ui.showSnackbar?.('Failed to save invoice.', 'error')
    console.error(error)
  } finally {
    saving.value = false
  }
}

const sendInvoice = async () => {
  workflowLoading.value = true

  try {
    const response = await invoiceService.sendInvoice(invoiceId)

    ui.showSnackbar?.(
      response.data.message || 'Invoice sent successfully.',
      'success'
    )

    whatsappUrl.value = response.data.data?.whatsapp_url || ''
    whatsappMessage.value = response.data.data?.whatsapp_message || ''

    if (whatsappUrl.value) {
      whatsappDialog.value = true
    }

    await fetchInvoice()
  } catch (error) {
    ui.showSnackbar?.(
      error.response?.data?.message || 'Failed to send invoice.',
      'error'
    )
  } finally {
    workflowLoading.value = false
  }
}

const openWhatsapp = () => {
  if (!whatsappUrl.value) return
  window.open(whatsappUrl.value, '_blank')
}

const markPaid = async () => {
  workflowLoading.value = true

  try {
    await invoiceService.markPaid(invoiceId, {
      paid_amount: form.value.paid_amount,
      payment_date: form.value.payment_date,
      payment_mode: form.value.payment_mode,
      reference_no: form.value.reference_no,
      bank_name: form.value.bank_name,
      remarks: form.value.remarks,
    })

    ui.showSnackbar?.('Payment status updated successfully.', 'success')
    await fetchInvoice()
  } catch (error) {
    ui.showSnackbar?.('Failed to update payment status.', 'error')
  } finally {
    workflowLoading.value = false
  }
}

const cancelInvoice = async () => {
  workflowLoading.value = true

  try {
    await invoiceService.cancelInvoice(invoiceId)
    ui.showSnackbar?.('Invoice cancelled successfully.', 'success')
    await fetchInvoice()
  } catch (error) {
    ui.showSnackbar?.('Failed to cancel invoice.', 'error')
  } finally {
    workflowLoading.value = false
  }
}

const downloadPdf = async () => {
  try {
    const res = await invoiceService.downloadInvoicePdf(invoiceId)

    const blob = new Blob([res.data], {
      type: 'application/pdf',
    })

    const url = window.URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `${invoice.value?.invoice_no || 'invoice-' + invoiceId}.pdf`
    link.click()

    window.URL.revokeObjectURL(url)

    ui.showSnackbar?.('Invoice PDF downloaded successfully.', 'success')
  } catch (error) {
    ui.showSnackbar?.('Failed to download invoice PDF.', 'error')
  }
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

onMounted(fetchInvoice)
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
</style>