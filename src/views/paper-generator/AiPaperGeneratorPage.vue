<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card class="rounded-xl">
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2" color="primary">mdi-robot</v-icon>
            AI Paper Generator
          </v-card-title>

          <v-card-text>
            <v-row>
              <v-col cols="12" md="4">
                <v-select
                  v-model="form.paper_blueprint_id"
                  :items="blueprints"
                  item-title="name"
                  item-value="id"
                  label="Select Blueprint"
                  variant="outlined"
                  density="comfortable"
                  :disabled="saving"
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-select
                  v-model="form.exam_name_id"
                  :items="examNames"
                  item-title="name"
                  item-value="id"
                  label="Select Exam"
                  variant="outlined"
                  density="comfortable"
                  :disabled="saving"
                  :loading="syllabusLoading"
                  @update:model-value="loadExamPortion"
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-select
                  v-model="form.difficulty"
                  :items="difficultyOptions"
                  label="Difficulty"
                  variant="outlined"
                  density="comfortable"
                  :disabled="saving"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.title"
                  label="Paper Title"
                  variant="outlined"
                  density="comfortable"
                  :disabled="saving"
                />
              </v-col>

              <v-col cols="12" md="3">
                <v-select
                  v-model="form.language"
                  :items="languageOptions"
                  label="Language"
                  variant="outlined"
                  density="comfortable"
                  :disabled="saving"
                />
              </v-col>

              <v-col cols="12" md="3" class="d-flex align-center">
                <v-btn
                  color="primary"
                  size="large"
                  block
                  :loading="saving"
                  @click="generatePaper"
                >
                  Generate AI Paper
                </v-btn>
              </v-col>
            </v-row>

            <v-alert
              v-if="syllabus"
              type="success"
              variant="tonal"
              class="mt-4"
            >
              Approved syllabus loaded:
              {{ syllabus.grade?.name || '-' }} /
              {{ syllabus.subject?.name || '-' }}
            </v-alert>

            <v-card
              v-if="syllabus?.lessons?.length"
              class="mt-4"
              variant="tonal"
            >
              <v-card-title>Approved Syllabus</v-card-title>

              <v-card-text>
                <v-list density="compact">
                  <v-list-item
                    v-for="lesson in syllabus.lessons"
                    :key="lesson.id"
                  >
                    <template #title>
                      {{ lesson.lesson?.name || lesson.lesson_name || '-' }}
                    </template>

                    <template #subtitle>
                      Topics: {{ lesson.topics || '-' }}
                      <br />
                      Objectives: {{ lesson.learning_objectives || '-' }}
                    </template>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12">
        <v-card class="rounded-xl">
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2" color="primary">mdi-file-document-outline</v-icon>
            AI Generations

            <v-spacer />

            <v-btn
              variant="tonal"
              color="primary"
              :loading="loading"
              @click="fetchGenerations"
            >
              Refresh
            </v-btn>
          </v-card-title>

          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="generations"
              :loading="loading"
              item-value="id"
            >
              <template #item.status="{ item }">
                <v-chip
                  size="small"
                  :color="statusColor(item.status)"
                  variant="tonal"
                >
                  {{ item.status }}
                </v-chip>
              </template>

              <template #item.progress="{ item }">
                <div style="min-width: 150px">
                  <v-progress-linear
                    :model-value="item.progress_percentage || 0"
                    height="14"
                    rounded
                    color="primary"
                  >
                    <small>{{ item.progress_percentage || 0 }}%</small>
                  </v-progress-linear>

                  <div class="text-caption mt-1">
                    {{ item.progress_message || '-' }}
                  </div>
                </div>
              </template>

              <template #item.total_marks="{ item }">
                {{ item.total_marks || 0 }}
              </template>

              <template #item.actions="{ item }">
                <v-btn
                  icon
                  size="small"
                  variant="text"
                  color="primary"
                  @click="viewGeneration(item)"
                >
                  <v-icon>mdi-eye</v-icon>
                </v-btn>

                <v-btn
                  icon
                  size="small"
                  variant="text"
                  color="success"
                  :disabled="item.status !== 'generated'"
                  @click="saveToQuestionBank(item)"
                >
                  <v-icon>mdi-content-save-check</v-icon>
                </v-btn>

                <v-btn
                  icon
                  size="small"
                  variant="text"
                  color="error"
                  @click="deleteGeneration(item)"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="showProgressDialog" max-width="560" persistent>
      <v-card class="rounded-xl">
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2" color="primary">mdi-robot</v-icon>
          Generating AI Paper
        </v-card-title>

        <v-card-text>
          <div class="text-subtitle-1 font-weight-medium mb-1">
            {{ generationProgress.progress_message || 'Preparing...' }}
          </div>

          <div class="text-caption text-grey mb-4">
            {{ generationProgress.current_section || 'Starting generation...' }}
          </div>

          <v-progress-linear
            :model-value="generationProgress.progress_percentage || 0"
            height="22"
            rounded
            striped
            color="primary"
          >
            <strong>{{ generationProgress.progress_percentage || 0 }}%</strong>
          </v-progress-linear>

          <v-alert
            v-if="generationProgress.status === 'generated'"
            type="success"
            variant="tonal"
            class="mt-4"
          >
            AI paper generated successfully.
            Total Questions: {{ generationProgress.total_questions }},
            Marks: {{ generationProgress.total_marks }}
          </v-alert>

          <v-alert
            v-if="generationProgress.status === 'failed'"
            type="error"
            variant="tonal"
            class="mt-4"
          >
            {{ generationProgress.error_message || 'Generation failed.' }}
          </v-alert>
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn
            v-if="['generated', 'failed', 'converted'].includes(generationProgress.status)"
            color="primary"
            @click="showProgressDialog = false"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="previewDialog" max-width="1000">
      <v-card class="rounded-xl">
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2" color="primary">mdi-eye</v-icon>
          AI Generated Questions

          <v-spacer />

          <v-btn icon variant="text" @click="previewDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text>
          <v-alert
            v-if="selectedGeneration?.status === 'failed'"
            type="error"
            variant="tonal"
            class="mb-4"
          >
            {{ selectedGeneration.error_message }}
          </v-alert>

          <v-expansion-panels>
            <v-expansion-panel
              v-for="question in selectedGeneration?.questions || []"
              :key="question.id"
            >
              <v-expansion-panel-title>
                <div>
                  <strong>Q{{ question.sort_order }}.</strong>
                  {{ question.question }}
                  <v-chip size="x-small" class="ml-2" color="primary" variant="tonal">
                    {{ question.marks }} Marks
                  </v-chip>
                </div>
              </v-expansion-panel-title>

              <v-expansion-panel-text>
                <div class="mb-2">
                  <strong>Answer:</strong>
                  {{ question.answer || '-' }}
                </div>

                <div class="mb-2">
                  <strong>Lesson:</strong>
                  {{ question.lesson?.name || '-' }}
                </div>

                <div class="mb-2">
                  <strong>Type:</strong>
                  {{ question.type?.name || '-' }}
                </div>

                <div v-if="question.options?.length" class="mb-2">
                  <strong>Options:</strong>
                  <v-list density="compact">
                    <v-list-item
                      v-for="option in question.options"
                      :key="option.option_text"
                    >
                      <template #prepend>
                        <v-icon
                          :color="option.is_correct ? 'success' : 'grey'"
                        >
                          {{ option.is_correct ? 'mdi-check-circle' : 'mdi-circle-outline' }}
                        </v-icon>
                      </template>

                      {{ option.option_text }}
                    </v-list-item>
                  </v-list>
                </div>

                <div v-if="question.match_pairs?.length">
                  <strong>Match Pairs:</strong>
                  <v-table density="compact">
                    <tbody>
                      <tr
                        v-for="pair in question.match_pairs"
                        :key="pair.left_value"
                      >
                        <td>{{ pair.left_value }}</td>
                        <td>{{ pair.right_value }}</td>
                      </tr>
                    </tbody>
                  </v-table>
                </div>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn
            color="success"
            :disabled="selectedGeneration?.status !== 'generated'"
            :loading="savingToBank"
            @click="saveToQuestionBank(selectedGeneration)"
          >
            Save to Question Bank & Paper
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import api from '../../plugins/api'
import { useUIStore } from '../../stores/snackBar'

