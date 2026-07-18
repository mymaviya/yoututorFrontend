<template>
    <v-container fluid class="teacher-availability-page">
        <div class="page-header mb-5">
            <div>
                <h1 class="text-h5 font-weight-bold mb-1">Teacher Availability</h1>
                <p class="text-body-2 text-medium-emphasis mb-0">
                    All teachers are available by default. Set exceptions for busy periods, leave, meetings and extra
                    classes.
                    <v-icon size="16" color="primary" class="ml-1">mdi-information-outline</v-icon>
                </p>
            </div>

            <v-card class="year-card" variant="outlined">
                <v-card-text class="py-2 px-4 d-flex align-center ga-2">
                    <span class="text-body-2">Academic Year:</span>
                    <strong>{{ academicYearLabel }}</strong>
                    <v-icon size="18">mdi-calendar</v-icon>
                </v-card-text>
            </v-card>
        </div>

        <StatsCards :stats="store.stats" />

        <v-card class="planner-card mt-5" rounded="xl">
            <TeacherAvailabilityToolbar v-model:search="search" v-model:status-filter="statusFilter"
                v-model:view-mode="viewMode" :week-label="weekLabel" :loading="store.loading" @today="goToday"
                @previous="moveWeek(-1)" @next="moveWeek(1)" @add="openCreateDialog" />

            <v-divider />

            <div
                v-if="selectedCells.length"
                class="selection-summary"
            >
                <v-icon size="18" color="primary">mdi-selection-drag</v-icon>
                <span>
                    {{ selectedCells.length }} period{{ selectedCells.length > 1 ? 's' : '' }} selected
                </span>

                <v-spacer />

                <v-btn
                    size="small"
                    variant="text"
                    color="primary"
                    @click="openBulkDialog"
                >
                    Apply Exception
                </v-btn>

                <v-btn
                    size="small"
                    variant="text"
                    @click="clearSelectedCells"
                >
                    Clear
                </v-btn>
            </div>

            <v-divider v-if="selectedCells.length" />

            <div class="planner-main">
                <TeacherList v-model:selected-teacher="selectedTeacher" :teachers="filteredTeachers"
                    :exceptions="store.exceptions" />

                <WeeklyPlanner :selected-teacher="selectedTeacher" :bells="store.bells" :week-days="weekDays"
                    :exceptions="filteredExceptions" :selected-cells="selectedCells" @cell-click="openCellDialog" @exception-click="openEditDialog"
                    @exception-move="moveException"
                    @exception-context="openContextMenu"
                    @exception-quick-edit="openEditDialog"
                    @cell-selected="selectCell"
                    @cell-selection-start="startCellSelection"
                    @cell-selection-over="addCellSelection"
                    @cell-selection-end="finishCellSelection" />
            </div>

            <v-alert type="info" variant="tonal" density="comfortable" class="ma-4">
                <strong>Tip:</strong>
                All teachers are available by default. Add exceptions only when a teacher is not available.
            </v-alert>
        </v-card>

        <v-row class="mt-4">
            <v-col cols="12" md="6">
                <StatusLegend />
            </v-col>

            <v-col cols="12" md="6">
                <UpcomingLeaves :leaves="upcomingLeaves" @view-all="statusFilter = 'leave'" />
            </v-col>
        </v-row>

        <v-fab
            v-if="selectedCells.length"
            color="primary"
            icon="mdi-pencil-multiple"
            location="bottom end"
            app
            @click="openBulkDialog"
        />

        <v-dialog v-model="bulkDialog" max-width="760" persistent>
            <v-card rounded="xl">
                <v-card-title class="d-flex align-center justify-space-between">
                    <span>Apply Exception to Selected Periods</span>
                    <v-chip color="primary" variant="tonal">
                        {{ uniqueBulkCells.length }} selected
                    </v-chip>
                </v-card-title>

                <v-divider />

                <v-card-text>
                    <v-alert type="info" variant="tonal" class="mb-4">
                        This will create exceptions for all selected teacher-period cells.
                    </v-alert>

                    <div class="selected-cells-preview mb-4">
                        <v-chip
                            v-for="cell in selectedCells"
                            :key="`${cell.teacher.id}-${cell.day.date}-${cell.bell.id}`"
                            size="small"
                            color="primary"
                            variant="tonal"
                            closable
                            @click:close="removeSelectedCell(cell)"
                        >
                            {{ cell.teacher.name }} · {{ cell.day.label }} · P{{ cell.bell.period_number }}
                        </v-chip>
                    </div>

                    <v-row>
                        <v-col cols="12" md="6">
                            <v-select
                                v-model="bulkForm.status"
                                :items="statusOptions"
                                item-title="label"
                                item-value="value"
                                label="Status"
                                variant="outlined"
                                density="compact"
                            />
                        </v-col>

                        <v-col cols="12" md="6">
                            <v-checkbox
                                v-model="bulkForm.is_full_day"
                                label="Full day exception"
                                density="compact"
                                hide-details
                            />
                        </v-col>

                        <v-col cols="12">
                            <v-text-field
                                v-model="bulkForm.reason"
                                label="Reason"
                                variant="outlined"
                                density="compact"
                                placeholder="Example: Training, Department meeting, Exam duty"
                            />
                        </v-col>

                        <v-col cols="12">
                            <v-textarea
                                v-model="bulkForm.remarks"
                                label="Remarks"
                                variant="outlined"
                                rows="3"
                            />
                        </v-col>
                    </v-row>
                </v-card-text>

                <v-divider />

                <v-card-actions class="pa-4">
                    <v-btn variant="tonal" @click="clearSelectedCells">
                        Clear Selection
                    </v-btn>

                    <v-spacer />

                    <v-btn variant="text" @click="bulkDialog = false">
                        Cancel
                    </v-btn>

                    <v-btn
                        color="primary"
                        prepend-icon="mdi-content-save"
                        :loading="store.saving"
                        :disabled="!uniqueBulkCells.length"
                        @click="saveBulkExceptions"
                    >
                        Apply
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <ExceptionDialog v-model="dialog" :form="form" :teachers="store.teachers" :bells="store.bells"
            :saving="store.saving" @save="saveException" @delete="deleteException" />

        <div
            v-if="contextMenu.show"
            class="context-menu-backdrop"
            @click="closeContextMenu"
            @contextmenu.prevent="closeContextMenu"
        />

        <div
            v-if="contextMenu.show"
            class="teacher-context-menu"
            :style="{
                left: `${contextMenu.x}px`,
                top: `${contextMenu.y}px`,
            }"
            @click.stop
            @contextmenu.prevent.stop
        >
            <div class="context-menu-header">
                <div class="font-weight-bold">
                    {{ contextMenu.exception?.teacher?.name || selectedTeacher?.name || 'Teacher' }}
                </div>
                <div class="text-caption text-medium-emphasis">
                    {{ formatDate(contextMenu.exception?.exception_date) || '-' }}
                </div>
            </div>

            <v-list density="compact" class="context-list">
                <v-list-item @click="editContextException">
                    <template #prepend>
                        <v-icon>mdi-pencil</v-icon>
                    </template>
                    <v-list-item-title>Edit</v-list-item-title>
                </v-list-item>

                <v-list-item @click="duplicateContextException">
                    <template #prepend>
                        <v-icon>mdi-content-copy</v-icon>
                    </template>
                    <v-list-item-title>Duplicate</v-list-item-title>
                </v-list-item>

                <v-list-item @click="copyContextToNextWeek">
                    <template #prepend>
                        <v-icon>mdi-calendar-arrow-right</v-icon>
                    </template>
                    <v-list-item-title>Copy to Next Week</v-list-item-title>
                </v-list-item>

                <v-divider />

                <v-list-item @click="quickStatus('busy')">
                    <template #prepend>
                        <v-icon color="warning">mdi-clock-alert-outline</v-icon>
                    </template>
                    <v-list-item-title>Mark Busy</v-list-item-title>
                </v-list-item>

                <v-list-item @click="quickStatus('leave')">
                    <template #prepend>
                        <v-icon color="error">mdi-calendar-remove</v-icon>
                    </template>
                    <v-list-item-title>Mark Leave</v-list-item-title>
                </v-list-item>

                <v-list-item @click="quickStatus('meeting')">
                    <template #prepend>
                        <v-icon color="deep-purple">mdi-account-group</v-icon>
                    </template>
                    <v-list-item-title>Mark Meeting</v-list-item-title>
                </v-list-item>

                <v-list-item @click="quickStatus('training')">
                    <template #prepend>
                        <v-icon color="purple">mdi-school</v-icon>
                    </template>
                    <v-list-item-title>Mark Training</v-list-item-title>
                </v-list-item>

                <v-list-item @click="quickStatus('exam_duty')">
                    <template #prepend>
                        <v-icon color="info">mdi-file-document-check</v-icon>
                    </template>
                    <v-list-item-title>Mark Exam Duty</v-list-item-title>
                </v-list-item>

                <v-list-item @click="quickStatus('extra_class')">
                    <template #prepend>
                        <v-icon color="primary">mdi-book-open-page-variant</v-icon>
                    </template>
                    <v-list-item-title>Mark Extra Class</v-list-item-title>
                </v-list-item>

                <v-divider />

                <v-list-item class="text-error" @click="deleteContextException">
                    <template #prepend>
                        <v-icon color="error">mdi-delete</v-icon>
                    </template>
                    <v-list-item-title>Delete</v-list-item-title>
                </v-list-item>
            </v-list>
        </div>

    </v-container>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useTeacherAvailabilityExceptionStore } from '../../../stores/teacherAvailabilityException'
