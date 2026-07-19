<template>
  <div class="reports-page">
    <v-card class="hero-card mb-6" rounded="xl" elevation="0">
      <v-card-text class="pa-6 pa-md-8">
        <div class="d-flex flex-wrap align-center justify-space-between ga-4">
          <div class="d-flex align-center ga-4">
            <v-avatar color="primary" variant="tonal" size="52">
              <v-icon size="28">mdi-chart-timeline-variant-shimmer</v-icon>
            </v-avatar>
            <div>
              <h1 class="text-h4 font-weight-bold">Timetable Reports & Analytics</h1>
              <p class="text-body-2 text-medium-emphasis mb-0">
                Review class, teacher and room schedules, workload balance and live conflicts.
              </p>
            </div>
          </div>
          <v-btn variant="tonal" prepend-icon="mdi-refresh" :loading="loading" @click="refreshCurrent">
            Refresh
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <v-card rounded="xl" elevation="0" border class="mb-5">
      <v-tabs v-model="tab" color="primary" grow show-arrows>
        <v-tab value="class" prepend-icon="mdi-google-classroom">Class</v-tab>
        <v-tab value="teacher" prepend-icon="mdi-account-school-outline">Teacher</v-tab>
        <v-tab value="room" prepend-icon="mdi-door-open">Room</v-tab>
        <v-tab value="workload" prepend-icon="mdi-chart-bar">Workload</v-tab>
        <v-tab value="conflicts" prepend-icon="mdi-alert-octagon-outline">Conflicts</v-tab>
      </v-tabs>
    </v-card>

    <v-row>
      <v-col cols="12" lg="3">
        <v-card rounded="xl" elevation="0" border class="filter-card">
          <v-card-title class="d-flex align-center ga-2">
            <v-icon color="primary">mdi-filter-variant</v-icon>
            Report Filters
          </v-card-title>
          <v-divider />
          <v-card-text class="pa-5">
            <v-select
              v-model="academicYearId"
              :items="academicYears"
              item-title="name"
              item-value="id"
              label="Academic Year"
              variant="outlined"
              density="comfortable"
              clearable
              class="mb-2"
              @update:model-value="onFilterChange"
            />

            <v-autocomplete
              v-if="tab === 'class'"
              v-model="selectedId"
              :items="timetables"
              :item-title="timetableTitle"
              item-value="id"
              label="Select Timetable"
              variant="outlined"
              density="comfortable"
              clearable
              :loading="mastersLoading"
              @update:model-value="loadSelectedReport"
            />

            <v-autocomplete
              v-else-if="tab === 'teacher'"
              v-model="selectedId"
              :items="teachers"
              item-title="name"
              item-value="id"
              label="Select Teacher"
              variant="outlined"
              density="comfortable"
              clearable
              :loading="mastersLoading"
              @update:model-value="loadSelectedReport"
            />

            <v-autocomplete
              v-else-if="tab === 'room'"
              v-model="selectedId"
              :items="rooms"
              :item-title="roomTitle"
              item-value="id"
              label="Select Room"
              variant="outlined"
              density="comfortable"
              clearable
              :loading="mastersLoading"
              @update:model-value="loadSelectedReport"
            />

            <v-alert v-else type="info" variant="tonal" density="compact">
              {{ tab === 'workload' ? 'Workload is calculated from all active timetable entries.' : 'Conflicts are detected live across active timetables.' }}
            </v-alert>

            <template v-if="['class', 'teacher', 'room'].includes(tab)">
              <v-divider class="my-4" />
              <div class="text-subtitle-2 mb-3">Export Report</div>
              <div class="d-flex ga-2">
                <v-btn block color="success" variant="tonal" prepend-icon="mdi-file-excel" :disabled="!selectedId" :loading="exporting === 'excel'" @click="download('excel')">
                  Excel
                </v-btn>
                <v-btn block color="error" variant="tonal" prepend-icon="mdi-file-pdf-box" :disabled="!selectedId" :loading="exporting === 'pdf'" @click="download('pdf')">
                  PDF
                </v-btn>
              </div>
            </template>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="9">
        <v-alert v-if="error" type="error" variant="tonal" closable class="mb-4" @click:close="error = ''">
          {{ error }}
        </v-alert>

        <v-skeleton-loader v-if="loading" type="heading, actions, table-heading, table-row@6" />

        <template v-else-if="['class', 'teacher', 'room'].includes(tab)">
          <div v-if="report">
            <v-row class="mb-2">
              <v-col v-for="card in reportCards" :key="card.label" cols="6" md="3">
                <v-card rounded="xl" elevation="0" border class="h-100">
                  <v-card-text class="d-flex align-center ga-3">
                    <v-avatar :color="card.color" variant="tonal"><v-icon>{{ card.icon }}</v-icon></v-avatar>
                    <div>
                      <div class="text-h5 font-weight-bold">{{ card.value }}</div>
                      <div class="text-caption text-medium-emphasis">{{ card.label }}</div>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <v-card rounded="xl" elevation="0" border>
              <v-card-title class="d-flex flex-wrap align-center justify-space-between ga-3">
                <div>
                  <div class="font-weight-bold">{{ report.title }}</div>
                  <div class="text-caption text-medium-emphasis">{{ report.rows?.length || 0 }} scheduled period entries</div>
                </div>
                <v-chip color="primary" variant="tonal">{{ titleCase(report.type) }} Report</v-chip>
              </v-card-title>
              <v-divider />
              <v-card-text class="pa-0">
                <div class="report-grid-wrap">
                  <table class="report-grid">
                    <thead>
                      <tr>
                        <th class="period-col">Period</th>
                        <th v-for="day in days" :key="day.value">{{ day.title }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="period in periods" :key="period.key">
                        <th class="period-col">
                          <div>{{ period.title }}</div>
                          <small>{{ period.time }}</small>
                        </th>
                        <td v-for="day in days" :key="day.value">
                          <div v-for="row in slotRows(day.value, period)" :key="row.entry_id" class="entry-card" :class="{ substitution: row.is_substitution, locked: row.is_locked }">
                            <div class="font-weight-bold">{{ primaryText(row) }}</div>
                            <div class="text-caption">{{ secondaryText(row) }}</div>
                            <div v-if="row.room" class="text-caption text-medium-emphasis"><v-icon size="13">mdi-door</v-icon> {{ row.room }}</div>
                            <div class="d-flex ga-1 mt-1">
                              <v-chip v-if="row.is_substitution" size="x-small" color="warning" variant="tonal">Substitution</v-chip>
                              <v-chip v-if="row.parallel_group" size="x-small" color="purple" variant="tonal">{{ row.parallel_group }}</v-chip>
                              <v-icon v-if="row.is_locked" size="14" color="primary">mdi-lock</v-icon>
                            </div>
                          </div>
                          <div v-if="!slotRows(day.value, period).length" class="empty-slot">—</div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </v-card-text>
            </v-card>
          </div>

          <v-card v-else rounded="xl" elevation="0" border>
            <v-card-text class="text-center py-16">
              <v-avatar color="primary" variant="tonal" size="72"><v-icon size="38">mdi-chart-box-outline</v-icon></v-avatar>
              <div class="text-h6 font-weight-bold mt-4">Choose a {{ tab }} report</div>
              <p class="text-body-2 text-medium-emphasis">Use the filter panel to select the schedule you want to analyse.</p>
            </v-card-text>
          </v-card>
        </template>

        <template v-else-if="tab === 'workload'">
          <v-row class="mb-2">
            <v-col cols="12" sm="4"><metric-card label="Teachers Scheduled" :value="workload.teacher_count || 0" icon="mdi-account-group" color="primary" /></v-col>
            <v-col cols="12" sm="4"><metric-card label="Total Periods" :value="workload.total_periods || 0" icon="mdi-calendar-clock" color="info" /></v-col>
            <v-col cols="12" sm="4"><metric-card label="Average Load" :value="averageLoad" icon="mdi-scale-balance" color="success" /></v-col>
          </v-row>

          <v-card rounded="xl" elevation="0" border>
            <v-card-title class="d-flex flex-wrap align-center justify-space-between ga-3">
              <span>Teacher Workload Distribution</span>
              <v-text-field v-model="workloadSearch" prepend-inner-icon="mdi-magnify" label="Search teacher" variant="outlined" density="compact" hide-details clearable style="max-width:280px" />
            </v-card-title>
            <v-divider />
            <v-card-text>
              <div v-if="filteredTeachers.length" class="d-flex flex-column ga-4">
                <div v-for="teacher in filteredTeachers" :key="teacher.teacher_id" class="workload-row">
                  <div class="d-flex flex-wrap align-center justify-space-between ga-2 mb-2">
                    <div>
                      <div class="font-weight-bold">{{ teacher.teacher_name || `Teacher #${teacher.teacher_id}` }}</div>
                      <div class="text-caption text-medium-emphasis">{{ teacher.classes?.length || 0 }} classes · {{ teacher.substitution_periods || 0 }} substitutions</div>
                    </div>
                    <v-chip :color="loadColor(teacher.weekly_periods)" variant="tonal">{{ teacher.weekly_periods }} periods</v-chip>
                  </div>
                  <v-progress-linear :model-value="loadPercent(teacher.weekly_periods)" :color="loadColor(teacher.weekly_periods)" height="10" rounded />
                  <div class="d-flex flex-wrap ga-1 mt-2">
                    <v-chip v-for="day in days" :key="day.value" size="x-small" variant="outlined">{{ day.short }}: {{ teacher.days?.[day.value] || 0 }}</v-chip>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-12 text-medium-emphasis">No teacher workload data found.</div>
            </v-card-text>
          </v-card>
        </template>

        <template v-else>
          <v-row class="mb-2">
            <v-col cols="12" sm="4"><metric-card label="Total Conflicts" :value="conflictReport.conflict_count || 0" icon="mdi-alert-octagon" :color="conflictReport.conflict_count ? 'error' : 'success'" /></v-col>
            <v-col cols="12" sm="4"><metric-card label="Teacher Conflicts" :value="teacherConflictCount" icon="mdi-account-alert" color="warning" /></v-col>
            <v-col cols="12" sm="4"><metric-card label="Room Conflicts" :value="roomConflictCount" icon="mdi-door-closed-lock" color="deep-orange" /></v-col>
          </v-row>

          <v-alert v-if="!conflictReport.conflict_count" type="success" variant="tonal" class="mb-4" title="No live conflicts detected">
            Teachers and rooms are not double-booked in the selected academic year.
          </v-alert>

          <v-card v-else rounded="xl" elevation="0" border>
            <v-card-title>Conflict Diagnostics</v-card-title>
            <v-divider />
            <v-list lines="three">
              <template v-for="(conflict, index) in conflictReport.conflicts" :key="`${conflict.type}-${index}`">
                <v-list-item>
                  <template #prepend>
                    <v-avatar :color="conflict.type === 'teacher_double_booking' ? 'warning' : 'deep-orange'" variant="tonal">
                      <v-icon>{{ conflict.type === 'teacher_double_booking' ? 'mdi-account-alert' : 'mdi-door-closed-lock' }}</v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-title>{{ titleCase(conflict.type) }}</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ dayName(conflict.weekday) }} · Bell #{{ conflict.school_bell_id }} · {{ conflict.message }}
                  </v-list-item-subtitle>
                  <div class="text-caption text-medium-emphasis mt-1">Affected entries: {{ conflict.entry_ids?.join(', ') }}</div>
                </v-list-item>
                <v-divider v-if="index < conflictReport.conflicts.length - 1" />
              </template>
            </v-list>
          </v-card>
        </template>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { computed, defineComponent, h, onMounted, ref, watch } from 'vue'
