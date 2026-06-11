<script setup>
import { ref, computed, onMounted } from "vue";
import api from "../../plugins/api";
import { useUIStore } from "../../stores/snackBar";

const ui = useUIStore();

const loading = ref(false);
const saving = ref(false);
const dialog = ref(false);

const grades = ref([]);
const streams = ref([]);
const subjects = ref([]);

const filters = ref({
  grade_id: null,
  stream_id: null,
  search: "",
});

const form = ref({
  grade_id: null,
  stream_id: null,
  subjects_text: "",
});

const formErrors = ref({});

const headers = [
  { title: "Class", key: "grade_label" },
  { title: "Subjects", key: "subjects", sortable: false },
  { title: "Actions", key: "actions", sortable: false, align: "end" },
];

const gradeLabel = (grade, stream = null) => {
  if (!grade) return "-";
  return stream ? `${grade.name} - ${stream.name}` : `${grade.name}`;
};

const isSeniorGrade = (gradeId) => {
  const grade = grades.value.find((g) => Number(g.id) === Number(gradeId));
  return ["11", "12"].includes(String(grade?.name));
};

const groupedSubjects = computed(() => {
  const map = {};

  subjects.value.forEach((subject) => {
    const key = `${subject.grade_id || "no-grade"}_${subject.stream_id || "no-stream"}`;

    if (!map[key]) {
      map[key] = {
        grade_id: subject.grade_id,
        stream_id: subject.stream_id,
        grade: subject.grade,
        stream: subject.stream,
        grade_label: gradeLabel(subject.grade, subject.stream),
        subjects: [],
      };
    }

    map[key].subjects.push(subject);
  });

  return Object.values(map).filter((group) => {
    if (filters.value.grade_id && Number(group.grade_id) !== Number(filters.value.grade_id)) {
      return false;
    }

    if (filters.value.stream_id && Number(group.stream_id) !== Number(filters.value.stream_id)) {
      return false;
    }

    if (filters.value.search) {
      const term = filters.value.search.toLowerCase();

      return (
        group.grade_label.toLowerCase().includes(term) ||
        group.subjects.some((s) => s.name.toLowerCase().includes(term))
      );
    }

    return true;
  });
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
  loading.value = true;

  try {
    const res = await api.get("/subjects");
    subjects.value = res.data.data || res.data;
  } catch (error) {
    ui.showSnackbar("Failed to load subjects", "error");
  } finally {
    loading.value = false;
  }
};

const openEditGroup = (group = null) => {
  formErrors.value = {};

  if (group) {
    form.value = {
      grade_id: group.grade_id,
      stream_id: group.stream_id,
      subjects_text: group.subjects.map((s) => s.name).join(", "),
    };
  } else {
    form.value = {
      grade_id: null,
      stream_id: null,
      subjects_text: "",
    };
  }

  dialog.value = true;
};

const subjectNamesFromText = computed(() => {
  return form.value.subjects_text
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
});

const saveGroupSubjects = async () => {
  saving.value = true;
  formErrors.value = {};

  try {
    if (!form.value.grade_id) {
      formErrors.value.grade_id = ["Class is required"];
      return;
    }

    if (isSeniorGrade(form.value.grade_id) && !form.value.stream_id) {
      formErrors.value.stream_id = ["Stream is required for Class 11 and 12"];
      return;
    }

    if (!subjectNamesFromText.value.length) {
      formErrors.value.subjects_text = ["Enter at least one subject"];
      return;
    }

    const existingGroupSubjects = subjects.value.filter((subject) => {
      return (
        Number(subject.grade_id) === Number(form.value.grade_id) &&
        Number(subject.stream_id || 0) === Number(form.value.stream_id || 0)
      );
    });

    for (const name of subjectNamesFromText.value) {
      const existing = existingGroupSubjects.find(
        (s) => s.name.toLowerCase() === name.toLowerCase()
      );

      if (!existing) {
        await api.post("/subjects", {
          name,
          grade_id: form.value.grade_id,
          stream_id: form.value.stream_id || null,
          is_active: true,
        });
      }
    }

    ui.showSnackbar("Subjects saved successfully", "success");
    dialog.value = false;
    await fetchSubjects();
  } catch (error) {
    if (error.response?.status === 422) {
      formErrors.value = error.response.data.errors || {};
    } else {
      ui.showSnackbar("Failed to save subjects", "error");
    }
  } finally {
    saving.value = false;
  }
};

const toggleStatus = async (subject) => {
  try {
    await api.patch(`/subjects/${subject.id}/status`);
    subject.is_active = !subject.is_active;
    ui.showSnackbar("Subject status updated", "success");
  } catch (error) {
    ui.showSnackbar("Failed to update status", "error");
  }
};

const clearFilters = () => {
  filters.value = {
    grade_id: null,
    stream_id: null,
    search: "",
  };
};

onMounted(async () => {
  await Promise.all([fetchGrades(), fetchStreams(), fetchSubjects()]);
});
</script>

<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">Subjects</h1>
        <p class="text-grey">Manage subjects class-wise and stream-wise</p>
      </div>

      <v-btn color="primary" prepend-icon="mdi-plus" @click="openEditGroup()">
        Add Subjects
      </v-btn>
    </div>

    <v-card class="pa-4 mb-4 rounded-xl" elevation="0">
      <v-row>
        <v-col cols="12" md="3">
          <v-select
            v-model="filters.grade_id"
            :items="grades"
            item-title="name"
            item-value="id"
            label="Filter by Class"
            clearable
          />
        </v-col>

        <v-col cols="12" md="3">
          <v-select
            v-model="filters.stream_id"
            :items="streams"
            item-title="name"
            item-value="id"
            label="Filter by Stream"
            clearable
          />
        </v-col>

        <v-col cols="12" md="4">
          <v-text-field
            v-model="filters.search"
            label="Search class or subject"
            prepend-inner-icon="mdi-magnify"
            clearable
          />
        </v-col>

        <v-col cols="12" md="2">
          <v-btn block variant="outlined" color="grey" @click="clearFilters">
            Clear
          </v-btn>
        </v-col>
      </v-row>
    </v-card>

    <v-card class="rounded-xl" elevation="0">
      <AppDataTable
        :headers="headers"
        :items="groupedSubjects"
        :loading="loading"
      >
        <template #item.subjects="{ item }">
          <div class="d-flex flex-wrap ga-2 py-2">
            <v-chip
              v-for="subject in item.subjects"
              :key="subject.id"
              size="small"
              class="cursor-pointer"
              :color="subject.is_active ? 'success' : 'error'"
              variant="tonal"
              :prepend-icon="
                subject.is_active
                  ? 'mdi-check-circle-outline'
                  : 'mdi-close-circle-outline'
              "
              @click="toggleStatus(subject)"
            >
              {{ subject.name }}
            </v-chip>
          </div>
        </template>

        <template #item.actions="{ item }">
          <v-btn
            icon="mdi-pencil"
            size="small"
            variant="text"
            color="primary"
            @click="openEditGroup(item)"
          />
        </template>
      </AppDataTable>
    </v-card>

    <v-dialog v-model="dialog" max-width="700">
      <v-card class="rounded-xl">
        <v-card-title class="font-weight-bold">
          Add / Edit Class Subjects
        </v-card-title>

        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-select
                v-model="form.grade_id"
                :items="grades"
                item-title="name"
                item-value="id"
                label="Class"
                :error-messages="formErrors.grade_id"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="form.stream_id"
                :items="streams"
                item-title="name"
                item-value="id"
                label="Stream"
                clearable
                :disabled="!isSeniorGrade(form.grade_id)"
                :error-messages="formErrors.stream_id"
              />
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="form.subjects_text"
                label="Subjects"
                rows="5"
                auto-grow
                hint="Enter subjects separated by comma or new line"
                persistent-hint
                :error-messages="formErrors.subjects_text"
              />
            </v-col>
          </v-row>

          <v-alert type="info" variant="tonal" class="mt-3">
            Existing subjects will remain active. New names will be added.
            Click subject chips in the table to make subjects active or inactive.
          </v-alert>
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn variant="text" @click="dialog = false">
            Cancel
          </v-btn>

          <v-btn color="primary" :loading="saving" @click="saveGroupSubjects">
            Save Subjects
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>