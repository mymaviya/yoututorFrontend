<template>
  <div class="generator-page">
    <v-card class="hero-card mb-6" rounded="xl" elevation="0">
      <v-card-text class="pa-6 pa-md-8">
        <div class="d-flex flex-wrap align-center justify-space-between ga-4">
          <div class="d-flex align-center ga-3">
            <v-avatar color="primary" variant="tonal" size="52"><v-icon size="28">mdi-calendar-cog</v-icon></v-avatar>
            <div>
              <h1 class="text-h4 font-weight-bold">Smart Timetable Generator</h1>
              <p class="text-body-2 text-medium-emphasis mb-0">Configure one class, preview the schedule, optimize difficult slots and generate a production-ready draft.</p>
            </div>
          </div>
          <div class="d-flex flex-wrap ga-2">
            <v-chip color="primary" variant="tonal" prepend-icon="mdi-calendar-range">{{ selectedAcademicYear?.name || 'No session selected' }}</v-chip>
            <v-chip color="success" variant="tonal" prepend-icon="mdi-shield-check">Conflict aware</v-chip>
            <v-chip color="deep-purple" variant="tonal" prepend-icon="mdi-auto-fix">Optimized</v-chip>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <v-alert v-if="!selectedAcademicYearId" type="warning" variant="tonal" class="mb-5">
      Select an academic session from the app bar before creating a timetable preview.
    </v-alert>

    <v-alert v-if="message" :type="messageType" variant="tonal" closable class="mb-5" @click:close="message = ''">
      {{ message }}
    </v-alert>

    <v-row>
      <v-col cols="12" lg="4">
        <v-card rounded="xl" elevation="0" border class="sticky-panel">
          <v-card-title class="pa-5 d-flex align-center justify-space-between">
            <div>
              <div class="font-weight-bold">Generation Setup</div>
              <div class="text-caption text-medium-emphasis">Complete the context before previewing.</div>
            </div>
            <v-progress-circular :model-value="setupProgress" size="46" width="5" color="primary">
              <span class="text-caption">{{ setupProgress }}%</span>
            </v-progress-circular>
          </v-card-title>
          <v-divider />
          <v-card-text class="pa-5">
            <v-form ref="formRef">
              <div class="section-label">1. Academic context</div>
              <v-text-field
                :model-value="selectedAcademicYear?.name || ''"
                label="Academic session"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-calendar-range"
                readonly
                :error="!selectedAcademicYearId"
                :hint="selectedAcademicYearId ? 'Controlled from the app bar' : 'Select a session from the app bar'"
                persistent-hint
              />
              <v-select v-model="form.grade_id" :items="grades" item-title="name" item-value="id" label="Grade" variant="outlined" density="comfortable" :rules="requiredRules" :disabled="!selectedAcademicYearId" @update:model-value="onGradeChange" />
              <v-row>
                <v-col cols="12" sm="6"><v-select v-model="form.section_id" :items="sections" item-title="display_name" item-value="id" label="Section" variant="outlined" density="comfortable" clearable :disabled="!form.grade_id || !selectedAcademicYearId" /></v-col>
                <v-col cols="12" sm="6"><v-select v-model="form.stream_id" :items="streams" item-title="name" item-value="id" label="Stream" variant="outlined" density="comfortable" clearable :disabled="!selectedAcademicYearId" /></v-col>
              </v-row>

              <div class="section-label mt-2">2. Timetable structure</div>
              <v-select v-model="form.timetable_template_id" :items="templates" item-title="name" item-value="id" label="Active template" variant="outlined" density="comfortable" :rules="requiredRules" :disabled="!selectedAcademicYearId">
                <template #item="{ props, item }"><v-list-item v-bind="props" :subtitle="`${titleCase(item.raw.type)}${item.raw.is_default ? ' · Default' : ''}`" /></template>
              </v-select>
              <v-text-field v-model.trim="form.name" label="Timetable name" variant="outlined" density="comfortable" placeholder="Example: Grade 8-A Regular Timetable" counter="150" :disabled="!selectedAcademicYearId" />
              <v-row>
                <v-col cols="12" sm="6"><v-select v-model.number="form.working_days" :items="workingDayOptions" label="Working days" variant="outlined" density="comfortable" :disabled="!selectedAcademicYearId" /></v-col>
                <v-col cols="12" sm="6"><v-text-field v-model="form.effective_from" type="date" label="Effective from" variant="outlined" density="comfortable" :disabled="!selectedAcademicYearId" /></v-col>
              </v-row>

              <div class="section-label mt-2">3. Generation strategy</div>
              <v-card variant="tonal" color="deep-purple" rounded="lg" class="mb-4">
                <v-card-text>
                  <div class="d-flex justify-space-between align-center mb-2"><div><div class="font-weight-bold">Optimization attempts</div><div class="text-caption">More attempts can improve difficult timetables.</div></div><v-chip color="deep-purple">{{ form.optimization_attempts }}</v-chip></div>
                  <v-slider v-model="form.optimization_attempts" :min="1" :max="10" :step="1" hide-details color="deep-purple" thumb-label :disabled="!selectedAcademicYearId" />
                </v-card-text>
              </v-card>
              <v-switch v-model="form.allow_partial" color="warning" inset label="Allow partial timetable when a complete solution is impossible" :disabled="!selectedAcademicYearId" />
            </v-form>

            <v-alert :type="readiness.type" variant="tonal" density="compact" class="mb-4">
              <strong>{{ readiness.title }}</strong><div class="text-caption mt-1">{{ readiness.text }}</div>
            </v-alert>

            <div class="d-flex ga-2">
              <v-btn block variant="tonal" color="primary" prepend-icon="mdi-eye-outline" :loading="previewing" :disabled="!canPreview || generating" @click="preview">Preview</v-btn>
              <v-btn block color="primary" prepend-icon="mdi-auto-fix" :loading="generating" :disabled="!canGenerate || previewing" @click="generate">Generate</v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="8">
        <v-row class="mb-2">
          <v-col v-for="card in resultCards" :key="card.label" cols="6" md="3">
            <v-card rounded="xl" elevation="0" border><v-card-text class="d-flex align-center ga-3"><v-avatar :color="card.color" variant="tonal"><v-icon>{{ card.icon }}</v-icon></v-avatar><div><div class="text-h5 font-weight-bold">{{ card.value }}</div><div class="text-caption text-medium-emphasis">{{ card.label }}</div></div></v-card-text></v-card>
          </v-col>
        </v-row>

        <v-card rounded="xl" elevation="0" border class="mb-5">
          <v-card-title class="pa-5 d-flex flex-wrap align-center justify-space-between ga-3">
            <div><div class="font-weight-bold">Timetable Preview</div><div class="text-caption text-medium-emphasis">Review the generated day-by-day grid before saving.</div></div>
            <div class="d-flex ga-2">
              <v-chip v-if="result?.optimized" color="deep-purple" variant="tonal" prepend-icon="mdi-auto-fix">Attempt {{ result.optimization_attempt || 1 }} · Score {{ result.optimization_score || 0 }}</v-chip>
              <v-chip v-if="result" :color="completionColor" variant="tonal">{{ result.completion_percentage || 0 }}% complete</v-chip>
            </div>
          </v-card-title>
          <v-divider />

          <div v-if="previewing" class="pa-5"><v-skeleton-loader type="table-heading, table-row@7" /></div>
          <div v-else-if="!result" class="empty-state pa-12 text-center">
            <v-avatar color="primary" variant="tonal" size="76" class="mb-4"><v-icon size="42">mdi-calendar-search</v-icon></v-avatar>
            <div class="text-h6 font-weight-bold">Your preview will appear here</div>
            <p class="text-body-2 text-medium-emphasis mt-2 mb-4">Select the academic context and template, then run a preview to inspect placement quality.</p>
            <v-btn color="primary" variant="tonal" prepend-icon="mdi-eye-outline" :disabled="!canPreview" @click="preview">Create Preview</v-btn>
          </div>
          <div v-else class="preview-scroll">
            <v-table density="comfortable" class="preview-table">
              <thead><tr><th class="period-column">Period</th><th v-for="day in visibleDays" :key="day.value">{{ day.title }}</th></tr></thead>
              <tbody>
                <tr v-for="bell in teachingBells" :key="bell.id">
                  <td class="period-cell"><div class="font-weight-bold">{{ bell.display_title || bell.title || `Period ${bell.period_number || bell.id}` }}</div><div class="text-caption text-medium-emphasis">{{ bell.display_time || timeRange(bell) }}</div></td>
                  <td v-for="day in visibleDays" :key="`${day.value}-${bell.id}`" class="slot-cell">
                    <div v-if="slotEntries(day.value, bell.id).length" class="d-flex flex-column ga-1">
                      <v-card v-for="entry in slotEntries(day.value, bell.id)" :key="entryKey(entry)" class="entry-card" rounded="lg" variant="tonal" :color="entry.is_parallel ? 'deep-purple' : 'primary'">
                        <v-card-text class="pa-2"><div class="font-weight-bold text-body-2">{{ subjectName(entry.subject_id) }}</div><div class="text-caption">{{ teacherName(entry.teacher_id) }}</div><div v-if="entry.room_no || entry.student_group_name" class="text-caption opacity-80">{{ [entry.room_no, entry.student_group_name].filter(Boolean).join(' · ') }}</div></v-card-text>
                      </v-card>
                    </div>
                    <div v-else class="empty-slot">Free</div>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </div>
        </v-card>

        <v-row>
          <v-col cols="12" md="7">
            <v-card rounded="xl" elevation="0" border class="h-100">
              <v-card-title class="pa-5">Subject Coverage</v-card-title><v-divider />
              <v-card-text v-if="subjectSummary.length" class="pa-5">
                <div v-for="subject in subjectSummary" :key="subject.subject_id" class="mb-4">
                  <div class="d-flex justify-space-between text-body-2 mb-1"><strong>{{ subject.subject_name }}</strong><span>{{ subject.scheduled }}/{{ subject.requested }}</span></div>
                  <v-progress-linear :model-value="coverage(subject)" :color="coverage(subject) === 100 ? 'success' : 'warning'" height="8" rounded />
                </div>
              </v-card-text>
              <div v-else class="pa-8 text-center text-medium-emphasis">Run a preview to see subject coverage.</div>
            </v-card>
          </v-col>
          <v-col cols="12" md="5">
            <v-card rounded="xl" elevation="0" border class="h-100">
              <v-card-title class="pa-5 d-flex align-center justify-space-between"><span>Warnings</span><v-chip :color="warnings.length ? 'warning' : 'success'" size="small" variant="tonal">{{ warnings.length }}</v-chip></v-card-title><v-divider />
              <v-list v-if="warnings.length" density="compact" lines="two"><v-list-item v-for="(warning, index) in warnings" :key="index" prepend-icon="mdi-alert-circle-outline" :title="warning" /></v-list>
              <div v-else class="pa-8 text-center"><v-icon color="success" size="38">mdi-check-decagram</v-icon><div class="font-weight-bold mt-2">No generation warnings</div><div class="text-caption text-medium-emphasis">The current preview has no reported placement warnings.</div></div>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <v-dialog v-model="successDialog" max-width="520">
      <v-card rounded="xl"><v-card-text class="pa-7 text-center"><v-avatar color="success" variant="tonal" size="76"><v-icon size="42">mdi-calendar-check</v-icon></v-avatar><div class="text-h5 font-weight-bold mt-4">Timetable generated</div><p class="text-body-2 text-medium-emphasis mt-2">The best optimized result has been saved as a draft timetable.</p><v-chip v-if="generatedId" color="success" variant="tonal">Timetable #{{ generatedId }}</v-chip></v-card-text><v-card-actions class="pa-5 pt-0"><v-btn block variant="tonal" @click="successDialog = false">Stay Here</v-btn><v-btn block color="primary" @click="goDashboard">Open Dashboard</v-btn></v-card-actions></v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../../plugins/api'