import api from '../../../plugins/api'
import timetableApi from '../../../services/timetableApi'
import { useUIStore } from '../../../stores/snackBar'

const ui = useUIStore()
const tab = ref('class')
const loading = ref(false)
const mastersLoading = ref(false)
const exporting = ref(null)
const error = ref('')
const selectedId = ref(null)
const academicYearId = ref(null)
const academicYears = ref([])
const timetables = ref([])
const teachers = ref([])
const rooms = ref([])
const report = ref(null)
const workload = ref({ teachers: [], teacher_count: 0, total_periods: 0 })
const conflictReport = ref({ conflicts: [], conflict_count: 0 })
const workloadSearch = ref('')

const days = [
  { value: 1, title: 'Monday', short: 'Mon' }, { value: 2, title: 'Tuesday', short: 'Tue' },
  { value: 3, title: 'Wednesday', short: 'Wed' }, { value: 4, title: 'Thursday', short: 'Thu' },
  { value: 5, title: 'Friday', short: 'Fri' }, { value: 6, title: 'Saturday', short: 'Sat' },
]

const MetricCard = defineComponent({
  props: { label: String, value: [String, Number], icon: String, color: String },
  setup: (props) => () => h('div', { class: 'v-card v-card--variant-outlined rounded-xl h-100 metric-card' }, [
    h('div', { class: 'v-card-text d-flex align-center ga-3' }, [
      h('div', { class: `v-avatar v-theme--light bg-${props.color}-lighten-5 text-${props.color} v-avatar--density-default v-avatar--size-default` }, [h('i', { class: `mdi ${props.icon}` })]),
      h('div', [h('div', { class: 'text-h5 font-weight-bold' }, String(props.value ?? 0)), h('div', { class: 'text-caption text-medium-emphasis' }, props.label)]),
    ]),
  ]),
})

