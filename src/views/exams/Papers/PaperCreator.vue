<script setup>
import { useTheme } from "vuetify";
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUIStore } from "../../../stores/snackBar";
import { useUiLoaderStore } from "../../../stores/uiLoader";
import { useLoadingStore } from "../../../stores/loading";
import api from "../../../plugins/api";
import PaperSections from "../components/PaperSections.vue";
import QuestionPreviewDrawer from "../components/QuestionPreviewDrawer.vue";
import LivePaperPreview from "../components/LivePaperPreview.vue";
import AppEditor from "../../exams/components/AppEditor.vue";
import BlueprintSelectorCard from "../../../components/paper/BlueprintSelectorCard.vue";
import PageSkeleton from "../../../components/common/PageSkeleton.vue";
import draggable from "vuedraggable";

const loading = useLoadingStore();
const pageReady = ref(false);

const ui = useUIStore();
const theme = useTheme();
const loader = useUiLoaderStore();

const questions = ref([]);

const assignedSubjects = ref([]);
const examNames = ref([]);

const route = useRoute();
const router = useRouter();

const isEditMode = computed(() => !!route.params.id);

const previewDrawer = ref(false);
const previewQuestion = ref(null);
const previewMode = ref("paper");
const moderateDifficultyMode = ref(false);

const openPreview = (question) => {
  previewQuestion.value = {
    ...question,

    grade: question.grade || paper.value.grade || selectedGrade.value || null,

    subject:
      question.subject || paper.value.subject || selectedSubject.value || null,

    lesson:
      question.lesson ||
      lessons.value.find((l) => Number(l.id) === Number(question.lesson_id)) ||
      null,
  };

  previewDrawer.value = true;
};

const fetchExamNames = async () => {
  const res = await api.get("/exam-names");
  examNames.value = (res.data.data || res.data || []).filter((e) => e.is_active);
};

//BluePrint Section Starts

const blueprints = ref([]);
const selectedBlueprint = ref(null);
const blueprintErrors = ref([]);

const fetchBlueprints = async () => {
  if (!filters.value.grade_id || !filters.value.subject_id) return;

  const res = await api.get("/paper-blueprints", {
    params: {
      grade_id: filters.value.grade_id,
      subject_id: filters.value.subject_id,
      is_active: 1,
    },
  });

  blueprints.value = res.data.data || res.data;
};

const applyBlueprintStructure = () => {
  if (!selectedBlueprint.value?.sections?.length) return;

  paper.value.sections = selectedBlueprint.value.sections.map((section) => ({
    id: null,
    name: section.section_name,
    instructions: section.instructions || "",
    questions: [],
  }));
};

const onBlueprintChange = async (blueprintId, overwriteSections = true) => {
  selectedBlueprint.value = null;
  blueprintErrors.value = [];

  if (!blueprintId) return;

  const res = await api.get(`/paper-blueprints/${blueprintId}`);
  selectedBlueprint.value = res.data.data || res.data;

  if (overwriteSections) {
    applyBlueprintStructure();
  }
};


const normalizeQuestion = (question = {}) => {
  const type = getQuestionTypeValue(question)

  return {
    ...question,
    type,
    question_type: type,
    difficulty: question.difficulty || question.difficulty_level,
    difficulty_level: question.difficulty || question.difficulty_level,
    bloom_level: question.bloom_level || question.bloom,
  }
}

const normalizeValue = (value) => String(value || "").trim().toLowerCase();

const questionMatchesBlueprintItem = (question, item, options = {}) => {
  const q = normalizeQuestion(question);
  const ignoreDifficulty = options.ignoreDifficulty ?? moderateDifficultyMode.value;

  if (normalizeValue(item.question_type) !== normalizeValue(q.type)) {
    return false;
  }

  if (!ignoreDifficulty && item.difficulty) {
    return normalizeValue(item.difficulty) === normalizeValue(q.difficulty);
  }

  return true;
};

const getBlueprintSectionForPaperSection = (section) => {
  if (!selectedBlueprint.value?.sections?.length) return null;

  return selectedBlueprint.value.sections.find(
    (bpSection) => bpSection.section_name === section.name,
  );
};

const validateBlueprintStructure = () => {
  blueprintErrors.value = [];

  if (!selectedBlueprint.value) return true;

  selectedBlueprint.value.sections.forEach((bpSection) => {
    const paperSection = paper.value.sections.find(
      (s) => s.name === bpSection.section_name,
    );

    if (!paperSection) {
      blueprintErrors.value.push(`${bpSection.section_name} is missing.`);
      return;
    }

    const items = bpSection.items || [];

    items.forEach((item) => {
      const matchingQuestions = paperSection.questions.filter((q) =>
        questionMatchesBlueprintItem(q, item)
      );

      if (hasBloomRules(item)) {
        item.bloom_levels.forEach((rule) => {
          const actual = getCurrentBloomCount(paperSection, item, rule);
          const required = Number(rule.calculated_count || 0);

          if (actual !== required) {
            blueprintErrors.value.push(
              `${bpSection.section_name} ${item.question_type} ${rule.bloom_level}: required ${required}, current ${actual}`
            );
          }
        });
      }

      // DEBUG START
      console.log(
        "Section:",
        bpSection.section_name,
        "Type:",
        item.question_type,
        paperSection.questions.map((q) => ({
          id: q.id,
          type: q.type,
          question_type: q.question_type,
          difficulty: q.difficulty,
          difficulty_level: q.difficulty_level,
        }))
      );
      // DEBUG END

      if (matchingQuestions.length !== Number(item.question_count)) {
        blueprintErrors.value.push(
          `${bpSection.section_name} needs ${item.question_count} ${item.question_type} questions. Current: ${matchingQuestions.length}`,
        );
      }

      matchingQuestions.forEach((q) => {
        q.type = q.type || q.question_type;
        q.difficulty = q.difficulty || q.difficulty_level;
        q.bloom_level = q.bloom_level || q.bloom;
        q.marks = safeNumber(item.marks_per_question, 0);
      });
    });
  });

  if (
    safeNumber(totalMarks.value) !==
    safeNumber(selectedBlueprint.value.total_marks)
  ) {
    blueprintErrors.value.push(
      `Total marks must be ${selectedBlueprint.value.total_marks}. Current: ${totalMarks.value}`,
    );
  }

  return blueprintErrors.value.length === 0;
};



