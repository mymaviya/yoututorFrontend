<template>
  <v-container fluid class="teacher-timetable-page pa-4 pa-md-6">
    <div class="page-header mb-5">
      <div>
        <div class="text-h5 text-md-h4 font-weight-bold">Teacher Timetable</div>
        <div class="text-body-2 text-medium-emphasis mt-1">View teacher-wise and class-wise weekly schedules</div>
      </div>

      <div class="d-flex flex-wrap ga-2">
        <v-btn variant="tonal" prepend-icon="mdi-refresh" :loading="loading" @click="loadTimetable">Refresh</v-btn>
        <v-btn variant="tonal" prepend-icon="mdi-printer" :disabled="!hasData" @click="printTimetable">Print</v-btn>
        <v-btn color="primary" prepend-icon="mdi-file-excel-outline" :loading="exporting" :disabled="!hasData" @click="exportTimetable">Export</v-btn>
      </div>
    </div>

    <v-card rounded="xl" class="filter-card mb-5">
      <v-card-text class="pa-4 pa-md-5">
        <v-row>
          <v-col cols="12" md="3">
            <v-btn-toggle v-model="viewMode" color="primary" mandatory divided density="comfortable" class="w-100">
              <v-btn value="teacher" class="flex-grow-1"><v-icon start>mdi-account-school-outline</v-icon>Teacher</v-btn>
              <v-btn value="class" class="flex-grow-1"><v-icon start>mdi-google-classroom</v-icon>Class</v-btn>
            </v-btn-toggle>
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-select v-model="filters.academic_year_id" :items="academicYears" item-title="name" item-value="id" label="Academic Year" variant="outlined" density="comfortable" hide-details clearable />
          </v-col>

          <v-col v-if="viewMode === 'teacher'" cols="12" sm="6" md="3">
            <v-autocomplete v-model="filters.teacher_id" :items="teachers" item-title="name" item-value="id" label="Teacher" variant="outlined" density="comfortable" hide-details clearable />
          </v-col>

          <template v-else>
            <v-col cols="12" sm="6" md="2">
              <v-select v-model="filters.grade_id" :items="grades" item-title="name" item-value="id" label="Grade" variant="outlined" density="comfortable" hide-details clearable />
            </v-col>
            <v-col cols="12" sm="6" md="2">
              <v-select v-model="filters.section_id" :items="sections" item-title="name" item-value="id" label="Section" variant="outlined" density="comfortable" hide-details clearable />
            </v-col>
            <v-col cols="12" sm="6" md="2">
              <v-select v-model="filters.stream_id" :items="streams" item-title="name" item-value="id" label="Stream" variant="outlined" density="comfortable" hide-details clearable />
            </v-col>
          </template>

          <v-col cols="12" sm="6" md="3">
            <v-text-field v-model="search" label="Search subject, class or room" prepend-inner-icon="mdi-magnify" variant="outlined" density="comfortable" hide-details clearable />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-row class="mb-5">
      <v-col v-for="card in summaryCards" :key="card.key" cols="12" sm="6" md="3">
        <v-card rounded="xl" class="summary-card h-100">
          <v-card-text class="d-flex align-center justify-space-between pa-4">
            <div>
              <div class="text-caption text-medium-emphasis">{{ card.label }}</div>
              <div class="text-h5 font-weight-bold mt-1">{{ card.value }}</div>
            </div>
            <v-avatar :color="card.color" variant="tonal" size="48"><v-icon>{{ card.icon }}</v-icon></v-avatar>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-card rounded="xl" class="timetable-card">
      <v-card-title class="d-flex align-center justify-space-between flex-wrap ga-2 pa-4 pa-md-5">
        <div>
          <div class="text-subtitle-1 font-weight-bold">Weekly Schedule</div>
          <div class="text-caption text-medium-emphasis">{{ activeEntityLabel }}</div>
        </div>
        <div class="d-flex align-center ga-2">
          <v-chip color="primary" variant="tonal">{{ visibleEntries.length }} Periods</v-chip>
          <v-chip v-if="todayLabel" color="success" variant="tonal">Today: {{ todayLabel }}</v-chip>
        </div>
      </v-card-title>

      <v-divider />

      <v-skeleton-loader v-if="loading" type="table-heading, table-row-divider@8" class="pa-4" />

      <template v-else>
        <div v-if="hasData" class="table-scroll">
          <table class="timetable-grid">
            <thead>
              <tr>
                <th class="period-column">Period</th>
                <th v-for="day in weekdays" :key="day.value" :class="{ 'today-column': isToday(day.value) }">
                  <div class="font-weight-bold">{{ day.label }}</div>
                  <div class="text-caption text-medium-emphasis">{{ day.short }}</div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="bell in bells" :key="bell.id">
                <td class="period-cell">
                  <div class="font-weight-bold">{{ bell.title || `Period ${bell.period_number}` }}</div>
                  <div class="text-caption text-medium-emphasis">{{ formatTime(bell.start_time) }}–{{ formatTime(bell.end_time) }}</div>
                </td>
                <td v-for="day in weekdays" :key="`${bell.id}-${day.value}`" :class="{ 'today-column': isToday(day.value) }">
                  <div v-if="entryFor(day.value, bell.id)" class="period-card" :class="{ 'substitution-card': entryFor(day.value, bell.id)?.is_substitution }">
                    <div class="d-flex align-start justify-space-between ga-2">
                      <div class="subject-name">{{ entryFor(day.value, bell.id)?.subject?.name || 'Subject' }}</div>
                      <v-chip v-if="entryFor(day.value, bell.id)?.is_substitution" size="x-small" color="warning" variant="flat">Substitute</v-chip>
                    </div>
                    <div class="period-meta mt-2">
                      <span v-if="viewMode === 'teacher'">{{ classLabel(entryFor(day.value, bell.id)) }}</span>
                      <span v-else>{{ teacherLabel(entryFor(day.value, bell.id)) }}</span>
                    </div>
                    <div v-if="entryFor(day.value, bell.id)?.room_no" class="period-room mt-1"><v-icon size="14" class="me-1">mdi-door</v-icon>{{ entryFor(day.value, bell.id)?.room_no }}</div>
                  </div>
                  <div v-else class="free-period">Free</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="empty-state pa-10 pa-md-16 text-center">
          <v-avatar color="primary" variant="tonal" size="78" class="mb-4"><v-icon size="40">mdi-calendar-blank-outline</v-icon></v-avatar>
          <div class="text-h6 font-weight-bold">No timetable data found</div>
          <div class="text-body-2 text-medium-emphasis mt-2">Select the required filters and refresh the timetable.</div>
        </div>
      </template>
    </v-card>
  </v-container>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import api from '../../../plugins/api'

