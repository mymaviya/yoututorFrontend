<script setup>
import { ref, onMounted } from "vue";
import api from "../../plugins/api";
import { useUIStore } from "../../stores/snackBar";

const ui = useUIStore();

const loading = ref(false);
const approving = ref(false);

const questions = ref([]);
const grades = ref([]);
const subjects = ref([]);

const previewDialog = ref(false);
const rejectDialog = ref(false);

const selectedQuestion = ref(null);
const rejectionReason = ref("");

const filters = ref({
  status: "pending",
  grade_id: null,
  subject_id: null,
  type: null,
  difficulty: null,
  search: "",
});

const questionTypes = [
  "mcq",
  "multiple_mcq",
  "true_false",
  "fill_blank",
  "short",
  "long",
  "match_column",
  "assertion_reason",
  "numerical",
];

const difficulties = ["easy", "medium", "hard"];

const statusItems = ["pending", "approved", "rejected"];

const headers = [
  { title: "Question", key: "question" },
  { title: "Grade", key: "grade.name" },
  { title: "Subject", key: "subject.name" },
  { title: "Type", key: "type" },
  { title: "Difficulty", key: "difficulty" },
  { title: "Created By", key: "creator" },
  { title: "Status", key: "status" },
  { title: "Actions", key: "actions", sortable: false },
];

const fetchQuestions = async () => {
  loading.value = true;

  try {
    const res = await api.get("/question-approvals", {
      params: filters.value,
    });

    questions.value = res.data.data || res.data;
  } finally {
    loading.value = false;
  }
};

const fetchGrades = async () => {
  const res = await api.get("/grades");
  grades.value = res.data.data || res.data;
};

const fetchSubjects = async () => {
  if (!filters.value.grade_id) {
    subjects.value = [];
    filters.value.subject_id = null;
    return;
  }

  const res = await api.get("/subjects", {
    params: {
      grade_id: filters.value.grade_id,
    },
  });

  subjects.value = res.data.data || res.data;
};

const clearFilters = () => {
  filters.value = {
    status: "pending",
    grade_id: null,
    subject_id: null,
    type: null,
    difficulty: null,
    search: "",
  };

  subjects.value = [];
  fetchQuestions();
};

const openPreview = (question) => {
  selectedQuestion.value = question;
  previewDialog.value = true;
};

const approveQuestion = async (question) => {
  const ok = await ui.confirmDialog(
    "Approve Question",
    "Are you sure you want to approve this question?",
  );

  if (!ok) return;

  approving.value = true;

  try {
    await api.post(`/question-approvals/${question.id}/approve`);

    ui.showSnackbar("Question approved successfully");
    previewDialog.value = false;
    fetchQuestions();
  } catch (err) {
    ui.showSnackbar("Failed to approve question", "error");
  } finally {
    approving.value = false;
  }
};

const openReject = (question) => {
  selectedQuestion.value = question;
  rejectionReason.value = "";
  rejectDialog.value = true;
};

const rejectQuestion = async () => {
  if (!rejectionReason.value) {
    ui.showSnackbar("Please enter rejection reason", "warning");
    return;
  }

  approving.value = true;

  try {
    await api.post(`/question-approvals/${selectedQuestion.value.id}/reject`, {
      rejection_reason: rejectionReason.value,
    });

    ui.showSnackbar("Question rejected successfully");

    rejectDialog.value = false;

    fetchQuestions();
  } catch (err) {
    ui.showSnackbar("Failed to reject question", "error");
  } finally {
    approving.value = false;
  }
};

const statusColor = (status) => {
  if (status === "approved") return "success";
  if (status === "rejected") return "error";
  return "warning";
};

onMounted(() => {
  fetchGrades();
  fetchQuestions();
});
</script>

