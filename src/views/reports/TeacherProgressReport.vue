<script setup>
import { ref, onMounted } from 'vue'
import api from '../../plugins/api'

const loading = ref(false)
const reports = ref([])

const headers = [
  { title: 'Teacher', key: 'teacher' },
  { title: 'Assignments', key: 'assignments' },
  { title: 'Questions', key: 'total_questions' },
  { title: 'Papers', key: 'total_papers' },
  { title: 'Published', key: 'published_papers' },
  { title: 'Draft', key: 'draft_papers' },
  { title: 'Status', key: 'is_active' },
]

const fetchReport = async () => {
  loading.value = true

  try {
    const res = await api.get('/reports/teacher-question-paper-progress')
    reports.value = res.data
  } finally {
    loading.value = false
  }
}

onMounted(fetchReport)
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-h4 font-weight-bold">
        Teacher Question Paper Progress
      </h1>

      <p class="text-grey">
        Track teachers, assigned subjects, questions and generated papers.
      </p>
    </div>

    <v-card class="rounded-xl" elevation="0">
      <v-data-table
        :headers="headers"
        :items="reports"
        :loading="loading"
      >
        <template #item.teacher="{ item }">
          <div>
            <div class="font-weight-bold">
              {{ item.name }}
            </div>

            <div class="text-caption text-grey">
              {{ item.email }}
            </div>

            <div class="text-caption text-grey">
              {{ item.contact }}
            </div>
          </div>
        </template>

        <template #item.assignments="{ item }">
          <div class="d-flex flex-wrap ga-1">
            <v-chip
              v-for="(a, index) in item.assignments"
              :key="index"
              size="small"
              color="primary"
              variant="tonal"
            >
              {{ a.grade }} - {{ a.subject }}
            </v-chip>
          </div>
        </template>

        <template #item.total_questions="{ item }">
          <v-chip color="info" variant="tonal">
            {{ item.total_questions }}
          </v-chip>
        </template>

        <template #item.total_papers="{ item }">
          <v-chip color="primary" variant="tonal">
            {{ item.total_papers }}
          </v-chip>
        </template>

        <template #item.published_papers="{ item }">
          <v-chip color="success" variant="tonal">
            {{ item.published_papers }}
          </v-chip>
        </template>

        <template #item.draft_papers="{ item }">
          <v-chip color="warning" variant="tonal">
            {{ item.draft_papers }}
          </v-chip>
        </template>

        <template #item.is_active="{ item }">
          <v-chip
            :color="item.is_active ? 'success' : 'error'"
            variant="tonal"
          >
            {{ item.is_active ? 'Active' : 'Inactive' }}
          </v-chip>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>