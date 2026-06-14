<script setup>
import { ref, computed, onMounted, watch } from "vue";
import api from "../../plugins/api";
import { useUIStore } from "../../stores/snackBar";

const ui = useUIStore();

const loading = ref(false);
const saving = ref(false);
const applying = ref(false);

const dialog = ref(false);
const applyDialog = ref(false);

const templates = ref([]);
const questionTypeMasters = ref([]);
const grades = ref([]);
const streams = ref([]);
const subjects = ref([]);

const selectedTemplate = ref(null);
const formErrors = ref({});

const form = ref({
  id: null,
  name: "",
  category: "",
  question_type_master_ids: [],
  is_active: true,
});

const applyForm = ref({
  grade_ids: [],
  stream_id: null,
  subject_ids: [],
});

const headers = [
  { title: "Template Name", key: "name" },
  { title: "Category", key: "category" },
  { title: "Question Types", key: "question_types", sortable: false },
  { title: "Status", key: "is_active" },
  { title: "Actions", key: "actions", sortable: false, align: "end" },
];

const subjectOptions = computed(() => {
  if (!applyForm.value.grade_ids?.length) {
    return [];
  }

  const selectedGradeIds = applyForm.value.grade_ids.map(Number);
  const selectedStreamId = applyForm.value.stream_id
    ? Number(applyForm.value.stream_id)
    : null;

  return subjects.value.filter((subject) => {
    if (!subject.is_active) return false;

    if (!selectedGradeIds.includes(Number(subject.grade_id))) {
      return false;
    }

    if (selectedStreamId) {
      return (
        subject.stream_id === null ||
        Number(subject.stream_id) === selectedStreamId
      );
    }

    return true;
  });
});

const subjectTitle = (subject) => {
  if (!subject) return "-";

  const gradeName = subject.grade?.name || "";
  const streamName = subject.stream?.name || "";
  const subjectName = subject.name || "";

  if (streamName) {
    return `${gradeName} - ${streamName} - ${subjectName}`;
  }

  return gradeName ? `${gradeName} - ${subjectName}` : subjectName;
};

const fetchTemplates = async () => {
  loading.value = true;

  try {
    const res = await api.get("/question-type-templates");
    templates.value = res.data.data || res.data || [];
  } catch (error) {
    ui.showSnackbar("Failed to load question type templates", "error");
  } finally {
    loading.value = false;
  }
};

const fetchQuestionTypeMasters = async () => {
  const res = await api.get("/question-type-template-masters");
  questionTypeMasters.value = res.data.data || res.data || [];
};

const fetchGrades = async () => {
  const res = await api.get("/grades");
  grades.value = res.data.data || res.data || [];
};

const fetchStreams = async () => {
  const res = await api.get("/streams");
  streams.value = res.data.data || res.data || [];
};

const fetchSubjects = async () => {
  const res = await api.get("/subjects");
  subjects.value = res.data.data || res.data || [];
};

const openCreate = () => {
  formErrors.value = {};

  form.value = {
    id: null,
    name: "",
    category: "",
    question_type_master_ids: [],
    is_active: true,
  };

  dialog.value = true;
};

const openEdit = (template) => {
  formErrors.value = {};

  form.value = {
    id: template.id,
    name: template.name,
    category: template.category || "",
    question_type_master_ids: (template.items || []).map(
      (item) => item.question_type_master_id
    ),
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
      category: form.value.category || null,
      question_type_master_ids: form.value.question_type_master_ids,
      is_active: form.value.is_active,
    };

    if (form.value.id) {
      await api.put(`/question-type-templates/${form.value.id}`, payload);
      ui.showSnackbar("Question type template updated successfully", "success");
    } else {
      await api.post("/question-type-templates", payload);
      ui.showSnackbar("Question type template created successfully", "success");
    }

    dialog.value = false;
    await fetchTemplates();
  } catch (error) {
    if (error.response?.status === 422) {
      formErrors.value = error.response.data.errors || {};
    } else {
      ui.showSnackbar("Failed to save question type template", "error");
    }
  } finally {
    saving.value = false;
  }
};

