<template>
  <v-container fluid class="pa-4">
    <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-4">
      <div>
        <div class="d-flex align-center ga-2 mb-1">
          <v-avatar color="primary" variant="tonal" size="42">
            <v-icon>mdi-account-switch-outline</v-icon>
          </v-avatar>
          <h1 class="text-h5 font-weight-bold">Teacher Substitution</h1>
        </div>
        <p class="text-body-2 text-medium-emphasis mb-0">
          Academic Session: <strong>{{ selectedAcademicYear?.name || 'Not selected' }}</strong>
        </p>
      </div>

      <v-btn
        color="primary"
        variant="tonal"
        prepend-icon="mdi-refresh"
        :loading="store.loading"
        :disabled="!selectedAcademicYearId"
        @click="loadDashboard"
      >
        Refresh
      </v-btn>
    </div>

    <v-alert
      v-if="!selectedAcademicYearId"
      type="warning"
      variant="tonal"
      class="mb-4"
      title="Academic session required"
    >
      Please select an Academic Session from the top app bar to manage teacher substitutions.
    </v-alert>

    <div :class="{ 'substitution-disabled': !selectedAcademicYearId }">
      <FiltersBar
        v-model:date="filters.date"
        v-model:grade="filters.grade_id"
        v-model:status="filters.status"
        @refresh="loadDashboard"
      />

      <DashboardCards
        :stats="store.stats"
        :analytics="store.analytics"
        :active-status="filters.status"
        class="mt-4"
        @filter="filterStatus"
      />

      <AnalyticsPanel
        :analytics="store.analytics"
        class="mt-4"
      />

      <EmptyState
        v-if="!store.loading && filteredItems.length === 0"
        class="mt-4"
        @refresh="loadDashboard"
      />

      <SubstitutionTable
        v-else
        class="mt-4"
        :loading="store.loading"
        :saving="store.saving"
        :items="filteredItems"
        @assign="openSuggestionDrawer"
        @view="openTimeline"
        @approve="approve"
        @cancel="cancel"
      />
    </div>

    <SuggestionDrawer
      v-model="drawer"
      :substitution="selectedSubstitution"
      :suggestions="store.suggestions"
      :loading="store.suggestionLoading"
      :saving="store.saving"
      @assign="assignTeacher"
    />

    <Timeline
      v-model="timelineDialog"
      :substitution="selectedSubstitution"
    />
  </v-container>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'

import { useTeacherSubstitutionStore } from '../../../stores/teacherSubstitution'
import { useAppStore } from '../../../stores/app'

import FiltersBar from './components/FiltersBar.vue'
import DashboardCards from './components/DashboardCards.vue'
import AnalyticsPanel from './components/AnalyticsPanel.vue'
import EmptyState from './components/EmptyState.vue'
import SubstitutionTable from './components/SubstitutionTable.vue'
import SuggestionDrawer from './components/SuggestionDrawer.vue'
import Timeline from './components/Timeline.vue'

const store = useTeacherSubstitutionStore()
const appStore = useAppStore()

const selectedAcademicYearId = computed(() => appStore.selectedAcademicYearId)
const selectedAcademicYear = computed(() => appStore.selectedAcademicYear)

const formatLocalDate = (date = new Date()) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const filters = reactive({
  date: formatLocalDate(),
  grade_id: null,
  status: null,
})

const drawer = ref(false)
const timelineDialog = ref(false)
const selectedSubstitution = ref(null)
let dateWatchTimer = null

const filteredItems = computed(() => {
  let items = Array.isArray(store.items) ? [...store.items] : []

  if (filters.grade_id !== null && filters.grade_id !== '') {
    items = items.filter(
      (item) => Number(item.grade_id) === Number(filters.grade_id)
    )
  }

  if (filters.status) {
    items = items.filter((item) => item.status === filters.status)
  }

  return items
})

const loadDashboard = () => {
  if (!selectedAcademicYearId.value) {
    store.reset()
    return Promise.resolve(false)
  }

  return store.fetchDashboard(filters.date, selectedAcademicYearId.value)
}

const filterStatus = (status) => {
  if (!selectedAcademicYearId.value) return
  filters.status = filters.status === status ? null : status
}

const openSuggestionDrawer = async (item) => {
  if (!selectedAcademicYearId.value) return

  selectedSubstitution.value = item
  store.clearSuggestions()
  drawer.value = true

  const loaded = await store.fetchSuggestions({
    academic_year_id: selectedAcademicYearId.value,
    absent_teacher_id: item.absent_teacher_id,
    school_bell_id: item.school_bell_id,
    date: item.substitution_date || filters.date,
    subject_id: item.subject_id,
  })

  if (!loaded) {
    drawer.value = false
  }
}

const assignTeacher = async (teacherId) => {
  if (!selectedAcademicYearId.value || !selectedSubstitution.value || store.saving) return

  try {
    await store.assign(selectedSubstitution.value.id, teacherId)
    drawer.value = false
    selectedSubstitution.value = null
    await loadDashboard()
  } catch {
    // Store already displays the error.
  }
}

const openTimeline = (item) => {
  if (!selectedAcademicYearId.value) return
  selectedSubstitution.value = item
  timelineDialog.value = true
}

const approve = async (item) => {
  if (!selectedAcademicYearId.value || store.saving) return

  try {
    await store.approve(item.id)
    await loadDashboard()
  } catch {
    // Store already displays the error.
  }
}

const cancel = async (item) => {
  if (!selectedAcademicYearId.value || store.saving) return

  try {
    await store.cancel(item.id)
    await loadDashboard()
  } catch {
    // Store already displays the error.
  }
}

const resetWorkspace = () => {
  window.clearTimeout(dateWatchTimer)
  drawer.value = false
  timelineDialog.value = false
  selectedSubstitution.value = null
  filters.grade_id = null
  filters.status = null
  store.reset()
}

watch(
  () => filters.date,
  () => {
    window.clearTimeout(dateWatchTimer)
    if (!selectedAcademicYearId.value) return
    dateWatchTimer = window.setTimeout(loadDashboard, 250)
  }
)

watch(selectedAcademicYearId, async (newValue, oldValue) => {
  if (Number(newValue || 0) === Number(oldValue || 0)) return
  resetWorkspace()
  if (newValue) await loadDashboard()
})

watch(
  () => appStore.refreshKey,
  () => {
    if (selectedAcademicYearId.value) loadDashboard()
  }
)

watch(drawer, (isOpen) => {
  if (!isOpen) {
    store.clearSuggestions()
    selectedSubstitution.value = null
  }
})

watch(timelineDialog, (isOpen) => {
  if (!isOpen) {
    selectedSubstitution.value = null
  }
})

onMounted(loadDashboard)

onBeforeUnmount(() => {
  window.clearTimeout(dateWatchTimer)
  store.reset()
})
</script>

<style scoped>
.substitution-disabled {
  opacity: 0.58;
  pointer-events: none;
}
</style>
