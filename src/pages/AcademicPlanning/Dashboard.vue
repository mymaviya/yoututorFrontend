<script setup>
import { computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAcademicPlanningStore } from '../../stores/academicPlanning'
import { useAppStore } from '../../stores/app'
import { useUIStore } from '../../stores/snackBar'

const router = useRouter()
const store = useAcademicPlanningStore()
const appStore = useAppStore()
const ui = useUIStore()

const selectedAcademicYearId = computed(() => appStore.selectedAcademicYearId)
const selectedAcademicYear = computed(() => appStore.selectedAcademicYear)
const hasAcademicYear = computed(() => Boolean(selectedAcademicYearId.value))
const checks = computed(() => store.readiness?.checks || {})

const summaryCards = computed(() => [
  {
    label: 'Setup Readiness',
    value: `${store.overallScore}%`,
    icon: 'mdi-progress-check',
    color: store.overallScore >= 80 ? 'success' : store.overallScore >= 50 ? 'warning' : 'error',
  },
  {
    label: 'Published Timetables',
    value: store.publishedCount,
    icon: 'mdi-calendar-check',
    color: 'success',
  },
  {
    label: 'Draft Timetables',
    value: store.draftCount,
    icon: 'mdi-calendar-edit',
    color: 'info',
  },
  {
    label: 'Active Generations',
    value: store.activeRuns.length,
    icon: 'mdi-cog-sync',
    color: store.activeRuns.length ? 'warning' : 'primary',
  },
  {
    label: 'Live Conflicts',
    value: store.conflictCount,
    icon: 'mdi-alert-octagon-outline',
    color: store.conflictCount ? 'error' : 'success',
  },
  {
    label: 'Teachers Scheduled',
    value: store.teacherCount,
    icon: 'mdi-account-school',
    color: 'primary',
  },
])

const setupActions = [
  {
    title: 'Subject Allocation',
    description: 'Set weekly periods, teachers and subject preferences.',
    icon: 'mdi-book-clock-outline',
    color: 'primary',
    route: 'subject.allocation',
    requiresSession: true,
  },
  {
    title: 'Teacher Availability',
    description: 'Configure available and blocked teaching periods.',
    icon: 'mdi-calendar-account-outline',
    color: 'info',
    route: 'teacher.availability',
    requiresSession: true,
  },
  {
    title: 'Teacher Timetable',
    description: 'Review the current timetable teacher-wise.',
    icon: 'mdi-account-clock-outline',
    color: 'success',
    route: 'teacher.timetable',
    requiresSession: true,
  },
  {
    title: 'Teacher Substitution',
    description: 'Manage temporary teacher replacements.',
    icon: 'mdi-account-switch-outline',
    color: 'warning',
    route: 'teacher.substitution',
    requiresSession: true,
  },
  {
    title: 'Bell Schedule',
    description: 'Maintain teaching periods, breaks and dispersal.',
    icon: 'mdi-bell-ring-outline',
    color: 'secondary',
    route: 'bell.schedules',
    requiresSession: false,
  },
]

const statusColor = (status) => ({
  published: 'success',
  completed: 'success',
  running: 'info',
  queued: 'warning',
  partial: 'warning',
  draft: 'info',
  archived: 'grey',
  failed: 'error',
  cancelled: 'grey',
}[status] || 'primary')