const openApply = async (template) => {
  selectedTemplate.value = template;

  applyForm.value = {
    grade_ids: [],
    stream_id: null,
    subject_ids: [],
  };

  formErrors.value = {};

  if (!subjects.value.length) {
    await fetchSubjects();
  }

  applyDialog.value = true;
};

const removeSelectedSubject = (id) => {
  applyForm.value.subject_ids = applyForm.value.subject_ids.filter(
    (subjectId) => Number(subjectId) !== Number(id)
  );
};

watch(subjectOptions, (value) => {
  console.log("Subject Options:", value);
});

watch(
  () => [applyForm.value.grade_ids, applyForm.value.stream_id],
  () => {
    applyForm.value.subject_ids = [];
  },
  { deep: true }
);

const applyTemplate = async () => {
  applying.value = true;
  formErrors.value = {};

  try {
    const res = await api.post(
      `/question-type-templates/${selectedTemplate.value.id}/apply`,
      applyForm.value
    );

    ui.showSnackbar(
      `Template applied successfully. Created: ${res.data.created}, Skipped: ${res.data.skipped}`,
      "success"
    );

    applyDialog.value = false;
  } catch (error) {
    if (error.response?.status === 422) {
      formErrors.value = error.response.data.errors || {};
    } else {
      ui.showSnackbar("Failed to apply question type template", "error");
    }
  } finally {
    applying.value = false;
  }
};

const deleteTemplate = async (template) => {
  const ok = await ui.confirmDialog(
    "Delete Template",
    `Are you sure you want to delete "${template.name}"?`
  );

  if (!ok) return;

  try {
    await api.delete(`/question-type-templates/${template.id}`);
    ui.showSnackbar("Question type template deleted", "success");
    await fetchTemplates();
  } catch (error) {
    ui.showSnackbar("Failed to delete template", "error");
  }
};

onMounted(async () => {
  await Promise.all([
    fetchTemplates(),
    fetchQuestionTypeMasters(),
    fetchGrades(),
    fetchStreams(),
    fetchSubjects(),
  ]);
});
</script>

