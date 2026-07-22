<template>
  <v-container fluid class="teacher-availability-page">
    <div class="page-header mb-5">
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">Teacher Availability</h1>
        <p class="text-body-2 text-medium-emphasis mb-0">
          All teachers are available by default. Add exceptions for leave, meetings, duties, and other unavailable periods.
        </p>
      </div>

      <v-card class="year-card" variant="outlined">
        <v-card-text class="py-2 px-4 d-flex align-center ga-2">
          <span class="text-body-2">Academic Session:</span>
          <strong>{{ academicYearLabel }}</strong>
          <v-icon size="18">mdi-calendar</v-icon>
        </v-card-text>
      </v-card>
    </div>

    <v-alert
      v-if="!selectedAcademicYearId"
      type="warning"
      variant="tonal"
      class="mb-4"
      title="Select an academic session"
    >
      Choose the active academic session from the app bar before managing teacher availability.
    </v-alert>

    <v-alert
      v-if="store.error"
      type="error"
      variant="tonal"
      closable
      class="mb-4"
      @click:close="store.error = null"
    >
      {{ store.error }}
      <template #append>
        <v-btn size="small" variant="text" :loading="store.loading" @click="loadDashboard">
          Retry
        </v-btn>
      </template>
    </v-alert>

    <StatsCards :stats="store.stats" />

    <v-card class="planner-card mt-5" rounded="xl">
      <TeacherAvailabilityToolbar
        v-model:search="search"
        v-model:status-filter="statusFilter"
        v-model:view-mode="viewMode"
        :week-label="weekLabel"
        :loading="store.loading"
        :disabled="!selectedAcademicYearId"
        @today="goToday"
        @previous="moveWeek(-1)"
        @next="moveWeek(1)"
        @add="openCreateDialog"
      />

      <v-divider />

      <v-progress-linear v-if="store.loading" indeterminate color="primary" />

      <div v-if="selectedCells.length" class="selection-summary">
        <v-icon size="18" color="primary">mdi-selection-drag</v-icon>
        <span>
          {{ selectedCells.length }} period{{ selectedCells.length === 1 ? '' : 's' }} selected
        </span>
        <v-spacer />
        <v-btn size="small" variant="text" color="primary" :disabled="isBusy || !selectedAcademicYearId" @click="openBulkDialog">
          Apply Exception
        </v-btn>
        <v-btn size="small" variant="text" :disabled="isBusy" @click="clearSelectedCells">Clear</v-btn>
      </div>

      <v-divider v-if="selectedCells.length" />

      <div v-if="!store.loading && !store.teachers.length" class="page-empty-state">
        <v-icon size="48" color="primary">mdi-account-off-outline</v-icon>
        <div class="text-h6 mt-3">No teachers available</div>
        <p class="text-body-2 text-medium-emphasis mb-4">
          Add active teachers before configuring availability exceptions.
        </p>
        <v-btn color="primary" variant="tonal" prepend-icon="mdi-refresh" :disabled="!selectedAcademicYearId" @click="loadDashboard">
          Refresh
        </v-btn>
      </div>

      <div v-else class="planner-main" :class="{ 'planner-disabled': isBusy || !selectedAcademicYearId }">
        <TeacherList v-model:selected-teacher="selectedTeacher" :teachers="filteredTeachers" :exceptions="store.exceptions" />

        <WeeklyPlanner
          :selected-teacher="selectedTeacher"
          :bells="store.bells"
          :week-days="weekDays"
          :exceptions="filteredExceptions"
          :selected-cells="selectedCells"
          @cell-click="openCellDialog"
          @exception-click="openEditDialog"
          @exception-move="moveException"
          @exception-context="openContextMenu"
          @exception-quick-edit="openEditDialog"
          @cell-selected="selectCell"
          @cell-selection-start="startCellSelection"
          @cell-selection-over="addCellSelection"
          @cell-selection-end="finishCellSelection"
        />
      </div>

      <v-alert type="info" variant="tonal" density="comfortable" class="ma-4">
        <strong>Tip:</strong> Hold Shift to select individual periods, or drag across cells to apply one exception to several periods.
      </v-alert>
    </v-card>

    <v-row class="mt-4">
      <v-col cols="12" md="6"><StatusLegend /></v-col>
      <v-col cols="12" md="6"><UpcomingLeaves :leaves="upcomingLeaves" @view-all="statusFilter = 'leave'" /></v-col>
    </v-row>

    <v-fab
      v-if="selectedCells.length"
      color="primary"
      icon="mdi-pencil-multiple"
      location="bottom end"
      app
      :disabled="isBusy || !selectedAcademicYearId"
      @click="openBulkDialog"
    />

    <v-dialog v-model="bulkDialog" max-width="760" persistent>
      <v-card rounded="xl">
        <v-card-title class="d-flex align-center justify-space-between ga-3">
          <span>Apply Exception to Selected Periods</span>
          <v-chip color="primary" variant="tonal">{{ uniqueBulkCells.length }} selected</v-chip>
        </v-card-title>
        <v-divider />

        <v-card-text>
          <v-alert v-if="bulkError" type="error" variant="tonal" class="mb-4">{{ bulkError }}</v-alert>
          <v-alert type="info" variant="tonal" class="mb-4">
            {{ bulkForm.is_full_day
              ? 'One full-day exception will be created per teacher and date.'
              : 'One exception will be created for every selected teacher-period cell.' }}
          </v-alert>

          <div class="selected-cells-preview mb-4">
            <v-chip
              v-for="cell in uniqueBulkCells"
              :key="cellKey(cell)"
              size="small"
              color="primary"
              variant="tonal"
              :closable="!bulkSaving"
              @click:close="removeSelectedCell(cell)"
            >
              {{ cell.teacher.name }} · {{ cell.day.label }} · {{ bulkForm.is_full_day ? 'Full day' : `P${cell.bell.period_number}` }}
            </v-chip>
          </div>

          <v-row>
            <v-col cols="12" md="6">
              <v-select v-model="bulkForm.status" :items="statusOptions" item-title="label" item-value="value" label="Status" variant="outlined" density="compact" :disabled="bulkSaving" />
            </v-col>
            <v-col cols="12" md="6">
              <v-checkbox v-model="bulkForm.is_full_day" label="Full day exception" density="compact" hide-details :disabled="bulkSaving" />
            </v-col>
            <v-col cols="12">
              <v-text-field v-model.trim="bulkForm.reason" label="Reason" variant="outlined" density="compact" maxlength="255" counter :disabled="bulkSaving" />
            </v-col>
            <v-col cols="12">
              <v-textarea v-model.trim="bulkForm.remarks" label="Remarks" variant="outlined" rows="3" maxlength="1000" counter :disabled="bulkSaving" />
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider />
        <v-card-actions class="pa-4">
          <v-btn variant="tonal" :disabled="bulkSaving" @click="clearSelectedCells">Clear Selection</v-btn>
          <v-spacer />
          <v-btn variant="text" :disabled="bulkSaving" @click="closeBulkDialog">Cancel</v-btn>
          <v-btn color="primary" prepend-icon="mdi-content-save" :loading="bulkSaving" :disabled="!canSaveBulk" @click="saveBulkExceptions">Apply</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <ExceptionDialog
      v-model="dialog"
      :form="form"
      :teachers="store.teachers"
      :bells="store.bells"
      :saving="store.saving || store.deleting"
      @save="saveException"
      @delete="deleteException"
    />

    <div v-if="contextMenu.show" class="context-menu-backdrop" @click="closeContextMenu" @contextmenu.prevent="closeContextMenu" />

    <div
      v-if="contextMenu.show"
      class="teacher-context-menu"
      :style="{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }"
      role="menu"
      @click.stop
      @contextmenu.prevent.stop
    >
      <div class="context-menu-header">
        <div class="font-weight-bold">{{ contextMenu.exception?.teacher?.name || selectedTeacher?.name || 'Teacher' }}</div>
        <div class="text-caption text-medium-emphasis">{{ formatDate(contextMenu.exception?.exception_date) || '-' }}</div>
      </div>

      <v-list density="compact" class="context-list" :disabled="isBusy">
        <v-list-item prepend-icon="mdi-pencil" title="Edit" @click="editContextException" />
        <v-list-item prepend-icon="mdi-content-copy" title="Duplicate" @click="duplicateContextException" />
        <v-list-item prepend-icon="mdi-calendar-arrow-right" title="Copy to Next Week" @click="copyContextToNextWeek" />
        <v-divider />
        <v-list-item prepend-icon="mdi-clock-alert-outline" title="Mark Busy" @click="quickStatus('busy')" />
        <v-list-item prepend-icon="mdi-calendar-remove" title="Mark Leave" @click="quickStatus('leave')" />
        <v-list-item prepend-icon="mdi-account-group" title="Mark Meeting" @click="quickStatus('meeting')" />
        <v-list-item prepend-icon="mdi-school" title="Mark Training" @click="quickStatus('training')" />
        <v-list-item prepend-icon="mdi-file-document-check" title="Mark Exam Duty" @click="quickStatus('exam_duty')" />
        <v-list-item prepend-icon="mdi-book-open-page-variant" title="Mark Extra Class" @click="quickStatus('extra_class')" />
        <v-divider />
        <v-list-item class="text-error" prepend-icon="mdi-delete" title="Delete" @click="deleteContextException" />
      </v-list>
    </div>
  </v-container>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useTeacherAvailabilityExceptionStore } from '../../../stores/teacherAvailabilityException'
