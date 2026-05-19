<script setup>
import { ref, computed, onMounted } from "vue";
import api from "../../plugins/api";
import { useUIStore } from "../../stores/snackBar";
import PaperBlueprintPreview from "../../components/paper/PaperBlueprintPreview.vue";

const ui = useUIStore();

const blueprints = ref([]);
const grades = ref([]);
const subjects = ref([]);
const examNames = ref([]);

const dialog = ref(false);
const previewDialog = ref(false);
const editMode = ref(false);
const loading = ref(false);
const saving = ref(false);
const errors = ref({});
const selectedBlueprint = ref(null);

const questionTypes = ref([]);
const questionTypeLoading = ref(false);

const copyDialog = ref(false);
const copySource = ref(null);
const copySubjects = ref([]);

const copyForm = ref({
  grade_id: null,
  subject_id: null,
  exam_name_id: null,
  title: "",
});

const openCopy = async (item) => {
  copySource.value = item;

  copyForm.value = {
    grade_id: null,
    subject_id: null,
    exam_name_id: item.exam_name_id || item.exam_name?.id || null,
    title: `${item.title} Copy`,
  };

  subjects.value = [];
  copyDialog.value = true;
};

const fetchCopySubjects = async () => {
  if (!copyForm.value.grade_id) {
    copySubjects.value = [];
    copyForm.value.subject_id = null;
    return;
  }

  const res = await api.get("/subjects", {
    params: {
      grade_id: copyForm.value.grade_id,
    },
  });

  copySubjects.value = res.data.data || res.data;

  generateCopyBlueprintTitle();
};

const generateCopyBlueprintTitle = () => {
  const grade = grades.value.find(
    (g) => Number(g.id) === Number(copyForm.value.grade_id),
  );

  const subject = copySubjects.value.find(
    (s) => Number(s.id) === Number(copyForm.value.subject_id),
  );

  const exam = examNames.value.find(
    (e) => Number(e.id) === Number(copyForm.value.exam_name_id),
  );

  if (!grade || !subject || !exam) return;

  copyForm.value.title = `${grade.name} ${exam.name} ${subject.name} Paper`;
};

const checkDuplicateCopyBlueprint = () => {
  return blueprints.value.some(
    (bp) =>
      Number(bp.grade_id || bp.grade?.id) === Number(copyForm.value.grade_id) &&
      Number(bp.subject_id || bp.subject?.id) ===
        Number(copyForm.value.subject_id) &&
      Number(bp.exam_name_id || bp.exam_name?.id) ===
        Number(copyForm.value.exam_name_id),
  );
};

const copyBlueprint = async () => {
  if (checkDuplicateCopyBlueprint()) {
    ui.showSnackbar(
      'A blueprint with same grade, subject, and exam already exists.',
      'warning'
    )
    return
  }

  saving.value = true

  try {
    await api.post(
      `/paper-blueprints/${copySource.value.id}/copy`,
      copyForm.value
    )

    ui.showSnackbar('Blueprint copied successfully')
    copyDialog.value = false
    fetchBlueprints()
  } finally {
    saving.value = false
  }
}

// Copy Ends Here

const fetchQuestionTypes = async () => {
  if (!form.value.grade_id || !form.value.subject_id) {
    questionTypes.value = [];
    return;
  }

  const res = await api.get("/question-types", {
    params: {
      grade_id: form.value.grade_id,
      subject_id: form.value.subject_id,
      active_only: 1,
    },
  });

  questionTypes.value = res.data.data || res.data;
};

const form = ref({
  id: null,
  grade_id: null,
  subject_id: null,
  exam_name_id: null,
  title: "",
  is_active: true,
  bloom_levels: [
    { bloom_level: "remember", percentage: 20 },
    { bloom_level: "understand", percentage: 30 },
    { bloom_level: "apply", percentage: 30 },
    { bloom_level: "analyze", percentage: 20 },
    { bloom_level: "evaluate", percentage: 0 },
    { bloom_level: "create", percentage: 0 },
  ],
  sections: [
    {
      section_name: "Section A",
      instructions: "",
      items: [
        {
          question_type: "mcq",
          difficulty: "easy",
          bloom_level: "remember",
          question_count: 10,
          marks_per_question: 1,
        },
      ],
    },
  ],
});

const filters = ref({
  grade_id: null,
  subject_id: null,
  exam_name_id: null,
});

