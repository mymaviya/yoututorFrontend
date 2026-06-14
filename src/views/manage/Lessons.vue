<script setup>
import { ref, computed, onMounted } from "vue";
import api from "../../plugins/api";
import { useUIStore } from "../../stores/snackBar";

const ui = useUIStore();

const loading = ref(false);
const saving = ref(false);
const dialog = ref(false);
const statsDialog = ref(false);
const statsLoading = ref(false);

const grades = ref([]);
const streams = ref([]);
const subjects = ref([]);
const lessons = ref([]);
const questionTypes = ref([]);

const selectedLesson = ref(null);
const lessonStats = ref([]);

const filters = ref({
  grade_id: null,
  stream_id: null,
  subject_id: null,
  search: "",
});

const form = ref({
  id: null,
  grade_id: null,
  stream_id: null,
  subject_id: null,
  name: "",
  genre: "",
  is_active: true,
});

const formErrors = ref({});

const headers = [
  { title: "Class", key: "grade_name" },
  { title: "Subject", key: "subject_name" },
  { title: "Lesson", key: "name" },
  { title: "Genre", key: "genre" },
  { title: "Status", key: "status" },
  { title: "Actions", key: "actions", sortable: false, align: "end" },
];

const statHeaders = [
  { title: "Question Type", key: "question_type" },
  { title: "Total Questions", key: "total" },
];

const filteredSubjects = computed(() => {
  return subjects.value.filter((subject) => {
    if (
      filters.value.grade_id &&
      Number(subject.grade_id) !== Number(filters.value.grade_id)
    ) {
      return false;
    }

    if (filters.value.stream_id) {
      return (
        subject.stream_id === null ||
        Number(subject.stream_id) === Number(filters.value.stream_id)
      );
    }

    return true;
  });
});

const formSubjects = computed(() => {
  if (!form.value.grade_id) {
    return [];
  }

  return subjects.value.filter((subject) => {
    if (!subject.is_active) return false;

    if (Number(subject.grade_id) !== Number(form.value.grade_id)) {
      return false;
    }

    if (form.value.stream_id) {
      return (
        subject.stream_id === null ||
        Number(subject.stream_id) === Number(form.value.stream_id)
      );
    }

    return true;
  });
});

const filteredLessons = computed(() => {
  return lessons.value.filter((lesson) => {
    if (
      filters.value.grade_id &&
      Number(lesson.grade_id) !== Number(filters.value.grade_id)
    ) {
      return false;
    }

    if (filters.value.stream_id) {
      if (
        lesson.stream_id !== null &&
        Number(lesson.stream_id) !== Number(filters.value.stream_id)
      ) {
        return false;
      }
    }

    if (
      filters.value.subject_id &&
      Number(lesson.subject_id) !== Number(filters.value.subject_id)
    ) {
      return false;
    }

    if (filters.value.search) {
      const term = filters.value.search.toLowerCase();

      return (
        lesson.name?.toLowerCase().includes(term) ||
        lesson.genre?.toLowerCase().includes(term) ||
        lesson.subject?.name?.toLowerCase().includes(term) ||
        lesson.subject?.grade?.name?.toLowerCase().includes(term)
      );
    }

    return true;
  });
});

const isSeniorGrade = (gradeId) => {
  const grade = grades.value.find((g) => Number(g.id) === Number(gradeId));
  return ["11", "12"].includes(String(grade?.name).replace("Grade ", ""));
};

const tableLessons = computed(() => {
  return filteredLessons.value.map((lesson) => ({
    ...lesson,
    grade_name: lesson.subject?.grade?.name || lesson.grade?.name || "-",
    stream_name: lesson.subject?.stream?.name || lesson.stream?.name || "-",
    subject_name: lesson.subject?.name || "-",
  }));
});

const fetchGrades = async () => {
  const res = await api.get("/grades");
  grades.value = res.data.data || res.data;
};

const fetchStreams = async () => {
  const res = await api.get("/streams");
  streams.value = res.data.data || res.data;
};

const fetchSubjects = async () => {
  const res = await api.get("/subjects");
  subjects.value = res.data.data || res.data;
};

const fetchQuestionTypes = async () => {
  const res = await api.get("/question-types");
  questionTypes.value = res.data.data || res.data;
};

const fetchLessons = async () => {
  loading.value = true;

  try {
    const res = await api.get("/lessons");
    lessons.value = res.data.data || res.data;
  } catch (error) {
    ui.showSnackbar("Failed to load lessons", "error");
  } finally {
    loading.value = false;
  }
};

const openAdd = () => {
  formErrors.value = {};

  form.value = {
    id: null,
    grade_id: null,
    stream_id: null,
    subject_id: null,
    name: "",
    genre: "",
    is_active: true,
  };

  dialog.value = true;
};

