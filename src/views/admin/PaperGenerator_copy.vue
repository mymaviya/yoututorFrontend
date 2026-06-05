<script setup>
import { ref, computed, onMounted, watch } from "vue";
import api from "../../plugins/api";
import PaperSections from "../exams/components/PaperSections.vue";
import GeneratedPaperPreview from "../exams/components/GeneratedPaperPreview.vue";
import BlueprintSelectorCard from "../../components/paper/BlueprintSelectorCard.vue";
import AppEditor from "../exams/components/AppEditor.vue";
import { useUIStore } from "../../stores/snackBar";

const ui = useUIStore();

const loading = ref(false);
const blueprintLoading = ref(false);

const grades = ref([]);
const subjects = ref([]);
const examNames = ref([]);
const blueprints = ref([]);
const questions = ref([]);

const selectedBlueprintId = ref(null);
const selectedBlueprint = ref(null);

const filters = ref({
  grade_id: null,
  subject_id: null,
  exam_name_id: null,
  type: null,
  difficulty: null,
  search: "",
});

const paper = ref({
  title: "",
  exam_type: "",
  duration: 60,
  instructions: "",
  grade_id: null,
  subject_id: null,
  exam_name_id: null,
  status: "draft",
  sections: [
    {
      name: "Section A",
      instructions: "",
      questions: [],
    },
  ],
});

const questionTypes = [
  { title: "MCQ", value: "mcq" },
  { title: "Multiple MCQ", value: "multiple_mcq" },
  { title: "True / False", value: "true_false" },
  { title: "Fill in the Blank", value: "fill_blank" },
  { title: "Short Answer", value: "short" },
  { title: "Long Answer", value: "long" },
  { title: "Match the Column", value: "match_column" },
  { title: "Assertion Reason", value: "assertion_reason" },
  { title: "Numerical", value: "numerical" },
];

const difficulties = ["easy", "medium", "hard"];

const fetchGrades = async () => {
  const res = await api.get("/grades");
  grades.value = res.data.data || res.data;
};

const fetchSubjects = async () => {
  subjects.value = [];
  blueprints.value = [];
  selectedBlueprintId.value = null;
  selectedBlueprint.value = null;
  questions.value = [];

  filters.value.subject_id = null;
  filters.value.exam_name_id = null;

  if (!filters.value.grade_id) return;

  const res = await api.get("/subjects", {
    params: {
      grade_id: filters.value.grade_id,
    },
  });

  subjects.value = res.data.data || res.data;
};

const onSubjectChange = async () => {
  selectedBlueprintId.value = null;
  selectedBlueprint.value = null;

  await fetchBlueprints();
  await fetchQuestions();
};

const fetchExamNames = async () => {
  const res = await api.get("/exam-names");
  examNames.value = (res.data.data || res.data).filter((e) => e.is_active);
};

const fetchBlueprints = async () => {
  blueprints.value = [];

  if (!filters.value.grade_id || !filters.value.subject_id) {
    return;
  }

  try {
    const res = await api.get("/paper-blueprints/dropdown", {
      params: {
        grade_id: filters.value.grade_id,
        subject_id: filters.value.subject_id,
      },
    });

    blueprints.value = Array.isArray(res.data) ? res.data : res.data.data || [];

    console.log("Blueprints:", blueprints.value);
  } catch (err) {
    console.error(err);
  }
};

const fetchBlueprintDetails = async () => {
  selectedBlueprint.value = null;

  if (!selectedBlueprintId.value) return;

  const res = await api.get(`/paper-blueprints/${selectedBlueprintId.value}`);

  selectedBlueprint.value = res.data;

  paper.value.title = res.data.title;
  paper.value.grade_id = res.data.grade_id;
  paper.value.subject_id = res.data.subject_id;
  paper.value.exam_name_id = res.data.exam_name_id;
  paper.value.exam_type =
    res.data.exam_name?.name || res.data.examName?.name || "";
  paper.value.instructions = defaultInstructions.value;
};

const fetchQuestions = async () => {
  if (!filters.value.grade_id || !filters.value.subject_id) {
    questions.value = [];
    return;
  }

  loading.value = true;

  try {
    const res = await api.get("/questions", {
      params: {
        for_paper: 1,
        grade_id: filters.value.grade_id,
        subject_id: filters.value.subject_id,
        type: filters.value.type,
        difficulty: filters.value.difficulty,
        search: filters.value.search,
      },
    });

    // questions.value = res.data.data || res.data;
    questions.value = (res.data.data || res.data).map((q) => ({
      ...q,
      selected_items: [],
    }));
  } catch (err) {
    ui.showSnackbar("Failed to load questions", "error");
  } finally {
    loading.value = false;
  }
};

