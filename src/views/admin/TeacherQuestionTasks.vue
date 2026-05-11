<script setup>
import { ref, onMounted } from "vue";
import api from "../../plugins/api";
import { useUIStore } from "../../stores/snackBar";

const ui = useUIStore();

const tasks = ref([]);
const teachers = ref([]);
const grades = ref([]);
const subjects = ref([]);
const lessons = ref([])

const dialog = ref(false);
const editMode = ref(false);
const loading = ref(false);
const saving = ref(false);
const errors = ref({});

const form = ref({
  id: null,
  teacher_id: null,
  grade_id: null,
  subject_id: null,
  lesson_id: null,
  question_type: "mcq",
  difficulty: "medium",
  target_count: 10,
  due_date: null,
});

const questionTypes = [
  "mcq",
  "multiple_mcq",
  "true_false",
  "fill_blank",
  "short",
  "long",
  "match_column",
  "assertion_reason",
  "numerical",
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
    lessons.value = []
    form.value.lesson_id = null
    return
  }

  const res = await api.get('/lessons', {
    params: {
      subject_id: form.value.subject_id
    }
  })

  lessons.value = res.data.data || res.data
}

const openAdd = () => {
  editMode.value = false;
  errors.value = {};

  form.value = {
    id: null,
    teacher_id: null,
    grade_id: null,
    subject_id: null,
    lesson_id: null,
    question_type: "mcq",
    difficulty: "medium",
    target_count: 10,
    due_date: null,
  };

  subjects.value = [];
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
    lesson_id_id: task.lesson_id?.id,
    question_type: task.question_type,
    difficulty: task.difficulty,
    target_count: task.target_count,
    due_date: task.due_date,
  };

  await fetchSubjects();
  dialog.value = true;
};

const saveTask = async () => {
  saving.value = true;
  errors.value = {};

  try {
    if (editMode.value) {
      await api.put(`/teacher-question-tasks/${form.value.id}`, form.value);
      ui.showSnackbar("Task updated successfully");
    } else {
      await api.post("/teacher-question-tasks", form.value);
      ui.showSnackbar("Task assigned successfully");
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
                :error-messages="errors.teacher_id"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="form.grade_id"
                :items="grades"
                item-title="name"
                item-value="id"
                label="Grade"
                :error-messages="errors.grade_id"
                @update:model-value="fetchSubjects"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="form.subject_id"
                :items="subjects"
                item-title="name"
                item-value="id"
                label="Subject"
                :disabled="!form.grade_id"
                :error-messages="errors.subject_id"
                @update:model-value="fetchLessons"
              />
            </v-col>

            <v-col cols="12" md="12">
              <v-select
                v-model="form.lesson_id"
                :items="lessons"
                item-title="title"
                item-value="id"
                label="Lesson"
                :disabled="!form.subject_id"
                :error-messages="errors.lesson_id"
              />
              
            </v-col>

            <v-col cols="12" md="4">
              <v-select
                v-model="form.question_type"
                :items="questionTypes"
                label="Question Type"
                :error-messages="errors.question_type"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-select
                v-model="form.difficulty"
                :items="difficulties"
                label="Difficulty"
                :error-messages="errors.difficulty"
              />
            </v-col>

            <v-col cols="12" md="4">
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