const openEdit = (lesson) => {
  formErrors.value = {};

  form.value = {
    id: lesson.id,
    grade_id: lesson.grade_id,
    stream_id: lesson.stream_id,
    subject_id: lesson.subject_id,
    name: lesson.name,
    genre: lesson.genre || "",
    is_active: !!lesson.is_active,
  };

  dialog.value = true;
};

const saveLesson = async () => {
  saving.value = true;
  formErrors.value = {};

  try {
    if (isSeniorGrade(form.value.grade_id) && !form.value.stream_id) {
      formErrors.value.stream_id = ["Stream is required for Class 11 and 12"];
      return;
    }

    const payload = {
      grade_id: form.value.grade_id,
      stream_id: form.value.stream_id || null,
      subject_id: form.value.subject_id,
      name: form.value.name,
      genre: form.value.genre || null,
      is_active: form.value.is_active,
    };

    if (form.value.id) {
      await api.patch(`/lessons/${form.value.id}`, payload);
      ui.showSnackbar("Lesson updated successfully", "success");
    } else {
      await api.post("/lessons", payload);
      ui.showSnackbar("Lesson created successfully", "success");
    }

    dialog.value = false;
    await fetchLessons();
  } catch (error) {
    if (error.response?.status === 422) {
      formErrors.value = error.response.data.errors || {};
    } else {
      ui.showSnackbar("Failed to save lesson", "error");
    }
  } finally {
    saving.value = false;
  }
};

const toggleStatus = async (lesson) => {
  try {
    await api.patch(`/lessons/${lesson.id}`, {
      grade_id: lesson.grade_id,
      stream_id: lesson.stream_id,
      subject_id: lesson.subject_id,
      name: lesson.name,
      genre: lesson.genre,
      is_active: !lesson.is_active,
    });

    const index = lessons.value.findIndex(
      l => Number(l.id) === Number(lesson.id)
    );

    if (index !== -1) {
      lessons.value[index].is_active = !lessons.value[index].is_active;
    }
    ui.showSnackbar("Lesson status updated", "success");
  } catch (error) {
    ui.showSnackbar("Failed to update lesson status", "error");
  }
};

const deleteLesson = async (lesson) => {
  if (!confirm(`Delete lesson "${lesson.name}"?`)) return;

  try {
    await api.delete(`/lessons/${lesson.id}`);
    ui.showSnackbar("Lesson deleted successfully", "success");
    await fetchLessons();
  } catch (error) {
    ui.showSnackbar("Delete failed", "error");
  }
};

const viewLessonStats = async (lesson) => {
  selectedLesson.value = lesson;
  lessonStats.value = [];
  statsDialog.value = true;
  statsLoading.value = true;

  try {
    const res = await api.get("/questions", {
      params: {
        lesson_id: lesson.id,
        status: "approved",
        per_page: 1000,
      },
    });

    const questions = res.data.data || res.data || [];
    const map = {};

    questions.forEach((question) => {
      const slug =
        question.type?.slug ||
        question.question_type?.slug ||
        question.question_type ||
        question.type ||
        "unknown";

      const name =
        question.type?.name ||
        question.question_type?.name ||
        slug;

      if (!map[slug]) {
        map[slug] = {
          question_type: name,
          total: 0,
        };
      }

      map[slug].total++;
    });

    lessonStats.value = Object.values(map);

    questionTypes.value.forEach((type) => {
      const exists = lessonStats.value.find(
        (row) =>
          String(row.question_type).toLowerCase() ===
          String(type.name).toLowerCase() ||
          String(row.question_type).toLowerCase() ===
          String(type.slug).toLowerCase()
      );

      if (!exists) {
        lessonStats.value.push({
          question_type: type.name,
          total: 0,
        });
      }
    });

    lessonStats.value.sort((a, b) =>
      String(a.question_type).localeCompare(String(b.question_type))
    );
  } catch (error) {
    ui.showSnackbar("Failed to load lesson question summary", "error");
  } finally {
    statsLoading.value = false;
  }
};

const clearFilters = () => {
  filters.value = {
    grade_id: null,
    stream_id: null,
    subject_id: null,
    search: "",
  };
};

onMounted(async () => {
  await Promise.all([
    fetchGrades(),
    fetchStreams(),
    fetchSubjects(),
    fetchQuestionTypes(),
    fetchLessons(),
  ]);
});
</script>