import { useUIStore } from '../../../stores/snackBar'
import { useAppStore } from '../../../stores/app'
import { formatDate } from '../../../utils/date'

import StatsCards from './components/StatsCards.vue'
import TeacherAvailabilityToolbar from './components/Toolbar.vue'
import TeacherList from './components/TeacherList.vue'
import WeeklyPlanner from './components/WeeklyPlanner.vue'
import StatusLegend from './components/StatusLegend.vue'
import UpcomingLeaves from './components/UpcomingLeaves.vue'
import ExceptionDialog from './components/ExceptionDialog.vue'

const store = useTeacherAvailabilityExceptionStore()
const ui = useUIStore()
const appStore = useAppStore()

const selectedAcademicYearId = computed(() => appStore.selectedAcademicYearId)
const academicYearLabel = computed(() => appStore.selectedAcademicYear?.name || 'No session selected')

const toDateKey = (value = new Date()) => {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const selectedDate = ref(toDateKey())
const search = ref('')
const statusFilter = ref('all')
const viewMode = ref('week')
const selectedTeacher = ref(null)
const dialog = ref(false)
const bulkDialog = ref(false)
const bulkSaving = ref(false)
const bulkError = ref('')
const selectedCells = ref([])

const form = reactive({
  id: null,
  academic_year_id: null,
  teacher_id: null,
  exception_date: null,
  weekday: null,
  school_bell_id: null,
  status: 'busy',
  reason: '',
  remarks: '',
  is_full_day: false,
  is_active: true,
})

const bulkForm = reactive({ status: 'busy', reason: '', remarks: '', is_full_day: false })

const statusOptions = [
  { label: 'Busy / Duty', value: 'busy' },
  { label: 'Leave', value: 'leave' },
  { label: 'Meeting', value: 'meeting' },
  { label: 'Training', value: 'training' },
  { label: 'Exam Duty', value: 'exam_duty' },
  { label: 'Assembly', value: 'assembly' },
  { label: 'Extra Class', value: 'extra_class' },
  { label: 'Blocked', value: 'blocked' },
]

const isBusy = computed(() => store.loading || store.saving || store.deleting || store.moving || bulkSaving.value)

const selectedDateObj = computed(() => {
  const date = new Date(`${selectedDate.value}T12:00:00`)
  return Number.isNaN(date.getTime()) ? new Date() : date
})

const weekStart = computed(() => {
  const date = new Date(selectedDateObj.value)
  const day = date.getDay()
  date.setDate(date.getDate() - (day === 0 ? 6 : day - 1))
  return date
})

const weekDays = computed(() => {
  const names = [
    ['Mon', 'monday'], ['Tue', 'tuesday'], ['Wed', 'wednesday'],
    ['Thu', 'thursday'], ['Fri', 'friday'], ['Sat', 'saturday'], ['Sun', 'sunday'],
  ]

  return names.map(([label, value], index) => {
    const date = new Date(weekStart.value)
    date.setDate(date.getDate() + index)
    return { label, value, date: toDateKey(date) }
  })
})

const weekLabel = computed(() => {
  const first = weekDays.value[0]?.date
  const last = weekDays.value[6]?.date
  return first && last ? `${formatDate(first)} - ${formatDate(last)}` : '-'
})

const filteredTeachers = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return store.teachers
  return store.teachers.filter((teacher) =>
    [teacher.name, teacher.employee_code, teacher.email]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query))
  )
})

