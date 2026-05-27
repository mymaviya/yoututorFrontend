<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "../../../plugins/api";
import { useUIStore } from "../../../stores/snackBar";

const router = useRouter();
const ui = useUIStore();

const loading = ref(false);
const users = ref([]);
const selectedUsers = ref([]);
const bulkDialog = ref(false);
const bulkSaving = ref(false);

const bulkForm = ref({
  login_enabled: true,
  login_start_date: new Date().toISOString().split("T")[0],
  login_end_date: "",
  daily_login_start_time: "09:00",
  daily_login_end_time: "17:00",
});

const headers = [
  { title: "Name", key: "name" },
  { title: "Email", key: "email" },
  { title: "Role", key: "role_name" },
  { title: "Login Access", key: "login" },
  { title: "Date Limit", key: "date_limit" },
  { title: "Daily Time", key: "daily_time" },
  { title: "Status", key: "status" },
  { title: "Actions", key: "actions", sortable: false },
];

const openBulkDialog = () => {
  if (!selectedUsers.value.length) {
    ui.showSnackbar("Please select users first", "warning");
    return;
  }

  bulkDialog.value = true;
};

const updateBulkLoginAccess = async () => {
  bulkSaving.value = true;

  try {
    await api.post("/users/bulk-login-access", {
      user_ids: selectedUsers.value,
      ...bulkForm.value,
    });

    ui.showSnackbar("Login access updated successfully");

    bulkDialog.value = false;
    selectedUsers.value = [];

    fetchUsers();
  } catch (err) {
    ui.showSnackbar(
      err.response?.data?.message || "Failed to update login access",
      "error",
    );
  } finally {
    bulkSaving.value = false;
  }
};

const fetchUsers = async () => {
  loading.value = true;

  try {
    const res = await api.get("/users");
    users.value = res.data.data || res.data;
  } finally {
    loading.value = false;
  }
};

const deleteUser = async (user) => {
  const ok = confirm(`Delete ${user.name}?`);

  if (!ok) return;

  await api.delete(`/users/${user.id}`);

  ui.showSnackbar("User deleted successfully");

  fetchUsers();
};

onMounted(fetchUsers);
</script>

<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">Users</h1>

        <p class="text-grey">Manage system users and login access.</p>
      </div>
      <v-spacer />
      <v-btn
        color="deep-purple"
        class="me-2"
        prepend-icon="mdi-clock-edit"
        @click="openBulkDialog"
      >
        Set Login Time
      </v-btn>

      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        @click="router.push({ name: 'users.create' })"
      >
        Add User
      </v-btn>
    </div>

    <v-card class="rounded-xl" elevation="0">
      <v-data-table
        v-model="selectedUsers"
        show-select
        item-value="id"
        :headers="headers"
        :items="users"
        :loading="loading"
      >
        <template #item.role_name="{ item }">
          <v-chip color="primary" variant="tonal">
            {{ item.role?.name || "No Role" }}
          </v-chip>
        </template>

        <template #item.login="{ item }">
          <v-chip
            :color="item.login_enabled ? 'success' : 'error'"
            variant="tonal"
          >
            {{ item.login_enabled ? "Enabled" : "Disabled" }}
          </v-chip>
        </template>

        <template #item.status="{ item }">
          <v-chip :color="item.is_active ? 'success' : 'error'" variant="tonal">
            {{ item.is_active ? "Active" : "Inactive" }}
          </v-chip>
        </template>

        <template #item.date_limit="{ item }">
          <div class="text-caption">
            {{ item.login_start_date || "-" }}
            to
            {{ item.login_end_date || "No End" }}
          </div>
        </template>

        <template #item.daily_time="{ item }">
          <v-chip size="small" color="info" variant="tonal">
            {{ item.daily_login_start_time || "--:--" }}
            -
            {{ item.daily_login_end_time || "--:--" }}
          </v-chip>
        </template>

        <template #item.actions="{ item }">
          <v-btn
            icon="mdi-pencil"
            variant="text"
            color="primary"
            @click="
              router.push({
                name: 'users.edit',
                params: { id: item.id },
              })
            "
          />

          <v-btn
            icon="mdi-delete"
            variant="text"
            color="error"
            @click="deleteUser(item)"
          />
        </template>
      </v-data-table>
    </v-card>
    <v-dialog v-model="bulkDialog" max-width="650">
      <v-card class="rounded-xl">
        <v-card-title>
          Set Login Access for {{ selectedUsers.length }} Users
        </v-card-title>

        <v-card-text>
          <v-switch
            v-model="bulkForm.login_enabled"
            label="Login Enabled"
            color="primary"
          />

          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="bulkForm.login_start_date"
                type="date"
                label="Login Start Date"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="bulkForm.login_end_date"
                type="date"
                label="Login End Date"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="bulkForm.daily_login_start_time"
                type="time"
                label="Daily Login Start Time"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="bulkForm.daily_login_end_time"
                type="time"
                label="Daily Login End Time"
                variant="outlined"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn variant="text" @click="bulkDialog = false"> Cancel </v-btn>

          <v-btn
            color="primary"
            :loading="bulkSaving"
            @click="updateBulkLoginAccess"
          >
            Update Access
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
