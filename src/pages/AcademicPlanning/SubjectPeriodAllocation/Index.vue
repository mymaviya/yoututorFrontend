<template>
  <v-container fluid class="pa-4 pa-md-6">
    <v-card rounded="xl">
      <v-card-title class="d-flex align-center justify-space-between flex-wrap ga-3 pa-4 pa-md-5">
        <div>
          <div class="d-flex align-center ga-2">
            <div class="text-h6 font-weight-bold">Subject Period Allocation</div>
            <v-chip v-if="isDirty" color="warning" size="small" variant="tonal">Unsaved changes</v-chip>
          </div>
          <div class="text-body-2 text-medium-emphasis">
            Bulk edit weekly periods and timetable preferences for {{ selectedAcademicYear?.name || 'the selected session' }}.
          </div>
        </div>

        <div class="d-flex flex-wrap ga-2">
          <v-btn
            variant="tonal"
            prepend-icon="mdi-content-copy"
            :disabled="!filters.grade_id || busy"
            @click="openCopyDialog"
          >
            Copy Grade
          </v-btn>

          <v-btn
            variant="tonal"
            prepend-icon="mdi-refresh"
            :loading="loading"
            :disabled="!filters.grade_id || store.saving"
            @click="loadSubjectsWithConfirmation"
          >
            Load Subjects
          </v-btn>

          <v-btn
            color="primary"
            prepend-icon="mdi-content-save"
            :loading="store.saving"
            :disabled="!canSave"
            @click="saveAll"
          >
            Save All
          </v-btn>

          <v-menu>
            <template #activator="{ props }">
              <v-btn v-bind="props" icon="mdi-dots-vertical" variant="tonal" :disabled="busy" />
            </template>

            <v-list density="compact">
              <v-list-item prepend-icon="mdi-download" title="Download Template" @click="downloadTemplate" />
              <v-list-item prepend-icon="mdi-file-excel" title="Export Excel" :disabled="!filters.grade_id" @click="exportExcel" />
              <v-list-item prepend-icon="mdi-file-upload" title="Import Excel" :disabled="!filters.grade_id" @click="fileInput?.click()" />
            </v-list>
          </v-menu>

          <input
            ref="fileInput"
            type="file"
            accept=".xlsx,.xls,.csv"
            class="d-none"
            @change="importExcel"
          />
        </div>
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-4 pa-md-5">
        <v-alert
          v-if="!selectedAcademicYearId"
          type="warning"
          variant="tonal"
          class="mb-4"
          title="Academic session required"
        >
          Select an academic session from the app bar before managing subject period allocations.
        </v-alert>

        <v-row>
          <v-col cols="12" sm="6" md="4">
            <v-select
              v-model="filters.grade_id"
              :items="grades"
              item-title="name"
              item-value="id"
              label="Grade"
              density="comfortable"
              variant="outlined"
              hide-details
              :disabled="busy || !selectedAcademicYearId"
              @update:model-value="onGradeChange"
            />
          </v-col>

          <v-col cols="12" sm="6" md="4">
            <v-select
              v-model="filters.section_id"
              :items="sections"
              item-title="display_name"
              item-value="id"
              label="Section"
              density="comfortable"
              variant="outlined"
              hide-details
              clearable
              :disabled="!filters.grade_id || busy"
              @update:model-value="onContextFilterChange"
            />
          </v-col>

          <v-col cols="12" sm="6" md="4">
            <v-select
              v-model="filters.stream_id"
              :items="streams"
              item-title="name"
              item-value="id"
              label="Stream"
              density="comfortable"
              variant="outlined"
              hide-details
              clearable
              :disabled="!filters.grade_id || busy"
              @update:model-value="onContextFilterChange"
            />
          </v-col>
        </v-row>

        <v-row v-if="rows.length" class="mb-1">
          <v-col cols="12" sm="4">
            <v-card variant="tonal" rounded="lg" class="pa-3">
              <div class="text-caption text-medium-emphasis">Subjects</div>
              <div class="text-h6 font-weight-bold">{{ rows.length }}</div>
            </v-card>
          </v-col>
          <v-col cols="12" sm="4">
            <v-card variant="tonal" rounded="lg" class="pa-3">
              <div class="text-caption text-medium-emphasis">Total weekly periods</div>
              <div class="text-h6 font-weight-bold">{{ totalWeeklyPeriods }}</div>
            </v-card>
          </v-col>
          <v-col cols="12" sm="4">
            <v-card variant="tonal" rounded="lg" class="pa-3">
              <div class="text-caption text-medium-emphasis">Validation warnings</div>
              <div class="text-h6 font-weight-bold" :class="validationIssues.length ? 'text-warning' : 'text-success'">
                {{ validationIssues.length }}
              </div>
            </v-card>
          </v-col>
        </v-row>

        <v-alert
          v-if="validationIssues.length"
          type="warning"
          variant="tonal"
          class="mb-4"
          title="Allocation needs attention"
        >
          <div v-for="issue in validationIssues.slice(0, 5)" :key="issue" class="text-body-2">• {{ issue }}</div>
          <div v-if="validationIssues.length > 5" class="text-caption mt-1">
            And {{ validationIssues.length - 5 }} more issue(s).
          </div>
        </v-alert>

        <v-alert v-if="message" :type="messageType" variant="tonal" closable class="mb-4" @click:close="message = ''">
          {{ message }}
        </v-alert>

        <v-data-table
          :headers="headers"
          :items="rows"
          :loading="loading"
          item-value="subject_id"
          density="compact"
          class="allocation-table"
          fixed-header
          height="620"
          :items-per-page="-1"
        >
          <template #item.subject_name="{ item }"><strong>{{ item.subject_name }}</strong></template>

          <template #item.subject_category="{ item }">
            <v-select v-model="item.subject_category" :items="categories" density="compact" variant="outlined" hide-details />
          </template>

          <template #item.weekly_periods="{ item }">
            <v-text-field v-model.number="item.weekly_periods" type="number" min="0" max="60" density="compact" variant="outlined" hide-details />
          </template>

          <template #item.max_periods_per_day="{ item }">
            <v-text-field v-model.number="item.max_periods_per_day" type="number" min="1" max="10" density="compact" variant="outlined" hide-details />
          </template>

          <template #item.preferred_teacher_id="{ item }">
            <v-autocomplete v-model="item.preferred_teacher_id" :items="teachers" item-title="name" item-value="id" density="compact" variant="outlined" hide-details clearable />
          </template>

          <template #item.prefer_double_period="{ item }"><v-checkbox-btn v-model="item.prefer_double_period" /></template>
          <template #item.prefer_morning="{ item }"><v-checkbox-btn v-model="item.prefer_morning" /></template>
          <template #item.prefer_saturday="{ item }"><v-checkbox-btn v-model="item.prefer_saturday" /></template>
          <template #item.is_parallel_subject="{ item }"><v-checkbox-btn v-model="item.is_parallel_subject" /></template>

          <template #item.parallel_group_code="{ item }">
            <v-text-field v-model="item.parallel_group_code" density="compact" variant="outlined" hide-details placeholder="Group A" :disabled="!item.is_parallel_subject" />
          </template>

          <template #item.priority="{ item }">
            <v-text-field v-model.number="item.priority" type="number" min="1" max="10" density="compact" variant="outlined" hide-details />
          </template>

          <template #no-data>
            <div class="pa-10 text-center text-medium-emphasis">
              Select a grade and click <strong>Load Subjects</strong>.
            </div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <v-dialog v-model="copyDialog" max-width="700" persistent>
      <v-card rounded="xl">
        <v-card-title>Copy Grade Allocation</v-card-title>
        <v-card-text>
          <v-alert type="info" variant="tonal" class="mb-4">
            Allocations will be copied into {{ selectedAcademicYear?.name || 'the globally selected session' }} and the currently selected grade, section and stream.
          </v-alert>
          <v-row>
            <v-col cols="12" md="6">
              <v-select v-model="copyForm.from_academic_year_id" :items="academicYears" item-title="name" item-value="id" label="From Academic Year" variant="outlined" density="comfortable" />
            </v-col>
            <v-col cols="12" md="6">
              <v-select v-model="copyForm.from_grade_id" :items="grades" item-title="name" item-value="id" label="From Grade" variant="outlined" density="comfortable" />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="px-6 pb-5">
          <v-spacer />
          <v-btn variant="text" :disabled="copying" @click="copyDialog = false">Cancel</v-btn>
          <v-btn color="primary" :loading="copying" :disabled="!canCopy" @click="copyGrade">Copy</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import api from '../../../plugins/api'