const difficulties = ["easy", "medium", "hard"];

const bloomLevels = [
  "remember",
  "understand",
  "apply",
  "analyze",
  "evaluate",
  "create",
];

const headers = [
  { title: "Title", key: "title" },
  { title: "Grade", key: "grade.name" },
  { title: "Subject", key: "subject.name" },
  { title: "Exam", key: "exam_name.name" },
  { title: "Questions", key: "total_questions" },
  { title: "Marks", key: "total_marks" },
  { title: "Status", key: "is_active" },
  { title: "Actions", key: "actions", sortable: false },
];

const createSectionItem = (overrides = {}) => ({
  id: overrides.id,
  question_type: overrides.question_type || "mcq",
  difficulty: overrides.difficulty || "easy",
  bloom_level: overrides.bloom_level || "remember",
  question_count: Number(overrides.question_count || 1),
  marks_per_question: Number(overrides.marks_per_question || 1),
});

const generateBlueprintTitle = () => {
  // Don't auto-generate on update
  if (editMode.value) return;

  const grade = grades.value.find(
    (g) => Number(g.id) === Number(form.value.grade_id),
  );

  const subject = subjects.value.find(
    (s) => Number(s.id) === Number(form.value.subject_id),
  );

  const exam = examNames.value.find(
    (e) => Number(e.id) === Number(form.value.exam_name_id),
  );

  if (!grade || !subject || !exam) return;

  form.value.title = `${grade.name} ${exam.name} ${subject.name} Paper`;
};

const getSectionItems = (section) => {
  if (Array.isArray(section?.items) && section.items.length) {
    return section.items;
  }

  if (
    section?.question_type ||
    section?.question_count ||
    section?.marks_per_question
  ) {
    return [section];
  }

  return [];
};

const normalizeSection = (section = {}, index = 0) => ({
  id: section.id,
  section_name:
    section.section_name || `Section ${String.fromCharCode(65 + index)}`,
  instructions: section.instructions || "",
  items: getSectionItems(section).length
    ? getSectionItems(section).map((item) => createSectionItem(item))
    : [createSectionItem()],
});

const sectionQuestionTotal = (section) => {
  return getSectionItems(section).reduce(
    (sum, item) => sum + Number(item.question_count || 0),
    0,
  );
};

const sectionMarksTotal = (section) => {
  return getSectionItems(section).reduce(
    (sum, item) =>
      sum +
      Number(item.question_count || 0) * Number(item.marks_per_question || 0),
    0,
  );
};

const blueprintQuestionTotal = (blueprint) => {
  const sections = blueprint?.sections || [];

  if (!sections.length) {
    return Number(blueprint?.total_questions || 0);
  }

  return sections.reduce(
    (sum, section) => sum + sectionQuestionTotal(section),
    0,
  );
};

const blueprintMarksTotal = (blueprint) => {
  const sections = blueprint?.sections || [];

  if (!sections.length) {
    return Number(blueprint?.total_marks || 0);
  }

  return sections.reduce((sum, section) => sum + sectionMarksTotal(section), 0);
};

const totalQuestions = computed(() => {
  return form.value.sections.reduce(
    (sum, section) => sum + sectionQuestionTotal(section),
    0,
  );
});

const totalMarks = computed(() => {
  return form.value.sections.reduce(
    (sum, section) => sum + sectionMarksTotal(section),
    0,
  );
});

const fetchBlueprints = async () => {
  loading.value = true;

  try {
    const res = await api.get("/paper-blueprints", {
      params: filters.value,
    });

    blueprints.value = res.data.data || res.data;
  } finally {
    loading.value = false;
  }
};

const fetchGrades = async () => {
  const res = await api.get("/grades");
  grades.value = res.data.data || res.data;
  generateBlueprintTitle();
};

const fetchSubjects = async () => {
  if (!form.value.grade_id && !filters.value.grade_id) {
    subjects.value = [];
    return;
  }

  const gradeId = form.value.grade_id || filters.value.grade_id;

  const res = await api.get("/subjects", {
    params: {
      grade_id: gradeId,
    },
  });

  subjects.value = res.data.data || res.data;
  generateBlueprintTitle();
};

