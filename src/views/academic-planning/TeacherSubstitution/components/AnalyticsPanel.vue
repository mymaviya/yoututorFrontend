<template>
  <v-row>
    <v-col cols="12" lg="4">
      <v-card rounded="xl" class="analytics-card h-100">
        <v-card-title class="d-flex align-center justify-space-between">
          <span class="text-subtitle-1 font-weight-bold">AI Performance</span>
          <v-icon color="primary">mdi-robot-outline</v-icon>
        </v-card-title>

        <v-card-text>
          <div class="d-flex align-center justify-space-between mb-2">
            <span class="text-body-2 text-medium-emphasis">Average Score</span>
            <strong>{{ ai.average_score || 0 }}%</strong>
          </div>

          <v-progress-linear
            :model-value="Number(ai.average_score || 0)"
            height="12"
            rounded
            color="primary"
            class="mb-4"
          />

          <div class="analytics-mini-grid">
            <div>
              <div class="text-h6 font-weight-bold">{{ ai.auto_assigned || 0 }}</div>
              <div class="text-caption text-medium-emphasis">Auto Assigned</div>
            </div>

            <div>
              <div class="text-h6 font-weight-bold">{{ ai.manual_assigned || 0 }}</div>
              <div class="text-caption text-medium-emphasis">Manual Assigned</div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" lg="4">
      <v-card rounded="xl" class="analytics-card h-100">
        <v-card-title class="text-subtitle-1 font-weight-bold">
          Teacher Load
        </v-card-title>

        <v-card-text>
          <div
            v-for="item in teacherLoad"
            :key="item.teacher?.id || item.teacher?.name"
            class="mb-4"
          >
            <div class="d-flex justify-space-between mb-1">
              <span class="font-weight-medium">{{ item.teacher?.name || '-' }}</span>
              <span class="text-caption text-medium-emphasis">{{ item.total }} duties</span>
            </div>

            <v-progress-linear
              :model-value="percentage(item.total, maxTeacherLoad)"
              height="10"
              rounded
              color="primary"
            />
          </div>

          <v-alert
            v-if="!teacherLoad.length"
            type="info"
            variant="tonal"
          >
            No teacher workload data available.
          </v-alert>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" lg="4">
      <v-card rounded="xl" class="analytics-card h-100">
        <v-card-title class="text-subtitle-1 font-weight-bold">
          Subject Analysis
        </v-card-title>

        <v-card-text>
          <div
            v-for="item in subjectAnalysis"
            :key="item.subject?.id || item.subject?.name"
            class="mb-4"
          >
            <div class="d-flex justify-space-between mb-1">
              <span class="font-weight-medium">{{ item.subject?.name || '-' }}</span>
              <span class="text-caption text-medium-emphasis">{{ item.total }}</span>
            </div>

            <v-progress-linear
              :model-value="percentage(item.total, maxSubjectTotal)"
              height="10"
              rounded
              color="deep-purple"
            />
          </div>

          <v-alert
            v-if="!subjectAnalysis.length"
            type="info"
            variant="tonal"
          >
            No subject analytics available.
          </v-alert>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" lg="6">
      <v-card rounded="xl" class="analytics-card h-100">
        <v-card-title class="text-subtitle-1 font-weight-bold">
          Monthly Trend
        </v-card-title>

        <v-card-text>
          <div
            v-for="item in normalizedMonthlyTrend"
            :key="item.month"
            class="month-row"
          >
            <div class="month-label">{{ item.label }}</div>

            <v-progress-linear
              :model-value="percentage(item.total, maxMonthlyTotal)"
              height="10"
              rounded
              color="info"
              class="flex-grow-1"
            />

            <div class="month-value">{{ item.total }}</div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" lg="6">
      <v-card rounded="xl" class="analytics-card h-100">
        <v-card-title class="text-subtitle-1 font-weight-bold">
          Weekday Heatmap
        </v-card-title>

        <v-card-text>
          <div class="weekday-grid">
            <div
              v-for="item in normalizedWeekdays"
              :key="item.weekday"
              class="weekday-box"
              :class="{ active: item.total > 0 }"
            >
              <div class="text-caption text-medium-emphasis">{{ item.short }}</div>
              <div class="text-h6 font-weight-bold">{{ item.total }}</div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  analytics: {
    type: Object,
    default: () => ({}),
  },
})

const ai = computed(() => props.analytics?.ai || {})
const teacherLoad = computed(() => props.analytics?.teacher_load || [])
const subjectAnalysis = computed(() => props.analytics?.subject_analysis || [])
const monthlyTrend = computed(() => props.analytics?.monthly_trend || [])
const weekdayHeatmap = computed(() => props.analytics?.weekday_heatmap || [])

const maxTeacherLoad = computed(() => Math.max(...teacherLoad.value.map((item) => Number(item.total || 0)), 1))
const maxSubjectTotal = computed(() => Math.max(...subjectAnalysis.value.map((item) => Number(item.total || 0)), 1))
const maxMonthlyTotal = computed(() => Math.max(...monthlyTrend.value.map((item) => Number(item.total || 0)), 1))

const months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

const normalizedMonthlyTrend = computed(() => {
  return months.map((label, index) => {
    const found = monthlyTrend.value.find((item) => Number(item.month) === index + 1)

    return {
      month: index + 1,
      label,
      total: Number(found?.total || 0),
    }
  })
})

const weekdays = [
  { label: 'Monday', short: 'Mon' },
  { label: 'Tuesday', short: 'Tue' },
  { label: 'Wednesday', short: 'Wed' },
  { label: 'Thursday', short: 'Thu' },
  { label: 'Friday', short: 'Fri' },
  { label: 'Saturday', short: 'Sat' },
]

const normalizedWeekdays = computed(() => {
  return weekdays.map((day) => {
    const found = weekdayHeatmap.value.find((item) => {
      return String(item.weekday || '').toLowerCase() === day.label.toLowerCase()
    })

    return {
      ...day,
      weekday: day.label,
      total: Number(found?.total || 0),
    }
  })
})

const percentage = (value, max) => {
  return max > 0 ? Math.min((Number(value || 0) / max) * 100, 100) : 0
}
</script>

<style scoped>
.analytics-card {
  border: 1px solid rgba(var(--v-border-color), 0.14);
  background: rgb(var(--v-theme-surface));
}

.analytics-mini-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.analytics-mini-grid > div {
  padding: 12px;
  border-radius: 14px;
  background: rgba(var(--v-theme-primary), 0.06);
}

.month-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.month-label {
  width: 34px;
  font-size: 12px;
  color: rgba(var(--v-theme-on-surface), 0.7);
}

.month-value {
  width: 28px;
  text-align: right;
  font-size: 12px;
  font-weight: 700;
}

.weekday-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
}

.weekday-box {
  min-height: 82px;
  border-radius: 16px;
  border: 1px solid rgba(var(--v-border-color), 0.14);
  display: grid;
  place-items: center;
  text-align: center;
  background: rgba(var(--v-theme-on-surface), 0.035);
}

.weekday-box.active {
  background: rgba(var(--v-theme-primary), 0.1);
  border-color: rgba(var(--v-theme-primary), 0.35);
}

@media (max-width: 700px) {
  .weekday-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