import { useAppStore } from '../../../stores/app'
import { useSubjectPeriodAllocationStore } from '../../../stores/subjectPeriodAllocation'

const appStore = useAppStore()
const store = useSubjectPeriodAllocationStore()
const loading = ref(false)
const copying = ref(false)
const transferring = ref(false)
const message = ref('')
const messageType = ref('success')
const fileInput = ref(null)
const copyDialog = ref(false)
const baseline = ref('[]')
const suppressDirtyCheck = ref(false)

const academicYears = computed(() => appStore.academicYears)
const selectedAcademicYearId = computed(() => appStore.selectedAcademicYearId)
const selectedAcademicYear = computed(() => appStore.selectedAcademicYear)
const grades = ref([])
const sections = ref([])
const streams = ref([])
const teachers = ref([])
const rows = ref([])

const filters = reactive({ academic_year_id: null, grade_id: null, section_id: null, stream_id: null })
const copyForm = reactive({ from_academic_year_id: null, from_grade_id: null })

const categories = ['major', 'minor', 'language', 'elective', 'lab', 'activity']
const workingDaysPerWeek = 6
const headers = [
  { title: 'Subject', key: 'subject_name', minWidth: 180 },
  { title: 'Category', key: 'subject_category', minWidth: 150 },
  { title: 'Weekly', key: 'weekly_periods', width: 110 },
  { title: 'Max/Day', key: 'max_periods_per_day', width: 110 },
  { title: 'Teacher', key: 'preferred_teacher_id', minWidth: 190 },
  { title: 'Double', key: 'prefer_double_period', width: 85 },
  { title: 'Morning', key: 'prefer_morning', width: 85 },
  { title: 'Saturday', key: 'prefer_saturday', width: 85 },
  { title: 'Parallel', key: 'is_parallel_subject', width: 85 },
  { title: 'Group', key: 'parallel_group_code', minWidth: 135 },
  { title: 'Priority', key: 'priority', width: 100 },
]