//BluePrint Section Ends

// add Total Question

const selectedQuestions = computed(() => {
  const allQuestions = [];

  paper.value.sections.forEach((section) => {
    section.questions.forEach((question) => {
      allQuestions.push(question);
    });
  });

  /*  REMOVE DUPLICATES */

  return allQuestions.filter(
    (question, index, self) =>
      index === self.findIndex((q) => q.id === question.id),
  );
});

const addToSection = (sectionIndex, question) => {
  const exists = paper.value.sections[sectionIndex].questions.find(
    (q) => q.id === question.id,
  );

  if (exists) {
    ui.showSnackbar("Question already exists in section", "warning");

    return;
  }

  paper.value.sections[sectionIndex].questions.push(question);

  ui.showSnackbar("Question added to section");
};

const filters = ref({
  grade_id: null,
  subject_id: null,
  lesson_id: null,
  type: null,
  difficulty: null,
  search: "",
});

const clearFilters = () => {
  filters.value = {
    grade_id: null,
    subject_id: null,
    lesson_id: null,
    type: null,
    difficulty: null,
    search: "",
  };

  subjects.value = [];
  lessons.value = [];
  questions.value = [];

  fetchQuestions();

  ui.showSnackbar("Filters cleared");
};

const replaceQuestion = async ({ sectionIndex, questionIndex, question }) => {
  const section = paper.value.sections[sectionIndex];

  if (!section) {
    ui.showSnackbar("Section not found", "error");
    return;
  }

  const usedIds = paper.value.sections.flatMap((section) =>
    section.questions.map((q) => Number(q.id))
  );

  const normalizedQuestion = normalizeQuestion(question);

  try {
    const params = {
      for_paper: 1,
      grade_id: filters.value.grade_id || paper.value.grade_id,
      subject_id: filters.value.subject_id || paper.value.subject_id,
      lesson_id: question.lesson_id,
      type: normalizedQuestion.type,
      status: "approved",
    };

    // Important: apply difficulty only when Moderate Mode is OFF
    if (!moderateDifficultyMode.value && normalizedQuestion.difficulty) {
      params.difficulty = normalizedQuestion.difficulty;
    }

    const res = await api.get("/questions", { params });

    const available = (res.data.data || res.data)
      .map((q) => normalizeQuestion(q))
      .filter((q) => {
        if (Number(q.id) === Number(question.id)) return false;
        if (usedIds.includes(Number(q.id))) return false;

        return canQuestionFitInSection(section, q, question.id);
      });

    if (!available.length) {
      ui.showSnackbar("No alternate question found", "warning");
      return;
    }

    const replacement = {
      ...available[Math.floor(Math.random() * available.length)],
      marks: question.marks,
      paper_marks: question.paper_marks || question.marks,
    };

    section.questions.splice(questionIndex, 1, replacement);

    recalculateSectionMarks(section);
    refreshBlueprintStatus();
    validateBlueprintStructure();

    ui.showSnackbar("Question replaced successfully", "success");
  } catch (err) {
    console.error(err);
    ui.showSnackbar("Failed to replace question", "error");
  }
};

/*  PAPER FORM */

const saving = ref(false);

const paper = ref({
  title: "",
  exam_name_id: null,
  exam_type: "",
  duration: 60,
  instructions: "",
  grade_id: null,
  subject_id: null,
  paper_blueprint_id: null,
  sections: [{ name: "Section A", questions: [] }],
});

/* DROPDOWNS */

const grades = ref([]);
const subjects = ref([]);
const lessons = ref([]);

const selectedSection = ref(0);

const fetchQuestionTypes = async () => {
  if (!filters.value.grade_id || !filters.value.subject_id) {
    questionTypes.value = [];
    filters.value.type = null;
    return;
  }

  try {
    const res = await api.get("/question-types", {
      params: {
        grade_id: filters.value.grade_id,
        stream_id: filters.value.stream_id || null,
        subject_id: filters.value.subject_id,
        active_only: 1,
      },
    });

    const rows = res.data.data || res.data || [];

    questionTypes.value = rows
      .filter((row) => row.is_active)
      .map((row) => ({
        title: row.name,
        value: row.slug,
      }))
      .filter((row) => row.title && row.value);
  } catch (error) {
    console.error(error);
    questionTypes.value = [];
    ui.showSnackbar("Failed to load question types", "error");
  }
};

