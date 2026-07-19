<template>
  <div class="batch-page">
    <v-card class="hero-card mb-6" rounded="xl" elevation="0">
      <v-card-text class="pa-6 pa-md-8">
        <div class="d-flex flex-wrap align-center justify-space-between ga-4">
          <div class="d-flex align-center ga-3">
            <v-avatar color="primary" variant="tonal" size="50">
              <v-icon size="28">mdi-calendar-multiple-check</v-icon>
            </v-avatar>
            <div>
              <h1 class="text-h4 font-weight-bold">Batch Timetable Generator</h1>
              <p class="text-body-2 text-medium-emphasis mb-0">
                Queue multiple classes, monitor progress live and resolve generation conflicts from one workspace.
              </p>
            </div>
          </div>
          <div class="d-flex flex-wrap ga-2">
            <v-btn variant="tonal" prepend-icon="mdi-history" @click="scrollToHistory">Generation History</v-btn>
            <v-btn color="primary" prepend-icon="mdi-playlist-plus" @click="addClass">Add Class</v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <v-row>
      <v-col cols="12" xl="5">
        <v-card rounded="xl" elevation="0" border>
          <v-card-title class="d-flex align-center justify-space-between pa-5">
            <div>
              <div class="font-weight-bold">Batch Setup</div>
              <div class="text-caption text-medium-emphasis">Select shared settings and add up to 50 classes.</div>
            </div>
            <v-chip color="primary" variant="tonal">{{ form.classes.length }}/50 classes</v-chip>
          </v-card-title>
          <v-divider />
          <v-card-text class="pa-5">
            <v-alert v-if="loadError" type="warning" variant="tonal" class="mb-4" closable>
              {{ loadError }}
            </v-alert>

            <v-row>
              <v-col cols="12" md="6">
                <v-select v-model="form.academic_year_id" :items="academicYears" item-title="name" item-value="id"
                  label="Academic Year" variant="outlined" density="comfortable" :rules="requiredRules" />
              </v-col>
              <v-col cols="12" md="6">
                <v-select v-model="form.timetable_template_id" :items="templates" item-title="name" item-value="id"
                  label="Timetable Template" variant="outlined" density="comfortable" :rules="requiredRules" />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field v-model="form.effective_from" type="date" label="Effective From" variant="outlined" density="comfortable" />
              </v-col>
              <v-col cols="12" sm="6">
                <v-select v-model="form.working_days" :items="workingDayOptions" label="Working Days" variant="outlined" density="comfortable" />
              </v-col>
            </v-row>

            <div class="d-flex flex-wrap ga-3 mb-4">
              <v-switch v-model="form.atomic" color="primary" inset hide-details label="Atomic batch" />
              <v-switch v-model="form.continue_on_error" color="warning" inset hide-details label="Continue on error" />
              <v-switch v-model="form.allow_partial" color="info" inset hide-details label="Allow partial" />
            </div>

            <v-alert type="info" variant="tonal" density="compact" class="mb-4">
              <strong>Atomic batch</strong> rolls back all generated classes when one class fails. Disable it to keep successful classes.
            </v-alert>

            <div class="d-flex align-center justify-space-between mb-3">
              <div class="text-subtitle-1 font-weight-bold">Classes</div>
              <v-btn size="small" variant="tonal" prepend-icon="mdi-plus" :disabled="form.classes.length >= 50" @click="addClass">
                Add Class
              </v-btn>
            </div>

            <div v-if="!form.classes.length" class="empty-state pa-8 text-center rounded-xl">
              <v-icon size="52" color="medium-emphasis">mdi-google-classroom</v-icon>
              <div class="text-h6 mt-3">No classes added</div>
              <div class="text-body-2 text-medium-emphasis mb-4">Add the classes you want to generate together.</div>
              <v-btn color="primary" prepend-icon="mdi-plus" @click="addClass">Add First Class</v-btn>
            </div>

            <v-expansion-panels v-else variant="accordion" class="class-panels">
              <v-expansion-panel v-for="(item, index) in form.classes" :key="item.uid">
                <v-expansion-panel-title>
                  <div class="d-flex align-center justify-space-between w-100 pe-3 ga-3">
                    <div class="d-flex align-center ga-3 overflow-hidden">
                      <v-avatar size="34" color="primary" variant="tonal">{{ index + 1 }}</v-avatar>
                      <div class="overflow-hidden">
                        <div class="font-weight-bold text-truncate">{{ classLabel(item) }}</div>
                        <div class="text-caption text-medium-emphasis">{{ item.name || 'Automatic timetable name' }}</div>
                      </div>
                    </div>
                    <v-btn icon="mdi-delete-outline" size="small" variant="text" color="error" @click.stop="removeClass(index)" />
                  </div>
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <v-row>
                    <v-col cols="12" sm="6">
                      <v-select v-model="item.grade_id" :items="grades" item-title="name" item-value="id" label="Grade"
                        variant="outlined" density="comfortable" :rules="requiredRules" @update:model-value="onGradeChange(item)" />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-select v-model="item.section_id" :items="item.sections" item-title="display_name" item-value="id"
                        label="Section" variant="outlined" density="comfortable" clearable :loading="item.loadingSections" />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-select v-model="item.stream_id" :items="streams" item-title="name" item-value="id" label="Stream"
                        variant="outlined" density="comfortable" clearable />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-text-field v-model.trim="item.name" label="Timetable Name (optional)" variant="outlined" density="comfortable" counter="150" />
                    </v-col>
                  </v-row>
                  <v-alert v-if="duplicateClassIndexes.has(index)" type="error" variant="tonal" density="compact">
                    This grade, section and stream combination is already included.
                  </v-alert>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-card-text>
          <v-divider />
          <v-card-actions class="pa-5 flex-wrap ga-2">
            <v-btn variant="tonal" prepend-icon="mdi-eye-outline" :loading="queueingPreview" :disabled="!canSubmit" @click="queueBatch(true)">
              Queue Preview
            </v-btn>
            <v-spacer />
            <v-btn color="primary" size="large" prepend-icon="mdi-calendar-sync" :loading="queueingGeneration" :disabled="!canSubmit" @click="queueBatch(false)">
              Queue Generation
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12" xl="7">
        <v-row>
          <v-col v-for="card in summaryCards" :key="card.label" cols="6" lg="3">
            <v-card rounded="xl" elevation="0" border class="h-100">
              <v-card-text class="d-flex align-center ga-3">
                <v-avatar :color="card.color" variant="tonal"><v-icon>{{ card.icon }}</v-icon></v-avatar>
                <div><div class="text-h5 font-weight-bold">{{ card.value }}</div><div class="text-caption text-medium-emphasis">{{ card.label }}</div></div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-card v-if="activeRuns.length" rounded="xl" elevation="0" border class="mt-4">
          <v-card-title class="d-flex align-center justify-space-between pa-5">
            <span>Live Queue</span>
            <v-chip color="warning" variant="tonal" size="small">Auto-refreshing</v-chip>
          </v-card-title>
          <v-divider />
          <v-list lines="three">
            <template v-for="(run, index) in activeRuns" :key="run.id">
              <v-list-item class="py-3">
                <template #prepend>
                  <v-avatar :color="statusColor(run.status)" variant="tonal"><v-icon>mdi-calendar-sync</v-icon></v-avatar>
                </template>
                <v-list-item-title class="d-flex align-center flex-wrap ga-2">
                  Run #{{ run.id }}
                  <v-chip size="x-small" :color="statusColor(run.status)" variant="tonal">{{ run.status }}</v-chip>
                  <v-chip size="x-small" variant="outlined">{{ run.is_preview ? 'Preview' : 'Final' }}</v-chip>
                </v-list-item-title>
                <v-progress-linear :model-value="run.progress_percentage || 0" :color="statusColor(run.status)" height="8" rounded class="mt-3" />
                <div class="d-flex justify-space-between text-caption text-medium-emphasis mt-1">
                  <span>{{ run.processed_items || 0 }}/{{ run.requested_items || 0 }} processed</span>
                  <span>{{ run.progress_percentage || 0 }}%</span>
                </div>
                <template #append>
                  <v-btn icon="mdi-stop-circle-outline" variant="text" color="error" :loading="busyRunId === run.id" @click="cancelRun(run)" />
                </template>
              </v-list-item>
              <v-divider v-if="index < activeRuns.length - 1" />
            </template>
          </v-list>
        </v-card>

        <v-card ref="historyCard" rounded="xl" elevation="0" border class="mt-4">
          <v-card-title class="d-flex flex-wrap align-center justify-space-between ga-3 pa-5">
            <div><div class="font-weight-bold">Generation History</div><div class="text-caption text-medium-emphasis">Review outcomes, retries and class-level conflicts.</div></div>
            <div class="d-flex flex-wrap ga-2">
              <v-select v-model="filters.status" :items="statusOptions" label="Status" variant="outlined" density="compact" hide-details clearable style="min-width:150px" />
              <v-select v-model="filters.mode" :items="modeOptions" label="Mode" variant="outlined" density="compact" hide-details clearable style="min-width:130px" />
              <v-btn icon="mdi-refresh" variant="tonal" :loading="loadingRuns" @click="loadRuns" />
            </div>
          </v-card-title>
          <v-divider />
          <v-skeleton-loader v-if="loadingRuns" type="table-heading, table-row@6" />
          <v-data-table v-else :headers="headers" :items="runs" :items-per-page="10" hover>
            <template #item.id="{ item }"><div class="font-weight-bold">#{{ item.id }}</div><div class="text-caption text-medium-emphasis">{{ formatDate(item.created_at) }}</div></template>
            <template #item.mode="{ item }"><v-chip size="small" variant="tonal" color="primary">{{ item.mode }}</v-chip></template>
            <template #item.status="{ item }"><v-chip size="small" :color="statusColor(item.status)" variant="tonal">{{ item.status }}</v-chip></template>
            <template #item.progress="{ item }"><div style="min-width:130px"><v-progress-linear :model-value="item.progress_percentage || 0" :color="statusColor(item.status)" height="6" rounded /><div class="text-caption mt-1">{{ item.processed_items || 0 }}/{{ item.requested_items || 0 }}</div></div></template>
            <template #item.conflicts_count="{ item }"><v-chip size="small" :color="item.conflicts_count ? 'error' : 'success'" variant="tonal">{{ item.conflicts_count || 0 }}</v-chip></template>
            <template #item.actions="{ item }">
              <div class="d-flex justify-end ga-1">
                <v-tooltip text="View details"><template #activator="{ props }"><v-btn v-bind="props" icon="mdi-eye-outline" size="small" variant="text" @click="openDetails(item)" /></template></v-tooltip>
                <v-tooltip text="View conflicts"><template #activator="{ props }"><v-btn v-bind="props" icon="mdi-alert-circle-outline" size="small" variant="text" color="warning" :disabled="!item.conflicts_count" @click="openConflicts(item)" /></template></v-tooltip>
                <v-tooltip v-if="['failed','partial','cancelled'].includes(item.status)" text="Retry"><template #activator="{ props }"><v-btn v-bind="props" icon="mdi-replay" size="small" variant="text" color="primary" :loading="busyRunId === item.id" @click="retryRun(item)" /></template></v-tooltip>
                <v-tooltip v-if="['queued','running'].includes(item.status)" text="Cancel"><template #activator="{ props }"><v-btn v-bind="props" icon="mdi-stop-circle-outline" size="small" variant="text" color="error" :loading="busyRunId === item.id" @click="cancelRun(item)" /></template></v-tooltip>
              </div>
            </template>
            <template #no-data><div class="text-center py-12"><v-icon size="54" color="medium-emphasis">mdi-history</v-icon><div class="text-h6 mt-3">No generation runs found</div><div class="text-body-2 text-medium-emphasis">Queue a batch to start tracking generation activity.</div></div></template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <v-navigation-drawer v-model="detailDrawer" location="right" temporary width="520">
      <div class="pa-5 d-flex align-center justify-space-between"><div><div class="text-h6 font-weight-bold">Run #{{ selectedRun?.id }}</div><div class="text-caption text-medium-emphasis">Generation details and diagnostics</div></div><v-btn icon="mdi-close" variant="text" @click="detailDrawer = false" /></div>
      <v-divider />
      <v-skeleton-loader v-if="loadingDetail" type="article, list-item@4" />
      <div v-else-if="runDetail" class="pa-5">
        <v-row dense class="mb-4">
          <v-col v-for="metric in detailMetrics" :key="metric.label" cols="6"><v-card rounded="lg" variant="tonal"><v-card-text><div class="text-caption text-medium-emphasis">{{ metric.label }}</div><div class="text-h6 font-weight-bold">{{ metric.value }}</div></v-card-text></v-card></v-col>
        </v-row>
        <v-list density="comfortable" rounded="lg" border>
          <v-list-item title="Mode" :subtitle="runDetail.mode" prepend-icon="mdi-shape-outline" />
          <v-list-item title="Type" :subtitle="runDetail.is_preview ? 'Preview' : 'Final generation'" prepend-icon="mdi-eye-outline" />
          <v-list-item title="Started" :subtitle="formatDate(runDetail.started_at)" prepend-icon="mdi-clock-start" />
          <v-list-item title="Completed" :subtitle="formatDate(runDetail.completed_at)" prepend-icon="mdi-clock-check-outline" />
          <v-list-item v-if="runDetail.error_message" title="Error" :subtitle="runDetail.error_message" prepend-icon="mdi-alert-circle" class="text-error" />
        </v-list>
        <v-btn v-if="runDetail.conflicts_count" block color="warning" variant="tonal" prepend-icon="mdi-alert-circle-outline" class="mt-4" @click="openConflicts(runDetail)">View {{ runDetail.conflicts_count }} Conflicts</v-btn>
      </div>
    </v-navigation-drawer>

    <v-dialog v-model="conflictDialog" max-width="900">
      <v-card rounded="xl">
        <v-card-title class="d-flex align-center justify-space-between pa-5"><div><div>Conflicts for Run #{{ selectedRun?.id }}</div><div class="text-caption text-medium-emphasis font-weight-regular">Warnings and failures reported during generation.</div></div><v-btn icon="mdi-close" variant="text" @click="conflictDialog = false" /></v-card-title>
        <v-divider />
        <v-card-text class="pa-5">
          <v-skeleton-loader v-if="loadingConflicts" type="list-item-three-line@5" />
          <v-list v-else-if="conflicts.length" lines="three">
            <template v-for="(conflict, index) in conflicts" :key="conflict.id">
              <v-list-item>
                <template #prepend><v-avatar :color="conflict.severity === 'error' ? 'error' : 'warning'" variant="tonal"><v-icon>{{ conflict.severity === 'error' ? 'mdi-alert-octagon' : 'mdi-alert' }}</v-icon></v-avatar></template>
                <v-list-item-title>{{ conflict.message }}</v-list-item-title>
                <v-list-item-subtitle>{{ titleCase(conflict.conflict_type) }}<span v-if="conflict.item_index !== null"> · Class item {{ Number(conflict.item_index) + 1 }}</span></v-list-item-subtitle>
              </v-list-item><v-divider v-if="index < conflicts.length - 1" />
            </template>
          </v-list>
          <div v-else class="text-center py-10 text-medium-emphasis"><v-icon size="52" color="success">mdi-check-circle-outline</v-icon><div class="text-h6 mt-3">No conflicts recorded</div></div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import api from '../../../plugins/api'