const onSubjectChange = async (subjectId) => {
  form.value.subject_id = subjectId;

  questionTypes.value = [];

  form.value.sections.forEach((section) => {
    section.items?.forEach((item) => {
      item.question_type = null;
    });
  });

  await fetchQuestionTypes();

  generateBlueprintTitle();
};

const fetchExamNames = async () => {
  const res = await api.get("/exam-names");
  examNames.value = (res.data.data || res.data).filter((e) => e.is_active);
  generateBlueprintTitle();
};

const addSection = () => {
  form.value.sections.push({
    section_name: `Section ${String.fromCharCode(65 + form.value.sections.length)}`,
    instructions: "",
    items: [createSectionItem()],
  });
};

const removeSection = (index) => {
  form.value.sections.splice(index, 1);
};

const openAdd = () => {
  editMode.value = false;
  errors.value = {};

  form.value = {
    id: null,
    grade_id: null,
    subject_id: null,
    exam_name_id: null,
    title: "",
    is_active: true,
    use_bloom_distribution: false,
    bloom_levels: [
      { bloom_level: "remember", percentage: 20 },
      { bloom_level: "understand", percentage: 30 },
      { bloom_level: "apply", percentage: 30 },
      { bloom_level: "analyze", percentage: 20 },
      { bloom_level: "evaluate", percentage: 0 },
      { bloom_level: "create", percentage: 0 },
    ],
    sections: [],
  };

  subjects.value = [];
  addSection();
  dialog.value = true;
};

const openEdit = async (item) => {
  editMode.value = true;
  errors.value = {};

  form.value = {
    id: item.id,
    grade_id: item.grade_id,
    subject_id: item.subject_id,
    exam_name_id: item.exam_name_id,
    title: item.title,
    is_active: Boolean(item.is_active),
    use_bloom_distribution: item.bloom_levels?.length > 0,
    bloom_levels: item.bloom_levels?.length
      ? item.bloom_levels
      : [
          { bloom_level: "remember", percentage: 20 },
          { bloom_level: "understand", percentage: 30 },
          { bloom_level: "apply", percentage: 30 },
          { bloom_level: "analyze", percentage: 20 },
          { bloom_level: "evaluate", percentage: 0 },
          { bloom_level: "create", percentage: 0 },
        ],
    sections: item.sections?.length
      ? item.sections.map((section, index) => normalizeSection(section, index))
      : [],
  };

  await fetchSubjects();

  dialog.value = true;
};

const saveBlueprint = async () => {
  saving.value = true;
  errors.value = {};

  try {
    if (!form.value.sections.length) {
      ui.showSnackbar("Please add at least one section", "warning");
      return;
    }
    if (
      form.value.use_bloom_distribution &&
      totalBloomPercentage.value !== 100
    ) {
      ui.showSnackbar("Bloom level percentage must be exactly 100%", "warning");
      return;
    }

    const payload = {
      ...form.value,
      total_questions: totalQuestions.value,
      total_marks: totalMarks.value,
      sections: form.value.sections.map((section, index) =>
        normalizeSection(section, index),
      ),
      bloom_levels: form.value.use_bloom_distribution
        ? form.value.bloom_levels
        : [],
    };

    if (editMode.value) {
      await api.put(`/paper-blueprints/${form.value.id}`, payload);
      ui.showSnackbar("Blueprint updated successfully");
    } else {
      await api.post("/paper-blueprints", payload);
      ui.showSnackbar("Blueprint created successfully");
    }

    dialog.value = false;
    fetchBlueprints();
  } catch (err) {
    if (err.response?.status === 422) {
      errors.value = err.response.data.errors;
    } else {
      ui.showSnackbar("Failed to save blueprint", "error");
    }
  } finally {
    saving.value = false;
  }
};

const openPreview = (item) => {
  selectedBlueprint.value = {
    ...item,
    sections: (item.sections || []).map((section, index) =>
      normalizeSection(section, index),
    ),
  };
  previewDialog.value = true;
};

const toggleStatus = async (item) => {
  await api.post(`/paper-blueprints/${item.id}/status`);
  ui.showSnackbar("Status updated successfully");
  fetchBlueprints();
};

const deleteBlueprint = async (item) => {
  const ok = await ui.confirmDialog(
    "Delete Blueprint",
    "Are you sure you want to delete this blueprint?",
  );

  if (!ok) return;

  await api.delete(`/paper-blueprints/${item.id}`);
  ui.showSnackbar("Blueprint deleted successfully");
  fetchBlueprints();
};