<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">Lessons</h1>
        <p class="text-grey">Manage lessons and view question availability</p>
      </div>

      <v-btn color="primary" prepend-icon="mdi-plus" @click="openAdd">
        Add Lesson
      </v-btn>
    </div>

    <v-card class="pa-4 mb-4 rounded-xl" elevation="0">
      <v-row>
        <v-col cols="12" md="3">
          <v-autocomplete v-model="filters.grade_id" :items="grades" item-title="name" item-value="id"
            label="Filter by Class" clearable variant="outlined" />
        </v-col>

        <v-col cols="12" md="3">
          <v-autocomplete v-model="filters.stream_id" :items="streams" item-title="name" item-value="id"
            label="Filter by Stream" clearable variant="outlined" />
        </v-col>

        <v-col cols="12" md="3">
          <v-autocomplete v-model="filters.subject_id" :items="filteredSubjects" item-title="name" item-value="id"
            label="Filter by Subject" clearable variant="outlined" />
        </v-col>

        <v-col cols="12" md="2">
          <v-text-field v-model="filters.search" label="Search lesson" prepend-inner-icon="mdi-magnify" clearable
            variant="outlined" />
        </v-col>

        <v-col cols="12" md="1">
          <v-btn block variant="outlined" color="grey" @click="clearFilters">
            Clear
          </v-btn>
        </v-col>
      </v-row>
    </v-card>

    <v-card class="rounded-xl" elevation="0">
      <AppDataTable :headers="headers" :items="tableLessons" :loading="loading">
        <template #item.genre="{ item }">
          <v-chip v-if="item.genre" size="small" color="primary" variant="tonal">
            {{ item.genre }}
          </v-chip>

          <span v-else>-</span>
        </template>

        <template #item.status="{ item }">
          <v-chip size="small" class="cursor-pointer" :color="item.is_active ? 'success' : 'error'" variant="tonal"
            :prepend-icon="item.is_active
                ? 'mdi-check-circle-outline'
                : 'mdi-close-circle-outline'
              " @click="toggleStatus(item)">
            {{ item.is_active ? 'Active' : 'Inactive' }}
          </v-chip>


        </template>

        <template #item.actions="{ item }">
          <v-btn icon="mdi-eye" size="small" variant="text" color="info" @click="viewLessonStats(item)" />

          <v-btn icon="mdi-pencil" size="small" variant="text" color="primary" @click="openEdit(item)" />

          <v-btn icon="mdi-delete" size="small" variant="text" color="error" @click="deleteLesson(item)" />
        </template>
      </AppDataTable>
    </v-card>

    <v-dialog v-model="dialog" max-width="700">
      <v-card class="rounded-xl">
        <v-card-title class="font-weight-bold">
          {{ form.id ? "Edit Lesson" : "Add Lesson" }}
        </v-card-title>

        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-autocomplete v-model="form.grade_id" :items="grades" item-title="name" item-value="id" label="Class"
                variant="outlined" :error-messages="formErrors.grade_id" @update:model-value="form.subject_id = null" />
            </v-col>

            <v-col cols="12" md="6">
              <v-autocomplete v-model="form.stream_id" :items="streams" item-title="name" item-value="id" label="Stream"
                clearable variant="outlined" :disabled="!isSeniorGrade(form.grade_id)"
                :error-messages="formErrors.stream_id" @update:model-value="form.subject_id = null" />
            </v-col>

            <v-col cols="12">
              <v-autocomplete v-model="form.subject_id" :items="formSubjects" item-title="name" item-value="id"
                label="Subject" variant="outlined" :disabled="!form.grade_id" :error-messages="formErrors.subject_id" />
            </v-col>

            <v-col cols="12">
              <v-text-field v-model="form.name" label="Lesson Name" variant="outlined"
                :error-messages="formErrors.name" />
            </v-col>

            <v-col cols="12">
              <v-text-field v-model="form.genre" label="Genre" variant="outlined"
                hint="Example: Prose, Poetry, Grammar, Writing, Theory" persistent-hint
                :error-messages="formErrors.genre" />
            </v-col>

            <v-col cols="12">
              <v-switch v-model="form.is_active" label="Active" color="success" inset />
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn variant="text" @click="dialog = false">
            Cancel
          </v-btn>

          <v-btn color="primary" :loading="saving" @click="saveLesson">
            Save Lesson
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="statsDialog" max-width="650">
      <v-card class="rounded-xl">
        <v-card-title class="d-flex justify-space-between align-center">
          <div>
            <div class="font-weight-bold">Lesson Question Summary</div>
            <div class="text-caption text-grey">
              {{ selectedLesson?.name }}
            </div>
          </div>

          <v-btn icon="mdi-close" variant="text" @click="statsDialog = false" />
        </v-card-title>

        <v-divider />

        <v-card-text>
          <v-data-table :headers="statHeaders" :items="lessonStats" :loading="statsLoading" density="comfortable">
            <template #item.total="{ item }">
              <v-chip size="small" :color="Number(item.total) > 0 ? 'success' : 'grey'" variant="tonal">
                {{ item.total }}
              </v-chip>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>