import timetableApi from '../../../services/timetableApi'
import { useUIStore } from '../../../stores/snackBar'

const ui = useUIStore()
const academicYears = ref([]), grades = ref([]), streams = ref([]), templates = ref([]), runs = ref([]), conflicts = ref([])
const loadingMasters = ref(false), loadingRuns = ref(false), queueingPreview = ref(false), queueingGeneration = ref(false), loadingDetail = ref(false), loadingConflicts = ref(false)
const loadError = ref(''), busyRunId = ref(null), detailDrawer = ref(false), conflictDialog = ref(false), selectedRun = ref(null), runDetail = ref(null), historyCard = ref(null)
const filters = reactive({ status: null, mode: 'batch' })
const today = new Date().toISOString().slice(0, 10)
const form = reactive({ academic_year_id: null, timetable_template_id: null, effective_from: today, working_days: 6, allow_partial: true, atomic: false, continue_on_error: true, classes: [] })
const workingDayOptions = [1,2,3,4,5,6,7].map(value => ({ title: `${value} day${value === 1 ? '' : 's'}`, value }))
const statusOptions = ['queued','running','completed','partial','failed','cancelled'].map(value => ({ title: titleCase(value), value }))
const modeOptions = [{ title: 'Batch', value: 'batch' }, { title: 'Single', value: 'single' }]
const requiredRules = [(value) => value !== null && value !== '' && value !== undefined || 'Required']
const headers = [
  { title: 'Run', key: 'id' }, { title: 'Mode', key: 'mode' }, { title: 'Status', key: 'status' },
  { title: 'Progress', key: 'progress', sortable: false }, { title: 'Conflicts', key: 'conflicts_count' },
  { title: '', key: 'actions', align: 'end', sortable: false },
]
let pollTimer = null

