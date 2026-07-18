<template>
    <v-container fluid>
        <v-card>
            <v-card-title class="d-flex align-center justify-space-between flex-wrap ga-3">
                <div>
                    <div class="text-h6 font-weight-bold">Subject Period Allocation</div>
                    <div class="text-body-2 text-medium-emphasis">
                        Bulk edit weekly periods and timetable preferences
                    </div>
                </div>

                <div class="d-flex ga-2">
                    <v-btn variant="tonal" class="mt-2" prepend-icon="mdi-content-copy" @click="copyDialog = true">
                        Copy Grade
                    </v-btn>
                    <v-btn variant="tonal" class="mt-2" prepend-icon="mdi-refresh" @click="loadSubjects">
                        Load Subjects
                    </v-btn>

                    <v-btn color="primary" class="mt-2" prepend-icon="mdi-content-save" :loading="store.saving" @click="saveAll">
                        Save All
                    </v-btn>
                    <v-menu>
                        <template #activator="{ props }">
                            <v-btn v-bind="props" icon="mdi-dots-vertical" variant="tonal" />
                        </template>

                        <v-list density="compact">
                            <v-list-item @click="downloadTemplate">
                                <template #prepend>
                                    <v-icon>mdi-download</v-icon>
                                </template>
                                <v-list-item-title>Download Template</v-list-item-title>
                            </v-list-item>

                            <v-list-item @click="exportExcel">
                                <template #prepend>
                                    <v-icon>mdi-file-excel</v-icon>
                                </template>
                                <v-list-item-title>Export Excel</v-list-item-title>
                            </v-list-item>

                            <v-list-item @click="fileInput?.click()">
                                <template #prepend>
                                    <v-icon>mdi-file-upload</v-icon>
                                </template>
                                <v-list-item-title>Import Excel</v-list-item-title>
                            </v-list-item>
                        </v-list>
                    </v-menu>

                    <input ref="fileInput" type="file" accept=".xlsx,.xls,.csv" class="d-none" @change="importExcel" />

                </div>
            </v-card-title>

            <v-divider />

            <v-card-text>
                <v-row>
                    <v-col cols="12" md="3">
                        <v-select v-model="filters.academic_year_id" :items="academicYears" item-title="name"
                            item-value="id" label="Academic Year" density="compact" variant="outlined" />
                    </v-col>

                    <v-col cols="12" md="3">
                        <v-select v-model="filters.grade_id" :items="grades" item-title="name" item-value="id"
                            label="Grade" density="compact" variant="outlined" @update:model-value="onGradeChange" />
                    </v-col>

                    <v-col cols="12" md="3">
                        <v-select v-model="filters.section_id" :items="sections" item-title="display_name"
                            item-value="id" label="Section" density="compact" variant="outlined" clearable />
                    </v-col>

                    <v-col cols="12" md="3">
                        <v-select v-model="filters.stream_id" :items="streams" item-title="name" item-value="id"
                            label="Stream" density="compact" variant="outlined" clearable />
                    </v-col>
                </v-row>

                <v-alert v-if="error" type="error" variant="tonal" class="mb-4">
                    {{ error }}
                </v-alert>

                <v-data-table :headers="headers" :items="rows" :loading="loading" item-value="subject_id"
                    density="compact" class="elevation-1">
                    <template #item.subject_name="{ item }">
                        <strong>{{ item.subject_name }}</strong>
                    </template>

                    <template #item.subject_category="{ item }">
                        <v-select v-model="item.subject_category" :items="categories" density="compact"
                            variant="outlined" hide-details />
                    </template>

                    <template #item.weekly_periods="{ item }">
                        <v-text-field v-model.number="item.weekly_periods" type="number" min="1" max="60"
                            density="compact" variant="outlined" hide-details />
                    </template>

                    <template #item.max_periods_per_day="{ item }">
                        <v-text-field v-model.number="item.max_periods_per_day" type="number" min="1" max="10"
                            density="compact" variant="outlined" hide-details />
                    </template>

                    <template #item.preferred_teacher_id="{ item }">
                        <v-select v-model="item.preferred_teacher_id" :items="teachers" item-title="name"
                            item-value="id" density="compact" variant="outlined" hide-details clearable />
                    </template>

                    <template #item.prefer_double_period="{ item }">
                        <v-checkbox-btn v-model="item.prefer_double_period" />
                    </template>

                    <template #item.prefer_morning="{ item }">
                        <v-checkbox-btn v-model="item.prefer_morning" />
                    </template>

                    <template #item.prefer_saturday="{ item }">
                        <v-checkbox-btn v-model="item.prefer_saturday" />
                    </template>

                    <template #item.is_parallel_subject="{ item }">
                        <v-checkbox-btn v-model="item.is_parallel_subject" />
                    </template>

                    <template #item.parallel_group_code="{ item }">
                        <v-text-field v-model="item.parallel_group_code" density="compact" variant="outlined"
                            hide-details placeholder="Group A" />
                    </template>

                    <template #item.priority="{ item }">
                        <v-text-field v-model.number="item.priority" type="number" min="1" max="10" density="compact"
                            variant="outlined" hide-details />
                    </template>
                </v-data-table>
            </v-card-text>
        </v-card>
        <v-dialog v-model="copyDialog" max-width="700">
            <v-card>
                <v-card-title>Copy Grade Allocation</v-card-title>

                <v-card-text>
                    <v-row>
                        <v-col cols="12" md="6">
                            <v-select v-model="copyForm.from_grade_id" :items="grades" item-title="name" item-value="id"
                                label="From Grade" variant="outlined" density="compact" />
                        </v-col>

                        <v-col cols="12" md="6">
                            <v-select v-model="copyForm.to_grade_id" :items="grades" item-title="name" item-value="id"
                                label="To Grade" variant="outlined" density="compact" />
                        </v-col>
                    </v-row>
                </v-card-text>

                <v-card-actions>
                    <v-spacer />
                    <v-btn variant="text" @click="copyDialog = false">Cancel</v-btn>
                    <v-btn color="primary" :loading="copying" @click="copyGrade">
                        Copy
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import api from '../../../plugins/api'
import { useSubjectPeriodAllocationStore } from '../../../stores/subjectPeriodAllocation'