/* FETCH QUESTIONS */
const fetchQuestions = async () => {
  loading.value = true;

  try {
    const res = await api.get("/questions", {
      params: {
        grade_id: filters.value.grade_id,
        subject_id: filters.value.subject_id,
        lesson_id: filters.value.lesson_id,
        type: filters.value.type,
        difficulty: filters.value.difficulty,
        search: filters.value.search,
        for_paper: 1,
      },
    });

    questions.value = res.data.data || res.data;
  } catch (err) {
    ui.showSnackbar("Failed to load questions", "error");
  } finally {
    loading.value = false;
  }
};

/* FETCH grades */
const fetchGrades = async () => {
  const res = await api.get("/my-assignments");

  if (res.data.is_admin) {
    const gradeRes = await api.get("/grades");
    grades.value = gradeRes.data.data || gradeRes.data;
    return;
  }

  grades.value = res.data.grades || [];
  assignedSubjects.value = res.data.subjects || [];
};

/*  FETCH SUBJECTS */
const fetchSubjects = async () => {
  if (!filters.value.grade_id) {
    subjects.value = [];
    filters.value.subject_id = null;
    filters.value.lesson_id = null;
    lessons.value = [];
    questions.value = [];
    return;
  }

  filters.value.subject_id = null;
  filters.value.lesson_id = null;
  lessons.value = [];

  if (assignedSubjects.value.length) {
    subjects.value = assignedSubjects.value.filter(
      (s) => Number(s.grade_id) === Number(filters.value.grade_id),
    );
    fetchQuestions();
    return;
  }

  const res = await api.get("/subjects", {
    params: {
      grade_id: filters.value.grade_id,
    },
  });

  subjects.value = res.data.data || res.data;
  questionTypes.value = [];
  filters.value.type = null;
  fetchQuestions();
};

/* FETCH LESSONS */
const fetchLessons = async () => {
  if (!filters.value.subject_id) {
    lessons.value = [];
    filters.value.lesson_id = null;
    questions.value = [];
    return;
  }

  const res = await api.get("/lessons", {
    params: {
      subject_id: filters.value.subject_id,
    },
  });

  lessons.value = res.data.data || res.data;
  await fetchQuestionTypes();
  fetchQuestions();
};

const onSubjectChange = async () => {
  filters.value.lesson_id = null;
  filters.value.type = null;
  await fetchLessons();
  await fetchQuestionTypes();
  await fetchQuestions();
};

const canQuestionFitInSection = (section, question, ignoreQuestionId = null) => {
  if (!selectedBlueprint.value?.sections?.length) return true;

  const blueprintSection = getBlueprintSectionForPaperSection(section);
  if (!blueprintSection) return false;

  const blueprintItem = (blueprintSection.items || []).find((item) =>
    questionMatchesBlueprintItem(question, item, {
      ignoreDifficulty: moderateDifficultyMode.value,
    })
  );

  if (!blueprintItem) return false;

  const currentCount = section.questions.filter((existing) => {
    if (
      ignoreQuestionId !== null &&
      Number(existing.id) === Number(ignoreQuestionId)
    ) {
      return false;
    }

    return questionMatchesBlueprintItem(existing, blueprintItem, {
      ignoreDifficulty: moderateDifficultyMode.value,
    });
  }).length;

  if (currentCount >= Number(blueprintItem.question_count || 0)) {
    return false;
  }

  return canQuestionFitBloomRule(section, blueprintItem, normalizeQuestion(question), ignoreQuestionId);
};

const canAcceptQuestionForSection = (section, question) => {
  if (!section || !question || !question.id) return false

  const q = normalizeQuestion(question)

  const alreadyAddedElsewhere = paper.value.sections.some((paperSection) => {
    if (paperSection.name === section.name) return false

    return paperSection.questions.some(
      (existing) => Number(existing.id) === Number(q.id)
    )
  })

  if (alreadyAddedElsewhere) return false

  return canQuestionFitInSection(section, q)
};

const findTargetSectionForQuestion = (question) => {
  if (!selectedBlueprint.value?.sections?.length) {
    return paper.value.sections[0] || null;
  }

  return (
    paper.value.sections.find((section) =>
      canQuestionFitInSection(section, question),
    ) || null
  );
};

/* ADD QUESTION *//* ADD QUESTION */
const addQuestion = (question) => {
  if (isQuestionAdded(question.id)) {
    ui.showSnackbar("Question already added", "warning");
    return;
  }

  const targetSection = findTargetSectionForQuestion(question);

  if (!targetSection) {
    ui.showSnackbar(
      "No blueprint slot available for this question type in any section",
      "error",
    );
    return;
  }

  const normalizedQuestion = normalizeQuestion(question);

  targetSection.questions.push({
    ...normalizedQuestion,
    marks: getQuestionMarks(targetSection, normalizedQuestion),
  });

  refreshBlueprintStatus();

  ui.showSnackbar(`Question added to ${targetSection.name}`);
};

/* REMOVE QUESTION *//* REMOVE QUESTION */
const removeQuestion = (id) => {
  paper.value.sections.forEach((section) => {
    section.questions = section.questions.filter(
      (q) => Number(q.id) !== Number(id),
    );
  });

  refreshBlueprintStatus();
};