const ui = useUIStore()

const loading = ref(false)
const saving = ref(false)
const savingToBank = ref(false)
const syllabusLoading = ref(false)

const blueprints = ref([])
const examNames = ref([])
const syllabus = ref(null)
const generations = ref([])
const selectedGeneration = ref(null)
const previewDialog = ref(false)

const showProgressDialog = ref(false)
const activeGenerationId = ref(null)
const progressTimer = ref(null)

const generationProgress = ref({
  id: null,
  status: null,
  progress_percentage: 0,
  current_section: null,
  progress_message: null,
  error_message: null,
  total_questions: 0,
  total_marks: 0,
})

const form = ref({
  paper_blueprint_id: null,
  exam_name_id: null,
  exam_portion_id: null,
  title: '',
  language: 'en',
  difficulty: 'medium',
})

const difficultyOptions = [
  { title: 'Easy', value: 'easy' },
  { title: 'Medium', value: 'medium' },
  { title: 'Hard', value: 'hard' },
]

const languageOptions = [
  { title: 'English', value: 'en' },
  { title: 'Hindi', value: 'hi' },
  { title: 'Urdu', value: 'ur' },
]

const headers = [
  { title: 'Title', key: 'title' },
//   { title: 'Blueprint', key: 'blueprint.name' },
  { title: 'Exam', key: 'exam_name.name' },
  { title: 'Status', key: 'status' },
  { title: 'Progress', key: 'progress', sortable: false },
  { title: 'Questions', key: 'total_questions' },
  { title: 'Marks', key: 'total_marks' },
  { title: 'Actions', key: 'actions', sortable: false },
]

