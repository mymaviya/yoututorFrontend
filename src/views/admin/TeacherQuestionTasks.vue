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

const questionTypes = [
  { title: "MCQ", value: "mcq" },
  { title: "Multiple MCQ", value: "multiple_mcq" },
  { title: "True / False", value: "true_false" },
  { title: "Fill in the Blanks", value: "fill_blank" },
  { title: "Short Answer", value: "short" },
  { title: "Long Answer", value: "long" },
  { title: "Match Column", value: "match_column" },
  { title: "Assertion Reason", value: "assertion_reason" },
  { title: "Numerical", value: "numerical" },
];

const difficulties = ["easy", "medium", "hard"];

const headers = [
  { title: "Teacher", key: "teacher" },
  { title: "Grade", key: "grade.name" },
  { title: "Subject", key: "subject.name" },
  { title: "Type", key: "question_type" },
  { title: "Difficulty", key: "difficulty" },
  { title: "Target", key: "target_count" },
  { title: "Created", key: "created_count" },
  { title: "Progress", key: "progress" },
  { title: "Due Date", key: "due_date" },
  { title: "Status", key: "status" },
  { title: "Actions", key: "actions", sortable: false },
];

const fetchTasks = async () => {
  loading.value = true;

  try {
    const res = await api.get("/teacher-question-tasks");
    tasks.value = res.data;
  } finally {
    loading.value = false;
  }
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

  await fetchLessons();
};

const fetchTeachers = async () => {
  const res = await api.get("/teachers");
  teachers.value = res.data.data || res.data;
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
    grade_id: task.grade?.id,
    subject_id: task.subject?.id,
    lesson_id: task.lesson?.id || task.lesson_id || null,
    question_types: [task.question_type],
    difficulty: task.difficulty,
    target_count: task.target_count,
    due_date: task.due_date,
  };

  selectedTeacher.value = teachers.value.find(
    (t) => Number(t.id) === Number(form.value.teacher_id),
  );

  selectedAssignment.value = selectedTeacher.value?.assignments?.find(
    (a) =>
      Number(a.grade_id) === Number(form.value.grade_id) &&
      Number(a.subject_id) === Number(form.value.subject_id),
  );

  await fetchLessons();

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

    <v-card class="rounded-xl" elevation="0">
      <v-data-table :headers="headers" :items="tasks" :loading="loading">
        <template #item.teacher="{ item }">
          <div>
            <div class="font-weight-medium">
              {{ item.teacher?.user?.name }}
            </div>
            <div class="text-caption text-grey">
              {{ item.teacher?.user?.email }}
            </div>
          </div>
        </template>

        <template #item.progress="{ item }">
          <div style="min-width: 140px">
            <v-progress-linear
              :model-value="item.progress"
              height="8"
              rounded
              color="primary"
            />

            <div class="text-caption mt-1">{{ item.progress }}%</div>
          </div>
        </template>

        <template #item.due_date="{ item }">
          {{ formatDate(item.due_date) }}
        </template>

        <template #item.status="{ item }">
          <v-chip
            :color="item.status === 'completed' ? 'success' : 'warning'"
            variant="tonal"
            size="small"
          >
            {{ item.status }}
          </v-chip>
        </template>

        <template #item.actions="{ item }">
          <v-btn
            icon="mdi-pencil"
            variant="text"
            size="small"
            color="primary"
            @click="openEdit(item)"
          />

          <v-btn
            icon="mdi-delete"
            variant="text"
            size="small"
            color="error"
            @click="deleteTask(item)"
          />
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
              <v-select
                v-model="form.teacher_id"
                :items="teachers"
                item-title="user.name"
                item-value="id"
                label="Teacher"
                variant="outlined"
                :error-messages="errors.teacher_id"
                @update:model-value="onTeacherChange"
              />
              <div v-if="selectedTeacher" class="mb-4">
                <div class="text-subtitle-2 font-weight-bold mb-2">
                  Assigned Grades & Subjects
                </div>

                <div class="d-flex flex-wrap ga-2">
                  <v-chip
                    v-for="assignment in selectedTeacher.assignments"
                    :key="assignment.id"
                    size="large"
                    variant="tonal"
                    :color="
                      selectedAssignment?.id === assignment.id
                        ? 'primary'
                        : 'default'
                    "
                    @click="selectAssignment(assignment)"
                  >
                    {{ assignment.grade?.name }} -
                    {{ assignment.subject?.name }}
                  </v-chip>
                </div>
              </div>
            </v-col>

            <v-col cols="12" md="12">
              <v-select
                v-model="form.lesson_id"
                :items="lessons"
                item-title="title"
                item-value="id"
                label="Lesson"
                variant="outlined"
                :disabled="!form.subject_id"
                :error-messages="errors.lesson_id"
              />
            </v-col>

            <v-col cols="12" md="12">
              <div class="text-subtitle-2 font-weight-bold mb-2">
                Select Question Types
              </div>

              <v-chip-group
                v-model="form.question_types"
                multiple
                column
                selected-class="bg-primary text-white"
              >
                <v-chip
                  v-for="type in questionTypes"
                  :key="type.value"
                  :value="type.value"
                  filter
                  variant="tonal"
                >
                  {{ type.title }}
                </v-chip>
              </v-chip-group>

              <div
                v-if="errors.question_types"
                class="text-error text-caption mt-1"
              >
                {{ errors.question_types[0] }}
              </div>

              <div class="mt-2 d-flex ga-2">
                <v-btn
                  size="small"
                  variant="tonal"
                  @click="
                    form.question_types = questionTypes.map((t) => t.value)
                  "
                >
                  Select All
                </v-btn>

                <v-btn
                  size="small"
                  variant="text"
                  @click="form.question_types = []"
                >
                  Clear
                </v-btn>
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="form.difficulty"
                :items="difficulties"
                label="Difficulty"
                :error-messages="errors.difficulty"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.target_count"
                type="number"
                label="No. of Questions"
                :error-messages="errors.target_count"
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model="form.due_date"
                type="date"
                label="Due Date"
                :error-messages="errors.due_date"
              />
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
  </div>
</template>
