<script setup>
import { ref, computed, onMounted } from "vue";
import api from "../../plugins/api";
import { useUIStore } from "../../stores/snackBar";
import PaperBlueprintPreview from "../../components/paper/PaperBlueprintPreview.vue";
import AppEditor from "../exams/components/AppEditor.vue";

const ui = useUIStore();

const grades = ref([]);
const subjects = ref([]);
const examNames = ref([]);
const blueprints = ref([]);

const loading = ref(false);
const blueprintLoading = ref(false);
const previewLoading = ref(false);
const generating = ref(false);

const moderateDifficultyMode = ref(false);
const autoTitle = ref(true);
const autoInstructions = ref(true);

const selectedBlueprintDetails = ref(null);
const preview = ref(null);
const shortages = ref([]);

const form = ref({
  grade_id: null,
  subject_id: null,
  exam_name_id: null,
  paper_blueprint_id: null,
  title: "",
  duration: "",
  instructions: "",
});

const selectedGrade = computed(() =>
  grades.value.find((g) => Number(g.id) === Number(form.value.grade_id))
);

const selectedSubject = computed(() =>
  subjects.value.find((s) => Number(s.id) === Number(form.value.subject_id))
);

const selectedExam = computed(() =>
  examNames.value.find((e) => Number(e.id) === Number(form.value.exam_name_id))
);

const selectedBlueprint = computed(() => {
  return (
    selectedBlueprintDetails.value ||
    blueprints.value.find(
      (b) => Number(b.id) === Number(form.value.paper_blueprint_id)
    )
  );
});

const hasShortages = computed(() => shortages.value.length > 0);

const questionCount = computed(() => {
  if (!preview.value?.sections?.length) return 0;

  return preview.value.sections.reduce((total, section) => {
    return (
      total +
      (section.items || []).reduce((sum, item) => {
        return sum + Number(item.questions?.length || 0);
      }, 0)
    );
  }, 0);
});

const totalMarks = computed(() => {
  return preview.value?.total_marks || selectedBlueprint.value?.total_marks || 0;
});

const blueprintTotalQuestions = computed(() => {
  if (!selectedBlueprint.value?.sections?.length) return 0;

  return selectedBlueprint.value.sections.reduce((total, section) => {
    return (
      total +
      (section.items || []).reduce((sum, item) => {
        return sum + Number(item.question_count || 0);
      }, 0)
    );
  }, 0);
});

const blueprintTitle = (blueprint) => {
  if (!blueprint) return "-";

  const title = blueprint.name || blueprint.title || "Untitled Blueprint";
  const subjectName = blueprint.subject?.name || "";
  const examName = blueprint.exam_name?.name || blueprint.examName?.name || "";

  return title;
};

const buildAutoTitle = () => {
  const gradeName = selectedGrade.value?.name || "";
  const subjectName = selectedSubject.value?.name || "";
  const examName = selectedExam.value?.name || "";
  const blueprintName =
    selectedBlueprint.value?.name || selectedBlueprint.value?.title || "";

  const middle = examName || blueprintName || "Question";

  return [gradeName, middle, subjectName, "Paper"]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
};

const buildAutoInstructions = () => {
  const blueprint = selectedBlueprint.value;

  if (!blueprint?.sections?.length) {
    return `
      <ol>
        <li>All questions are compulsory.</li>
        <li>Read all questions carefully before answering.</li>
        <li>Attempt the questions in the given order.</li>
        <li>Write answers neatly and clearly.</li>
      </ol>
    `;
  }

  const sectionNames = blueprint.sections
    .map((section) => section.section_name)
    .filter(Boolean);

  const uniqueSections = [...new Set(sectionNames)];
  const totalSections = uniqueSections.length;
  const totalQuestions = blueprintTotalQuestions.value;

  const formattedSections = uniqueSections.map((section) =>
    String(section).replace(/section\s*/i, "").trim()
  );

  const sectionLabel =
    formattedSections.length <= 1
      ? formattedSections[0] || ""
      : `${formattedSections.slice(0, -1).join(", ")} and ${formattedSections.at(-1)}`;

  return `
    <ol>
      <li>All questions are compulsory.</li>
      <li>The question paper consists of <strong>${totalQuestions} questions</strong> divided into <strong>${totalSections} section${totalSections > 1 ? "s" : ""}${sectionLabel ? " " + sectionLabel : ""}</strong>.</li>
      <li>Read all questions carefully before answering.</li>
      <li>Attempt the questions in the given order.</li>
      <li>Draw neat diagrams wherever required.</li>
    </ol>
  `;
};