<template>
  <div>
    <!-- HEADER -->
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">Question Approval</h1>

        <p class="text-grey">
          Review, approve, or reject questions submitted by teachers.
        </p>
      </div>

      <v-btn color="primary" prepend-icon="mdi-refresh" @click="fetchQuestions">
        Refresh
      </v-btn>
    </div>

    <!-- FILTERS -->
    <v-card class="pa-4 mb-6 rounded-xl" elevation="0">
      <v-row>
        <v-col cols="12" md="2">
          <v-select
            v-model="filters.status"
            :items="statusItems"
            label="Status"
            clearable
            @update:model-value="fetchQuestions"
          />
        </v-col>

        <v-col cols="12" md="2">
          <v-select
            v-model="filters.grade_id"
            :items="grades"
            item-title="name"
            item-value="id"
            label="Grade"
            clearable
            @update:model-value="fetchSubjects"
          />
        </v-col>

        <v-col cols="12" md="2">
          <v-select
            v-model="filters.subject_id"
            :items="subjects"
            item-title="name"
            item-value="id"
            label="Subject"
            clearable
            :disabled="!filters.grade_id"
          />
        </v-col>

        <v-col cols="12" md="2">
          <v-select
            v-model="filters.type"
            :items="questionTypes"
            label="Type"
            clearable
          />
        </v-col>

        <v-col cols="12" md="2">
          <v-select
            v-model="filters.difficulty"
            :items="difficulties"
            label="Difficulty"
            clearable
          />
        </v-col>

        <v-col cols="12" md="2">
          <v-text-field
            v-model="filters.search"
            label="Search"
            prepend-inner-icon="mdi-magnify"
            clearable
          />
        </v-col>
      </v-row>

      <div class="d-flex ga-2">
        <v-btn
          color="primary"
          prepend-icon="mdi-filter"
          @click="fetchQuestions"
        >
          Apply
        </v-btn>

        <v-btn
          variant="outlined"
          prepend-icon="mdi-filter-remove"
          @click="clearFilters"
        >
          Clear
        </v-btn>
      </div>
    </v-card>

    <!-- TABLE -->
    <v-card class="rounded-xl" elevation="0">
      <v-data-table :headers="headers" :items="questions" :loading="loading">
        <!-- QUESTION -->
        <template #item.question="{ item }">
          <div class="py-3 question-preview">
            <MathContent class="question-html" :html="item.question" />

            <v-img
              v-if="item.question_image"
              :src="item.question_image"
              max-width="120"
              class="rounded mt-2"
            />
            
            <v-chip v-if="item.type === 'match_column' && item.match_pairs?.length" size="small" color="primary" variant="tonal">
              {{ item.match_pairs.length }} match rows
            </v-chip>
          </div>
          
        </template>

        <!-- CREATED BY -->
        <template #item.creator="{ item }">
          <div>
            <div class="font-weight-medium">
              {{ item.creator?.name || "-" }}
            </div>

            <div class="text-caption text-grey">
              {{ item.creator?.role || "" }}
            </div>
          </div>
        </template>

        <!-- TYPE -->
        <template #item.type="{ item }">
          <v-chip size="small" color="primary" variant="tonal">
            {{ item.type }}
          </v-chip>
        </template>

        <!-- DIFFICULTY -->
        <template #item.difficulty="{ item }">
          <v-chip
            size="small"
            :color="
              item.difficulty === 'easy'
                ? 'success'
                : item.difficulty === 'medium'
                  ? 'warning'
                  : 'error'
            "
            variant="tonal"
          >
            {{ item.difficulty }}
          </v-chip>
        </template>

        <!-- STATUS -->
        <template #item.status="{ item }">
          <v-chip
            size="small"
            :color="statusColor(item.status)"
            variant="tonal"
          >
            {{ item.status }}
          </v-chip>
        </template>

        <!-- ACTIONS -->
        <template #item.actions="{ item }">
          <div class="d-flex ga-1">
            <v-btn
              icon="mdi-eye"
              size="small"
              variant="text"
              color="info"
              @click="openPreview(item)"
            />

            <v-btn
              v-if="item.status !== 'approved'"
              icon="mdi-check-circle"
              size="small"
              variant="text"
              color="success"
              :loading="approving"
              @click="approveQuestion(item)"
            />

            <v-btn
              v-if="item.status !== 'rejected'"
              icon="mdi-close-circle"
              size="small"
              variant="text"
              color="error"
              :loading="approving"
              @click="openReject(item)"
            />
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- PREVIEW DIALOG -->
    <v-dialog v-model="previewDialog" max-width="850">
      <v-card class="rounded-xl">
        <v-card-title class="d-flex justify-space-between align-center">
          Question Preview

          <v-btn
            icon="mdi-close"
            variant="text"
            @click="previewDialog = false"
          />
        </v-card-title>

        <v-divider />

        <v-card-text v-if="selectedQuestion">
          <div class="d-flex flex-wrap ga-2 mb-4">
            <v-chip color="primary" variant="tonal">
              {{ selectedQuestion.grade?.name }}
            </v-chip>

            <v-chip color="secondary" variant="tonal">
              {{ selectedQuestion.subject?.name }}
            </v-chip>

            <v-chip variant="tonal">
              {{ selectedQuestion.type }}
            </v-chip>

            <v-chip
              :color="statusColor(selectedQuestion.status)"
              variant="tonal"
            >
              {{ selectedQuestion.status }}
            </v-chip>
          </div>

          <MathContent
            class="preview-question-html mb-4"
            :html="selectedQuestion.question"
          />

          <v-img
            v-if="selectedQuestion.question_image"
            :src="selectedQuestion.question_image"
            max-width="300"
            class="rounded mb-4"
          />

          <div
            v-if="
              selectedQuestion.type === 'match_column' &&
              selectedQuestion.match_pairs?.length
            "
            class="mt-4"
          >
            <v-table density="comfortable">
              <thead>
                <tr>
                  <th>Column A</th>
                  <th>Column B / Correct Answer</th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="(pair, index) in selectedQuestion.match_pairs"
                  :key="pair.id || index"
                >
                  <td>{{ index + 1 }}. {{ pair.left_text }}</td>
                  <td>
                    {{ String.fromCharCode(65 + index) }}. {{ pair.right_text }}
                  </td>
                </tr>
              </tbody>
            </v-table>
          </div>

          <div v-if="selectedQuestion.options?.length" class="mt-4">
            <div class="text-subtitle-1 font-weight-bold mb-2">Options</div>

            <v-list>
              <v-list-item
                v-for="(option, index) in selectedQuestion.options"
                :key="option.id || index"
              >
                <template #prepend>
                  <v-avatar size="30" color="primary" variant="tonal">
                    {{ String.fromCharCode(65 + index) }}
                  </v-avatar>
                </template>

                <v-list-item-title>
                  <span v-html="option.option_text"></span>
                </v-list-item-title>

                <v-list-item-subtitle v-if="option.is_correct">
                  Correct Answer
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </div>

          <v-alert
            v-if="selectedQuestion.rejection_reason"
            type="error"
            variant="tonal"
            class="mt-4"
          >
            {{ selectedQuestion.rejection_reason }}
          </v-alert>
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn
            v-if="selectedQuestion?.status !== 'approved'"
            color="success"
            @click="approveQuestion(selectedQuestion)"
          >
            Approve
          </v-btn>

          <v-btn
            v-if="selectedQuestion?.status !== 'rejected'"
            color="error"
            variant="tonal"
            @click="openReject(selectedQuestion)"
          >
            Reject
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- REJECT DIALOG -->
    <v-dialog v-model="rejectDialog" max-width="520">
      <v-card class="rounded-xl">
        <v-card-title> Reject Question </v-card-title>

        <v-card-text>
          <v-textarea
            v-model="rejectionReason"
            label="Rejection Reason"
            rows="4"
            auto-grow
          />
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn variant="text" @click="rejectDialog = false"> Cancel </v-btn>

          <v-btn color="error" :loading="approving" @click="rejectQuestion">
            Reject
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.question-preview {
  max-width: 420px;
}

.question-html :deep(p),
.preview-question-html :deep(p) {
  margin-bottom: 6px;
}
</style>
