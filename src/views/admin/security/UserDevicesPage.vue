<script setup>
import { ref, onMounted } from "vue";
import api from "../../../plugins/api";
import { useUIStore } from "../../../stores/snackBar";

const ui = useUIStore();

const devices = ref([]);
const loading = ref(false);

const headers = [
  { title: "User", key: "user" },
  { title: "Device", key: "device_name" },
  { title: "Browser", key: "browser" },
  { title: "Platform", key: "platform" },
  { title: "IP", key: "ip_address" },
  { title: "Trusted", key: "is_trusted" },
  { title: "Last Used", key: "last_used_at" },
  { title: "Actions", key: "actions", sortable: false },
];

const fetchDevices = async () => {
  loading.value = true;

  try {
    const res = await api.get("/user-devices");
    devices.value = res.data.data || res.data;
  } finally {
    loading.value = false;
  }
};

const trustDevice = async (device) => {
  await api.post(`/user-devices/${device.id}/trust`);
  ui.showSnackbar("Device trusted");
  fetchDevices();
};

const blockDevice = async (device) => {
  await api.post(`/user-devices/${device.id}/block`);
  ui.showSnackbar("Device blocked");
  fetchDevices();
};

const deleteDevice = async (device) => {
  await api.delete(`/user-devices/${device.id}`);
  ui.showSnackbar("Device removed");
  fetchDevices();
};

onMounted(fetchDevices);
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-h4 font-weight-bold">User Devices</h1>
      <p class="text-grey">Track browsers, devices and IPs used for login.</p>
    </div>

    <v-card class="rounded-xl" elevation="0">
      <v-data-table
        :headers="headers"
        :items="devices"
        :loading="loading"
      >
        <template #item.user="{ item }">
          <div>
            <div class="font-weight-bold">{{ item.user?.name }}</div>
            <div class="text-caption text-grey">{{ item.user?.email }}</div>
          </div>
        </template>

        <template #item.is_trusted="{ item }">
          <v-chip
            :color="item.is_trusted ? 'success' : 'error'"
            variant="tonal"
          >
            {{ item.is_trusted ? "Trusted" : "Blocked" }}
          </v-chip>
        </template>

        <template #item.actions="{ item }">
          <v-btn
            v-if="!item.is_trusted"
            icon="mdi-shield-check"
            variant="text"
            color="success"
            @click="trustDevice(item)"
          />

          <v-btn
            v-if="item.is_trusted"
            icon="mdi-shield-off"
            variant="text"
            color="warning"
            @click="blockDevice(item)"
          />

          <v-btn
            icon="mdi-delete"
            variant="text"
            color="error"
            @click="deleteDevice(item)"
          />
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>