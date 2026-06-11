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

const form = ref({
  id: null,
  name: "",
});

const fetchGrades = async () => {
  loading.value = true;

  try {
    const res = await api.get("/grades");
    grades.value = res.data.data || res.data;
  } catch (err) {
    ui.showSnackbar("Failed to fetch Grades", "error");
  } finally {
    loading.value = false;
  }
};

const openAdd = () => {
  form.value = {
    id: null,
    name: "",
  };

  errors.value = {};
  editMode.value = false;
  dialog.value = true;
};

const openEdit = (item) => {
  form.value = {
    id: item.id,
    name: item.name,
  };

  errors.value = {};
  editMode.value = true;
  dialog.value = true;
};

const save = async () => {
  errors.value = {};

  try {
    const payload = {
      name: form.value.name,
    };

    if (editMode.value) {
      await api.put(`/grades/${form.value.id}`, payload);
      ui.showSnackbar("Grade updated successfully");
    } else {
      await api.post("/grades", payload);
      ui.showSnackbar("Grade added successfully");
    }

    dialog.value = false;
    fetchGrades();
  } catch (err) {
    if (err.response?.status === 422) {
      errors.value = err.response.data.errors || {};
    } else {
      ui.showSnackbar("Failed to save grade", "error");
    }
  }
};

const deleteItem = async (id) => {
  const ok = await ui.confirmDialog(
    "Delete",
    "Are you sure you want to delete this grade?"
  );

  if (!ok) return;

  try {
    await api.delete(`/grades/${id}`);
    ui.showSnackbar("Deleted successfully");
    fetchGrades();
  } catch (error) {
    ui.showSnackbar("Failed to delete grade", "error");
  }
};

const updateStatus = async (id) => {
  try {
    await api.post(`/grade_status/${id}`);
    ui.showSnackbar("Status updated successfully");
    fetchGrades();
  } catch (error) {
    ui.showSnackbar("Failed to update status", "error");
  }
};

function getColor(val) {
  return val ? "success" : "error";
}

onMounted(fetchGrades);
</script>

<template>
  <v-container>
    <v-card class="pa-4">
      <div class="d-flex justify-space-between mb-3">
        <h3>Grades</h3>

        <v-btn color="primary" @click="openAdd">
          Add Grade
        </v-btn>
      </div>

      <AppDataTable
        v-if="!loading"
        :headers="[
          { title: 'ID', key: 'id' },
          { title: 'Grade', key: 'name' },
          { title: 'Status', key: 'is_active' },
          { title: 'Actions', key: 'actions', align: 'end', sortable: false },
        ]"
        :items="grades"
      >
        <template #item.is_active="{ item }">
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
          />
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex ga-2 justify-end">
            <v-icon
              color="medium-emphasis"
              icon="mdi-pencil"
              size="small"
              @click="openEdit(item)"
            />

            <v-icon
              color="red"
              icon="mdi-delete"
              size="small"
              @click="deleteItem(item.id)"
            />
          </div>
        </template>
      </AppDataTable>

      <div v-else class="pa-4">
        <v-skeleton-loader type="table-heading, table-tbody, table-tfoot" />
      </div>
    </v-card>

    <v-dialog v-model="dialog" max-width="400">
      <v-card class="pa-4">
        <h4 class="mb-3">
          {{ editMode ? "Edit Grade" : "Add Grade" }}
        </h4>

        <v-text-field
          v-model="form.name"
          label="Grade"
          placeholder="Example: Grade 1"
          :error-messages="errors.name"
        />

        <div class="d-flex justify-end ga-2">
          <v-btn variant="text" @click="dialog = false">
            Cancel
          </v-btn>

          <v-btn color="primary" @click="save">
            Save
          </v-btn>
        </div>
      </v-card>
    </v-dialog>
  </v-container>
</template>