<template>
    <v-container fluid>
        <v-card rounded="xl" elevation="3">
            <v-card-title class="d-flex flex-wrap align-center ga-3">
                <div>
                    <h2 class="text-h5 font-weight-bold">License Keys</h2>
                    <p class="text-body-2 text-medium-emphasis mb-0">
                        Manage license status, expiry, regeneration and linked subscriptions.
                    </p>
                </div>

                <v-spacer />

                <v-btn color="primary" prepend-icon="mdi-refresh" :loading="loading" @click="fetchLicenseKeys">
                    Refresh
                </v-btn>
            </v-card-title>

            <v-divider />

            <v-card-text>
                <v-row>
                    <v-col cols="12" md="4">
                        <v-text-field v-model="filters.search" label="Search school, email, mobile, license key"
                            variant="outlined" density="comfortable" prepend-inner-icon="mdi-magnify" clearable
                            @keyup.enter="fetchLicenseKeys" @click:clear="clearSearch" />
                    </v-col>

                    <v-col cols="12" md="3">
                        <v-select v-model="filters.status" label="Status" :items="statusOptions" variant="outlined"
                            density="comfortable" clearable @update:model-value="fetchLicenseKeys" />
                    </v-col>

                    <v-col cols="12" md="2">
                        <v-btn color="primary" block height="48" @click="fetchLicenseKeys">
                            Search
                        </v-btn>
                    </v-col>
                </v-row>

                <v-data-table-server v-model:items-per-page="pagination.per_page" :headers="headers"
                    :items="licenseKeys" :items-length="pagination.total" :loading="loading" item-value="id"
                    class="rounded-lg" @update:options="onTableOptions">
                    <template #item.school="{ item }">
                        <div class="font-weight-bold">
                            {{ item.subscription?.school_name || 'N/A' }}
                        </div>
                        <div class="text-caption text-medium-emphasis">
                            {{ item.subscription?.contact_person || 'N/A' }}
                        </div>
                    </template>

                    <template #item.plan="{ item }">
                        <v-chip color="primary" variant="tonal" size="small">
                            {{ item.subscription?.plan?.name || 'No Plan' }}
                        </v-chip>
                    </template>

                    <template #item.license_key="{ item }">
                        <div class="license-key">
                            {{ item.license_key }}
                        </div>
                    </template>

                    <template #item.status="{ item }">
                        <v-chip :color="statusColor(item.status)" variant="flat" size="small">
                            {{ formatStatus(item.status) }}
                        </v-chip>
                    </template>

                    <template #item.activated_at="{ item }">
                        {{ formatDate(item.activated_at) }}
                    </template>

                    <template #item.expires_at="{ item }">
                        {{ formatDate(item.expires_at) }}
                    </template>

                    <template #item.remaining="{ item }">
                        <v-chip :color="remainingColor(item.expires_at)" size="small">
                            {{ daysRemaining(item.expires_at) }} Days
                        </v-chip>
                    </template>

                    <template #item.actions="{ item }">
                        <div class="d-flex ga-2 justify-end">
                            <v-btn icon="mdi-eye" size="small" color="primary" variant="tonal"
                                @click="openViewDialog(item)" />

                            <v-btn icon="mdi-calendar-plus" size="small" color="info" variant="tonal"
                                @click="openExtendDialog(item)" />

                            <v-btn icon="mdi-pencil" size="small" color="warning" variant="tonal"
                                @click="openStatusDialog(item)" />

                            <v-btn icon="mdi-refresh" size="small" color="success" variant="tonal"
                                @click="regenerateLicense(item)" />

                            <v-btn icon="mdi-content-copy" size="small" color="secondary" variant="tonal"
                                @click="copyText(item.license_key)" />
                        </div>
                    </template>
                </v-data-table-server>
            </v-card-text>
        </v-card>

        <!-- View Dialog -->
        <v-dialog v-model="viewDialog" max-width="850">
            <v-card rounded="xl">
                <v-card-title class="d-flex align-center">
                    <div>
                        <div class="font-weight-bold">License Details</div>
                        <div class="text-caption text-medium-emphasis">
                            License key, subscription, school and plan details
                        </div>
                    </div>

                    <v-spacer />

                    <v-chip v-if="selected" :color="statusColor(selected.status)" variant="flat" size="small">
                        {{ formatStatus(selected.status) }}
                    </v-chip>
                </v-card-title>

                <v-divider />

                <v-card-text v-if="selected">
                    <v-row>
                        <v-col cols="12">
                            <v-card variant="tonal" rounded="lg" class="pa-4">
                                <div class="copy-row">
                                    <strong>License Key:</strong>
                                    <code>{{ selected.license_key || 'N/A' }}</code>
                                    <v-btn icon="mdi-content-copy" size="x-small" variant="text"
                                        @click="copyText(selected.license_key)" />
                                </div>
                            </v-card>
                        </v-col>

                        <v-col cols="12" md="6">
                            <v-card variant="tonal" rounded="lg" class="pa-4 h-100">
                                <h3 class="text-subtitle-1 font-weight-bold mb-4">
                                    School Details
                                </h3>

                                <div class="detail-row">
                                    <strong>School:</strong>
                                    <span>{{ selected.subscription?.school_name || 'N/A' }}</span>
                                </div>

                                <div class="detail-row">
                                    <strong>Contact:</strong>
                                    <span>{{ selected.subscription?.contact_person || 'N/A' }}</span>
                                </div>

                                <div class="detail-row">
                                    <strong>Mobile:</strong>
                                    <span>{{ selected.subscription?.mobile || 'N/A' }}</span>
                                </div>

                                <div class="detail-row">
                                    <strong>Email:</strong>
                                    <span>{{ selected.subscription?.email || 'N/A' }}</span>
                                </div>
                            </v-card>
                        </v-col>

                        <v-col cols="12" md="6">
                            <v-card variant="tonal" rounded="lg" class="pa-4 h-100">
                                <h3 class="text-subtitle-1 font-weight-bold mb-4">
                                    Subscription Details
                                </h3>

                                <div class="detail-row">
                                    <strong>Plan:</strong>
                                    <span>{{ selected.subscription?.plan?.name || 'N/A' }}</span>
                                </div>

                                <div class="detail-row">
                                    <strong>Subscription Status:</strong>
                                    <span>{{ formatStatus(selected.subscription?.status) }}</span>
                                </div>

                                <div class="detail-row">
                                    <strong>Amount:</strong>
                                    <span>₹{{ formatAmount(selected.subscription?.amount) }}</span>
                                </div>

                                <div class="detail-row">
                                    <strong>Subscription Ends:</strong>
                                    <span>{{ formatDate(selected.subscription?.ends_at) }}</span>
                                </div>
                            </v-card>
                        </v-col>

                        <v-col cols="12" md="6">
                            <v-card variant="tonal" rounded="lg" class="pa-4 h-100">
                                <h3 class="text-subtitle-1 font-weight-bold mb-4">
                                    License Status
                                </h3>

                                <div class="detail-row">
                                    <strong>Status:</strong>
                                    <span>{{ formatStatus(selected.status) }}</span>
                                </div>

                                <div class="detail-row">
                                    <strong>Domain:</strong>
                                    <span>{{ selected.domain || 'Not Bound' }}</span>
                                </div>

                                <div class="detail-row">
                                    <strong>Activated:</strong>
                                    <span>{{ formatDate(selected.activated_at) }}</span>
                                </div>

                                <div class="detail-row">
                                    <strong>Expires:</strong>
                                    <span>{{ formatDate(selected.expires_at) }}</span>
                                </div>
                            </v-card>
                        </v-col>

                        <v-col cols="12" md="6">
                            <v-card variant="tonal" rounded="lg" class="pa-4 h-100">
                                <h3 class="text-subtitle-1 font-weight-bold mb-4">
                                    Remaining Validity
                                </h3>

                                <v-chip :color="remainingColor(selected.expires_at)" size="large">
                                    {{ daysRemaining(selected.expires_at) }} Days Remaining
                                </v-chip>

                                <p class="text-body-2 text-medium-emphasis mt-4 mb-0">
                                    Extend or regenerate the license using the action buttons from the table.
                                </p>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-card-text>

                <v-card-actions class="pa-4">
                    <v-spacer />
                    <v-btn variant="text" @click="viewDialog = false">
                        Close
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Extend Dialog -->
        <v-dialog v-model="extendDialog" max-width="500">
            <v-card rounded="xl">
                <v-card-title class="font-weight-bold">
                    Extend License
                </v-card-title>

                <v-divider />

                <v-card-text>
                    <v-text-field v-model="extendForm.days" label="Extend Days" type="number" variant="outlined"
                        density="comfortable" :error-messages="formErrors.days" />
                </v-card-text>

                <v-card-actions class="pa-4">
                    <v-spacer />

                    <v-btn variant="text" @click="extendDialog = false">
                        Cancel
                    </v-btn>

                    <v-btn color="info" :loading="saving" @click="extendLicense">
                        Extend
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Status Dialog -->
        <v-dialog v-model="statusDialog" max-width="500">
            <v-card rounded="xl">
                <v-card-title class="font-weight-bold">
                    Update License Status
                </v-card-title>

                <v-divider />

                <v-card-text>
                    <v-select v-model="statusForm.status" label="Status" :items="statusOptions" variant="outlined"
                        density="comfortable" :error-messages="formErrors.status" />
                </v-card-text>

                <v-card-actions class="pa-4">
                    <v-spacer />

                    <v-btn variant="text" @click="statusDialog = false">
                        Cancel
                    </v-btn>

                    <v-btn color="warning" :loading="saving" @click="updateStatus">
                        Update
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="2500">
            {{ snackbar.message }}
        </v-snackbar>
    </v-container>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import api from '../../plugins/api'
