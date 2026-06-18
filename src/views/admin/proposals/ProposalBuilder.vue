<template>
    <v-container fluid>
        <v-card elevation="2">
            <v-card-title class="d-flex align-center justify-space-between">
                <div>
                    <h2 class="text-h5 font-weight-bold">Proposal Builder</h2>
                    <p class="text-body-2 text-medium-emphasis mb-0">
                        Edit proposal sections, deliverables, pricing and workflow status
                    </p>
                </div>

                <div class="d-flex gap-2">
                    <v-btn variant="tonal" prepend-icon="mdi-arrow-left" @click="$router.push('/admin/proposals')">
                        Back
                    </v-btn>

                    <v-btn color="info" prepend-icon="mdi-eye" :disabled="!proposal" @click="goPreview">
                        Preview
                    </v-btn>

                    <v-btn color="success" prepend-icon="mdi-file-pdf-box" :disabled="!proposal"
                        @click="downloadPdf(proposalId)">
                        PDF
                    </v-btn>
                </div>
            </v-card-title>

            <v-divider />

            <v-card-text v-if="loading">
                <v-skeleton-loader type="article, table" />
            </v-card-text>

            <v-card-text v-else-if="proposal">
                <v-alert type="info" variant="tonal" border="start" class="mb-4">
                    <strong>{{ proposal.proposal_no }}</strong>
                    —
                    {{ proposal.client_name }}
                    —
                    <v-chip :color="statusColor(proposal.status)" size="small" variant="flat">
                        {{ formatStatus(proposal.status) }}
                    </v-chip>
                </v-alert>

                <v-tabs v-model="tab" color="primary">
                    <v-tab value="basic">Basic Details</v-tab>
                    <v-tab value="sections">Sections</v-tab>
                    <v-tab value="items">Deliverables & Cost</v-tab>
                    <v-tab value="workflow">Workflow</v-tab>
                    <v-tab value="versions">Versions</v-tab>
                </v-tabs>

                <v-window v-model="tab" class="mt-4">
                    <v-window-item value="basic">
                        <v-card variant="outlined">
                            <v-card-text>
                                <v-form @submit.prevent="saveBasic">
                                    <v-row>
                                        <v-col cols="12" md="6">
                                            <v-text-field v-model="basicForm.client_name" label="Client Name"
                                                variant="outlined" density="comfortable"
                                                :error-messages="formErrors.client_name" />
                                        </v-col>

                                        <v-col cols="12" md="6">
                                            <v-text-field v-model="basicForm.client_email" label="Client Email"
                                                type="email" variant="outlined" density="comfortable"
                                                :error-messages="formErrors.client_email" />
                                        </v-col>

                                        <v-col cols="12" md="6">
                                            <v-text-field v-model="basicForm.client_phone"
                                                label="Client Mobile / WhatsApp Number" variant="outlined"
                                                density="comfortable" :error-messages="formErrors.client_phone" />
                                        </v-col>

                                        <v-col cols="12" md="6">
                                            <v-text-field v-model="basicForm.organization_name"
                                                label="Organization Name" variant="outlined" density="comfortable"
                                                :error-messages="formErrors.organization_name" />
                                        </v-col>

                                        <v-col cols="12" md="4">
                                            <v-text-field v-model="basicForm.project_name" label="Project Name"
                                                variant="outlined" density="comfortable"
                                                :error-messages="formErrors.project_name" />
                                        </v-col>

                                        <v-col cols="12" md="4">
                                            <v-text-field v-model="basicForm.timeline_days" label="Timeline Days"
                                                type="number" variant="outlined" density="comfortable"
                                                :error-messages="formErrors.timeline_days" />
                                        </v-col>

                                        <v-col cols="12" md="4">
                                            <v-text-field v-model="basicForm.gst_percentage" label="GST %" type="number"
                                                variant="outlined" density="comfortable"
                                                :error-messages="formErrors.gst_percentage" />
                                        </v-col>

                                        <v-col cols="12">
                                            <v-textarea v-model="basicForm.payment_terms" label="Payment Terms" rows="3"
                                                variant="outlined" density="comfortable"
                                                :error-messages="formErrors.payment_terms" />
                                        </v-col>

                                        <v-col cols="12">
                                            <v-textarea v-model="basicForm.notes" label="Notes" rows="2"
                                                variant="outlined" density="comfortable"
                                                :error-messages="formErrors.notes" />
                                        </v-col>
                                    </v-row>

                                    <div class="d-flex justify-end">
                                        <v-btn color="primary" type="submit" :loading="savingBasic"
                                            prepend-icon="mdi-content-save">
                                            Save Basic Details
                                        </v-btn>
                                    </div>
                                </v-form>
                            </v-card-text>
                        </v-card>
                    </v-window-item>

                    <v-window-item value="sections">
                        <v-card variant="outlined">
                            <v-card-text>
                                <v-alert type="warning" variant="tonal" class="mb-4">
                                    TipTap editor can be connected here. For now, content is editable as HTML/text.
                                </v-alert>

                                <v-expansion-panels multiple>
                                    <v-expansion-panel v-for="section in sections" :key="section.id">
                                        <v-expansion-panel-title>
                                            <div class="d-flex align-center justify-space-between w-100">
                                                <span>{{ section.title }}</span>
                                                <v-switch v-model="section.is_visible" color="primary" density="compact"
                                                    hide-details label="Visible" @click.stop />
                                            </div>
                                        </v-expansion-panel-title>

                                        <v-expansion-panel-text>
                                            <v-text-field v-model="section.title" label="Section Title"
                                                variant="outlined" density="comfortable" />

                                            <v-textarea v-model="section.content" label="Section Content" rows="8"
                                                variant="outlined" density="comfortable" />
                                        </v-expansion-panel-text>
                                    </v-expansion-panel>
                                </v-expansion-panels>

                                <div class="d-flex justify-end mt-4">
                                    <v-btn color="primary" :loading="savingSections" prepend-icon="mdi-content-save"
                                        @click="saveSections">
                                        Save Sections
                                    </v-btn>
                                </div>
                            </v-card-text>
                        </v-card>
                    </v-window-item>

                    <v-window-item value="items">
                        <v-card variant="outlined">
                            <v-card-title class="d-flex justify-space-between align-center">
                                <span>Deliverables & Pricing</span>

                                <v-btn color="primary" variant="tonal" prepend-icon="mdi-plus" @click="addItem">
                                    Add Item
                                </v-btn>
                            </v-card-title>

                            <v-card-text>
                                <v-table>
                                    <thead>
                                        <tr>
                                            <th>Module</th>
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
                                                <v-text-field v-model="item.module_name" variant="outlined"
                                                    density="compact" hide-details />
                                            </td>

                                            <td>
                                                <v-textarea v-model="item.description" rows="1" auto-grow
                                                    variant="outlined" density="compact" hide-details />
                                            </td>

                                            <td>
                                                <v-text-field v-model.number="item.quantity" type="number"
                                                    variant="outlined" density="compact" hide-details
                                                    @input="calculateItem(item)" />
                                            </td>

                                            <td>
                                                <v-text-field v-model.number="item.unit_price" type="number"
                                                    variant="outlined" density="compact" hide-details
                                                    @input="calculateItem(item)" />
                                            </td>

                                            <td>
                                                ₹{{ Number(item.total || 0).toLocaleString('en-IN') }}
                                            </td>

                                            <td>
                                                <v-btn icon size="small" color="error" variant="text"
                                                    @click="removeItem(index)">
                                                    <v-icon>mdi-delete</v-icon>
                                                </v-btn>
                                            </td>
                                        </tr>
                                    </tbody>
                                </v-table>

                                <v-divider class="my-4" />

                                <div class="d-flex justify-end">
                                    <v-card width="360" variant="tonal">
                                        <v-card-text>
                                            <div class="d-flex justify-space-between mb-2">
                                                <span>Subtotal</span>
                                                <strong>₹{{ subtotal.toLocaleString('en-IN') }}</strong>
                                            </div>

                                            <div class="d-flex justify-space-between mb-2">
                                                <span>GST {{ Number(basicForm.gst_percentage || 0) }}%</span>
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
                                    <v-btn color="primary" :loading="savingItems" prepend-icon="mdi-content-save"
                                        @click="saveItems">
                                        Save Deliverables
                                    </v-btn>
                                </div>
                            </v-card-text>
                        </v-card>
                    </v-window-item>

                    <v-window-item value="workflow">
                        <v-card variant="outlined">
                            <v-card-text>
                                <v-row>
                                    <v-col cols="12" md="3">
                                        <v-btn block color="info" :loading="workflowLoading" @click="sendProposal">
                                            Send Email & WhatsApp
                                        </v-btn>
                                    </v-col>

                                    <v-col cols="12" md="3">
                                        <v-btn block color="success" :loading="workflowLoading"
                                            @click="approveProposal">
                                            Approve
                                        </v-btn>
                                    </v-col>

                                    <v-col cols="12" md="3">
                                        <v-btn block color="error" :loading="workflowLoading" @click="rejectProposal">
                                            Reject
                                        </v-btn>
                                    </v-col>

                                    <v-col cols="12" md="3">
                                        <v-btn block color="purple" :loading="workflowLoading"
                                            @click="convertToQuotation">
                                            Convert to Quotation
                                        </v-btn>
                                    </v-col>

                                    <v-col cols="12">
                                        <v-textarea v-model="workflowNotes" label="Workflow Notes / Change Request"
                                            rows="3" variant="outlined" />
                                    </v-col>

                                    <v-col cols="12" md="4">
                                        <v-btn block color="warning" :loading="workflowLoading" @click="requestChanges">
                                            Request Changes
                                        </v-btn>
                                    </v-col>
                                </v-row>
                            </v-card-text>
                        </v-card>
                    </v-window-item>

                    <v-window-item value="versions">
                        <v-card variant="outlined">
                            <v-card-text>
                                <v-btn variant="tonal" prepend-icon="mdi-refresh" class="mb-4" @click="fetchVersions">
                                    Refresh Versions
                                </v-btn>

                                <v-table>
                                    <thead>
                                        <tr>
                                            <th>Version</th>
                                            <th>Created At</th>
                                            <th>Created By</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        <tr v-for="version in versions" :key="version.id">
                                            <td>V{{ version.version_no }}</td>
                                            <td>{{ formatDateTime(version.created_at) }}</td>
                                            <td>{{ version.creator?.name || '-' }}</td>
                                        </tr>

                                        <tr v-if="!versions.length">
                                            <td colspan="3" class="text-center text-medium-emphasis">
                                                No versions available yet.
                                            </td>
                                        </tr>
                                    </tbody>
                                </v-table>
                            </v-card-text>
                        </v-card>
                    </v-window-item>
                </v-window>
            </v-card-text>
        </v-card>
        <v-dialog v-model="whatsappDialog" max-width="700">
            <v-card>
                <v-card-title class="bg-success text-white">
                    Proposal Sent Successfully
                </v-card-title>

                <v-card-text class="pt-4">
                    <v-alert type="success" variant="tonal" class="mb-4">
                        Proposal email has been sent successfully.
                    </v-alert>

                    <div class="text-subtitle-1 font-weight-bold mb-2">
                        WhatsApp Message
                    </div>

                    <v-textarea :model-value="whatsappMessage" readonly rows="8" variant="outlined" />

                    <div class="mt-3 text-caption">
                        Review the message and click the button below to send it via WhatsApp.
                    </div>
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
    </v-container>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import proposalService from '../../../services/proposalService'