const loading = ref(false)
const exporting = ref(false)
const viewMode = ref('teacher')
const search = ref('')

const academicYears = ref([])
const teachers = ref([])
const grades = ref([])
const sections = ref([])
const streams = ref([])
const bells = ref([])
const entries = ref([])
const summary = ref({})

const filters = reactive({
  academic_year_id: null,
  teacher_id: null,
  grade_id: null,
  section_id: null,
  stream_id: null,
})

const weekdays = [
  { label: 'Monday', short: 'Mon', value: 'Monday' },
  { label: 'Tuesday', short: 'Tue', value: 'Tuesday' },
  { label: 'Wednesday', short: 'Wed', value: 'Wednesday' },
  { label: 'Thursday', short: 'Thu', value: 'Thursday' },
  { label: 'Friday', short: 'Fri', value: 'Friday' },
  { label: 'Saturday', short: 'Sat', value: 'Saturday' },
]

const todayLabel = computed(() => {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
  return weekdays.some((day) => day.value === today) ? today : null
})

const visibleEntries = computed(() => {
  const term = String(search.value || '').trim().toLowerCase()
  if (!term) return entries.value

  return entries.value.filter((entry) => [
    entry.subject?.name,
    entry.teacher?.name,
    entry.grade?.name,
    entry.section?.name,
    entry.stream?.name,
    entry.room_no,
  ].some((value) => String(value || '').toLowerCase().includes(term)))
})

const hasData = computed(() => bells.value.length > 0 && visibleEntries.value.length > 0)