const generateFromBlueprint = async () => {
  if (!selectedBlueprintId.value) {
    ui.showSnackbar("Please select a blueprint", "warning");
    return;
  }

  blueprintLoading.value = true;

  try {
    const res = await api.post("/papers/generate-from-blueprint", {
      blueprint_id: selectedBlueprintId.value,
    });

    paper.value.sections = res.data.sections || [];

    ui.showSnackbar("Paper generated from blueprint");
  } catch (err) {
    ui.showSnackbar(
      err.response?.data?.message || "Failed to generate paper",
      "error",
    );
  } finally {
    blueprintLoading.value = false;
  }
};

const addQuestionToSection = (question, sectionIndex = 0) => {
  if (!paper.value.sections.length) {
    paper.value.sections.push({
      name: "Section A",
      instructions: "",
      questions: [],
    });
  }

  if (question.is_language_group) {
    const selectedItems = question.selected_items || [];

    if (!selectedItems.length) {
      ui.showSnackbar("Please select at least one word", "warning");
      return;
    }

    const ids = selectedItems.map((row) => row.id);

    const exists = paper.value.sections.some((section) =>
      section.questions.some(
        (q) =>
          q.is_language_question_group &&
          JSON.stringify(q.language_question_ids) === JSON.stringify(ids),
      ),
    );

    if (exists) {
      ui.showSnackbar("Selected words already added", "warning");
      return;
    }

    paper.value.sections[sectionIndex].questions.push({
      id: `language_group_${ids.join("_")}`,

      is_language_question_group: true,
      language_question_ids: ids,

      type: question.type,
      type_name: question.type_name || question.type,

      question: selectedItems.map((row) => row.question).join(", "),
      answer: selectedItems
        .map((row) =>
          row.answer ? `${row.question} - ${row.answer}` : row.question,
        )
        .join("<br>"),

      difficulty: question.difficulty,
      bloom_level: question.bloom_level,
      marks: selectedItems.reduce(
        (sum, row) => sum + Number(row.marks || question.marks || 1),
        0,
      ),
    });

    question.selected_items = [];

    ui.showSnackbar("Selected words added");
    return;
  }

  const exists = paper.value.sections.some((section) =>
    section.questions.some((q) => Number(q.id) === Number(question.id)),
  );

  if (exists) {
    ui.showSnackbar("Question already added", "warning");
    return;
  }

  paper.value.sections[sectionIndex].questions.push({
    ...question,
    marks: question.marks || 1,
  });

  ui.showSnackbar("Question added");
};

const replaceQuestion = async (sectionIndex, questionIndex, oldQuestion) => {
  const section = paper.value.sections[sectionIndex];

  const usedIds = paper.value.sections.flatMap((section) =>
    section.questions.map((q) => q.id),
  );

  try {
    const res = await api.get("/questions", {
      params: {
        for_paper: 1,
        grade_id: filters.value.grade_id,
        subject_id: filters.value.subject_id,
        type: oldQuestion.type,
        difficulty: oldQuestion.difficulty,
        bloom_level: oldQuestion.bloom_level,
      },
    });

    const available = (res.data.data || res.data).filter(
      (q) => !usedIds.includes(q.id),
    );

    if (!available.length) {
      ui.showSnackbar("No alternate question found", "warning");
      return;
    }

    const replacement = {
      ...available[Math.floor(Math.random() * available.length)],
      marks: oldQuestion.marks,
    };

    section.questions.splice(questionIndex, 1, replacement);

    ui.showSnackbar("Question replaced");
  } catch (err) {
    ui.showSnackbar("Failed to replace question", "error");
  }
};