const applyAutoTitle = () => {
  if (autoTitle.value) {
    form.value.title = buildAutoTitle();
  }
};

const applyAutoInstructions = () => {
  if (autoInstructions.value) {
    form.value.instructions = buildAutoInstructions();
  }
};

const applyBlueprintDefaults = () => {
  if (!selectedBlueprint.value) return;

  form.value.duration =
    selectedBlueprint.value.duration_minutes ||
    selectedBlueprint.value.duration ||
    form.value.duration ||
    "60";


  applyAutoInstructions();
};

const fetchGrades = async () => {
  const res = await api.get("/grades");
  grades.value = res.data.data || res.data || [];
};

const fetchSubjects = async () => {
  subjects.value = [];

  if (!form.value.grade_id) return;

  const res = await api.get("/subjects", {
    params: {
      grade_id: form.value.grade_id,
    },
  });

  subjects.value = res.data.data || res.data || [];
};

const fetchExamNames = async () => {
  const res = await api.get("/exam-names");
  examNames.value = (res.data.data || res.data || []).filter((e) => e.is_active);
};

const fetchBlueprints = async () => {
  blueprints.value = [];
  selectedBlueprintDetails.value = null;

  if (!form.value.grade_id || !form.value.subject_id) return;

  blueprintLoading.value = true;

  try {
    const res = await api.get("/paper-blueprints/dropdown", {
      params: {
        grade_id: form.value.grade_id,
        subject_id: form.value.subject_id,
        exam_name_id: form.value.exam_name_id || null,
        is_active: 1,
      },
    });

    blueprints.value = res.data.data || res.data || [];
  } finally {
    blueprintLoading.value = false;
  }
};

const fetchBlueprintDetails = async () => {
  selectedBlueprintDetails.value = null;

  if (!form.value.paper_blueprint_id) return;

  blueprintLoading.value = true;

  try {
    const res = await api.get(`/paper-blueprints/${form.value.paper_blueprint_id}`);
    selectedBlueprintDetails.value = res.data.data || res.data;

    applyBlueprintDefaults();
  } catch (error) {
    ui.showSnackbar("Failed to load blueprint details", "error");
  } finally {
    blueprintLoading.value = false;
  }
};

const onGradeChange = async () => {
  form.value.subject_id = null;
  form.value.exam_name_id = null;
  form.value.paper_blueprint_id = null;
  form.value.title = "";
  form.value.duration = "";
  form.value.instructions = "";
  preview.value = null;
  shortages.value = [];
  blueprints.value = [];
  selectedBlueprintDetails.value = null;

  await fetchSubjects();
};

const onSubjectChange = async () => {
  form.value.paper_blueprint_id = null;
  preview.value = null;
  shortages.value = [];
  selectedBlueprintDetails.value = null;

  applyAutoTitle();
  await fetchBlueprints();
};

const onExamChange = async () => {
  form.value.paper_blueprint_id = null;
  preview.value = null;
  shortages.value = [];
  selectedBlueprintDetails.value = null;

  applyAutoTitle();
  await fetchBlueprints();
};

const onBlueprintChange = async () => {
  preview.value = null;
  shortages.value = [];

  await fetchBlueprintDetails();
};

const previewPaper = async () => {
  if (!form.value.paper_blueprint_id) {
    ui.showSnackbar("Please select a blueprint", "warning");
    return;
  }

  previewLoading.value = true;
  preview.value = null;
  shortages.value = [];

  try {
    const res = await api.post("/paper-generator/preview", {
      paper_blueprint_id: form.value.paper_blueprint_id,
      moderate_mode: moderateDifficultyMode.value,
    });

    preview.value = res.data.data || res.data;
    shortages.value = preview.value?.shortages || [];

    ui.showSnackbar(
      shortages.value.length
        ? "Preview generated with shortages"
        : "Preview generated successfully",
      shortages.value.length ? "warning" : "success"
    );
  } catch (error) {
    shortages.value = error.response?.data?.shortages || [];

    ui.showSnackbar(
      error.response?.data?.message || "Failed to generate preview",
      "error"
    );
  } finally {
    previewLoading.value = false;
  }
};

