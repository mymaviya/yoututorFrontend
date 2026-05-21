<script setup>
const props = defineProps({
  paper: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['print'])

const optionLabel = (index) => {
  return String.fromCharCode(65 + index)
}

const correctOptions = (question) => {
  return (question.options || []).filter(option => option.is_correct)
}

const matchPairs = (question) => {
  return question.match_pairs || question.matchPairs || []
}
</script>

<template>
  <v-card class="pa-4 rounded-xl answer-key-preview" elevation="0">
    <div class="d-flex justify-space-between align-center mb-4 no-print">
      <div>
        <div class="text-h6 font-weight-bold">
          Answer Key Preview
        </div>

        <div class="text-caption text-grey">
          Section-wise answers for generated question paper.
        </div>
      </div>

      <v-btn
        color="primary"
        prepend-icon="mdi-printer"
        @click="emit('print')"
      >
        Print Answer Key
      </v-btn>
    </div>

    <div class="answer-sheet">
      <div class="text-center mb-4">
        <h2 class="text-h6 font-weight-bold">
          Answer Key
        </h2>

        <div class="font-weight-medium">
          {{ paper.title }}
        </div>

        <div class="text-caption">
          {{ paper.exam_type || paper.exam_name || '' }}
        </div>
      </div>

      <v-divider class="mb-4" />

      <div
        v-for="(section, sectionIndex) in paper.sections"
        :key="section.name || sectionIndex"
        class="mb-5"
      >
        <h3 class="text-subtitle-1 font-weight-bold mb-2">
          {{ section.name || section.section_name }}
        </h3>

        <v-table density="compact">
          <thead>
            <tr>
              <th style="width: 60px">Q.No.</th>
              <th>Question Type</th>
              <th>Answer</th>
              <th style="width: 80px">Marks</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="(question, qIndex) in section.questions"
              :key="question.id || qIndex"
            >
              <td>
                {{ qIndex + 1 }}
              </td>

              <td class="text-capitalize">
                {{ question.type?.replaceAll('_', ' ') }}
              </td>

              <td>
                <!-- MCQ -->
                <div v-if="question.options?.length">
                  <div
                    v-for="(option, optIndex) in correctOptions(question)"
                    :key="option.id || optIndex"
                    class="d-flex ga-2"
                  >
                    <strong>
                      {{ optionLabel(question.options.indexOf(option)) }}.
                    </strong>

                    <MathContent :html="option.option_text || ''" />
                  </div>
                </div>

                <!-- MATCH COLUMN -->
                <div v-else-if="matchPairs(question).length">
                  <div
                    v-for="(pair, pairIndex) in matchPairs(question)"
                    :key="pair.id || pairIndex"
                    class="mb-1"
                  >
                    <strong>{{ pairIndex + 1 }}.</strong>
                    <MathContent :html="pair.left_text || pair.left || ''" />
                    <span class="mx-2">→</span>
                    <MathContent :html="pair.right_text || pair.right || ''" />
                  </div>
                </div>

                <!-- TEXT ANSWER -->
                <div v-else>
                  <MathContent
                    :html="question.answer || question.correct_answer || '-'"
                  />
                </div>
              </td>

              <td>
                {{ question.marks || '-' }}
              </td>
            </tr>
          </tbody>
        </v-table>
      </div>
    </div>
  </v-card>
</template>

<style scoped>
.answer-sheet {
  background: white;
  color: black;
  padding: 24px;
  border-radius: 16px;
}

@media print {
  .no-print {
    display: none !important;
  }

  .answer-key-preview {
    box-shadow: none !important;
  }

  .answer-sheet {
    padding: 0;
    border-radius: 0;
  }
}
</style>