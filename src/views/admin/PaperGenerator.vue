<script setup>
import { ref, computed, onMounted } from "vue";
import api from "../../plugins/api";
import { useUIStore } from "../../stores/snackBar";
import PaperBlueprintPreview from '../../components/paper/PaperBlueprintPreview.vue'

const ui = useUIStore()

const grades = ref([])
const subjects = ref([])
const examNames = ref([])
const blueprints = ref([])

const loading = ref(false)
const previewLoading = ref(false)
const generating = ref(false)

const preview = ref(null)
const shortages = ref([])

const form = ref({
  grade_id: null,
  subject_id: null,
  exam_name_id: null,
  paper_blueprint_id: null,
  title: '',
  duration: '',
  instructions: ''
})

const selectedBlueprint = computed(() => {
  return blueprints.value.find(
    b => Number(b.id) === Number(form.value.paper_blueprint_id)
  )
})

const hasShortages = computed(() => shortages.value.length > 0)

const fetchGrades = async () => {
  const res = await api.get('/grades')
  grades.value = res.data.data || res.data
}

const fetchSubjects = async () => {
  if (!form.value.grade_id) {
    subjects.value = []
    return
  }

  const res = await api.get('/subjects', {
    params: { grade_id: form.value.grade_id }
  })

  subjects.value = res.data.data || res.data
}

const fetchExamNames = async () => {
  const res = await api.get('/exam-names')
  examNames.value = (res.data.data || res.data).filter(e => e.is_active)
}

const fetchBlueprints = async () => {
  if (!form.value.grade_id || !form.value.subject_id) {
    blueprints.value = []
    return
  }

  const res = await api.get('/paper-blueprints/dropdown', {
    params: {
      grade_id: form.value.grade_id,
      subject_id: form.value.subject_id,
      exam_name_id: form.value.exam_name_id
    }
  })

  blueprints.value = res.data.data || res.data
}

const onGradeChange = async () => {
  form.value.subject_id = null
  form.value.paper_blueprint_id = null
  preview.value = null
  shortages.value = []

  await fetchSubjects()
}

const onSubjectChange = async () => {
  form.value.paper_blueprint_id = null
  preview.value = null
  shortages.value = []

  await fetchBlueprints()
}

const onExamChange = async () => {
  form.value.paper_blueprint_id = null
  preview.value = null
  shortages.value = []

  await fetchBlueprints()
}

const onBlueprintChange = () => {
  preview.value = null
  shortages.value = []

  if (selectedBlueprint.value) {
    form.value.title = selectedBlueprint.value.title
  }
}

const previewPaper = async () => {
  if (!form.value.paper_blueprint_id) {
    ui.showSnackbar('Please select a blueprint', 'warning')
    return
  }

  previewLoading.value = true
  preview.value = null
  shortages.value = []

  try {
    const res = await api.post('/paper-generator/preview', {
      paper_blueprint_id: form.value.paper_blueprint_id
    })

    preview.value = res.data.data
    shortages.value = res.data.data.shortages || []

    if (shortages.value.length) {
      ui.showSnackbar('Preview generated with shortages', 'warning')
    } else {
      ui.showSnackbar('Preview generated successfully')
    }
  } catch (err) {
    ui.showSnackbar(
      err.response?.data?.message || 'Failed to generate preview',
      'error'
    )
  } finally {
    previewLoading.value = false
  }
}

const generatePaper = async () => {
  if (!form.value.paper_blueprint_id) {
    ui.showSnackbar('Please select a blueprint', 'warning')
    return
  }

  generating.value = true

  try {
    const res = await api.post('/paper-generator/generate', {
      paper_blueprint_id: form.value.paper_blueprint_id,
      title: form.value.title,
      duration: form.value.duration,
      instructions: form.value.instructions
    })

    ui.showSnackbar('Question paper generated successfully')
    preview.value = null
    shortages.value = []

    console.log('Generated Paper:', res.data.data)
  } catch (err) {
    if (err.response?.status === 422) {
      shortages.value = err.response.data.shortages || []
      preview.value = err.response.data.preview || null
    }

    ui.showSnackbar(
      err.response?.data?.message || 'Failed to generate paper',
      'error'
    )
  } finally {
    generating.value = false
  }
}

const questionCount = computed(() => {
  if (!preview.value) return 0

  return preview.value.sections?.reduce((sum, section) => {
    return sum + section.items.reduce((s, item) => {
      return s + item.questions.length
    }, 0)
  }, 0)
})

const totalMarks = computed(() => {
  return preview.value?.total_marks || 0
})