const activeEntityLabel = computed(() => {
  if (viewMode.value === 'teacher') {
    const teacher = teachers.value.find((item) => Number(item.id) === Number(filters.teacher_id))
    return teacher?.name || 'Select a teacher'
  }

  const grade = grades.value.find((item) => Number(item.id) === Number(filters.grade_id))
  const section = sections.value.find((item) => Number(item.id) === Number(filters.section_id))
  const stream = streams.value.find((item) => Number(item.id) === Number(filters.stream_id))

  return [grade?.name, section?.name, stream?.name].filter(Boolean).join(' • ') || 'Select a class'
})

const summaryCards = computed(() => [
  { key: 'weekly_periods', label: 'Weekly Periods', value: summary.value.weekly_periods ?? visibleEntries.value.length, icon: 'mdi-calendar-week', color: 'primary' },
  { key: 'free_periods', label: 'Free Periods', value: summary.value.free_periods ?? calculateFreePeriods(), icon: 'mdi-coffee-outline', color: 'success' },
  { key: 'substitutions', label: 'Substitutions', value: summary.value.substitutions ?? visibleEntries.value.filter((item) => item.is_substitution).length, icon: 'mdi-account-switch-outline', color: 'warning' },
  { key: 'subjects', label: 'Subjects', value: summary.value.subjects ?? new Set(visibleEntries.value.map((item) => item.subject_id).filter(Boolean)).size, icon: 'mdi-book-open-page-variant-outline', color: 'info' },
])

const calculateFreePeriods = () => Math.max((bells.value.length * weekdays.length) - visibleEntries.value.length, 0)
const isToday = (weekday) => todayLabel.value === weekday

const entryFor = (weekday, bellId) => visibleEntries.value.find((entry) =>
  String(entry.weekday).toLowerCase() === String(weekday).toLowerCase() &&
  Number(entry.school_bell_id) === Number(bellId)
)

const classLabel = (entry) => [entry?.grade?.name, entry?.section?.name, entry?.stream?.name].filter(Boolean).join(' • ') || '-'
const teacherLabel = (entry) => entry?.substitute_teacher?.name || entry?.teacher?.name || '-'

const formatTime = (value) => {
  if (!value) return ''
  const [hour, minute] = String(value).split(':')
  const date = new Date()
  date.setHours(Number(hour), Number(minute), 0, 0)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const extractList = (result) => {
  if (result.status !== 'fulfilled') return []
  const payload = result.value?.data
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.data?.data)) return payload.data.data
  return []
}

const loadDropdowns = async () => {
  const results = await Promise.allSettled([
    api.get('/academic-years'),
    api.get('/teachers', { params: { per_page: 500 } }),
    api.get('/grades'),
    api.get('/sections'),
    api.get('/streams'),
    api.get('/bell-schedules'),
  ])

  academicYears.value = extractList(results[0])
  teachers.value = extractList(results[1])
  grades.value = extractList(results[2])
  sections.value = extractList(results[3])
  streams.value = extractList(results[4])
  bells.value = extractList(results[5])
    .filter((item) => item.is_teaching_period !== false)
    .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))

  if (!filters.academic_year_id) {
    const activeYear = academicYears.value.find((item) => item.is_active)
    filters.academic_year_id = activeYear?.id || academicYears.value[0]?.id || null
  }
}

const loadTimetable = async () => {
  if (viewMode.value === 'teacher' && !filters.teacher_id) {
    entries.value = []
    summary.value = {}
    return
  }

  if (viewMode.value === 'class' && !filters.grade_id) {
    entries.value = []
    summary.value = {}
    return
  }

  loading.value = true

  try {
    const endpoint = viewMode.value === 'teacher'
      ? `/teacher-timetable/teacher/${filters.teacher_id}`
      : '/teacher-timetable/class'

    const { data } = await api.get(endpoint, {
      params: {
        academic_year_id: filters.academic_year_id,
        grade_id: filters.grade_id,
        section_id: filters.section_id,
        stream_id: filters.stream_id,
      },
    })

    const payload = data?.data || data || {}
    entries.value = Array.isArray(payload.entries) ? payload.entries : Array.isArray(payload) ? payload : []
    summary.value = payload.summary || {}

    if (Array.isArray(payload.bells) && payload.bells.length) {
      bells.value = payload.bells
    }
  } finally {
    loading.value = false
  }
}

