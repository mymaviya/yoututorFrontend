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
const assignedSubjects = ref([]);
const ui = useUIStore();
const taskInfo = ref(null);
const grades = ref([]);
const subjects = ref([]);
const lessons = ref([]);
const questionTypes = ref([]);
const aiLoading = ref(false);
const aiSuggestion = ref(null);

const isEditMode = computed(() => !!route.params.id);

const defaultOptions = () => [
  { option_text: "", option_image: null, is_correct: false },
  { option_text: "", option_image: null, is_correct: false },
  { option_text: "", option_image: null, is_correct: false },
  { option_text: "", option_image: null, is_correct: false },
];

const defaultMatchRows = () => [
  { left: "", right: "" },
  { left: "", right: "" },
  { left: "", right: "" },
  { left: "", right: "" },
];

// Task
const fetchTaskInfo = async () => {
  if (!route.query.task_id) return;

  const res = await api.get("/teacher/my-question-tasks");

  taskInfo.value = res.data.find(
    (task) => Number(task.id) === Number(route.query.task_id),
  );
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
  if (!form.value.grade_id) {
    subjects.value = [];
    form.value.subject_id = null;
    return;
  }

  if (assignedSubjects.value.length) {
    subjects.value = assignedSubjects.value.filter(
      (s) => Number(s.grade_id) === Number(form.value.grade_id),
    );

    return;
  }

  const res = await api.get("/subjects", {
    params: {
      grade_id: form.value.grade_id,
    },
  });

  subjects.value = res.data.data || res.data;
};

/* FETCH LESSONS */

const fetchLessons = async () => {
  if (!form.value.subject_id) {
    lessons.value = [];
    form.value.lesson_id = null;
    return;
  }

  const res = await api.get("/lessons", {
    params: {
      subject_id: form.value.subject_id,
    },
  });

  lessons.value = res.data.data || res.data;
};

/* FETCH QUESTION TYPE */

const fetchQuestionTypes = async () => {
  if (!form.value.grade_id || !form.value.subject_id) {
    questionTypes.value = [];
    return;
  }

  const res = await api.get("/question-types", {
    params: {
      grade_id: form.value.grade_id,
      subject_id: form.value.subject_id,
      ...(isEditMode.value ? {} : { active_only: 1 }),
    },
  });

  questionTypes.value = res.data.data || res.data;
};

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

  options: defaultOptions(),

  matches: defaultMatchRows(),
});

const errors = ref({});

const applyQueryDefaults = async () => {
  const q = route.query;

  if (!q.grade_id) return;

  form.value.grade_id = Number(q.grade_id);

  await fetchSubjects();

  if (q.subject_id) {
    form.value.subject_id = Number(q.subject_id);

    await fetchLessons();
  }

  if (q.type) {
    form.value.type = q.type;
  }

  if (q.difficulty) {
    form.value.difficulty = q.difficulty;
  }

  if (q.lesson_id) {
    form.value.lesson_id = Number(q.lesson_id);
  }
};

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

  form.value.grade_id = q.grade_id;

  await fetchSubjects();

  form.value.subject_id = q.subject_id;

  await fetchLessons();
  await fetchQuestionTypes();

  form.value.lesson_id = q.lesson_id;

  Object.assign(form.value, {
    id: q.id,
    type: q.type, // set after fetchQuestionTypes()
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
      : defaultOptions(),

    matches: q.match_pairs?.length
      ? q.match_pairs.map((pair) => ({
          id: pair.id,
          left: pair.left_text || "",
          right: pair.right_text || "",
        }))
      : defaultMatchRows(),
  });
};

