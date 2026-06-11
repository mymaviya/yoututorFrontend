<script setup>
import { ref, computed, onMounted } from "vue";
import api from "../../plugins/api";
import { useUIStore } from "../../stores/snackBar";

const ui = useUIStore();

const loading = ref(false);
const saving = ref(false);
const applying = ref(false);

const dialog = ref(false);
const applyDialog = ref(false);

const templates = ref([]);
const grades = ref([]);
const streams = ref([]);

const formErrors = ref({});
const selectedTemplate = ref(null);

const form = ref({
  id: null,
  name: "",
  subjects_text: "",
  is_active: true,
});

const applyForm = ref({
  grade_ids: [],
  stream_id: null,
});

const headers = [
  { title: "Template Name", key: "name" },
  { title: "Subjects", key: "subjects", sortable: false },
  { title: "Status", key: "is_active" },
  { title: "Actions", key: "actions", sortable: false, align: "end" },
];

const subjectNames = computed(() => {
  return form.value.subjects_text
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
});

const fetchTemplates = async () => {
  loading.value = true;
  try {
    const res = await api.get("/subject-templates");
    templates.value = res.data.data || res.data;
  } finally {
    loading.value = false;
  }
};

const fetchGrades = async () => {
  const res = await api.get("/grades");
  grades.value = res.data.data || res.data;
};

const fetchStreams = async () => {
  const res = await api.get("/streams");
  streams.value = res.data.data || res.data;
};

const openCreate = () => {
  formErrors.value = {};
  form.value = {
    id: null,
    name: "",
    subjects_text: "",
    is_active: true,
  };
  dialog.value = true;
};

const openEdit = (template) => {
  formErrors.value = {};
  form.value = {
    id: template.id,
    name: template.name,
    subjects_text: (template.items || [])
      .map((item) => item.subject_name)
      .join(", "),
    is_active: template.is_active,
  };
  dialog.value = true;
};

const saveTemplate = async () => {
  saving.value = true;
  formErrors.value = {};

  try {
    const payload = {
      name: form.value.name,
      subjects: subjectNames.value,
      is_active: form.value.is_active,
    };

    if (form.value.id) {
      await api.put(`/subject-templates/${form.value.id}`, payload);
      ui.showSnackbar("Template updated successfully", "success");
    } else {
      await api.post("/subject-templates", payload);
      ui.showSnackbar("Template created successfully", "success");
    }

    dialog.value = false;
    await fetchTemplates();
  } catch (error) {
    if (error.response?.status === 422) {
      formErrors.value = error.response.data.errors || {};
    } else {
      ui.showSnackbar("Failed to save template", "error");
    }
  } finally {
    saving.value = false;
  }
};

const openApply = (template) => {
  selectedTemplate.value = template;
  applyForm.value = {
    grade_ids: [],
    stream_id: null,
  };
  formErrors.value = {};
  applyDialog.value = true;
};

const applyTemplate = async () => {
  applying.value = true;
  formErrors.value = {};

  try {
    const res = await api.post(
      `/subject-templates/${selectedTemplate.value.id}/apply`,
      applyForm.value
    );

    ui.showSnackbar(
      `Template applied. Created: ${res.data.created}, Skipped: ${res.data.skipped}`,
      "success"
    );

    applyDialog.value = false;
  } catch (error) {
    if (error.response?.status === 422) {
      formErrors.value = error.response.data.errors || {};
    } else {
      ui.showSnackbar("Failed to apply template", "error");
    }
  } finally {
    applying.value = false;
  }
};

const deleteTemplate = async (template) => {
  if (!confirm(`Delete template "${template.name}"?`)) return;

  await api.delete(`/subject-templates/${template.id}`);
  ui.showSnackbar("Template deleted", "success");
  await fetchTemplates();
};

onMounted(async () => {
  await Promise.all([fetchTemplates(), fetchGrades(), fetchStreams()]);
});
</script>

<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">Subject Templates</h1>
        <p class="text-grey">
          Create reusable subject sets and apply them to multiple classes.
        </p>
      </div>

      <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreate">
        New Template
      </v-btn>
    </div>

    <v-card class="rounded-xl" elevation="0">
      <AppDataTable
        :headers="headers"
        :items="templates"
        :loading="loading"
      >
        <template #item.subjects="{ item }">
          <div class="d-flex flex-wrap ga-2 py-2">
            <v-chip
              v-for="subject in item.items"
              :key="subject.id"
              size="small"
              color="primary"
              variant="tonal"
            >
              {{ subject.subject_name }}
            </v-chip>
          </div>
        </template>

        <template #item.is_active="{ item }">
          <v-chip
            size="small"
            :color="item.is_active ? 'success' : 'error'"
            variant="tonal"
          >
            {{ item.is_active ? "Active" : "Inactive" }}
          </v-chip>
        </template>

        <template #item.actions="{ item }">
          <v-btn
            icon="mdi-playlist-plus"
            size="small"
            color="success"
            variant="text"
            @click="openApply(item)"
          />
          <v-btn
            icon="mdi-pencil"
            size="small"
            color="primary"
            variant="text"
            @click="openEdit(item)"
          />
          <v-btn
            icon="mdi-delete"
            size="small"
            color="error"
            variant="text"
            @click="deleteTemplate(item)"
          />
        </template>
      </AppDataTable>
    </v-card>

    <v-dialog v-model="dialog" max-width="700">
      <v-card class="rounded-xl">
        <v-card-title class="font-weight-bold">
          {{ form.id ? "Edit Template" : "Create Template" }}
        </v-card-title>

        <v-card-text>
          <v-text-field
            v-model="form.name"
            label="Template Name"
            :error-messages="formErrors.name"
          />

          <v-textarea
            v-model="form.subjects_text"
            label="Subjects"
            rows="5"
            auto-grow
            hint="Enter subjects separated by comma or new line"
            persistent-hint
            :error-messages="formErrors.subjects"
          />

          <v-switch
            v-model="form.is_active"
            label="Active"
            color="success"
            hide-details
          />
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialog = false">Cancel</v-btn>
          <v-btn color="primary" :loading="saving" @click="saveTemplate">
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="applyDialog" max-width="700">
      <v-card class="rounded-xl">
        <v-card-title class="font-weight-bold">
          Apply Template: {{ selectedTemplate?.name }}
        </v-card-title>

        <v-card-text>
          <v-select
            v-model="applyForm.grade_ids"
            :items="grades"
            item-title="name"
            item-value="id"
            label="Apply to Classes"
            multiple
            chips
            closable-chips
            :error-messages="formErrors.grade_ids"
          />

          <v-select
            v-model="applyForm.stream_id"
            :items="streams"
            item-title="name"
            item-value="id"
            label="Stream (optional)"
            clearable
            :error-messages="formErrors.stream_id"
          />

          <v-alert type="info" variant="tonal" class="mt-3">
            For Classes 1–10, leave stream empty. For Classes 11–12, select
            the stream if the template applies only to that stream.
          </v-alert>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="applyDialog = false">Cancel</v-btn>
          <v-btn color="success" :loading="applying" @click="applyTemplate">
            Apply
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>