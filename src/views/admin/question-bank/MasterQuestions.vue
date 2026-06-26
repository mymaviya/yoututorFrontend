<template>
  <v-container fluid>
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">Master Questions</h1>
        <p class="text-grey">
          Manage platform-owned premium questions for question bank packages.
        </p>
      </div>

      <v-btn color="primary" prepend-icon="mdi-plus" :to="{ name: 'admin.master-questions.create' }">
        Add Question
      </v-btn>
    </div>

    <v-card class="rounded-xl mb-4" elevation="0">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="3">
            <v-select v-model="filters.question_bank_package_id" :items="packages" item-title="name" item-value="id"
              label="Package" clearable variant="outlined" density="comfortable" @update:model-value="fetchQuestions" />
          </v-col>

          <v-col cols="12" md="3">
            <v-text-field v-model="filters.search" label="Search" clearable variant="outlined" density="comfortable"
              @keyup.enter="fetchQuestions" @click:clear="fetchQuestions" />
          </v-col>

          <v-col cols="12" md="2">
            <v-select v-model="filters.difficulty" :items="['easy', 'medium', 'hard']" label="Difficulty" clearable
              variant="outlined" density="comfortable" @update:model-value="fetchQuestions" />
          </v-col>

          <v-col cols="12" md="2">
            <v-select v-model="filters.status" :items="[
              { title: 'Active', value: 'active' },
              { title: 'Inactive', value: 'inactive' }
            ]" label="Status" clearable variant="outlined" density="comfortable"
              @update:model-value="fetchQuestions" />
          </v-col>

          <v-col cols="12" md="2">
            <v-btn block color="primary" variant="tonal" @click="fetchQuestions">
              Filter
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card class="rounded-xl" elevation="0">
      <v-data-table-server v-model:page="pagination.page" v-model:items-per-page="pagination.per_page"
        :headers="headers" :items="questions" :items-length="pagination.total" :loading="loading"
        @update:options="onTableOptions">
        <template #item.question="{ item }">
          <div class="py-2">
            <div class="font-weight-medium" v-html="item.question"></div>
            <div class="text-caption text-grey mt-1">
              {{ item.grade?.name || '-' }}
              <span v-if="item.stream"> / {{ item.stream?.name }}</span>
              / {{ item.subject?.name || '-' }}
              <span v-if="item.lesson"> / {{ item.lesson?.name }}</span>
            </div>
          </div>
        </template>

        <template #item.package="{ item }">
          {{ item.package?.name || '-' }}
        </template>

        <template #item.type="{ item }">
          {{ item.type?.name || '-' }}
        </template>

        <template #item.is_active="{ item }">
          <v-chip size="small" variant="tonal" :color="item.is_active ? 'success' : 'error'">
            {{ item.is_active ? 'Active' : 'Inactive' }}
          </v-chip>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex ga-1 justify-end">
            <v-btn icon="mdi-pencil" size="small" variant="text" color="primary"
              :to="{ name: 'admin.master-questions.edit', params: { id: item.id } }" />

            <v-btn icon="mdi-delete" size="small" variant="text" color="error" @click="deleteQuestion(item)" />
          </div>
        </template>
      </v-data-table-server>
    </v-card>

    <v-dialog v-model="dialog" max-width="900" persistent>
      <v-card class="rounded-xl">
        <v-card-title class="d-flex justify-space-between align-center">
          {{ editMode ? 'Edit Master Question' : 'Add Master Question' }}

          <v-btn icon="mdi-close" variant="text" @click="dialog = false" />
        </v-card-title>

        <v-divider />

        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-select v-model="form.question_bank_package_id" :items="packages" item-title="name" item-value="id"
                label="Package" variant="outlined" :error-messages="errors.question_bank_package_id" />
            </v-col>

            <v-col cols="12" md="6">
              <v-select v-model="form.question_type_master_id" :items="questionTypes" item-title="name" item-value="id"
                label="Question Type" variant="outlined" :error-messages="errors.question_type_master_id" />
            </v-col>

            <v-col cols="12" md="4">
              <v-select v-model="form.grade_id" :items="grades" item-title="name" item-value="id" label="Grade"
                variant="outlined" :error-messages="errors.grade_id" />
            </v-col>

            <v-col cols="12" md="4">
              <v-select v-model="form.stream_id" :items="streams" item-title="name" item-value="id" label="Stream"
                clearable variant="outlined" :error-messages="errors.stream_id" />
            </v-col>

            <v-col cols="12" md="4">
              <v-select v-model="form.subject_id" :items="subjects" item-title="name" item-value="id" label="Subject"
                variant="outlined" :error-messages="errors.subject_id" />
            </v-col>

            <v-col cols="12" md="6">
              <v-select v-model="form.lesson_id" :items="lessons" item-title="name" item-value="id" label="Lesson"
                clearable variant="outlined" :error-messages="errors.lesson_id" />
            </v-col>

            <v-col cols="12" md="3">
              <v-select v-model="form.difficulty" :items="['easy', 'medium', 'hard']" label="Difficulty"
                variant="outlined" :error-messages="errors.difficulty" />
            </v-col>

            <v-col cols="12" md="3">
              <v-select v-model="form.bloom_level" :items="bloomOptions" label="Bloom Level" clearable
                variant="outlined" :error-messages="errors.bloom_level" />
            </v-col>

            <v-col cols="12" md="3">
              <v-text-field v-model="form.marks" label="Marks" type="number" variant="outlined"
                :error-messages="errors.marks" />
            </v-col>

            <v-col cols="12" md="3">
              <v-switch v-model="form.is_active" label="Active" color="success" />
            </v-col>

            <v-col cols="12">
              <v-textarea v-model="form.question" label="Question" rows="4" variant="outlined"
                :error-messages="errors.question" />
            </v-col>

            <v-col cols="12">
              <v-textarea v-model="form.answer" label="Answer" rows="3" variant="outlined"
                :error-messages="errors.answer" />
            </v-col>

            <v-col cols="12">
              <v-textarea v-model="form.explanation" label="Explanation" rows="3" variant="outlined"
                :error-messages="errors.explanation" />
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />

          <v-btn variant="text" @click="dialog = false">
            Cancel
          </v-btn>

          <v-btn color="primary" :loading="saving" @click="saveQuestion">
            {{ editMode ? 'Update' : 'Save' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import api from '../../../plugins/api'
import { useUIStore } from '../../../stores/snackBar'

const ui = useUIStore()

const loading = ref(false)
const saving = ref(false)
const dialog = ref(false)
const editMode = ref(false)

const questions = ref([])
const packages = ref([])
const grades = ref([])
const streams = ref([])
const subjects = ref([])
const lessons = ref([])
const questionTypes = ref([])

const errors = ref({})

const filters = reactive({
  question_bank_package_id: null,
  search: '',
  difficulty: null,
  status: null,
})

const pagination = reactive({
  page: 1,
  per_page: 20,
  total: 0,
})

const form = ref({
  id: null,
  question_bank_package_id: null,
  grade_id: null,
  stream_id: null,
  subject_id: null,
  lesson_id: null,
  question_type_master_id: null,
  question: '',
  difficulty: 'medium',
  bloom_level: null,
  marks: 1,
  answer: '',
  explanation: '',
  language: 'en',
  is_active: true,
})

const headers = [
  { title: 'Question', key: 'question', sortable: false },
  { title: 'Package', key: 'package', sortable: false },
  { title: 'Type', key: 'type', sortable: false },
  { title: 'Difficulty', key: 'difficulty', sortable: false },
  { title: 'Bloom', key: 'bloom_level', sortable: false },
  { title: 'Status', key: 'is_active', sortable: false },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
]

const bloomOptions = [
  'remember',
  'understand',
  'apply',
  'analyze',
  'evaluate',
  'create',
]

const resetForm = () => {
  errors.value = {}

  form.value = {
    id: null,
    question_bank_package_id: null,
    grade_id: null,
    stream_id: null,
    subject_id: null,
    lesson_id: null,
    question_type_master_id: null,
    question: '',
    difficulty: 'medium',
    bloom_level: null,
    marks: 1,
    answer: '',
    explanation: '',
    language: 'en',
    is_active: true,
  }
}

const fetchMeta = async () => {
  try {
    const [packageRes, gradeRes, streamRes, subjectRes, lessonRes, typeRes] =
      await Promise.all([
        api.get('/admin/question-bank-packages', { params: { per_page: 1000 } }),
        api.get('/grades'),
        api.get('/streams'),
        api.get('/subjects'),
        api.get('/lessons'),
        api.get('/question-types'),
      ])

    packages.value = packageRes.data.data?.data || []
    grades.value = gradeRes.data.data || gradeRes.data || []
    streams.value = streamRes.data.data || streamRes.data || []
    subjects.value = subjectRes.data.data || subjectRes.data || []
    lessons.value = lessonRes.data.data || lessonRes.data || []
    questionTypes.value = typeRes.data.data || typeRes.data || []
  } catch (err) {
    ui.showSnackbar('Failed to load form data', 'error')
  }
}

const fetchQuestions = async () => {
  loading.value = true

  try {
    const res = await api.get('/admin/master-questions', {
      params: {
        ...filters,
        page: pagination.page,
        per_page: pagination.per_page,
      },
    })

    const payload = res.data.data

    questions.value = payload.data || []
    pagination.total = payload.total || 0
    pagination.page = payload.current_page || 1
    pagination.per_page = payload.per_page || 20
  } catch (err) {
    ui.showSnackbar(
      err.response?.data?.message || 'Failed to load master questions',
      'error'
    )
  } finally {
    loading.value = false
  }
}

const onTableOptions = (options) => {
  pagination.page = options.page
  pagination.per_page = options.itemsPerPage
  fetchQuestions()
}

const openAdd = () => {
  editMode.value = false
  resetForm()
  dialog.value = true
}

const openEdit = (item) => {
  editMode.value = true
  errors.value = {}

  form.value = {
    id: item.id,
    question_bank_package_id: item.question_bank_package_id,
    grade_id: item.grade_id,
    stream_id: item.stream_id,
    subject_id: item.subject_id,
    lesson_id: item.lesson_id,
    question_type_master_id: item.question_type_master_id,
    question: item.question,
    difficulty: item.difficulty,
    bloom_level: item.bloom_level,
    marks: item.marks,
    answer: item.answer,
    explanation: item.explanation,
    language: item.language || 'en',
    is_active: Boolean(item.is_active),
  }

  dialog.value = true
}

const saveQuestion = async () => {
  saving.value = true
  errors.value = {}

  try {
    if (editMode.value) {
      await api.put(`/admin/master-questions/${form.value.id}`, form.value)
      ui.showSnackbar('Master question updated successfully')
    } else {
      await api.post('/admin/master-questions', form.value)
      ui.showSnackbar('Master question created successfully')
    }

    dialog.value = false
    fetchQuestions()
  } catch (err) {
    if (err.response?.status === 422) {
      errors.value = err.response.data.errors || {}
      ui.showSnackbar('Please fix the validation errors', 'error')
    } else {
      ui.showSnackbar(
        err.response?.data?.message || 'Failed to save master question',
        'error'
      )
    }
  } finally {
    saving.value = false
  }
}

const deleteQuestion = async (item) => {
  const ok = await ui.confirmDialog(
    'Delete Master Question',
    'Are you sure you want to delete this master question?'
  )

  if (!ok) return

  try {
    await api.delete(`/admin/master-questions/${item.id}`)
    ui.showSnackbar('Master question deleted successfully')
    fetchQuestions()
  } catch (err) {
    ui.showSnackbar(
      err.response?.data?.message || 'Failed to delete master question',
      'error'
    )
  }
}

onMounted(async () => {
  await fetchMeta()
  await fetchQuestions()
})
</script>