onMounted(() => {
  fetchGrades()
  fetchExamNames()
})
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-h4 font-weight-bold">
        Auto Paper Generator
      </h1>

      <p class="text-grey">
        Generate question papers automatically from approved questions and blueprint rules.
      </p>
    </div>

    <v-card class="pa-4 rounded-xl mb-6" elevation="0">
      <v-row>
        <v-col cols="12" md="3">
          <v-select
            v-model="form.grade_id"
            :items="grades"
            item-title="name"
            item-value="id"
            label="Grade"
            variant="outlined"
            @update:model-value="onGradeChange"
          />
        </v-col>

        <v-col cols="12" md="3">
          <v-select
            v-model="form.subject_id"
            :items="subjects"
            item-title="name"
            item-value="id"
            label="Subject"
            variant="outlined"
            :disabled="!form.grade_id"
            @update:model-value="onSubjectChange"
          />
        </v-col>

        <v-col cols="12" md="3">
          <v-select
            v-model="form.exam_name_id"
            :items="examNames"
            item-title="name"
            item-value="id"
            label="Exam"
            variant="outlined"
            clearable
            @update:model-value="onExamChange"
          />
        </v-col>

        <v-col cols="12" md="3">
          <v-select
            v-model="form.paper_blueprint_id"
            :items="blueprints"
            item-title="title"
            item-value="id"
            label="Blueprint"
            variant="outlined"
            :disabled="!blueprints.length"
            @update:model-value="onBlueprintChange"
          />
        </v-col>

        <v-col cols="12" md="4">
          <v-text-field
            v-model="form.title"
            label="Paper Title"
            variant="outlined"
          />
        </v-col>

        <v-col cols="12" md="4">
          <v-text-field
            v-model="form.duration"
            label="Duration"
            placeholder="2 Hours"
            variant="outlined"
          />
        </v-col>

        <v-col cols="12" md="4">
          <v-text-field
            v-model="form.instructions"
            label="General Instructions"
            variant="outlined"
          />
        </v-col>

        <v-col cols="12" class="d-flex ga-2">
          <v-btn
            color="info"
            prepend-icon="mdi-eye"
            :loading="previewLoading"
            @click="previewPaper"
          >
            Preview Paper
          </v-btn>

          <v-btn
            color="primary"
            prepend-icon="mdi-auto-fix"
            :loading="generating"
            :disabled="hasShortages"
            @click="generatePaper"
          >
            Generate Final Paper
          </v-btn>
        </v-col>
      </v-row>
    </v-card>

    <v-alert
      v-if="hasShortages"
      type="warning"
      variant="tonal"
      class="mb-6"
    >
      <div class="font-weight-bold mb-2">
        Question Shortage Found
      </div>

      <div
        v-for="(item, index) in shortages"
        :key="index"
      >
        {{ item.question_type }}
        |
        Difficulty: {{ item.difficulty || '-' }}
        |
        Bloom: {{ item.bloom_level || '-' }}
        |
        Required: {{ item.required }}
        |
        Available: {{ item.available }}
        |
        Missing: {{ item.missing }}
      </div>
    </v-alert>

    <v-card
      v-if="selectedBlueprint"
      class="pa-4 rounded-xl mb-6"
      variant="outlined"
    >
      <PaperBlueprintPreview :blueprint="selectedBlueprint" />
    </v-card>

    <v-card
      v-if="preview"
      class="pa-4 rounded-xl"
      elevation="0"
    >
      <div class="d-flex justify-space-between align-center mb-4">
        <div>
          <h2 class="text-h5 font-weight-bold">
            Generated Paper Preview
          </h2>

          <p class="text-grey">
            {{ questionCount }} questions | {{ totalMarks }} marks
          </p>
        </div>

        <v-btn
          color="primary"
          prepend-icon="mdi-check"
          :loading="generating"
          :disabled="hasShortages"
          @click="generatePaper"
        >
          Generate Final Paper
        </v-btn>
      </div>

      <v-divider class="mb-4" />

      <div
        v-for="section in preview.sections"
        :key="section.section_name"
        class="mb-6"
      >
        <h3 class="text-h6 font-weight-bold">
          {{ section.section_name }}
        </h3>

        <p
          v-if="section.instructions"
          class="text-grey"
        >
          {{ section.instructions }}
        </p>

        <div
          v-for="item in section.items"
          :key="item.question_type + item.difficulty + item.bloom_level"
          class="mb-4"
        >
          <v-chip
            size="small"
            color="primary"
            variant="tonal"
            class="mb-2"
          >
            {{ item.question_type }}
          </v-chip>

          <v-list lines="two" class="rounded-xl">
            <v-list-item
              v-for="(question, qIndex) in item.questions"
              :key="question.id"
            >
              <template #prepend>
                <strong>{{ qIndex + 1 }}.</strong>
              </template>

              <v-list-item-title>
                <MathContent :html="question.question" />
              </v-list-item-title>

              <v-list-item-subtitle>
                Marks: {{ item.marks_per_question }}
                |
                Difficulty: {{ question.difficulty }}
                |
                Bloom: {{ question.bloom_level || '-' }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </div>
      </div>
    </v-card>
  </div>
</template>
