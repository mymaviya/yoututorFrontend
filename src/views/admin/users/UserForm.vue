<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "../../../plugins/api";
import { useUIStore } from "../../../stores/snackBar";

const route = useRoute();
const router = useRouter();
const ui = useUIStore();

const isEdit = computed(() => !!route.params.id);

const loading = ref(false);
const saving = ref(false);

const roles = ref([]);

const errors = ref({});

const form = ref({
  name: "",
  email: "",
  password: "",
  contact: "",
  address: "",
  role_id: null,

  login_enabled: true,

  login_start_date: new Date()
    .toISOString()
    .split("T")[0],

  login_end_date: "",

  daily_login_start_time: "09:00",

  daily_login_end_time: "17:00",

  is_active: true,
});

const fetchRoles = async () => {
  const res = await api.get("/roles");
  roles.value = res.data.data || res.data;
};

const fetchUser = async () => {
  if (!isEdit.value) return;

  loading.value = true;

  try {
    const res = await api.get(`/users/${route.params.id}`);

    const user = res.data.data || res.data;

    Object.assign(form.value, {
      name: user.name,
      email: user.email,
      contact: user.contact,
      address: user.address,
      role_id: user.role_id,

      login_enabled: Boolean(user.login_enabled),

      login_start_date:
        user.login_start_date ||
        new Date().toISOString().split("T")[0],

      login_end_date: user.login_end_date || "",

      daily_login_start_time:
        user.daily_login_start_time || "09:00",

      daily_login_end_time:
        user.daily_login_end_time || "17:00",

      is_active: Boolean(user.is_active),
    });
  } finally {
    loading.value = false;
  }
};

const save = async () => {
  errors.value = {};
  saving.value = true;

  try {
    const payload = {
      ...form.value,
    };

    if (!payload.password) {
      delete payload.password;
    }

    if (isEdit.value) {
      await api.put(`/users/${route.params.id}`, payload);

      ui.showSnackbar("User updated successfully");
    } else {
      await api.post("/users", payload);

      ui.showSnackbar("User created successfully");
    }

    router.push({ name: "users.index" });
  } catch (err) {
    if (err.response?.status === 422) {
      errors.value = err.response.data.errors || {};
    }

    ui.showSnackbar(
      err.response?.data?.message ||
        "Failed to save user",
      "error",
    );
  } finally {
    saving.value = false;
  }
};

onMounted(async () => {
  await fetchRoles();
  await fetchUser();
});
</script>

<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">
          {{ isEdit ? "Edit User" : "Create User" }}
        </h1>

        <p class="text-grey">
          Manage login access and permissions.
        </p>
      </div>

      <v-btn variant="outlined" @click="router.back()">
        Back
      </v-btn>
    </div>

    <v-progress-linear
      v-if="loading"
      indeterminate
      class="mb-4"
    />

    <v-card class="pa-5 rounded-xl" elevation="0">
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="form.name"
            label="Full Name"
            variant="outlined"
            :error-messages="errors.name"
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field
            v-model="form.email"
            label="Email"
            type="email"
            variant="outlined"
            :error-messages="errors.email"
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field
            v-model="form.password"
            label="Password"
            type="password"
            variant="outlined"
            :hint="isEdit ? 'Leave blank to keep existing password' : ''"
            persistent-hint
            :error-messages="errors.password"
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-select
            v-model="form.role_id"
            :items="roles"
            item-title="name"
            item-value="id"
            label="Role"
            variant="outlined"
            :error-messages="errors.role_id"
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field
            v-model="form.contact"
            label="Contact"
            variant="outlined"
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-switch
            v-model="form.is_active"
            label="Active User"
            color="success"
          />
        </v-col>

        <v-col cols="12">
          <v-textarea
            v-model="form.address"
            label="Address"
            rows="2"
            variant="outlined"
          />
        </v-col>
      </v-row>

      <v-divider class="my-6" />

      <div class="d-flex align-center justify-space-between mb-4">
        <div>
          <div class="text-h6 font-weight-bold">
            Login Access Control
          </div>

          <div class="text-caption text-grey">
            Restrict login date and time.
          </div>
        </div>

        <v-switch
          v-model="form.login_enabled"
          label="Login Enabled"
          color="primary"
        />
      </div>

      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="form.login_start_date"
            type="date"
            label="Login Start Date"
            variant="outlined"
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field
            v-model="form.login_end_date"
            type="date"
            label="Login End Date"
            variant="outlined"
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field
            v-model="form.daily_login_start_time"
            type="time"
            label="Daily Login Start Time"
            variant="outlined"
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field
            v-model="form.daily_login_end_time"
            type="time"
            label="Daily Login End Time"
            variant="outlined"
          />
        </v-col>
      </v-row>

      <v-card-actions class="px-0 mt-6">
        <v-spacer />

        <v-btn variant="text" @click="router.back()">
          Cancel
        </v-btn>

        <v-btn
          color="primary"
          :loading="saving"
          @click="save"
        >
          {{ isEdit ? "Update User" : "Create User" }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>