import { useUIStore } from "../../stores/snackBar";
const ui = useUIStore();

const loading = ref(false)
const saving = ref(false)

const licenseKeys = ref([])
const selected = ref(null)

const viewDialog = ref(false)
const extendDialog = ref(false)
const statusDialog = ref(false)

const snackbar = reactive({
    show: false,
    message: '',
    color: 'success'
})

const filters = reactive({
    search: '',
    status: null
})

const pagination = reactive({
    page: 1,
    per_page: 50,
    total: 0
})

const extendForm = reactive({
    days: 365
})

const statusForm = reactive({
    status: 'active'
})

const formErrors = reactive({
    days: [],
    status: []
})

const headers = [
    { title: 'School', key: 'school', sortable: false },
    { title: 'Plan', key: 'plan', sortable: false },
    { title: 'License Key', key: 'license_key', sortable: false },
    { title: 'Status', key: 'status', sortable: false },
    { title: 'Activated', key: 'activated_at', sortable: false },
    { title: 'Expires', key: 'expires_at', sortable: false },
    { title: 'Remaining', key: 'remaining', sortable: false },
    { title: 'Actions', key: 'actions', sortable: false, align: 'end' }
]

const statusOptions = [
    { title: 'Active', value: 'active' },
    { title: 'Inactive', value: 'inactive' },
    { title: 'Expired', value: 'expired' },
    { title: 'Suspended', value: 'suspended' },
    { title: 'Cancelled', value: 'cancelled' }
]