const formatDate = (value) => {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

const timetableClass = (item) => {
  const parts = [
    item.grade?.name,
    item.section?.display_name || item.section?.name,
    item.stream?.name,
  ].filter(Boolean)

  return parts.join(' · ') || item.name || 'Timetable'
}

const loadDashboard = async ({ silent = false } = {}) => {
  await store.fetchDashboard({
    silent,
    academicYearId: selectedAcademicYearId.value,
  })
}

const go = (action) => {
  if (action.requiresSession && !hasAcademicYear.value) {
    ui.showSnackbar('Select an academic session from the app bar first.', 'warning')
    return
  }

  if (!router.hasRoute(action.route)) {
    ui.showSnackbar('This screen is not available yet.', 'warning')
    return
  }

  router.push({ name: action.route })
}

const refresh = async () => {
  if (!hasAcademicYear.value) {
    ui.showSnackbar('Select an academic session from the app bar first.', 'warning')
    return
  }

  await loadDashboard({ silent: true })
  ui.showSnackbar('Academic Planning dashboard refreshed.')
}

const cancelRun = async (run) => {
  try {
    await store.cancelGenerationRun(run.id)
    ui.showSnackbar('Generation cancellation requested.')
  } catch (error) {
    ui.showSnackbar(error.response?.data?.message || 'Unable to cancel generation.', 'error')
  }
}

const retryRun = async (run) => {
  try {
    await store.retryGenerationRun(run.id)
    ui.showSnackbar('Generation retry queued.')
  } catch (error) {
    ui.showSnackbar(error.response?.data?.message || 'Unable to retry generation.', 'error')
  }
}

watch(selectedAcademicYearId, async () => {
  await loadDashboard()
})

watch(() => appStore.refreshKey, async () => {
  if (hasAcademicYear.value) await loadDashboard({ silent: true })
})

onMounted(loadDashboard)
</script>

<template>
  <div>
    <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-6">
      <div>
        <div class="d-flex align-center ga-2 mb-1 flex-wrap">
          <v-avatar color="primary" variant="tonal" size="42">
            <v-icon>mdi-calendar-school</v-icon>
          </v-avatar>
          <h1 class="text-h5 font-weight-bold">Academic Planning & Timetable</h1>
          <v-chip
            :color="hasAcademicYear ? 'primary' : 'warning'"
            variant="tonal"
            size="small"
            prepend-icon="mdi-calendar-range"
          >
            {{ selectedAcademicYear?.name || 'No session selected' }}
          </v-chip>
        </div>
        <p class="text-body-2 text-medium-emphasis mb-0">
          Monitor setup readiness, timetable lifecycle, generation progress and conflicts for the selected session.
        </p>
      </div>

      <v-btn
        color="primary"
        variant="tonal"
        prepend-icon="mdi-refresh"
        :loading="store.loading || store.refreshing"
        :disabled="!hasAcademicYear"
        @click="refresh"
      >
        Refresh
      </v-btn>
    </div>

    <v-alert v-if="!hasAcademicYear" type="warning" variant="tonal" class="mb-5">
      Select an academic session from the app bar to load Academic Planning statistics and timetable activity.
    </v-alert>

    <v-alert v-else-if="store.error" type="error" variant="tonal" class="mb-5">
      {{ store.error }}
    </v-alert>

    <v-alert
      v-else-if="store.partialErrors.length"
      type="warning"
      variant="tonal"
      density="compact"
      class="mb-5"
      closable
    >
      Some dashboard sections could not be loaded. The available information is shown below.
    </v-alert>

    <v-row>
      <v-col v-for="card in summaryCards" :key="card.label" cols="12" sm="6" lg="2">
        <v-card class="h-100 rounded-xl" variant="outlined">
          <v-card-text>
            <div class="d-flex align-start justify-space-between ga-3">
              <div>
                <div class="text-caption text-medium-emphasis mb-2">{{ card.label }}</div>
                <div class="text-h5 font-weight-bold">{{ card.value }}</div>
              </div>
              <v-avatar :color="card.color" variant="tonal" size="42">
                <v-icon>{{ card.icon }}</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-2">
      <v-col cols="12" lg="4">
        <v-card class="h-100 rounded-xl" variant="outlined">
          <v-card-title class="d-flex align-center justify-space-between">
            <span>Setup Readiness</span>
            <v-chip :color="store.overallScore >= 80 ? 'success' : 'warning'" size="small" variant="tonal">
              {{ store.overallScore }}%
            </v-chip>
          </v-card-title>
          <v-card-text>
            <div class="text-center mb-5">
              <v-progress-circular
                :model-value="store.overallScore"
                :color="store.overallScore >= 80 ? 'success' : 'warning'"
                size="120"
                width="12"
              >
                <strong>{{ store.overallScore }}%</strong>
              </v-progress-circular>
            </div>

            <div class="d-flex flex-wrap ga-2">
              <v-chip
                v-for="(value, key) in checks"
                :key="key"
                :color="value ? 'success' : 'warning'"
                variant="tonal"
                size="small"
              >
                <v-icon start size="16">{{ value ? 'mdi-check-circle' : 'mdi-alert-circle' }}</v-icon>
                {{ String(key).replaceAll('_', ' ') }}
              </v-chip>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="8">
        <v-card class="h-100 rounded-xl" variant="outlined">
          <v-card-title>Timetable Setup</v-card-title>
          <v-card-subtitle>Complete the essential configuration before generation.</v-card-subtitle>
          <v-card-text>
            <v-row>
              <v-col v-for="action in setupActions" :key="action.title" cols="12" sm="6">
                <v-card
                  class="setup-card h-100 rounded-lg"
                  :class="{ 'setup-card-disabled': action.requiresSession && !hasAcademicYear }"
                  variant="tonal"
                  :color="action.color"
                  @click="go(action)"
                >
                  <v-card-text class="d-flex align-start ga-3">
                    <v-avatar :color="action.color" variant="flat" size="42">
                      <v-icon color="white">{{ action.icon }}</v-icon>
                    </v-avatar>
                    <div>
                      <div class="font-weight-bold">{{ action.title }}</div>
                      <div class="text-caption mt-1">{{ action.description }}</div>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-2">
      <v-col cols="12" lg="7">
        <v-card class="rounded-xl" variant="outlined">
          <v-card-title class="d-flex align-center justify-space-between">
            <span>Recent Timetables</span>
            <v-chip size="small" variant="tonal">{{ store.weeklyTimetables.length }} loaded</v-chip>
          </v-card-title>
          <v-divider />

          <v-table density="comfortable">
            <thead>
              <tr>
                <th>Timetable</th>
                <th>Class</th>
                <th>Status</th>
                <th>Version</th>
                <th>Effective</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in store.recentTimetables" :key="item.id">
                <td>
                  <div class="font-weight-medium">{{ item.name || `Timetable #${item.id}` }}</div>
                  <div class="text-caption text-medium-emphasis">#{{ item.id }}</div>
                </td>
                <td>{{ timetableClass(item) }}</td>
                <td>
                  <v-chip :color="statusColor(item.status)" size="small" variant="tonal">
                    {{ item.status || 'unknown' }}
                  </v-chip>
                </td>
                <td>v{{ item.version || 1 }}</td>
                <td>{{ item.effective_from || '—' }}</td>
              </tr>
              <tr v-if="!store.recentTimetables.length">
                <td colspan="5" class="text-center text-medium-emphasis py-8">
                  No timetable records found for {{ selectedAcademicYear?.name || 'the selected session' }}.
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>

      <v-col cols="12" lg="5">
        <v-card class="rounded-xl" variant="outlined">
          <v-card-title>Generation Activity</v-card-title>
          <v-divider />
          <v-list v-if="store.recentRuns.length" lines="three">
            <template v-for="(run, index) in store.recentRuns" :key="run.id">
              <v-list-item>
                <template #prepend>
                  <v-avatar :color="statusColor(run.status)" variant="tonal">
                    <v-icon>{{ run.mode === 'batch' ? 'mdi-calendar-multiple' : 'mdi-calendar-cog' }}</v-icon>
                  </v-avatar>
                </template>

                <v-list-item-title class="d-flex align-center ga-2">
                  Run #{{ run.id }}
                  <v-chip :color="statusColor(run.status)" size="x-small" variant="tonal">
                    {{ run.status }}
                  </v-chip>
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ run.mode }} · {{ run.is_preview ? 'Preview' : 'Final' }} · {{ formatDate(run.created_at) }}
                </v-list-item-subtitle>

                <div class="mt-2">
                  <v-progress-linear
                    :model-value="run.progress_percentage || 0"
                    :color="statusColor(run.status)"
                    height="6"
                    rounded
                  />
                  <div class="text-caption text-medium-emphasis mt-1">
                    {{ run.processed_items || 0 }}/{{ run.requested_items || 1 }} processed ·
                    {{ run.progress_percentage || 0 }}%
                  </div>
                </div>

                <template #append>
                  <div class="d-flex ga-1">
                    <v-btn
                      v-if="['queued', 'running'].includes(run.status)"
                      icon="mdi-stop-circle-outline"
                      size="small"
                      variant="text"
                      color="error"
                      @click="cancelRun(run)"
                    />
                    <v-btn
                      v-if="['failed', 'partial', 'cancelled'].includes(run.status)"
                      icon="mdi-replay"
                      size="small"
                      variant="text"
                      color="primary"
                      @click="retryRun(run)"
                    />
                  </div>
                </template>
              </v-list-item>
              <v-divider v-if="index < store.recentRuns.length - 1" />
            </template>
          </v-list>

          <v-card-text v-else class="text-center text-medium-emphasis py-8">
            No generation activity found for {{ selectedAcademicYear?.name || 'the selected session' }}.
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-if="store.warnings.length" class="mt-2">
      <v-col cols="12">
        <v-alert type="warning" variant="tonal" title="Planning Warnings">
          <div v-for="(warning, index) in store.warnings" :key="index" class="text-body-2">
            • {{ warning }}
          </div>
        </v-alert>
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
.setup-card {
  cursor: pointer;
  transition: transform .18s ease, box-shadow .18s ease;
}

.setup-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(var(--v-theme-primary), .12);
}

.setup-card-disabled {
  opacity: .55;
}
</style>