function titleCase(value) { return String(value || '').replaceAll('_', ' ').replace(/\b\w/g, c => c.toUpperCase()) }
const extractList = (response) => {
  const payload = response?.data
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.data?.data)) return payload.data.data
  return []
}
const newClass = () => ({ uid: `${Date.now()}-${Math.random()}`, grade_id: null, section_id: null, stream_id: null, name: '', sections: [], loadingSections: false })
const addClass = () => { if (form.classes.length < 50) form.classes.push(newClass()) }
const removeClass = (index) => form.classes.splice(index, 1)
const gradeName = (id) => grades.value.find(x => Number(x.id) === Number(id))?.name
const streamName = (id) => streams.value.find(x => Number(x.id) === Number(id))?.name
const classLabel = (item) => [gradeName(item.grade_id), item.sections.find(x => Number(x.id) === Number(item.section_id))?.display_name, streamName(item.stream_id)].filter(Boolean).join(' · ') || 'Select class'
const classKey = (item) => [item.grade_id || '', item.section_id || '', item.stream_id || ''].join(':')
const duplicateClassIndexes = computed(() => {
  const indexes = new Set(), seen = new Map()
  form.classes.forEach((item, index) => { if (!item.grade_id) return; const key = classKey(item); if (seen.has(key)) { indexes.add(seen.get(key)); indexes.add(index) } else seen.set(key, index) })
  return indexes
})
const canSubmit = computed(() => Boolean(form.academic_year_id && form.timetable_template_id && form.classes.length && form.classes.every(x => x.grade_id) && !duplicateClassIndexes.value.size && !queueingPreview.value && !queueingGeneration.value))
const activeRuns = computed(() => runs.value.filter(x => ['queued','running'].includes(x.status)))
const summaryCards = computed(() => [
  { label: 'Selected Classes', value: form.classes.length, icon: 'mdi-google-classroom', color: 'primary' },
  { label: 'Queued / Running', value: activeRuns.value.length, icon: 'mdi-progress-clock', color: activeRuns.value.length ? 'warning' : 'success' },
  { label: 'Completed', value: runs.value.filter(x => x.status === 'completed').length, icon: 'mdi-check-circle-outline', color: 'success' },
  { label: 'Needs Attention', value: runs.value.filter(x => ['partial','failed'].includes(x.status)).length, icon: 'mdi-alert-circle-outline', color: 'error' },
])
const detailMetrics = computed(() => runDetail.value ? [
  { label: 'Progress', value: `${runDetail.value.progress_percentage || 0}%` },
  { label: 'Requested', value: runDetail.value.requested_items || 0 },
  { label: 'Successful', value: runDetail.value.successful_items || 0 },
  { label: 'Failed', value: runDetail.value.failed_items || 0 },
] : [])
const statusColor = (status) => ({ queued: 'warning', running: 'info', completed: 'success', partial: 'warning', failed: 'error', cancelled: 'grey' }[status] || 'primary')
const formatDate = (value) => value ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—'

