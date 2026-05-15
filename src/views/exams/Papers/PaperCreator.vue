<script setup>
import PaperSections from "../components/PaperSections.vue";
import { useRoute, useRouter } from "vue-router";
import { ref, computed, onMounted, watch } from "vue";
import api from "../../../plugins/api";
import { useUIStore } from "../../../stores/snackBar";
import LivePaperPreview from "../components/LivePaperPreview.vue";

const ui = useUIStore();

const loading = ref(false);
const questions = ref([]);

const assignedSubjects = ref([]);

const route = useRoute();
const router = useRouter();

const isEditMode = computed(() => !!route.params.id);

// add Total Question

const selectedQuestions = computed(() => {
  const allQuestions = [];

  paper.value.sections.forEach((section) => {
    section.questions.forEach((question) => {
      allQuestions.push(question);
    });
  });

  /*  REMOVE DUPLICATES */

  return allQuestions.filter(
    (question, index, self) =>
      index === self.findIndex((q) => q.id === question.id),
  );
});

const addToSection = (sectionIndex, question) => {
  const exists = paper.value.sections[sectionIndex].questions.find(
    (q) => q.id === question.id,
  );

  if (exists) {
    ui.showSnackbar("Question already exists in section", "warning");

    return;
  }

  paper.value.sections[sectionIndex].questions.push(question);

  ui.showSnackbar("Question added to section");
};

const filters = ref({
  grade_id: null,
  subject_id: null,
  lesson_id: null,
  type: null,
  difficulty: null,
  search: "",
});

const clearFilters = () => {
  filters.value = {
    grade_id: null,
    subject_id: null,
    lesson_id: null,
    type: null,
    difficulty: null,
    search: "",
  };

  subjects.value = [];
  lessons.value = [];
  questions.value = [];

  fetchQuestions();

  ui.showSnackbar("Filters cleared");
};

/*  PAPER FORM */

const paper = ref({
  title: "",
  exam_type: "",
  duration: 60,
  instructions: "",
  grade_id: null,
  subject_id: null,
  sections: [{ name: "Section A", questions: [] }],
});

/* DROPDOWNS */

const grades = ref([]);
const subjects = ref([]);
const lessons = ref([]);

/*TOTAL MARKS */

const selectedSection = ref(0);

// const totalMarks = computed(() => {
//   let total = 0;
//   selectedQuestions.value.forEach((q) => {
//     total += Number(q.marks);
//   });
//   return total;
// });

/* FETCH QUESTIONS */

const fetchQuestions = async () => {
  loading.value = true;

  try {
    const res = await api.get("/questions", {
      params: {
        grade_id: filters.value.grade_id,
        subject_id: filters.value.subject_id,
        lesson_id: filters.value.lesson_id,
        type: filters.value.type,
        difficulty: filters.value.difficulty,
        search: filters.value.search,
        for_paper: 1,
      },
    });

    questions.value = res.data.data || res.data;
  } catch (err) {
    ui.showSnackbar("Failed to load questions", "error");
  } finally {
    loading.value = false;
  }
};

/* FETCH grades */

const fetchGrades = async () => {
  const res = await api.get("/my-assignments");

  if (res.data.is_admin) {
    const gradeRes = await api.get("/grades");
    grades.value = gradeRes.data.data || gradeRes.data;
    return;
  }

  grades.value = res.data.grades || [];
  assignedSubjects.value = res.data.subjects || [];
};

/*  FETCH SUBJECTS */

const fetchSubjects = async () => {
  if (!filters.value.grade_id) {
    subjects.value = [];
    filters.value.subject_id = null;
    filters.value.lesson_id = null;
    lessons.value = [];
    questions.value = [];
    return;
  }

  filters.value.subject_id = null;
  filters.value.lesson_id = null;
  lessons.value = [];

  if (assignedSubjects.value.length) {
    subjects.value = assignedSubjects.value.filter(
      (s) => Number(s.grade_id) === Number(filters.value.grade_id),
    );
    fetchQuestions();
    return;
  }

  const res = await api.get("/subjects", {
    params: {
      grade_id: filters.value.grade_id,
    },
  });

  subjects.value = res.data.data || res.data;
  fetchQuestions();
};

