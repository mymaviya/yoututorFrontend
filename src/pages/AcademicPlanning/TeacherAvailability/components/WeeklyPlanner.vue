<template>
  <div class="schedule-panel" :aria-busy="loading">
    <div v-if="!selectedTeacher" class="empty-state" role="status">
      <v-icon size="42" color="primary">mdi-account-search</v-icon>
      <div class="text-subtitle-1 font-weight-bold mt-2">Select a teacher</div>
      <div class="text-body-2 text-medium-emphasis">
        Choose a teacher from the left list to manage weekly exceptions.
      </div>
    </div>

    <div v-else-if="!bells.length" class="empty-state" role="status">
      <v-icon size="42" color="warning">mdi-bell-off-outline</v-icon>
      <div class="text-subtitle-1 font-weight-bold mt-2">No periods configured</div>
      <div class="text-body-2 text-medium-emphasis">
        Add periods to the active bell schedule before managing availability.
      </div>
    </div>

    <div v-else class="schedule-scroll" role="grid" :aria-label="plannerLabel">
      <div class="day-header-row" role="row">
        <div class="period-head" role="columnheader">Periods</div>

        <div
          v-for="day in weekDays"
          :key="day.date || day.value"
          class="day-head"
          :class="{ today: isToday(day.date), 'current-date-column': isToday(day.date) }"
          role="columnheader"
          :aria-current="isToday(day.date) ? 'date' : undefined"
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

      <div v-for="bell in bells" :key="bell.id" class="period-grid-row" role="row">
        <div class="period-info" role="rowheader">
          <strong>P{{ bell.period_number }}</strong>
          <span>{{ periodTime(bell) }}</span>
        </div>

        <div
          v-for="day in weekDays"
          :key="`${day.date || day.value}-${bell.id}`"
          class="drop-zone"
          :class="{
            selected: isSelected(day, bell),
            dropping: activeDropKey === cellKey(day, bell),
            'current-date-column': isToday(day.date),
          }"
          role="gridcell"
          :aria-selected="isSelected(day, bell)"
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
            v-if="exceptionFor(day, bell)"
            type="button"
            draggable="true"
            class="availability-cell exception-cell"
            :class="statusClass(exceptionFor(day, bell).status)"
            :aria-label="exceptionAriaLabel(day, bell, exceptionFor(day, bell))"
            :title="exceptionTitle(exceptionFor(day, bell))"
            @mousedown.stop
            @dragstart="onDragStart($event, exceptionFor(day, bell))"
            @dragend="onDragEnd"
            @click="onExceptionClick($event, day, bell, exceptionFor(day, bell))"
            @dblclick.stop="onDoubleClick(exceptionFor(day, bell))"
            @contextmenu.prevent.stop="onContextMenu($event, exceptionFor(day, bell))"
          >
            <v-icon size="16">{{ statusIcon(exceptionFor(day, bell).status) }}</v-icon>
            <span>
              <strong>{{ getStatusLabel(exceptionFor(day, bell).status) }}</strong>
              <small v-if="exceptionFor(day, bell).is_full_day">Full Day</small>
              <small v-else-if="exceptionFor(day, bell).reason">
                {{ exceptionFor(day, bell).reason }}
              </small>
            </span>
          </button>

          <button
            v-else
            type="button"
            class="availability-cell status-available"
            :aria-label="availableAriaLabel(day, bell)"
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
import { computed, onBeforeUnmount, ref } from 'vue'
import { formatShortDate, formatTime } from '../../../../utils/date'