const normalizeListResponse = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.data?.data)) return payload.data.data
  return []
}

const resetForm = () => {
  form.value = {
    paper_blueprint_id: null,
    exam_name_id: null,
    exam_portion_id: null,
    title: '',
    language: 'en',
    difficulty: 'medium',
  }

  syllabus.value = null
}

const statusColor = (status) => {
  if (status === 'generated') return 'success'
  if (status === 'generating') return 'primary'
  if (status === 'failed') return 'error'
  if (status === 'converted') return 'purple'
  return 'grey'
}

const fetchBlueprints = async () => {
  try {
    const res = await api.get('/paper-blueprints?per_page=1000')
    blueprints.value = normalizeListResponse(res.data)
  } catch (e) {
    ui.showSnackbar(
      e.response?.data?.message || 'Failed to load blueprints.',
      'error'
    )
  }
}

const fetchExamNames = async () => {
  try {
    const res = await api.get('/exam-names?per_page=1000')
    examNames.value = normalizeListResponse(res.data)
  } catch (e) {
    ui.showSnackbar(
      e.response?.data?.message || 'Failed to load exam names.',
      'error'
    )
  }
}

const fetchGenerations = async () => {
  loading.value = true

  try {
    const res = await api.get('/ai-paper-generations?per_page=50')
    generations.value = normalizeListResponse(res.data)
  } catch (e) {
    ui.showSnackbar(
      e.response?.data?.message || 'Failed to load AI generations.',
      'error'
    )
  } finally {
    loading.value = false
  }
}

const loadExamPortion = async () => {
  syllabus.value = null
  form.value.exam_portion_id = null

  if (!form.value.exam_name_id) return

  syllabusLoading.value = true

  try {
    const res = await api.get(
      `/exam-portions/by-exam/${form.value.exam_name_id}`
    )

    const data = res.data?.data || res.data

    syllabus.value = data
    form.value.exam_portion_id = data.id
  } catch (e) {
    ui.showSnackbar(
      e.response?.data?.message || 'No approved syllabus found for this exam.',
      'warning'
    )
  } finally {
    syllabusLoading.value = false
  }
}