const reportCards = computed(() => {
  const s = report.value?.summary || {}
  return [
    { label: 'Total Periods', value: s.total_periods || 0, icon: 'mdi-calendar-clock', color: 'primary' },
    { label: 'Teaching Days', value: s.teaching_days || 0, icon: 'mdi-calendar-week', color: 'info' },
    { label: tab.value === 'teacher' ? 'Classes' : 'Subjects', value: tab.value === 'teacher' ? uniqueClasses.value : (s.subjects || 0), icon: 'mdi-book-open-page-variant', color: 'success' },
    { label: tab.value === 'room' ? 'Teachers' : 'Locked / Substitutions', value: tab.value === 'room' ? (s.teachers || 0) : `${s.locked_periods || 0} / ${s.substitution_periods || 0}`, icon: 'mdi-shield-check-outline', color: 'warning' },
  ]
})

const uniqueClasses = computed(() => new Set((report.value?.rows || []).map(x => x.class_name).filter(Boolean)).size)
const periods = computed(() => {
  const map = new Map()
  for (const row of report.value?.rows || []) {
    const key = `${row.period_number ?? row.period_title}-${row.time}`
    if (!map.has(key)) map.set(key, { key, number: row.period_number ?? 999, title: row.period_title || `Period ${row.period_number || ''}`, time: row.time || '' })
  }
  return [...map.values()].sort((a, b) => Number(a.number) - Number(b.number))
})
const filteredTeachers = computed(() => {
  const needle = workloadSearch.value.toLowerCase().trim()
  return (workload.value.teachers || []).filter(x => !needle || String(x.teacher_name || '').toLowerCase().includes(needle))
})
const averageLoad = computed(() => workload.value.teacher_count ? (workload.value.total_periods / workload.value.teacher_count).toFixed(1) : 0)
const maxLoad = computed(() => Math.max(1, ...(workload.value.teachers || []).map(x => Number(x.weekly_periods || 0))))
const teacherConflictCount = computed(() => (conflictReport.value.conflicts || []).filter(x => x.type === 'teacher_double_booking').length)
const roomConflictCount = computed(() => (conflictReport.value.conflicts || []).filter(x => x.type === 'room_double_booking').length)