const generatePaper = async () => {
  if (!form.value.paper_blueprint_id) {
    ui.showSnackbar("Please select a blueprint", "warning");
    return;
  }

  if (!form.value.title) {
    applyAutoTitle();
  }

  if (!form.value.instructions) {
    applyAutoInstructions();
  }

  generating.value = true;

  try {
    const res = await api.post("/paper-generator/generate", {
      paper_blueprint_id: form.value.paper_blueprint_id,
      exam_name_id: form.value.exam_name_id,
      title: form.value.title,
      duration: String(form.value.duration || ""),
      duration_minutes: Number(form.value.duration || 0),
      instructions: form.value.instructions,
      moderate_mode: moderateDifficultyMode.value,
    });

    ui.showSnackbar("Question paper generated successfully", "success");

    preview.value = null;
    shortages.value = [];

    console.log("Generated Paper:", res.data.data || res.data);
  } catch (error) {
    if (error.response?.status === 422) {
      shortages.value = error.response.data.shortages || [];
      preview.value = error.response.data.preview || null;
    }

    ui.showSnackbar(
      error.response?.data?.message || "Failed to generate paper",
      "error"
    );
  } finally {
    generating.value = false;
  }
};

const resetForm = () => {
  form.value = {
    grade_id: null,
    subject_id: null,
    exam_name_id: null,
    paper_blueprint_id: null,
    title: "",
    duration: "",
    instructions: "",
  };

  subjects.value = [];
  blueprints.value = [];
  selectedBlueprintDetails.value = null;
  preview.value = null;
  shortages.value = [];
  moderateDifficultyMode.value = false;
  autoTitle.value = true;
  autoInstructions.value = true;
};