const fetchLicenseKeys = async () => {
    loading.value = true

    try {
        const response = await api.get('/admin/license-keys', {
            params: {
                page: pagination.page,
                per_page: pagination.per_page,
                search: filters.search,
                status: filters.status
            }
        })

        const result = response.data.data

        licenseKeys.value = result.data || []
        pagination.total = result.total || 0
        pagination.page = result.current_page || 1
        pagination.per_page = result.per_page || 50
    } catch (error) {
        ui.showSnackbar(
            error.response?.data?.message || 'Unable to load license keys.',
            'error'
        )
    } finally {
        loading.value = false
    }
}

const onTableOptions = (options) => {
    pagination.page = options.page
    pagination.per_page = options.itemsPerPage
    fetchLicenseKeys()
}

const clearSearch = () => {
    filters.search = ''
    fetchLicenseKeys()
}

const openViewDialog = (item) => {
    selected.value = item
    viewDialog.value = true
}

const openExtendDialog = (item) => {
    clearErrors()
    selected.value = item
    extendForm.days = 365
    extendDialog.value = true
}

const openStatusDialog = (item) => {
    clearErrors()
    selected.value = item
    statusForm.status = item.status
    statusDialog.value = true
}

const extendLicense = async () => {
    clearErrors()
    saving.value = true

    try {
        await api.put(`/admin/license-keys/${selected.value.id}/extend`, {
            days: Number(extendForm.days || 0)
        })

        extendDialog.value = false
        fetchLicenseKeys()
        ui.showSnackbar('License extended successfully.')
    } catch (error) {
        if (error.response?.data?.errors) {
            Object.assign(formErrors, error.response.data.errors)
        } else {
            ui.showSnackbar(error.response?.data?.message || 'Unable to extend license.', 'error')
        }
    } finally {
        saving.value = false
    }
}

