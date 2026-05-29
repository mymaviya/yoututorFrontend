<script setup>
import { ref, onMounted, computed } from "vue";
import api from "../../../plugins/api";
import * as XLSX from "xlsx";

const loading = ref(false);

const logs = ref([]);

const expanded = ref([]);

const filters = ref({
  module: null,
  action: null,
  user_id: null,
  search: "",
});

const users = ref([]);

const modules = [
  "Authentication",
  "Questions",
  "Users",
  "Security",
  "Holiday",
  "Roles",
  "Papers",
];

const actions = [
  "Login",
  "Logout",
  "Failed Login",
  "Create",
  "Update",
  "Delete",
  "Approve",
  "Reject",
];

const headers = [
  { title: "Timeline", key: "timeline", sortable: false },
  { title: "User", key: "user" },
  { title: "Module", key: "module" },
  { title: "Action", key: "action" },
  { title: "IP Address", key: "ip_address" },
  { title: "Device", key: "device" },
  { title: "Date", key: "created_at" },
];

const fetchUsers = async () => {
  const res = await api.get("/users");

  users.value = res.data.data || res.data;
};

const fetchLogs = async () => {
  loading.value = true;

  try {
    const res = await api.get("/audit-logs", {
      params: {
        module: filters.value.module,
        action: filters.value.action,
        user_id: filters.value.user_id,
        search: filters.value.search,
      },
    });

    logs.value = res.data.data || res.data;
  } finally {
    loading.value = false;
  }
};

const filteredLogs = computed(() => {
  return logs.value.filter((log) => {
    if (
      filters.value.search &&
      !JSON.stringify(log)
        .toLowerCase()
        .includes(filters.value.search.toLowerCase())
    ) {
      return false;
    }

    return true;
  });
});

const formatDate = (date) => {
  return new Date(date).toLocaleString();
};

const profileUrl = (profile) => {
  if (!profile) return null;

  if (profile.startsWith("http")) {
    return profile;
  }

  const baseUrl = import.meta.env.VITE_API_BASE_URL.replace("/api", "");

  return `${baseUrl}/storage/${profile}`;
};

