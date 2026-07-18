<template>
  <v-container fluid>
    <v-row class="mb-4">
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between flex-wrap ga-3">
          <div>
            <h2 class="text-h5 font-weight-bold">Academic Planning</h2>
            <p class="text-body-2 text-medium-emphasis mb-0">
              Timetable readiness, setup status and quick actions
            </p>
          </div>

          <v-btn
            color="primary"
            prepend-icon="mdi-refresh"
            :loading="store.loading"
            @click="store.fetchDashboard"
          >
            Refresh
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <v-alert
      v-if="store.error"
      type="error"
      variant="tonal"
      class="mb-4"
    >
      {{ store.error }}
    </v-alert>

    <v-row>
      <v-col cols="12" md="4">
        <v-card class="h-100">
          <v-card-title>Readiness</v-card-title>
          <v-card-text class="text-center">
            <v-progress-circular
              :model-value="store.overallScore"
              size="120"
              width="12"
              color="primary"
            >
              <strong>{{ store.overallScore }}%</strong>
            </v-progress-circular>

            <div class="mt-4 text-body-2 text-medium-emphasis">
              Overall setup readiness
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="8">
        <v-card class="h-100">
          <v-card-title>Setup Checks</v-card-title>
          <v-card-text>
            <v-row>
              <v-col
                v-for="(value, key) in checks"
                :key="key"
                cols="12"
                sm="6"
                md="4"
              >
                <v-chip
                  class="w-100 justify-center"
                  :color="value ? 'success' : 'warning'"
                  variant="tonal"
                >
                  <v-icon start>
                    {{ value ? 'mdi-check-circle' : 'mdi-alert-circle' }}
                  </v-icon>
                  {{ formatLabel(key) }}
                </v-chip>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-2">
      <v-col
        v-for="card in statCards"
        :key="card.key"
        cols="12"
        sm="6"
        md="3"
      >
        <v-card>
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-body-2 text-medium-emphasis">
                  {{ card.label }}
                </div>
                <div class="text-h5 font-weight-bold">
                  {{ card.value }}
                </div>
              </div>

              <v-avatar color="primary" variant="tonal">
                <v-icon>{{ card.icon }}</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-2">
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title>Warnings</v-card-title>
          <v-card-text>
            <v-alert
              v-if="!store.warnings.length"
              type="success"
              variant="tonal"
            >
              No setup warnings found.
            </v-alert>

            <v-list v-else density="compact">
              <v-list-item
                v-for="(warning, index) in store.warnings"
                :key="index"
                prepend-icon="mdi-alert"
              >
                <v-list-item-title>{{ warning }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>Quick Actions</v-card-title>
          <v-card-text class="d-flex flex-column ga-3">
            <v-btn color="primary" block prepend-icon="mdi-robot">
              Generate Timetable
            </v-btn>

            <v-btn color="info" block variant="tonal" prepend-icon="mdi-check-decagram">
              Validate Timetable
            </v-btn>

            <v-btn color="success" block variant="tonal" prepend-icon="mdi-publish">
              Publish
            </v-btn>

            <v-btn color="warning" block variant="tonal" prepend-icon="mdi-account-switch">
              Teacher Substitution
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useAcademicPlanningStore } from '../../stores/academicPlanning'

const store = useAcademicPlanningStore()

const checks = computed(() => store.readiness?.checks || {})

const statCards = computed(() => {
  const s = store.statistics

  return [
    {
      key: 'teachers',
      label: 'Teachers',
      value: s.teachers || 0,
      icon: 'mdi-account-school',
    },
    {
      key: 'teacher_assignments',
      label: 'Teacher Assignments',
      value: s.teacher_assignments || 0,
      icon: 'mdi-account-check',
    },
    {
      key: 'subject_allocations',
      label: 'Subject Allocations',
      value: s.subject_allocations || 0,
      icon: 'mdi-book-clock',
    },
    {
      key: 'rooms',
      label: 'Rooms',
      value: s.rooms || 0,
      icon: 'mdi-door',
    },
    {
      key: 'templates',
      label: 'Templates',
      value: s.templates || 0,
      icon: 'mdi-calendar-range',
    },
    {
      key: 'bell_schedules',
      label: 'Bell Schedules',
      value: s.bell_schedules || 0,
      icon: 'mdi-bell-ring',
    },
    {
      key: 'rules',
      label: 'Rules',
      value: s.rules || 0,
      icon: 'mdi-ruler',
    },
    {
      key: 'parallel_groups',
      label: 'Parallel Groups',
      value: s.parallel_groups || 0,
      icon: 'mdi-vector-combine',
    },
  ]
})

const formatLabel = (value) => {
  return String(value)
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

onMounted(() => {
  store.fetchDashboard()
})
</script>