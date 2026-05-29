<script setup>
import { ref, onMounted } from "vue";
import api from "../../../plugins/api";
import { useRouter } from "vue-router";
import { useUIStore } from "../../../stores/snackBar";

const router = useRouter();
const ui = useUIStore();

const loading = ref(false);
const roles = ref([]);

const headers = [
  { title: "Role Name", key: "name" },
  { title: "Slug", key: "slug" },
  { title: "Permissions", key: "permissions_count" },
  { title: "Device Access", key: "bypass_device_restriction", sortable: false },
  { title: "Actions", key: "actions", sortable: false },
];

const fetchRoles = async () => {
  loading.value = true;

  try {
    const res = await api.get("/roles");
    roles.value = res.data.data || res.data;
  } finally {
    loading.value = false;
  }
};

const deleteRole = async (role) => {
  const ok = confirm(`Delete role "${role.name}"?`);
  if (!ok) return;

  await api.delete(`/roles/${role.id}`);
  ui.showSnackbar("Role deleted successfully");
  fetchRoles();
};

onMounted(fetchRoles);
</script>

<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">Roles</h1>
        <p class="text-grey">Create roles and assign permissions.</p>
      </div>

      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        @click="router.push({ name: 'roles.create' })"
      >
        Add Role
      </v-btn>
    </div>

    <v-card class="rounded-xl" elevation="0">
      <v-data-table :headers="headers" :items="roles" :loading="loading">
        <template #item.permissions_count="{ item }">
          <v-chip color="primary" variant="tonal" size="small">
            {{ item.permissions?.length || 0 }} Permissions
          </v-chip>
        </template>

        <template #item.bypass_device_restriction="{ item }">
          <v-chip
            v-if="item.bypass_device_restriction"
            color="success"
            size="small"
          >
            Any Device
          </v-chip>

          <v-chip v-else color="warning" size="small"> Restricted </v-chip>
        </template>

        <template #item.actions="{ item }">
          <v-btn
            icon="mdi-pencil"
            size="small"
            variant="text"
            color="primary"
            @click="
              router.push({ name: 'roles.edit', params: { id: item.id } })
            "
          />

          <v-btn
            icon="mdi-delete"
            size="small"
            variant="text"
            color="error"
            @click="deleteRole(item)"
          />
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>
