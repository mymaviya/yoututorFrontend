<script setup>
import { computed, ref, onMounted } from "vue";

const openSections = ref({});

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["update:modelValue"]);

const sections = computed({
  get: () => props.modelValue,

  set: (value) => {
    emit("update:modelValue", value);
  },
});

const addSection = () => {
  sections.value.push({
    name: `Section ${String.fromCharCode(65 + sections.value.length)}`,

    instructions: "",

    questions: [],
  });
};

const removeSection = (index) => {
  sections.value.splice(index, 1);
};

const toggleSection = (index) => {
  openSections.value[index] = !openSections.value[index];
};

const removeQuestion = (sectionIndex, questionId) => {
  sections.value[sectionIndex].questions = sections.value[
    sectionIndex
  ].questions.filter((q) => q.id !== questionId);
};

const stripHtml = (html = "") => {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
};

const getOptionLayout = (question) => {
  if (!question.options?.length) return "two-column";

  const hasImage = question.options.some((option) => option.option_image);

  if (hasImage) return "one-column";

  const longestOption = Math.max(
    ...question.options.map(
      (option) => stripHtml(option.option_text || "").length,
    ),
  );

  if (longestOption <= 20) return "four-column";

  if (longestOption <= 60) return "two-column";

  return "one-column";
};

const getSectionMarks = (section) => {
  let total = 0;

  section.questions.forEach((q) => {
    total += Number(q.marks);
  });

  return total;
};

onMounted(() => {
  sections.value.forEach((_, i) => {
    openSections.value[i] = true;
  });
});
</script>