/* FETCH LESSONS */

const fetchLessons = async () => {
  if (!filters.value.subject_id) {
    lessons.value = [];
    filters.value.lesson_id = null;
    questions.value = [];
    return;
  }

  const res = await api.get("/lessons", {
    params: {
      subject_id: filters.value.subject_id,
    },
  });

  lessons.value = res.data.data || res.data;
  fetchQuestions();
};

/* ADD QUESTION */

const addQuestion = (question) => {
  const exists = selectedQuestions.value.find((q) => q.id === question.id);

  if (exists) {
    ui.showSnackbar("Question already added", "warning");
    return;
  }

  selectedQuestions.value.push(question);
  ui.showSnackbar("Question added");
};

/* REMOVE QUESTION */

const removeQuestion = (id) => {
  selectedQuestions.value = selectedQuestions.value.filter((q) => q.id !== id);
};

/* AUTO GENERATE */

const autoGenerate = async () => {
  try {
    const res = await api.post("/papers/auto-generate", {
      grade_id: filters.value.grade_id,
      subject_id: filters.value.subject_id,
      lesson_id: filters.value.lesson_id,

      rules: [
        {
          type: "mcq",
          difficulty: "easy",
          count: 5,
        },
        {
          type: "short",
          difficulty: "medium",
          count: 3,
        },
        {
          type: "long",
          difficulty: "hard",
          count: 2,
        },
      ],
    });

    selectedQuestions.value = res.data;

    ui.showSnackbar("Paper generated successfully");
  } catch (err) {
    ui.showSnackbar("Auto generation failed", "error");
  }
};

// Fetch Paper to Edit

const fetchPaperForEdit = async () => {
  if (!isEditMode.value) return;

  const res = await api.get(`/question-papers/${route.params.id}`);
  const data = res.data;

  const grouped = {};

  data.questions.forEach((item) => {
    const section = item.section || "Section A";

    if (!grouped[section]) {
      grouped[section] = {
        name: section,
        instructions: item.instructions || "",
        questions: [],
      };
    }

    grouped[section].questions.push({
      ...item.question,
      marks: item.marks,
    });
  });

  paper.value = {
    title: data.title,
    exam_type: data.exam_type,
    duration: data.duration,
    instructions: data.instructions,
    grade_id: data.grade_id,
    subject_id: data.subject_id,
    sections: Object.values(grouped),
  };

  filters.value.grade_id = data.grade_id;
  filters.value.subject_id = data.subject_id;

  await fetchSubjects();
  await fetchQuestions();
};

/* SAVE PAPER */

const errors = ref({});

const savePaper = async () => {
  const payload = {
    title: paper.value.title,
    exam_type: paper.value.exam_type,
    duration: paper.value.duration,
    instructions: paper.value.instructions,
    total_marks: totalMarks.value,

    questions: paper.value.sections.flatMap((section) =>
      section.questions.map((q, index) => ({
        question_id: q.id,
        marks: q.marks,
        section: section.name,
        instructions: section.instructions,
        sort_order: index + 1,
      })),
    ),
  };

  if (isEditMode.value) {
    await api.put(`/question-papers/${route.params.id}`, payload);
    ui.showSnackbar("Paper updated successfully");
    router.push(`/papers/${route.params.id}`);
  } else {
    await api.post("/question-papers", payload);
    ui.showSnackbar("Paper saved successfully");
  }
};

