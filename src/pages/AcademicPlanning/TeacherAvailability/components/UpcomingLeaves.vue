<template>
  <v-card class="bottom-card" rounded="xl">
    <v-card-title class="card-header">
      <div class="d-flex align-center ga-2">
        <v-avatar color="error" variant="tonal" size="36">
          <v-icon size="20">mdi-calendar-remove-outline</v-icon>
        </v-avatar>

        <div>
          <div class="text-subtitle-1 font-weight-bold">Upcoming Leaves</div>
          <div class="text-caption text-medium-emphasis">
            {{ leaveSummary }}
          </div>
        </div>
      </div>

      <v-btn
        variant="text"
        color="primary"
        append-icon="mdi-arrow-right"
        :disabled="!upcomingLeaves.length"
        aria-label="View all teacher leaves"
        @click="emit('view-all')"
      >
        View All
      </v-btn>
    </v-card-title>

    <v-divider />

    <v-card-text>
      <div
        v-if="upcomingLeaves.length"
        class="leave-strip"
        role="list"
        aria-label="Upcoming teacher leave records"
      >
        <article
          v-for="leave in upcomingLeaves"
          :key="leave.id || leaveKey(leave)"
          class="leave-item"
          role="listitem"
        >
          <v-avatar color="error" variant="tonal" size="44" class="flex-shrink-0">
            <span class="text-caption font-weight-bold">
              {{ teacherInitials(leave.teacher?.name) }}
            </span>
          </v-avatar>

          <div class="leave-content">
            <div class="d-flex align-center justify-space-between ga-2">
              <strong class="text-body-2 text-truncate">
                {{ leave.teacher?.name || 'Unknown Teacher' }}
              </strong>

              <v-chip
                size="x-small"
                color="error"
                variant="tonal"
                class="flex-shrink-0"
              >
                {{ leave.is_full_day ? 'Full Day' : periodLabel(leave) }}
              </v-chip>
            </div>

            <div class="text-caption text-medium-emphasis mt-1">
              <v-icon size="14" class="mr-1">mdi-calendar-outline</v-icon>
              <time :datetime="leave.exception_date">
                {{ formatDate(leave.exception_date) }}
              </time>
              <span v-if="relativeDateLabel(leave.exception_date)" class="ml-1">
                · {{ relativeDateLabel(leave.exception_date) }}
              </span>
            </div>

            <div class="text-caption leave-reason mt-1">
              {{ leave.reason?.trim() || 'Leave' }}
            </div>
          </div>
        </article>
      </div>

      <v-alert
        v-else
        type="success"
        variant="tonal"
        density="comfortable"
        icon="mdi-calendar-check-outline"
      >
        <div class="font-weight-medium">No upcoming leaves</div>
        <div class="text-caption mt-1">
          No active teacher leave exceptions are scheduled from today onward.
        </div>
      </v-alert>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import { formatDate } from '../../../../utils/date'

const props = defineProps({
  leaves: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['view-all'])

const toDateKey = (value) => {
  if (!value) return ''

  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10)
}

const todayKey = computed(() => {
  const now = new Date()
  const localDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return localDate.toISOString().slice(0, 10)
})

const upcomingLeaves = computed(() =>
  props.leaves
    .filter((leave) => {
      const date = toDateKey(leave?.exception_date)
      return leave?.is_active !== false && date && date >= todayKey.value
    })
    .sort((first, second) =>
      String(first.exception_date).localeCompare(String(second.exception_date))
    )
)

const leaveSummary = computed(() => {
  const count = upcomingLeaves.value.length
  return count ? `${count} scheduled leave${count === 1 ? '' : 's'}` : 'No leave scheduled'
})

const teacherInitials = (name) => {
  if (!name) return 'NA'

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'NA'
}

const periodLabel = (leave) => {
  const period = leave?.school_bell?.period_number ?? leave?.bell?.period_number
  return period ? `Period ${period}` : 'Partial Day'
}

const relativeDateLabel = (value) => {
  const dateKey = toDateKey(value)
  if (!dateKey) return ''

  const date = new Date(`${dateKey}T00:00:00`)
  const today = new Date(`${todayKey.value}T00:00:00`)
  const difference = Math.round((date.getTime() - today.getTime()) / 86400000)

  if (difference === 0) return 'Today'
  if (difference === 1) return 'Tomorrow'
  if (difference > 1 && difference <= 7) return `In ${difference} days`
  return ''
}

const leaveKey = (leave) =>
  [leave?.teacher_id, leave?.exception_date, leave?.school_bell_id || 'full-day']
    .filter(Boolean)
    .join('-')
</script>

<style scoped>
.bottom-card {
  height: 100%;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  box-shadow: 0 10px 28px rgba(var(--v-theme-on-surface), 0.08);
}

.card-header {
  min-height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
}

.leave-strip {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(240px, 1fr);
  overflow-x: auto;
  gap: 10px;
  padding-bottom: 4px;
  scroll-snap-type: x proximity;
  scrollbar-width: thin;
}

.leave-item {
  min-width: 0;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  border-radius: 14px;
  background: rgba(var(--v-theme-error), 0.04);
  scroll-snap-align: start;
}

.leave-content {
  min-width: 0;
  flex: 1;
}

.leave-reason {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

@media (max-width: 600px) {
  .card-header {
    align-items: flex-start;
  }

  .leave-strip {
    grid-auto-columns: minmax(220px, 88%);
  }
}
</style>
