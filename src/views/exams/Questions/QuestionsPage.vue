<!-- src/views/exam/Questions/QuestionsPage.vue -->

<script setup>
import { ref, onMounted, watch } from "vue";
import api from "../../../plugins/api";
import { useRouter } from "vue-router";
import { useUIStore } from "../../../stores/snackBar";


const router = useRouter();
const ui = useUIStore();

const loading = ref(false);
const questions = ref([]);
const totalItems = ref(0);
const deleteDialog = ref(false);
const selectedQuestion = ref(null);

const options = ref({
  page: 1,
  itemsPerPage: 10,
});

const filters = ref({
  search: "",
  grade_id: null,
  subject_id: null,
  lesson_id: null,
  type: null,
  status: null,
  difficulty: null,
});

const grades = ref([]);
const subjects = ref([]);
const lessons = ref([]);

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

const headers = [
  { title: "Question", key: "question" },
  { title: "Grade", key: "grade.name" },
  { title: "Subject", key: "subject.name" },
  { title: "Type", key: "type" },
  { title: "Difficulty", key: "difficulty" },
  { title: "Status", key: "status" },
  { title: "Created By", key: "creator" },
  { title: "Actions", key: "actions", sortable: false },
];

const listFromResponse = (data) => data?.data || data || [];
const tableItem = (item) => item?.raw || item;
const fetchQuestions = async () => {
  loading.value = true;

  try {
    const res = await api.get("/questions", {
      params: {
        page: options.value.page,
        per_page: options.value.itemsPerPage,
        search: filters.value.search,
        grade_id: filters.value.grade_id,
        subject_id: filters.value.subject_id,
        lesson_id: filters.value.lesson_id,
        type: filters.value.type,
        status: filters.value.status,
        difficulty: filters.value.difficulty,
      },
    });

    questions.value = listFromResponse(res.data);
    totalItems.value = Number(res.data.total ?? questions.value.length);
    
  } catch (err) {
    ui.showSnackbar(
      err.response?.data?.message || "Failed to load questions",
      "error",
    );
  } finally {
    loading.value = false;
  }
};

const fetchGrades = async () => {
  const res = await api.get("/grades");

  grades.value = listFromResponse(res.data);
};

const fetchSubjects = async () => {
  if (!filters.value.grade_id) {
    subjects.value = [];
    filters.value.subject_id = null;
    filters.value.lesson_id = null;
    lessons.value = [];

    return;
  }

  const res = await api.get("/subjects", {
    params: {
      grade_id: filters.value.grade_id,
    },
  });

  subjects.value = listFromResponse(res.data);
};

const fetchLessons = async () => {
  if (!filters.value.subject_id) {
    lessons.value = [];
    filters.value.lesson_id = null;

    return;
  }

  const res = await api.get("/lessons", {
    params: {
      subject_id: filters.value.subject_id,
    },
  });

  lessons.value = listFromResponse(res.data);
};

const openDelete = (question) => {
  selectedQuestion.value = question;

  deleteDialog.value = true;
};

const deleteQuestion = async () => {
  try {
    await api.delete(`/questions/${selectedQuestion.value.id}`);

    ui.showSnackbar("Question deleted successfully");

    deleteDialog.value = false;

    fetchQuestions();
  } catch (err) {
    ui.showSnackbar("Delete failed", "error");
  }
};

const editQuestion = (id) => {
  router.push(`/questions/${id}/edit`);
};

watch(
  () => filters.value.grade_id,
  () => {
    filters.value.subject_id = null;
    filters.value.lesson_id = null;

    fetchSubjects();
  },
);

watch(
  () => filters.value.subject_id,
  () => {
    filters.value.lesson_id = null;

    fetchLessons();
  },
);

watch(
  filters,
  () => {
    fetchQuestions();
  },
  { deep: true },
);

watch(
  options,
  () => {
    fetchQuestions();
  },
  { deep: true },
);

onMounted(() => {
  fetchGrades();

  fetchQuestions();
});
</script>

