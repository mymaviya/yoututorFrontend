<script setup>
import { ref, onMounted } from 'vue'
import api from '../../plugins/api'
import { useAuthStore } from '../../stores/auth'

const auth = useAuthStore()

const loading = ref(false)

const dashboard = ref({
  stats: {},
  recent_questions: [],
  recent_papers: [],
  teacher_progress: []
})

const fetchDashboard = async () => {
  loading.value = true

  try {
    const res = await api.get('/dashboard')
    dashboard.value = res.data
  } finally {
    loading.value = false
  }
}

const statCards = [
  {
    title: 'Teachers',
    key: 'teachers',
    icon: 'mdi-account-tie',
    color: 'primary'
  },
  {
    title: 'Grades',
    key: 'grades',
    icon: 'mdi-google-classroom',
    color: 'info'
  },
  {
    title: 'Subjects',
    key: 'subjects',
    icon: 'mdi-book-open-page-variant',
    color: 'success'
  },
  {
    title: 'Questions',
    key: 'questions',
    icon: 'mdi-help-circle',
    color: 'warning'
  },
  {
    title: 'Papers',
    key: 'question_papers',
    icon: 'mdi-file-document-multiple',
    color: 'secondary'
  },
  {
    title: 'Published',
    key: 'published_papers',
    icon: 'mdi-check-decagram',
    color: 'success'
  },
  {
    title: 'Draft Papers',
    key: 'draft_papers',
    icon: 'mdi-file-clock',
    color: 'error'
  }
]

onMounted(fetchDashboard)
</script>

<template>
  <div>
    <!-- HEADER -->
    <div class="mb-6">
      <h1 class="text-h4 font-weight-bold">
        Dashboard
      </h1>

      <p class="text-grey">
        Overview of teachers, question bank and question papers
      </p>
    </div>

    <v-progress-linear
      v-if="loading"
      indeterminate
      color="primary"
      class="mb-4"
    />

    <!-- STATS -->
    <v-row>
      <v-col
        v-for="card in statCards"
        :key="card.key"
        cols="12"
        sm="6"
        md="3"
      >
        <v-card class="pa-4 rounded-xl" elevation="0">
          <div class="d-flex justify-space-between align-center">
            <div>
              <div class="text-caption text-grey">
                {{ card.title }}
              </div>

              <div class="text-h5 font-weight-bold">
                {{ dashboard.stats?.[card.key] ?? 0 }}
              </div>
            </div>

            <v-avatar
              :color="card.color"
              variant="tonal"
              size="46"
            >
              <v-icon>
                {{ card.icon }}
              </v-icon>
            </v-avatar>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <!-- RECENT QUESTIONS -->
      <v-col cols="12" md="6">
        <v-card class="pa-4 rounded-xl" elevation="0">
          <div class="text-h6 font-weight-bold mb-4">
            Recent Questions
          </div>

          <v-list>
            <v-list-item
              v-for="q in dashboard.recent_questions"
              :key="q.id"
            >
              <template #prepend>
                <v-avatar color="primary" variant="tonal">
                  <v-icon>mdi-help</v-icon>
                </v-avatar>
              </template>

              <v-list-item-title>
                <span v-math v-html="q.question"></span>
              </v-list-item-title>

              <v-list-item-subtitle>
                {{ q.grade?.name }} |
                {{ q.subject?.name }} |
                Created by {{ q.creator?.name || '-' }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- RECENT PAPERS -->
      <v-col cols="12" md="6">
        <v-card class="pa-4 rounded-xl" elevation="0">
          <div class="text-h6 font-weight-bold mb-4">
            Recent Question Papers
          </div>

          <v-list>
            <v-list-item
              v-for="paper in dashboard.recent_papers"
              :key="paper.id"
            >
              <template #prepend>
                <v-avatar color="secondary" variant="tonal">
                  <v-icon>mdi-file-document</v-icon>
                </v-avatar>
              </template>

              <v-list-item-title>
                {{ paper.title }}
              </v-list-item-title>

              <v-list-item-subtitle>
                {{ paper.grade?.name }} |
                {{ paper.subject?.name }} |
                {{ paper.total_marks }} Marks
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>

    <!-- TEACHER PROGRESS -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card class="pa-4 rounded-xl" elevation="0">
          <div class="text-h6 font-weight-bold mb-4">
            Teacher Progress
          </div>

          <v-data-table
            :headers="[
              { title: 'Teacher', key: 'name' },
              { title: 'Assignments', key: 'assignments_count' },
              { title: 'Questions', key: 'questions_count' },
              { title: 'Papers', key: 'papers_count' },
              { title: 'Contact', key: 'contact' }
            ]"
            :items="dashboard.teacher_progress"
          >
            <template #item.questions_count="{ item }">
              <v-chip color="info" variant="tonal">
                {{ item.questions_count }}
              </v-chip>
            </template>

            <template #item.papers_count="{ item }">
              <v-chip color="primary" variant="tonal">
                {{ item.papers_count }}
              </v-chip>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>