import { useUIStore } from '../../../stores/snackBar'

const route = useRoute()
const router = useRouter()
const ui = useUIStore()

const proposalId = route.params.id

const loading = ref(false)
const proposal = ref(null)
const tab = ref('basic')

const savingBasic = ref(false)
const savingSections = ref(false)
const savingItems = ref(false)
const workflowLoading = ref(false)

const formErrors = ref({})
const workflowNotes = ref('')

const whatsappDialog = ref(false)
const whatsappUrl = ref('')
const whatsappMessage = ref('')

const basicForm = ref({
    client_name: '',
    client_email: '',
    client_phone: '',
    organization_name: '',
    project_name: '',
    timeline_days: '',
    gst_percentage: 18,
    payment_terms: '',
    notes: '',
})

const sections = ref([])
const items = ref([])
const versions = ref([])

const subtotal = computed(() => {
    return items.value.reduce((sum, item) => {
        return sum + Number(item.total || 0)
    }, 0)
})

const gstAmount = computed(() => {
    return subtotal.value * Number(basicForm.value.gst_percentage || 0) / 100
})

const grandTotal = computed(() => {
    return subtotal.value + gstAmount.value
})

const fetchProposal = async () => {
    loading.value = true

    try {
        const response = await proposalService.getProposal(proposalId)
        proposal.value = response.data.data

        basicForm.value = {
            client_name: proposal.value.client_name || '',
            client_email: proposal.value.client_email || '',
            client_phone: proposal.value.client_phone || '',
            organization_name: proposal.value.organization_name || '',
            project_name: proposal.value.project_name || '',
            timeline_days: proposal.value.timeline_days || '',
            gst_percentage: proposal.value.gst_percentage || 18,
            payment_terms: proposal.value.payment_terms || '',
            notes: proposal.value.notes || '',
        }

        sections.value = JSON.parse(JSON.stringify(proposal.value.sections || []))
        items.value = JSON.parse(JSON.stringify(proposal.value.items || []))
    } catch (error) {
        console.error(error)
    } finally {
        loading.value = false
    }
}