const exportCSV = () => {
  const data = filteredLogs.value.map((log) => ({
    User: log.user?.name,
    Email: log.user?.email,
    Module: log.module,
    Action: log.action,
    Description: log.description,
    IP: log.ip_address,
    Browser: log.browser,
    Platform: log.platform,
    Date: formatDate(log.created_at),
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Audit Logs");

  XLSX.writeFile(workbook, "audit_logs.xlsx");
};

const chipColor = (action) => {
  switch (action) {
    case "Login":
      return "success";

    case "Logout":
      return "grey";

    case "Failed Login":
      return "error";

    case "Create":
      return "primary";

    case "Update":
      return "warning";

    case "Delete":
      return "error";

    case "Approve":
      return "success";

    case "Reject":
      return "deep-orange";

    default:
      return "primary";
  }
};

onMounted(async () => {
  await fetchUsers();

  await fetchLogs();
});
</script>

<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">Audit Logs</h1>

        <p class="text-grey">
          Track user activities, security events, device access and changes.
        </p>
      </div>

      <v-btn color="success" prepend-icon="mdi-file-excel" @click="exportCSV">
        Export CSV
      </v-btn>
    </div>

    <!-- FILTERS -->

    <v-card class="pa-4 rounded-xl mb-5" elevation="0">
      <v-row>
        <v-col cols="12" md="3">
          <v-select
            v-model="filters.module"
            :items="modules"
            label="Module"
            clearable
            variant="outlined"
            density="comfortable"
            @update:model-value="fetchLogs"
          />
        </v-col>

        <v-col cols="12" md="3">
          <v-select
            v-model="filters.action"
            :items="actions"
            label="Action"
            clearable
            variant="outlined"
            density="comfortable"
            @update:model-value="fetchLogs"
          />
        </v-col>

        <v-col cols="12" md="3">
          <v-select
            v-model="filters.user_id"
            :items="users"
            item-title="name"
            item-value="id"
            label="User"
            clearable
            variant="outlined"
            density="comfortable"
            @update:model-value="fetchLogs"
          />
        </v-col>

        <v-col cols="12" md="3">
          <v-text-field
            v-model="filters.search"
            label="Search Logs"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="comfortable"
          />
        </v-col>
      </v-row>
    </v-card>

    <!-- TIMELINE UI -->

    <v-card class="rounded-xl pa-4" elevation="0">
        <div class="audit-scroll">
      <v-timeline side="end" class="pa-2">
        <v-timeline-item
          v-for="log in filteredLogs"
          :key="log.id"
          dot-color="primary"
          size="small"
        >
          <template v-slot:icon>
            <v-avatar size="42">
              <v-img
                v-if="profileUrl(log.user?.profile)"
                :src="profileUrl(log.user?.profile)"
              />
              <span v-else class="text-caption font-weight-bold">
                {{ (log.user?.name || "S").charAt(0).toUpperCase() }}
              </span>
            </v-avatar>
          </template>
          <template v-slot:opposite>
            <v-chip
              color="blue"
              variant="tonal"
              size="small"
              prepend-icon="mdi-calendar-clock"
            >
              {{ formatDate(log.created_at) }}
           </v-chip>
          </template>

          <v-card class="rounded-xl audit-card" elevation="1">
            <v-card-text>
              <div
                class="d-flex justify-space-between align-start flex-wrap ga-3"
              >
                <div>
                  <div class="font-weight-bold text-subtitle-1">
                    {{ log.user?.name || "System" }}
                  </div>

                  <div class="text-caption text-grey">
                    {{ log.user?.email || "-" }}
                  </div>
                </div>

                <div class="d-flex flex-wrap ga-2">
                  <v-chip color="primary" variant="tonal" size="small">
                    {{ log.module }}
                  </v-chip>

                  <v-chip
                    :color="chipColor(log.action)"
                    variant="flat"
                    size="small"
                  >
                    {{ log.action }}
                  </v-chip>
                </div>
              </div>

              <div class="mt-4">
                {{ log.description }}
              </div>

              <!-- DEVICE/IP -->

              <v-row class="mt-2">
                <v-col cols="12" md="4">
                  <v-sheet class="pa-3 rounded-lg" color="grey-lighten-4">
                    <div class="text-caption text-grey">IP Address</div>

                    <div class="font-weight-bold">
                      {{ log.ip_address || "-" }}
                    </div>
                  </v-sheet>
                </v-col>

                <v-col cols="12" md="4">
                  <v-sheet class="pa-3 rounded-lg" color="grey-lighten-4">
                    <div class="text-caption text-grey">Browser</div>

                    <div class="font-weight-bold">
                      {{ log.browser || "-" }}
                    </div>
                  </v-sheet>
                </v-col>

                <v-col cols="12" md="4">
                  <v-sheet class="pa-3 rounded-lg" color="grey-lighten-4">
                    <div class="text-caption text-grey">Platform</div>

                    <div class="font-weight-bold">
                      {{ log.platform || "-" }}
                    </div>
                  </v-sheet>
                </v-col>
              </v-row>

              <!-- EXPANSION -->

              <div class="mt-4">
                <v-expansion-panels variant="accordion">
                  <v-expansion-panel>
                    <v-expansion-panel-title>
                      View JSON Changes
                    </v-expansion-panel-title>

                    <v-expansion-panel-text>
                      <v-row>
                        <v-col cols="12" md="6">
                          <div class="font-weight-bold mb-2">Old Values</div>

                          <pre class="json-box">{{
                            JSON.stringify(log.old_values, null, 2)
                          }}</pre>
                        </v-col>

                        <v-col cols="12" md="6">
                          <div class="font-weight-bold mb-2">New Values</div>

                          <pre class="json-box">{{
                            JSON.stringify(log.new_values, null, 2)
                          }}</pre>
                        </v-col>
                      </v-row>

                      <div class="mt-4 text-caption text-grey">
                        User Agent:
                        {{ log.user_agent || "-" }}
                      </div>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>
              </div>
            </v-card-text>
          </v-card>
        </v-timeline-item>
      </v-timeline>
        </div>
    </v-card>
  </div>
</template>

<style scoped>
.json-box {
  background: #111827;
  color: #d1d5db;
  padding: 14px;
  border-radius: 12px;
  font-size: 12px;
  max-height: 350px;
  overflow: auto;
}

.audit-card {
  min-width: 900px;
}

@media (max-width: 960px) {
  .audit-card {
    min-width: 100%;
  }
}
.audit-scroll {
  max-height: calc(100vh - 220px);
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 10px;
}

/* Beautiful scrollbar */

.audit-scroll::-webkit-scrollbar {
  width: 8px;
}

.audit-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.audit-scroll::-webkit-scrollbar-thumb {
  background: rgba(100, 100, 100, 0.35);
  border-radius: 10px;
}

.audit-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(100, 100, 100, 0.6);
}
</style>
