<template>
  <v-container fluid>
    <v-card class="rounded-xl">
      <v-card-title>
        <div class="text-h6 font-weight-bold">Import Center</div>
        <div class="text-caption text-medium-emphasis">
          Import lessons and questions for demo/testing.
        </div>
      </v-card-title>

      <v-divider />

      <v-card-text>
        <v-tabs v-model="tab" color="primary">
          <v-tab value="lessons">Lessons</v-tab>
          <v-tab value="questions">Questions</v-tab>
        </v-tabs>

        <v-window v-model="tab" class="mt-5">
          <v-window-item value="lessons">
            <v-card variant="outlined" class="rounded-xl pa-4">
              <div class="text-subtitle-1 font-weight-bold mb-2">
                Lesson Import
              </div>

              <v-alert type="info" variant="tonal" class="mb-4">
                Columns:
                <strong>Grade, Stream, Subject, Lesson Name, Genre</strong>
              </v-alert>

              <div class="d-flex flex-wrap ga-3 mb-4">
                <v-btn
                  color="primary"
                  variant="tonal"
                  prepend-icon="mdi-download"
                  @click="downloadLessonTemplate"
                >
                  Download Lesson Template
                </v-btn>
              </div>

              <v-file-input
                v-model="lessonFile"
                label="Select Lesson Excel/CSV File"
                accept=".xlsx,.xls,.csv"
                variant="outlined"
                prepend-icon="mdi-file-excel"
                :error-messages="lessonErrors.file"
              />

              <v-btn
                color="success"
                prepend-icon="mdi-upload"
                :loading="importingLessons"
                :disabled="!lessonFile"
                @click="importLessons"
              >
                Import Lessons
              </v-btn>

              <ImportResult
                v-if="lessonResult"
                class="mt-5"
                :result="lessonResult"
              />
            </v-card>
          </v-window-item>

          <v-window-item value="questions">
            <v-card variant="outlined" class="rounded-xl pa-4">
              <div class="text-subtitle-1 font-weight-bold mb-2">
                Question Import
              </div>

              <v-alert type="info" variant="tonal" class="mb-4">
                Columns:
                <strong>
                  Grade, Stream, Subject, Lesson, Question Type, Question,
                  Difficulty, Bloom Level, Marks, Answer, Options, Correct Option,
                  Match Pairs
                </strong>
              </v-alert>

              <div class="d-flex flex-wrap ga-3 mb-4">
                <v-btn
                  color="primary"
                  variant="tonal"
                  prepend-icon="mdi-download"
                  @click="downloadQuestionTemplate"
                >
                  Download Question Template
                </v-btn>
              </div>

              <v-file-input
                v-model="questionFile"
                label="Select Question Excel/CSV File"
                accept=".xlsx,.xls,.csv"
                variant="outlined"
                prepend-icon="mdi-file-excel"
                :error-messages="questionErrors.file"
              />

              <v-btn
                color="success"
                prepend-icon="mdi-upload"
                :loading="importingQuestions"
                :disabled="!questionFile"
                @click="importQuestions"
              >
                Import Questions
              </v-btn>

              <ImportResult
                v-if="questionResult"
                class="mt-5"
                :result="questionResult"
              />
            </v-card>
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { defineComponent, h, ref } from 'vue'
import api from "../../plugins/api";
import { useUIStore } from "../../stores/snackBar";

const ui = useUIStore()

const tab = ref('lessons')

const lessonFile = ref(null)
const questionFile = ref(null)

const importingLessons = ref(false)
const importingQuestions = ref(false)

const lessonErrors = ref({})
const questionErrors = ref({})

const lessonResult = ref(null)
const questionResult = ref(null)

const getFile = (value) => {
  if (Array.isArray(value)) return value[0]
  return value
}

const downloadFile = async (url, filename) => {
  const res = await api.get(url, {
    responseType: 'blob',
  })

  const blob = new Blob([res.data])
  const downloadUrl = window.URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = downloadUrl
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  link.remove()

  window.URL.revokeObjectURL(downloadUrl)
}

const downloadLessonTemplate = async () => {
  await downloadFile('/lessons/import-template', 'lesson_import_template.csv')
}

const downloadQuestionTemplate = async () => {
  await downloadFile('/questions/import-template', 'question_import_template.csv')
}

const importLessons = async () => {
  lessonErrors.value = {}
  lessonResult.value = null

  const file = getFile(lessonFile.value)

  if (!file) {
    lessonErrors.value = {
      file: ['Please select a lesson import file.'],
    }
    return
  }

  const formData = new FormData()
  formData.append('file', file)

  importingLessons.value = true

  try {
    const res = await api.post('/lessons/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    lessonResult.value = res.data
    ui.showSnackbar('Lesson import completed', 'success')
  } catch (err) {
    if (err.response?.status === 422) {
      lessonErrors.value = err.response.data.errors || {}
    }

    ui.showSnackbar(
      err.response?.data?.message || 'Lesson import failed',
      'error'
    )
  } finally {
    importingLessons.value = false
  }
}

const importQuestions = async () => {
  questionErrors.value = {}
  questionResult.value = null

  const file = getFile(questionFile.value)

  if (!file) {
    questionErrors.value = {
      file: ['Please select a question import file.'],
    }
    return
  }

  const formData = new FormData()
  formData.append('file', file)

  importingQuestions.value = true

  try {
    const res = await api.post('/questions/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    questionResult.value = res.data
    ui.showSnackbar('Question import completed', 'success')
  } catch (err) {
    if (err.response?.status === 422) {
      questionErrors.value = err.response.data.errors || {}
    }

    ui.showSnackbar(
      err.response?.data?.message || 'Question import failed',
      'error'
    )
  } finally {
    importingQuestions.value = false
  }
}

const ImportResult = defineComponent({
  name: 'ImportResult',
  props: {
    result: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    return () =>
      h('div', [
        h(
          'div',
          {
            class: 'd-flex flex-wrap ga-2 mb-3',
          },
          [
            h(
              'span',
              {
                class:
                  'v-chip v-chip--size-default v-chip--variant-tonal text-success',
              },
              `Created: ${props.result.created ?? 0}`
            ),
            h(
              'span',
              {
                class:
                  'v-chip v-chip--size-default v-chip--variant-tonal text-warning',
              },
              `Skipped: ${props.result.skipped ?? 0}`
            ),
          ]
        ),

        Array.isArray(props.result.errors) && props.result.errors.length
          ? h(
              'div',
              {
                class: 'pa-3 rounded bg-red-lighten-5',
              },
              [
                h('div', { class: 'font-weight-bold mb-2 text-error' }, 'Errors'),
                h(
                  'ul',
                  {},
                  props.result.errors.slice(0, 25).map((error) =>
                    h('li', { class: 'text-caption' }, error)
                  )
                ),
              ]
            )
          : h(
              'div',
              {
                class: 'text-success font-weight-medium',
              },
              'No errors found.'
            ),
      ])
  },
})
</script>