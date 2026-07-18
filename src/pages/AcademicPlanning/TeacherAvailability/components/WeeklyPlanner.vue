<template>
  <div class="schedule-panel">
    <div v-if="!selectedTeacher" class="empty-state">
      <v-icon size="42" color="primary">mdi-account-search</v-icon>
      <div class="text-subtitle-1 font-weight-bold mt-2">Select a teacher</div>
      <div class="text-body-2 text-medium-emphasis">
        Choose a teacher from the left list to manage weekly exceptions.
      </div>
    </div>

    <div v-else class="schedule-scroll">
      <div class="day-header-row">
        <div class="period-head">Periods</div>

        <div
          v-for="day in weekDays"
          :key="day.value"
          class="day-head"
          :class="{ today: isToday(day.date), 'current-date-column': isToday(day.date) }"
        >
          <strong>
            {{ day.label }}
            <v-chip
              v-if="isToday(day.date)"
              size="x-small"
              color="primary"
              variant="flat"
              class="ml-1 today-chip"
            >
              Today
            </v-chip>
          </strong>

          <span>{{ formatShortDate(day.date) }}</span>
        </div>
      </div>

      <div
        v-for="bell in bells"
        :key="bell.id"
        class="period-grid-row"
      >
        <div class="period-info">
          <strong>P{{ bell.period_number }}</strong>
          <span>{{ formatTime(bell.start_time) }} - {{ formatTime(bell.end_time) }}</span>
        </div>

        <div
          v-for="day in weekDays"
          :key="`${day.value}-${bell.id}`"
          class="drop-zone"
          :class="{
            selected: isSelected(day, bell),
            dropping: activeDropKey === cellKey(day, bell),
            'current-date-column': isToday(day.date),
          }"
          :data-date="day.date"
          :data-weekday="day.value"
          :data-bell-id="bell.id"
          @mousedown.left="onSelectionMouseDown(day, bell, $event)"
          @mouseenter="onSelectionMouseEnter(day, bell)"
          @dragover.prevent
          @dragenter.prevent="activeDropKey = cellKey(day, bell)"
          @dragleave="clearActiveDrop(day, bell)"
          @drop="onDrop($event, day, bell)"
        >
          <button
            v-if="getException(selectedTeacher, day.value, bell.id, day.date)"
            type="button"
            draggable="true"
            class="availability-cell exception-cell"
            :class="statusClass(getException(selectedTeacher, day.value, bell.id, day.date)?.status)"
            @mousedown.stop
            @dragstart="onDragStart($event, getException(selectedTeacher, day.value, bell.id, day.date))"
            @dragend="onDragEnd"
            @click="onExceptionClick($event, day, bell, getException(selectedTeacher, day.value, bell.id, day.date))"
            @dblclick.stop="onDoubleClick(getException(selectedTeacher, day.value, bell.id, day.date))"
            @contextmenu.prevent.stop="onContextMenu($event, getException(selectedTeacher, day.value, bell.id, day.date))"
          >
            <v-icon size="16">
              {{ statusIcon(getException(selectedTeacher, day.value, bell.id, day.date)?.status) }}
            </v-icon>

            <span>
              <strong>{{ getStatusLabel(getException(selectedTeacher, day.value, bell.id, day.date)?.status) }}</strong>

              <small v-if="getException(selectedTeacher, day.value, bell.id, day.date)?.is_full_day">
                Full Day
              </small>

              <small v-else-if="getException(selectedTeacher, day.value, bell.id, day.date)?.reason">
                {{ getException(selectedTeacher, day.value, bell.id, day.date)?.reason }}
              </small>
            </span>
          </button>

          <button
            v-else
            type="button"
            class="availability-cell status-available"
            @click="onCellClick(day, bell, $event)"
          >
            <v-icon size="16">mdi-check</v-icon>
            <span>
              <strong>Available</strong>
              <small>Default</small>
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, ref } from 'vue'
import { formatShortDate, formatTime } from '../../../../utils/date'

