<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from "../../plugins/api";
import { formatDate } from '../../utils/date'

const route = useRoute()

const paper = ref(null)
const loading = ref(false)

const fetchPaper = async () => {
  loading.value = true

  try {
    const res = await api.get(`/question-papers/${route.params.id}`)
    paper.value = res.data.data || res.data
  } finally {
    loading.value = false
  }
}

const printPaper = () => {
  window.print()
}

const groupedQuestions = () => {
  if (!paper.value?.questions?.length) return {}

  return paper.value.questions.reduce((groups, item) => {
    const section = item.section_name || 'Section A'

    if (!groups[section]) {
      groups[section] = []
    }

    groups[section].push(item)

    return groups
  }, {})
}

const optionLabel = index => {
  return String.fromCharCode(65 + index)
}

onMounted(fetchPaper)
</script>

<template>
  <div>
    <div
      class="d-flex justify-space-between align-center mb-4 no-print"
    >
      <div>
        <h1 class="text-h5 font-weight-bold">
          Question Paper Preview
        </h1>

        <p class="text-grey">
          View, print and verify generated question paper.
        </p>
      </div>

      <v-btn
        color="primary"
        prepend-icon="mdi-printer"
        @click="printPaper"
      >
        Print
      </v-btn>
    </div>

    <v-card
      v-if="loading"
      class="pa-6 rounded-xl"
    >
      Loading paper...
    </v-card>

    <v-card
      v-if="paper"
      class="paper-sheet pa-8 rounded-xl"
      elevation="0"
    >
      <!-- HEADER -->
      <div class="text-center mb-4">
        <h2 class="text-h5 font-weight-bold">
          Siddharth Public School
        </h2>

        <div class="text-subtitle-1">
          {{ paper.exam_name || '-' }}
        </div>

        <h3 class="text-h6 font-weight-bold mt-2">
          {{ paper.title }}
        </h3>
      </div>

      <v-divider class="mb-4" />

      <!-- INFO -->
      <v-row class="mb-4">
        <v-col cols="6">
          <strong>Class:</strong>
          {{ paper.grade?.name || '-' }}
        </v-col>

        <v-col cols="6" class="text-right">
          <strong>Subject:</strong>
          {{ paper.subject?.name || '-' }}
        </v-col>

        <v-col cols="6">
          <strong>Date:</strong>
          {{ formatDate(paper.created_at) }}
        </v-col>

        <v-col cols="6" class="text-right">
          <strong>Marks:</strong>
          {{ paper.total_marks || '-' }}
        </v-col>

        <v-col cols="6">
          <strong>Duration:</strong>
          {{ paper.duration || '-' }}
        </v-col>
      </v-row>

      <v-alert
        v-if="paper.instructions"
        type="info"
        variant="tonal"
        class="mb-4"
      >
        <strong>General Instructions:</strong>
        <div>{{ paper.instructions }}</div>
      </v-alert>

      <!-- QUESTIONS -->
      <div
        v-for="(items, sectionName) in groupedQuestions()"
        :key="sectionName"
        class="mb-6"
      >
        <h3 class="text-h6 font-weight-bold mb-2">
          {{ sectionName }}
        </h3>

        <v-divider class="mb-3" />

        <div
          v-for="(paperQuestion, index) in items"
          :key="paperQuestion.id"
          class="mb-5"
        >
          <div class="d-flex justify-space-between align-start">
            <div class="d-flex ga-2">
              <strong>Q{{ index + 1 }}.</strong>

              <div>
                <MathContent
                  :html="paperQuestion.question?.question || paperQuestion.question_text || ''"
                />

                <v-img
                  v-if="paperQuestion.question?.question_image"
                  :src="paperQuestion.question.question_image"
                  max-width="300"
                  class="my-2"
                />
              </div>
            </div>

            <strong>
              {{ paperQuestion.marks }} Marks
            </strong>
          </div>

          <!-- MCQ OPTIONS -->
          <div
            v-if="paperQuestion.question?.options?.length"
            class="ml-8 mt-2"
          >
            <v-row>
              <v-col
                v-for="(option, optIndex) in paperQuestion.question.options"
                :key="option.id"
                cols="12"
                md="6"
              >
                <div class="d-flex ga-2">
                  <strong>{{ optionLabel(optIndex) }}.</strong>

                  <MathContent :html="option.option_text || ''" />

                  <v-img
                    v-if="option.option_image"
                    :src="option.option_image"
                    max-width="120"
                  />
                </div>
              </v-col>
            </v-row>
          </div>

          <!-- MATCH COLUMN -->
          <div
            v-if="paperQuestion.question?.match_pairs?.length || paperQuestion.question?.matchPairs?.length"
            class="ml-8 mt-3"
          >
            <v-row>
              <v-col cols="6">
                <strong>Column A</strong>
              </v-col>

              <v-col cols="6">
                <strong>Column B</strong>
              </v-col>
            </v-row>

            <v-row
              v-for="(pair, pairIndex) in (paperQuestion.question.match_pairs || paperQuestion.question.matchPairs)"
              :key="pair.id"
            >
              <v-col cols="6">
                {{ pairIndex + 1 }}.
                <MathContent :html="pair.left_text || pair.left || ''" />
              </v-col>

              <v-col cols="6">
                {{ optionLabel(pairIndex) }}.
                <MathContent :html="pair.right_text || pair.right || ''" />
              </v-col>
            </v-row>
          </div>
        </div>
      </div>
    </v-card>
  </div>
</template>

<style scoped>
.paper-sheet {
  max-width: 900px;
  margin: auto;
  background: white;
  color: black;
}

@media print {
  .no-print {
    display: none !important;
  }

  .paper-sheet {
    box-shadow: none !important;
    max-width: 100%;
    padding: 0 !important;
  }

  body {
    background: white !important;
  }
}
</style>