/* AUTO GENERATE *//* AUTO GENERATE */
const autoGenerate = async () => {
  if (!paper.value.paper_blueprint_id) {
    ui.showSnackbar("Please select a paper blueprint first", "warning");
    return;
  }

  try {
    const res = await api.post("/papers/generate-from-blueprint", {
      paper_blueprint_id: paper.value.paper_blueprint_id,
      moderate_mode: moderateDifficultyMode.value,
    });

    const generatedQuestions = res.data.data || [];

    if (!Array.isArray(generatedQuestions) || !generatedQuestions.length) {
      ui.showSnackbar("No questions generated from the selected blueprint", "warning");
      return;
    }

    paper.value.sections = generatedQuestions.reduce((sections, question) => {
      const sectionName = question.section || question.paper_section || "Section A";
      let section = sections.find((item) => item.name === sectionName);

      if (!section) {
        section = {
          id: null,
          name: sectionName,
          instructions: "",
          questions: [],
        };
        sections.push(section);
      }

      section.questions.push(normalizeQuestion(question));
      return sections;
    }, []);

    refreshBlueprintStatus();
    ui.showSnackbar("Paper generated successfully");
  } catch (err) {
    ui.showSnackbar(err.response?.data?.message || "Auto generation failed", "error");
  }
};

// Fetch Paper to Edit
const getQuestionTypeValue = (question = {}) => {
  if (typeof question.type === "object") {
    return question.type?.slug || "";
  }

  if (typeof question.question_type === "object") {
    return question.question_type?.slug || "";
  }

  return question.type || question.question_type || "";
};

const fetchPaperForEdit = async () => {
  loading.value = true;

  try {
    const res = await api.get(`/question-papers/${route.params.id}`);

    const data = res.data.data || res.data;
    filters.value.grade_id = data.grade_id;
    filters.value.subject_id = data.subject_id;
    filters.value.lesson_id = null;

    paper.value = {
      id: data.id,
      title: data.title || "",
      exam_name_id: data.exam_name_id || null,
      exam_type: data.examName?.name || data.exam_name?.name || data.exam_type || "",
      duration: data.duration || data.duration_minutes || 60,
      instructions: data.instructions || "",
      grade_id: data.grade_id,
      subject_id: data.subject_id,
      paper_blueprint_id: data.paper_blueprint_id,
      moderate_mode: !!data.moderate_mode,
      sections: [],
    };

    paper.value.grade = data.grade;
    paper.value.subject = data.subject;

    await loadSubjectsForEdit(data.grade_id);
    await loadLessonsForEdit(data.subject_id);
    await fetchBlueprints();

    if (data.paper_blueprint_id) {
      await onBlueprintChange(data.paper_blueprint_id, false);

      if (
        selectedBlueprint.value &&
        !blueprints.value.some((bp) => Number(bp.id) === Number(selectedBlueprint.value.id))
      ) {
        blueprints.value.unshift(selectedBlueprint.value);
      }
    }

    await fetchQuestions();

    const grouped = {};

    (data.questions || []).forEach((item) => {
      const sectionName = item.section || item.section_name || "Section A";
      const q = item.question || {};

      if (!grouped[sectionName]) {
        grouped[sectionName] = {
          name: sectionName,
          instructions: item.instructions || "",
          questions: [],
        };
      }

      grouped[sectionName].questions.push({
        ...q,
        type: getQuestionTypeValue(q),
        question_type: getQuestionTypeValue(q),
        question_type_name: q.type?.name || "",
        marks: Number(item.marks || q.marks || 0),
        paper_item_id: item.id,
        paper_marks: Number(item.marks || 0),
        section: sectionName,
        instructions: item.instructions || "",
        sort_order: item.sort_order || 0,
      });
    });

    paper.value.sections = Object.values(grouped);

    if (!paper.value.sections.length) {
      paper.value.sections = [
        {
          name: "Section A",
          instructions: "",
          questions: [],
        },
      ];
    }
  } catch (error) {
    console.error("Edit paper load error:", error);
    ui.showSnackbar("Failed to load paper for edit", "error");
  } finally {
    loading.value = false;
  }
};

const loadSubjectsForEdit = async (gradeId) => {
  const res = await api.get("/subjects", {
    params: { grade_id: gradeId },
  });

  subjects.value = res.data.data || res.data;
};

const loadLessonsForEdit = async (subjectId) => {
  const res = await api.get("/lessons", {
    params: { subject_id: subjectId },
  });

  lessons.value = res.data.data || res.data;
};

/* SAVE PAPER */
const errors = ref({});

const savePaper = async () => {
  saving.value = true;
  if (!validateBlueprintStructure()) {
    ui.showSnackbar("Paper does not match blueprint structure", "error");
    saving.value = false;
    return;
  }

  const payload = {
    title: paper.value.title,
    exam_type: paper.value.exam_type,
    duration: paper.value.duration,
    instructions: paper.value.instructions,
    exam_name_id: paper.value.exam_name_id,
    exam_type:
      examNames.value.find((e) => Number(e.id) === Number(paper.value.exam_name_id))?.name ||
      paper.value.exam_type ||
      "",
    total_marks: totalMarks.value,
    paper_blueprint_id: paper.value.paper_blueprint_id,

    grade_id: paper.value.grade_id || filters.value.grade_id,
    subject_id: paper.value.subject_id || filters.value.subject_id,
    moderate_mode: moderateDifficultyMode.value,

    questions: paper.value.sections.flatMap((section) =>
      section.questions.map((q, index) => ({
        question_id: q.id,
        marks: getQuestionMarks(section, q),
        section: section.name,
        instructions: section.instructions,
        sort_order: index + 1,
      })),
    ),
  };

  console.log("Paper Payload", payload);

  if (isEditMode.value) {
    await api.put(`/question-papers/${route.params.id}`, payload);
    ui.showSnackbar("Paper updated successfully");
    saving.value = false;
    router.push(`/papers/${route.params.id}`);
  } else {
    await api.post("/question-papers", payload);
    saving.value = false;
    ui.showSnackbar("Paper saved successfully");
  }
};

