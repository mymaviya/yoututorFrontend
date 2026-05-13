<script setup>
import { ref, onMounted } from "vue";
import api from "../../plugins/api";
import { useUIStore } from "../../stores/snackBar";
import { formatDate } from "../../utils/date";

const ui = useUIStore()

const portions = ref([])
const lessons = ref([])

const loading = ref(false)
const saving = ref(false)

const submitDialog = ref(false)
const previewDialog = ref(false)

const selectedPortion = ref(null)

const formLessons = ref([])

const headers = [
  { title: 'Exam', key: 'exam' },
  { title: 'Grade', key: 'grade.name' },
  { title: 'Subject', key: 'subject.name' },
  { title: 'Due Date', key: 'due_date' },
  { title: 'Status', key: 'status' },
  { title: 'Actions', key: 'actions', sortable: false }
]

const fetchPortions = async () => {
  loading.value = true

  try {
    const res = await api.get('/my-exam-portions')
    portions.value = res.data.data || res.data
  } finally {
    loading.value = false
  }
}

const fetchLessons = async (portion) => {
  const res = await api.get('/lessons', {
    params: {
      grade_id: portion.grade_id,
      subject_id: portion.subject_id
    }
  })

  lessons.value = res.data.data || res.data
}

const openSubmit = async (portion) => {
  selectedPortion.value = portion

  await fetchLessons(portion)

  if (portion.lessons?.length) {
    formLessons.value = portion.lessons.map(item => ({
      lesson_id: item.lesson_id,
      lesson_title: '',
      topics: item.topics || '',
      learning_objectives: item.learning_objectives || '',
      remarks: item.remarks || ''
    }))
  } else {
    formLessons.value = [
      {
        lesson_id: null,
        lesson_title: '',
        topics: '',
        learning_objectives: '',
        remarks: ''
      }
    ]
  }

  submitDialog.value = true
}

const openPreview = (portion) => {
  selectedPortion.value = portion
  previewDialog.value = true
}

const addLessonRow = () => {
  formLessons.value.push({
    lesson_id: null,
    lesson_title: '',
    topics: '',
    learning_objectives: '',
    remarks: ''
  })
}

const removeLessonRow = (index) => {
  formLessons.value.splice(index, 1)
}

const submitSyllabus = async () => {
  if (!formLessons.value.length) {
    ui.showSnackbar('Please add at least one lesson', 'warning')
    return
  }

  const invalid = formLessons.value.some(row => {
    return !row.lesson_id && !row.lesson_title
  })

  if (invalid) {
    ui.showSnackbar('Please select a lesson or enter a new lesson name', 'warning')
    return
  }

  saving.value = true

  try {
    await api.post(`/exam-portions/${selectedPortion.value.id}/submit`, {
      lessons: formLessons.value
    })

    ui.showSnackbar('Syllabus submitted successfully')

    submitDialog.value = false

    fetchPortions()
  } catch (err) {
    ui.showSnackbar(
      err.response?.data?.message || 'Failed to submit syllabus',
      'error'
    )
  } finally {
    saving.value = false
  }
}

const statusColor = (status) => {
  if (status === 'approved') return 'success'
  if (status === 'rejected') return 'error'
  if (status === 'submitted') return 'info'
  return 'warning'
}

const examName = (portion) => {
  return portion.exam_name?.name || '-'
}

const examDate = (portion) => {
  return portion.exam_name?.tentative_date || null
}

onMounted(fetchPortions)
</script>