import timetableApi from '../../../services/timetableApi'
import { useAppStore } from '../../../stores/app'

const router = useRouter()
const appStore = useAppStore()
const formRef = ref(null)
const grades = ref([]), sections = ref([]), streams = ref([]), templates = ref([]), teachers = ref([]), bells = ref([])
const previewing = ref(false), generating = ref(false), result = ref(null), message = ref(''), messageType = ref('success'), successDialog = ref(false), generatedId = ref(null)
const form = reactive({ grade_id: null, section_id: null, stream_id: null, timetable_template_id: null, name: '', effective_from: new Date().toISOString().slice(0, 10), working_days: 6, allow_partial: false, optimization_attempts: 4 })
const requiredRules = [(v) => Boolean(v) || 'This field is required.']
const workingDayOptions = [5, 6, 7].map((value) => ({ title: `${value} days`, value }))
const days = [{ title: 'Monday', value: 1 }, { title: 'Tuesday', value: 2 }, { title: 'Wednesday', value: 3 }, { title: 'Thursday', value: 4 }, { title: 'Friday', value: 5 }, { title: 'Saturday', value: 6 }, { title: 'Sunday', value: 7 }]

const selectedAcademicYearId = computed(() => appStore.selectedAcademicYearId)
const selectedAcademicYear = computed(() => appStore.selectedAcademicYear)
const extractList = (response) => { const payload = response?.data; if (Array.isArray(payload)) return payload; if (Array.isArray(payload?.data)) return payload.data; if (Array.isArray(payload?.data?.data)) return payload.data.data; return [] }
const visibleDays = computed(() => days.slice(0, Number(form.working_days || 6)))
const teachingBells = computed(() => bells.value.filter((bell) => bell.is_teaching_period !== false && !bell.is_break && !bell.is_dispersal))
const subjectSummary = computed(() => result.value?.subject_summary || [])
const warnings = computed(() => result.value?.warnings || [])
const entries = computed(() => result.value?.entries || [])
const setupProgress = computed(() => Math.round(([selectedAcademicYearId.value, form.grade_id, form.timetable_template_id, form.working_days].filter(Boolean).length / 4) * 100))
const canPreview = computed(() => setupProgress.value === 100 && !previewing.value && !generating.value)
const canGenerate = computed(() => canPreview.value && Boolean(result.value))
const readiness = computed(() => !selectedAcademicYearId.value ? { type: 'warning', title: 'Select an academic session', text: 'Choose the working session from the app bar before configuring the timetable.' } : setupProgress.value < 100 ? { type: 'info', title: 'Complete the setup', text: 'Grade, template and working days are required.' } : !result.value ? { type: 'success', title: 'Ready for preview', text: 'The generator can now evaluate allocations, availability and timetable rules.' } : warnings.value.length ? { type: 'warning', title: 'Preview needs review', text: `${warnings.value.length} warning(s) were reported. You may still generate when partial scheduling is allowed.` } : { type: 'success', title: 'Ready to generate', text: 'The preview has no reported warnings and can be saved as a draft.' })
const resultCards = computed(() => [
  { label: 'Requested', value: result.value?.requested_periods || 0, icon: 'mdi-calendar-clock', color: 'primary' },
  { label: 'Scheduled', value: result.value?.scheduled_periods || 0, icon: 'mdi-calendar-check', color: 'success' },
  { label: 'Unscheduled', value: result.value?.unscheduled_periods || 0, icon: 'mdi-calendar-alert', color: result.value?.unscheduled_periods ? 'error' : 'success' },
  { label: 'Attempts', value: result.value?.optimization_attempts_executed || 0, icon: 'mdi-auto-fix', color: 'deep-purple' },
])
const completionColor = computed(() => Number(result.value?.completion_percentage || 0) === 100 ? 'success' : 'warning')