<template>
  <div>
    <!-- HEADER -->
    <div class="d-flex justify-space-between align-center mb-4">
      <div class="text-h6 font-weight-bold">Paper Sections</div>

      <v-btn color="primary" prepend-icon="mdi-plus" @click="addSection">
        Add Section
      </v-btn>
    </div>

    <!-- SECTIONS -->
    <div v-for="(section, index) in sections" :key="index" class="mb-6">
      <v-card class="rounded-xl" elevation="0">
        <!-- SECTION HEADER -->
        <div class="d-flex justify-space-between align-center pa-4">
          <div class="d-flex ga-3 align-center">
            <v-btn
              icon
              variant="text"
              size="small"
              @click="toggleSection(index)"
            >
              <v-icon>
                {{
                  openSections[index] ? "mdi-chevron-up" : "mdi-chevron-down"
                }}
              </v-icon>
            </v-btn>

            <!-- SECTION NAME -->
            <v-text-field
              v-model="section.name"
              density="compact"
              hide-details
              label="Section Name"
              width="220"
            />

            <!-- TOTAL -->
            <v-chip color="primary" variant="tonal">
              {{ getSectionMarks(section) }}
              Marks
            </v-chip>
          </div>

          <!-- DELETE -->
          <v-btn
            icon="mdi-delete"
            color="error"
            variant="text"
            @click="removeSection(index)"
          />
        </div>

        <v-divider />

        <v-expand-transition>
          <div v-show="openSections[index]">
            <!-- INSTRUCTIONS -->
            <div class="pa-4">
              <v-textarea
                v-model="section.instructions"
                label="Section Instructions"
                rows="2"
                auto-grow
              />
            </div>

            <!-- QUESTIONS -->
            <div class="px-4 pb-4">
              <div v-if="!section.questions.length" class="empty-state">
                <v-icon size="40" class="mb-2">
                  mdi-file-question-outline
                </v-icon>

                <div>No questions added</div>
              </div>

              <!-- QUESTION LIST -->
              <div
                v-for="(question, qIndex) in section.questions"
                :key="question.id"
                class="question-card"
              >
                <!-- TOP -->
                <div class="d-flex justify-space-between align-center mb-3">
                  <div class="d-flex ga-2">
                    <!-- NUMBER -->
                    <v-chip size="small" color="primary">
                      Q{{ qIndex + 1 }}
                    </v-chip>

                    <!-- TYPE -->
                    <v-chip size="small" variant="tonal">
                      {{ question.type }}
                    </v-chip>

                    <!-- DIFFICULTY -->
                    <v-chip
                      size="small"
                      :color="
                        question.difficulty === 'easy'
                          ? 'success'
                          : question.difficulty === 'medium'
                            ? 'warning'
                            : 'error'
                      "
                      variant="tonal"
                    >
                      {{ question.difficulty }}
                    </v-chip>

                    <!-- MARKS -->
                    <v-chip size="small" color="secondary" variant="tonal">
                      {{ question.marks }}
                      Marks
                    </v-chip>
                  </div>

                  <!-- REMOVE -->
                  <v-btn
                    icon="mdi-close"
                    size="small"
                    color="error"
                    variant="text"
                    @click="removeQuestion(index, question.id)"
                  />
                </div>

                <!-- IMAGE -->
                <v-img
                  v-if="question.question_image"
                  :src="question.question_image"
                  width="160"
                  class="mb-3 rounded"
                />

                <!-- QUESTION -->
                <MathContent class="question-html" :html="question.question" />

                <!-- OPTIONS -->
                <div
                  v-if="question.options && question.options.length"
                  :class="['mt-4', 'mcq-options', getOptionLayout(question)]"
                >
                  <div
                    v-for="(option, optIndex) in question.options"
                    :key="option.id"
                    class="option-card"
                  >
                    <!-- OPTION LABEL -->
                    <div class="option-label">
                      {{ String.fromCharCode(65 + optIndex) }}
                    </div>

                    <!-- TEXT -->
                    <div class="option-content">
                      <MathContent
                        v-if="option.option_text"
                        :html="option.option_text"
                      />

                      <v-img
                        v-if="option.option_image"
                        :src="option.option_image"
                        width="100"
                        class="rounded mt-2"
                      />
                    </div>
                  </div>
                </div>
                <!-- Match the Column -->
                <div
                  v-if="
                    question.type === 'match_column' &&
                    question.match_pairs?.length
                  "
                  class="match-column mt-4"
                >
                  <div class="match-title">Match the Column</div>

                  <div class="match-grid">
                    <div>
                      <strong>Column A</strong>

                      <div
                        v-for="(pair, i) in question.match_pairs"
                        :key="pair.id"
                        class="match-row"
                      >
                        {{ i + 1 }}. {{ pair.left_text }}
                      </div>
                    </div>

                    <div>
                      <strong>Column B</strong>

                      <div
                        v-for="(pair, i) in question.match_pairs"
                        :key="pair.id"
                        class="match-row"
                      >
                        {{ String.fromCharCode(65 + i) }}. {{ pair.right_text }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </v-expand-transition>
      </v-card>
    </div>
  </div>
</template>

<style scoped>
.empty-state {
  border: 2px dashed rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  padding: 40px;
  text-align: center;
  color: grey;
}

.match-title {
  font-weight: bold;
  margin-bottom: 8px;
}

.match-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.match-row {
  margin-top: 6px;
}

/* New */
.option-card {
  display: flex;
  align-items: flex-start;
  gap: 6px;

  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  padding: 10px;
  min-height: 36px;
}

.option-label {
  flex: 0 0 24px;
  font-weight: bold;
  line-height: 1.45;
  padding-top: 0;
}

.option-label::after {
  content: ".";
}

.option-content {
  flex: 1;
  min-width: 0;
  line-height: 1.45;
}

.option-content :deep(p) {
  margin: 0;
  display: inline;
}

.option-content :deep(.math-content) {
  display: inline;
}

.option-content :deep(.katex) {
  font-size: 1.05em;
}

/* new end */

.question-html :deep(p) {
  margin-bottom: 6px;
}

.section-header {
  cursor: pointer;
  user-select: none;
}

.section-header:hover {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
}

.mcq-options {
  display: grid;
  gap: 8px 14px;
}

/*
|--------------------------------------------------------------------------
| FOUR COLUMN
|--------------------------------------------------------------------------
*/

.four-column {
  grid-template-columns: repeat(4, 1fr);
}

/*
|--------------------------------------------------------------------------
| TWO COLUMN
|--------------------------------------------------------------------------
*/

.two-column {
  grid-template-columns: repeat(2, 1fr);
}

/*
|--------------------------------------------------------------------------
| ONE COLUMN
|--------------------------------------------------------------------------
*/

.one-column {
  grid-template-columns: 1fr;
}

@media (max-width: 768px) {
  .four-column,
  .two-column {
    grid-template-columns: 1fr;
  }
}
</style>
