<script setup>
import { ref, onMounted } from "vue";
import api from "../../plugins/api";
import { useUIStore } from "../../stores/snackBar";
import { formatDate } from "../../utils/date";

const ui = useUIStore();

const selectedTeacher = ref(null);
const selectedAssignment = ref(null);
const tasks = ref([]);
const teachers = ref([]);
const grades = ref([]);
const subjects = ref([]);
const lessons = ref([]);
const questionTypes = ref([]);
const selectedTasks = ref([]);

const dialog = ref(false);
const editMode = ref(false);
const loading = ref(false);
const saving = ref(false);
const errors = ref({});

const form = ref({
  teacher_id: null,
  grade_id: null,
  subject_id: null,
  lesson_id: null,
  question_types: [],
  difficulty: "medium",
  target_count: 10,
  due_date: null,
});

const difficulties = ["easy", "medium", "hard"];

const headers = [
  { title: "Teacher", key: "teacher" },
  { title: "Grade", key: "grade.name" },
  { title: "Subject", key: "subject.name" },
  { title: "Type", key: "question_type_name" },
  { title: "Difficulty", key: "difficulty" },
  { title: "Target", key: "target_count" },
  { title: "Created", key: "created_count" },
  { title: "Progress", key: "progress" },
  { title: "Due Date", key: "due_date" },
  { title: "Status", key: "status" },
  { title: "Actions", key: "actions", sortable: false },
];

const bulkEditDialog = ref(false)
const bulkEditForm = ref({
  teacher_id: null,
  grade_id: null,
  stream_id: null,
  subject_id: null,
  lesson_id: null,
  due_date: null,
  question_type_ids: [],
  target_count: null,
})


const fetchTasks = async () => {
  loading.value = true;

  try {
    const res = await api.get("/teacher-question-tasks");
    tasks.value = res.data;
  } finally {
    loading.value = false;
  }
};

