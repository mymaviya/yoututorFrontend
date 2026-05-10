<!-- src/views/exam/Questions/QuestionForm.vue -->

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import api from "../../../plugins/api";
import AppEditor from "../components/AppEditor.vue";
import { useUIStore } from "../../../stores/snackBar";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const pageLoading = ref(false);

const isEditMode = computed(() => !!route.params.id);

const ui = useUIStore();

const grades = ref([]);
const subjects = ref([]);
const lessons = ref([]);

const form = ref({
  id: null,
  grade_id: null,
  subject_id: null,
  lesson_id: null,
  type: "mcq",
  difficulty: "medium",
  bloom_level: "remember",
  marks: 1,
  question: "",
  answer: "",
  explanation: "",
  question_image: null,

  options: [
    {
      option_text: "",
      option_image: null,
      is_correct: false,
    },
  ],

  matches: [
    {
      left: "",
      right: "",
    },
  ],
});

const errors = ref({});

const questionTypes = [
  { text: "Multiple Choice (Single Answer)", value: "mcq" },
  { text: "Multiple Choice (Multiple Answers)", value: "multiple_mcq" },
  { text: "True/False", value: "true_false" },
  { text: "Fill in the Blank", value: "fill_blank" },
  { text: "Short Answer", value: "short" },
  { text: "Long Answer", value: "long" },
  { text: "Match the Column", value: "match_column" },
  { text: "Assertion-Reason", value: "assertion_reason" },
  { text: "Numerical", value: "numerical" },
];

const difficultyLevels = [
  { text: "Easy", value: "easy" },
  { text: "Medium", value: "medium" },
  { text: "Hard", value: "hard" },
];

const bloomLevels = [
  { text: "Remember", value: "remember" },
  { text: "Understand", value: "understand" },
  { text: "Apply", value: "apply" },
  { text: "Analyze", value: "analyze" },
  { text: "Evaluate", value: "evaluate" },
  { text: "Create", value: "create" },
];

const isMCQ = computed(() => {
  return ["mcq", "multiple_mcq"].includes(form.value.type);
});

const isMatchColumn = computed(() => {
  return form.value.type === "match_column";
});

const fetchGrades = async () => {
  const res = await api.get("/grades");
  grades.value = res.data;
};

const fetchSubjects = async () => {
  if (!form.value.grade_id) {
    subjects.value = [];
    return;
  }

  const res = await api.get("/subjects", {
    params: {
      grade_id: form.value.grade_id,
    },
  });

  subjects.value = res.data;
};

const fetchLessons = async () => {
  if (!form.value.subject_id) {
    lessons.value = [];
    return;
  }

  const res = await api.get("/lessons", {
    params: {
      subject_id: form.value.subject_id,
    },
  });

  lessons.value = res.data;
};

const addOption = () => {
  form.value.options.push({
    option_text: "",
    option_image: null,
    is_correct: false,
  });
};

const removeOption = (index) => {
  form.value.options.splice(index, 1);
};

const addMatchRow = () => {
  form.value.matches.push({
    left: "",
    right: "",
  });
};

const removeMatchRow = (index) => {
  form.value.matches.splice(index, 1);
};

const fetchQuestionForEdit = async () => {
  const res = await api.get(`/questions/${route.params.id}`);

  const q = res.data;

  /*
  |--------------------------------------------------------------------------
  | LOAD DROPDOWNS FIRST
  |--------------------------------------------------------------------------
  */

  form.value.grade_id = q.grade_id;

  await fetchSubjects();

  form.value.subject_id = q.subject_id;

  await fetchLessons();

  form.value.lesson_id = q.lesson_id;

  /*
  |--------------------------------------------------------------------------
  | LOAD ALL FORM DATA
  |--------------------------------------------------------------------------
  */

  Object.assign(form.value, {
    id: q.id,

    type: q.type,

    difficulty: q.difficulty,

    bloom_level: q.bloom_level,

    marks: q.marks,

    question: q.question,

    answer: q.answer || "",

    explanation: q.explanation || "",

    question_image: null,

    old_question_image: q.question_image,

    options: q.options?.length
      ? q.options.map((opt) => ({
          id: opt.id,

          option_text: opt.option_text || "",

          option_image: null,

          old_option_image: opt.option_image,

          is_correct: Boolean(opt.is_correct),
        }))
      : [],

    matches: q.matches || [],
  });
};