watch(tab, async () => {
  selectedId.value = null
  report.value = null
  error.value = ''
  if (tab.value === 'workload' || tab.value === 'conflicts') await refreshCurrent()
})

const extractList = (response) => {
  const payload = response?.data
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.data?.data)) return payload.data.data
  return []
}

const fetchMasters = async () => {
  mastersLoading.value = true
  const results = await Promise.allSettled([
    api.get('/academic-years'),
    api.get('/teachers', { params: { per_page: 999 } }),
    timetableApi.rooms.list({ per_page: 100 }),
    timetableApi.weeklyTimetables({ per_page: 100 }),
  ])
  academicYears.value = results[0].status === 'fulfilled' ? extractList(results[0].value) : []
  teachers.value = results[1].status === 'fulfilled' ? extractList(results[1].value) : []
  rooms.value = results[2].status === 'fulfilled' ? (results[2].value?.data || results[2].value || []) : []
  timetables.value = results[3].status === 'fulfilled' ? (results[3].value?.data || results[3].value || []) : []
  academicYearId.value = academicYears.value.find(x => x.is_active)?.id || academicYears.value[0]?.id || null
  mastersLoading.value = false
}

const loadSelectedReport = async () => {
  if (!selectedId.value || !['class', 'teacher', 'room'].includes(tab.value)) {
    report.value = null
    return
  }
  loading.value = true
  error.value = ''
  try {
    const params = academicYearId.value ? { academic_year_id: academicYearId.value } : {}
    report.value = tab.value === 'class'
      ? await timetableApi.classReport(selectedId.value)
      : tab.value === 'teacher'
        ? await timetableApi.teacherReport(selectedId.value, params)
        : await timetableApi.roomReport(selectedId.value, params)
  } catch (e) {
    report.value = null
    error.value = e.response?.data?.message || `Unable to load ${tab.value} report.`
  } finally {
    loading.value = false
  }
}