onMounted(async () => {
  loading.value = true;

  try {
    await Promise.all([fetchGrades(), fetchExamNames()]);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">Auto Paper Generator</h1>
        <p class="text-grey">
          Generate a complete question paper from blueprint rules, approved questions,
          auto title, and auto instructions.
        </p>
      </div>

      <div class="d-flex ga-2">
        <v-chip color="primary" variant="tonal" prepend-icon="mdi-file-document-outline">
          {{ questionCount || blueprintTotalQuestions }} Questions
        </v-chip>

        <v-chip color="success" variant="tonal" prepend-icon="mdi-star-outline">
          {{ totalMarks }} Marks
        </v-chip>
      </div>
    </div>

    <v-row>
      <v-col cols="12" lg="8">
        <v-card class="rounded-xl mb-5" elevation="0">
          <v-card-title class="d-flex align-center ga-3">
            <v-avatar color="primary" variant="tonal">
              <v-icon>mdi-tune-variant</v-icon>
            </v-avatar>

            <div>
              <div class="font-weight-bold">Paper Setup</div>
              <div class="text-caption text-grey">
                Select class, subject, exam and blueprint
              </div>
            </div>
          </v-card-title>

          <v-divider />

          <v-card-text>
            <v-row>
              <v-col cols="12" md="3">
                <v-select v-model="form.grade_id" :items="grades" item-title="name" item-value="id" label="Class"
                  variant="outlined" :loading="loading" @update:model-value="onGradeChange" />
              </v-col>

              <v-col cols="12" md="3">
                <v-select v-model="form.subject_id" :items="subjects" item-title="name" item-value="id" label="Subject"
                  variant="outlined" :disabled="!form.grade_id" @update:model-value="onSubjectChange" />
              </v-col>

              <v-col cols="12" md="3">
                <v-select v-model="form.exam_name_id" :items="examNames" item-title="name" item-value="id" label="Exam"
                  variant="outlined" clearable @update:model-value="onExamChange" />
              </v-col>

              <v-col cols="12" md="3">
                <v-select v-model="form.paper_blueprint_id" :items="blueprints" :item-title="blueprintTitle"
                  item-value="id" label="Blueprint" variant="outlined" :loading="blueprintLoading"
                  :disabled="!form.grade_id || !form.subject_id || !blueprints.length"
                  @update:model-value="onBlueprintChange" />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <v-card class="rounded-xl mb-5" elevation="0">
          <v-card-title class="d-flex align-center justify-space-between">
            <div class="d-flex align-center ga-3">
              <v-avatar color="info" variant="tonal">
                <v-icon>mdi-text-box-edit-outline</v-icon>
              </v-avatar>

              <div>
                <div class="font-weight-bold">Paper Details</div>
                <div class="text-caption text-grey">
                  Auto title and auto instructions are generated from the selected blueprint
                </div>
              </div>
            </div>

            <div class="d-flex ga-2">
              <v-switch v-model="autoTitle" label="Auto Title" color="primary" hide-details inset
                @update:model-value="applyAutoTitle" />

              <v-switch v-model="autoInstructions" label="Auto Instructions" color="primary" hide-details inset
                @update:model-value="applyAutoInstructions" />
            </div>
          </v-card-title>

          <v-divider />

          <v-card-text>
            <v-row>
              <v-col cols="12" md="8">
                <v-text-field v-model="form.title" label="Question Paper Name" variant="outlined"
                  prepend-inner-icon="mdi-format-title" :readonly="autoTitle"
                  hint="Example: Grade 7 Periodic Assessment 1 Computer Science Paper" persistent-hint />
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field v-model="form.duration" label="Duration in Minutes" variant="outlined" type="number"
                  prepend-inner-icon="mdi-clock-outline" />
              </v-col>

              <v-col cols="12">
                <AppEditor v-model="form.instructions" label="General Instructions" :readonly="autoInstructions" />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <v-alert v-if="hasShortages" type="warning" variant="tonal" class="mb-5 rounded-xl">
          <div class="font-weight-bold mb-2">Question Shortage Found</div>

          <div v-for="(item, index) in shortages" :key="index" class="mb-1 text-body-2">
            <strong>{{ item.question_type }}</strong>
            |
            Difficulty: {{ item.difficulty || "-" }}
            |
            Bloom: {{ item.bloom_level || "-" }}
            |
            Required: {{ item.required }}
            |
            Available: {{ item.available }}
            |
            Missing: {{ item.missing }}
          </div>
        </v-alert>

        <v-card v-if="preview" class="rounded-xl" elevation="0">
          <v-card-title class="d-flex justify-space-between align-center">
            <div>
              <div class="text-h6 font-weight-bold">Generated Paper Preview</div>
              <div class="text-caption text-grey">
                {{ questionCount }} questions | {{ totalMarks }} marks
              </div>
            </div>

            <v-btn color="primary" prepend-icon="mdi-check" :loading="generating" :disabled="hasShortages"
              @click="generatePaper">
              Generate Final Paper
            </v-btn>
          </v-card-title>

          <v-divider />

          <v-card-text>
            <div v-for="section in preview.sections" :key="section.section_name" class="mb-6">
              <div class="d-flex align-center ga-2 mb-2">
                <v-chip color="primary" variant="flat">
                  {{ section.section_name }}
                </v-chip>

                <span v-if="section.instructions" class="text-grey">
                  {{ section.instructions }}
                </span>
              </div>

              <div v-for="item in section.items"
                :key="`${section.section_name}-${item.question_type}-${item.difficulty}-${item.bloom_level}`"
                class="mb-4">
                <div class="d-flex flex-wrap align-center ga-2 mb-2">
                  <v-chip size="small" color="secondary" variant="tonal">
                    {{ item.question_type_name || item.question_type }}
                  </v-chip>

                  <v-chip size="small" color="success" variant="tonal">
                    {{ item.questions?.length || 0 }} Questions
                  </v-chip>

                  <v-chip size="small" color="info" variant="tonal">
                    {{ item.marks_per_question }} Marks Each
                  </v-chip>

                  <v-chip v-if="item.difficulty" size="small" color="warning" variant="tonal">
                    {{ item.difficulty }}
                  </v-chip>

                  <v-chip v-if="item.bloom_level" size="small" color="purple" variant="tonal">
                    {{ item.bloom_level }}
                  </v-chip>
                </div>

                <v-list class="rounded-xl border">
                  <v-list-item v-for="(question, qIndex) in item.questions" :key="question.id"
                    class="paper-question-item">
                    <template #prepend>
                      <v-avatar size="28" color="primary" variant="tonal">
                        {{ qIndex + 1 }}
                      </v-avatar>
                    </template>

                    <v-list-item-title>
                      <MathContent :html="question.question" />
                    </v-list-item-title>

                    <v-list-item-subtitle>
                      Difficulty: {{ question.difficulty || "-" }}
                      |
                      Bloom: {{ question.bloom_level || "-" }}
                      |
                      Lesson: {{ question.lesson?.name || "-" }}
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="4">
        <v-card class="rounded-xl sticky-side" elevation="0">
          <v-card-title class="d-flex align-center ga-3">
            <v-avatar color="success" variant="tonal">
              <v-icon>mdi-auto-fix</v-icon>
            </v-avatar>

            <div>
              <div class="font-weight-bold">Generate</div>
              <div class="text-caption text-grey">
                Preview first, then generate final paper
              </div>
            </div>
          </v-card-title>

          <v-divider />

          <v-card-text>
            <v-alert type="info" variant="tonal" class="mb-4 rounded-xl">
              Moderate Mode ignores difficulty restrictions and selects from all
              available approved questions of the required question type.
            </v-alert>

            <v-switch v-model="moderateDifficultyMode" color="primary" inset label="Moderate Mode" />

            <v-divider class="my-4" />

            <div class="summary-row">
              <span>Class</span>
              <strong>{{ selectedGrade?.name || "-" }}</strong>
            </div>

            <div class="summary-row">
              <span>Subject</span>
              <strong>{{ selectedSubject?.name || "-" }}</strong>
            </div>

            <div class="summary-row">
              <span>Exam</span>
              <strong>{{ selectedExam?.name || "-" }}</strong>
            </div>

            <div class="summary-row">
              <span>Blueprint</span>
              <strong>{{ selectedBlueprint ? blueprintTitle(selectedBlueprint) : "-" }}</strong>
            </div>

            <div class="summary-row">
              <span>Total Questions</span>
              <strong>{{ questionCount || blueprintTotalQuestions }}</strong>
            </div>

            <div class="summary-row">
              <span>Total Marks</span>
              <strong>{{ totalMarks }}</strong>
            </div>

            <v-divider class="my-4" />

            <v-btn block color="info" size="large" prepend-icon="mdi-eye" :loading="previewLoading"
              :disabled="!form.paper_blueprint_id" @click="previewPaper">
              Preview Paper
            </v-btn>

            <v-btn block color="primary" size="large" class="mt-3" prepend-icon="mdi-auto-fix" :loading="generating"
              :disabled="!form.paper_blueprint_id || hasShortages" @click="generatePaper">
              Generate Final Paper
            </v-btn>

            <v-btn block variant="tonal" color="grey" class="mt-3" prepend-icon="mdi-refresh" @click="resetForm">
              Reset
            </v-btn>
          </v-card-text>
        </v-card>

        <v-card v-if="selectedBlueprint" class="rounded-xl mt-5" elevation="0">
          <v-card-title class="font-weight-bold">
            Blueprint Summary
          </v-card-title>

          <v-divider />

          <v-card-text>
            <PaperBlueprintPreview :blueprint="selectedBlueprint" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
.sticky-side {
  position: sticky;
  top: 90px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 0;
  border-bottom: 1px dashed rgba(var(--v-border-color), 0.25);
}

.summary-row span {
  color: rgba(var(--v-theme-on-surface), 0.65);
}

.paper-question-item {
  border-bottom: 1px solid rgba(var(--v-border-color), 0.15);
}

.paper-question-item:last-child {
  border-bottom: none;
}

.border {
  border: 1px solid rgba(var(--v-border-color), 0.15);
}
</style>