const store = useSubjectPeriodAllocationStore()

const loading = ref(false)
const error = ref(null)

const academicYears = ref([])
const grades = ref([])
const sections = ref([])
const streams = ref([])
const subjects = ref([])
const teachers = ref([])
const rows = ref([])
const copyDialog = ref(false)
const copying = ref(false)

const filters = reactive({
    academic_year_id: null,
    grade_id: null,
    section_id: null,
    stream_id: null,
})

const categories = [
    'major',
    'minor',
    'language',
    'elective',
    'lab',
    'activity',
]

const headers = [
    { title: 'Subject', key: 'subject_name', minWidth: 180 },
    { title: 'Category', key: 'subject_category', minWidth: 160 },
    { title: 'Weekly', key: 'weekly_periods', width: 120 },
    { title: 'Max/Day', key: 'max_periods_per_day', width: 120 },
    { title: 'Teacher', key: 'preferred_teacher_id', minWidth: 180 },
    { title: 'Double', key: 'prefer_double_period', width: 90 },
    { title: 'Morning', key: 'prefer_morning', width: 90 },
    { title: 'Saturday', key: 'prefer_saturday', width: 90 },
    { title: 'Parallel', key: 'is_parallel_subject', width: 90 },
    { title: 'Group', key: 'parallel_group_code', minWidth: 140 },
    { title: 'Priority', key: 'priority', width: 100 },
]