const save = async () => {
  errors.value = {};

  try {
    const formData = new FormData();

    formData.append("grade_id", form.value.grade_id);
    formData.append("subject_id", form.value.subject_id);
    formData.append("lesson_id", form.value.lesson_id);
    formData.append("type", form.value.type);
    formData.append("difficulty", form.value.difficulty);
    formData.append("bloom_level", form.value.bloom_level);
    formData.append("marks", form.value.marks);
    formData.append("question", form.value.question);
    formData.append("answer", form.value.answer);
    formData.append("explanation", form.value.explanation);

    if (form.value.question_image) {
      formData.append("question_image", form.value.question_image);
    }

    if (isMCQ.value) {
      form.value.options.forEach((option, index) => {
        formData.append(`options[${index}][option_text]`, option.option_text);

        formData.append(
          `options[${index}][is_correct]`,
          option.is_correct ? 1 : 0
        );

        if (option.option_image) {
          formData.append(
            `options[${index}][option_image]`,
            option.option_image
          );
        }
      });
    }

    if (isMatchColumn.value) {
      formData.append("matches", JSON.stringify(form.value.matches));
    }

    // await api.post('/questions', formData, {
    //   headers: {
    //     'Content-Type': 'multipart/form-data'
    //   }
    // });

    // ui.showSnackbar('Question saved successfully');

    if (isEditMode.value) {
      formData.append("_method", "PUT");

      await api.post(`/questions/${route.params.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      ui.showSnackbar("Question updated successfully");
      router.push({name:'AllQuestions'});
    } else {
      await api.post("/questions", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      ui.showSnackbar("Question saved successfully");
    }
  } catch (err) {
    if (err.response?.status === 422) {
      errors.value = err.response.data.errors;
    } else {
      ui.showSnackbar("Something went wrong", "error");
    }
  }
};

watch(
  () => form.value.grade_id,

  async (newVal, oldVal) => {
    if (pageLoading.value || !newVal) return;

    form.value.subject_id = null;
    form.value.lesson_id = null;

    await fetchSubjects();
  }
);

watch(
  () => form.value.subject_id,

  async (newVal, oldVal) => {
    if (pageLoading.value || !newVal) return;

    form.value.lesson_id = null;

    await fetchLessons();
  }
);

onMounted(async () => {
  pageLoading.value = true;
  try {
    await fetchGrades();
    if (isEditMode.value) {
      await fetchQuestionForEdit();
    }
  } finally {
    pageLoading.value = false;
  }
});
</script>

<template>
  <v-card v-if="!pageLoading" class="pa-6 rounded-xl">
    <!-- HEADER -->
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h2 class="text-h5 font-weight-bold">
          {{ isEditMode ? "Edit Question" : "Add Question" }}
        </h2>

        <p class="text-grey">
          Create rich questions with images, equations, and multiple formats.
        </p>
      </div>

      <v-btn color="primary" size="large" @click="save">
        {{ isEditMode ? "Update Question" : "Save Question" }}
      </v-btn>
    </div>

    <!-- BASIC INFO -->
    <v-row>
      <v-col cols="12" md="4">
        <v-select
          v-model="form.grade_id"
          :items="grades"
          item-title="name"
          item-value="id"
          label="Grade"
          :error-messages="errors.grade_id"
        />
      </v-col>

      <v-col cols="12" md="4">
        <v-select
          v-model="form.subject_id"
          :items="subjects"
          item-title="name"
          item-value="id"
          label="Subject"
          :disabled="!form.grade_id"
          :error-messages="errors.subject_id"
        />
      </v-col>

      <v-col cols="12" md="4">
        <v-select
          v-model="form.lesson_id"
          :items="lessons"
          item-title="title"
          item-value="id"
          label="Lesson"
          :disabled="!form.subject_id"
          :error-messages="errors.lesson_id"
        />
      </v-col>
    </v-row>

    <!-- QUESTION CONFIG -->
    <v-row>
      <v-col cols="12" md="3">
        <v-select
          v-model="form.type"
          :items="questionTypes"
          item-title="text"
          item-value="value"
          label="Question Type"
          :error-messages="errors.type"
        />
      </v-col>

      <v-col cols="12" md="3">
        <v-select
          v-model="form.difficulty"
          :items="difficultyLevels"
          item-title="text"
          item-value="value"
          label="Difficulty"
          :error-messages="errors.difficulty"
        />
      </v-col>

      <v-col cols="12" md="3">
        <v-select
          v-model="form.bloom_level"
          :items="bloomLevels"
          item-title="text"
          item-value="value"
          label="Bloom Level"
          :error-messages="errors.bloom_level"
        />
      </v-col>

      <v-col cols="12" md="3">
        <v-text-field
          v-model="form.marks"
          type="number"
          label="Marks"
          :error-messages="errors.marks"
        />
      </v-col>
    </v-row>

    <!-- QUESTION -->
    <v-card class="pa-4 mb-6" variant="outlined">
      <div class="text-subtitle-1 font-weight-bold mb-2">Question</div>

      <AppEditor v-model="form.question" />

      <v-file-input
        v-model="form.question_image"
        class="mt-4"
        label="Question Image"
        accept="image/*"
      />
      <v-img
        v-if="form.old_question_image"
        :src="form.old_question_image"
        width="140"
        class="mt-2 rounded"
      />
    </v-card>

    <!-- MCQ OPTIONS -->
    <v-card v-if="isMCQ" class="pa-4 mb-6" variant="outlined">
      <div class="d-flex justify-space-between mb-4">
        <div class="text-subtitle-1 font-weight-bold">Options</div>

        <v-btn color="primary" variant="tonal" @click="addOption">
          Add Option
        </v-btn>
      </div>

      <div
        v-for="(option, index) in form.options"
        :key="index"
        class="border rounded-lg pa-4 mb-4"
      >
        <div class="d-flex justify-space-between mb-2">
          <div class="font-weight-bold">Option {{ index + 1 }}</div>

          <v-btn
            icon="mdi-delete"
            color="red"
            variant="text"
            @click="removeOption(index)"
          />
        </div>

        <AppEditor
          v-model="option.option_text"
          :error-messages="errors.option_text"
        />

        <v-file-input
          v-model="option.option_image"
          class="mt-4"
          label="Option Image"
          accept="image/*"
        />
        <v-img
          v-if="option.old_option_image"
          :src="option.old_option_image"
          width="100"
          class="mt-2 rounded"
        />

        <v-checkbox
          v-model="option.is_correct"
          label="Correct Answer"
          :error-messages="errors.is_correct"
        />
      </div>
    </v-card>

    <!-- MATCH COLUMN -->
    <v-card v-if="isMatchColumn" class="pa-4 mb-6" variant="outlined">
      <div class="d-flex justify-space-between mb-4">
        <div class="text-subtitle-1 font-weight-bold">Match Columns</div>

        <v-btn color="primary" variant="tonal" @click="addMatchRow">
          Add Row
        </v-btn>
      </div>

      <v-row v-for="(match, index) in form.matches" :key="index">
        <v-col cols="5">
          <v-text-field v-model="match.left" label="Column A" />
        </v-col>

        <v-col cols="5">
          <v-text-field v-model="match.right" label="Column B" />
        </v-col>

        <v-col cols="2" class="d-flex align-center">
          <v-btn
            icon="mdi-delete"
            color="red"
            variant="text"
            @click="removeMatchRow(index)"
          />
        </v-col>
      </v-row>
    </v-card>

    <!-- ANSWER -->
    <v-card class="pa-4 mb-6" variant="outlined">
      <div class="text-subtitle-1 font-weight-bold mb-2">Answer</div>

      <AppEditor v-model="form.answer" />
    </v-card>

    <!-- EXPLANATION -->
    <v-card class="pa-4" variant="outlined">
      <div class="text-subtitle-1 font-weight-bold mb-2">Explanation</div>

      <AppEditor v-model="form.explanation" />
    </v-card>
  </v-card>
  <div
    v-if="pageLoading"
    class="d-flex justify-center align-center"
    style="height: 70vh"
  >
    <v-progress-circular indeterminate size="60" color="primary" />
  </div>
</template>

<style scoped>
.border {
  border: 1px solid rgba(255, 255, 255, 0.08);
}
</style>
