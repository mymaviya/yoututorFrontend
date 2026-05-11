<script setup>
import { ref, onMounted } from "vue";
import api from "../../plugins/api";
import { useUIStore } from "../../stores/snackBar";

const loading = ref(false);
const grades = ref([])
const subjects = ref([]);
const lessons = ref([]);
const dialog = ref(false);
const editMode = ref(false);
const errors = ref({});
const ui = useUIStore();

const form = ref({
  id: null,
  grade_id: null,
  subject_id: null,
  title: "",
});

const fetchGrades = async () => {
  const res = await api.get('/grades')
  grades.value = res.data.data || res.data
}

const fetchLessons = async () => {
  lessons.value = (await api.get("/lessons")).data;
};

const fetchSubjects = async () => {
  if (!form.value.grade_id) {
    subjects.value = []
    return
  }

  const res = await api.get('/subjects', {
    params: {
      grade_id: form.value.grade_id
    }
  })

  subjects.value = res.data.data || res.data
}

const openAdd = () => {
  form.value = { id: null, title: "", subject_id: null };
  editMode.value = false;
  dialog.value = true;
};

const openEdit = (item) => {
  form.value = { ...item };
  editMode.value = true;
  dialog.value = true;
};

const save = async () => {
  errors.value = {};

  try {
    if (editMode.value) {
      await api.put(`/lessons/${form.value.id}`, form.value);
      ui.showSnackbar("Lesson updated successfully");
    } else {
      await api.post("/lessons", form.value);
      ui.showSnackbar("Lesson added successfully");
    }

    dialog.value = false;
    fetchLessons();
  } catch (err) {
    if (err.response?.status === 422) {
      errors.value = err.response.data.errors;
    }
  }
};

const deleteItem = async (id) => {
  const ok = await ui.confirmDialog(
    "Delete",
    "Are you sure you want to delete this?",
  );

  if (!ok) return;

  await api.delete(`/lessons/${id}`);
  ui.showSnackbar("Deleted successfully");
  fetchLessons();
};

const updateStatus = async (id) => {
  const lesson = lessons.value.find((l) => l.id === id);
  if (lesson) {
    await api.post(`/lesson_status/${id}`);
    ui.showSnackbar("Status updated successfully");
    fetchLessons();
  }
};

function getColor(val) {
  if (val) return "success";
  else return "error";
}

onMounted(() => {
  fetchGrades();
  fetchLessons();
});
</script>

<template>
  <v-container>
    <v-card class="pa-4">
      <div class="d-flex justify-space-between mb-3">
        <h3>Lessons</h3>
        <v-btn color="primary" @click="openAdd">Add Lesson</v-btn>
      </div>

      <v-data-table
        v-if="!loading"
        :headers="[
          { title: 'ID', key: 'id' },
          { title: 'Grade', key: 'subject.grade.name' },
          { title: 'Subject', key: 'subject.name' },
          { title: 'Title', key: 'title' },
          { title: 'Status', key: 'is_active' },
          { title: 'Actions', key: 'actions', align: 'end', sortable: false },
        ]"
        :items="lessons"
      >
        <template v-slot:item.is_active="{ item }">
          <v-chip
            :border="`${getColor(item.is_active)} thin opacity-25`"
            :color="getColor(item.is_active)"
            :text="item.is_active ? 'Active' : 'Inactive'"
            size="x-small"
            :prepend-icon="
              item.is_active
                ? 'mdi-checkbox-marked-circle-outline'
                : 'mdi-checkbox-blank-circle-outline'
            "
            @click="updateStatus(item.id)"
          ></v-chip>
        </template>

        <template v-slot:item.actions="{ item }">
          <div class="d-flex ga-2 justify-end">
            <v-icon
              color="medium-emphasis"
              icon="mdi-pencil"
              size="small"
              @click="openEdit(item)"
            ></v-icon>

            <v-icon
              color="red"
              icon="mdi-delete"
              size="small"
              @click="deleteItem(item.id)"
            ></v-icon>
          </div>
        </template>
      </v-data-table>
      <div v-else class="pa-4">
        <v-skeleton-loader type="table-heading, table-tbody, table-tfoot" />
      </div>
    </v-card>

    <!-- Dialog -->
    <v-dialog v-model="dialog" max-width="400">
      <v-card class="pa-4">
        <h4 class="mb-3">
          {{ editMode ? "Edit Lesson" : "Add Lesson" }}
        </h4>

        <v-col cols="12" md="4">
          <v-select
            v-model="form.grade_id"
            :items="grades"
            item-title="name"
            item-value="id"
            label="Grade"
            variant="outlined"
            @update:model-value="fetchSubjects"
            :error-messages="errors.grade_id"
          />
        </v-col>

        <v-col cols="12" md="4">
          <v-select
            v-model="form.subject_id"
            :items="subjects"
            item-title="name"
            item-value="id"
            label="Subject"
            variant="outlined"
            :disabled="!form.grade_id"
            :error-messages="errors.subject_id"
          />
        </v-col>

        <v-col cols="12" md="4">
          <v-text-field
            v-model="form.title"
            label="Lesson Title"
            variant="outlined"
            :error-messages="errors.title"
          />
        </v-col>

        <v-btn color="primary" @click="save"> Save </v-btn>
      </v-card>
    </v-dialog>
  </v-container>
</template>