const stopProgressPolling = () => {
  if (progressTimer.value) {
    clearInterval(progressTimer.value)
    progressTimer.value = null
  }
}

const startProgressPolling = (id) => {
  activeGenerationId.value = id
  showProgressDialog.value = true

  stopProgressPolling()

  progressTimer.value = setInterval(async () => {
    try {
      const res = await api.get(`/ai-paper-generations/${id}/progress`)
      generationProgress.value = res.data.data

      if (
        ['generated', 'failed', 'converted'].includes(
          generationProgress.value.status
        )
      ) {
        stopProgressPolling()
        await fetchGenerations()
      }
    } catch (e) {
      stopProgressPolling()

      ui.showSnackbar(
        e.response?.data?.message || 'Failed to fetch generation progress.',
        'error'
      )
    }
  }, 2000)
}

const generatePaper = async () => {
  if (!form.value.paper_blueprint_id) {
    ui.showSnackbar('Please select a blueprint.', 'warning')
    return
  }

  if (!form.value.exam_name_id) {
    ui.showSnackbar('Please select an exam.', 'warning')
    return
  }

  if (!form.value.exam_portion_id) {
    ui.showSnackbar('Approved exam syllabus not loaded.', 'warning')
    return
  }

  const ok = await ui.confirmDialog(
    'Generate AI Paper',
    'Generate a new AI question paper using the selected blueprint and approved syllabus?'
  )

  if (!ok) return

  saving.value = true

  try {
    const res = await api.post('/ai-paper-generations', form.value)

    ui.showSnackbar(res.data?.message || 'AI paper generation started.')

    const generationId = res.data?.data?.id

    resetForm()
    await fetchGenerations()

    if (generationId) {
      generationProgress.value = {
        id: generationId,
        status: 'draft',
        progress_percentage: 0,
        current_section: null,
        progress_message: 'Starting AI generation...',
        error_message: null,
        total_questions: 0,
        total_marks: 0,
      }

      startProgressPolling(generationId)
    }
  } catch (e) {
    console.error('AI generation error:', e.response?.data || e)

    ui.showSnackbar(
      e.response?.data?.message || 'Failed to generate paper.',
      'error'
    )
  } finally {
    saving.value = false
  }
}

const viewGeneration = async (item) => {
  try {
    const res = await api.get(`/ai-paper-generations/${item.id}`)
    selectedGeneration.value = res.data.data
    previewDialog.value = true
  } catch (e) {
    ui.showSnackbar(
      e.response?.data?.message || 'Failed to load AI generation.',
      'error'
    )
  }
}

const saveToQuestionBank = async (item) => {
  if (!item?.id) return

  const ok = await ui.confirmDialog(
    'Save AI Questions',
    'Save selected AI questions to Question Bank and create AI Question Paper?'
  )

  if (!ok) return

  savingToBank.value = true

  try {
    const res = await api.post(
      `/ai-paper-generations/${item.id}/save-to-question-bank`
    )

    ui.showSnackbar(
      res.data?.message || 'Saved to Question Bank and Paper successfully.'
    )

    previewDialog.value = false
    await fetchGenerations()
  } catch (e) {
    ui.showSnackbar(
      e.response?.data?.message || 'Failed to save questions.',
      'error'
    )
  } finally {
    savingToBank.value = false
  }
}

const deleteGeneration = async (item) => {
  const ok = await ui.confirmDialog(
    'Delete AI Generation',
    'Are you sure you want to delete this AI generation?'
  )

  if (!ok) return

  try {
    const res = await api.delete(`/ai-paper-generations/${item.id}`)

    ui.showSnackbar(res.data?.message || 'AI generation deleted.')
    await fetchGenerations()
  } catch (e) {
    ui.showSnackbar(
      e.response?.data?.message || 'Failed to delete AI generation.',
      'error'
    )
  }
}

onMounted(async () => {
  await fetchBlueprints()
  await fetchExamNames()
  await fetchGenerations()
})

onUnmounted(() => {
  stopProgressPolling()
})
</script>