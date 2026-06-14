<script setup>
import { computed, ref, onMounted, nextTick } from "vue";
import draggable from "vuedraggable";

const openSections = ref({});

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  canAcceptQuestion: {
    type: Function,
    default: null,
  },
});

const emit = defineEmits([
  "update:modelValue",
  "print",
  "replace-question",
  "remove-question",
  "preview-question",
  "blueprint-refresh",
  "blueprint-invalid-drop",
  "blueprint-invalid-drop",
]);

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

const removeQuestionFromSection = (section, questionIndex) => {
  section.questions.splice(questionIndex, 1);

  emit("update:modelValue", [...sections.value]);
  emit("blueprint-refresh");
};

const removeSection = (index) => {
  sections.value.splice(index, 1);
};

const toggleSection = (index) => {
  openSections.value[index] = !openSections.value[index];
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
    total += Number.isFinite(Number(q.marks)) ? Number(q.marks) : 0;
  });

  return total;
};

const normalizeQuestion = (q = {}) => {
  const type =
    q.type?.slug ||
    q.question_type?.slug ||
    q.question_type?.question_type ||
    q.question_type ||
    q.type ||
    "";

  const typeName =
    q.type?.name ||
    q.question_type?.name ||
    q.question_type_name ||
    q.type_name ||
    type;

  return {
    ...q,
    type,
    question_type: type,
    question_type_name: typeName,
    difficulty: q.difficulty || q.difficulty_level,
    difficulty_level: q.difficulty || q.difficulty_level,
    bloom_level: q.bloom_level || q.bloom,
  };
};

const questionTypeName = (question = {}) => {
  if (!question) return "-";

  if (typeof question.type === "object") {
    return question.type?.name || question.type?.slug || "-";
  }

  if (typeof question.question_type === "object") {
    return question.question_type?.name || question.question_type?.slug || "-";
  }

  return (
    question.question_type_name ||
    question.type_name ||
    question.type ||
    question.question_type ||
    "-"
  );
};

const canMoveQuestionToSection = (section, evt) => {
  const question = evt?.draggedContext?.element;

  if (!question || !question.id) return false;

  if (!props.canAcceptQuestion) return true;

  const allowed = props.canAcceptQuestion(section, normalizeQuestion(question));

  if (!allowed) {
    emit("blueprint-invalid-drop");
  }

  return allowed;
};

const onQuestionDropped = async (sectionIndex, evt) => {
  await nextTick();

  const section = sections.value[sectionIndex];
  if (!section) return;

  const newIndex = evt?.newIndex;

  if (newIndex === undefined || newIndex === null) {
    emit("blueprint-refresh");
    return;
  }

  const droppedQuestion = section.questions[newIndex];
  if (!droppedQuestion) {
    emit("blueprint-refresh");
    return;
  }

  const normalizedQuestion = normalizeQuestion(droppedQuestion);

  const sectionBeforeDrop = {
    ...section,
    questions: section.questions.filter((_, index) => index !== newIndex),
  };

  const allowed = props.canAcceptQuestion
    ? props.canAcceptQuestion(sectionBeforeDrop, normalizedQuestion)
    : true;

  if (!allowed) {
    section.questions.splice(newIndex, 1);

    emit("update:modelValue", [...sections.value]);
    emit("blueprint-invalid-drop");
    emit("blueprint-refresh");
    return;
  }

  section.questions.splice(newIndex, 1, normalizedQuestion);

  emit("update:modelValue", [...sections.value]);

  await nextTick();
  emit("blueprint-refresh");
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
    <div v-for="(section, index) in sections" :key="section.name" class="mb-6">
      <v-card class="rounded-xl" elevation="0">
        <!-- SECTION HEADER -->
        <div class="d-flex justify-space-between align-center pa-4">
          <div class="d-flex ga-3 align-center">
            <v-btn icon variant="text" size="small" @click="toggleSection(index)">
              <v-icon>
                {{
                  openSections[index] ? "mdi-chevron-up" : "mdi-chevron-down"
                }}
              </v-icon>
            </v-btn>

            <!-- SECTION NAME -->
            <v-text-field v-model="section.name" density="compact" hide-details label="Section Name"
              style="min-width: 150px" />

            <!-- TOTAL -->
            <v-chip color="primary" variant="tonal">
              {{ getSectionMarks(section) }}
              Marks
            </v-chip>
          </div>

          <!-- DELETE -->
          <v-btn icon="mdi-delete" color="error" variant="text" @click="removeSection(index)" />
        </div>

        <v-divider />

        <v-expand-transition>
          <div v-show="openSections[index]">
            <!-- INSTRUCTIONS -->
            <div class="pa-4">
              <v-textarea v-model="section.instructions" label="Section Instructions" rows="2" auto-grow />
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
              <draggable
  v-model="section.questions"
  item-key="id"
  handle=".drag-handle"
  animation="200"
  :group="{ name: 'questions', pull: true, put: true }"
  :move="(evt) => canMoveQuestionToSection(section, evt)"
  @add="(evt) => onQuestionDropped(index, evt)"
  @update="() => emit('blueprint-refresh')"
  
>
                <template #item="{ element, index }">
                  <v-card class="mb-2" rounded="lg" variant="outlined">
                    <v-card-text>
                      <div class="d-flex align-center">
                        <v-icon class="drag-handle mr-2" color="grey">
                          mdi-drag
                        </v-icon>

                        <v-chip size="small" color="primary">
                          Q{{ index + 1 }}
                        </v-chip>

                        <v-chip class="ml-2" size="small" color="success">
                          {{ questionTypeName(element) }}
                        </v-chip>
                        <v-chip class="ml-2" size="small" color="warning">
                          {{ element?.difficulty || element?.difficulty_level }}
                        </v-chip>

                        <v-spacer />

                        <v-chip size="small" color="success">
                          {{ element.marks }} Marks
                        </v-chip>

                        <v-tooltip text="Preview">
                          <template #activator="{ props }">
                            <v-btn v-bind="props" icon="mdi-eye" size="small" variant="text"
                              @click="$emit('preview-question', element)" />
                          </template>
                        </v-tooltip>

                        <v-tooltip text="Replace Question">
                          <template #activator="{ props }">
                            <v-btn v-bind="props" icon="mdi-refresh" size="small" variant="text" color="warning" @click="
                              $emit('replace-question', {
                                question: element,
                                sectionIndex: sections.findIndex(
                                  (s) => s === section,
                                ),
                                questionIndex: index,
                              })
                              " />
                          </template>
                        </v-tooltip>

                        <v-tooltip text="Remove Question">
                          <template #activator="{ props }">
                            <v-btn v-bind="props" icon="mdi-delete" size="small" variant="text" color="error"
                              @click="removeQuestionFromSection(section, index)" />
                          </template>
                        </v-tooltip>
                      </div>

                      <div class="mt-3" v-html="element.question" />
                    </v-card-text>
                  </v-card>
                </template>
              </draggable>
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

.cursor-grab {
  cursor: grab;
}

.drag-handle {
  cursor: move;
}
</style>