const filteredExceptions = computed(() => store.exceptions.filter((item) =>
  item.is_active !== false && (statusFilter.value === 'all' || item.status === statusFilter.value)
))

const upcomingLeaves = computed(() => {
  const today = toDateKey()
  return store.exceptions
    .filter((item) => item.is_active !== false && item.status === 'leave' && toDateKey(item.exception_date) >= today)
    .sort((a, b) => toDateKey(a.exception_date).localeCompare(toDateKey(b.exception_date)))
    .slice(0, 6)
})

const cellKey = (cell) => `${cell.teacher.id}-${cell.day.date}-${bulkForm.is_full_day ? 'day' : cell.bell.id}`

const uniqueBulkCells = computed(() => {
  const cells = new Map()
  selectedCells.value.forEach((cell) => {
    if (!cell?.teacher?.id || !cell?.day?.date || !cell?.bell?.id) return
    const key = cellKey(cell)
    if (!cells.has(key)) cells.set(key, cell)
  })
  return [...cells.values()]
})

const canSaveBulk = computed(() => uniqueBulkCells.value.length > 0 && Boolean(bulkForm.status) && !bulkSaving.value && Boolean(selectedAcademicYearId.value))

const resetForm = () => Object.assign(form, {
  id: null,
  academic_year_id: selectedAcademicYearId.value,
  teacher_id: selectedTeacher.value?.id || null,
  exception_date: selectedDate.value,
  weekday: null,
  school_bell_id: null,
  status: 'busy',
  reason: '',
  remarks: '',
  is_full_day: false,
  is_active: true,
})