const printTimetable = () => window.print()

const exportTimetable = async () => {
  exporting.value = true
  try {
    const response = await api.get('/teacher-timetable/export', {
      params: {
        mode: viewMode.value,
        academic_year_id: filters.academic_year_id,
        teacher_id: filters.teacher_id,
        grade_id: filters.grade_id,
        section_id: filters.section_id,
        stream_id: filters.stream_id,
      },
      responseType: 'blob',
    })

    const blob = new Blob([response.data], { type: response.headers['content-type'] || 'application/octet-stream' })
    const url = window.URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `teacher-timetable-${new Date().toISOString().slice(0, 10)}.xlsx`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    window.URL.revokeObjectURL(url)
  } finally {
    exporting.value = false
  }
}

watch(() => viewMode.value, () => {
  entries.value = []
  summary.value = {}
})

watch(() => [
  filters.academic_year_id,
  filters.teacher_id,
  filters.grade_id,
  filters.section_id,
  filters.stream_id,
], () => loadTimetable())

onMounted(loadDropdowns)
</script>

<style scoped>
.teacher-timetable-page { min-height: 100%; background: rgb(var(--v-theme-background)); }
.page-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.filter-card, .summary-card, .timetable-card { border: 1px solid rgba(var(--v-border-color), 0.14); background: rgb(var(--v-theme-surface)); }
.summary-card { transition: 0.18s ease; }
.summary-card:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(15, 23, 42, 0.1); }
.table-scroll { width: 100%; overflow-x: auto; }
.timetable-grid { width: 100%; min-width: 1120px; border-collapse: separate; border-spacing: 0; }
.timetable-grid th, .timetable-grid td { border-right: 1px solid rgba(var(--v-border-color), 0.12); border-bottom: 1px solid rgba(var(--v-border-color), 0.12); vertical-align: top; }
.timetable-grid th { min-width: 160px; padding: 14px 12px; background: rgba(var(--v-theme-on-surface), 0.035); text-align: center; }
.period-column { width: 170px; min-width: 170px !important; position: sticky; left: 0; z-index: 4; background: rgb(var(--v-theme-surface)) !important; }
.period-cell { position: sticky; left: 0; z-index: 3; width: 170px; min-width: 170px; padding: 14px 12px; background: rgb(var(--v-theme-surface)); }
.timetable-grid td { height: 118px; padding: 10px; background: rgb(var(--v-theme-surface)); }
.today-column { background: rgba(var(--v-theme-primary), 0.055) !important; }
.period-card { height: 100%; min-height: 96px; padding: 12px; border-radius: 14px; border: 1px solid rgba(var(--v-theme-primary), 0.22); background: rgba(var(--v-theme-primary), 0.08); }
.substitution-card { border-color: rgba(var(--v-theme-warning), 0.55); background: rgba(var(--v-theme-warning), 0.12); }
.subject-name { font-weight: 700; line-height: 1.25; }
.period-meta, .period-room { font-size: 12px; color: rgba(var(--v-theme-on-surface), 0.72); }
.free-period { min-height: 96px; display: grid; place-items: center; border: 1px dashed rgba(var(--v-border-color), 0.2); border-radius: 14px; color: rgba(var(--v-theme-on-surface), 0.42); background: rgba(var(--v-theme-on-surface), 0.02); font-size: 12px; }
.empty-state { min-height: 360px; display: grid; place-items: center; align-content: center; }
@media print {
  .page-header, .filter-card, .summary-card { display: none !important; }
  .teacher-timetable-page { padding: 0 !important; background: #fff !important; }
  .timetable-card { border: 0 !important; box-shadow: none !important; }
  .table-scroll { overflow: visible !important; }
  .timetable-grid { min-width: 0 !important; font-size: 10px; }
  .timetable-grid th, .timetable-grid td { padding: 6px !important; }
  .period-column, .period-cell { position: static !important; }
  .period-card, .free-period { min-height: 70px; }
}
@media (max-width: 960px) { .page-header { align-items: flex-start; } }
</style>
