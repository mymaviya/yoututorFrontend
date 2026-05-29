<script setup>
import { ref, onMounted } from "vue";
import api from "../../../plugins/api";
import { useUIStore } from "../../../stores/snackBar";

const ui = useUIStore();

const users = ref([]);
const selectedUser = ref(null);
const loading = ref(false);
const saving = ref(false);

const ipInput = ref("");

const form = ref({
  session_timeout_minutes: 30,
  allow_multiple_sessions: false,
  allowed_ips: [],
  device_lock_enabled: false,
  max_devices: 1,
  otp_login_enabled: false,
  holiday_login_allowed: false,
});

const fetchUsers = async () => {
  const res = await api.get("/users");
  users.value = res.data.data || res.data;
};

const fetchSettings = async () => {
  if (!selectedUser.value) return;

  loading.value = true;

  try {
    const res = await api.get(`/users/${selectedUser.value}/security`);
    Object.assign(form.value, res.data);
  } finally {
    loading.value = false;
  }
};

const addIp = () => {
  if (!ipInput.value) return;

  if (!form.value.allowed_ips.includes(ipInput.value)) {
    form.value.allowed_ips.push(ipInput.value);
  }

  ipInput.value = "";
};

const removeIp = (ip) => {
  form.value.allowed_ips = form.value.allowed_ips.filter((i) => i !== ip);
};

const save = async () => {
  saving.value = true;

  try {
    await api.put(`/users/${selectedUser.value}/security`, form.value);
    ui.showSnackbar("Security settings updated successfully");
  } finally {
    saving.value = false;
  }
};

onMounted(fetchUsers);
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-h4 font-weight-bold">Security Settings</h1>
      <p class="text-grey">Manage IP, device, session and OTP restrictions.</p>
    </div>

    <v-card class="pa-5 rounded-xl" elevation="0">
      <v-select
        v-model="selectedUser"
        :items="users"
        item-title="name"
        item-value="id"
        label="Select User"
        variant="outlined"
        @update:model-value="fetchSettings"
      />

      <v-progress-linear v-if="loading" indeterminate class="mb-4" />

      <v-row v-if="selectedUser">
        <v-col cols="12" md="6">
          <v-text-field
            v-model="form.session_timeout_minutes"
            type="number"
            label="Session Timeout Minutes"
            variant="outlined"
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field
            v-model="form.max_devices"
            type="number"
            label="Maximum Trusted Devices"
            variant="outlined"
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-switch
            v-model="form.allow_multiple_sessions"
            label="Allow Multiple Sessions"
            color="primary"
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-switch
            v-model="form.device_lock_enabled"
            label="Enable Device Lock"
            color="primary"
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-switch
            v-model="form.otp_login_enabled"
            label="Enable OTP Login"
            color="primary"
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-switch
            v-model="form.holiday_login_allowed"
            label="Allow Login on Holidays"
            color="primary"
          />
        </v-col>

        <v-col cols="12">
          <div class="text-h6 font-weight-bold mb-2">Allowed IP Addresses</div>

          <div class="d-flex ga-2 mb-3">
            <v-text-field
              v-model="ipInput"
              label="Enter IP Address"
              variant="outlined"
              density="compact"
            />

            <v-btn color="primary" @click="addIp">
              Add IP
            </v-btn>
          </div>

          <div class="d-flex flex-wrap ga-2">
            <v-chip
              v-for="ip in form.allowed_ips"
              :key="ip"
              color="deep-purple"
              variant="tonal"
              closable
              @click:close="removeIp(ip)"
            >
              {{ ip }}
            </v-chip>
          </div>
        </v-col>
      </v-row>

      <v-btn
        v-if="selectedUser"
        color="primary"
        class="mt-4"
        :loading="saving"
        @click="save"
      >
        Save Security Settings
      </v-btn>
    </v-card>
  </div>
</template>