<script setup>
const props = defineProps({
  days: { type: Array, default: () => [] },
  periods: { type: Array, default: () => [] },
  entries: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  emptyMessage: { type: String, default: 'No timetable entries found.' },
})

const dayName = day => typeof day === 'string'
  ? day
  : (day?.name ?? day?.label ?? day?.value ?? '')

const periodId = period => Number(period?.id ?? period?.school_bell_id ?? period?.value)

const entryFor = (day, period) => props.entries.find(entry => (
  String(entry.weekday ?? entry.day_name ?? entry.day ?? '').toLowerCase() === String(dayName(day)).toLowerCase()
  && Number(entry.school_bell_id ?? entry.bell_id ?? entry.period_id) === periodId(period)
))

const periodTitle = (period, index) => (
  period?.name
  ?? period?.title
  ?? period?.label
  ?? `Period ${period?.period_no ?? period?.sort_order ?? index + 1}`
)

const formatTime = value => value ? String(value).slice(0, 5) : ''

const classLabel = entry => [
  entry?.grade?.name ?? entry?.grade_name,
  entry?.section?.name ?? entry?.section_name,
  entry?.stream?.name ?? entry?.stream_name,
].filter(Boolean).join(' - ')

const roomLabel = entry => (
  entry?.room_no
  ?? entry?.timetable_entry?.room_no
  ?? entry?.room
  ?? entry?.classroom
)

const substitutionData = entry => entry?.timetable_entry ?? entry?.timetableEntry ?? entry

const isSubstitution = entry => {
  const source = substitutionData(entry)
  return Boolean(source?.is_substitution || source?.substitute_teacher_id)
}

const substituteTeacherName = entry => {
  const source = substitutionData(entry)
  return source?.substitute_teacher?.name
    ?? source?.substituteTeacher?.name
    ?? entry?.substitute_teacher?.name
    ?? entry?.substituteTeacher?.name
    ?? ''
}
</script>

<template>
  <v-card rounded="xl" border>
    <v-card-title class="px-5 py-4 d-flex align-center ga-2">
      <v-icon icon="mdi-calendar-week" color="primary" />
      Weekly Timetable
    </v-card-title>

    <v-divider />

    <v-card-text v-if="loading">
      <v-skeleton-loader type="table" />
    </v-card-text>

    <v-card-text
      v-else-if="!days.length || !periods.length"
      class="text-center py-12"
    >
      <v-icon icon="mdi-calendar-blank-outline" size="48" class="mb-3" />
      <div class="text-body-1">{{ emptyMessage }}</div>
    </v-card-text>

    <div v-else class="table-wrap">
      <table class="timetable-table">
        <thead>
          <tr>
            <th>Period</th>
            <th v-for="day in days" :key="dayName(day)">
              {{ dayName(day) }}
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(period, index) in periods" :key="periodId(period) || index">
            <th>
              <div>{{ periodTitle(period, index) }}</div>
              <small>
                {{ formatTime(period.start_time) }}
                <span v-if="period.end_time"> - {{ formatTime(period.end_time) }}</span>
              </small>
            </th>

            <td v-for="day in days" :key="dayName(day)">
              <template v-if="entryFor(day, period)">
                <v-sheet
                  rounded="lg"
                  class="pa-3 timetable-entry"
                  :color="isSubstitution(entryFor(day, period)) ? 'warning-container' : 'primary-container'"
                >
                  <div class="font-weight-bold">
                    {{ entryFor(day, period).subject?.name ?? entryFor(day, period).subject_name ?? 'Assigned Class' }}
                  </div>

                  <div
                    v-if="classLabel(entryFor(day, period))"
                    class="text-caption"
                  >
                    {{ classLabel(entryFor(day, period)) }}
                  </div>

                  <div
                    v-if="roomLabel(entryFor(day, period))"
                    class="text-caption"
                  >
                    Room: {{ roomLabel(entryFor(day, period)) }}
                  </div>

                  <v-chip
                    v-if="isSubstitution(entryFor(day, period))"
                    size="x-small"
                    color="warning"
                    variant="tonal"
                    class="mt-2"
                  >
                    Substitution<span v-if="substituteTeacherName(entryFor(day, period))">: {{ substituteTeacherName(entryFor(day, period)) }}</span>
                  </v-chip>
                </v-sheet>
              </template>

              <span v-else class="text-caption text-medium-emphasis">Free</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </v-card>
</template>

<style scoped>
.table-wrap {
  overflow: auto;
}

.timetable-table {
  width: 100%;
  min-width: 900px;
  border-collapse: collapse;
}

.timetable-table th,
.timetable-table td {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  padding: 12px;
  vertical-align: top;
}

.timetable-table thead th {
  position: sticky;
  top: 0;
  z-index: 1;
  background: rgb(var(--v-theme-surface-variant));
}

.timetable-table tbody th {
  min-width: 150px;
  background: rgb(var(--v-theme-surface));
}

.timetable-entry {
  min-height: 82px;
}

@media print {
  .table-wrap {
    overflow: visible;
  }

  .timetable-table {
    min-width: 0;
    font-size: 10px;
  }

  .timetable-table th,
  .timetable-table td {
    padding: 6px;
  }
}
</style>
