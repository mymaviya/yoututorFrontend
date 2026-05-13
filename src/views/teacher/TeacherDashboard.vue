<script setup>
import { ref, onMounted } from 'vue'
import api from '../../plugins/api'

const loading = ref(false)

const dashboard = ref({
  stats: {},
  assignments: [],
  tasks: [],
  recent_questions: [],
  recent_papers: []
})

const statCards = [
  { title: 'Assigned Tasks', key: 'assigned_tasks', icon: 'mdi-clipboard-list', color: 'primary' },
  { title: 'Completed', key: 'completed_tasks', icon: 'mdi-check-decagram', color: 'success' },
  { title: 'Pending', key: 'pending_tasks', icon: 'mdi-clock-outline', color: 'warning' },
  { title: 'Questions', key: 'questions_created', icon: 'mdi-help-circle', color: 'info' },
  { title: 'Papers', key: 'papers_created', icon: 'mdi-file-document', color: 'secondary' },
]

const fetchDashboard = async () => {
  loading.value = true

  try {
    const res = await api.get('/teacher/dashboard')
    dashboard.value = res.data
  } finally {
    loading.value = false
  }
}

onMounted(fetchDashboard)
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-h4 font-weight-bold">
        Teacher Dashboard
      </h1>

      <p class="text-grey">
        View your assigned tasks, question progress, and recent work.
      </p>
    </div>

    <v-progress-linear
      v-if="loading"
      indeterminate
      color="primary"
      class="mb-4"
    />

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

            <v-avatar :color="card.color" variant="tonal" size="46">
              <v-icon>{{ card.icon }}</v-icon>
            </v-avatar>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12" md="8">
        <v-card class="pa-4 rounded-xl" elevation="0">
          <div class="text-h6 font-weight-bold mb-4">
            My Question Tasks
          </div>

          <v-table>
            <thead>
              <tr>
                <th>Grade</th>
                <th>Subject</th>
                <th>Type</th>
                <th>Difficulty</th>
                <th>Progress</th>
                <th>Due Date</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="task in dashboard.tasks" :key="task.id">
                <td>{{ task.grade?.name }}</td>
                <td>{{ task.subject?.name }}</td>
                <td>{{ task.question_type }}</td>
                <td>
                  <v-chip size="small" variant="tonal">
                    {{ task.difficulty }}
                  </v-chip>
                </td>
                <td style="min-width: 160px">
                  <v-progress-linear
                    :model-value="task.progress"
                    rounded
                    height="8"
                    color="primary"
                  />

                  <div class="text-caption mt-1">
                    {{ task.created_count }}/{{ task.target_count }}
                    completed
                  </div>
                </td>
                <td>{{ task.due_date || '-' }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="pa-4 rounded-xl mb-4" elevation="0">
          <div class="text-h6 font-weight-bold mb-4">
            Assigned Grades & Subjects
          </div>

          <div class="d-flex flex-wrap ga-2">
            <v-chip
              v-for="item in dashboard.assignments"
              :key="item.id"
              color="primary"
              variant="tonal"
            >
              {{ item.grade?.name }} - {{ item.subject?.name }}
            </v-chip>
          </div>
        </v-card>

        <v-card class="pa-4 rounded-xl" elevation="0">
          <div class="text-h6 font-weight-bold mb-4">
            Recent Papers
          </div>

          <v-list density="comfortable">
            <v-list-item
              v-for="paper in dashboard.recent_papers"
              :key="paper.id"
              prepend-icon="mdi-file-document"
            >
              <v-list-item-title>
                {{ paper.title }}
              </v-list-item-title>

              <v-list-item-subtitle>
                {{ paper.grade?.name }} | {{ paper.subject?.name }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12">
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
                {{ q.lesson?.name || q.lesson?.title || '-' }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>