const props = defineProps({
  selectedTeacher: {
    type: Object,
    default: null,
  },
  bells: {
    type: Array,
    default: () => [],
  },
  weekDays: {
    type: Array,
    default: () => [],
  },
  exceptions: {
    type: Array,
    default: () => [],
  },
  selectedCells: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits([
  'cell-click',
  'cell-selected',
  'exception-click',
  'exception-move',
  'exception-context',
  'exception-quick-edit',
  'cell-selection-start',
  'cell-selection-over',
  'cell-selection-end',
])

const statusOptions = [
  { label: 'Available', value: 'available', icon: 'mdi-check' },
  { label: 'Busy', value: 'busy', icon: 'mdi-clock-alert-outline' },
  { label: 'Leave', value: 'leave', icon: 'mdi-calendar-remove' },
  { label: 'Meeting', value: 'meeting', icon: 'mdi-account-group' },
  { label: 'Training', value: 'training', icon: 'mdi-school' },
  { label: 'Exam Duty', value: 'exam_duty', icon: 'mdi-file-document-check' },
  { label: 'Assembly', value: 'assembly', icon: 'mdi-bullhorn' },
  { label: 'Extra Class', value: 'extra_class', icon: 'mdi-book-open-page-variant' },
  { label: 'Blocked', value: 'blocked', icon: 'mdi-close-circle-outline' },
]

const selectionStartCell = ref(null)
const isMouseSelecting = ref(false)
const hasSelectionMoved = ref(false)
const activeDropKey = ref(null)

const cellKey = (day, bell) => `${day.date}-${bell.id}`

const getException = (teacher, weekday, bellId, date) => {
  if (!teacher) return null

  const normalizedDate = String(date || '').slice(0, 10)

  const sameDateExceptions = props.exceptions.filter((item) => {
    return (
      Number(item.teacher_id) === Number(teacher.id) &&
      String(item.exception_date || '').slice(0, 10) === normalizedDate
    )
  })

  const fullDayException = sameDateExceptions.find((item) => Boolean(item.is_full_day))

  if (fullDayException) {
    return fullDayException
  }

  return sameDateExceptions.find((item) => {
    return (
      item.weekday === weekday &&
      Number(item.school_bell_id) === Number(bellId)
    )
  })
}

const onContextMenu = (event, exception) => {
  if (!exception) return

  event.preventDefault()
  event.stopPropagation()
  window.getSelection()?.removeAllRanges()

  emit('exception-context', {
    event,
    exception,
  })
}

const onDoubleClick = (exception) => {
  if (!exception) return
  emit('exception-quick-edit', exception)
}

const getStatusLabel = (status) => {
  return statusOptions.find((item) => item.value === (status || 'available'))?.label || 'Available'
}

const statusIcon = (status) => {
  return statusOptions.find((item) => item.value === (status || 'available'))?.icon || 'mdi-check'
}

const statusClass = (status) => `status-${status || 'available'}`

const isToday = (date) => String(date).slice(0, 10) === new Date().toISOString().slice(0, 10)

const selectCell = (day, bell) => {
  emit('cell-selected', {
    teacher: props.selectedTeacher,
    day,
    bell,
  })
}

const onCellClick = (day, bell, event) => {
  if (hasSelectionMoved.value) {
    event.preventDefault()
    return
  }

  if (event.shiftKey) {
    selectCell(day, bell)
    return
  }

  emit('cell-click', {
    teacher: props.selectedTeacher,
    day,
    bell,
  })
}

const onExceptionClick = (event, day, bell, exception) => {
  if (event.shiftKey) {
    selectCell(day, bell)
    return
  }

  emit('exception-click', exception)
}

const isSelected = (day, bell) => {
  return props.selectedCells.some((item) => {
    return (
      Number(item.teacher?.id) === Number(props.selectedTeacher?.id) &&
      item.day?.date === day.date &&
      Number(item.bell?.id) === Number(bell.id)
    )
  })
}

const onSelectionMouseDown = (day, bell, event) => {
  if (!props.selectedTeacher || event.target.closest('.exception-cell')) {
    return
  }

  event.preventDefault()
  window.getSelection()?.removeAllRanges()
  document.body.classList.add('teacher-planner-no-select')

  selectionStartCell.value = { day, bell }
  isMouseSelecting.value = true
  hasSelectionMoved.value = false
}

const onSelectionMouseEnter = (day, bell) => {
  if (!isMouseSelecting.value || !selectionStartCell.value || !props.selectedTeacher) {
    return
  }

  if (!hasSelectionMoved.value) {
    hasSelectionMoved.value = true

    emit('cell-selection-start', {
      teacher: props.selectedTeacher,
      day: selectionStartCell.value.day,
      bell: selectionStartCell.value.bell,
    })
  }

  emit('cell-selection-over', {
    teacher: props.selectedTeacher,
    day,
    bell,
  })
}

const stopSelection = () => {
  if (!isMouseSelecting.value) return

  const moved = hasSelectionMoved.value

  if (moved) {
    emit('cell-selection-end')
  }

  isMouseSelecting.value = false
  selectionStartCell.value = null
  document.body.classList.remove('teacher-planner-no-select')

  if (moved) {
    window.setTimeout(() => {
      hasSelectionMoved.value = false
    }, 120)
  } else {
    hasSelectionMoved.value = false
  }
}

const onDragStart = (event, exception) => {
  if (!exception) return

  window.getSelection()?.removeAllRanges()
  document.body.classList.add('teacher-planner-no-select')
  document.body.classList.add('teacher-planner-dragging')

  event.dataTransfer.effectAllowed = event.ctrlKey ? 'copy' : 'move'
  event.dataTransfer.setData('exception_id', exception.id)
  event.dataTransfer.setData('drag_mode', event.ctrlKey ? 'copy' : 'move')

  const ghost = document.createElement('div')
  ghost.className = 'teacher-drag-ghost'
  ghost.textContent = `${getStatusLabel(exception.status)} · ${exception.reason || 'Teacher exception'}`
  document.body.appendChild(ghost)
  event.dataTransfer.setDragImage(ghost, 12, 12)

  requestAnimationFrame(() => {
    ghost.remove()
  })
}

const onDragEnd = () => {
  activeDropKey.value = null
  document.body.classList.remove('teacher-planner-no-select')
  document.body.classList.remove('teacher-planner-dragging')
}

const clearActiveDrop = (day, bell) => {
  if (activeDropKey.value === cellKey(day, bell)) {
    activeDropKey.value = null
  }
}

const onDrop = (event, day, bell) => {
  activeDropKey.value = null

  const exceptionId = event.dataTransfer.getData('exception_id')
  const dragMode = event.dataTransfer.getData('drag_mode') || 'move'

  if (!exceptionId) return

  emit('exception-move', {
    id: exceptionId,
    mode: dragMode,
    payload: {
      exception_date: day.date,
      weekday: day.value,
      school_bell_id: bell.id,
    },
  })
}

if (typeof window !== 'undefined') {
  window.addEventListener('mouseup', stopSelection)
}

onBeforeUnmount(() => {
  window.removeEventListener('mouseup', stopSelection)
  document.body.classList.remove('teacher-planner-no-select')
  document.body.classList.remove('teacher-planner-dragging')
})
</script>

<style scoped>
.schedule-panel,
.schedule-scroll,
.day-header-row,
.period-head,
.day-head,
.period-grid-row,
.period-info,
.drop-zone,
.availability-cell {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.schedule-panel {
  height: 560px;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  overflow: hidden;
}

.schedule-scroll {
  height: 560px;
  overflow: auto;
  background:
    linear-gradient(
      90deg,
      rgba(var(--v-theme-primary), 0.035),
      transparent 18%
    ),
    rgb(var(--v-theme-surface));
}

.empty-state {
  height: 100%;
  display: grid;
  place-content: center;
  text-align: center;
  color: rgb(var(--v-theme-on-surface));
}

.day-header-row {
  display: grid;
  grid-template-columns: 120px repeat(7, minmax(132px, 1fr));
  min-width: 1050px;
  height: 64px;
  position: sticky;
  top: 0;
  z-index: 3;
  background: rgb(var(--v-theme-surface));
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}

.period-head,
.day-head {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 14px;
}

.period-head {
  position: sticky;
  left: 0;
  z-index: 4;
  background: rgb(var(--v-theme-surface));
  font-weight: 700;
  border-right: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.day-head {
  align-items: center;
  color: rgba(var(--v-theme-on-surface), 0.86);
  border-left: 1px solid rgba(var(--v-theme-on-surface), 0.04);
}

.day-head.today {
  color: rgb(var(--v-theme-primary));
  box-shadow: inset 0 -3px 0 rgb(var(--v-theme-primary));
}

.day-head.current-date-column {
  background:
    linear-gradient(
      180deg,
      rgba(var(--v-theme-primary), 0.18),
      rgba(var(--v-theme-primary), 0.08)
    );
}

.today-chip {
  vertical-align: middle;
  font-size: 10px;
  height: 18px;
}

.day-head span {
  font-size: 12px;
  color: rgba(var(--v-theme-on-surface), 0.62);
}

.period-grid-row {
  display: grid;
  grid-template-columns: 120px repeat(7, minmax(132px, 1fr));
  min-width: 1050px;
  min-height: 68px;
}

.period-info {
  padding: 10px 14px;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  position: sticky;
  left: 0;
  z-index: 2;
  background: rgb(var(--v-theme-surface));
  border-right: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.period-info strong {
  display: block;
  color: rgb(var(--v-theme-on-surface));
}

.period-info span {
  font-size: 12px;
  color: rgba(var(--v-theme-on-surface), 0.62);
}

.drop-zone {
  min-height: 68px;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.06);
  border-left: 1px solid rgba(var(--v-theme-on-surface), 0.04);
  position: relative;
}

.drop-zone:hover {
  background: rgba(var(--v-theme-primary), 0.08);
}

.drop-zone.selected {
  background: rgba(var(--v-theme-primary), 0.16);
  box-shadow: inset 0 0 0 2px rgba(var(--v-theme-primary), 0.55);
}

.drop-zone.dropping {
  background: rgba(var(--v-theme-primary), 0.18);
  box-shadow: inset 0 0 0 2px rgba(var(--v-theme-primary), 0.72);
}

.drop-zone.current-date-column {
  background: rgba(var(--v-theme-primary), 0.055);
  box-shadow:
    inset 1px 0 0 rgba(var(--v-theme-primary), 0.18),
    inset -1px 0 0 rgba(var(--v-theme-primary), 0.18);
}

.drop-zone.current-date-column:hover,
.drop-zone.current-date-column.dropping,
.drop-zone.current-date-column.selected {
  background: rgba(var(--v-theme-primary), 0.15);
}

.drop-zone.current-date-column::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-left: 2px solid rgba(var(--v-theme-primary), 0.32);
  border-right: 2px solid rgba(var(--v-theme-primary), 0.22);
}

.drop-zone.current-date-column .availability-cell {
  box-shadow: 0 0 0 1px rgba(var(--v-theme-primary), 0.10);
}

.availability-cell {
  width: calc(100% - 16px);
  margin: 8px;
  border-radius: 12px;
  padding: 9px 10px;
  min-height: 48px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: grab;
  touch-action: none;
  font-size: 12px;
  border: 1px solid transparent;
  text-align: left;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    background 0.18s ease;
}

.availability-cell:active {
  cursor: grabbing;
}

.availability-cell:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(var(--v-theme-on-surface), 0.12);
}

.availability-cell:focus-visible {
  outline: 2px solid rgba(var(--v-theme-primary), 0.6);
  outline-offset: 2px;
}

.availability-cell strong {
  display: block;
  font-size: 12px;
}

.availability-cell small {
  display: block;
  font-size: 11px;
  line-height: 1.2;
}

.status-available {
  background: rgba(var(--v-theme-success), 0.14);
  color: rgb(var(--v-theme-success));
  border-color: rgba(var(--v-theme-success), 0.22);
}

.status-busy,
.status-assembly {
  background: rgba(var(--v-theme-warning), 0.15);
  color: rgb(var(--v-theme-warning));
  border-color: rgba(var(--v-theme-warning), 0.3);
}

.status-leave,
.status-blocked {
  background: rgba(var(--v-theme-error), 0.15);
  color: rgb(var(--v-theme-error));
  border-color: rgba(var(--v-theme-error), 0.3);
}

.status-meeting,
.status-training {
  background: rgba(126, 87, 194, 0.17);
  color: rgb(126, 87, 194);
  border-color: rgba(126, 87, 194, 0.32);
}

.status-extra_class,
.status-exam_duty {
  background: rgba(var(--v-theme-info), 0.15);
  color: rgb(var(--v-theme-info));
  border-color: rgba(var(--v-theme-info), 0.3);
}

:global(.teacher-planner-no-select),
:global(.teacher-planner-no-select *) {
  user-select: none !important;
  -webkit-user-select: none !important;
}

:global(.teacher-planner-dragging),
:global(.teacher-planner-dragging *) {
  cursor: grabbing !important;
}

:global(.teacher-drag-ghost) {
  position: fixed;
  top: -9999px;
  left: -9999px;
  z-index: -1;
  padding: 8px 12px;
  border-radius: 10px;
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
  font-size: 12px;
  font-weight: 700;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.28);
}
</style>