const props = defineProps({
  selectedTeacher: { type: Object, default: null },
  bells: { type: Array, default: () => [] },
  weekDays: { type: Array, default: () => [] },
  exceptions: { type: Array, default: () => [] },
  selectedCells: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
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

const normalizeDate = (value) => String(value || '').slice(0, 10)
const cellKey = (day, bell) => `${normalizeDate(day.date)}-${bell.id}`

const exceptionIndex = computed(() => {
  const teacherId = Number(props.selectedTeacher?.id)
  const map = new Map()

  if (!teacherId) return map

  props.exceptions.forEach((item) => {
    if (item?.is_active === false || Number(item?.teacher_id) !== teacherId) return

    const date = normalizeDate(item.exception_date)
    if (!date) return

    if (item.is_full_day) {
      map.set(`${date}:full`, item)
      return
    }

    if (item.school_bell_id != null) {
      map.set(`${date}:${Number(item.school_bell_id)}`, item)
    }
  })

  return map
})

const exceptionFor = (day, bell) => {
  const date = normalizeDate(day?.date)
  return exceptionIndex.value.get(`${date}:full`) || exceptionIndex.value.get(`${date}:${Number(bell?.id)}`) || null
}

const plannerLabel = computed(() =>
  `${props.selectedTeacher?.name || 'Teacher'} weekly availability planner`
)

const getStatusLabel = (status) =>
  statusOptions.find((item) => item.value === (status || 'available'))?.label || 'Available'

const statusIcon = (status) =>
  statusOptions.find((item) => item.value === (status || 'available'))?.icon || 'mdi-check'

const statusClass = (status) => `status-${status || 'available'}`
const isToday = (date) => normalizeDate(date) === new Date().toISOString().slice(0, 10)

const periodTime = (bell) => {
  const start = bell?.start_time ? formatTime(bell.start_time) : ''
  const end = bell?.end_time ? formatTime(bell.end_time) : ''
  return start && end ? `${start} - ${end}` : bell?.title || 'Time not set'
}

const availableAriaLabel = (day, bell) =>
  `${props.selectedTeacher?.name || 'Teacher'}, ${day.label} ${formatShortDate(day.date)}, period ${bell.period_number}: available. Activate to add an exception.`

const exceptionAriaLabel = (day, bell, exception) =>
  `${props.selectedTeacher?.name || 'Teacher'}, ${day.label} ${formatShortDate(day.date)}, period ${bell.period_number}: ${getStatusLabel(exception?.status)}${exception?.is_full_day ? ', full day' : ''}${exception?.reason ? `, ${exception.reason}` : ''}. Activate to edit.`

const exceptionTitle = (exception) =>
  [getStatusLabel(exception?.status), exception?.is_full_day ? 'Full Day' : null, exception?.reason, exception?.remarks]
    .filter(Boolean)
    .join(' · ')

const selectCell = (day, bell) => {
  if (!props.selectedTeacher) return
  emit('cell-selected', { teacher: props.selectedTeacher, day, bell })
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

  emit('cell-click', { teacher: props.selectedTeacher, day, bell })
}

const onExceptionClick = (event, day, bell, exception) => {
  if (event.shiftKey) {
    selectCell(day, bell)
    return
  }
  emit('exception-click', exception)
}

const onContextMenu = (event, exception) => {
  if (!exception) return
  window.getSelection()?.removeAllRanges()
  emit('exception-context', { event, exception })
}

const onDoubleClick = (exception) => {
  if (exception) emit('exception-quick-edit', exception)
}

const isSelected = (day, bell) =>
  props.selectedCells.some((item) =>
    Number(item.teacher?.id) === Number(props.selectedTeacher?.id) &&
    normalizeDate(item.day?.date) === normalizeDate(day.date) &&
    Number(item.bell?.id) === Number(bell.id)
  )

const onSelectionMouseDown = (day, bell, event) => {
  if (!props.selectedTeacher || event.target.closest('.exception-cell')) return

  event.preventDefault()
  window.getSelection()?.removeAllRanges()
  document.body.classList.add('teacher-planner-no-select')
  selectionStartCell.value = { day, bell }
  isMouseSelecting.value = true
  hasSelectionMoved.value = false
}

const onSelectionMouseEnter = (day, bell) => {
  if (!isMouseSelecting.value || !selectionStartCell.value || !props.selectedTeacher) return

  if (!hasSelectionMoved.value) {
    hasSelectionMoved.value = true
    emit('cell-selection-start', {
      teacher: props.selectedTeacher,
      day: selectionStartCell.value.day,
      bell: selectionStartCell.value.bell,
    })
  }

  emit('cell-selection-over', { teacher: props.selectedTeacher, day, bell })
}

const stopSelection = () => {
  if (!isMouseSelecting.value) return

  const moved = hasSelectionMoved.value
  if (moved) emit('cell-selection-end')

  isMouseSelecting.value = false
  selectionStartCell.value = null
  document.body.classList.remove('teacher-planner-no-select')

  window.setTimeout(() => {
    hasSelectionMoved.value = false
  }, moved ? 120 : 0)
}

const onDragStart = (event, exception) => {
  if (!exception || !event.dataTransfer) return

  window.getSelection()?.removeAllRanges()
  document.body.classList.add('teacher-planner-no-select', 'teacher-planner-dragging')
  event.dataTransfer.effectAllowed = event.ctrlKey ? 'copy' : 'move'
  event.dataTransfer.setData('exception_id', String(exception.id))
  event.dataTransfer.setData('drag_mode', event.ctrlKey ? 'copy' : 'move')

  const ghost = document.createElement('div')
  ghost.className = 'teacher-drag-ghost'
  ghost.textContent = `${getStatusLabel(exception.status)} · ${exception.reason || 'Teacher exception'}`
  document.body.appendChild(ghost)
  event.dataTransfer.setDragImage(ghost, 12, 12)
  requestAnimationFrame(() => ghost.remove())
}

const onDragEnd = () => {
  activeDropKey.value = null
  document.body.classList.remove('teacher-planner-no-select', 'teacher-planner-dragging')
}

const clearActiveDrop = (day, bell) => {
  if (activeDropKey.value === cellKey(day, bell)) activeDropKey.value = null
}

const onDrop = (event, day, bell) => {
  activeDropKey.value = null
  const exceptionId = event.dataTransfer?.getData('exception_id')
  const dragMode = event.dataTransfer?.getData('drag_mode') || 'move'
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

if (typeof window !== 'undefined') window.addEventListener('mouseup', stopSelection)

onBeforeUnmount(() => {
  window.removeEventListener('mouseup', stopSelection)
  document.body.classList.remove('teacher-planner-no-select', 'teacher-planner-dragging')
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
  background: linear-gradient(90deg, rgba(var(--v-theme-primary), 0.035), transparent 18%), rgb(var(--v-theme-surface));
}

.empty-state {
  height: 100%;
  display: grid;
  place-content: center;
  text-align: center;
  padding: 32px;
}

.day-header-row,
.period-grid-row {
  display: grid;
  grid-template-columns: 120px repeat(7, minmax(132px, 1fr));
  min-width: 1050px;
}

.day-header-row {
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

.period-head,
.period-info {
  position: sticky;
  left: 0;
  background: rgb(var(--v-theme-surface));
  border-right: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.period-head { z-index: 4; font-weight: 700; }
.day-head { align-items: center; color: rgba(var(--v-theme-on-surface), 0.86); }
.day-head span,
.period-info span { font-size: 12px; color: rgba(var(--v-theme-on-surface), 0.62); }
.day-head.today { color: rgb(var(--v-theme-primary)); box-shadow: inset 0 -3px 0 rgb(var(--v-theme-primary)); }
.current-date-column { background: rgba(var(--v-theme-primary), 0.055); }
.today-chip { vertical-align: middle; font-size: 10px; height: 18px; }

.period-grid-row { min-height: 68px; }
.period-info { padding: 10px 14px; z-index: 2; border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08); }
.period-info strong { display: block; }

.drop-zone {
  min-height: 68px;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.06);
  border-left: 1px solid rgba(var(--v-theme-on-surface), 0.04);
  position: relative;
}

.drop-zone:hover { background: rgba(var(--v-theme-primary), 0.08); }
.drop-zone.selected { background: rgba(var(--v-theme-primary), 0.16); box-shadow: inset 0 0 0 2px rgba(var(--v-theme-primary), 0.55); }
.drop-zone.dropping { background: rgba(var(--v-theme-primary), 0.18); box-shadow: inset 0 0 0 2px rgba(var(--v-theme-primary), 0.72); }

.availability-cell {
  width: calc(100% - 16px);
  margin: 8px;
  border-radius: 12px;
  padding: 9px 10px;
  min-height: 48px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 12px;
  border: 1px solid transparent;
  text-align: left;
  transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
}

.exception-cell { cursor: grab; }
.exception-cell:active { cursor: grabbing; }
.availability-cell:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(var(--v-theme-on-surface), 0.12); }
.availability-cell:focus-visible { outline: 2px solid rgba(var(--v-theme-primary), 0.7); outline-offset: 2px; }
.availability-cell strong { display: block; font-size: 12px; }
.availability-cell small { display: block; font-size: 11px; line-height: 1.2; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100px; }

.status-available { background: rgba(var(--v-theme-success), 0.14); color: rgb(var(--v-theme-success)); border-color: rgba(var(--v-theme-success), 0.22); }
.status-busy,
.status-assembly { background: rgba(var(--v-theme-warning), 0.15); color: rgb(var(--v-theme-warning)); border-color: rgba(var(--v-theme-warning), 0.3); }
.status-leave,
.status-blocked { background: rgba(var(--v-theme-error), 0.15); color: rgb(var(--v-theme-error)); border-color: rgba(var(--v-theme-error), 0.3); }
.status-meeting,
.status-training { background: rgba(126, 87, 194, 0.17); color: rgb(126, 87, 194); border-color: rgba(126, 87, 194, 0.32); }
.status-extra_class,
.status-exam_duty { background: rgba(var(--v-theme-info), 0.15); color: rgb(var(--v-theme-info)); border-color: rgba(var(--v-theme-info), 0.3); }

:global(.teacher-planner-no-select),
:global(.teacher-planner-no-select *) { user-select: none !important; -webkit-user-select: none !important; }
:global(.teacher-planner-dragging),
:global(.teacher-planner-dragging *) { cursor: grabbing !important; }
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

@media (max-width: 960px) {
  .schedule-panel,
  .schedule-scroll { height: 500px; }
}

@media (prefers-reduced-motion: reduce) {
  .availability-cell { transition: none; }
  .availability-cell:hover { transform: none; }
}
</style>
