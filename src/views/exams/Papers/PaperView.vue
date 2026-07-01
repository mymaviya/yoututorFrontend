<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "../../../plugins/api";
import LivePaperPreview from "../components/LivePaperPreview.vue";
import { renderMath } from "../../../utils/renderMath";
import "katex/dist/katex.min.css";
import { useUIStore } from "../../../stores/snackBar";

const route = useRoute();
const router = useRouter();
const ui = useUIStore();

const loading = ref(false);
const exporting = ref(false);

const paper = ref({
  title: "",
  exam_type: "",
  duration: "",
  instructions: "",
  sections: [],
});

const fetchPaper = async () => {
  loading.value = true;

  try {
    const res = await api.get(`/question-papers/${route.params.id}`);
    const data = res.data;

    const grouped = {};

    (data.questions || []).forEach((item) => {
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

        // IMPORTANT: marks must come from question_paper_questions
        paper_question_id: item.id,
        question_id: item.question_id,
        marks: Number(item.marks),
        sort_order: item.sort_order,
        section: item.section,
        instructions: item.instructions,
      });
    });

    Object.values(grouped).forEach((section) => {
      section.questions.sort((a, b) => a.sort_order - b.sort_order);
    });

    paper.value = {
      ...data,
      sections: Object.values(grouped),
    };

    setTimeout(() => {
      renderMath(".a4-preview");
    }, 300);
  } finally {
    loading.value = false;
  }
};

const allPaper = () => {
  router.push("/papers");
};

const editPaper = () => {
  router.push(`/papers/${route.params.id}/edit`);
};

const getFilenameFromResponse = (response, fallback) => {
  const disposition = response.headers?.["content-disposition"];

  if (!disposition) return fallback;

  const match = disposition.match(/filename="?([^"]+)"?/i);

  return match?.[1] || fallback;
};

const downloadFile = async (endpoint, fallbackName, mimeType) => {
  if (!paper.value?.id) return;

  exporting.value = true;

  try {
    const res = await api.get(`/question-papers/${paper.value.id}/${endpoint}`, {
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
    exporting.value = false;
  }
};

const exportPaperWord = () => {
  downloadFile(
    "export-word",
    `question-paper-${paper.value.id}.doc`,
    "application/msword",
  );
};

const exportAnswerKeyWord = () => {
  downloadFile(
    "answer-key-word",
    `question-paper-${paper.value.id}-answer-key.doc`,
    "application/msword",
  );
};

const exportPaperPdf = () => {
  downloadFile(
    "export-pdf",
    `question-paper-${paper.value.id}.pdf`,
    "application/pdf",
  );
};

const exportAnswerKeyPdf = () => {
  downloadFile(
    "answer-key-pdf",
    `question-paper-${paper.value.id}-answer-key.pdf`,
    "application/pdf",
  );
};

const printPaper = () => {
  window.print();
};

onMounted(fetchPaper);
</script>

<template>
  <div>
    <!-- HEADER -->
    <div class="d-flex justify-space-between align-center mb-6 flex-wrap ga-3">
      <div>
        <h1 class="text-h4 font-weight-bold">View Question Paper</h1>

        <p class="text-grey">Preview and export paper</p>
      </div>

      <!-- ACTIONS -->
      <div class="d-flex ga-2 flex-wrap">
        <v-btn color="primary" prepend-icon="mdi-pencil" @click="editPaper">
          Edit
        </v-btn>

        <v-menu location="bottom end">
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              color="deep-purple"
              prepend-icon="mdi-download"
              :loading="exporting"
            >
              Export
            </v-btn>
          </template>

          <v-list density="compact" min-width="260">
            <v-list-subheader>Question Paper</v-list-subheader>

            <v-list-item
              prepend-icon="mdi-file-word-box"
              title="Download Paper Word"
              @click="exportPaperWord"
            />

            <v-list-item
              prepend-icon="mdi-file-pdf-box"
              title="Download Paper PDF"
              @click="exportPaperPdf"
            />

            <v-divider class="my-1" />

            <v-list-subheader>Answer Key</v-list-subheader>

            <v-list-item
              prepend-icon="mdi-file-word-box-outline"
              title="Download Answer Key Word"
              @click="exportAnswerKeyWord"
            />

            <v-list-item
              prepend-icon="mdi-file-pdf-box"
              title="Download Answer Key PDF"
              @click="exportAnswerKeyPdf"
            />
          </v-list>
        </v-menu>

        <v-btn color="secondary" prepend-icon="mdi-printer" @click="printPaper">
          Print
        </v-btn>

        <v-btn
          color="orange"
          prepend-icon="mdi-format-list-bulleted"
          @click="allPaper"
        >
          Papers
        </v-btn>
      </div>
    </div>

    <!-- LOADER -->
    <v-card v-if="loading" class="rounded-xl pa-10" elevation="0">
      <v-progress-linear indeterminate />
    </v-card>

    <!-- PREVIEW -->
    <LivePaperPreview v-else :paper="paper" @print="printPaper" />
  </div>
</template>
