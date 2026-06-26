<template>
    <v-container fluid>
        <v-row class="mb-4">
            <v-col cols="12">
                <div class="d-flex align-center justify-space-between flex-wrap ga-3">
                    <div>
                        <h2 class="text-h5 font-weight-bold mb-1">
                            Question Bank Packages
                        </h2>
                        <div class="text-body-2 text-medium-emphasis">
                            Create grade-wise and grade-group-wise premium question bank packages.
                        </div>
                    </div>

                    <v-btn color="primary" @click="openCreate">
                        Add Package
                    </v-btn>
                </div>
            </v-col>
        </v-row>

        <v-card variant="outlined" class="mb-4">
            <v-card-text>
                <v-row>
                    <v-col cols="12" md="4">
                        <v-text-field v-model="filters.search" label="Search package" density="comfortable" clearable
                            @keyup.enter="fetchPackages" @click:clear="fetchPackages" />
                    </v-col>

                    <v-col cols="12" md="3">
                        <v-select v-model="filters.package_type" :items="packageTypeOptions" item-title="label"
                            item-value="value" label="Package Type" density="comfortable" clearable
                            @update:model-value="fetchPackages" />
                    </v-col>

                    <v-col cols="12" md="3">
                        <v-select v-model="filters.status" :items="statusOptions" item-title="label" item-value="value"
                            label="Status" density="comfortable" clearable @update:model-value="fetchPackages" />
                    </v-col>

                    <v-col cols="12" md="2" class="d-flex align-center">
                        <v-btn color="primary" variant="tonal" block @click="fetchPackages">
                            Filter
                        </v-btn>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>

        <v-card variant="outlined">
            <v-data-table-server v-model:page="pagination.page" v-model:items-per-page="pagination.per_page"
                :headers="headers" :items="packages" :items-length="pagination.total" :loading="loading"
                @update:options="onTableOptions">
                <template #item.name="{ item }">
                    <div class="py-2">
                        <div class="font-weight-medium">{{ item.name }}</div>
                        <div class="text-caption text-medium-emphasis">
                            {{ item.slug }}
                        </div>
                    </div>
                </template>

                <template #item.package_type="{ item }">
                    <v-chip size="small" variant="tonal">
                        {{ labelForPackageType(item.package_type) }}
                    </v-chip>
                </template>

                <template #item.price="{ item }">
                    ₹{{ Number(item.price || 0).toFixed(2) }}
                </template>

                <template #item.grades="{ item }">
                    <div class="d-flex flex-wrap ga-1">
                        <v-chip v-for="row in item.grades || []" :key="row.id" size="x-small" variant="tonal">
                            {{ row.grade?.name || '-' }}
                            <span v-if="row.stream"> / {{ row.stream?.name }}</span>
                        </v-chip>
                    </div>
                </template>

                <template #item.is_active="{ item }">
                    <v-chip size="small" :color="item.is_active ? 'success' : 'error'" variant="tonal">
                        {{ item.is_active ? 'Active' : 'Inactive' }}
                    </v-chip>
                </template>

                <template #item.actions="{ item }">
                    <v-btn size="small" variant="text" color="primary" @click="openEdit(item)">
                        Edit
                    </v-btn>
                    <v-btn size="small" variant="text" color="error" @click="deletePackage(item)">
                        Delete
                    </v-btn>
                </template>
            </v-data-table-server>
        </v-card>

        <v-dialog v-model="dialog" max-width="900">
            <v-card>
                <v-card-title>
                    {{ editingId ? 'Edit Package' : 'Create Package' }}
                </v-card-title>

                <v-card-text>
                    <v-row>
                        <v-col cols="12" md="6">
                            <v-text-field v-model="form.name" label="Package Name" :error-messages="errors.name" />
                        </v-col>

                        <v-col cols="12" md="6">
                            <v-text-field v-model="form.slug" label="Slug" hint="Leave blank to auto-generate"
                                persistent-hint :error-messages="errors.slug" />
                        </v-col>

                        <v-col cols="12" md="4">
                            <v-select v-model="form.package_type" :items="packageTypeOptions" item-title="label"
                                item-value="value" label="Package Type" :error-messages="errors.package_type" />
                        </v-col>

                        <v-col cols="12" md="4">
                            <v-select v-model="form.grade_group" :items="gradeGroupOptions" item-title="label"
                                item-value="value" label="Grade Group" clearable :error-messages="errors.grade_group" />
                        </v-col>

                        <v-col cols="12" md="4">
                            <v-text-field v-model="form.price" label="Price" type="number" prefix="₹"
                                :error-messages="errors.price" />
                        </v-col>

                        <v-col cols="12" md="4">
                            <v-text-field v-model="form.validity_days" label="Validity Days" type="number"
                                hint="Blank = lifetime" persistent-hint :error-messages="errors.validity_days" />
                        </v-col>

                        <v-col cols="12" md="4">
                            <v-text-field v-model="form.sort_order" label="Sort Order" type="number" />
                        </v-col>

                        <v-col cols="12" md="4">
                            <v-switch v-model="form.is_active" label="Active" color="success" />
                        </v-col>

                        <v-col cols="12">
                            <v-textarea v-model="form.description" label="Description" rows="3" />
                        </v-col>

                        <v-col cols="12">
                            <div class="font-weight-medium mb-2">
                                Included Grades / Streams
                            </div>

                            <v-alert type="info" variant="tonal" class="mb-3">
                                For Grade 11-12, select stream if this package is stream specific.
                            </v-alert>

                            <v-row v-for="(row, index) in form.grades" :key="index" align="center">
                                <v-col cols="12" md="5">
                                    <v-select v-model="row.grade_id" :items="grades" item-title="name" item-value="id"
                                        label="Grade" density="comfortable" />
                                </v-col>

                                <v-col cols="12" md="5">
                                    <v-select v-model="row.stream_id" :items="streams" item-title="name" item-value="id"
                                        label="Stream" density="comfortable" clearable />
                                </v-col>

                                <v-col cols="12" md="2">
                                    <v-btn icon="mdi-delete" color="error" variant="text"
                                        @click="removeGradeRow(index)" />
                                </v-col>
                            </v-row>

                            <v-btn size="small" color="primary" variant="tonal" class="mt-2" @click="addGradeRow">
                                Add Grade
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-card-text>

                <v-card-actions>
                    <v-spacer />
                    <v-btn variant="text" @click="dialog = false">
                        Cancel
                    </v-btn>
                    <v-btn color="primary" :loading="saving" @click="savePackage">
                        Save
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