<template>
  <div>
    <!-- PAGE HEADER -->
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">Question Bank</h1>

        <p class="text-grey">Manage all questions for exams</p>
      </div>

      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        @click="router.push('/questions/create')"
      >
        Add Question
      </v-btn>
    </div>

    <!-- FILTERS -->
    <v-card class="pa-4 mb-6 rounded-xl" elevation="0">
      <v-row>
        <!-- CLASS -->
        <v-col cols="12" md="2">
          <v-select
            v-model="filters.grade_id"
            :items="grades"
            item-title="name"
            item-value="id"
            label="Grade"
            clearable
            variant="outlined"
          />
        </v-col>

        <!-- SUBJECT -->
        <v-col cols="12" md="2">
          <v-select
            v-model="filters.subject_id"
            :items="subjects"
            item-title="name"
            item-value="id"
            label="Subject"
            clearable
            variant="outlined"
          />
        </v-col>

        <!-- TYPE -->
        <v-col cols="12" md="2">
          <v-select
            v-model="filters.type"
            :items="questionTypes"
            item-title="text"
            item-value="value"
            label="Type"
            clearable
            variant="outlined"
          />
        </v-col>

        <!-- STATUS -->
        <v-col cols="12" md="2">
          <v-select
            v-model="filters.status"
            :items="['pending', 'approved', 'rejected']"
            label="Status"
            clearable
            variant="outlined"
          />
        </v-col>

        <!-- DIFFICULTY -->
        <v-col cols="12" md="2">
          <v-select
            v-model="filters.difficulty"
            :items="difficultyLevels"
            item-title="text"
            item-value="value"
            label="Difficulty"
            clearable
            variant="outlined"
          />
        </v-col>
      
        <!-- SEARCH -->
        <v-col cols="12" md="10">
          <v-text-field
            v-model="filters.search"
            label="Search Question"
            prepend-inner-icon="mdi-magnify"
            clearable
            variant="outlined"
          />
        </v-col>
      </v-row>
    </v-card>

    <!-- TABLE -->
    <v-card class="rounded-xl" elevation="0">
      <v-data-table-server
          v-model:items-per-page="options.itemsPerPage"
          v-model:page="options.page"
          :headers="headers"
          :items="questions"
          :items-length="totalItems"
          :loading="loading"
          item-value="id"
        >
        <template #item.question="{ item }">
          <div class="py-3 question-html">
            <v-img
              v-if="tableItem(item).question_image"
              :src="tableItem(item).question_image"
              width="100"
              class="mb-2 rounded"
            />

            <MathContent :html="tableItem(item).question" />

            <div
              v-if="tableItem(item).rejection_reason"
              class="text-caption text-error mt-1"
            >
              {{ tableItem(item).rejection_reason }}
            </div>
          </div>
        </template>

        <template #item.type="{ item }">
          <v-chip size="small" color="primary" variant="tonal">
            {{ tableItem(item).type }}
          </v-chip>
        </template>

        <template #item.difficulty="{ item }">
          <v-chip
            size="small"
            :color="
              tableItem(item).difficulty === 'easy'
                ? 'success'
                : tableItem(item).difficulty === 'medium'
                  ? 'warning'
                  : 'error'
            "
            variant="tonal"
          >
            {{ tableItem(item).difficulty }}
          </v-chip>
        </template>

        <template #item.status="{ item }">
          <v-chip
            size="small"
            variant="tonal"
            :color="
              tableItem(item).status === 'approved'
                ? 'success'
                : tableItem(item).status === 'rejected'
                  ? 'error'
                  : 'warning'
            "
          >
            <v-icon start size="16">
              {{
                tableItem(item).status === "approved"
                  ? "mdi-check-circle"
                  : tableItem(item).status === "rejected"
                    ? "mdi-close-circle"
                    : "mdi-clock-outline"
              }}
            </v-icon>

            {{ tableItem(item).status }}
          </v-chip>
        </template>

        <template #item.creator="{ item }">
          <div class="d-flex align-center ga-2">
            <v-avatar size="32" color="primary" variant="tonal">
              {{ tableItem(item).creator?.name?.charAt(0) || "?" }}
            </v-avatar>

            <div>
              <div class="font-weight-medium">
                {{ tableItem(item).creator?.name || "-" }}
              </div>

              <div class="text-caption text-grey">
                {{ tableItem(item).creator?.role || "" }}
              </div>
            </div>
          </div>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex">
            <v-btn
              icon="mdi-pencil"
              size="small"
              variant="text"
              color="primary"
              @click="editQuestion(tableItem(item).id)"
            />

            <v-btn
              icon="mdi-delete"
              size="small"
              variant="text"
              color="error"
              @click="openDelete(tableItem(item))"
            />
          </div>
        </template>

        <template #no-data>
          <div class="text-center py-8 text-grey">No questions found</div>
        </template>
      </v-data-table-server>
    </v-card>

    <!-- DELETE DIALOG -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card class="rounded-xl">
        <v-card-title> Delete Question </v-card-title>

        <v-card-text>
          Are you sure you want to delete this question?
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn variant="text" @click="deleteDialog = false"> Cancel </v-btn>

          <v-btn color="error" @click="deleteQuestion"> Delete </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.question-html {
  max-width: 500px;
}

.question-html :deep(p) {
  margin-bottom: 4px;
}
</style>