const recalculateSectionMarks = (section) => {
  section.questions = section.questions.map((question) => ({
    ...question,
    marks: getQuestionMarks(section, question),
  }));

};

const recalculateAllMarks = () => {
  paper.value.sections.forEach((section) => {
    recalculateSectionMarks(section);
  });
};

const questionTypes = ref([]);

const totalQuestions = computed(() => {
  let total = 0;

  paper.value.sections.forEach((section) => {
    total += section.questions.length;
  });

  return total;
});

const safeNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const hasBloomRules = (item) => {
  return Array.isArray(item?.bloom_levels) && item.bloom_levels.length > 0;
};

const getBloomRuleForQuestion = (item, question) => {
  if (!hasBloomRules(item)) return null;

  const qBloom = normalizeValue(question.bloom_level || question.bloom);

  return item.bloom_levels.find(
    (rule) => normalizeValue(rule.bloom_level) === qBloom
  );
};

const getCurrentBloomCount = (section, item, rule, ignoreQuestionId = null) => {
  return section.questions.filter((question) => {
    if (
      ignoreQuestionId !== null &&
      Number(question.id) === Number(ignoreQuestionId)
    ) {
      return false;
    }

    return (
      questionMatchesBlueprintItem(question, item, {
        ignoreDifficulty: moderateDifficultyMode.value,
      }) &&
      normalizeValue(question.bloom_level || question.bloom) ===
      normalizeValue(rule.bloom_level)
    );
  }).length;
};

const canQuestionFitBloomRule = (section, item, question, ignoreQuestionId = null) => {
  if (!hasBloomRules(item)) return true;

  const rule = getBloomRuleForQuestion(item, question);

  if (!rule) return false;

  const currentCount = getCurrentBloomCount(section, item, rule, ignoreQuestionId);

  return currentCount < Number(rule.calculated_count || 0);
};

const getMatchingBlueprintItem = (section, question) => {
  const blueprintSection = getBlueprintSectionForPaperSection(section);

  if (!blueprintSection?.items?.length) return null;

  const q = normalizeQuestion(question);

  return blueprintSection.items.find((item) => {
    const typeMatch =
      normalizeValue(item.question_type) === normalizeValue(q.type);

    const difficultyMatch =
      moderateDifficultyMode.value ||
      !item.difficulty ||
      normalizeValue(item.difficulty) === normalizeValue(q.difficulty);

    return typeMatch && difficultyMatch;
  }) || null;
};

const handleAddQuestionClick = (question) => {
  addQuestion(question);
};

const getQuestionMarks = (section, question) => {
  const blueprintItem = getMatchingBlueprintItem(section, question);

  return safeNumber(
    blueprintItem?.marks_per_question ??
    question.marks ??
    section.marks_per_question ??
    0,
  );
};

const totalMarks = computed(() => {
  return paper.value.sections.reduce((total, section) => {
    return (
      total +
      section.questions.reduce((sum, question) => {
        return sum + getQuestionMarks(section, question);
      }, 0)
    );
  }, 0);
});