const ui = useUIStore()
const loading = ref(false)
const saving = ref(false)
const dialog = ref(false)
const editingId = ref(null)

const packages = ref([])
const grades = ref([])
const streams = ref([])
const errors = reactive({})

const filters = reactive({
    search: '',
    package_type: null,
    status: null,
})

const pagination = reactive({
    page: 1,
    per_page: 20,
    total: 0,
})

const form = reactive({
    name: '',
    slug: '',
    package_type: 'single_grade',
    grade_group: null,
    price: 0,
    validity_days: null,
    description: '',
    is_active: true,
    sort_order: 0,
    grades: [],
})

const headers = [
    { title: 'Package', key: 'name', sortable: false },
    { title: 'Type', key: 'package_type', sortable: false },
    { title: 'Group', key: 'grade_group', sortable: false },
    { title: 'Price', key: 'price', sortable: false },
    { title: 'Grades', key: 'grades', sortable: false },
    { title: 'Status', key: 'is_active', sortable: false },
    { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
]

const packageTypeOptions = [
    { label: 'Single Grade', value: 'single_grade' },
    { label: 'Grade Group', value: 'grade_group' },
    { label: 'Stream Group', value: 'stream_group' },
]

const gradeGroupOptions = [
    { label: 'Grade 1 to 5', value: 'grade_1_5' },
    { label: 'Grade 6 to 8', value: 'grade_6_8' },
    { label: 'Grade 9 to 10', value: 'grade_9_10' },
    { label: 'Grade 11 to 12 Science', value: 'grade_11_12_science' },
    { label: 'Grade 11 to 12 Commerce', value: 'grade_11_12_commerce' },
    { label: 'Grade 11 to 12 Arts', value: 'grade_11_12_arts' },
]

const statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
]