const resetBulkForm = () => Object.assign(bulkForm, { status: 'busy', reason: '', remarks: '', is_full_day: false })

const openCreateDialog = () => {
  if (isBusy.value || !selectedAcademicYearId.value) return
  resetForm()
  dialog.value = true
}

const openCellDialog = ({ day, bell, teacher }) => {
  if (isBusy.value || !selectedAcademicYearId.value) return
  resetForm()
  Object.assign(form, {
    teacher_id: teacher?.id || selectedTeacher.value?.id || null,
    exception_date: day.date,
    weekday: day.value,
    school_bell_id: bell.id,
  })
  dialog.value = true
}

const openEditDialog = (item) => {
  if (!item || isBusy.value || !selectedAcademicYearId.value) return
  Object.assign(form, {
    id: item.id,
    academic_year_id: selectedAcademicYearId.value,
    teacher_id: item.teacher_id,
    exception_date: toDateKey(item.exception_date),
    weekday: item.weekday,
    school_bell_id: item.school_bell_id,
    status: item.status || 'busy',
    reason: item.reason || '',
    remarks: item.remarks || '',
    is_full_day: Boolean(item.is_full_day),
    is_active: item.is_active ?? true,
  })
  dialog.value = true
}

const openBulkDialog = () => {
  if (!selectedCells.value.length || isBusy.value || !selectedAcademicYearId.value) return
  bulkError.value = ''
  bulkDialog.value = true
}

const closeBulkDialog = () => {
  if (!bulkSaving.value) bulkDialog.value = false
}

const removeSelectedCell = (cell) => {
  selectedCells.value = selectedCells.value.filter((item) => cellKey(item) !== cellKey(cell))
  if (!selectedCells.value.length) bulkDialog.value = false
}

const clearSelectedCells = () => {
  if (bulkSaving.value) return
  selectedCells.value = []
  bulkDialog.value = false
}

const saveBulkExceptions = async () => {
  const cells = uniqueBulkCells.value
  if (!cells.length || bulkSaving.value || !selectedAcademicYearId.value) return

  bulkSaving.value = true
  bulkError.value = ''
  let saved = 0
  const failures = []

  for (const cell of cells) {
    try {
      await store.save({
        academic_year_id: selectedAcademicYearId.value,
        teacher_id: cell.teacher.id,
        exception_date: cell.day.date,
        weekday: cell.day.value,
        school_bell_id: bulkForm.is_full_day ? null : cell.bell.id,
        status: bulkForm.status,
        reason: bulkForm.reason || null,
        remarks: bulkForm.remarks || null,
        is_full_day: bulkForm.is_full_day,
        is_active: true,
      }, null, { silent: true })
      saved += 1
    } catch (error) {
      failures.push(error?.response?.data?.message || error?.message || 'Unknown error')
    }
  }

  try {
    await loadDashboard({ silent: true })
  } finally {
    bulkSaving.value = false
  }

  if (!failures.length) {
    ui.showSnackbar(`${saved} teacher availability exception${saved === 1 ? '' : 's'} created successfully.`)
    bulkDialog.value = false
    selectedCells.value = []
    resetBulkForm()
    return
  }

  bulkError.value = saved
    ? `${saved} exception${saved === 1 ? '' : 's'} saved, but ${failures.length} failed. ${failures[0]}`
    : `No exceptions were saved. ${failures[0]}`
  ui.showSnackbar(bulkError.value, saved ? 'warning' : 'error')
}