// Print Function
const printPaper = () => {
  const content = document.querySelector(".a4-preview")?.innerHTML || "";

  const win = window.open("", "", "width=1200,height=900");

  win.document.write(`
    <!DOCTYPE html>

    <html>

      <head>

        <title>Print Paper</title>

        <link rel="stylesheet" href="/print.css">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
        <style>
  body {
    background: white !important;

    margin: 0;

    padding: 0;
  }


.preview-container {
  height: calc(100vh - 120px);
  position: sticky;
  top: 80px;
}

.preview-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}

.a4-preview {
  background: #fff;
  color: #000;
  height: 100%;
  overflow-y: auto;
  padding: 28px;
  border-radius: 12px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
  font-family: "Times New Roman", serif;
  font-size: 14px;
  line-height: 1.45;
}

.paper-header {
  text-align: center;
  margin-bottom: 12px;
}

.paper-header h2 {
  margin: 0 0 8px;
  font-size: 22px;
  font-weight: bold;
}

.paper-meta {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  margin-top: 6px;
}

.general-instructions {
  margin: 14px 0;
  font-size: 14px;
}

.section-heading {
  margin-top: 22px;
  margin-bottom: 6px;
  padding: 6px 10px;
  text-align: center;
  font-weight: bold;
  border: 1px solid #000;
  background: #f5f5f5;
}

.section-instructions {
  font-style: italic;
  margin-bottom: 12px;
}

.preview-question {
  margin-bottom: 16px;
  page-break-inside: avoid;
}

.question-row {
  display: table;
  width: 100%;
  table-layout: fixed;
  margin-bottom: 10px;
}

.question-number,
.question-body,
.marks-box {
  display: table-cell;
  vertical-align: top;
}

.question-number {
  width: 42px;
  font-weight: bold;
  padding-top: 1px;
  white-space: nowrap;
}

.question-body {
  padding-right: 10px;
  line-height: 1.5;
}

.question-body p {
  margin: 0;
}

.general-instructions {
  margin: 8px 0 12px;
  font-size: 13px;
  line-height: 1.2;
}

.general-instructions ol,
.general-instructions ul {
  margin: 4px 0 0 16px;
  padding-left: 12px;
}

.general-instructions li {
  margin-bottom: 2px;
  padding-left: 1px;
}

.general-instructions p {
  margin: 0;
}

.marks-box {
  width: 75px;
  text-align: right;
  font-size: 12px;
  font-weight: bold;
  white-space: nowrap;
  padding-top: 1px;
}

.question-html :deep(p) {
  margin: 0 0 6px;
}

.question-image {
  margin: 8px 0;
  border: 1px solid #ddd;
}

.marks-box {
  text-align: right;
  font-size: 13px;
  font-weight: bold;
  white-space: nowrap;
}

.match-column {
  margin-top: 10px;
}

.match-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 36px;
}

.match-row {
  margin-top: 5px;
}

/* MCQ FORMAT */
.mcq-options {
  margin-top: 10px;
  padding-left: 4px;
  display: grid;
  gap: 10px;
}

.four-column {
  grid-template-columns: repeat(4, 1fr);
}

.two-column {
  grid-template-columns: repeat(2, 1fr);
}

.one-column {
  grid-template-columns: 1fr;
}

.mcq-option {
  display: grid;
  grid-template-columns: 26px 1fr;
  gap: 6px;
  align-items: start;
  break-inside: avoid;
}

.option-label {
  font-weight: bold;
}

.option-text :deep(p) {
  margin: 0;
  display: inline;
}

.option-image {
  margin-top: 4px;
  border: 1px solid #ddd;
}

/* KaTeX */
.question-html :deep(.katex-display),
.option-text :deep(.katex-display) {
  overflow-x: auto;
  margin: 6px 0;
}

.question-html :deep(.katex),
.option-text :deep(.katex) {
  font-size: 1.05em;
}


</style>


      </head>

      <body>

        ${content}

      </body>

    </html>
  `);

  win.document.close();

  win.onload = () => {
    setTimeout(() => {
      win.focus();
      win.print();
    }, 500);
  };
};

const cloneQuestion = (question) => {
  if (isQuestionAdded(question.id)) {
    ui.showSnackbar("Question already added", "warning");
    return null;
  }

  return {
    ...question,
    type: question.type || question.question_type,
    difficulty: question.difficulty || question.difficulty_level,
    bloom_level: question.bloom_level || question.bloom,
    marks: Number(question.marks || 1),
  };
};

const addedQuestionIds = computed(() => {
  const ids = [];

  paper.value.sections.forEach((section) => {
    section.questions.forEach((q) => {
      ids.push(Number(q.id));
    });
  });

  return ids;
});

const isQuestionAdded = (questionId) => {
  return addedQuestionIds.value.includes(Number(questionId));
};

const isBlueprintCompatible = (question) => {
  if (isQuestionAdded(question.id)) return false;

  return paper.value.sections.some((section) =>
    canQuestionFitInSection(section, question)
  );
};

const checkMove = (evt) => {
  return !isQuestionAdded(evt.draggedContext.element.id);
};

const selectedGrade = computed(() => {
  return grades.value.find(
    (g) => Number(g.id) === Number(filters.value.grade_id),
  );
});

const selectedSubject = computed(() => {
  return subjects.value.find(
    (s) => Number(s.id) === Number(filters.value.subject_id),
  );
});

const blueprintCurrentSections = computed(() => {
  return paper.value.sections.map((section) => {
    const blueprintSection = getBlueprintSectionForPaperSection(section);

    return {
      ...section,
      questions: section.questions.map((question) => {
        const q = normalizeQuestion(question);

        const matchedItem = (blueprintSection?.items || []).find((item) => {
          return (
            item.question_type === q.type &&
            (
              moderateDifficultyMode.value ||
              !item.difficulty ||
              item.difficulty === q.difficulty
            ) &&
            (!item.bloom_level || item.bloom_level === q.bloom_level)
          );
        });

        return {
          ...q,

          // Important for BlueprintSelectorCard counter
          difficulty:
            moderateDifficultyMode.value && matchedItem?.difficulty
              ? matchedItem.difficulty
              : q.difficulty,

          marks: matchedItem?.marks_per_question
            ? Number(matchedItem.marks_per_question)
            : q.marks,
        };
      }),
    };
  });
});

const blueprintRefreshKey = ref(0);

const refreshBlueprintStatus = () => {
  recalculateAllMarks();
  validateBlueprintStructure();
  blueprintRefreshKey.value++;
};

const questionTypeName = (question = {}) => {
  return (
    question.type?.name ||
    question.question_type?.name ||
    question.question_type_name ||
    question.type_name ||
    question.type?.slug ||
    question.question_type ||
    "-"
  );
};



watch(
  () => paper.value.paper_blueprint_id,
  async (blueprintId) => {
    if (!blueprintId) {
      selectedBlueprint.value = null;
      blueprintErrors.value = [];
      return;
    }

    const res = await api.get(`/paper-blueprints/${blueprintId}`);
    selectedBlueprint.value = res.data.data || res.data;

    validateBlueprintStructure();
  },
);

/* INIT */