const saveBasic = async () => {
    savingBasic.value = true
    formErrors.value = {}

    try {
        await proposalService.updateProposal(proposalId, basicForm.value)
        ui.showSnackbar?.('Basic details saved successfully.', 'success')
        await fetchProposal()
    } catch (error) {
        if (error.response?.status === 422) {
            formErrors.value = error.response.data.errors || {}
        }
        ui.showSnackbar?.('Failed to save basic details.', 'error')
        console.error(error)
    } finally {
        savingBasic.value = false
    }
}

const saveSections = async () => {
    savingSections.value = true

    try {
        await proposalService.updateSections(proposalId, {
            sections: sections.value,
        })

        ui.showSnackbar?.('Proposal sections saved successfully.', 'success')
        await fetchProposal()
    } catch (error) {
        ui.showSnackbar?.('Failed to save sections.', 'error')
        console.error(error)
    } finally {
        savingSections.value = false
    }
}

const addItem = () => {
    items.value.push({
        module_name: '',
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

const saveItems = async () => {
    savingItems.value = true

    try {
        await proposalService.updateItems(proposalId, {
            items: items.value,
        })

        ui.showSnackbar?.('Deliverables saved successfully.', 'success')
        await fetchProposal()
    } catch (error) {
        ui.showSnackbar?.('Failed to save deliverables.', 'error')
        console.error(error)
    } finally {
        savingItems.value = false
    }
}

const sendProposal = async () => {
    workflowLoading.value = true

    try {
        const response = await proposalService.sendProposal(proposalId)

        ui.showSnackbar?.(
            response.data.message || 'Proposal sent successfully.',
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

        await fetchProposal()
    } catch (error) {
        ui.showSnackbar?.(
            error.response?.data?.message || 'Failed to send proposal.',
            'error'
        )
        console.error(error)
    } finally {
        workflowLoading.value = false
    }
}

const openWhatsapp = () => {
  if (!whatsappUrl.value) return

  window.open(whatsappUrl.value, '_blank')

  ui.showSnackbar(
    'WhatsApp opened successfully.',
    'success'
  )
}

const approveProposal = async () => {
    workflowLoading.value = true

    try {
        await proposalService.approveProposal(proposalId)
        ui.showSnackbar?.('Proposal approved successfully.', 'success')
        await fetchProposal()
    } catch (error) {
        ui.showSnackbar?.(error.response?.data?.message || 'Workflow action failed.', 'error')
        console.error(error)
    } finally {
        workflowLoading.value = false
    }
}

const rejectProposal = async () => {
    workflowLoading.value = true

    try {
        await proposalService.rejectProposal(proposalId, {
            notes: workflowNotes.value,
        })
        ui.showSnackbar?.('Proposal rejected successfully.', 'success')
        await fetchProposal()
    } catch (error) {
        ui.showSnackbar?.(error.response?.data?.message || 'Workflow action failed.', 'error')
        console.error(error)
    } finally {
        workflowLoading.value = false
    }
}

const requestChanges = async () => {
    workflowLoading.value = true

    try {
        await proposalService.requestChanges(proposalId, {
            notes: workflowNotes.value,
        })
        ui.showSnackbar?.('Change request saved.', 'success')
        await fetchProposal()
    } catch (error) {
        ui.showSnackbar?.(error.response?.data?.message || 'Workflow action failed.', 'error')
        console.error(error)
    } finally {
        workflowLoading.value = false
    }
}

const convertToQuotation = async () => {
    workflowLoading.value = true

    try {
        await proposalService.convertToQuotation(proposalId)
        ui.showSnackbar?.('Proposal converted to quotation.', 'success')
        await fetchProposal()
    } catch (error) {
        ui.showSnackbar?.(error.response?.data?.message || 'Proposal convertsion failed.', 'error')
        console.error(error)
    } finally {
        workflowLoading.value = false
    }
}

const fetchVersions = async () => {
    try {
        const response = await proposalService.getVersions(proposalId)
        versions.value = response.data.data || []
    } catch (error) {
        console.error(error)
    }
}

const goPreview = () => {
    router.push(`/admin/proposals/${proposalId}/preview`)
}

const downloadPdf = async (id) => {
    try {
        const res = await proposalService.downloadProposalPdf(id)

        const blob = new Blob([res.data], {
            type: 'application/pdf',
        })

        const url = window.URL.createObjectURL(blob)

        const link = document.createElement('a')
        link.href = url
        link.download = `${proposal.value?.proposal_no || 'proposal-' + id}.pdf`
        link.click()

        window.URL.revokeObjectURL(url)

        ui.showSnackbar('Proposal PDF downloaded successfully.', 'success')
    } catch (error) {
        ui.showSnackbar('Failed to download PDF.', 'error')
        console.error(error)
    }
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

const formatDateTime = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleString('en-IN')
}

onMounted(() => {
    fetchProposal()
    fetchVersions()
})
</script>

<style scoped>
.gap-2 {
    gap: 8px;
}

.w-100 {
    width: 100%;
}
</style>