<script setup>
import { ref, onMounted } from "vue";
import api from "../../plugins/api";
import { useUIStore } from "../../stores/snackBar";

const loading = ref(false);
const grades = ref([]);
const dialog = ref(false);
const editMode = ref(false);
const errors = ref({});
const ui = useUIStore();
const streams = [
  "Preprimary",
  "Primary",
  "Junior",
  "Senior",
  "Science",
  "Commerce",
  "Humanities",
];
const form = ref({
  id: null,
  name: "",
  stream: "",
});

const fetchGrades = async () => {
  loading.value = true;
  try {
    const res = await api.get("/grades");
    grades.value = res.data;
  } catch (err) {
    ui.showSnackbar("Failed to fetch Grades", "error");
  } finally {
    loading.value = false;
  }
};

const openAdd = () => {
  form.value = { id: null, name: "", stream: "" };
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
      await api.put(`/grades/${form.value.id}`, form.value);
      ui.showSnackbar("Grade updated successfully");
    } else {
      await api.post("/grades", form.value);
      ui.showSnackbar("Grade added successfully");
    }

    dialog.value = false;
    fetchGrades();
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

  await api.delete(`/grades/${id}`);
  ui.showSnackbar("Deleted successfully");
  fetchGrades();
};

const updateStatus = async (id) => {
  const grade = grades.value.find((g) => g.id === id);
  if (grade) {
    await api.post(`/grade_status/${id}`);
    ui.showSnackbar("Status updated successfully");
    fetchGrades();
  }
};

function getColor(val) {
  if (val) return "success";
  else return "error";
}

onMounted(fetchGrades);
</script>

<template>
  <v-container>
    <v-card class="pa-4">
      <div class="d-flex justify-space-between mb-3">
        <h3>Grades</h3>
        <v-btn color="primary" @click="openAdd">Add Grade</v-btn>
      </div>

      <v-data-table
        v-if="!loading"
        :headers="[
          { title: 'ID', key: 'id' },
          { title: 'Grade', key: 'name' },
          { title: 'Stream', key: 'stream' },
          { title: 'Status', key: 'is_active' },
          { title: 'Actions', key: 'actions', align: 'end', sortable: false },
        ]"
        :items="grades"
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
          {{ editMode ? "Edit Grade" : "Add Grade" }}
        </h4>

        <v-text-field
          label="Grade"
          v-model="form.name"
          :error-messages="errors.name"
        />
        <v-select
          label="Select Stream"
          :items="streams"
          v-model="form.stream"
          :error-messages="errors.stream"
        ></v-select>

        <v-btn color="primary" @click="save"> Save </v-btn>
      </v-card>
    </v-dialog>
  </v-container>
</template>