<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">Question Type Templates</h1>
        <p class="text-grey">
          Create reusable question type sets and apply them to classes,
          streams, and subjects.
        </p>
      </div>

      <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreate">
        New Template
      </v-btn>
    </div>

    <v-card class="rounded-xl" elevation="0">
      <AppDataTable :headers="headers" :items="templates" :loading="loading">
        <template #item.category="{ item }">
          <v-chip v-if="item.category" size="small" color="info" variant="tonal">
            {{ item.category }}
          </v-chip>

          <span v-else class="text-grey">-</span>
        </template>

        <template #item.question_types="{ item }">
          <div class="d-flex flex-wrap ga-2 py-2">
            <v-chip v-for="templateItem in item.items" :key="templateItem.id" size="small" color="primary"
              variant="tonal">
              {{ templateItem.question_type?.name || "Question Type" }}
            </v-chip>
          </div>
        </template>

        <template #item.is_active="{ item }">
          <v-chip size="small" :color="item.is_active ? 'success' : 'error'" variant="tonal">
            {{ item.is_active ? "Active" : "Inactive" }}
          </v-chip>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex justify-end ga-1">
            <v-tooltip text="Apply Template">
              <template #activator="{ props }">
                <v-btn v-bind="props" icon="mdi-playlist-plus" size="small" color="success" variant="text"
                  @click="openApply(item)" />
              </template>
            </v-tooltip>

            <v-tooltip text="Edit">
              <template #activator="{ props }">
                <v-btn v-bind="props" icon="mdi-pencil" size="small" color="primary" variant="text"
                  @click="openEdit(item)" />
              </template>
            </v-tooltip>

            <v-tooltip text="Delete">
              <template #activator="{ props }">
                <v-btn v-bind="props" icon="mdi-delete" size="small" color="error" variant="text"
                  @click="deleteTemplate(item)" />
              </template>
            </v-tooltip>
          </div>
        </template>
      </AppDataTable>
    </v-card>

    <v-dialog v-model="dialog" max-width="750">
      <v-card class="rounded-xl">
        <v-card-title class="font-weight-bold">
          {{ form.id ? "Edit Question Type Template" : "Create Question Type Template" }}
        </v-card-title>

        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.name" label="Template Name" placeholder="Example: Primary Question Pattern"
                :error-messages="formErrors.name" />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field v-model="form.category" label="Category" placeholder="Example: Primary / Board / Science"
                :error-messages="formErrors.category" />
            </v-col>

            <v-col cols="12">
              <v-autocomplete v-model="form.question_type_master_ids" :items="questionTypeMasters" item-title="name"
                item-value="id" label="Question Types" multiple chips closable-chips :error-messages="formErrors.question_type_master_ids ||
                  formErrors['question_type_master_ids.0']
                  " />
            </v-col>

            <v-col cols="12">
              <v-switch v-model="form.is_active" label="Active" color="success" hide-details />
            </v-col>
          </v-row>

          <v-alert type="info" variant="tonal" class="mt-3">
            This template only stores question type pattern. It will not create
            assignments until you apply it to grade, stream, and subjects.
          </v-alert>
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn variant="text" @click="dialog = false">
            Cancel
          </v-btn>

          <v-btn color="primary" :loading="saving" @click="saveTemplate">
            Save Template
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="applyDialog" max-width="800">
      <v-card class="rounded-xl">
        <v-card-title class="font-weight-bold">
          Apply Template: {{ selectedTemplate?.name }}
        </v-card-title>

        <v-card-text>
          <v-row>
            <v-col cols="12">
              <div class="text-subtitle-2 mb-2">Question Types</div>

              <div class="d-flex flex-wrap ga-2 mb-4">
                <v-chip v-for="templateItem in selectedTemplate?.items || []" :key="templateItem.id" size="small"
                  color="primary" variant="tonal">
                  {{ templateItem.question_type?.name }}
                </v-chip>
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <v-select v-model="applyForm.grade_ids" :items="grades" item-title="name" item-value="id"
                label="Apply to Grades" multiple chips closable-chips
                :error-messages="formErrors.grade_ids || formErrors['grade_ids.0']" />
            </v-col>

            <v-col cols="12" md="6">
              <v-select v-model="applyForm.stream_id" :items="streams" item-title="name" item-value="id" label="Stream"
                clearable hint="Leave empty for Grade 1–10. Select Science/Commerce/Humanities for Grade 11–12."
                persistent-hint :error-messages="formErrors.stream_id" />
            </v-col>

            <v-col cols="12">
              <v-autocomplete v-model="applyForm.subject_ids" :items="subjectOptions" :item-title="subjectTitle"
                item-value="id" label="Apply to Subjects" multiple chips closable-chips variant="outlined"
                :disabled="!applyForm.grade_ids.length"
                :error-messages="formErrors.subject_ids || formErrors['subject_ids.0']">
                <template #selection="{ item, index }">
                  <v-chip v-if="index < 3" size="small" closable
                    @click:close="removeSelectedSubject(item.raw?.id ?? item.value)">
                    {{ subjectTitle(item.raw) }}
                  </v-chip>

                  <span v-if="index === 3" class="text-grey text-caption">
                    +{{ applyForm.subject_ids.length - 3 }} more
                  </span>
                </template>
              </v-autocomplete>
            </v-col>
          </v-row>

          <v-alert type="warning" variant="tonal" class="mt-3">
            Existing question type assignments will be skipped. Only missing
            assignments will be created.
          </v-alert>
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn variant="text" @click="applyDialog = false">
            Cancel
          </v-btn>

          <v-btn color="success" :loading="applying" @click="applyTemplate">
            Apply Template
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>