<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import teacherTimetableService from '../../services/teacherTimetableService'
import TimetableToolbar from '../../components/timetable/TimetableToolbar.vue'
import TimetableFilters from '../../components/timetable/TimetableFilters.vue'
import SummaryCards from '../../components/timetable/SummaryCards.vue'
import WeeklyGrid from '../../components/timetable/WeeklyGrid.vue'
import TimetableLegend from '../../components/timetable/TimetableLegend.vue'

const loading = ref(false)
const exporting = ref(false)
const printing = ref(false)
const error = ref('')
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
const params = computed(() => Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== null && value !== '')))
const summary = computed(() => timetable.summary || {})
const weeklyCapacity = computed(() => (summary.value.weekly_periods ?? 0) + (summary.value.free_periods ?? 0))
const messageOf = errorValue => errorValue?.response?.data?.message || errorValue?.message || 'Unable to load the teacher timetable.'

const updateFilters = value => Object.assign(filters, value || {})
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
  try {
    hydrateOptions(unwrap(await teacherTimetableService.getFilters()))
  } catch (caught) {
    error.value = messageOf(caught)
  }
}
const clearTimetable = () => {
  timetable.periods = []
  timetable.entries = []
  timetable.summary = {}
}
const load = async () => {
  if (!filters.teacher_id) {
    clearTimetable()
    return
  }
  loading.value = true
  error.value = ''
  try {
    hydrateTimetable(await teacherTimetableService.getTimetable(params.value))
  } catch (caught) {
    clearTimetable()
    error.value = messageOf(caught)
  } finally {
    loading.value = false
  }
}
const refresh = async () => {
  await loadFilters()
  await load()
}
const reset = () => {
  filters.academic_year_id = null
  filters.teacher_id = null
  clearTimetable()
  error.value = ''
}
const exportExcel = async () => {
  if (!filters.teacher_id) return
  exporting.value = true
  error.value = ''
  try {
    await teacherTimetableService.exportExcel(params.value)
  } catch (caught) {
    error.value = messageOf(caught)
  } finally {
    exporting.value = false
  }
}
const printPdf = async () => {
  if (!filters.teacher_id) return
  printing.value = true
  error.value = ''
  try {
    await teacherTimetableService.downloadPdf(params.value)
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
        :loading="loading || exporting || printing"
        :show-export="Boolean(filters.teacher_id)"
        :show-print="Boolean(filters.teacher_id)"
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
        :loading="loading"
        @update:model-value="updateFilters"
        @apply="load"
        @reset="reset"
      />

      <v-alert v-if="!filters.teacher_id" type="info" variant="tonal" icon="mdi-account-search">
        Select a teacher and click Apply to view the weekly timetable.
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
