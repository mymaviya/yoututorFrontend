<!-- src/views/exam/Papers/PapersPage.vue -->

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "../../../plugins/api";
import { useUIStore } from "../../../stores/snackBar";

const router = useRouter();
const ui = useUIStore();

const papers = ref([]);
const loading = ref(false);
const exportingId = ref(null);

const headers = [
  { title: "Title", key: "title" },
  { title: "Exam Type", key: "exam_type" },
  { title: "Grade", key: "grade.name" },
  { title: "Subject", key: "subject.name" },
  { title: "Duration", key: "duration_minutes" },
  { title: "Marks", key: "total_marks" },
  { title: "Status", key: "status" },
  { title: "Actions", key: "actions", sortable: false },
];

const fetchPapers = async () => {
  loading.value = true;

  try {
    const res = await api.get("/question-papers");
    papers.value = res.data.data || res.data;
  } catch (e) {
    ui.showSnackbar(
      e.response?.data?.message || "Failed to load question papers.",
      "error",
    );
  } finally {
    loading.value = false;
  }
};

const createPaper = () => {
  router.push("/papers/generate");
};

const viewPaper = (id) => {
  router.push(`/papers/${id}`);
};

const editPaper = (id) => {
  router.push(`/papers/${id}/edit`);
};

const getFilenameFromResponse = (response, fallback) => {
  const disposition = response.headers?.["content-disposition"];

  if (!disposition) return fallback;

  const match = disposition.match(/filename="?([^"]+)"?/i);

  return match?.[1] || fallback;
};