const labelForPackageType = (value) => {
    return packageTypeOptions.find((item) => item.value === value)?.label || value
}

const resetErrors = () => {
    Object.keys(errors).forEach((key) => delete errors[key])
}

const resetForm = () => {
    editingId.value = null

    Object.assign(form, {
        name: '',
        slug: '',
        package_type: 'single_grade',
        grade_group: null,
        price: 0,
        validity_days: null,
        description: '',
        is_active: true,
        sort_order: 0,
        grades: [],
    })

    resetErrors()
}

const fetchMeta = async () => {
    try {
        const [gradeRes, streamRes] = await Promise.all([
            api.get('/grades'),
            api.get('/streams'),
        ])

        grades.value = gradeRes.data.data || gradeRes.data || []
        streams.value = streamRes.data.data || streamRes.data || []
    } catch (err) {
        ui.showSnackbar(
            err.response?.data?.message || 'Failed to load grades and streams',
            'error'
        )
    }
}

const fetchPackages = async () => {
    loading.value = true

    try {
        const res = await api.get('/admin/question-bank-packages', {
            params: {
                ...filters,
                page: pagination.page,
                per_page: pagination.per_page,
            },
        })

        const payload = res.data.data

        packages.value = payload.data || []
        pagination.total = payload.total || 0
        pagination.page = payload.current_page || 1
        pagination.per_page = payload.per_page || 20
    } catch (err) {
        ui.showSnackbar(
            err.response?.data?.message || 'Failed to load question bank packages',
            'error'
        )
    } finally {
        loading.value = false
    }
}

const onTableOptions = (options) => {
    pagination.page = options.page
    pagination.per_page = options.itemsPerPage
    fetchPackages()
}

const openCreate = () => {
    resetForm()
    addGradeRow()
    dialog.value = true
}

const openEdit = (item) => {
    resetForm()

    editingId.value = item.id

    Object.assign(form, {
        name: item.name || '',
        slug: item.slug || '',
        package_type: item.package_type || 'single_grade',
        grade_group: item.grade_group || null,
        price: item.price || 0,
        validity_days: item.validity_days || null,
        description: item.description || '',
        is_active: !!item.is_active,
        sort_order: item.sort_order || 0,
        grades: (item.grades || []).map((row) => ({
            grade_id: row.grade_id,
            stream_id: row.stream_id,
        })),
    })

    if (!form.grades.length) {
        addGradeRow()
    }

    dialog.value = true
}

const addGradeRow = () => {
    form.grades.push({
        grade_id: null,
        stream_id: null,
    })
}

const removeGradeRow = (index) => {
    form.grades.splice(index, 1)
}

const savePackage = async () => {
    saving.value = true
    resetErrors()

    const payload = {
        ...form,
        grades: form.grades.filter((row) => row.grade_id),
    }

    try {
        if (editingId.value) {
            await api.put(`/admin/question-bank-packages/${editingId.value}`, payload)
        } else {
            await api.post('/admin/question-bank-packages', payload)
        }

        ui.showSnackbar(
            editingId.value
                ? 'Package updated successfully'
                : 'Package created successfully'
        )

        dialog.value = false
        await fetchPackages()
    } catch (error) {
        const validationErrors = error.response?.data?.errors || {}
        Object.assign(errors, validationErrors)
        ui.showSnackbar(
            error.response?.data?.message || 'Please fix the validation errors',
            'error'
        )
    } finally {
        saving.value = false
    }
}

const deletePackage = async (item) => {
  const ok = await ui.confirmDialog(
    'Delete Package',
    `Are you sure you want to delete ${item.name}?`
  )

  if (!ok) return

  try {
    await api.delete(`/admin/question-bank-packages/${item.id}`)

    ui.showSnackbar(
      'Package deleted successfully'
    )

    await fetchPackages()
  } catch (err) {
    ui.showSnackbar(
      err.response?.data?.message ||
        'Failed to delete package',
      'error'
    )
  }
}

onMounted(async () => {
    await fetchMeta()
    await fetchPackages()
})
</script>