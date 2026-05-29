<script setup>
import { ref, onMounted } from "vue";
import api from "../../../plugins/api";
import { useUIStore } from "../../../stores/snackBar";

const ui = useUIStore();

const holidays = ref([]);
const loading = ref(false);
const saving = ref(false);

const form = ref({
  id: null,
  title: "",
  date: "",
  is_active: true,
});

const headers = [
  { title: "Date", key: "date" },
  { title: "Holiday", key: "title" },
  { title: "Status", key: "is_active" },
  { title: "Actions", key: "actions", sortable: false },
];

const fetchHolidays = async () => {
  loading.value = true;

  try {
    const res = await api.get("/login-holidays");
    holidays.value = res.data.data || res.data;
  } finally {
    loading.value = false;
  }
};

const save = async () => {
  saving.value = true;

  try {
    if (form.value.id) {
      await api.put(`/login-holidays/${form.value.id}`, form.value);
      ui.showSnackbar("Holiday updated successfully");
    } else {
      await api.post("/login-holidays", form.value);
      ui.showSnackbar("Holiday added successfully");
    }

    form.value = {
      id: null,
      title: "",
      date: "",
      is_active: true,
    };

    fetchHolidays();
  } finally {
    saving.value = false;
  }
};

const editHoliday = (item) => {
  form.value = { ...item };
};

const deleteHoliday = async (item) => {
  await api.delete(`/login-holidays/${item.id}`);
  ui.showSnackbar("Holiday deleted successfully");
  fetchHolidays();
};

onMounted(fetchHolidays);
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-h4 font-weight-bold">Login Holidays</h1>
      <p class="text-grey">Block logins on selected holidays.</p>
    </div>

    <v-row>
      <v-col cols="12" md="4">
        <v-card class="pa-4 rounded-xl" elevation="0">
          <v-text-field
            v-model="form.title"
            label="Holiday Name"
            variant="outlined"
          />

          <v-text-field
            v-model="form.date"
            type="date"
            label="Date"
            variant="outlined"
          />

          <v-switch
            v-model="form.is_active"
            label="Active"
            color="primary"
          />

          <v-btn color="primary" block :loading="saving" @click="save">
            {{ form.id ? "Update Holiday" : "Add Holiday" }}
          </v-btn>
        </v-card>
      </v-col>

      <v-col cols="12" md="8">
        <v-card class="rounded-xl" elevation="0">
          <v-data-table
            :headers="headers"
            :items="holidays"
            :loading="loading"
          >
            <template #item.is_active="{ item }">
              <v-chip
                :color="item.is_active ? 'success' : 'error'"
                variant="tonal"
              >
                {{ item.is_active ? "Active" : "Inactive" }}
              </v-chip>
            </template>

            <template #item.actions="{ item }">
              <v-btn
                icon="mdi-pencil"
                variant="text"
                color="primary"
                @click="editHoliday(item)"
              />

              <v-btn
                icon="mdi-delete"
                variant="text"
                color="error"
                @click="deleteHoliday(item)"
              />
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>