const updateStatus = async () => {
    clearErrors()
    saving.value = true

    try {
        await api.put(`/admin/license-keys/${selected.value.id}/status`, {
            status: statusForm.status
        })

        statusDialog.value = false
        fetchLicenseKeys()
        ui.showSnackbar('License status updated successfully.')
    } catch (error) {
        if (error.response?.data?.errors) {
            Object.assign(formErrors, error.response.data.errors)
        } else {
            ui.showSnackbar(error.response?.data?.message || 'Unable to update license status.', 'error')
        }
    } finally {
        saving.value = false
    }
}


const regenerateLicense = async (item) => {
    const confirmed = await ui.confirmDialog(
        'Regenerate License Key',
        `Are you sure you want to regenerate the license key for <strong>${item.subscription?.school_name || 'this school'
        }</strong>? The <strong>old license key</strong> will <span class="text-error"><strong>stop working immediately.</strong></span>`
    )

    if (!confirmed) return

    try {
        await api.post(`/admin/license-keys/${item.id}/regenerate`)
        fetchLicenseKeys()
        ui.showSnackbar('License key regenerated successfully.')
    } catch (error) {
        ui.showSnackbar(error.response?.data?.message || 'Unable to regenerate license.', 'error')
    }
}

const clearErrors = () => {
    Object.keys(formErrors).forEach(key => {
        formErrors[key] = []
    })
}

const copyText = async (text) => {
    if (!text) return

    try {
        await navigator.clipboard.writeText(text)
        ui.showSnackbar('Copied successfully.')
    } catch {
        ui.showSnackbar('Unable to copy.', 'error')
    }
}

const statusColor = (status) => {
    const colors = {
        active: 'success',
        inactive: 'grey',
        expired: 'error',
        suspended: 'deep-orange',
        cancelled: 'grey-darken-2'
    }

    return colors[status] || 'grey'
}

const remainingColor = (date) => {
    const days = daysRemaining(date)

    if (days > 30) return 'success'
    if (days > 7) return 'warning'
    return 'error'
}

const daysRemaining = (date) => {
    if (!date) return 0

    const today = new Date()
    const expiry = new Date(date)

    return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))
}

const formatStatus = (status) => {
    return String(status || 'N/A')
        .replaceAll('_', ' ')
        .replace(/\b\w/g, char => char.toUpperCase())
}

const formatAmount = (amount) => {
    return Number(amount || 0).toLocaleString('en-IN', {
        maximumFractionDigits: 0
    })
}

const formatDate = (date) => {
    if (!date) return 'N/A'

    return new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    })
}

onMounted(fetchLicenseKeys)
</script>

<style scoped>
.license-key {
    max-width: 220px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: monospace;
    font-size: 12px;
}

.detail-row {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    padding: 9px 0;
    border-bottom: 1px dashed rgba(var(--v-border-color), var(--v-border-opacity));
}

.detail-row:last-child {
    border-bottom: none;
}

.detail-row span {
    text-align: right;
    color: rgba(var(--v-theme-on-surface), 0.72);
}

.copy-row {
    display: grid;
    grid-template-columns: 110px 1fr 36px;
    align-items: center;
    gap: 12px;
}

.copy-row code {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding: 8px 10px;
    border-radius: 8px;
    background: rgba(var(--v-theme-primary), 0.08);
}

@media (max-width: 600px) {
    .detail-row {
        flex-direction: column;
        gap: 3px;
    }

    .detail-row span {
        text-align: left;
    }

    .copy-row {
        grid-template-columns: 1fr;
    }
}
</style>