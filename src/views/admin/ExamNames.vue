<script setup>
import { ref, onMounted } from "vue";
import api from "../../plugins/api";
import { useUIStore } from "../../stores/snackBar";
import { formatDate } from '../../utils/date'

const ui = useUIStore();

const examNames = ref([]);
const dialog = ref(false);
const editMode = ref(false);
const loading = ref(false);
const saving = ref(false);
const errors = ref({});

const form = ref({
  id: null,
  name: "",
  tentative_date: null,
  is_active: true,
});

const headers = [
  { title: "Exam Name", key: "name" },
  { title: "Tentative Date", key: "tentative_date" },
  { title: "Status", key: "is_active" },
  { title: "Created At", key: "created_at" },
  { title: "Actions", key: "actions", sortable: false },
];

const fetchExamNames = async () => {
  loading.value = true;

  try {
    const res = await api.get("/exam-names");
    examNames.value = res.data.data || res.data;
  } finally {
    loading.value = false;
  }
};

const openAdd = () => {
  editMode.value = false;
  errors.value = {};

  form.value = {
    id: null,
    name: "",
    tentative_date: null,
    is_active: true,
  };

  dialog.value = true;
};

const openEdit = (item) => {
  editMode.value = true;
  errors.value = {};

  form.value = {
    id: item.id,
    name: item.name,
    tentative_date: item.tentative_date,
    is_active: Boolean(item.is_active),
  };

  dialog.value = true;
};

const saveExamName = async () => {
  saving.value = true;
  errors.value = {};

  try {
    if (editMode.value) {
      await api.put(`/exam-names/${form.value.id}`, form.value);
      ui.showSnackbar("Exam name updated successfully");
    } else {
      await api.post("/exam-names", form.value);
      ui.showSnackbar("Exam name created successfully");
    }

    dialog.value = false;
    fetchExamNames();
  } catch (err) {
    if (err.response?.status === 422) {
      errors.value = err.response.data.errors;
    } else {
      ui.showSnackbar("Failed to save exam name", "error");
    }
  } finally {
    saving.value = false;
  }
};

const toggleStatus = async (item) => {
  await api.post(`/exam-names/${item.id}/status`);
  ui.showSnackbar("Status updated successfully");
  fetchExamNames();
};

const deleteExamName = async (item) => {
  const ok = await ui.confirmDialog(
    "Delete Exam Name",
    `Are you sure you want to delete ${item.name}?`,
  );

  if (!ok) return;

  await api.delete(`/exam-names/${item.id}`);
  ui.showSnackbar("Exam name deleted successfully");
  fetchExamNames();
};


onMounted(fetchExamNames);
</script>

<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">Exam Names</h1>

        <p class="text-grey">
          Create and manage exam names like Unit Test, Half Yearly and Annual
          Exam.
        </p>
      </div>

      <v-btn color="primary" prepend-icon="mdi-plus" @click="openAdd">
        Add Exam Name
      </v-btn>
    </div>

    <v-card class="rounded-xl" elevation="0">
      <v-data-table :headers="headers" :items="examNames" :loading="loading">
        <template #item.is_active="{ item }">
          <v-chip
            size="small"
            variant="tonal"
            :color="item.is_active ? 'success' : 'error'"
          >
            {{ item.is_active ? "Active" : "Inactive" }}
          </v-chip>
        </template>

        <template #item.tentative_date="{ item }">
          {{ item.tentative_date ? formatDate(item.tentative_date) : "-" }}
        </template>

        <template #item.created_at="{ item }">
          {{ formatDate(item.created_at) }}
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
              @click="deleteExamName(item)"
            />
          </div>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="520" persistent>
      <v-card class="rounded-xl">
        <v-card-title class="d-flex justify-space-between align-center">
          {{ editMode ? "Edit Exam Name" : "Add Exam Name" }}

          <v-btn icon="mdi-close" variant="text" @click="dialog = false" />
        </v-card-title>

        <v-divider />

        <v-card-text>
          <v-text-field
            v-model="form.name"
            label="Exam Name"
            placeholder="Unit Test 1 / Half Yearly / Annual Exam"
            variant="outlined"
            :error-messages="errors.name"
          />

          <v-text-field
            v-model="form.tentative_date"
            type="date"
            label="Tentative Exam Date"
            variant="outlined"
            :error-messages="errors.tentative_date"
          />

          <v-switch
            v-model="form.is_active"
            label="Active"
            color="success"
            :error-messages="errors.is_active"
          />
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />

          <v-btn variant="text" @click="dialog = false"> Cancel </v-btn>

          <v-btn color="primary" :loading="saving" @click="saveExamName">
            {{ editMode ? "Update" : "Save" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
