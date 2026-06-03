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

const headers = [
  { title: "Title", key: "title" },
  { title: "Exam Type", key: "exam_type" },
  { title: "Grade", key: "grade.name" },
  { title: "Subject", key: "subject.name" },
  { title: "Duration", key: "duration" },
  { title: "Marks", key: "total_marks" },
  { title: "Status", key: "status" },
  { title: "Actions", key: "actions", sortable: false },
];

const fetchPapers = async () => {
  loading.value = true;

  try {
    const res = await api.get("/question-papers");
    papers.value = res.data.data || res.data;
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

const downloadPdf = async (id) => {
  const res = await api.get(`/question-papers/${id}/pdf`, {
    responseType: "blob",
  });

  const blob = new Blob([res.data], {
    type: "application/pdf",
  });

  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `question-paper-${id}.pdf`;
  link.click();

  window.URL.revokeObjectURL(url);
};

const deletePaper = async (id) => {
  const ok = await ui.confirmDialog(
    "Delete Paper",
    "Are you sure you want to delete this question paper?",
  );

  if (!ok) return;

  await api.delete(`/question-papers/${id}`);

  ui.showSnackbar("Question paper deleted successfully");

  fetchPapers();
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
  await api.post(`/question-papers/${id}/finalize`);
  ui.showSnackbar("Paper finalized successfully");
  fetchPapers();
};

const reopenPaper = async (id) => {
  await api.post(`/question-papers/${id}/reopen`);
  ui.showSnackbar("Paper reopened successfully");
  fetchPapers();
};

const markPrinted = async (id) => {
  await api.post(`/question-papers/${id}/printed`);
  ui.showSnackbar("Paper marked as printed");
  fetchPapers();
};

const archivePaper = async (id) => {
  await api.post(`/question-papers/${id}/archive`);
  ui.showSnackbar("Paper archived successfully");
  fetchPapers();
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
      <v-data-table :headers="headers" :items="papers" :loading="loading">
        <template #item.duration="{ item }"> {{ item.duration }} min </template>

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
          <div class="d-flex ga-1">
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

            <v-tooltip text="Download PDF">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-file-pdf-box"
                  size="small"
                  variant="text"
                  color="red"
                  @click="downloadPdf(item.id)"
                />
              </template>
            </v-tooltip>

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
      </v-data-table>
    </v-card>
  </div>
</template>