const saveException = async () => {
  if (store.saving || !selectedAcademicYearId.value) return
  try {
    await store.save({
      ...form,
      academic_year_id: selectedAcademicYearId.value,
      school_bell_id: form.is_full_day ? null : form.school_bell_id,
      reason: form.reason || null,
      remarks: form.remarks || null,
    }, form.id)
    dialog.value = false
    await loadDashboard({ silent: true })
  } catch {
    // Store already exposes and displays the API error.
  }
}

const deleteException = async (id) => {
  if (!id || store.deleting || !selectedAcademicYearId.value) return
  const confirmed = await ui.confirmDialog('Delete Exception', 'Are you sure you want to delete this exception?')
  if (!confirmed) return
  try {
    await store.delete(id, selectedDate.value, selectedAcademicYearId.value)
    dialog.value = false
    closeContextMenu()
  } catch {
    // Store already exposes and displays the API error.
  }
}

const loadDashboard = async ({ silent = false } = {}) => {
  if (!selectedAcademicYearId.value) {
    store.reset()
    selectedTeacher.value = null
    selectedCells.value = []
    return
  }

  const selectedTeacherId = selectedTeacher.value?.id
  try {
    await store.fetchDashboard(selectedDate.value, selectedAcademicYearId.value)
    selectedTeacher.value = store.teachers.find((teacher) => Number(teacher.id) === Number(selectedTeacherId))
      || store.teachers[0]
      || null
    selectedCells.value = []
  } catch (error) {
    if (!silent) ui.showSnackbar(error?.response?.data?.message || 'Failed to load teacher availability.', 'error')
  }
}

const sameCell = (a, b) => Number(a.teacher?.id) === Number(b.teacher?.id)
  && a.day?.date === b.day?.date
  && Number(a.bell?.id) === Number(b.bell?.id)

const selectCell = (cell) => {
  const index = selectedCells.value.findIndex((item) => sameCell(item, cell))
  if (index >= 0) selectedCells.value.splice(index, 1)
  else selectedCells.value.push(cell)
}

const addCellToSelection = (cell) => {
  if (cell?.teacher && cell?.day && cell?.bell && !selectedCells.value.some((item) => sameCell(item, cell))) {
    selectedCells.value.push(cell)
  }
}

const startCellSelection = (cell) => {
  selectedCells.value = []
  addCellToSelection(cell)
}

const addCellSelection = addCellToSelection
const finishCellSelection = () => {
  if (selectedCells.value.length > 1) openBulkDialog()
}

const moveException = async ({ id, mode, payload }) => {
  if (isBusy.value || !selectedAcademicYearId.value) return
  try {
    if (mode === 'copy') {
      const item = store.exceptions.find((exception) => Number(exception.id) === Number(id))
      if (!item) return
      await store.save({
        ...item,
        id: undefined,
        academic_year_id: selectedAcademicYearId.value,
        exception_date: payload.exception_date,
        weekday: payload.weekday,
        school_bell_id: payload.school_bell_id,
      })
    } else {
      await store.moveException(id, payload)
    }
    await loadDashboard({ silent: true })
  } catch {
    // Store already exposes and displays the API error.
  }
}

const moveWeek = async (direction) => {
  if (store.loading || !selectedAcademicYearId.value) return
  const date = new Date(`${selectedDate.value}T12:00:00`)
  date.setDate(date.getDate() + direction * 7)
  selectedDate.value = toDateKey(date)
  await loadDashboard()
}

const goToday = async () => {
  if (store.loading || !selectedAcademicYearId.value) return
  selectedDate.value = toDateKey()
  await loadDashboard()
}

const contextMenu = reactive({ show: false, x: 0, y: 0, exception: null })