const savePaper = async () => {
  try {
    if (!paper.value.title) {
      ui.showSnackbar("Please enter paper title", "warning");
      return;
    }

    if (!paper.value.sections.some((section) => section.questions.length)) {
      ui.showSnackbar("Please add questions before saving", "warning");
      return;
    }

    const payload = {
      title: paper.value.title,
      exam_type: paper.value.exam_type,
      duration: paper.value.duration,
      instructions: paper.value.instructions,
      grade_id: filters.value.grade_id,
      subject_id: filters.value.subject_id,
      total_marks: totalMarks.value,
      paper_blueprint_id: selectedBlueprintId.value,

      questions: paper.value.sections.flatMap((section) =>
        section.questions.map((q, index) => ({
          question_id: q.is_language_question ? null : q.id,
          language_question_id: q.is_language_question
            ? q.language_question_id
            : null,
          is_language_question: q.is_language_question ? 1 : 0,
          marks: q.marks,
          section: section.name,
          instructions: section.instructions,
          sort_order: index + 1,
        })),
      ),
    };

    await api.post("/question-papers", payload);
    ui.showSnackbar("Question paper saved successfully", "success");
  } catch (err) {
    if (err.response?.status === 422) {
      const errors = err.response.data.errors || {};

      const firstError = Object.values(errors).flat()[0];

      ui.showSnackbar(
        firstError || err.response.data.message || "Validation failed",
        "error",
      );
      return;
    }

    ui.showSnackbar(
      err.response?.data?.message || "Failed to save paper",
      "error",
    );
  }
};

const clearFilters = () => {
  filters.value.type = null;
  filters.value.difficulty = null;
  filters.value.search = "";

  fetchQuestions();
};

const availabilityInfo = (row) => {
  const typeOnly = questions.value.filter((q) => q.type === row.question_type);

  const typeDifficulty = typeOnly.filter(
    (q) => !row.difficulty || q.difficulty === row.difficulty,
  );

  const exact = typeDifficulty.filter(
    (q) => !row.bloom_level || q.bloom_level === row.bloom_level,
  );

  return {
    exact: exact.length,
    relaxed: typeDifficulty.length,
    typeOnly: typeOnly.length,
    required: Number(row.question_count || 0),
  };
};