const clearFilters = () => {
  filters.value = {
    grade_id: null,
    subject_id: null,
    exam_name_id: null,
  };

  fetchBlueprints();
};

const addSectionItem = (section) => {
  if (!Array.isArray(section.items)) {
    section.items = getSectionItems(section).map((item) =>
      createSectionItem(item),
    );
  }

  section.items.push(createSectionItem());
};

const totalBloomPercentage = computed(() => {
  return form.value.bloom_levels.reduce(
    (sum, item) => sum + Number(item.percentage || 0),
    0,
  );
});

onMounted(() => {
  fetchGrades();
  fetchExamNames();
  fetchBlueprints();
});
</script>

<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">Paper Blueprints</h1>

        <p class="text-grey">
          Create section-wise paper patterns for automatic question paper
          generation.
        </p>
      </div>

      <v-btn color="primary" prepend-icon="mdi-plus" @click="openAdd">
        Create Blueprint
      </v-btn>
    </div>

    <v-card class="pa-4 mb-6 rounded-xl" elevation="0">
      <v-row>
        <v-col cols="12" md="3">
          <v-select
            v-model="filters.grade_id"
            :items="grades"
            item-title="name"
            item-value="id"
            label="Grade"
            clearable
            variant="outlined"
            @update:model-value="fetchSubjects"
          />
        </v-col>

        <v-col cols="12" md="3">
          <v-select
            v-model="filters.subject_id"
            :items="subjects"
            item-title="name"
            item-value="id"
            label="Subject"
            variant="outlined"
            :disabled="!filters.grade_id"
            :error-messages="errors.subject_id"
          />
        </v-col>

        <v-col cols="12" md="3">
          <v-select
            v-model="filters.exam_name_id"
            :items="examNames"
            item-title="name"
            item-value="id"
            label="Exam"
            clearable
            variant="outlined"
            :error-messages="errors.exam_name_id"
          />
        </v-col>

        <v-col cols="12" md="3" class="d-flex align-center ga-2">
          <v-btn color="primary" @click="fetchBlueprints"> Apply </v-btn>

          <v-btn variant="outlined" @click="clearFilters"> Clear </v-btn>
        </v-col>
      </v-row>
    </v-card>

    <v-card class="rounded-xl" elevation="0">
      <v-data-table :headers="headers" :items="blueprints" :loading="loading">
        <template #item.title="{ item }">
          <div class="d-flex align-center ga-2">
            <span class="font-weight-medium">
              {{ item.title }}
            </span>

            <v-tooltip location="top">
              <template #activator="{ props }">
                <v-chip
                  v-bind="props"
                  v-if="item.bloom_levels?.length"
                  size="x-small"
                  color="deep-purple"
                  variant="flat"
                  prepend-icon="mdi-brain"
                >
                  Bloom
                </v-chip>
              </template>

              Includes Bloom Taxonomy Distribution
            </v-tooltip>
          </div>
        </template>

        <template #item.is_active="{ item }">
          <v-chip
            size="small"
            variant="tonal"
            :color="item.is_active ? 'success' : 'error'"
          >
            {{ item.is_active ? "Active" : "Inactive" }}
          </v-chip>
        </template>

        <template #item.total_questions="{ item }">
          {{ blueprintQuestionTotal(item) }}
        </template>

        <template #item.total_marks="{ item }">
          {{ blueprintMarksTotal(item) }}
        </template>

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
              icon="mdi-content-copy"
              size="small"
              variant="text"
              color="secondary"
              @click="openCopy(item)"
            />

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
              @click="deleteBlueprint(item)"
            />
          </div>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="1100" persistent>
      <v-card class="rounded-xl">
        <v-card-title class="d-flex justify-space-between align-center">
          {{ editMode ? "Edit Blueprint" : "Create Blueprint" }}

          <v-btn icon="mdi-close" variant="text" @click="dialog = false" />
        </v-card-title>

        <v-divider />

        <v-card-text>
          <v-row>
            <v-col cols="12" md="3">
              <v-select
                v-model="form.grade_id"
                :items="grades"
                item-title="name"
                item-value="id"
                label="Grade"
                variant="outlined"
                :error-messages="errors.grade_id"
                @update:model-value="fetchSubjects"
              />
            </v-col>

            <v-col cols="12" md="3">
              <v-select
                v-model="form.subject_id"
                :items="subjects"
                item-title="name"
                item-value="id"
                label="Subject"
                variant="outlined"
                :disabled="!form.grade_id"
                :error-messages="errors.subject_id"
                @update:model-value="onSubjectChange"
              />
            </v-col>

            <v-col cols="12" md="3">
              <v-select
                v-model="form.exam_name_id"
                :items="examNames"
                item-title="name"
                item-value="id"
                label="Exam Name"
                variant="outlined"
                clearable
                :error-messages="errors.exam_name_id"
                @update:model-value="generateBlueprintTitle"
              />
            </v-col>

            <v-col cols="12" md="3">
              <v-switch
                v-model="form.is_active"
                label="Active"
                color="success"
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model="form.title"
                label="Blueprint Title"
                variant="outlined"
                placeholder="Class 10 Science Half Yearly Blueprint"
                :error-messages="errors.title"
              />
            </v-col>
          </v-row>

          <v-alert type="info" variant="tonal" class="mb-4">
            Total Questions:
            <strong>{{ totalQuestions }}</strong>
            | Total Marks:
            <strong>{{ totalMarks }}</strong>
          </v-alert>

          <v-switch
            v-model="form.use_bloom_distribution"
            color="primary"
            label="Use Bloom Taxonomy Distribution"
          />

          <v-expand-transition>
            <div v-if="form.use_bloom_distribution">
              <!-- Bloom Taxonomy Distribution card -->
              <v-card class="pa-4 rounded-xl mb-4" variant="outlined">
                <div class="d-flex justify-space-between align-center mb-4">
                  <div>
                    <div class="text-h6 font-weight-bold">
                      Bloom Taxonomy Distribution
                    </div>

                    <div class="text-caption text-grey">
                      Set desired percentage for CBSE cognitive levels.
                    </div>
                  </div>

                  <v-chip
                    :color="totalBloomPercentage === 100 ? 'success' : 'error'"
                    variant="tonal"
                  >
                    Total: {{ totalBloomPercentage }}%
                  </v-chip>
                </div>

                <v-row>
                  <v-col
                    v-for="item in form.bloom_levels"
                    :key="item.bloom_level"
                    cols="12"
                    md="6"
                  >
                    <v-card class="pa-3 rounded-lg" variant="tonal">
                      <div
                        class="d-flex justify-space-between align-center mb-2"
                      >
                        <div
                          class="text-subtitle-2 font-weight-bold text-capitalize"
                        >
                          {{ item.bloom_level }}
                        </div>

                        <v-chip size="small" color="primary" variant="flat">
                          {{ item.percentage || 0 }}%
                        </v-chip>
                      </div>

                      <v-slider
                        v-model="item.percentage"
                        min="0"
                        max="100"
                        step="5"
                        thumb-label
                        color="primary"
                      />

                      <v-text-field
                        v-model.number="item.percentage"
                        type="number"
                        min="0"
                        max="100"
                        suffix="%"
                        density="compact"
                        variant="outlined"
                        hide-details
                      />
                    </v-card>
                  </v-col>
                </v-row>

                <v-alert
                  v-if="totalBloomPercentage !== 100"
                  type="warning"
                  variant="tonal"
                  class="mt-4"
                >
                  Bloom level total must be exactly 100%.
                </v-alert>
              </v-card>
            </div>
          </v-expand-transition>

          <div class="d-flex justify-space-between align-center mb-3">
            <div class="text-h6 font-weight-bold">Sections</div>
          </div>

          <v-card
            v-for="(section, sectionIndex) in form.sections"
            :key="sectionIndex"
            class="pa-4 mb-4 rounded-xl"
            variant="outlined"
          >
            <div class="d-flex justify-space-between align-center mb-3">
              <v-text-field
                v-model="section.section_name"
                label="Section Name"
                variant="outlined"
                style="max-width: 250px"
              />

              <v-btn
                icon="mdi-delete"
                color="error"
                variant="text"
                :disabled="form.sections.length === 1"
                @click="removeSection(sectionIndex)"
              />
            </div>

            <v-textarea
              v-model="section.instructions"
              label="Section Instructions"
              rows="2"
              auto-grow
              variant="outlined"
              class="mb-4"
            />

            <v-card
              v-for="(item, itemIndex) in section.items"
              :key="itemIndex"
              class="pa-3 mb-3 rounded-lg"
              variant="tonal"
            >
              <div class="d-flex justify-space-between align-center mb-2">
                <strong>Question Type {{ itemIndex + 1 }}</strong>

                <v-btn
                  icon="mdi-delete"
                  size="small"
                  color="error"
                  variant="text"
                  :disabled="section.items.length === 1"
                  @click="section.items.splice(itemIndex, 1)"
                />
              </div>

              <v-row>
                <v-col cols="12" md="3">
                  <v-select
                    v-model="item.question_type"
                    :items="questionTypes"
                    item-title="name"
                    item-value="slug"
                    label="Question Type"
                    variant="outlined"
                    :loading="questionTypeLoading"
                    :disabled="!form.grade_id || !form.subject_id"
                  />
                </v-col>

                <v-col cols="12" md="2">
                  <v-select
                    v-model="item.difficulty"
                    :items="difficulties"
                    label="Difficulty"
                    clearable
                    variant="outlined"
                  />
                </v-col>

                <v-col cols="12" md="2">
                  <v-select
                    v-model="item.bloom_level"
                    :items="bloomLevels"
                    label="Bloom"
                    clearable
                    variant="outlined"
                  />
                </v-col>

                <v-col cols="12" md="2">
                  <v-text-field
                    v-model="item.question_count"
                    type="number"
                    label="Qty"
                    variant="outlined"
                  />
                </v-col>

                <v-col cols="12" md="2">
                  <v-text-field
                    v-model="item.marks_per_question"
                    type="number"
                    label="Marks"
                    variant="outlined"
                  />
                </v-col>

                <v-col cols="12" md="1">
                  <div class="text-caption text-grey">Total</div>
                  <strong>
                    {{
                      Number(item.question_count || 0) *
                      Number(item.marks_per_question || 0)
                    }}
                  </strong>
                </v-col>
              </v-row>
            </v-card>

            <v-btn
              color="primary"
              variant="text"
              prepend-icon="mdi-plus"
              @click="addSectionItem(section)"
            >
              Add Question Type
            </v-btn>
          </v-card>

          <div class="text-center">
            <v-btn
              color="primary"
              variant="tonal"
              prepend-icon="mdi-plus"
              @click="addSection"
            >
              Add Section
            </v-btn>
          </div>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />

          <v-btn variant="text" @click="dialog = false"> Cancel </v-btn>

          <v-btn color="primary" :loading="saving" @click="saveBlueprint">
            {{ editMode ? "Update Blueprint" : "Save Blueprint" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="previewDialog" max-width="900">
      <v-card class="rounded-xl">
        <v-card-title class="d-flex justify-space-between align-center">
          Blueprint Preview

          <v-btn
            icon="mdi-close"
            variant="text"
            @click="previewDialog = false"
          />
        </v-card-title>

        <v-divider />

        <v-card-text v-if="selectedBlueprint">
          <PaperBlueprintPreview :blueprint="selectedBlueprint" />
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="copyDialog" max-width="650">
      <v-card class="rounded-xl">
        <v-card-title> Copy Blueprint </v-card-title>

        <v-card-text>
          <v-alert type="info" variant="tonal" class="mb-4">
            Copying: <strong>{{ copySource?.title }}</strong>
          </v-alert>

          <v-row>
            <v-col cols="12" md="6">
              <v-select
                v-model="copyForm.grade_id"
                :items="grades"
                item-title="name"
                item-value="id"
                label="New Grade"
                variant="outlined"
                @update:model-value="fetchCopySubjects"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="copyForm.subject_id"
                :items="copySubjects"
                item-title="name"
                item-value="id"
                label="New Subject"
                variant="outlined"
                :disabled="!copyForm.grade_id"
                @update:model-value="generateCopyBlueprintTitle"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="copyForm.exam_name_id"
                :items="examNames"
                item-title="name"
                item-value="id"
                label="Exam"
                clearable
                variant="outlined"
                @update:model-value="generateCopyBlueprintTitle"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="copyForm.title"
                label="New Blueprint Title"
                variant="outlined"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />

          <v-btn variant="text" @click="copyDialog = false"> Cancel </v-btn>

          <v-btn color="primary" :loading="saving" @click="copyBlueprint">
            Copy Blueprint
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
