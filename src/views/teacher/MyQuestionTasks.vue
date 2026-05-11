<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../plugins/api'

const router = useRouter()

const loading = ref(false)
const tasks = ref([])

const headers = [
  { title: 'Grade', key: 'grade.name' },
  { title: 'Subject', key: 'subject.name' },
  { title: 'Type', key: 'question_type' },
  { title: 'Difficulty', key: 'difficulty' },
  { title: 'Target', key: 'target_count' },
  { title: 'Created', key: 'created_count' },
  { title: 'Remaining', key: 'remaining_count' },
  { title: 'Progress', key: 'progress' },
  { title: 'Due Date', key: 'due_date' },
  { title: 'Status', key: 'status' },
  { title: 'Action', key: 'actions', sortable: false }
]

const fetchTasks = async () => {
  loading.value = true

  try {
    const res = await api.get('/teacher/my-question-tasks')
    tasks.value = res.data.data || res.data
  } finally {
    loading.value = false
  }
}

const createQuestionFromTask = (task) => {
  router.push({
    name: 'questions.create',
    query: {
      grade_id: task.grade?.id,
      subject_id: task.subject?.id,
      lesson_id: task.lesson?.id,
      type: task.question_type,
      difficulty: task.difficulty,
      task_id: task.id
    }
  })
}

const statusColor = (status) => {
  if (status === 'completed') return 'success'
  if (status === 'in_progress') return 'info'
  return 'warning'
}

onMounted(fetchTasks)
</script>

<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">
          My Question Tasks
        </h1>

        <p class="text-grey">
          View assigned question targets and create questions accordingly.
        </p>
      </div>

      <v-btn
        color="primary"
        prepend-icon="mdi-refresh"
        @click="fetchTasks"
      >
        Refresh
      </v-btn>
    </div>

    <v-row class="mb-4">
      <v-col cols="12" md="4">
        <v-card class="pa-4 rounded-xl" elevation="0">
          <div class="text-caption text-grey">
            Total Tasks
          </div>

          <div class="text-h5 font-weight-bold">
            {{ tasks.length }}
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="pa-4 rounded-xl" elevation="0">
          <div class="text-caption text-grey">
            Completed
          </div>

          <div class="text-h5 font-weight-bold text-success">
            {{ tasks.filter(t => t.status === 'completed').length }}
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="pa-4 rounded-xl" elevation="0">
          <div class="text-caption text-grey">
            Pending
          </div>

          <div class="text-h5 font-weight-bold text-warning">
            {{ tasks.filter(t => t.status !== 'completed').length }}
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-card class="rounded-xl" elevation="0">
      <v-data-table
        :headers="headers"
        :items="tasks"
        :loading="loading"
      >
        <template #item.difficulty="{ item }">
          <v-chip
            size="small"
            variant="tonal"
            :color="
              item.difficulty === 'easy'
                ? 'success'
                : item.difficulty === 'medium'
                ? 'warning'
                : 'error'
            "
          >
            {{ item.difficulty }}
          </v-chip>
        </template>

        <template #item.progress="{ item }">
          <div style="min-width: 150px">
            <v-progress-linear
              :model-value="item.progress"
              height="8"
              rounded
              color="primary"
            />

            <div class="text-caption mt-1">
              {{ item.progress }}%
            </div>
          </div>
        </template>

        <template #item.status="{ item }">
          <v-chip
            size="small"
            variant="tonal"
            :color="statusColor(item.status)"
          >
            {{ item.status }}
          </v-chip>
        </template>

        <template #item.actions="{ item }">
          <v-btn
            color="primary"
            size="small"
            prepend-icon="mdi-plus"
            :disabled="item.status === 'completed'"
            @click="createQuestionFromTask(item)"
          >
            Create
          </v-btn>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>