const fetchQuestionTypes = async () => {
  if (!form.value.grade_id || !form.value.subject_id) {
    questionTypes.value = [];
    form.value.question_types = [];
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


const onTeacherChange = () => {
  selectedTeacher.value = teachers.value.find(
    (t) => Number(t.id) === Number(form.value.teacher_id),
  );

  selectedAssignment.value = null;
  form.value.grade_id = null;
  form.value.subject_id = null;
  form.value.lesson_id = null;
  lessons.value = [];
};

const selectAssignment = async (assignment) => {
  selectedAssignment.value = assignment;

  form.value.grade_id = assignment.grade_id;
  form.value.subject_id = assignment.subject_id;
  form.value.lesson_id = null;
  form.value.question_types = [];

  await fetchLessons();
  await fetchQuestionTypes();
};

const fetchTeachers = async () => {
  try {
    const res = await api.get("/teachers");

    const rows = res.data.data || res.data || [];

    teachers.value = rows.map((teacher) => ({
      ...teacher,
      title: teacher.name,
      value: teacher.id,
      assignments: teacher.teacher_assignments || [],
    }));
  } catch (error) {
    console.error(error);
    ui.showSnackbar("Failed to load teachers", "error");
  }
};

const fetchGrades = async () => {
  const res = await api.get("/grades");
  grades.value = res.data.data || res.data;
};

const fetchSubjects = async () => {
  if (!form.value.grade_id) {
    subjects.value = [];
    return;
  }

  const res = await api.get("/subjects", {
    params: {
      grade_id: form.value.grade_id,
    },
  });

  subjects.value = res.data.data || res.data;
};

const fetchLessons = async () => {
  if (!form.value.subject_id) {
    lessons.value = [];
    return;
  }

  const res = await api.get("/lessons", {
    params: {
      subject_id: form.value.subject_id,
    },
  });

  lessons.value = res.data.data || res.data;
};

const openAdd = () => {
  editMode.value = false;
  errors.value = {};

  selectedTeacher.value = null;
  selectedAssignment.value = null;
  lessons.value = [];

  form.value = {
    id: null,
    teacher_id: null,
    grade_id: null,
    subject_id: null,
    lesson_id: null,
    question_types: [],
    difficulty: "medium",
    target_count: 10,
    due_date: null,
  };

  dialog.value = true;
};

const openEdit = async (task) => {
  editMode.value = true;
  errors.value = {};

  form.value = {
    id: task.id,
    teacher_id: task.teacher?.id,
    grade_id: task.grade?.id || task.grade_id,
    subject_id: task.subject?.id || task.subject_id,
    lesson_id: task.lesson?.id || task.lesson_id || null,

    question_types: [],
    difficulty: task.difficulty,
    target_count: task.target_count,
    due_date: task.due_date,
  };

  selectedTeacher.value = teachers.value.find(
    (t) => Number(t.id) === Number(form.value.teacher_id),
  );

  selectedAssignment.value = selectedTeacher.value?.teacher_assignments?.find(
    (a) =>
      Number(a.grade_id) === Number(form.value.grade_id) &&
      Number(a.subject_id) === Number(form.value.subject_id),
  );

  await fetchLessons();
  await fetchQuestionTypes();

  form.value.question_types = Array.isArray(task.question_type)
    ? task.question_type
    : task.question_type
      ? [task.question_type]
      : [];

  dialog.value = true;
};

const saveTask = async () => {
  saving.value = true;
  errors.value = {};

  if (!form.value.question_types || form.value.question_types.length === 0) {
    ui.showSnackbar("Please select at least one question type", "warning");
    saving.value = false;
    return;
  }

  try {
    const payload = {
      teacher_id: form.value.teacher_id,
      grade_id: form.value.grade_id,
      subject_id: form.value.subject_id,
      lesson_id: form.value.lesson_id,
      question_types: form.value.question_types,
      difficulty: form.value.difficulty,
      target_count: form.value.target_count,
      due_date: form.value.due_date,
    };

    if (editMode.value) {
      await api.put(`/teacher-question-tasks/${form.value.id}`, {
        teacher_id: form.value.teacher_id,
        grade_id: form.value.grade_id,
        subject_id: form.value.subject_id,
        lesson_id: form.value.lesson_id,
        question_type: form.value.question_types[0],
        difficulty: form.value.difficulty,
        target_count: form.value.target_count,
        due_date: form.value.due_date,
      });

      ui.showSnackbar("Task updated successfully");
    } else {
      await api.post("/teacher-question-tasks", payload);

      ui.showSnackbar("Tasks assigned successfully");
    }

    dialog.value = false;
    fetchTasks();
  } catch (err) {
    if (err.response?.status === 422) {
      errors.value = err.response.data.errors;
    } else {
      ui.showSnackbar("Failed to save task", "error");
    }
  } finally {
    saving.value = false;
  }
};

const editSelectedTask = () => {
  if (selectedTasks.value.length !== 1) {
    ui.showSnackbar("Please select only one task to edit", "warning");
    return;
  }

  const task = tasks.value.find(
    (t) => Number(t.id) === Number(selectedTasks.value[0]),
  );

  if (!task) return;

  openEdit(task);
};

const deleteSelectedTasks = async () => {
  if (!selectedTasks.value.length) return;

  const ok = await ui.confirmDialog(
    "Delete Selected Tasks",
    `Are you sure you want to delete ${selectedTasks.value.length} selected task(s)?`,
  );

  if (!ok) return;

  try {
    await Promise.all(
      selectedTasks.value.map((id) =>
        api.delete(`/teacher-question-tasks/${id}`),
      ),
    );

    ui.showSnackbar("Selected tasks deleted successfully");
    selectedTasks.value = [];
    fetchTasks();
  } catch (err) {
    ui.showSnackbar("Failed to delete selected tasks", "error");
  }
};

const deleteTask = async (task) => {
  const ok = await ui.confirmDialog(
    "Delete Task",
    "Are you sure you want to delete this task?",
  );

  if (!ok) return;

  await api.delete(`/teacher-question-tasks/${task.id}`);
  ui.showSnackbar("Task deleted successfully");
  fetchTasks();
};

onMounted(() => {
  fetchTasks();
  fetchTeachers();
  fetchGrades();
});
</script>

<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">Teacher Question Tasks</h1>

        <p class="text-grey">Assign question creation targets to teachers.</p>
      </div>

      <v-btn color="primary" prepend-icon="mdi-clipboard-plus" @click="openAdd">
        Assign Task
      </v-btn>
    </div>
    <v-alert v-if="selectedTasks.length" type="info" variant="tonal" class="mb-3">
      <div class="d-flex justify-space-between align-center">
        <div>{{ selectedTasks.length }} task(s) selected</div>

        <div class="d-flex ga-2">
          <v-btn size="small" color="error" variant="tonal" prepend-icon="mdi-delete" @click="deleteSelectedTasks">
            Delete
          </v-btn>

          <v-btn size="small" variant="text" @click="selectedTasks = []">
            Clear
          </v-btn>
        </div>
      </div>
    </v-alert>

    <v-card class="rounded-xl" elevation="0">
      <v-data-table v-model="selectedTasks" :headers="headers" :items="tasks" :loading="loading" item-value="id"
        show-select>
        <template #item.teacher="{ item }">
          <div>
            <div class="font-weight-medium">
              {{ item.teacher?.name || item.teacher_name || '-' }}
            </div>
            <div class="text-caption text-grey">
              {{ item.teacher?.email || '-' }}
            </div>
          </div>
        </template>

        <template #item.question_type="{ item }">
          <v-chip size="small" color="primary" variant="tonal">
            {{ item.question_type_name || item.question_type || '-' }}
          </v-chip>
        </template>

        <template #item.progress="{ item }">
          <div style="min-width: 140px">
            <v-progress-linear :model-value="item.progress" height="8" rounded color="primary" />

            <div class="text-caption mt-1">{{ item.progress }}%</div>
          </div>
        </template>

        <template #item.due_date="{ item }">
          {{ formatDate(item.due_date) }}
        </template>

        <template #item.status="{ item }">
          <v-chip :color="item.status === 'completed' ? 'success' : 'warning'" variant="tonal" size="small">
            {{ item.status }}
          </v-chip>
        </template>

        <template #item.actions="{ item }">
          <v-btn icon="mdi-pencil" variant="text" size="small" color="primary" @click="openEdit(item)" />

          <v-btn icon="mdi-delete" variant="text" size="small" color="error" @click="deleteTask(item)" />
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="700" persistent>
      <v-card class="rounded-xl">
        <v-card-title class="d-flex justify-space-between align-center">
          {{ editMode ? "Edit Task" : "Assign Question Task" }}

          <v-btn icon="mdi-close" variant="text" @click="dialog = false" />
        </v-card-title>

        <v-divider />

        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-select v-model="form.teacher_id" :items="teachers" item-title="title" item-value="value"
                label="Teacher" variant="outlined" :error-messages="errors.teacher_id"
                @update:model-value="onTeacherChange" />
              <div v-if="selectedTeacher" class="mb-4">
                <div class="text-subtitle-2 font-weight-bold mb-2">
                  Assigned Grades & Subjects
                </div>

                <div class="d-flex flex-wrap ga-2">
                  <v-chip v-for="assignment in selectedTeacher.teacher_assignments" :key="assignment.id" size="large"
                    variant="tonal" :color="selectedAssignment?.id === assignment.id
                      ? 'primary'
                      : 'default'
                      " @click="selectAssignment(assignment)">
                    {{ assignment.grade?.name }} -
                    {{ assignment.subject?.name }}
                  </v-chip>
                </div>
              </div>
            </v-col>

            <v-col cols="12" md="12">
              <v-select v-model="form.lesson_id" :items="lessons" item-title="name" item-value="id" label="Lesson"
                variant="outlined" :disabled="!form.subject_id" :error-messages="errors.lesson_id" />
            </v-col>

            <v-col cols="12">
              <v-card class="pa-4 rounded-xl" variant="outlined">
                <!-- HEADER -->
                <div class="d-flex justify-space-between align-center mb-2">
                  <div>
                    <div class="text-h6 font-weight-bold">Question Types</div>

                    <div class="text-caption text-grey">
                      Select question types for this task
                    </div>
                  </div>

                  <div class="d-flex ga-2">
                    <!-- Select All -->
                    <v-btn size="small" variant="outlined" color="primary" prepend-icon="mdi-check-all" @click="
                      form.question_types = questionTypes.map((t) => t.slug)
                      ">
                      Select All
                    </v-btn>

                    <!-- Clear -->
                    <v-btn size="small" variant="outlined" color="error" prepend-icon="mdi-delete-outline"
                      @click="form.question_types = []">
                      Clear
                    </v-btn>
                  </div>
                </div>

                <!-- CHIPS -->
                <div class="question-type-grid">
                  <div v-for="type in questionTypes" :key="type.id" class="question-chip" :class="{
                    selected: form.question_types.includes(type.slug),
                  }" @click="
                    form.question_types.includes(type.slug)
                      ? (form.question_types = form.question_types.filter(
                        (t) => t !== type.slug,
                      ))
                      : form.question_types.push(type.slug)
                    ">
                    <div class="chip-label">
                      {{ type.name }}
                    </div>

                    <v-icon v-if="form.question_types.includes(type.slug)" size="20" color="white">
                      mdi-check-circle
                    </v-icon>
                  </div>
                </div>

                <!-- ERROR -->
                <div v-if="errors.question_types" class="text-error text-caption mt-2">
                  {{ errors.question_types[0] }}
                </div>
              </v-card>
            </v-col>

            <v-col cols="12" md="6">
              <v-select v-model="form.difficulty" :items="difficulties" label="Difficulty"
                :error-messages="errors.difficulty" />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field v-model="form.target_count" type="number" label="No. of Questions"
                :error-messages="errors.target_count" />
            </v-col>

            <v-col cols="12">
              <v-text-field v-model="form.due_date" type="date" label="Due Date" :error-messages="errors.due_date" />
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />

          <v-btn variant="text" @click="dialog = false"> Cancel </v-btn>

          <v-btn color="primary" :loading="saving" @click="saveTask">
            {{ editMode ? "Update Task" : "Assign Task" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="bulkEditDialog" max-width="520">
      <v-card class="rounded-xl">
        <v-card-title> Bulk Edit Selected Tasks </v-card-title>

        <v-card-text>
          <v-select v-model="bulkForm.difficulty" :items="difficulties" label="Difficulty" clearable
            variant="outlined" />

          <v-text-field v-model="bulkForm.target_count" type="number" label="No. of Questions" clearable
            variant="outlined" />

          <v-text-field v-model="bulkForm.due_date" type="date" label="Due Date" clearable variant="outlined" />
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn variant="text" @click="bulkEditDialog = false"> Cancel </v-btn>

          <v-btn color="primary" @click="saveBulkEdit"> Update Selected </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.question-type-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
  margin-top: 20px;
}

.question-chip {
  border: 1px solid rgba(var(--v-theme-primary), 0.25);
  border-radius: 16px;
  padding: 18px 20px;
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: space-between;

  transition: all 0.2s ease;
  user-select: none;
}

.question-chip:hover {
  transform: translateY(-1px);
  border-color: rgba(var(--v-theme-primary), 0.6);
}

.question-chip.selected {
  background: rgba(var(--v-theme-primary), 0.18);
  border-color: rgb(var(--v-theme-primary));
}

.chip-label {
  font-size: 15px;
  font-weight: 500;
}
</style>