const save = async () => {
  errors.value = {};

  try {
    const formData = new FormData();

    formData.append("grade_id", form.value.grade_id);
    formData.append("subject_id", form.value.subject_id);
    formData.append("lesson_id", form.value.lesson_id);
    formData.append("task_id", route.query.task_id || "");
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
          option.is_correct ? 1 : 0,
        );

        if (option.option_image) {
          formData.append(
            `options[${index}][option_image]`,
            option.option_image,
          );
        }
      });

      if (form.value.options.length < 3) {
        ui.showSnackbar("Minimum 3 options required", "warning");
        return;
      }
    }

    if (form.value.type === "match_column") {
      formData.append("matches", JSON.stringify(form.value.matches));
    }

    if (isEditMode.value) {
      formData.append("_method", "PUT");

      await api.post(`/questions/${route.params.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      ui.showSnackbar("Question updated successfully");
      router.push({ name: "questions.index" });
    } else {
      await api.post("/questions", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      form.value.question = null;
      ui.showSnackbar("Question saved successfully");

      if (!isEditMode.value && route.query.task_id) {
        await fetchTaskInfo();
      }
    }
  } catch (err) {
    if (err.response?.status === 422) {
      errors.value = err.response.data.errors;
    } else if (err.response?.status === 403) {
      ui.showSnackbar(err.response.data.message, "error");
    } else {
      ui.showSnackbar("Something went wrong", "error");
    }
  }
};

const makeSingleCorrect = (selectedIndex) => {
  form.value.options.forEach((option, index) => {
    option.is_correct = index === selectedIndex;
  });
};

// AI Suggestions for Bloom's Level
const suggestBloomLevel = async () => {
  if (!form.value.question) {
    ui.showSnackbar("Please enter question first", "warning");
    return;
  }

  aiLoading.value = true;

  try {
    const text = form.value.question.replace(/<[^>]*>/g, "").toLowerCase();

    let level = "remember";
    let reason = "This question mainly asks for recall of facts.";

    if (/(define|list|name|identify|state|recall)/.test(text)) {
      level = "remember";
      reason = "The question asks students to recall or identify information.";
    } else if (/(explain|describe|summarize|classify|compare)/.test(text)) {
      level = "understand";
      reason = "The question asks students to explain or understand a concept.";
    } else if (/(solve|calculate|use|apply|demonstrate|show)/.test(text)) {
      level = "apply";
      reason =
        "The question asks students to apply knowledge or solve a problem.";
    } else if (/(analyze|differentiate|distinguish|examine|why)/.test(text)) {
      level = "analyze";
      reason =
        "The question asks students to break down or examine relationships.";
    } else if (/(evaluate|justify|judge|critique|assess|opinion)/.test(text)) {
      level = "evaluate";
      reason = "The question asks students to justify or evaluate an answer.";
    } else if (/(create|design|develop|prepare|compose|construct)/.test(text)) {
      level = "create";
      reason =
        "The question asks students to create or construct something new.";
    }

    aiSuggestion.value = {
      level,
      reason,
    };

    form.value.bloom_level = level;
  } finally {
    aiLoading.value = false;
  }
};

watch(
  () => form.value.grade_id,

  async (newVal, oldVal) => {
    if (pageLoading.value || !newVal) return;

    form.value.subject_id = null;
    form.value.lesson_id = null;

    await fetchSubjects();
  },
);

watch(
  () => form.value.subject_id,
  async () => {
    if (pageLoading.value || !form.value.subject_id) return;

    form.value.lesson_id = null;
    form.value.type = null;

    await fetchLessons();
    await fetchQuestionTypes();
  },
);

watch(
  () => form.value.type,
  (type, oldType) => {
    if (pageLoading.value) return;

    if (type === "match_column") {
      form.value.options = [];

      if (!form.value.matches || form.value.matches.length === 0) {
        form.value.matches = defaultMatchRows();
      }
    }

    if (["mcq", "multiple_mcq"].includes(type) && oldType === "match_column") {
      form.value.matches = defaultMatchRows();

      if (!form.value.options || form.value.options.length === 0) {
        form.value.options = defaultOptions();
      }
    }
  },
);

onMounted(async () => {
  pageLoading.value = true;
  try {
    await fetchGrades();
    if (isEditMode.value) {
      await fetchQuestionForEdit();
    } else {
      await applyQueryDefaults();
      await fetchTaskInfo();
    }
  } finally {
    pageLoading.value = false;
  }
});
</script>

<template>
  <v-card v-if="!pageLoading" class="pa-6 rounded-xl">
    <!-- HEADER -->
    <v-alert
      v-if="taskInfo?.status === 'completed'"
      type="success"
      variant="tonal"
      class="mb-4"
    >
      This task is already completed. You cannot add more questions.
    </v-alert>
    <v-card
      v-if="taskInfo"
      class="mb-4 rounded-xl"
      elevation="0"
      :color="
        taskInfo.status === 'completed'
          ? 'success'
          : taskInfo.status === 'in_progress'
            ? 'info'
            : 'warning'
      "
      variant="tonal"
    >
      <v-card-text class="d-flex align-center justify-space-between">
        <div class="d-flex align-center ga-3">
          <v-avatar
            :color="
              taskInfo.status === 'completed'
                ? 'success'
                : taskInfo.status === 'in_progress'
                  ? 'info'
                  : 'warning'
            "
          >
            <v-icon color="white">
              {{
                taskInfo.status === "completed"
                  ? "mdi-check-decagram"
                  : taskInfo.status === "in_progress"
                    ? "mdi-progress-clock"
                    : "mdi-clock-outline"
              }}
            </v-icon>
          </v-avatar>

          <div>
            <div class="font-weight-bold">
              {{
                taskInfo.status === "completed"
                  ? "Task Completed"
                  : taskInfo.status === "in_progress"
                    ? "Task In Progress"
                    : "Task Pending"
              }}
            </div>

            <div class="text-caption">
              {{ taskInfo.created_count }}
              /
              {{ taskInfo.target_count }}
              questions completed
            </div>
          </div>
        </div>

        <v-chip
          size="large"
          :color="
            taskInfo.status === 'completed'
              ? 'success'
              : taskInfo.status === 'in_progress'
                ? 'info'
                : 'warning'
          "
        >
          {{ taskInfo.progress }}%
        </v-chip>
      </v-card-text>
    </v-card>

    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h2 class="text-h5 font-weight-bold">
          {{ isEditMode ? "Edit Question" : "Add Question" }}
        </h2>

        <p class="text-grey">
          Create rich questions with images, equations, and multiple formats.
        </p>
      </div>

      <v-btn
        color="primary"
        :disabled="taskInfo?.status === 'completed'"
        size="large"
        @click="save"
      >
        {{ isEditMode ? "Update Question" : "Save Question" }}
      </v-btn>
    </div>

    <v-alert v-if="taskInfo" type="info" variant="tonal" class="mb-4">
      <div class="font-weight-bold mb-1">
        You are creating question for assigned task
      </div>

      <div>
        {{ taskInfo.grade?.name }} -
        {{ taskInfo.subject?.name }}
        <span v-if="taskInfo.lesson"> - {{ taskInfo.lesson?.title }} </span>
      </div>

      <div class="mt-2">
        Target:
        <strong>{{ taskInfo.target_count }}</strong>
        | Created:
        <strong>{{ taskInfo.created_count }}</strong>
        | Remaining:
        <strong>{{ taskInfo.remaining_count }}</strong>
      </div>

      <v-progress-linear
        :model-value="taskInfo.progress"
        height="8"
        rounded
        color="primary"
        class="mt-3"
      />
    </v-alert>

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
          :disabled="taskInfo?.status === 'completed'"
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
          item-title="name"
          item-value="slug"
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
          :disabled="taskInfo?.status === 'completed'"
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
          :disabled="taskInfo?.status === 'completed'"
        />
      </v-col>

      <v-col cols="12" md="3">
        <v-text-field
          v-model="form.marks"
          type="number"
          label="Marks"
          :error-messages="errors.marks"
          :disabled="taskInfo?.status === 'completed'"
        />
      </v-col>
    </v-row>
    <v-alert v-if="aiSuggestion" type="info" variant="tonal" class="mt-2">
      Suggested Level:
      <strong>{{ aiSuggestion.level }}</strong>
      <br />
      {{ aiSuggestion.reason }}
    </v-alert>
    <!-- QUESTION -->
    <v-card class="pa-4 mb-6" variant="outlined">
      <div class="text-subtitle-1 font-weight-bold mb-2">
        Question
        <v-space></v-space>
        <v-btn
          color="primary"
          variant="tonal"
          prepend-icon="mdi-creation"
          :loading="aiLoading"
          @click="suggestBloomLevel"
        >
          Suggest Bloom
        </v-btn>
      </div>

      <AppEditor v-model="form.question" />

      <v-file-input
        v-model="form.question_image"
        class="mt-4"
        label="Question Image"
        accept="image/*"
        :disabled="taskInfo?.status === 'completed'"
      />
      <v-img
        v-if="form.old_question_image"
        :src="form.old_question_image"
        width="140"
        class="mt-2 rounded"
        :disabled="taskInfo?.status === 'completed'"
      />
    </v-card>

    <!-- MCQ OPTIONS -->
    <div v-if="['mcq', 'multiple_mcq'].includes(form.type)">
      <v-btn
        color="primary"
        variant="tonal"
        prepend-icon="mdi-plus"
        class="mt-3"
        @click="
          form.options.push({
            option_text: '',
            option_image: null,
            is_correct: false,
          })
        "
      >
        Add Option
      </v-btn>
      <v-row>
        <v-col
          v-for="(option, index) in form.options"
          :key="index"
          cols="12"
          md="6"
        >
          <v-card class="pa-4 rounded-xl option-card" elevation="0">
            <div class="d-flex align-center justify-space-between mb-3">
              <div class="d-flex align-center ga-2">
                <v-avatar color="primary" size="32">
                  {{ String.fromCharCode(65 + index) }}
                </v-avatar>

                <span class="font-weight-bold"> Option {{ index + 1 }} </span>
              </div>
              <v-spacer></v-spacer>
              <v-checkbox
                v-model="option.is_correct"
                density="compact"
                hide-details
                color="success"
                :label="form.type === 'mcq' ? 'Correct' : 'Select'"
                @update:model-value="
                  form.type === 'mcq' ? makeSingleCorrect(index) : null
                "
              />
              <v-btn
                icon="mdi-delete"
                color="error"
                variant="text"
                size="small"
                @click="form.options.splice(index, 1)"
              />
            </div>

            <v-textarea
              v-model="option.option_text"
              label="Option Text"
              rows="2"
              auto-grow
              variant="outlined"
            />

            <v-file-input
              v-model="option.option_image"
              label="Option Image"
              prepend-icon=""
              prepend-inner-icon="mdi-image"
              variant="outlined"
              density="comfortable"
              accept="image/*"
            />
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- MATCH COLUMN -->
    <v-card v-if="isMatchColumn" class="pa-4 mb-6" variant="outlined">
      <div class="text-h6 font-weight-bold mb-3">Match the Column</div>

      <v-row v-for="(row, index) in form.matches" :key="index" class="mb-2">
        <v-col cols="12" md="5">
          <v-text-field
            v-model="row.left"
            :label="`Column A Question ${index + 1}`"
            variant="outlined"
          />
        </v-col>

        <v-col cols="12" md="5">
          <v-text-field
            v-model="row.right"
            :label="`Correct Answer ${index + 1}`"
            variant="outlined"
          />
        </v-col>

        <v-col cols="12" md="2" class="d-flex align-center">
          <v-btn
            icon="mdi-delete"
            color="error"
            variant="text"
            @click="form.matches.splice(index, 1)"
          />
        </v-col>
      </v-row>

      <v-btn
        color="primary"
        variant="tonal"
        prepend-icon="mdi-plus"
        @click="form.matches.push({ left: '', right: '' })"
      >
        Add Row
      </v-btn>
    </v-card>

    <!-- ANSWER -->
    <v-card class="pa-4 mb-6" variant="outlined">
      <div class="text-subtitle-1 font-weight-bold mb-2">Answer</div>

      <AppEditor v-model="form.answer" />
    </v-card>

    <!-- EXPLANATION -->
    <v-card class="pa-4" variant="outlined">
      <div class="text-subtitle-1 font-weight-bold mb-2">Explanation</div>

      <AppEditor
        v-model="form.explanation"
        :disabled="taskInfo?.status === 'completed'"
      />
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