onMounted(async () => {
  loading.startPage();
  pageReady.value = false;

  await Promise.all([
    fetchGrades(),
    fetchExamNames(),
  ]);

  try {
    if (isEditMode.value) {
      await fetchPaperForEdit();
      await onSubjectChange();
    } else {
      await fetchQuestions();
    }
    
  } finally {
    pageReady.value = true;
    loading.stopPage();
  }
});
</script>

<template>
  <PageSkeleton :loading="!pageReady" type="card, table-heading, table-row-divider@8">
    <div>
      <!-- PAGE HEADER -->
      <div class="d-flex justify-space-between align-center mb-6">
        <div>
          <!-- STICKY SUMMARY -->
          <div class="sticky-summary">
            <div>
              <div class="text-subtitle-2 text-grey">Total Questions</div>

              <div class="text-h6 font-weight-bold">
                {{ totalQuestions }}
              </div>
            </div>

            <v-divider vertical />

            <div>
              <div class="text-subtitle-2 text-grey">Total Marks</div>

              <div class="text-h6 font-weight-bold">
                {{ totalMarks }}
              </div>
            </div>

            <v-divider vertical />

            <div>
              <div class="text-subtitle-2 text-grey">Sections</div>

              <div class="text-h6 font-weight-bold">
                {{ paper.sections.length }}
              </div>
            </div>
          </div>
          <h1 class="text-h4 font-weight-bold">
            {{
              isEditMode ? "Edit Question Paper" : "Question Paper Generator"
            }}
          </h1>

          <p class="text-grey">Create smart exam papers</p>
        </div>

        <div class="d-flex ga-2">
          <v-btn color="secondary" prepend-icon="mdi-auto-fix" @click="autoGenerate">
            Auto Generate
          </v-btn>

          <v-btn color="primary" prepend-icon="mdi-content-save" :loading="saving" :disabled="saving"
            @click="savePaper">
            {{ isEditMode ? "Update Paper" : "Save Paper" }}
          </v-btn>
        </div>
      </div>

      <!-- PAPER DETAILS -->
      <v-card class="pa-4 mb-6 rounded-xl" elevation="0">
        <v-row>
          <v-col cols="12" md="4">
            <v-text-field v-model="paper.title" label="Paper Title" :error-messages="errors.title" />
          </v-col>

          <v-col cols="12" md="3">
            <v-select v-model="paper.exam_name_id" :items="examNames" item-title="name" item-value="id"
              label="Exam Name" clearable :error-messages="errors.exam_name_id" />
          </v-col>

          <v-col cols="12" md="2">
            <v-text-field v-model="paper.duration" type="number" label="Duration (Min)" />
          </v-col>

          <v-col cols="12" md="3">
            <v-text-field :model-value="totalMarks" label="Total Marks" readonly />
          </v-col>
        </v-row>

        <AppEditor v-model="paper.instructions" label="General Instructions" />
      </v-card>
      <BlueprintSelectorCard :key="blueprintRefreshKey" v-model="paper.paper_blueprint_id"
        v-model:moderate-difficulty-mode="moderateDifficultyMode" :blueprints="blueprints"
        :selected-blueprint="selectedBlueprint" :current-sections="blueprintCurrentSections"
        :disabled="!paper.grade_id || !paper.subject_id" :show-generate-button="false" title="Question Paper Blueprint"
        subtitle="This paper must follow the selected blueprint structure." />

      <v-row>
        <!-- LEFT PANEL for question bank -->
        <v-col cols="12" md="7">
          <v-card class="rounded-xl pa-4" elevation="0">
            <div class="text-h6 mb-4">Question Bank Filter by:</div>

            <!-- FILTERS -->
            <v-row>
              <v-col cols="12" md="3">
                <v-select v-model="filters.grade_id" :items="grades" item-title="name" item-value="id" label="Class"
                  :disabled="isEditMode" @update:model-value="fetchSubjects" :error-messages="errors.grade_id" />
              </v-col>

              <v-col cols="12" md="3">
                <v-select v-model="filters.subject_id" :items="subjects" item-title="name" item-value="id"
                  label="Subject" :disabled="isEditMode" @update:model-value="onSubjectChange"
                  :error-messages="errors.subject_id" />
              </v-col>

              <v-col cols="12" md="3">
                <v-select v-model="filters.type" :items="questionTypes" item-title="title" item-value="value"
                  label="Question Type" @update:model-value="fetchQuestions" clearable />
              </v-col>

              <v-col cols="12" md="3">
                <v-select v-model="filters.difficulty" :items="['easy', 'medium', 'hard']" label="Difficulty"
                  :error-messages="errors.difficulty" />
              </v-col>
            </v-row>

            <v-text-field v-model="filters.search" prepend-inner-icon="mdi-magnify" label="Search Questions"
              class="mb-4" />

            <div class="d-flex ga-2 mb-4">
              <!-- APPLY -->
              <v-btn color="primary" @click="fetchQuestions">
                Apply Filters
              </v-btn>

              <!-- CLEAR -->
              <v-btn color="grey" variant="outlined" prepend-icon="mdi-filter-remove" @click="clearFilters">
                Clear
              </v-btn>
              <v-spacer />
              <v-chip color="success">
                Added:
                {{ addedQuestionIds.length }}
              </v-chip>

              <v-chip color="primary">
                Available:
                {{ questions.length - addedQuestionIds.length }}
              </v-chip>
            </div>

            <!-- QUESTIONS -->
            <div class="question-bank-scroll">
              <draggable :list="questions" item-key="id" :move="checkMove"
                :group="{ name: 'questions', pull: 'clone', put: false }" :clone="cloneQuestion" sort="false">
                <template #item="{ element }">
                  <div class="question-card" :class="{
                    'question-added-dark':
                      isQuestionAdded(element.id) &&
                      theme.global.current.value.dark,

                    'question-added-light':
                      isQuestionAdded(element.id) &&
                      !theme.global.current.value.dark,
                  }">
                    <div class="d-flex justify-space-between mb-3">
                      <div class="d-flex ga-2">
                        <v-chip size="small" color="primary" variant="tonal">
                          {{ questionTypeName(element) }}
                        </v-chip>

                        <v-chip size="small" color="success" variant="tonal">
                          {{ element.marks }} Marks
                        </v-chip>
                        <v-chip size="small" color="warning" variant="tonal">
                          {{ element.difficulty || element.difficulty_level }}
                        </v-chip>
                      </div>

                      <v-btn v-if="!isQuestionAdded(element.id)" color="primary" size="small"
                        @click="handleAddQuestionClick(element)">
                        Add
                      </v-btn>
                    </div>

                    <MathContent class="question-html" :html="element.question" />
                  </div>
                </template>
              </draggable>
            </div>
          </v-card>
        </v-col>

        <!-- RIGHT PANEL for SECTIONS -->
        <v-col cols="12" md="5" class="d-flex">
          <v-card class="flex-grow-1 rounded-xl sections-scroll" elevation="0">
            <div class="pa-4">
              <PaperSections v-model="paper.sections" :can-accept-question="canAcceptQuestionForSection"
                @replace-question="replaceQuestion" @preview-question="openPreview"
                @blueprint-refresh="refreshBlueprintStatus" @remove-question="removeQuestion" @blueprint-invalid-drop="
                  ui.showSnackbar('This question does not match the blueprint criteria for this section.', 'error')
                  " />
            </div>
          </v-card>
        </v-col>

        <!-- Live Preview PANEL -->
        <v-col cols="12" md="12">
          <v-card class="rounded-xl pa-4" elevation="0">
            <v-card class="mb-4" color="primary" variant="tonal">
              <v-card-text>
                <div class="d-flex align-center">
                  <div>
                    Total Questions:
                    <strong>
                      {{ selectedQuestions.length }}
                    </strong>
                  </div>

                  <v-spacer />

                  <v-chip size="large" color="success">
                    {{ totalMarks }}
                    Marks
                  </v-chip>
                </div>
              </v-card-text>
            </v-card>
            <v-btn-toggle v-model="previewMode" mandatory class="mb-4">
              <v-btn value="paper"> Question Paper </v-btn>

              <v-btn value="scheme"> Marking Scheme </v-btn>
            </v-btn-toggle>
            <LivePaperPreview :paper="paper" :mode="previewMode" @print="printPaper" />
          </v-card>
        </v-col>
      </v-row>
    </div>
    <QuestionPreviewDrawer v-model="previewDrawer" :question="previewQuestion" />
  </PageSkeleton>
