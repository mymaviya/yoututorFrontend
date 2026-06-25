<template>
  <v-container fluid>
    <v-card class="rounded-xl">
      <v-card-title class="d-flex align-center justify-space-between">
        <div>
          <div class="text-h6 font-weight-bold">Question Import</div>
          <div class="text-caption text-medium-emphasis">
            Import questions with difficulty, Bloom level, options and match pairs.
          </div>
        </div>

        <v-btn
          color="primary"
          variant="tonal"
          prepend-icon="mdi-download"
          @click="downloadTemplate"
        >
          Download Template
        </v-btn>
      </v-card-title>

      <v-divider />

      <v-card-text>
        <v-alert type="info" variant="tonal" class="mb-4">
          Required columns:
          <strong>
            Grade, Stream, Subject, Lesson, Question Type, Question, Difficulty,
            Bloom Level, Marks, Answer, Explanation, Options, Correct Option, Match Pairs
          </strong>
        </v-alert>

        <v-file-input
          v-model="file"
          label="Select Question Import File"
          accept=".xlsx,.xls,.csv"
          variant="outlined"
          prepend-icon="mdi-file-excel"
          :error-messages="formErrors.file"
        />

        <v-btn
          color="success"
          prepend-icon="mdi-upload"
          :loading="loading"
          :disabled="!file"
          @click="submitImport"
        >
          Import Questions
        </v-btn>

        <v-card
          v-if="result"
          class="mt-5 rounded-xl"
          variant="outlined"
        >
          <v-card-title class="text-subtitle-1 font-weight-bold">
            Import Result
          </v-card-title>

          <v-card-text>
            <div class="d-flex flex-wrap ga-2 mb-4">
              <v-chip color="success" variant="tonal">
                Created: {{ result.created || 0 }}
              </v-chip>

              <v-chip color="warning" variant="tonal">
                Skipped: {{ result.skipped || 0 }}
              </v-chip>
            </div>

            <v-alert
              v-if="result.errors && result.errors.length"
              type="error"
              variant="tonal"
            >
              <div class="font-weight-bold mb-2">Errors</div>

              <ul>
                <li
                  v-for="(error, index) in result.errors.slice(0, 50)"
                  :key="index"
                >
                  {{ error }}
                </li>
              </ul>
            </v-alert>

            <v-alert
              v-else
              type="success"
              variant="tonal"
            >
              Import completed without errors.
            </v-alert>
          </v-card-text>
        </v-card>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import api from "../../plugins/api";
import { useUIStore } from "../../stores/snackBar";

const ui = useUIStore()

const file = ref(null)
const loading = ref(false)
const result = ref(null)
const formErrors = ref({})

const getSelectedFile = () => {
  if (Array.isArray(file.value)) {
    return file.value[0]
  }

  return file.value
}

const downloadTemplate = async () => {
  const res = await api.get('/questions/import-template', {
    responseType: 'blob',
  })

  const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = window.URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', 'question_import_template.xlsx')
  document.body.appendChild(link)
  link.click()
  link.remove()

  window.URL.revokeObjectURL(url)
}

const submitImport = async () => {
  formErrors.value = {}
  result.value = null

  const selectedFile = getSelectedFile()

  if (!selectedFile) {
    formErrors.value = {
      file: ['Please select a file.'],
    }
    return
  }

  const formData = new FormData()
  formData.append('file', selectedFile)

  loading.value = true

  try {
    const res = await api.post('/questions/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    result.value = res.data
    ui.showSnackbar('Question import completed successfully', 'success')
  } catch (err) {
    if (err.response?.status === 422) {
      formErrors.value = err.response.data.errors || {}
    }

    ui.showSnackbar(
      err.response?.data?.message || 'Question import failed',
      'error'
    )
  } finally {
    loading.value = false
  }
}
</script>