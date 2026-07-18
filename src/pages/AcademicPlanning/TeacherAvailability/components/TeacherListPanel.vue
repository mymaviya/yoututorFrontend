<template>
  <div class="teacher-panel">
    <div class="teacher-panel-header">
      <strong>Teachers</strong>
      <strong>Periods</strong>
    </div>

    <div class="teacher-list-scroll">
      <div
        v-for="teacher in teachers"
        :key="teacher.id"
        class="teacher-row"
        :class="{ active: selectedTeacher?.id === teacher.id }"
        @click="$emit('select', teacher)"
      >
        <v-avatar color="primary" variant="tonal" size="44">
          {{ initials(teacher.name) }}
        </v-avatar>

        <div class="flex-grow-1 overflow-hidden">
          <div class="font-weight-bold text-truncate">
            {{ teacher.name }}
          </div>
          <div class="text-caption text-medium-emphasis text-truncate">
            {{ teacher.email || teacher.subject_name || 'Teacher' }}
          </div>
        </div>

        <div
          class="exception-count"
          :class="countClass(exceptionCount(teacher.id))"
        >
          <strong>{{ exceptionCount(teacher.id) }}</strong>
          <span>{{ exceptionCount(teacher.id) === 1 ? 'Exception' : 'Exceptions' }}</span>
        </div>
      </div>

      <div v-if="!teachers.length" class="empty-teachers">
        No teachers found.
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  teachers: {
    type: Array,
    default: () => [],
  },
  selectedTeacher: {
    type: Object,
    default: null,
  },
  exceptionCount: {
    type: Function,
    required: true,
  },
})

defineEmits(['select'])

const initials = (name) => {
  return String(name || '')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

const countClass = (count) => {
  if (count === 0) return 'good'
  if (count <= 2) return 'warning'
  return 'danger'
}
</script>

<style scoped>
.teacher-panel {
  height: 100%;
  border-right: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  display: flex;
  flex-direction: column;
  min-width: 300px;
  user-select: none;
}

.teacher-panel-header {
  height: 64px;
  min-height: 64px;
  display: grid;
  grid-template-columns: 1fr 80px;
  align-items: center;
  padding: 0 18px;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  background: rgb(var(--v-theme-surface));
}

.teacher-list-scroll {
  height: calc(100% - 64px);
  overflow-y: auto;
  scrollbar-width: thin;
}

.teacher-row {
  min-height: 76px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 18px;
  cursor: pointer;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  transition: all 0.18s ease;
}

.teacher-row:hover {
  background: rgba(var(--v-theme-primary), 0.06);
}

.teacher-row.active {
  background: rgba(var(--v-theme-primary), 0.12);
  border-left: 4px solid rgb(var(--v-theme-primary));
  padding-left: 14px;
}

.exception-count {
  text-align: right;
  font-size: 11px;
  min-width: 72px;
}

.exception-count strong {
  display: block;
  font-size: 16px;
}

.exception-count.good {
  color: rgb(var(--v-theme-success));
}

.exception-count.warning {
  color: rgb(var(--v-theme-warning));
}

.exception-count.danger {
  color: rgb(var(--v-theme-error));
}

.empty-teachers {
  padding: 24px;
  text-align: center;
  color: rgba(var(--v-theme-on-surface), 0.62);
}
</style>
