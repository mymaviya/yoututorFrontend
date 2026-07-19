<template>
  <div class="teacher-panel">
    <div class="teacher-panel-header">
      <strong>Teachers</strong>
      <strong>Exceptions</strong>
    </div>

    <div class="teacher-scroll" role="listbox" aria-label="Teacher availability list">
      <button
        v-for="teacher in teachers"
        :key="teacher.id"
        type="button"
        class="teacher-row"
        :class="{ active: isSelected(teacher) }"
        :aria-selected="isSelected(teacher)"
        :aria-label="teacherAriaLabel(teacher)"
        role="option"
        @click="selectTeacher(teacher)"
      >
        <v-avatar color="primary" variant="tonal" size="44" aria-hidden="true">
          {{ initials(teacher.name) }}
        </v-avatar>

        <div class="flex-grow-1 min-w-0 text-left">
          <div class="font-weight-bold text-truncate">
            {{ teacher.name || 'Unnamed Teacher' }}
          </div>
          <div class="text-caption text-medium-emphasis text-truncate">
            {{ teacher.email || teacher.subject || 'Teacher' }}
          </div>
        </div>

        <div class="exception-count" :class="{ clear: exceptionCount(teacher.id) === 0 }">
          <strong>{{ exceptionCount(teacher.id) }}</strong>
          <span>{{ exceptionCountLabel(teacher.id) }}</span>
        </div>
      </button>

      <div v-if="!teachers.length" class="empty-state">
        <v-icon size="34" class="mb-2">mdi-account-search-outline</v-icon>
        <div class="font-weight-medium">No teachers found</div>
        <div class="text-caption text-medium-emphasis">
          Try changing the search text or filters.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  teachers: { type: Array, default: () => [] },
  exceptions: { type: Array, default: () => [] },
  selectedTeacher: { type: Object, default: null },
})

const emit = defineEmits(['update:selectedTeacher'])

const exceptionCounts = computed(() => {
  return props.exceptions.reduce((counts, item) => {
    const teacherId = Number(item?.teacher_id)

    if (!Number.isFinite(teacherId)) return counts

    counts.set(teacherId, (counts.get(teacherId) || 0) + 1)
    return counts
  }, new Map())
})

const exceptionCount = (teacherId) => {
  return exceptionCounts.value.get(Number(teacherId)) || 0
}

const exceptionCountLabel = (teacherId) => {
  return exceptionCount(teacherId) === 1 ? 'Exception' : 'Exceptions'
}

const isSelected = (teacher) => {
  return Number(props.selectedTeacher?.id) === Number(teacher?.id)
}

const selectTeacher = (teacher) => {
  if (!teacher?.id || isSelected(teacher)) return
  emit('update:selectedTeacher', teacher)
}

const teacherAriaLabel = (teacher) => {
  const count = exceptionCount(teacher?.id)
  const label = count === 1 ? 'exception' : 'exceptions'
  return `${teacher?.name || 'Unnamed teacher'}, ${count} ${label}`
}

const initials = (name) => {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (!parts.length) return 'T'

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
}
</script>

<style scoped>
.teacher-panel {
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  border-right: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  height: 560px;
  display: flex;
  flex-direction: column;
  user-select: none;
}

.teacher-panel-header {
  height: 64px;
  display: grid;
  grid-template-columns: 1fr 88px;
  align-items: center;
  padding: 0 18px;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  flex: 0 0 auto;
  background: rgb(var(--v-theme-surface));
}

.teacher-scroll {
  overflow-y: auto;
  height: calc(560px - 64px);
  scrollbar-width: thin;
}

.teacher-row {
  width: 100%;
  min-height: 78px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 18px;
  cursor: pointer;
  border: 0;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: inherit;
  transition: background-color 0.18s ease, box-shadow 0.18s ease;
}

.teacher-row:hover {
  background: rgba(var(--v-theme-primary), 0.06);
}

.teacher-row:focus-visible {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: -2px;
}

.teacher-row.active {
  background: rgba(var(--v-theme-primary), 0.12);
  box-shadow: inset 4px 0 0 rgb(var(--v-theme-primary));
}

.exception-count {
  min-width: 72px;
  text-align: right;
  font-size: 11px;
  color: rgb(var(--v-theme-warning));
}

.exception-count.clear {
  color: rgb(var(--v-theme-success));
}

.exception-count strong {
  display: block;
  font-size: 16px;
}

.empty-state {
  min-height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  text-align: center;
  color: rgb(var(--v-theme-on-surface));
}

.text-left {
  text-align: left;
}

.min-w-0 {
  min-width: 0;
}

@media (max-width: 960px) {
  .teacher-panel {
    height: 320px;
    border-right: none;
    border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  }

  .teacher-scroll {
    height: calc(320px - 64px);
  }
}

@media (max-width: 600px) {
  .teacher-panel-header,
  .teacher-row {
    padding-left: 14px;
    padding-right: 14px;
  }

  .teacher-panel-header {
    grid-template-columns: 1fr 72px;
  }

  .exception-count {
    min-width: 62px;
  }
}
</style>
