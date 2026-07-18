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
      @assign="assignTeacher"
    />

    <Timeline
      v-model="timelineDialog"
      :substitution="selectedSubstitution"
    />
  </v-container>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'

import { useTeacherSubstitutionStore } from '../../../stores/teacherSubstitution'

import FiltersBar from './components/FiltersBar.vue'
import DashboardCards from './components/DashboardCards.vue'
import AnalyticsPanel from './components/AnalyticsPanel.vue'
import EmptyState from './components/EmptyState.vue'
import SubstitutionTable from './components/SubstitutionTable.vue'
import SuggestionDrawer from './components/SuggestionDrawer.vue'
import Timeline from './components/Timeline.vue'

const store = useTeacherSubstitutionStore()

const filters = reactive({
  date: new Date().toISOString().slice(0, 10),
  grade_id: null,
  status: null,
})

const drawer = ref(false)
const timelineDialog = ref(false)
const selectedSubstitution = ref(null)

const filteredItems = computed(() => {
  let items = [...store.items]

  if (filters.grade_id) {
    items = items.filter((item) => Number(item.grade_id) === Number(filters.grade_id))
  }

  if (filters.status) {
    items = items.filter((item) => item.status === filters.status)
  }

  return items
})

const loadDashboard = async () => {
  await store.fetchDashboard(filters.date)
}

const filterStatus = (status) => {
  filters.status = status
}

const openSuggestionDrawer = async (item) => {
  selectedSubstitution.value = item
  drawer.value = true
  store.clearSuggestions?.()

  await store.fetchSuggestions({
    academic_year_id: item.academic_year_id,
    absent_teacher_id: item.absent_teacher_id,
    school_bell_id: item.school_bell_id,
    date: item.substitution_date,
    subject_id: item.subject_id,
  })
}

const assignTeacher = async (teacherId) => {
  if (!selectedSubstitution.value) return

  await store.assign(
    selectedSubstitution.value.id,
    teacherId
  )

  drawer.value = false
  await loadDashboard()
}

const openTimeline = (item) => {
  selectedSubstitution.value = item
  timelineDialog.value = true
}

const approve = async (item) => {
  await store.approve(item.id)
  await loadDashboard()
}

const cancel = async (item) => {
  await store.cancel(item.id)
  await loadDashboard()
}

watch(
  () => filters.date,
  () => {
    loadDashboard()
  }
)

onMounted(loadDashboard)
</script>