const fetchMasters = async () => {
    const [
        academicYearRes,
        gradeRes,
        streamRes,
        teacherRes,
    ] = await Promise.all([
        api.get('/academic-years'),
        api.get('/grades'),
        api.get('/streams'),
        api.get('/teachers', { params: { per_page: 999 } }),
    ])

    academicYears.value = academicYearRes.data.data || academicYearRes.data
    grades.value = gradeRes.data.data || gradeRes.data
    streams.value = streamRes.data.data || streamRes.data
    teachers.value = teacherRes.data.data?.data || teacherRes.data.data || []
}

const onGradeChange = async () => {
    filters.section_id = null
    rows.value = []

    if (!filters.grade_id) return

    try {
        const res = await api.get('/sections', {
            params: { grade_id: filters.grade_id },
        })

        sections.value = res.data.data || res.data
    } catch {
        sections.value = []
    }
}

const copyForm = reactive({
    from_academic_year_id: null,
    to_academic_year_id: null,
    from_grade_id: null,
    to_grade_id: null,
    from_section_id: null,
    to_section_id: null,
    from_stream_id: null,
    to_stream_id: null,
})

const copyGrade = async () => {
    copying.value = true
    error.value = null

    try {
        await api.post('/subject-period-allocations/copy-grade', {
            ...copyForm,
            to_academic_year_id: filters.academic_year_id,
            to_grade_id: filters.grade_id,
            to_section_id: filters.section_id,
            to_stream_id: filters.stream_id,
        })

        copyDialog.value = false
        await loadSubjects()
    } catch (e) {
        error.value = e.response?.data?.message || 'Failed to copy grade allocation.'
    } finally {
        copying.value = false
    }
}

const loadSubjects = async () => {
    if (!filters.grade_id) {
        error.value = 'Please select grade first.'
        return
    }

    loading.value = true
    error.value = null

    try {
        const { data } = await api.get('/subject-period-allocations/bulk-editor-data', {
            params: {
                academic_year_id: filters.academic_year_id,
                grade_id: filters.grade_id,
                section_id: filters.section_id,
                stream_id: filters.stream_id,
            },
        })

        rows.value = data.data || []
    } catch (e) {
        error.value = e.response?.data?.message || 'Failed to load subject allocation data.'
    } finally {
        loading.value = false
    }
}

const fileInput = ref(null)

const exportExcel = async () => {
    const response = await api.get('/subject-period-allocations/export', {
        params: filters,
        responseType: 'blob',
    })

    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')

    link.href = url
    link.setAttribute('download', 'subject-period-allocations.xlsx')
    document.body.appendChild(link)
    link.click()
    link.remove()

    window.URL.revokeObjectURL(url)
}

const importExcel = async (event) => {
    const file = event.target.files?.[0]

    if (!file) return

    const formData = new FormData()

    formData.append('file', file)
    formData.append('academic_year_id', filters.academic_year_id || '')
    formData.append('grade_id', filters.grade_id || '')
    formData.append('section_id', filters.section_id || '')
    formData.append('stream_id', filters.stream_id || '')

    try {
        await api.post('/subject-period-allocations/import', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })

        await loadSubjects()
    } finally {
        event.target.value = ''
    }
}

const downloadTemplate = async () => {
    const response = await api.get('/subject-period-allocations/template', {
        responseType: 'blob',
    })

    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')

    link.href = url
    link.setAttribute('download', 'subject-period-allocation-template.xlsx')
    document.body.appendChild(link)
    link.click()
    link.remove()

    window.URL.revokeObjectURL(url)
}

const saveAll = async () => {
    if (!filters.grade_id) {
        error.value = 'Please select grade first.'
        return
    }

    await store.bulkSave({
        academic_year_id: filters.academic_year_id,
        grade_id: filters.grade_id,
        section_id: filters.section_id,
        stream_id: filters.stream_id,
        items: rows.value,
    })

    await loadSubjects()
}

onMounted(fetchMasters)
</script>