// const savePaper = async () => {
//   try {
//     await api.post("/question-papers", {
//       title: paper.value.title,
//       exam_type: paper.value.exam_type,
//       duration: paper.value.duration,
//       instructions: paper.value.instructions,
//       grade_id: filters.value.grade_id,
//       subject_id: filters.value.subject_id,
//       questions: paper.value.sections.flatMap((section) =>
//         section.questions.map((q) => ({
//           question_id: q.id,
//           marks: q.marks,
//           section: section.name,
//           instructions: section.instructions,
//         })),
//       ),
//     });

//     ui.showSnackbar("Paper saved successfully");
//   } catch (err) {
//     if (err.response?.status === 422) {
//       errors.value = err.response.data.errors;
//     } else {
//       ui.showSnackbar("Failed to save paper", "error");
//     }
//   }
// };
const questionTypes = [
  { title: 'MCQ', value: 'mcq' },
  { title: 'Multiple MCQ', value: 'multiple_mcq' },
  { title: 'True / False', value: 'true_false' },
  { title: 'Fill in the Blank', value: 'fill_blank' },
  { title: 'Short Answer', value: 'short' },
  { title: 'Long Answer', value: 'long' },
  { title: 'Match the Column', value: 'match_column' },
  { title: 'Assertion Reason', value: 'assertion_reason' },
  { title: 'Numerical', value: 'numerical' }
]


const totalQuestions = computed(() => {
  let total = 0;

  paper.value.sections.forEach((section) => {
    total += section.questions.length;
  });

  return total;
});

const totalMarks = computed(() => {
  let total = 0;

  paper.value.sections.forEach((section) => {
    section.questions.forEach((q) => {
      total += Number(q.marks);
    });
  });

  return total;
});

// Print Function

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
    background: white !important;

    margin: 0;

    padding: 0;
  }


.preview-container {
  height: calc(100vh - 120px);
  position: sticky;
  top: 80px;
}

.preview-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}

.a4-preview {
  background: #fff;
  color: #000;
  height: 100%;
  overflow-y: auto;
  padding: 28px;
  border-radius: 12px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
  font-family: "Times New Roman", serif;
  font-size: 14px;
  line-height: 1.45;
}

.paper-header {
  text-align: center;
  margin-bottom: 12px;
}

.paper-header h2 {
  margin: 0 0 8px;
  font-size: 22px;
  font-weight: bold;
}

.paper-meta {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  margin-top: 6px;
}

.general-instructions {
  margin: 14px 0;
  font-size: 14px;
}

.section-heading {
  margin-top: 22px;
  margin-bottom: 6px;
  padding: 6px 10px;
  text-align: center;
  font-weight: bold;
  border: 1px solid #000;
  background: #f5f5f5;
}

.section-instructions {
  font-style: italic;
  margin-bottom: 12px;
}

.preview-question {
  margin-bottom: 16px;
  page-break-inside: avoid;
}

.question-row {
  display: table;
  width: 100%;
  table-layout: fixed;
  margin-bottom: 10px;
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
  line-height: 1.5;
}

.question-body p {
  margin: 0;
}

.marks-box {
  width: 75px;
  text-align: right;
  font-size: 12px;
  font-weight: bold;
  white-space: nowrap;
  padding-top: 1px;
}

.question-html :deep(p) {
  margin: 0 0 6px;
}

.question-image {
  margin: 8px 0;
  border: 1px solid #ddd;
}

.marks-box {
  text-align: right;
  font-size: 13px;
  font-weight: bold;
  white-space: nowrap;
}

.match-column {
  margin-top: 10px;
}

.match-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 36px;
}

.match-row {
  margin-top: 5px;
}

/* MCQ FORMAT */
.mcq-options {
  margin-top: 10px;
  padding-left: 4px;
  display: grid;
  gap: 10px;
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
  display: grid;
  grid-template-columns: 26px 1fr;
  gap: 6px;
  align-items: start;
  break-inside: avoid;
}

.option-label {
  font-weight: bold;
}

.option-text :deep(p) {
  margin: 0;
  display: inline;
}