import { useUIStore } from '../../../stores/snackBar'
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

const selectedDate = ref(new Date().toISOString().slice(0, 10))
const search = ref('')
const statusFilter = ref('all')
const viewMode = ref('week')
const selectedTeacher = ref(null)
const dialog = ref(false)
const selectedCells = ref([])
const shiftPressed = ref(false)
const bulkDialog = ref(false)

const form = reactive({
    id: null,
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

const bulkForm = reactive({
    status: 'busy',
    reason: '',
    remarks: '',
    is_full_day: false,
})

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

const academicYearLabel = computed(() => '2025-26')

const selectedDateObj = computed(() => new Date(selectedDate.value))

const weekStart = computed(() => {
    const date = new Date(selectedDateObj.value)
    const day = date.getDay()
    const diff = date.getDate() - day + (day === 0 ? -6 : 1)
    date.setDate(diff)
    return date
})

const weekDays = computed(() => {
    const dayNames = [
        ['Mon', 'monday'],
        ['Tue', 'tuesday'],
        ['Wed', 'wednesday'],
        ['Thu', 'thursday'],
        ['Fri', 'friday'],
        ['Sat', 'saturday'],
        ['Sun', 'sunday'],
    ]

    return dayNames.map(([label, value], index) => {
        const date = new Date(weekStart.value)
        date.setDate(weekStart.value.getDate() + index)

        return {
            label,
            value,
            date: date.toISOString().slice(0, 10),
        }
    })
})

const weekLabel = computed(() => {
    const first = weekDays.value[0]?.date
    const last = weekDays.value[6]?.date
    return `${formatDate(first)} - ${formatDate(last)}`
})

const filteredTeachers = computed(() => {
    if (!search.value) return store.teachers

    return store.teachers.filter((teacher) =>
        teacher.name?.toLowerCase().includes(search.value.toLowerCase())
    )
})

const filteredExceptions = computed(() => {
    if (statusFilter.value === 'all') return store.exceptions
    return store.exceptions.filter((item) => item.status === statusFilter.value)
})

const upcomingLeaves = computed(() => {
    return store.exceptions.filter((item) => item.status === 'leave').slice(0, 6)
})

const resetForm = () => {
    form.id = null
    form.teacher_id = selectedTeacher.value?.id || null
    form.exception_date = selectedDate.value
    form.weekday = null
    form.school_bell_id = null
    form.status = 'busy'
    form.reason = ''
    form.remarks = ''
    form.is_full_day = false
    form.is_active = true
}

const openCreateDialog = () => {
    resetForm()
    dialog.value = true
}

const openCellDialog = ({ day, bell, teacher }) => {
    resetForm()
    form.teacher_id = teacher?.id || selectedTeacher.value?.id || null
    form.exception_date = day.date
    form.weekday = day.value
    form.school_bell_id = bell.id
    dialog.value = true
}

const openEditDialog = (item) => {
    form.id = item.id
    form.teacher_id = item.teacher_id
    form.exception_date = item.exception_date
    form.weekday = item.weekday
    form.school_bell_id = item.school_bell_id
    form.status = item.status
    form.reason = item.reason || ''
    form.remarks = item.remarks || ''
    form.is_full_day = !!item.is_full_day
    form.is_active = item.is_active ?? true
    dialog.value = true
}

const openBulkDialog = () => {
    bulkDialog.value = true
}

const removeSelectedCell = (cell) => {
    const index = selectedCells.value.findIndex(item =>
        Number(item.teacher.id) === Number(cell.teacher.id) &&
        item.day.date === cell.day.date &&
        Number(item.bell.id) === Number(cell.bell.id)
    )

    if (index >= 0) {
        selectedCells.value.splice(index, 1)
    }
}

const clearSelectedCells = () => {
    selectedCells.value = []
}

const uniqueBulkCells = computed(() => {
    const map = new Map()

    selectedCells.value.forEach((cell) => {
        if (!cell?.teacher?.id || !cell?.day?.date || !cell?.bell?.id) return

        const key = bulkForm.is_full_day
            ? `${cell.teacher.id}-${cell.day.date}`
            : `${cell.teacher.id}-${cell.day.date}-${cell.bell.id}`

        if (!map.has(key)) {
            map.set(key, cell)
        }
    })

    return Array.from(map.values())
})

const saveBulkExceptions = async () => {
    const cells = uniqueBulkCells.value

    if (!cells.length) return

    for (const cell of cells) {
        await store.save({
            teacher_id: cell.teacher.id,
            exception_date: cell.day.date,
            weekday: cell.day.value,
            school_bell_id: bulkForm.is_full_day ? null : cell.bell.id,
            status: bulkForm.status,
            reason: bulkForm.reason,
            remarks: bulkForm.remarks,
            is_full_day: bulkForm.is_full_day,
            is_active: true,
        })
    }

    bulkDialog.value = false
    selectedCells.value = []
    bulkForm.status = 'busy'
    bulkForm.reason = ''
    bulkForm.remarks = ''
    bulkForm.is_full_day = false

    await loadDashboard()
}

const saveException = async () => {
    const payload = {
        ...form,
        school_bell_id: form.is_full_day ? null : form.school_bell_id,
    }

    await store.save(payload, form.id)
    dialog.value = false
    await loadDashboard()
}

const deleteException = async (id) => {
    const confirmed = await ui.confirmDialog('Delete Exception', 'Are you sure you want to delete this exception?')
    if (!confirmed) return

    await store.delete(id, selectedDate.value)
    dialog.value = false
}

const loadDashboard = async () => {
    await store.fetchDashboard(selectedDate.value)

    if (!selectedTeacher.value && store.teachers.length) {
        selectedTeacher.value = store.teachers[0]
    }
}

const selectCell = ({ teacher, day, bell }) => {
    const index = selectedCells.value.findIndex(item =>
        Number(item.teacher.id) === Number(teacher.id) &&
        item.day.date === day.date &&
        Number(item.bell.id) === Number(bell.id)
    )

    if (index >= 0) {
        selectedCells.value.splice(index, 1)
        return
    }

    selectedCells.value.push({
        teacher,
        day,
        bell,
    })
}

const addCellToSelection = ({ teacher, day, bell }) => {
    if (!teacher || !day || !bell) return

    const exists = selectedCells.value.some(item =>
        Number(item.teacher.id) === Number(teacher.id) &&
        item.day.date === day.date &&
        Number(item.bell.id) === Number(bell.id)
    )

    if (!exists) {
        selectedCells.value.push({
            teacher,
            day,
            bell,
        })
    }
}

const startCellSelection = (cell) => {
    selectedCells.value = []
    addCellToSelection(cell)
}

const addCellSelection = (cell) => {
    addCellToSelection(cell)
}

const finishCellSelection = () => {
    if (selectedCells.value.length > 1) {
        bulkDialog.value = true
    }
}


const moveException = async ({ id, mode, payload }) => {
  if (mode === 'copy') {
    const item = store.exceptions.find((exception) => Number(exception.id) === Number(id))

    if (!item) return

    await store.save({
      ...item,
      id: null,
      exception_date: payload.exception_date,
      weekday: payload.weekday,
      school_bell_id: payload.school_bell_id,
    })

    await loadDashboard()
    return
  }

  await store.moveException(id, payload)
  await loadDashboard()
}

const moveWeek = async (direction) => {
    const date = new Date(selectedDate.value)
    date.setDate(date.getDate() + direction * 7)
    selectedDate.value = date.toISOString().slice(0, 10)
    await loadDashboard()
}

const goToday = async () => {
    selectedDate.value = new Date().toISOString().slice(0, 10)
    await loadDashboard()
}

const contextMenu = reactive({
    show: false,
    x: 0,
    y: 0,
    exception: null,
})

const openContextMenu = ({ event, exception }) => {
    if (!exception) return

    event.preventDefault()
    event.stopPropagation()
    window.getSelection()?.removeAllRanges()

    contextMenu.show = false
    contextMenu.exception = exception

    const menuWidth = 240
    const menuHeight = 330
    const padding = 12

    contextMenu.x = Math.min(
        event.clientX,
        window.innerWidth - menuWidth - padding
    )

    contextMenu.y = Math.min(
        event.clientY,
        window.innerHeight - menuHeight - padding
    )

    requestAnimationFrame(() => {
        contextMenu.show = true
    })
}

const closeContextMenu = () => {
    contextMenu.show = false
    contextMenu.exception = null
}

const editContextException = () => {
    if (!contextMenu.exception) return

    openEditDialog(contextMenu.exception)
    contextMenu.show = false
}

const duplicateContextException = () => {
    if (!contextMenu.exception) return

    const item = contextMenu.exception

    form.id = null
    form.teacher_id = item.teacher_id
    form.exception_date = item.exception_date
    form.weekday = item.weekday
    form.school_bell_id = item.school_bell_id
    form.status = item.status
    form.reason = item.reason || ''
    form.remarks = item.remarks || ''
    form.is_full_day = !!item.is_full_day
    form.is_active = true

    contextMenu.show = false
    dialog.value = true
}

const quickStatus = async (status) => {
    if (!contextMenu.exception) return

    const item = contextMenu.exception

    await store.save(
        {
            ...item,
            status,
        },
        item.id
    )

    contextMenu.show = false
    await loadDashboard()
}

const copyContextToNextWeek = async () => {
    if (!contextMenu.exception) return

    const item = contextMenu.exception
    const nextDate = new Date(item.exception_date)
    nextDate.setDate(nextDate.getDate() + 7)

    await store.save({
        ...item,
        id: null,
        exception_date: nextDate.toISOString().slice(0, 10),
    })

    contextMenu.show = false
    await loadDashboard()
}

const deleteContextException = async () => {
    if (!contextMenu.exception) return

    await deleteException(contextMenu.exception.id)
    contextMenu.show = false
}

const handleKeyDown = (event) => {
    shiftPressed.value = event.shiftKey

    if (event.key === 'Escape') {
        contextMenu.show = false
        bulkDialog.value = false
        selectedCells.value = []
    }
}

const handleKeyUp = () => {
    shiftPressed.value = false
}

const handleGlobalScroll = () => {
    closeContextMenu()
}

onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('resize', closeContextMenu)
    window.addEventListener('scroll', handleGlobalScroll, true)
    loadDashboard()
})

onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('keyup', handleKeyUp)
    window.removeEventListener('resize', closeContextMenu)
    window.removeEventListener('scroll', handleGlobalScroll, true)
})
</script>

<style scoped>
.teacher-availability-page {
  background: rgb(var(--v-theme-background));
  color: rgb(var(--v-theme-on-background));
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 16px;
  flex-wrap: wrap;
}

.year-card {
  border-radius: 12px;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  border-color: rgba(var(--v-theme-on-surface), 0.12);
}

.planner-card {
  overflow: hidden;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  box-shadow: 0 14px 36px rgba(var(--v-theme-on-surface), 0.08);
}

.planner-main {
  display: grid;
  grid-template-columns: 300px 1fr;
  height: 560px;
  min-height: 560px;
}


.context-menu-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9998;
  background: transparent;
}

.teacher-context-menu {
  position: fixed;
  z-index: 9999;
  min-width: 220px;
  overflow: hidden;
  border-radius: 12px;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.14);
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.28);
  user-select: none;
  -webkit-user-select: none;
}

.selected-cells-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-height: 140px;
  overflow-y: auto;
  padding: 10px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  border-radius: 14px;
  background: rgba(var(--v-theme-on-surface), 0.04);
}

.selection-summary {
  min-height: 46px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  background: rgba(var(--v-theme-primary), 0.08);
  color: rgb(var(--v-theme-on-surface));
  user-select: none;
}

.context-menu-header {
  padding: 12px 14px 8px;
  background: rgba(var(--v-theme-primary), 0.08);
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.10);
}

.context-list {
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
}

@media (max-width: 960px) {
  .planner-main {
    grid-template-columns: 1fr;
    height: auto;
  }
}
</style>