const titleCase = (value) => String(value || '').replaceAll('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())
const timeRange = (bell) => [bell.start_time?.slice(0, 5), bell.end_time?.slice(0, 5)].filter(Boolean).join(' - ') || '—'
const subjectName = (id) => subjectSummary.value.find((item) => Number(item.subject_id) === Number(id))?.subject_name || `Subject #${id}`
const teacherName = (id) => teachers.value.find((item) => Number(item.id) === Number(id))?.name || (id ? `Teacher #${id}` : 'Unassigned')
const slotEntries = (weekday, bellId) => entries.value.filter((entry) => Number(entry.weekday) === Number(weekday) && Number(entry.school_bell_id) === Number(bellId))
const entryKey = (entry) => `${entry.weekday}-${entry.school_bell_id}-${entry.subject_id}-${entry.teacher_id || 0}-${entry.parallel_group_id || 0}`
const coverage = (subject) => subject.requested ? Math.round((Number(subject.scheduled || 0) / Number(subject.requested)) * 100) : 100
const payload = () => Object.fromEntries(Object.entries({ ...form, academic_year_id: selectedAcademicYearId.value, optimization_attempts: Number(form.optimization_attempts), working_days: Number(form.working_days) }).filter(([, value]) => value !== null && value !== ''))
const notify = (text, type = 'success') => { message.value = text; messageType.value = type }

const resetSessionState = () => {
  form.grade_id = null
  form.section_id = null
  form.stream_id = null
  sections.value = []
  result.value = null
  successDialog.value = false
  generatedId.value = null
  message.value = ''
}

const loadMasters = async () => {
  const responses = await Promise.allSettled([
    api.get('/grades'), api.get('/streams'), api.get('/teachers', { params: { per_page: 999 } }), api.get('/bell-schedules/preview'), timetableApi.templates.list({ is_active: true, per_page: 100 }),
  ])
  grades.value = responses[0].status === 'fulfilled' ? extractList(responses[0].value) : []
  streams.value = responses[1].status === 'fulfilled' ? extractList(responses[1].value) : []
  teachers.value = responses[2].status === 'fulfilled' ? extractList(responses[2].value) : []
  bells.value = responses[3].status === 'fulfilled' ? (responses[3].value?.data?.data || []) : []
  const templatePayload = responses[4].status === 'fulfilled' ? responses[4].value : null
  templates.value = templatePayload?.data || templatePayload || []
  form.timetable_template_id = templates.value.find((item) => item.is_default)?.id || templates.value[0]?.id || null
  const failed = responses.filter((item) => item.status === 'rejected').length
  if (failed) notify(`${failed} setup source(s) could not be loaded.`, 'warning')
}

const onGradeChange = async () => {
  form.section_id = null; sections.value = []; result.value = null
  if (!form.grade_id) return
  try { const response = await api.get('/sections', { params: { grade_id: form.grade_id } }); sections.value = extractList(response) } catch (error) { notify(error.response?.data?.message || 'Unable to load sections.', 'error') }
}

const validate = async () => { const validation = await formRef.value?.validate(); return !validation || validation.valid }
const preview = async () => {
  if (!selectedAcademicYearId.value) return notify('Please select an academic session from the app bar.', 'warning')
  if (!(await validate())) return
  previewing.value = true; result.value = null
  try { result.value = await timetableApi.preview(payload(), true); notify('Optimized timetable preview created successfully.') } catch (error) { notify(error.response?.data?.message || 'Unable to create timetable preview.', 'error') } finally { previewing.value = false }
}
const generate = async () => {
  if (!selectedAcademicYearId.value) return notify('Please select an academic session from the app bar.', 'warning')
  if (!(await validate())) return
  generating.value = true
  try { const data = await timetableApi.generate(payload(), { optimized: true }); result.value = data; generatedId.value = data?.weekly_timetable_id || null; successDialog.value = true; notify('Timetable generated and saved as a draft.') } catch (error) { notify(error.response?.data?.message || 'Unable to generate timetable.', 'error') } finally { generating.value = false }
}
const goDashboard = () => { successDialog.value = false; router.push({ name: 'academic.planning.dashboard' }) }

watch(selectedAcademicYearId, resetSessionState)
watch(() => appStore.refreshKey, () => {
  result.value = null
  loadMasters()
})

onMounted(loadMasters)
</script>

<style scoped>
.hero-card { background: linear-gradient(135deg, rgba(var(--v-theme-primary), .12), rgba(103, 58, 183, .08)); border: 1px solid rgba(var(--v-theme-primary), .12); }
.sticky-panel { position: sticky; top: 88px; }
.section-label { font-size: .72rem; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; color: rgb(var(--v-theme-primary)); margin-bottom: 12px; }
.preview-scroll { overflow-x: auto; }
.preview-table { min-width: 980px; }
.preview-table th { white-space: nowrap; background: rgba(var(--v-theme-primary), .05); }
.period-column { min-width: 145px; }
.period-cell { min-width: 145px; vertical-align: top; }
.slot-cell { min-width: 145px; height: 94px; vertical-align: top; border-left: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)); }
.entry-card { min-width: 128px; }
.empty-slot { display: grid; place-items: center; min-height: 62px; color: rgba(var(--v-theme-on-surface), .35); font-size: .75rem; border: 1px dashed rgba(var(--v-border-color), .7); border-radius: 10px; }
.empty-state { background: radial-gradient(circle at center, rgba(var(--v-theme-primary), .06), transparent 55%); }
@media (max-width: 1279px) { .sticky-panel { position: static; } }
</style>