const normalizeRows = (items) => items.map((item) => ({
  ...item,
  weekly_periods: Number(item.weekly_periods ?? 0),
  max_periods_per_day: Number(item.max_periods_per_day ?? 1),
  priority: Number(item.priority ?? 1),
  preferred_teacher_id: item.preferred_teacher_id || null,
  prefer_double_period: Boolean(item.prefer_double_period),
  prefer_morning: Boolean(item.prefer_morning),
  prefer_saturday: Boolean(item.prefer_saturday),
  is_parallel_subject: Boolean(item.is_parallel_subject),
  parallel_group_code: item.is_parallel_subject ? String(item.parallel_group_code || '').trim() : null,
}))

const serializedRows = computed(() => JSON.stringify(normalizeRows(rows.value)))
const isDirty = computed(() => rows.value.length > 0 && serializedRows.value !== baseline.value)
const busy = computed(() => loading.value || copying.value || transferring.value || store.saving)
const totalWeeklyPeriods = computed(() => rows.value.reduce((total, item) => total + (Number(item.weekly_periods) || 0), 0))

const validationIssues = computed(() => {
  const issues = []
  const subjectIds = new Set()

  rows.value.forEach((item) => {
    const subjectName = item.subject_name || 'Unnamed subject'
    const weekly = Number(item.weekly_periods)
    const maxDaily = Number(item.max_periods_per_day)
    const priority = Number(item.priority)

    if (!item.subject_id) issues.push(`${subjectName}: subject ID is missing.`)
    if (subjectIds.has(item.subject_id)) issues.push(`${subjectName}: duplicate subject entry.`)
    subjectIds.add(item.subject_id)

    if (!categories.includes(item.subject_category)) issues.push(`${subjectName}: select a valid category.`)
    if (!Number.isInteger(weekly) || weekly < 0 || weekly > 60) issues.push(`${subjectName}: weekly periods must be a whole number from 0 to 60.`)
    if (!Number.isInteger(maxDaily) || maxDaily < 1 || maxDaily > 10) issues.push(`${subjectName}: maximum periods per day must be from 1 to 10.`)
    if (!Number.isInteger(priority) || priority < 1 || priority > 10) issues.push(`${subjectName}: priority must be from 1 to 10.`)
    if (weekly > maxDaily * workingDaysPerWeek) issues.push(`${subjectName}: ${weekly} weekly periods exceed the ${maxDaily}-per-day capacity.`)
    if (item.prefer_double_period && weekly > 0 && weekly < 2) issues.push(`${subjectName}: double-period preference requires at least 2 weekly periods.`)
    if (item.is_parallel_subject && !String(item.parallel_group_code || '').trim()) issues.push(`${subjectName}: parallel group code is required.`)
  })

  return issues
})