const printPaper = () => {
  const content = document.querySelector(".a4-preview")?.innerHTML || "";

  const win = window.open("", "", "width=1200,height=900");

  win.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print Paper</title>
        <link rel="stylesheet" href="/print.css">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">

        <style>
          body {
            font-family: "Times New Roman", serif;
            color: #000;
            background: #fff;
            margin: 0;
            padding: 20px;
          }

          .a4-preview {
            width: 100%;
            box-shadow: none !important;
            padding: 0 !important;
            font-size: 14px;
            line-height: 1;
          }

          .preview-question {
            margin-bottom: 8px;
            page-break-inside: avoid;
          }

          .question-row {
            display: table;
            width: 100%;
            table-layout: fixed;
          }

          .question-number,
          .question-body,
          .marks-box {
            display: table-cell;
            vertical-align: top;
          }

          .question-number {
            width: 42px;
            font-weight: bold;
            padding-top: 1px;
            white-space: nowrap;
          }

          .question-body {
            padding-right: 10px;
            line-height: 1.15;
          }

          .question-html p,
          .question-body p {
            margin: 0 0 6px;
          }

          .marks-box {
            width: 75px;
            text-align: right;
            font-size: 12px;
            font-weight: bold;
            white-space: nowrap;
            padding-top: 1px;
          }

          .mcq-options {
            margin-top: 8px;
            display: grid;
            column-gap: 24px;
            row-gap: 6px;
            width: 100%;
          }

          .four-column {
            grid-template-columns: repeat(4, 1fr);
          }

          .two-column {
            grid-template-columns: repeat(2, 1fr);
          }

          .one-column {
            grid-template-columns: 1fr;
          }

          .mcq-option {
            display: flex;
            align-items: flex-start;
            gap: 6px;
            min-height: 22px;
            break-inside: avoid;
          }

          .option-label {
            flex: 0 0 24px;
            font-weight: bold;
            line-height: 1.45;
          }

          .option-text {
            flex: 1;
            min-width: 0;
            line-height: 1.45;
          }

          .option-text p {
            margin: 0;
            display: inline;
          }

          .match-column {
            display: block;
            width: 100%;
            clear: both;
            margin-top: 10px;
          }

          .match-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 36px;
            width: 100%;
          }

          .match-row {
            margin-top: 5px;
            line-height: 1.5;
          }

          .katex {
            font-size: 1.05em;
          }

          .katex-display {
            margin: 6px 0;
          }
        </style>
      </head>

      <body>
        ${content}
      </body>
    </html>
  `);

  win.document.close();

  win.onload = () => {
    setTimeout(() => {
      win.focus();
      win.print();
    }, 500);
  };
};

const removeQuestionFromSection = (sectionIndex, questionIndex) => {
  console.log("Question removed");
  paper.value.sections[sectionIndex].questions.splice(questionIndex, 1);

  ui.showSnackbar("Question removed");
};

const totalQuestions = computed(() => {
  return paper.value.sections.reduce((total, section) => {
    return total + (section.questions?.length || 0);
  }, 0);
});

const totalMarks = computed(() => {
  return paper.value.sections.reduce((total, section) => {
    return (
      total +
      section.questions.reduce((sum, q) => {
        return sum + Number(q.marks || 0);
      }, 0)
    );
  }, 0);
});

const blueprintTotalQuestions = computed(() => {
  if (!selectedBlueprint.value?.sections) return 0;

  return selectedBlueprint.value.sections.reduce((total, section) => {
    return (
      total +
      (section.items || []).reduce((sum, item) => {
        return sum + Number(item.question_count || 0);
      }, 0)
    );
  }, 0);
});

const blueprintTotalMarks = computed(() => {
  if (!selectedBlueprint.value?.sections) return 0;

  return selectedBlueprint.value.sections.reduce((total, section) => {
    return (
      total +
      (section.items || []).reduce((sum, item) => {
        return (
          sum +
          Number(item.question_count || 0) *
            Number(item.marks_per_question || 0)
        );
      }, 0)
    );
  }, 0);
});

const hasInsufficientExactQuestions = computed(() => {
  if (!selectedBlueprint.value?.sections?.length) return false;

  return selectedBlueprint.value.sections.some((section) => {
    return (section.items || []).some((item) => {
      return (
        Number(item.available_questions || 0) < Number(item.question_count || 0)
      );
    });
  });
});

const defaultInstructions = computed(() => {
  if (!selectedBlueprint.value?.sections?.length) {
    return "";
  }
  const sectionNames = selectedBlueprint.value.sections
    .map((section) => section.section_name)
    .filter(Boolean);

  const uniqueSections = [...new Set(sectionNames)];

  const totalSections = uniqueSections.length;
  const totalQuestions = blueprintTotalQuestions.value;
  const formattedSections = uniqueSections.map((section) =>
    section.replace(/section\s*/i, "").trim(),
  );

  const sectionLabel =
    formattedSections.length <= 1
      ? formattedSections[0] || ""
      : formattedSections.slice(0, -1).join(", ") +
        " and " +
        formattedSections.at(-1);

  return `
    <ol>
      <li>All questions are compulsory.</li>
      <li>The question paper consists of <strong>${totalQuestions} questions</strong> divided into <strong>${totalSections} sections ${sectionLabel}</strong>.</li>
      <li>Read all questions carefully before answering.</li>
      <li>Attempt the questions in the given order.</li>
      <li>Draw neat diagrams wherever required.</li>
    </ol>
  `;
});

watch(
  () => filters.value.subject_id,
  async () => {
    await fetchBlueprints();
    await fetchQuestions();
  },
);

watch(() => filters.value.exam_name_id, fetchBlueprints);

watch(selectedBlueprintId, fetchBlueprintDetails);

onMounted(async () => {
  await fetchGrades();
  await fetchExamNames();
});
</script>

<template>
  <div>
    <!-- HEADER -->
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">Question Paper Generator</h1>

        <p class="text-grey">
          Generate paper using approved syllabus, blueprint and question bank.
        </p>
      </div>

      <div class="d-flex ga-2">
        <v-chip
          v-if="paper.status"
          :color="
            {
              draft: 'orange',
              finalized: 'success',
              printed: 'primary',
              archived: 'error',
            }[paper.status]
          "
          variant="tonal"
        >
          {{ paper.status }}
        </v-chip>
        <v-chip color="primary" variant="tonal">
          {{ totalQuestions }} Questions
        </v-chip>

        <v-chip color="success" variant="tonal">
          {{ totalMarks }} Marks
        </v-chip>

        <v-btn
          color="primary"
          prepend-icon="mdi-content-save"
          @click="savePaper"
        >
          Save Paper
        </v-btn>
      </div>
    </div>

    <v-row>
      <!-- LEFT PANEL -->
      <v-col cols="12" lg="7">
        <!-- PAPER DETAILS -->
        <v-card class="pa-4 mb-6 rounded-xl" elevation="0">
          <div class="text-h6 font-weight-bold mb-4">Paper Details</div>

          <v-row>
            <v-col cols="12" md="4">
              <v-select
                v-model="filters.grade_id"
                :items="grades"
                item-title="name"
                item-value="id"
                label="Grade"
                variant="outlined"
                @update:model-value="fetchSubjects"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-select
                v-model="filters.subject_id"
                :items="subjects"
                item-title="name"
                item-value="id"
                label="Subject"
                variant="outlined"
                :disabled="!filters.grade_id"
                @update:model-value="onSubjectChange"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-select
                v-model="filters.exam_name_id"
                :items="examNames"
                item-title="name"
                item-value="id"
                label="Exam"
                clearable
                variant="outlined"
                @update:model-value="fetchBlueprints"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="paper.title"
                label="Paper Title"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12" md="3">
              <v-text-field
                v-model="paper.duration"
                type="number"
                label="Duration Minutes"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12" md="3">
              <v-text-field
                :model-value="totalMarks"
                label="Total Marks"
                readonly
                variant="outlined"
              />
            </v-col>

            <v-col cols="12">
              <div class="text-subtitle-1 font-weight-bold mb-2">
                Instructions
              </div>
              <AppEditor
                v-model="paper.instructions"
                label="General Instructions"
              />
            </v-col>
          </v-row>
        </v-card>

        <BlueprintSelectorCard
          v-model="selectedBlueprintId"
          :blueprints="blueprints"
          :selected-blueprint="selectedBlueprint"
          :loading="blueprintLoading"
          :disabled="!filters.grade_id || !filters.subject_id"
          @generate="generateFromBlueprint"
        />

        <!-- QUESTION BANK FILTERS -->
        <v-card class="pa-4 mb-6 rounded-xl" elevation="0">
          <div class="text-h6 font-weight-bold mb-4">Question Bank Filters</div>

          <v-row>
            <v-col cols="12" md="4">
              <v-select
                v-model="filters.type"
                :items="questionTypes"
                item-title="title"
                item-value="value"
                label="Question Type"
                clearable
                variant="outlined"
                @update:model-value="fetchQuestions"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-select
                v-model="filters.difficulty"
                :items="difficulties"
                label="Difficulty"
                clearable
                variant="outlined"
                @update:model-value="fetchQuestions"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="filters.search"
                label="Search"
                prepend-inner-icon="mdi-magnify"
                clearable
                variant="outlined"
                @keyup.enter="fetchQuestions"
              />
            </v-col>
          </v-row>

          <div class="d-flex ga-2">
            <v-btn color="primary" @click="fetchQuestions"> Apply </v-btn>

            <v-btn variant="outlined" @click="clearFilters"> Clear </v-btn>
          </div>
        </v-card>

        <!-- QUESTION BANK -->
        <v-card class="rounded-xl mb-6" elevation="0">
          <div class="pa-4 border-b">
            <div class="text-h6 font-weight-bold">Approved Question Bank</div>
          </div>

          <div style="max-height: 620px; overflow-y: auto">
            <v-progress-linear v-if="loading" indeterminate />

            <div
              v-for="question in questions"
              :key="question.id"
              class="question-item"
            >
              <div class="d-flex justify-space-between mb-2">
                <div class="d-flex flex-wrap ga-2">
                  <v-chip size="small" color="primary" variant="tonal">
                    {{ question.type }}
                  </v-chip>

                  <v-chip size="small" variant="tonal">
                    {{ question.difficulty }}
                  </v-chip>

                  <v-chip size="small" color="success" variant="tonal">
                    {{ question.marks }} Marks
                  </v-chip>
                </div>

                <v-btn
                  size="small"
                  color="primary"
                  variant="tonal"
                  @click="addQuestionToSection(question)"
                >
                  Add
                </v-btn>
              </div>

              <div
                v-if="question.is_language_group"
                class="d-flex flex-wrap ga-2"
              >
                <v-chip-group v-model="question.selected_items" multiple column>
                  <v-chip
                    v-for="row in question.items"
                    :key="row.id"
                    :value="row"
                    size="small"
                    color="deep-purple"
                    variant="tonal"
                    filter
                  >
                    {{ row.question }}
                  </v-chip>
                </v-chip-group>
              </div>
              <div v-else>
                <MathContent :html="question.question" />
              </div>
            </div>

            <div
              v-if="!loading && !questions.length"
              class="pa-6 text-center text-grey"
            >
              No approved questions found.
            </div>
          </div>
        </v-card>

        <!-- SECTIONS -->
        <PaperSections
          @print="printPaper"
          @replace-question="replaceQuestion"
          @remove-question="removeQuestionFromSection"
          v-model="paper.sections"
        />
      </v-col>

      <!-- RIGHT PANEL -->
      <v-col cols="12" lg="5">
        <GeneratedPaperPreview :paper="paper" @print="printPaper" />
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
.question-item {
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.border-b {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
</style>