</template>

<style scoped>
.question-added {
  opacity: 0.5;
  border: 1px dashed rgba(76, 175, 80, 0.5) !important;
  position: relative;
}

.added-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 1;
}

.question-added-light {
  background: rgba(0, 0, 0, 0.03);
  border: 1px dashed rgba(76, 175, 80, 0.5) !important;
}

.question-added-dark {
  background: rgba(255, 255, 255, 0.04);
  border: 1px dashed rgba(76, 175, 80, 0.5) !important;
}

.cursor-grab {
  cursor: grab;
}

.drag-handle {
  cursor: move;
}

.question-card {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.selected-question {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 14px;
}

.question-html :deep(p) {
  margin-bottom: 6px;
}

.question-html :deep(.katex-display) {
  overflow-x: auto;
  overflow-y: hidden;
  margin: 1rem 0;
}

.question-html :deep(.katex) {
  font-size: 1.1rem;
}

.sections-scroll {
  height: calc(100vh - 140px);

  overflow-y: auto;

  position: sticky;

  top: 80px;
}

/* SMOOTH SCROLLBAR */

.sections-scroll::-webkit-scrollbar {
  width: 8px;
}

.sections-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);

  border-radius: 20px;
}

.sticky-summary {
  position: sticky;

  top: 0;

  z-index: 20;

  display: flex;

  align-items: center;

  justify-content: space-around;

  gap: 20px;

  padding: 14px 18px;

  margin-bottom: 20px;

  border-radius: 16px;

  backdrop-filter: blur(12px);

  background: rgba(20, 20, 20, 0.75);

  border: 1px solid rgba(255, 255, 255, 0.08);
}

/*
|--------------------------------------------------------------------------
| LIGHT MODE
|--------------------------------------------------------------------------
*/

.v-theme--light .sticky-summary {
  background: rgba(255, 255, 255, 0.85);
}

.question-bank-scroll {
  height: calc(100vh - 140px);
  overflow-y: auto;
  padding-right: 6px;
}

.question-bank-scroll::-webkit-scrollbar {
  width: 6px;
}

.question-bank-scroll::-webkit-scrollbar-thumb {
  background: rgba(120, 120, 120, 0.5);
  border-radius: 10px;
}
</style>