const canSave = computed(() => Boolean(
  filters.academic_year_id &&
  filters.grade_id &&
  rows.value.length &&
  isDirty.value &&
  !validationIssues.value.length &&
  !busy.value,
))
const canCopy = computed(() => Boolean(copyForm.from_academic_year_id && copyForm.from_grade_id && filters.academic_year_id && filters.grade_id && !copying.value))

const notify = (text, type = 'success') => {
  message.value = text
  messageType.value = type
}

const extractList = (response) => {
  const payload = response?.data
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.data?.data)) return payload.data.data
  return []
}

const confirmDiscard = () => !isDirty.value || window.confirm('You have unsaved subject allocation changes. Discard them?')

const setRows = (items) => {
  suppressDirtyCheck.value = true
  rows.value = normalizeRows(Array.isArray(items) ? items : [])
  baseline.value = JSON.stringify(normalizeRows(rows.value))
  window.setTimeout(() => { suppressDirtyCheck.value = false }, 0)
}

const fetchMasters = async () => {
  try {
    const results = await Promise.allSettled([
      api.get('/grades'),
      api.get('/streams'),
      api.get('/teachers', { params: { per_page: 999 } }),
    ])

    grades.value = results[0].status === 'fulfilled' ? extractList(results[0].value) : []
    streams.value = results[1].status === 'fulfilled' ? extractList(results[1].value) : []
    teachers.value = results[2].status === 'fulfilled' ? extractList(results[2].value) : []

    const failedLoads = results.filter((result) => result.status === 'rejected').length
    if (failedLoads) notify(`${failedLoads} filter source(s) could not be loaded.`, 'warning')
  } catch (error) {
    notify(error.response?.data?.message || 'Failed to load allocation filters.', 'error')
  }
}

const onContextFilterChange = () => {
  if (rows.value.length) setRows([])
  message.value = ''
}

const onGradeChange = async () => {
  filters.section_id = null
  filters.stream_id = null
  setRows([])
  sections.value = []
  if (!filters.grade_id) return

  try {
    const response = await api.get('/sections', { params: { grade_id: filters.grade_id } })
    sections.value = extractList(response)
  } catch (error) {
    notify(error.response?.data?.message || 'Failed to load sections.', 'error')
  }
}

const loadSubjectsWithConfirmation = async () => {
  if (!confirmDiscard()) return
  await loadSubjects()
}

const loadSubjects = async () => {
  if (!filters.academic_year_id || !filters.grade_id) {
    notify('Please select an academic session from the app bar and choose a grade first.', 'warning')
    return
  }

  loading.value = true
  message.value = ''
  try {
    const { data } = await api.get('/subject-period-allocations/bulk-editor-data', { params: { ...filters } })
    setRows(Array.isArray(data?.data) ? data.data : [])
    notify(`${rows.value.length} subject allocation${rows.value.length === 1 ? '' : 's'} loaded.`)
  } catch (error) {
    setRows([])
    notify(error.response?.data?.message || 'Failed to load subject allocation data.', 'error')
  } finally {
    loading.value = false
  }
}

const validateRows = () => {
  if (!rows.value.length) {
    notify('There are no subject allocations to save.', 'warning')
    return false
  }
  if (validationIssues.value.length) {
    notify(`Please correct ${validationIssues.value.length} allocation issue(s) before saving.`, 'warning')
    return false
  }
  return true
}

const saveAll = async () => {
  if (!validateRows() || busy.value) return
  try {
    const items = normalizeRows(rows.value)
    await store.bulkSave({ ...filters, items })
    setRows(items)
    notify('Subject period allocations saved successfully.')
  } catch (error) {
    notify(error.response?.data?.message || store.error || 'Failed to save subject allocations.', 'error')
  }
}

const openCopyDialog = () => {
  if (!confirmDiscard()) return
  copyForm.from_academic_year_id = filters.academic_year_id
  copyForm.from_grade_id = null
  copyDialog.value = true
}

