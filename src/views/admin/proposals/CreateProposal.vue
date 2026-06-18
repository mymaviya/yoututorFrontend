<template>
    <v-container fluid>
        <v-card elevation="2">
            <v-card-title class="d-flex align-center justify-space-between">
                <div>
                    <h2 class="text-h5 font-weight-bold">Create Proposal</h2>
                    <p class="text-body-2 text-medium-emphasis mb-0">
                        Create a new editable proposal from template and service catalog
                    </p>
                </div>

                <v-btn variant="tonal" prepend-icon="mdi-arrow-left" @click="$router.push('/admin/proposals')">
                    Back
                </v-btn>
            </v-card-title>

            <v-divider />

            <v-card-text>
                <v-form ref="formRef" @submit.prevent="submit">
                    <v-row>
                        <v-col cols="12" md="6">
                            <v-select v-model="form.proposal_template_id" :items="templates" item-title="name"
                                item-value="id" label="Proposal Template" variant="outlined" density="comfortable"
                                :error-messages="formErrors.proposal_template_id"
                                @update:model-value="onTemplateChange" />
                        </v-col>

                        <v-col cols="12" md="6">
                            <v-select v-model="form.service_catalog_id" :items="catalogs" item-title="name"
                                item-value="id" label="Service Catalog / Pricing Modules" variant="outlined"
                                density="comfortable" :error-messages="formErrors.service_catalog_id"
                                @update:model-value="onCatalogChange" />
                        </v-col>

                        <v-col cols="12">
                            <v-alert v-if="selectedCatalogItems.length" type="info" variant="tonal" border="start"
                                class="mb-2">
                                {{ selectedCatalogItems.length }} default modules will be added automatically.
                                Estimated Amount:
                                <strong>₹{{ catalogTotal.toLocaleString('en-IN') }}</strong>
                            </v-alert>
                        </v-col>

                        <v-col cols="12" md="6">
                            <v-text-field v-model="form.client_name" label="Client Name" variant="outlined"
                                density="comfortable" :error-messages="formErrors.client_name" />
                        </v-col>

                        <v-col cols="12" md="6">
                            <v-text-field v-model="form.organization_name" label="Organization Name" variant="outlined"
                                density="comfortable" :error-messages="formErrors.organization_name" />
                        </v-col>

                        <v-col cols="12" md="6">
                            <v-text-field v-model="form.client_email" label="Client Email" variant="outlined"
                                density="comfortable" :error-messages="formErrors.client_email" />
                        </v-col>

                        <v-col cols="12" md="6">
                            <v-text-field v-model="form.client_phone" label="Client Phone" variant="outlined"
                                density="comfortable" :error-messages="formErrors.client_phone" />
                        </v-col>

                        <v-col cols="12" md="8">
                            <v-text-field v-model="form.project_name" label="Project Name" variant="outlined"
                                density="comfortable" :error-messages="formErrors.project_name" />
                        </v-col>

                        <v-col cols="12" md="4">
                            <v-text-field v-model="form.timeline_days" label="Timeline Days" type="number"
                                variant="outlined" density="comfortable" :error-messages="formErrors.timeline_days" />
                        </v-col>

                        <v-col cols="12" md="4">
                            <v-switch v-model="form.gst_applicable" label="GST Applicable" color="primary" inset />
                        </v-col>

                        <v-col cols="12" md="4">
                            <v-text-field v-model="form.gst_percentage" label="GST Percentage" type="number"
                                variant="outlined" density="comfortable" :disabled="!form.gst_applicable"
                                :error-messages="formErrors.gst_percentage" />
                        </v-col>

                        <v-col cols="12">
                            <v-textarea v-model="form.payment_terms" label="Payment Terms" rows="3" variant="outlined"
                                density="comfortable" :error-messages="formErrors.payment_terms" />
                        </v-col>

                        <v-col cols="12">
                            <v-textarea v-model="form.notes" label="Internal Notes" rows="2" variant="outlined"
                                density="comfortable" :error-messages="formErrors.notes" />
                        </v-col>
                    </v-row>

                    <v-divider class="my-4" />

                    <div class="d-flex justify-end gap-2">
                        <v-btn variant="tonal" @click="$router.push('/admin/proposals')">
                            Cancel
                        </v-btn>

                        <v-btn color="primary" type="submit" :loading="saving" prepend-icon="mdi-content-save">
                            Create Proposal
                        </v-btn>
                    </div>
                </v-form>
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

const formRef = ref(null)
const saving = ref(false)
const loading = ref(false)

const templates = ref([])
const catalogs = ref([])
const selectedCatalogItems = ref([])
const formErrors = ref({})

const form = ref({
    proposal_template_id: null,
    service_catalog_id: null,
    client_name: '',
    client_email: '',
    client_phone: '',
    organization_name: '',
    project_name: '',
    project_type: '',
    timeline_days: 45,
    gst_applicable: true,
    gst_percentage: 18,
    payment_terms: '50% advance, 30% after module completion, 20% before final deployment.',
    notes: '',
})

const catalogTotal = computed(() => {
    return selectedCatalogItems.value.reduce((sum, item) => {
        return sum + Number(item.total || item.unit_price || 0)
    }, 0)
})

const fetchMasters = async () => {
    loading.value = true

    try {
        const [templateRes, catalogRes] = await Promise.all([
            proposalService.getTemplates(),
            proposalService.getServiceCatalogs(),
        ])

        templates.value = templateRes.data.data || []
        catalogs.value = catalogRes.data.data || []
    } catch (error) {
        console.error(error)
    } finally {
        loading.value = false
    }
}

const onTemplateChange = async (templateId) => {
    if (!templateId) return

    try {
        const response = await proposalService.getTemplate(templateId)
        const template = response.data.data

        form.value.project_type = template.project_type

        if (!form.value.project_name) {
            form.value.project_name = template.name
        }
    } catch (error) {
        console.error(error)
    }
}

const onCatalogChange = async (catalogId) => {
    selectedCatalogItems.value = []

    if (!catalogId) return

    try {
        const response = await proposalService.getServiceCatalog(catalogId)
        const catalog = response.data.data

        selectedCatalogItems.value = catalog.items || []

        form.value.project_type = catalog.project_type

        if (!form.value.project_name) {
            form.value.project_name = catalog.name
        }

        const totalTimeline = selectedCatalogItems.value.reduce((sum, item) => {
            return sum + Number(item.timeline_days || 0)
        }, 0)

        if (totalTimeline > 0) {
            form.value.timeline_days = totalTimeline
        }
    } catch (error) {
        console.error(error)
    }
}

const submit = async () => {
    saving.value = true
    formErrors.value = {}

    try {
        const payload = {
            ...form.value,
            gst_percentage: form.value.gst_applicable ? form.value.gst_percentage : 0,
        }

        const response = await proposalService.createProposal(payload)

        const proposal = response.data.data

        ui.showSnackbar?.('Proposal created successfully.', 'success')
        router.push(`/admin/proposals/${proposal.id}/edit`)
    } catch (error) {
        if (error.response?.status === 422) {
            formErrors.value = error.response.data.errors || {}
        }
        ui.showSnackbar?.('Failed to create proposal. Please check the form.', 'error')

        console.error(error)
    } finally {
        saving.value = false
    }
}

onMounted(fetchMasters)
</script>

<style scoped>
.gap-2 {
    gap: 8px;
}
</style>