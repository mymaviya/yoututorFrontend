<script setup>
import { ref, onMounted } from "vue";
import api from "../../plugins/api";
import { useUIStore } from "../../stores/snackBar";

const ui = useUIStore();

const loading = ref(false);
const saving = ref(false);
const dialog = ref(false);
const editMode = ref(false);

const questionTypes = ref([]);
const grades = ref([]);
const subjects = ref([]);
const errors = ref({});

const form = ref({
  id: null,
  grade_id: null,
  subject_id: null,
  name: "",
  is_active: true,
});

const filters = ref({
  grade_id: null,
  subject_id: null,
});

const headers = [
  { title: "Grade", key: "grade.name" },
  { title: "Subject", key: "subject.name" },
  { title: "Question Type", key: "name" },
  { title: "Slug", key: "slug" },
  { title: "Status", key: "is_active" },
  { title: "Actions", key: "actions", sortable: false },
];

const fetchGrades = async () => {
  const res = await api.get("/grades");
  grades.value = res.data.data || res.data;
};

const fetchSubjects = async () => {
  const gradeId = form.value.grade_id || filters.value.grade_id;

  if (!gradeId) {
    subjects.value = [];
    return;
  }

  const res = await api.get("/subjects", {
    params: { grade_id: gradeId },
  });

  subjects.value = res.data.data || res.data;
};

const importFile = ref(null);
const importing = ref(false);