const refreshCurrent = async () => {
  if (['class', 'teacher', 'room'].includes(tab.value)) return loadSelectedReport()
  loading.value = true
  error.value = ''
  try {
    const params = academicYearId.value ? { academic_year_id: academicYearId.value } : {}
    if (tab.value === 'workload') workload.value = await timetableApi.workload(params) || {}
    else conflictReport.value = await timetableApi.conflicts(params) || {}
  } catch (e) {
    error.value = e.response?.data?.message || 'Unable to load timetable analytics.'
  } finally {
    loading.value = false
  }
}

const onFilterChange = () => refreshCurrent()
const timetableTitle = (item) => `${item.name || `Timetable #${item.id}`} · ${item.grade?.name || ''} ${item.section?.name || ''}`.trim()
const roomTitle = (item) => item.code ? `${item.name} (${item.code})` : item.name
const titleCase = (value) => String(value || '').replaceAll('_', ' ').replace(/\b\w/g, c => c.toUpperCase())
const dayName = (value) => days.find(x => x.value === Number(value))?.title || `Day ${value}`
const slotRows = (weekday, period) => (report.value?.rows || []).filter(x => Number(x.weekday) === weekday && `${x.period_number ?? x.period_title}-${x.time}` === period.key)
const primaryText = (row) => tab.value === 'class' ? (row.subject || 'Unassigned') : (row.class_name || row.subject || 'Unassigned')
const secondaryText = (row) => tab.value === 'teacher' ? row.subject : tab.value === 'room' ? `${row.subject || ''} · ${row.teacher || ''}` : row.teacher
const loadPercent = (value) => Math.min(100, (Number(value || 0) / maxLoad.value) * 100)
const loadColor = (value) => Number(value) >= 35 ? 'error' : Number(value) >= 28 ? 'warning' : 'success'

const download = async (format) => {
  if (!selectedId.value) return
  exporting.value = format
  try {
    const type = tab.value === 'class' ? 'classes' : `${tab.value}s`
    const params = tab.value === 'class' || !academicYearId.value ? {} : { academic_year_id: academicYearId.value }
    const response = await timetableApi.downloadReport(type, selectedId.value, format, params)
    const disposition = response.headers?.['content-disposition'] || ''
    const match = disposition.match(/filename\*?=(?:UTF-8''|\")?([^\";]+)/i)
    const filename = match ? decodeURIComponent(match[1].replace(/\"/g, '')) : `timetable-${tab.value}.${format === 'excel' ? 'xlsx' : 'pdf'}`
    const url = URL.createObjectURL(new Blob([response.data], { type: response.headers?.['content-type'] }))
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
    ui.showSnackbar(`${format === 'excel' ? 'Excel' : 'PDF'} report downloaded.`)
  } catch (e) {
    ui.showSnackbar(e.response?.data?.message || 'Unable to download report.', 'error')
  } finally {
    exporting.value = null
  }
}

onMounted(async () => {
  await fetchMasters()
  await refreshCurrent()
})
</script>

<style scoped>
.hero-card { background: linear-gradient(135deg, rgba(var(--v-theme-primary), .12), rgba(var(--v-theme-secondary), .06)); border: 1px solid rgba(var(--v-theme-primary), .14); }
.filter-card { position: sticky; top: 88px; }
.report-grid-wrap { overflow: auto; max-height: 680px; }
.report-grid { width: 100%; min-width: 980px; border-collapse: separate; border-spacing: 0; }
.report-grid th, .report-grid td { border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)); border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)); padding: 10px; vertical-align: top; min-width: 145px; }
.report-grid thead th { position: sticky; top: 0; z-index: 3; background: rgb(var(--v-theme-surface)); }
.period-col { position: sticky; left: 0; z-index: 2; min-width: 125px !important; background: rgb(var(--v-theme-surface)); }
.report-grid thead .period-col { z-index: 4; }
.period-col small { color: rgba(var(--v-theme-on-surface), .6); font-weight: 400; }
.entry-card { padding: 9px; border-radius: 10px; background: rgba(var(--v-theme-primary), .08); border-left: 3px solid rgb(var(--v-theme-primary)); margin-bottom: 6px; }
.entry-card.substitution { background: rgba(var(--v-theme-warning), .10); border-left-color: rgb(var(--v-theme-warning)); }
.entry-card.locked { box-shadow: inset 0 0 0 1px rgba(var(--v-theme-primary), .28); }
.empty-slot { color: rgba(var(--v-theme-on-surface), .28); text-align: center; padding: 14px; }
.workload-row { padding: 16px; border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)); border-radius: 14px; }
.metric-card { border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)); }
@media (max-width: 1279px) { .filter-card { position: static; } }
</style>