const openContextMenu = ({ event, exception }) => {
  if (!exception || isBusy.value || !selectedAcademicYearId.value) return
  event.preventDefault()
  event.stopPropagation()
  contextMenu.exception = exception
  const padding = 12
  contextMenu.x = Math.max(padding, Math.min(event.clientX, window.innerWidth - 252))
  contextMenu.y = Math.max(padding, Math.min(event.clientY, window.innerHeight - 390))
  contextMenu.show = true
}

const closeContextMenu = () => Object.assign(contextMenu, { show: false, exception: null })

const editContextException = () => {
  const item = contextMenu.exception
  closeContextMenu()
  openEditDialog(item)
}

const duplicateContextException = () => {
  const item = contextMenu.exception
  if (!item) return
  closeContextMenu()
  openEditDialog({ ...item, id: null, is_active: true })
}

const quickStatus = async (status) => {
  const item = contextMenu.exception
  if (!item || !selectedAcademicYearId.value) return
  closeContextMenu()
  try {
    await store.save({ ...item, academic_year_id: selectedAcademicYearId.value, status }, item.id)
    await loadDashboard({ silent: true })
  } catch {
    // Store already exposes and displays the API error.
  }
}

const copyContextToNextWeek = async () => {
  const item = contextMenu.exception
  if (!item || !selectedAcademicYearId.value) return
  const nextDate = new Date(`${toDateKey(item.exception_date)}T12:00:00`)
  nextDate.setDate(nextDate.getDate() + 7)
  closeContextMenu()
  try {
    await store.save({
      ...item,
      id: undefined,
      academic_year_id: selectedAcademicYearId.value,
      exception_date: toDateKey(nextDate),
    })
    await loadDashboard({ silent: true })
  } catch {
    // Store already exposes and displays the API error.
  }
}

const deleteContextException = async () => {
  const id = contextMenu.exception?.id
  if (id) await deleteException(id)
}

const handleKeyDown = (event) => {
  if (event.key !== 'Escape') return
  closeContextMenu()
  if (!bulkSaving.value) bulkDialog.value = false
  if (!store.saving && !store.deleting) dialog.value = false
  selectedCells.value = []
}

watch(selectedAcademicYearId, async () => {
  dialog.value = false
  bulkDialog.value = false
  selectedCells.value = []
  selectedTeacher.value = null
  search.value = ''
  statusFilter.value = 'all'
  await loadDashboard({ silent: true })
})

watch(() => appStore.refreshKey, async () => {
  await loadDashboard({ silent: true })
})

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('resize', closeContextMenu)
  window.addEventListener('scroll', closeContextMenu, true)
  loadDashboard()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('resize', closeContextMenu)
  window.removeEventListener('scroll', closeContextMenu, true)
  store.reset?.()
})
</script>

<style scoped>
.teacher-availability-page {
  min-height: 100vh;
  background: rgb(var(--v-theme-background));
  color: rgb(var(--v-theme-on-background));
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
}

.year-card,
.planner-card {
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}

.year-card { border-radius: 12px; }
.planner-card { overflow: hidden; box-shadow: 0 14px 36px rgba(var(--v-theme-on-surface), 0.08); }

.planner-main {
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  height: 560px;
  min-height: 560px;
  transition: opacity 0.2s ease;
}

.planner-disabled {
  opacity: 0.72;
  pointer-events: none;
}

.page-empty-state {
  min-height: 420px;
  display: grid;
  place-items: center;
  align-content: center;
  text-align: center;
  padding: 32px;
}

.selection-summary {
  min-height: 46px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  background: rgba(var(--v-theme-primary), 0.08);
}

.selected-cells-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-height: 160px;
  overflow-y: auto;
  padding: 10px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  border-radius: 14px;
  background: rgba(var(--v-theme-on-surface), 0.04);
}

.context-menu-backdrop { position: fixed; inset: 0; z-index: 9998; }
.teacher-context-menu {
  position: fixed;
  z-index: 9999;
  min-width: 240px;
  overflow: hidden;
  border-radius: 12px;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.14);
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.28);
}
.context-menu-header {
  padding: 12px 14px 8px;
  background: rgba(var(--v-theme-primary), 0.08);
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.1);
}
.context-list { background: rgb(var(--v-theme-surface)); color: rgb(var(--v-theme-on-surface)); }

@media (max-width: 960px) {
  .planner-main { grid-template-columns: 1fr; height: auto; min-height: 0; }
  .selection-summary { flex-wrap: wrap; }
}

@media (prefers-reduced-motion: reduce) {
  .planner-main { transition: none; }
}
</style>
