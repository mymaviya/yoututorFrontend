<template>
  <v-container fluid>
    <v-card class="rounded-xl">
      <v-card-title class="d-flex align-center justify-space-between flex-wrap ga-3">
        <div>
          <div class="text-h6 font-weight-bold">
            {{ isMasterMode ? 'Master Question Import' : 'Question Import' }}
          </div>
          <div class="text-caption text-medium-emphasis">
            Import questions with difficulty, Bloom level, options and match pairs.
          </div>
        </div>

        <v-btn
          color="primary"
          variant="tonal"
          prepend-icon="mdi-download"
          :loading="templateLoading"
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
            <span v-if="isMasterMode">Package Slug, </span>
            Grade, Stream, Subject, Lesson, Question Type, Question, Difficulty,
            Bloom Level, Marks, Answer, Explanation, Options, Correct Option, Match Pairs
          </strong>
        </v-alert>

        <v-alert
          v-if="isMasterMode"
          type="warning"
          variant="tonal"
          class="mb-4"
        >
          Master import saves platform-owned questions. Select a package below to apply one package to the full file, or leave it blank and use the Package Slug column in Excel.
        </v-alert>

        <v-select
          v-if="isMasterMode"
          v-model="masterPackageId"
          :items="packages"
          item-title="name"
          item-value="id"
          label="Question Bank Package"
          variant="outlined"
          class="mb-4"
          :loading="packagesLoading"
          :error-messages="formErrors.question_bank_package_id"
        />

        <v-file-input
          v-model="file"
          :label="isMasterMode ? 'Select Master Question Import File' : 'Select Question Import File'"
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
          {{ isMasterMode ? 'Import Master Questions' : 'Import Questions' }}
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
                Created: {{ result.created || result.imported || 0 }}
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
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import api from '../../plugins/api'
import { useUIStore } from '../../stores/snackBar'

const route = useRoute()
const ui = useUIStore()

const file = ref(null)
const loading = ref(false)
const templateLoading = ref(false)
const packagesLoading = ref(false)
const result = ref(null)
const formErrors = ref({})
const packages = ref([])
const masterPackageId = ref(null)

const isMasterMode = computed(() => {
  return route.meta?.mode === 'master' ||
    route.meta?.questionMode === 'master' ||
    String(route.name || '').startsWith('admin.master-questions') ||
    route.path.includes('/admin/master-questions')
})

const endpoints = computed(() => {
  if (isMasterMode.value) {
    return {
      template: '/admin/master-questions/import-template',
      import: '/admin/master-questions/import',
      filename: 'master_question_import_template.xlsx',
    }
  }

  return {
    template: '/questions/import-template',
    import: '/questions/import',
    filename: 'question_import_template.xlsx',
  }
})

const getSelectedFile = () => {
  if (Array.isArray(file.value)) {
    return file.value[0]
  }

  return file.value
}

const fetchPackages = async () => {
  if (!isMasterMode.value) return

  packagesLoading.value = true

  try {
    const res = await api.get('/admin/question-bank-packages', {
      params: {
        per_page: 1000,
        status: 'active',
      },
    })

    packages.value = res.data.data?.data || []
  } catch (err) {
    ui.showSnackbar(
      err.response?.data?.message || 'Failed to load question bank packages',
      'error'
    )
  } finally {
    packagesLoading.value = false
  }
}

const downloadTemplate = async () => {
  templateLoading.value = true

  try {
    const res = await api.get(endpoints.value.template, {
      responseType: 'blob',
    })

    const blob = new Blob([res.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const url = window.URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', endpoints.value.filename)
    document.body.appendChild(link)
    link.click()
    link.remove()

    window.URL.revokeObjectURL(url)
    ui.showSnackbar('Template downloaded successfully')
  } catch (err) {
    ui.showSnackbar(
      err.response?.data?.message || 'Failed to download template',
      'error'
    )
  } finally {
    templateLoading.value = false
  }
}

const submitImport = async () => {
  formErrors.value = {}
  result.value = null

  const selectedFile = getSelectedFile()

  if (!selectedFile) {
    formErrors.value = {
      file: ['Please select a file.'],
    }
    ui.showSnackbar('Please select a file', 'warning')
    return
  }

  const formData = new FormData()
  formData.append('file', selectedFile)

  if (isMasterMode.value) {
    formData.append('question_bank_package_id', masterPackageId.value)
  }

  loading.value = true

  try {
    const res = await api.post(endpoints.value.import, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    result.value = res.data
    ui.showSnackbar(
      isMasterMode.value
        ? 'Master question import completed successfully'
        : 'Question import completed successfully'
    )
  } catch (err) {
    if (err.response?.status === 422) {
      formErrors.value = err.response.data.errors || {}
    }

    ui.showSnackbar(
      err.response?.data?.message ||
        (isMasterMode.value ? 'Master question import failed' : 'Question import failed'),
      'error'
    )
  } finally {
    loading.value = false
  }
}

onMounted(fetchPackages)
</script>