const copyGrade = async () => {
  if (!canCopy.value) return
  if (Number(copyForm.from_academic_year_id) === Number(filters.academic_year_id) && Number(copyForm.from_grade_id) === Number(filters.grade_id)) {
    notify('Source and destination grade cannot be the same.', 'warning')
    return
  }

  copying.value = true
  try {
    await api.post('/subject-period-allocations/copy-grade', {
      from_academic_year_id: copyForm.from_academic_year_id,
      from_grade_id: copyForm.from_grade_id,
      to_academic_year_id: filters.academic_year_id,
      to_grade_id: filters.grade_id,
      to_section_id: filters.section_id,
      to_stream_id: filters.stream_id,
    })
    copyDialog.value = false
    await loadSubjects()
    notify('Grade allocation copied successfully.')
  } catch (error) {
    notify(error.response?.data?.message || 'Failed to copy grade allocation.', 'error')
  } finally {
    copying.value = false
  }
}

const downloadBlob = (response, fallbackName) => {
  const contentDisposition = response.headers?.['content-disposition'] || ''
  const match = contentDisposition.match(/filename\*?=(?:UTF-8''|\")?([^\";]+)/i)
  const filename = match ? decodeURIComponent(match[1].replace(/\"/g, '')) : fallbackName
  const blob = new Blob([response.data], { type: response.headers?.['content-type'] || 'application/octet-stream' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => window.URL.revokeObjectURL(url), 1000)
}

const exportExcel = async () => {
  if (!filters.grade_id) return notify('Please select a grade first.', 'warning')
  transferring.value = true
  try {
    const response = await api.get('/subject-period-allocations/export', { params: { ...filters }, responseType: 'blob' })
    downloadBlob(response, 'subject-period-allocations.xlsx')
  } catch (error) {
    notify(error.response?.data?.message || 'Failed to export allocations.', 'error')
  } finally {
    transferring.value = false
  }
}

const importExcel = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  if (!filters.academic_year_id || !filters.grade_id) {
    event.target.value = ''
    return notify('Please select an academic session from the app bar and choose a grade before importing.', 'warning')
  }
  if (!confirmDiscard()) {
    event.target.value = ''
    return
  }

  transferring.value = true
  const formData = new FormData()
  formData.append('file', file)
  Object.entries(filters).forEach(([key, value]) => formData.append(key, value ?? ''))

  try {
    await api.post('/subject-period-allocations/import', formData)
    await loadSubjects()
    notify('Allocation file imported successfully.')
  } catch (error) {
    notify(error.response?.data?.message || 'Failed to import allocation file.', 'error')
  } finally {
    transferring.value = false
    event.target.value = ''
  }
}

const downloadTemplate = async () => {
  transferring.value = true
  try {
    const response = await api.get('/subject-period-allocations/template', { responseType: 'blob' })
    downloadBlob(response, 'subject-period-allocation-template.xlsx')
  } catch (error) {
    notify(error.response?.data?.message || 'Failed to download template.', 'error')
  } finally {
    transferring.value = false
  }
}

const handleBeforeUnload = (event) => {
  if (!isDirty.value) return
  event.preventDefault()
  event.returnValue = ''
}

watch(rows, () => {
  if (!suppressDirtyCheck.value && store.error) store.clearError()
}, { deep: true })

watch(selectedAcademicYearId, (yearId, previousYearId) => {
  if (Number(yearId) === Number(previousYearId)) return

  if (isDirty.value && !window.confirm('You have unsaved subject allocation changes. Change the academic session and discard them?')) {
    if (previousYearId) appStore.setAcademicYear(previousYearId)
    return
  }

  filters.academic_year_id = yearId || null
  filters.grade_id = null
  filters.section_id = null
  filters.stream_id = null
  sections.value = []
  setRows([])
  message.value = ''
}, { immediate: true })

watch(() => appStore.refreshKey, () => {
  if (!isDirty.value) fetchMasters()
})

onBeforeRouteLeave(() => confirmDiscard())
onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload)
  fetchMasters()
})
onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
  store.clearError()
})
</script>

<style scoped>
.allocation-table {
  border: 1px solid rgba(var(--v-border-color), 0.14);
  border-radius: 14px;
}
</style>
