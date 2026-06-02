<script setup>
import { ref, onMounted } from "vue";
import api from "../../../plugins/api";
import { useUIStore } from "../../../stores/snackBar";

const ui = useUIStore();

const loading = ref(false);
const saving = ref(false);

const roles = ref([]);
const permissions = ref([]);
const users = ref([]);

const selectedRole = ref(null);
const selectedUser = ref(null);

const rolePermissions = ref([]);
const userPermissions = ref([]);

const permissionDialog = ref(false);
const editPermission = ref(false);

const permissionForm = ref({
  id: null,
  name: "",
  slug: "",
});

const generateSlug = (value) => {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
};

const openAddPermission = () => {
  permissionForm.value = {
    id: null,
    name: "",
    slug: "",
  };

  editPermission.value = false;
  permissionDialog.value = true;
};

const openEditPermission = (permission) => {
  permissionForm.value = { ...permission };

  editPermission.value = true;
  permissionDialog.value = true;
};

const savePermission = async () => {
  try {
    if (editPermission.value) {
      await api.put(
        `/permissions/${permissionForm.value.id}`,
        permissionForm.value
      );
    } else {
      await api.post(
        "/permissions",
        permissionForm.value
      );
    }

    await fetchData();

    permissionDialog.value = false;

    ui.showSnackbar(
      "Permission saved successfully",
      "success"
    );
  } catch (e) {
    ui.showSnackbar(
      e.response?.data?.message ||
      "Unable to save permission",
      "error"
    );
  }
};

const deletePermission = async (permission) => {
  if (
    !confirm(
      `Delete ${permission.name}?`
    )
  ) return;

  await api.delete(
    `/permissions/${permission.id}`
  );

  await fetchData();

  ui.showSnackbar(
    "Permission deleted successfully",
    "success"
  );
};

const fetchData = async () => {
  loading.value = true;

  try {
    const [roleRes, permissionRes, userRes] = await Promise.all([
      api.get("/roles"),
      api.get("/permissions"),
      api.get("/users"),
    ]);

    roles.value = roleRes.data.data || roleRes.data;
    permissions.value = permissionRes.data.data || permissionRes.data;
    users.value = userRes.data.data || userRes.data;
  } finally {
    loading.value = false;
  }
};

const fetchRolePermissions = async () => {
  if (!selectedRole.value) return;

  const res = await api.get(`/roles/${selectedRole.value}/permissions`);
  rolePermissions.value = res.data.permissions || [];
};

const fetchUserPermissions = async () => {
  if (!selectedUser.value) return;

  const res = await api.get(`/users/${selectedUser.value}/permissions`);
  userPermissions.value = res.data.permissions || [];
};

const saveRolePermissions = async () => {
  saving.value = true;

  try {
    await api.post(`/roles/${selectedRole.value}/permissions`, {
      permissions: rolePermissions.value,
    });

    ui.showSnackbar("Role permissions updated successfully");
  } finally {
    saving.value = false;
  }
};

const saveUserPermissions = async () => {
  saving.value = true;

  try {
    await api.post(`/users/${selectedUser.value}/permissions`, {
      permissions: userPermissions.value,
    });

    ui.showSnackbar("User permissions updated successfully");
  } finally {
    saving.value = false;
  }
};

onMounted(fetchData);
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-h4 font-weight-bold">Permission Management</h1>
      <p class="text-grey">
        Manage role-based and user-specific permissions.
      </p>
    </div>

    <v-progress-linear v-if="loading" indeterminate class="mb-4" />

    <v-card class="mb-6 rounded-xl" elevation="0">
  <v-card-title
    class="d-flex justify-space-between"
  >
    <span>Permissions</span>

    <v-btn
      color="primary"
      prepend-icon="mdi-plus"
      @click="openAddPermission"
    >
      Add Permission
    </v-btn>
  </v-card-title>

  <v-data-table
    :items="permissions"
    :headers="[
      { title:'Name', key:'name' },
      { title:'Slug', key:'slug' },
      { title:'Actions', key:'actions' }
    ]"
  >
    <template #item.actions="{ item }">
      <v-btn
        icon="mdi-pencil"
        variant="text"
        color="primary"
        @click="openEditPermission(item)"
      />

      <v-btn
        icon="mdi-delete"
        variant="text"
        color="error"
        @click="deletePermission(item)"
      />
    </template>
  </v-data-table>
</v-card>

    <v-row>
      <v-col cols="12" md="6">
        <v-card class="pa-4 rounded-xl" elevation="0">
          <div class="text-h6 font-weight-bold mb-4">
            Role Permissions
          </div>

          <v-select
            v-model="selectedRole"
            :items="roles"
            item-title="name"
            item-value="id"
            label="Select Role"
            variant="outlined"
            @update:model-value="fetchRolePermissions"
          />

          <v-divider class="my-4" />

          <v-row>
            <v-col
              v-for="permission in permissions"
              :key="permission.id"
              cols="12"
              md="6"
            >
              <v-checkbox
                v-model="rolePermissions"
                :label="permission.name"
                :value="permission.slug"
                color="primary"
                hide-details
              />
            </v-col>
          </v-row>

          <v-btn
            color="primary"
            class="mt-4"
            :loading="saving"
            :disabled="!selectedRole"
            @click="saveRolePermissions"
          >
            Save Role Permissions
          </v-btn>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card class="pa-4 rounded-xl" elevation="0">
          <div class="text-h6 font-weight-bold mb-4">
            User Permissions
          </div>

          <v-select
            v-model="selectedUser"
            :items="users"
            item-title="name"
            item-value="id"
            label="Select User"
            variant="outlined"
            @update:model-value="fetchUserPermissions"
          />

          <v-divider class="my-4" />

          <v-row>
            <v-col
              v-for="permission in permissions"
              :key="permission.id"
              cols="12"
              md="6"
            >
              <v-checkbox
                v-model="userPermissions"
                :label="permission.name"
                :value="permission.slug"
                color="success"
                hide-details
              />
            </v-col>
          </v-row>

          <v-btn
            color="success"
            class="mt-4"
            :loading="saving"
            :disabled="!selectedUser"
            @click="saveUserPermissions"
          >
            Save User Permissions
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
    <v-dialog
  v-model="permissionDialog"
  max-width="600"
>
  <v-card>
    <v-card-title>
      {{
        editPermission
          ? "Edit Permission"
          : "Add Permission"
      }}
    </v-card-title>

    <v-card-text>
      <v-text-field
        v-model="permissionForm.name"
        label="Permission Name"
        variant="outlined"
        @update:model-value="
          permissionForm.slug =
          generateSlug($event)
        "
      />

      <v-text-field
        v-model="permissionForm.slug"
        label="Permission Slug"
        variant="outlined"
      />
    </v-card-text>

    <v-card-actions>
      <v-spacer />

      <v-btn
        variant="text"
        @click="permissionDialog = false"
      >
        Cancel
      </v-btn>

      <v-btn
        color="primary"
        @click="savePermission"
      >
        Save
      </v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>
  </div>
</template>