<template>
  <div>
    <!-- HEADER -->
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">
          My Exam Portions
        </h1>

        <p class="text-grey">
          Prepare and submit exam-wise syllabus assigned to you.
        </p>
      </div>

      <v-btn
        color="primary"
        prepend-icon="mdi-refresh"
        @click="fetchPortions"
      >
        Refresh
      </v-btn>
    </div>

    <!-- STATS -->
    <v-row class="mb-4">
      <v-col cols="12" md="3">
        <v-card class="pa-4 rounded-xl" elevation="0">
          <div class="text-caption text-grey">
            Total Assigned
          </div>

          <div class="text-h5 font-weight-bold">
            {{ portions.length }}
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card class="pa-4 rounded-xl" elevation="0">
          <div class="text-caption text-grey">
            Submitted
          </div>

          <div class="text-h5 font-weight-bold text-info">
            {{ portions.filter(p => p.status === 'submitted').length }}
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card class="pa-4 rounded-xl" elevation="0">
          <div class="text-caption text-grey">
            Approved
          </div>

          <div class="text-h5 font-weight-bold text-success">
            {{ portions.filter(p => p.status === 'approved').length }}
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card class="pa-4 rounded-xl" elevation="0">
          <div class="text-caption text-grey">
            Pending / Rejected
          </div>

          <div class="text-h5 font-weight-bold text-warning">
            {{ portions.filter(p => ['assigned', 'rejected'].includes(p.status)).length }}
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- TABLE -->
    <v-card class="rounded-xl" elevation="0">
      <v-data-table
        :headers="headers"
        :items="portions"
        :loading="loading"
      >
        <template #item.exam="{ item }">
          <div>
            <div class="font-weight-medium">
              {{ examName(item) }}
            </div>

            <div
              v-if="examDate(item)"
              class="text-caption text-grey"
            >
              Tentative: {{ formatDate(examDate(item)) }}
            </div>
          </div>
        </template>

        <template #item.due_date="{ item }">
          {{ formatDate(item.due_date) }}
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
          <div class="d-flex ga-1">
            <v-btn
              icon="mdi-eye"
              size="small"
              variant="text"
              color="info"
              @click="openPreview(item)"
            />

            <v-btn
              v-if="item.status !== 'approved'"
              color="primary"
              size="small"
              prepend-icon="mdi-pencil"
              variant="tonal"
              @click="openSubmit(item)"
            >
              {{ item.lessons?.length ? 'Edit' : 'Submit' }}
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- SUBMIT SYLLABUS DIALOG -->
    <v-dialog
      v-model="submitDialog"
      max-width="1100"
      persistent
    >
      <v-card class="rounded-xl">
        <v-card-title class="d-flex justify-space-between align-center">
          Prepare Exam Portion

          <v-btn
            icon="mdi-close"
            variant="text"
            @click="submitDialog = false"
          />
        </v-card-title>

        <v-divider />

        <v-card-text v-if="selectedPortion">
          <!-- INFO -->
          <v-alert
            type="info"
            variant="tonal"
            class="mb-4"
          >
            <div class="font-weight-bold">
              {{ examName(selectedPortion) }}
            </div>

            <div>
              {{ selectedPortion.grade?.name }} -
              {{ selectedPortion.subject?.name }}
            </div>

            <div v-if="selectedPortion.due_date">
              Due Date: {{ formatDate(selectedPortion.due_date) }}
            </div>

            <div
              v-if="selectedPortion.rejection_reason"
              class="text-error mt-2"
            >
              Rejection Reason:
              {{ selectedPortion.rejection_reason }}
            </div>
          </v-alert>

          <!-- LESSON ROWS -->
          <div class="d-flex justify-space-between align-center mb-3">
            <div class="text-h6 font-weight-bold">
              Lessons / Topics
            </div>

            <v-btn
              color="primary"
              variant="tonal"
              prepend-icon="mdi-plus"
              @click="addLessonRow"
            >
              Add Lesson
            </v-btn>
          </div>

          <v-card
            v-for="(row, index) in formLessons"
            :key="index"
            class="pa-4 mb-4 rounded-xl"
            variant="outlined"
          >
            <div class="d-flex justify-space-between align-center mb-3">
              <div class="font-weight-bold">
                Lesson Row {{ index + 1 }}
              </div>

              <v-btn
                icon="mdi-delete"
                color="error"
                variant="text"
                :disabled="formLessons.length === 1"
                @click="removeLessonRow(index)"
              />
            </div>

            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="row.lesson_id"
                  :items="lessons"
                  item-title="title"
                  item-value="id"
                  label="Select Existing Lesson"
                  clearable
                  variant="outlined"
                  :disabled="!!row.lesson_title"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="row.lesson_title"
                  label="Or Enter New Lesson Name"
                  variant="outlined"
                  :disabled="!!row.lesson_id"
                />
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="row.topics"
                  label="Topics / Portion"
                  rows="3"
                  auto-grow
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-textarea
                  v-model="row.learning_objectives"
                  label="Learning Objectives"
                  rows="3"
                  auto-grow
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-textarea
                  v-model="row.remarks"
                  label="Remarks"
                  rows="3"
                  auto-grow
                  variant="outlined"
                />
              </v-col>
            </v-row>
          </v-card>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />

          <v-btn
            variant="text"
            @click="submitDialog = false"
          >
            Cancel
          </v-btn>

          <v-btn
            color="primary"
            :loading="saving"
            prepend-icon="mdi-send"
            @click="submitSyllabus"
          >
            Submit Syllabus
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- PREVIEW DIALOG -->
    <v-dialog
      v-model="previewDialog"
      max-width="900"
    >
      <v-card class="rounded-xl">
        <v-card-title class="d-flex justify-space-between align-center">
          Exam Portion Details

          <v-btn
            icon="mdi-close"
            variant="text"
            @click="previewDialog = false"
          />
        </v-card-title>

        <v-divider />

        <v-card-text v-if="selectedPortion">
          <div class="d-flex flex-wrap ga-2 mb-4">
            <v-chip color="primary" variant="tonal">
              {{ examName(selectedPortion) }}
            </v-chip>

            <v-chip variant="tonal">
              {{ selectedPortion.grade?.name }}
            </v-chip>

            <v-chip variant="tonal">
              {{ selectedPortion.subject?.name }}
            </v-chip>

            <v-chip
              :color="statusColor(selectedPortion.status)"
              variant="tonal"
            >
              {{ selectedPortion.status }}
            </v-chip>
          </div>

          <v-alert
            v-if="selectedPortion.rejection_reason"
            type="error"
            variant="tonal"
            class="mb-4"
          >
            {{ selectedPortion.rejection_reason }}
          </v-alert>

          <div class="text-h6 font-weight-bold mb-3">
            Submitted Syllabus
          </div>

          <v-table
            v-if="selectedPortion.lessons?.length"
            density="comfortable"
          >
            <thead>
              <tr>
                <th>Lesson</th>
                <th>Topics</th>
                <th>Learning Objectives</th>
                <th>Remarks</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="item in selectedPortion.lessons"
                :key="item.id"
              >
                <td>{{ item.lesson?.title || '-' }}</td>
                <td>{{ item.topics || '-' }}</td>
                <td>{{ item.learning_objectives || '-' }}</td>
                <td>{{ item.remarks || '-' }}</td>
              </tr>
            </tbody>
          </v-table>

          <v-alert
            v-else
            type="info"
            variant="tonal"
          >
            Syllabus has not been submitted yet.
          </v-alert>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>