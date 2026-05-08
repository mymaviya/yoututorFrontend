<script setup>
import { ref, onMounted } from "vue";
import api from "../../plugins/api";
import { useUIStore } from "../../stores/snackBar";

const loading = ref(false);
const subjects = ref([]);
const grades = ref([]);
const dialog = ref(false);
const editMode = ref(false);
const errors = ref({});
const ui = useUIStore();

const form = ref({
  id: null,
  name: "",
  grade_id: null,
});

const fetchGrades = async () => {
  grades.value = (await api.get('/grades')).data
}

const fetchSubjects = async () => {
  loading.value = true;
  try {
    const res = await api.get("/subjects");
    subjects.value = res.data;
  } catch (err) {
    ui.showSnackbar("Failed to fetch Subjects", "error");
  } finally {
    loading.value = false;
  }
};

const openAdd = () => {
  form.value = { id: null, name: "", grade_id: null };
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
      await api.put(`/subjects/${form.value.id}`, form.value);
      ui.showSnackbar("Subject updated successfully");
    } else {
      await api.post("/subjects", form.value);
      ui.showSnackbar("Subject added successfully");
    }

    dialog.value = false;
    fetchSubjects();
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

  await api.delete(`/subjects/${id}`);
  ui.showSnackbar("Deleted successfully");
  fetchSubjects();
};

const updateStatus = async (id) => {
  const subject = subjects.value.find((s) => s.id === id);
  if (subject) {
    await api.post(`/subject_status/${id}`);
    ui.showSnackbar("Status updated successfully");
    fetchSubjects();
  }
};

function getColor(val) {
  if (val) return "success";
  else return "error";
}

onMounted(() => {
  fetchSubjects()
  fetchGrades()
})
</script>

<template>
  <v-container>
    <v-card class="pa-4">
      <div class="d-flex justify-space-between mb-3">
        <h3>Subjects</h3>
        <v-btn color="primary" @click="openAdd">Add Subject</v-btn>
      </div>

      <v-data-table
        v-if="!loading"
        :headers="[
          { title: 'ID', key: 'id' },
          { title: 'Grade', key: 'grade.name' },
          { title: 'Subject', key: 'name' },
          { title: 'Status', key: 'is_active' },
          { title: 'Actions', key: 'actions', align: 'end', sortable: false },
        ]"
        :items="subjects"
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
          {{ editMode ? "Edit Subject" : "Add Subject" }}
        </h4>

        <v-select
          label="Select Grade"
          :items="grades"
          item-title="name"
          item-value="id"
          v-model="form.grade_id"
          :error-messages="errors.grade_id"
        ></v-select>

        <v-text-field
          label="Subject"
          v-model="form.name"
          :error-messages="errors.name"
        />
        

        <v-btn color="primary" @click="save"> Save </v-btn>
      </v-card>
    </v-dialog>
  </v-container>
</template>