const downloadFile = async (id, endpoint, fallbackName, mimeType) => {
  exportingId.value = `${id}-${endpoint}`;

  try {
    const res = await api.get(`/question-papers/${id}/${endpoint}`, {
      responseType: "blob",
    });

    const blob = new Blob([res.data], {
      type: mimeType,
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = getFilenameFromResponse(res, fallbackName);
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
  } catch (e) {
    ui.showSnackbar(
      e.response?.data?.message || "Failed to export question paper.",
      "error",
    );
  } finally {
    exportingId.value = null;
  }
};

const exportPaperWord = (id) => {
  downloadFile(
    id,
    "export-word",
    `question-paper-${id}.doc`,
    "application/msword",
  );
};

const exportAnswerKeyWord = (id) => {
  downloadFile(
    id,
    "answer-key-word",
    `question-paper-${id}-answer-key.doc`,
    "application/msword",
  );
};

const exportPaperPdf = (id) => {
  downloadFile(
    id,
    "export-pdf",
    `question-paper-${id}.pdf`,
    "application/pdf",
  );
};

const exportAnswerKeyPdf = (id) => {
  downloadFile(
    id,
    "answer-key-pdf",
    `question-paper-${id}-answer-key.pdf`,
    "application/pdf",
  );
};

const deletePaper = async (id) => {
  const ok = await ui.confirmDialog(
    "Delete Paper",
    "Are you sure you want to delete this question paper?",
  );

  if (!ok) return;

  try {
    await api.delete(`/question-papers/${id}`);

    ui.showSnackbar("Question paper deleted successfully");

    fetchPapers();
  } catch (e) {
    ui.showSnackbar(
      e.response?.data?.message || "Failed to delete question paper.",
      "error",
    );
  }
};

const statusColor = (status) => {
  return (
    {
      draft: "grey",
      finalized: "success",
      printed: "primary",
      archived: "error",
    }[status] || "grey"
  );
};

const finalizePaper = async (id) => {
  try {
    await api.post(`/question-papers/${id}/finalize`);
    ui.showSnackbar("Paper finalized successfully");
    fetchPapers();
  } catch (e) {
    ui.showSnackbar(e.response?.data?.message || "Failed to finalize paper.", "error");
  }
};

const reopenPaper = async (id) => {
  try {
    await api.post(`/question-papers/${id}/reopen`);
    ui.showSnackbar("Paper reopened successfully");
    fetchPapers();
  } catch (e) {
    ui.showSnackbar(e.response?.data?.message || "Failed to reopen paper.", "error");
  }
};

const markPrinted = async (id) => {
  try {
    await api.post(`/question-papers/${id}/printed`);
    ui.showSnackbar("Paper marked as printed");
    fetchPapers();
  } catch (e) {
    ui.showSnackbar(e.response?.data?.message || "Failed to mark as printed.", "error");
  }
};

const archivePaper = async (id) => {
  try {
    await api.post(`/question-papers/${id}/archive`);
    ui.showSnackbar("Paper archived successfully");
    fetchPapers();
  } catch (e) {
    ui.showSnackbar(e.response?.data?.message || "Failed to archive paper.", "error");
  }
};

onMounted(fetchPapers);
</script>

<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">Question Papers</h1>

        <p class="text-grey">Manage all generated question papers</p>
      </div>

      <v-btn color="primary" prepend-icon="mdi-plus" @click="createPaper">
        Create Paper
      </v-btn>
    </div>

    <v-card class="rounded-xl" elevation="0">
      <appDataTable :headers="headers" :items="papers" :loading="loading">
        <template #item.exam_type="{ item }">
          {{ item.exam_name?.name || item.examName?.name || item.exam_type || "-" }}
        </template>

        <template #item.duration_minutes="{ item }">
          {{ item.duration_minutes || item.duration || "-" }} min
        </template>

        <template #item.total_marks="{ item }">
          <v-chip color="primary" variant="tonal">
            {{ item.total_marks }} Marks
          </v-chip>
        </template>

        <template #item.status="{ item }">
          <v-chip
            size="small"
            variant="tonal"
            :color="statusColor(item.status)"
          >
            {{ item.status || "draft" }}
          </v-chip>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex ga-1 align-center">
            <v-tooltip text="View Paper">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-eye"
                  size="small"
                  variant="text"
                  color="info"
                  @click="viewPaper(item.id)"
                />
              </template>
            </v-tooltip>

            <v-tooltip
              text="Edit Paper"
              v-if="!item.status || item.status === 'draft'"
            >
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-pencil"
                  size="small"
                  variant="text"
                  color="primary"
                  @click="editPaper(item.id)"
                />
              </template>
            </v-tooltip>

            <v-menu location="bottom end">
              <template #activator="{ props }">
                <v-tooltip text="Export Paper">
                  <template #activator="{ props: tooltipProps }">
                    <v-btn
                      v-bind="{ ...props, ...tooltipProps }"
                      icon="mdi-download"
                      size="small"
                      variant="text"
                      color="deep-purple"
                      :loading="String(exportingId || '').startsWith(`${item.id}-`)"
                    />
                  </template>
                </v-tooltip>
              </template>

              <v-list density="compact" min-width="250">
                <v-list-subheader>Question Paper</v-list-subheader>

                <v-list-item
                  prepend-icon="mdi-file-word-box"
                  title="Download Paper Word"
                  @click="exportPaperWord(item.id)"
                />

                <v-list-item
                  prepend-icon="mdi-file-pdf-box"
                  title="Download Paper PDF"
                  @click="exportPaperPdf(item.id)"
                />

                <v-divider class="my-1" />

                <v-list-subheader>Answer Key</v-list-subheader>

                <v-list-item
                  prepend-icon="mdi-file-word-box-outline"
                  title="Download Answer Key Word"
                  @click="exportAnswerKeyWord(item.id)"
                />

                <v-list-item
                  prepend-icon="mdi-file-pdf-box"
                  title="Download Answer Key PDF"
                  @click="exportAnswerKeyPdf(item.id)"
                />
              </v-list>
            </v-menu>

            <v-tooltip
              text="Finalize Paper"
              v-if="!item.status || item.status === 'draft'"
            >
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-check-decagram"
                  size="small"
                  variant="text"
                  color="success"
                  @click="finalizePaper(item.id)"
                />
              </template>
            </v-tooltip>

            <v-tooltip
              text="Mark as Printed"
              v-if="item.status === 'finalized'"
            >
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-printer"
                  size="small"
                  variant="text"
                  color="primary"
                  @click="markPrinted(item.id)"
                />
              </template>
            </v-tooltip>

            <v-tooltip text="Reopen Paper" v-if="item.status === 'finalized'">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-lock-open"
                  size="small"
                  variant="text"
                  color="warning"
                  @click="reopenPaper(item.id)"
                />
              </template>
            </v-tooltip>

            <v-tooltip text="Archive Paper" v-if="item.status === 'printed'">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-archive"
                  size="small"
                  variant="text"
                  color="error"
                  @click="archivePaper(item.id)"
                />
              </template>
            </v-tooltip>

            <v-tooltip
              text="Delete Paper"
              v-if="!item.status || item.status === 'draft'"
            >
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-delete"
                  size="small"
                  variant="text"
                  color="error"
                  @click="deletePaper(item.id)"
                />
              </template>
            </v-tooltip>
          </div>
        </template>
      </appDataTable>
    </v-card>
  </div>
</template>