const loadMasters = async () => {
  loadingMasters.value = true; loadError.value = ''
  const results = await Promise.allSettled([
    api.get('/academic-years'), api.get('/grades'), api.get('/streams'), timetableApi.templates.list({ is_active: true, per_page: 100 }),
  ])
  academicYears.value = results[0].status === 'fulfilled' ? extractList(results[0].value) : []
  grades.value = results[1].status === 'fulfilled' ? extractList(results[1].value) : []
  streams.value = results[2].status === 'fulfilled' ? extractList(results[2].value) : []
  const templatePayload = results[3].status === 'fulfilled' ? results[3].value : []
  templates.value = templatePayload?.data || templatePayload || []
  const failures = results.filter(x => x.status === 'rejected').length
  if (failures) loadError.value = `${failures} setup source${failures === 1 ? '' : 's'} could not be loaded.`
  form.academic_year_id = academicYears.value.find(x => x.is_active)?.id || academicYears.value[0]?.id || null
  form.timetable_template_id = templates.value.find(x => x.is_default)?.id || templates.value[0]?.id || null
  loadingMasters.value = false
}
const onGradeChange = async (item) => {
  item.section_id = null; item.sections = []
  if (!item.grade_id) return
  item.loadingSections = true
  try { item.sections = extractList(await api.get('/sections', { params: { grade_id: item.grade_id } })) }
  catch (error) { ui.showSnackbar(error.response?.data?.message || 'Unable to load sections.', 'error') }
  finally { item.loadingSections = false }
}
const payload = () => ({
  academic_year_id: form.academic_year_id, timetable_template_id: form.timetable_template_id,
  effective_from: form.effective_from || undefined, working_days: Number(form.working_days || 6),
  allow_partial: Boolean(form.allow_partial), atomic: Boolean(form.atomic), continue_on_error: Boolean(form.continue_on_error),
  classes: form.classes.map(({ grade_id, section_id, stream_id, name }) => ({ grade_id, section_id: section_id || null, stream_id: stream_id || null, name: name || undefined })),
})
const queueBatch = async (preview) => {
  if (!canSubmit.value) return
  preview ? queueingPreview.value = true : queueingGeneration.value = true
  try {
    const result = preview ? await timetableApi.batchPreview(payload(), true) : await timetableApi.batchGenerate(payload(), true)
    ui.showSnackbar(`${preview ? 'Preview' : 'Generation'} queued as run #${result.generation_run_id}.`)
    await loadRuns()
  } catch (error) { ui.showSnackbar(error.response?.data?.message || 'Unable to queue batch generation.', 'error') }
  finally { preview ? queueingPreview.value = false : queueingGeneration.value = false }
}
const loadRuns = async () => {
  loadingRuns.value = true
  try { const data = await timetableApi.generationRuns({ mode: filters.mode || undefined, status: filters.status || undefined, per_page: 100 }); runs.value = data?.data || data || [] }
  catch (error) { ui.showSnackbar(error.response?.data?.message || 'Unable to load generation history.', 'error') }
  finally { loadingRuns.value = false }
}
const cancelRun = async (run) => { busyRunId.value = run.id; try { await timetableApi.cancelRun(run.id); ui.showSnackbar('Cancellation requested.'); await loadRuns() } catch (e) { ui.showSnackbar(e.response?.data?.message || 'Unable to cancel run.', 'error') } finally { busyRunId.value = null } }
const retryRun = async (run) => { busyRunId.value = run.id; try { const result = await timetableApi.retryRun(run.id, true); ui.showSnackbar(`Retry queued as run #${result.generation_run_id}.`); await loadRuns() } catch (e) { ui.showSnackbar(e.response?.data?.message || 'Unable to retry run.', 'error') } finally { busyRunId.value = null } }
const openDetails = async (run) => { selectedRun.value = run; detailDrawer.value = true; loadingDetail.value = true; try { runDetail.value = await timetableApi.generationRun(run.id) } catch (e) { ui.showSnackbar('Unable to load run details.', 'error') } finally { loadingDetail.value = false } }
const openConflicts = async (run) => { selectedRun.value = run; conflictDialog.value = true; loadingConflicts.value = true; try { const data = await timetableApi.generationRunConflicts(run.id, { per_page: 200 }); conflicts.value = data?.data || data || [] } catch (e) { ui.showSnackbar('Unable to load conflicts.', 'error') } finally { loadingConflicts.value = false } }
const scrollToHistory = async () => { await nextTick(); historyCard.value?.$el?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }
watch(() => [filters.status, filters.mode], loadRuns)

onMounted(async () => { addClass(); await Promise.all([loadMasters(), loadRuns()]); pollTimer = window.setInterval(() => { if (activeRuns.value.length) loadRuns() }, 5000) })
onBeforeUnmount(() => { if (pollTimer) window.clearInterval(pollTimer) })
</script>

<style scoped>
.hero-card { background: linear-gradient(135deg, rgba(var(--v-theme-primary), .16), rgba(var(--v-theme-secondary), .08)); border: 1px solid rgba(var(--v-theme-primary), .16); }
.empty-state { border: 1px dashed rgba(var(--v-theme-on-surface), .22); background: rgba(var(--v-theme-on-surface), .025); }
.class-panels :deep(.v-expansion-panel) { border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)); margin-bottom: 10px; border-radius: 14px !important; overflow: hidden; }
:deep(th) { white-space: nowrap; }
</style>