.option-image {
  margin-top: 4px;
  border: 1px solid #ddd;
}

/* KaTeX */
.question-html :deep(.katex-display),
.option-text :deep(.katex-display) {
  overflow-x: auto;
  margin: 6px 0;
}

.question-html :deep(.katex),
.option-text :deep(.katex) {
  font-size: 1.05em;
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

watch(
  () => paper.sections,
  () => paper.value.sections,
  { deep: true },
);

/* INIT */

onMounted(async () => {
  await fetchGrades();

  if (isEditMode.value) {
    await fetchPaperForEdit();
  } else {
    await fetchQuestions();
  }
});
</script>

<template>
  <div>
    <!-- PAGE HEADER -->
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <!-- STICKY SUMMARY -->
        <div class="sticky-summary">
          <div>
            <div class="text-subtitle-2 text-grey">Total Questions</div>

            <div class="text-h6 font-weight-bold">
              {{ totalQuestions }}
            </div>
          </div>

          <v-divider vertical />

          <div>
            <div class="text-subtitle-2 text-grey">Total Marks</div>

            <div class="text-h6 font-weight-bold">
              {{ totalMarks }}
            </div>
          </div>

          <v-divider vertical />

          <div>
            <div class="text-subtitle-2 text-grey">Sections</div>

            <div class="text-h6 font-weight-bold">
              {{ paper.sections.length }}
            </div>
          </div>
        </div>
        <h1 class="text-h4 font-weight-bold">
          {{ isEditMode ? "Edit Question Paper" : "Question Paper Generator" }}
        </h1>

        <p class="text-grey">Create smart exam papers</p>
      </div>

      <div class="d-flex ga-2">
        <v-btn
          color="secondary"
          prepend-icon="mdi-auto-fix"
          @click="autoGenerate"
        >
          Auto Generate
        </v-btn>

        <v-btn
          color="primary"
          prepend-icon="mdi-content-save"
          @click="savePaper"
        >
          {{ isEditMode ? "Update Paper" : "Save Paper" }}
        </v-btn>
      </div>
    </div>

    <!-- PAPER DETAILS -->
    <v-card class="pa-4 mb-6 rounded-xl" elevation="0">
      <v-row>
        <v-col cols="12" md="4">
          <v-text-field
            v-model="paper.title"
            label="Paper Title"
            :error-messages="errors.title"
          />
        </v-col>

        <v-col cols="12" md="3">
          <v-select
            v-model="paper.exam_type"
            :items="['Unit Test', 'Half Yearly', 'Final Exam']"
            label="Exam Type"
            :error-messages="errors.exam_type"
          />
        </v-col>

        <v-col cols="12" md="2">
          <v-text-field
            v-model="paper.duration"
            type="number"
            label="Duration (Min)"
          />
        </v-col>

        <v-col cols="12" md="3">
          <v-text-field
            :model-value="totalMarks"
            label="Total Marks"
            readonly
          />
        </v-col>
      </v-row>

      <v-textarea
        v-model="paper.instructions"
        :error-messages="errors.instructions"
        label="Instructions"
        rows="3"
      />
    </v-card>

    <v-row>
      <!-- LEFT PANEL for question bank -->
      <v-col cols="12" md="7">
        <v-card class="rounded-xl pa-4" elevation="0">
          <div class="text-h6 mb-4">Question Bank Filter by:</div>

          <!-- FILTERS -->
          <v-row>
            <v-col cols="12" md="3">
              <v-select
                v-model="filters.grade_id"
                :items="grades"
                item-title="name"
                item-value="id"
                label="Class"
                @update:model-value="fetchSubjects"
                :error-messages="errors.grade_id"
              />
            </v-col>

            <v-col cols="12" md="3">
              <v-select
                v-model="filters.subject_id"
                :items="subjects"
                item-title="name"
                item-value="id"
                label="Subject"
                @update:model-value="fetchLessons"
                :error-messages="errors.subject_id"
              />
            </v-col>

            <v-col cols="12" md="3">
              <v-select
                v-model="filters.type"
                :items="questionTypes"
                item-title="title"
                item-value="value"
                dd
                label="Question Type"
                clearable
              />
            </v-col>

            <v-col cols="12" md="3">
              <v-select
                v-model="filters.difficulty"
                :items="['easy', 'medium', 'hard']"
                label="Difficulty"
                :error-messages="errors.difficulty"
              />
            </v-col>
          </v-row>

          <v-text-field
            v-model="filters.search"
            prepend-inner-icon="mdi-magnify"
            label="Search Questions"
            class="mb-4"
          />

          <div class="d-flex ga-2 mb-4">
            <!-- APPLY -->
            <v-btn color="primary" @click="fetchQuestions">
              Apply Filters
            </v-btn>

            <!-- CLEAR -->
            <v-btn
              color="grey"
              variant="outlined"
              prepend-icon="mdi-filter-remove"
              @click="clearFilters"
            >
              Clear
            </v-btn>
          </div>

          <!-- QUESTIONS -->
          <div class="mb-4">
            <v-select
              v-model="selectedSection"
              :items="
                paper.sections.map((s, i) => ({
                  title: s.name,
                  value: i,
                }))
              "
              item-title="title"
              item-value="value"
              label="Select Section"
            />
          </div>
          <div
            v-for="question in questions"
            :key="question.id"
            class="question-card"
          >
            <div class="d-flex justify-space-between mb-3">
              <div class="d-flex ga-2">
                <v-chip size="small" color="primary" variant="tonal">
                  {{ question.type }}
                </v-chip>

                <v-chip size="small" color="success" variant="tonal">
                  {{ question.marks }} Marks
                </v-chip>
              </div>

              <v-btn
                color="primary"
                size="small"
                @click="addToSection(selectedSection, question)"
              >
                Add
              </v-btn>
            </div>

            <MathContent class="question-html" :html="question.question" />
          </div>
        </v-card>
      </v-col>

      <!-- RIGHT PANEL for SECTIONS -->
      <v-col cols="12" md="5" class="d-flex">
        <v-card class="flex-grow-1 rounded-xl sections-scroll" elevation="0">
          <div class="pa-4">
            <PaperSections v-model="paper.sections" />
          </div>
        </v-card>
      </v-col>

      <!-- Live Preview PANEL -->
      <v-col cols="12" md="12">
        <v-card class="rounded-xl pa-4" elevation="0">
          <LivePaperPreview :paper="paper" @print="printPaper" />
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
.question-card {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.selected-question {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 14px;
}

.question-html :deep(p) {
  margin-bottom: 6px;
}

.question-html :deep(.katex-display) {
  overflow-x: auto;
  overflow-y: hidden;
  margin: 1rem 0;
}

.question-html :deep(.katex) {
  font-size: 1.1rem;
}

.sections-scroll {
  height: calc(100vh - 140px);

  overflow-y: auto;

  position: sticky;

  top: 80px;
}

/* SMOOTH SCROLLBAR */

.sections-scroll::-webkit-scrollbar {
  width: 8px;
}

.sections-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);

  border-radius: 20px;
}

.sticky-summary {
  position: sticky;

  top: 0;

  z-index: 20;

  display: flex;

  align-items: center;

  justify-content: space-around;

  gap: 20px;

  padding: 14px 18px;

  margin-bottom: 20px;

  border-radius: 16px;

  backdrop-filter: blur(12px);

  background: rgba(20, 20, 20, 0.75);

  border: 1px solid rgba(255, 255, 255, 0.08);
}

/*
|--------------------------------------------------------------------------
| LIGHT MODE
|--------------------------------------------------------------------------
*/

.v-theme--light .sticky-summary {
  background: rgba(255, 255, 255, 0.85);
}
</style>
