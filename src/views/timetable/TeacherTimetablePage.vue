<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import teacherTimetableService from '../../services/teacherTimetableService'
import TimetableToolbar from '../../components/timetable/TimetableToolbar.vue'
import TimetableFilters from '../../components/timetable/TimetableFilters.vue'
import SummaryCards from '../../components/timetable/SummaryCards.vue'
import WeeklyGrid from '../../components/timetable/WeeklyGrid.vue'
import TimetableLegend from '../../components/timetable/TimetableLegend.vue'

const loading = ref(false)
const filtersLoading = ref(false)
const exporting = ref(false)
const printing = ref(false)
const error = ref('')
const requestSequence = ref(0)
const appliedFilters = ref(null)

const filters = reactive({ academic_year_id: null, teacher_id: null })
const options = reactive({ academicYears: [], teachers: [] })
const timetable = reactive({
  days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  periods: [],
  entries: [],
  summary: {},
})

const unwrap = payload => payload?.data?.data ?? payload?.data ?? payload ?? {}
const list = (data, ...keys) => {
  for (const key of keys) if (Array.isArray(data?.[key])) return data[key]
  return []
}

const selectedParams = computed(() => Object.fromEntries(
  Object.entries(filters).filter(([, value]) => value !== null && value !== ''),
))
const summary = computed(() => timetable.summary || {})
const weeklyCapacity = computed(() => (
  (summary.value.weekly_periods ?? 0) + (summary.value.free_periods ?? 0)
))
const hasLoadedTimetable = computed(() => Boolean(appliedFilters.value?.teacher_id))
const busy = computed(() => (
  loading.value || filtersLoading.value || exporting.value || printing.value
))
const messageOf = errorValue => (
  errorValue?.response?.data?.message
  || errorValue?.message
  || 'Unable to load the teacher timetable.'
)

const clearTimetable = () => {
  timetable.periods = []
  timetable.entries = []
  timetable.summary = {}
}

const invalidateLoadedTimetable = () => {
  requestSequence.value += 1
  appliedFilters.value = null
  clearTimetable()
}

const updateFilters = value => {
  const previousTeacherId = filters.teacher_id
  const previousAcademicYearId = filters.academic_year_id

  Object.assign(filters, value || {})

  if (
    filters.teacher_id !== previousTeacherId
    || filters.academic_year_id !== previousAcademicYearId
  ) {
    invalidateLoadedTimetable()
    error.value = ''
  }
}

const hydrateOptions = data => {
  options.academicYears = list(data, 'academic_years', 'academicYears')
  options.teachers = list(data, 'teachers')
}

const hydrateTimetable = raw => {
  const data = unwrap(raw)
  timetable.periods = list(data, 'bells', 'periods', 'time_slots')
  timetable.entries = list(data, 'entries', 'items')
  timetable.summary = data.summary || {}
}

const loadFilters = async () => {
  filtersLoading.value = true
  try {
    hydrateOptions(unwrap(await teacherTimetableService.getFilters()))
  } catch (caught) {
    error.value = messageOf(caught)
  } finally {
    filtersLoading.value = false
  }
}

const load = async () => {
  if (!filters.teacher_id) {
    invalidateLoadedTimetable()
    return
  }

  const sequence = ++requestSequence.value
  const requestParams = { ...selectedParams.value }

  loading.value = true
  error.value = ''

  try {
    const response = await teacherTimetableService.getTimetable(requestParams)
    if (sequence !== requestSequence.value) return

    hydrateTimetable(response)
    appliedFilters.value = requestParams
  } catch (caught) {
    if (sequence !== requestSequence.value) return

    appliedFilters.value = null
    clearTimetable()
    error.value = messageOf(caught)
  } finally {
    if (sequence === requestSequence.value) loading.value = false
  }
}

const refresh = async () => {
  await loadFilters()
  if (filters.teacher_id) await load()
}

const reset = () => {
  filters.academic_year_id = null
  filters.teacher_id = null
  invalidateLoadedTimetable()
  error.value = ''
  loading.value = false
}

const exportExcel = async () => {
  if (!appliedFilters.value?.teacher_id) return

  exporting.value = true
  error.value = ''
  try {
    await teacherTimetableService.exportExcel(appliedFilters.value)
  } catch (caught) {
    error.value = messageOf(caught)
  } finally {
    exporting.value = false
  }
}

const printPdf = async () => {
  if (!appliedFilters.value?.teacher_id) return

  printing.value = true
  error.value = ''
  try {
    await teacherTimetableService.downloadPdf(appliedFilters.value)
  } catch (caught) {
    error.value = messageOf(caught)
  } finally {
    printing.value = false
  }
}

onMounted(loadFilters)
</script>

<template>
  <v-container fluid class="pa-4 pa-md-6">
    <div class="d-flex flex-column ga-4">
      <TimetableToolbar
        :loading="busy"
        :show-export="hasLoadedTimetable"
        :show-print="hasLoadedTimetable"
        @refresh="refresh"
        @export="exportExcel"
        @print="printPdf"
      />

      <v-alert v-if="error" type="error" variant="tonal" closable @click:close="error = ''">
        {{ error }}
      </v-alert>

      <TimetableFilters
        :model-value="filters"
        :academic-years="options.academicYears"
        :teachers="options.teachers"
        :loading="loading || filtersLoading"
        @update:model-value="updateFilters"
        @apply="load"
        @reset="reset"
      />

      <v-alert
        v-if="!hasLoadedTimetable"
        type="info"
        variant="tonal"
        icon="mdi-account-search"
      >
        {{ filters.teacher_id
          ? 'Click Apply to load the selected teacher timetable.'
          : 'Select a teacher and click Apply to view the weekly timetable.' }}
      </v-alert>

      <template v-else>
        <SummaryCards
          :assigned-periods="summary.weekly_periods ?? 0"
          :free-periods="summary.free_periods ?? 0"
          :subjects-handled="summary.subjects ?? 0"
          :substitutions="summary.substitutions ?? 0"
          :weekly-capacity="weeklyCapacity"
          :loading="loading"
        />
        <WeeklyGrid
          :days="timetable.days"
          :periods="timetable.periods"
          :entries="timetable.entries"
          :loading="loading"
        />
        <TimetableLegend />
      </template>
    </div>
  </v-container>
</template>

<style scoped>
@media print {
  .v-container {
    padding: 0 !important;
  }
}
</style>
