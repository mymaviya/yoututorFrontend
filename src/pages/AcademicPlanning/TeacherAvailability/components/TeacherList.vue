<template>
  <div class="teacher-panel">
    <div class="teacher-panel-header">
      <strong>Teachers</strong>
      <strong>Periods</strong>
    </div>

    <div class="teacher-scroll">
      <div
        v-for="teacher in teachers"
        :key="teacher.id"
        class="teacher-row"
        :class="{ active: selectedTeacher?.id === teacher.id }"
        @click="$emit('update:selectedTeacher', teacher)"
      >
        <v-avatar color="primary" variant="tonal" size="44">
          {{ initials(teacher.name) }}
        </v-avatar>

        <div class="flex-grow-1 min-w-0">
          <div class="font-weight-bold text-truncate">{{ teacher.name }}</div>
          <div class="text-caption text-medium-emphasis text-truncate">
            {{ teacher.email || teacher.subject || 'Teacher' }}
          </div>
        </div>

        <div class="exception-count" :class="{ clear: teacherExceptionCount(teacher.id) === 0 }">
          <strong>{{ teacherExceptionCount(teacher.id) }}</strong>
          <span>{{ teacherExceptionCount(teacher.id) === 1 ? 'Exception' : 'Exceptions' }}</span>
        </div>
      </div>

      <div v-if="!teachers.length" class="pa-5 text-center text-medium-emphasis">
        No teachers found.
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  teachers: { type: Array, default: () => [] },
  exceptions: { type: Array, default: () => [] },
  selectedTeacher: { type: Object, default: null },
})

defineEmits(['update:selectedTeacher'])

const teacherExceptionCount = (teacherId) => {
  return props.exceptions.filter((item) => Number(item.teacher_id) === Number(teacherId)).length
}

const initials = (name) => {
  return String(name || '')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
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
  min-height: 78px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 18px;
  cursor: pointer;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  transition: 0.18s ease;
}

.teacher-row:hover {
  background: rgba(var(--v-theme-primary), 0.06);
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
</style>
