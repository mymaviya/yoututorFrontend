<template>
  <v-container fluid class="pa-4">
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

import FiltersBar from './components/FiltersBar.vue'
import DashboardCards from './components/DashboardCards.vue'
import AnalyticsPanel from './components/AnalyticsPanel.vue'
import EmptyState from './components/EmptyState.vue'
import SubstitutionTable from './components/SubstitutionTable.vue'
import SuggestionDrawer from './components/SuggestionDrawer.vue'
import Timeline from './components/Timeline.vue'

const store = useTeacherSubstitutionStore()

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

const loadDashboard = () => store.fetchDashboard(filters.date)

const filterStatus = (status) => {
  filters.status = filters.status === status ? null : status
}

const openSuggestionDrawer = async (item) => {
  selectedSubstitution.value = item
  store.clearSuggestions()
  drawer.value = true

  const loaded = await store.fetchSuggestions({
    academic_year_id: item.academic_year_id,
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
  if (!selectedSubstitution.value || store.saving) return

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
  selectedSubstitution.value = item
  timelineDialog.value = true
}

const approve = async (item) => {
  if (store.saving) return

  try {
    await store.approve(item.id)
    await loadDashboard()
  } catch {
    // Store already displays the error.
  }
}

const cancel = async (item) => {
  if (store.saving) return

  try {
    await store.cancel(item.id)
    await loadDashboard()
  } catch {
    // Store already displays the error.
  }
}

watch(
  () => filters.date,
  () => {
    window.clearTimeout(dateWatchTimer)
    dateWatchTimer = window.setTimeout(loadDashboard, 250)
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
})
</script>