const importQuestionTypes = async () => {
  if (!importFile.value) {
    ui.showSnackbar("Please select an Excel file", "warning");
    return;
  }

  const file = Array.isArray(importFile.value)
    ? importFile.value[0]
    : importFile.value;

  const formData = new FormData();
  formData.append("file", file);

  importing.value = true;

  try {
    await api.post("/question-types/import", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    ui.showSnackbar("Question types imported successfully");
    importFile.value = null;
    fetchQuestionTypes();
  } catch (err) {
    ui.showSnackbar(err.response?.data?.message || "Import failed", "error");
  } finally {
    importing.value = false;
  }
};

const downloadTemplate = async () => {
  const res = await api.get("/question-types/template", {
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(new Blob([res.data]));

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "question-types-template.xlsx");

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(url);
};

const openAdd = () => {
  editMode.value = false;
  errors.value = {};

  form.value = {
    id: null,
    grade_id: null,
    subject_id: null,
    name: "",
    is_active: true,
  };

  subjects.value = [];
  dialog.value = true;
};

const openEdit = async (item) => {
  editMode.value = true;
  errors.value = {};

  form.value = {
    id: item.id,
    grade_id: item.grade_id,
    subject_id: item.subject_id,
    name: item.name,
    is_active: Boolean(item.is_active),
  };

  await fetchSubjects();
  dialog.value = true;
};

const saveQuestionType = async () => {
  saving.value = true;
  errors.value = {};

  try {
    if (editMode.value) {
      await api.put(`/question-types/${form.value.id}`, form.value);
      ui.showSnackbar("Question type updated successfully");
    } else {
      await api.post("/question-types", form.value);
      ui.showSnackbar("Question type created successfully");
    }

    dialog.value = false;
    fetchQuestionTypes();
  } catch (err) {
    if (err.response?.status === 422) {
      errors.value = err.response.data.errors || {};
      ui.showSnackbar(
        err.response.data.message || "Validation failed",
        "error",
      );
    } else {
      ui.showSnackbar("Failed to save question type", "error");
    }
  } finally {
    saving.value = false;
  }
};

const toggleStatus = async (item) => {
  await api.post(`/question-types/${item.id}/status`);
  ui.showSnackbar("Status updated successfully");
  fetchQuestionTypes();
};

const deleteQuestionType = async (item) => {
  const ok = await ui.confirmDialog(
    "Delete Question Type",
    `Are you sure you want to delete ${item.name}?`,
  );

  if (!ok) return;

  await api.delete(`/question-types/${item.id}`);
  ui.showSnackbar("Question type deleted successfully");
  fetchQuestionTypes();
};

const onFormGradeChange = async () => {
  form.value.subject_id = null;
  await fetchSubjects();
};

const onFilterGradeChange = async () => {
  filters.value.subject_id = null;
  await fetchSubjects();
  fetchQuestionTypes();
};

const clearFilters = () => {
  filters.value = {
    grade_id: null,
    subject_id: null,
  };

  subjects.value = [];
  fetchQuestionTypes();
};

onMounted(() => {
  fetchGrades();
  fetchQuestionTypes();
});
</script>

<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">Question Types</h1>

        <p class="text-grey">
          Manage class-wise and subject-wise question types.
        </p>
      </div>
      <v-spacer />
      <v-file-input
        v-model="importFile"
        label="Upload Excel"
        accept=".xlsx,.xls,.csv"
        variant="outlined"
        density="compact"
        hide-details
        style="max-width: 260px"
      />

      <v-btn
        color="success"
        prepend-icon="mdi-file-excel"
        :loading="importing"
        @click="importQuestionTypes"
      >
        Import
      </v-btn>
      <v-btn
        color="success"
        prepend-icon="mdi-download"
        @click="downloadTemplate"
      >
        Download Template
      </v-btn>

      <v-btn color="primary" prepend-icon="mdi-plus" @click="openAdd">
        Add Question Type
      </v-btn>
    </div>

    <v-card class="pa-4 mb-6 rounded-xl" elevation="0">
      <v-row>
        <v-col cols="12" md="4">
          <v-select
            v-model="filters.grade_id"
            :items="grades"
            item-title="name"
            item-value="id"
            label="Grade"
            clearable
            variant="outlined"
            @update:model-value="onFilterGradeChange"
          />
        </v-col>

        <v-col cols="12" md="4">
          <v-select
            v-model="filters.subject_id"
            :items="subjects"
            item-title="name"
            item-value="id"
            label="Subject"
            clearable
            variant="outlined"
            :disabled="!filters.grade_id"
            @update:model-value="fetchQuestionTypes"
          />
        </v-col>

        <v-col cols="12" md="4" class="d-flex align-center ga-2">
          <v-btn color="primary" @click="fetchQuestionTypes"> Apply </v-btn>

          <v-btn variant="outlined" @click="clearFilters"> Clear </v-btn>
        </v-col>
      </v-row>
    </v-card>

    <v-card class="rounded-xl" elevation="0">
      <v-data-table
        :headers="headers"
        :items="questionTypes"
        :loading="loading"
      >
        <template #item.is_active="{ item }">
          <v-chip
            size="small"
            variant="tonal"
            :color="item.is_active ? 'success' : 'error'"
          >
            {{ item.is_active ? "Active" : "Inactive" }}
          </v-chip>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex ga-1">
            <v-btn
              icon="mdi-pencil"
              size="small"
              variant="text"
              color="primary"
              @click="openEdit(item)"
            />

            <v-btn
              :icon="item.is_active ? 'mdi-eye-off' : 'mdi-eye'"
              size="small"
              variant="text"
              :color="item.is_active ? 'warning' : 'success'"
              @click="toggleStatus(item)"
            />

            <v-btn
              icon="mdi-delete"
              size="small"
              variant="text"
              color="error"
              @click="deleteQuestionType(item)"
            />
          </div>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="650" persistent>
      <v-card class="rounded-xl">
        <v-card-title class="d-flex justify-space-between align-center">
          {{ editMode ? "Edit Question Type" : "Add Question Type" }}

          <v-btn icon="mdi-close" variant="text" @click="dialog = false" />
        </v-card-title>

        <v-divider />

        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-select
                v-model="form.grade_id"
                :items="grades"
                item-title="name"
                item-value="id"
                label="Grade"
                variant="outlined"
                :error-messages="errors.grade_id"
                @update:model-value="onFormGradeChange"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="form.subject_id"
                :items="subjects"
                item-title="name"
                item-value="id"
                label="Subject"
                variant="outlined"
                :disabled="!form.grade_id"
                :error-messages="errors.subject_id"
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model="form.name"
                label="Question Type Name"
                placeholder="MCQ / Difficult Words / Word Meaning"
                variant="outlined"
                :error-messages="errors.name"
              />
            </v-col>

            <v-col cols="12">
              <v-switch
                v-model="form.is_active"
                label="Active"
                color="success"
                :error-messages="errors.is_active"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />

          <v-btn variant="text" @click="dialog = false"> Cancel </v-btn>

          <v-btn color="primary" :loading="saving" @click="saveQuestionType">
            {{ editMode ? "Update" : "Save" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
