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
const permissions = ref([]);
const errors = ref({});

const form = ref({
  name: "",
  slug: "",
  permissions: [],
});

const generateSlug = () => {
  if (isEdit.value) return;

  form.value.slug = form.value.name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
};

const fetchPermissions = async () => {
  const res = await api.get("/permissions");
  permissions.value = res.data.data || res.data;
};

const fetchRole = async () => {
  if (!isEdit.value) return;

  loading.value = true;

  try {
    const res = await api.get(`/roles/${route.params.id}`);
    const role = res.data.data || res.data;

    form.value.name = role.name;
    form.value.slug = role.slug;
    form.value.permissions = (role.permissions || []).map((p) => p.slug);
  } finally {
    loading.value = false;
  }
};

const saveRole = async () => {
  errors.value = {};
  saving.value = true;

  try {
    const payload = {
      name: form.value.name,
      slug: form.value.slug,
      permissions: form.value.permissions,
    };

    if (isEdit.value) {
      await api.put(`/roles/${route.params.id}`, payload);
      ui.showSnackbar("Role updated successfully");
    } else {
      await api.post("/roles", payload);
      ui.showSnackbar("Role created successfully");
    }

    router.push({ name: "roles.index" });
  } catch (err) {
    if (err.response?.status === 422) {
      errors.value = err.response.data.errors || {};
      ui.showSnackbar(
        Object.values(errors.value).flat()[0] || "Validation failed",
        "error",
      );
    } else {
      ui.showSnackbar("Failed to save role", "error");
    }
  } finally {
    saving.value = false;
  }
};

const permissionGroups = computed(() => {
  const groups = {};

  permissions.value.forEach((permission) => {
    const group = permission.slug.split("_").pop();

    const groupNameMap = {
      dashboard: "Dashboard",
      analytics: "Analytics",
      teachers: "Teachers",
      questions: "Questions",
      bank: "Question Bank",
      types: "Question Types",
      blueprints: "Blueprints",
      papers: "Papers",
      exams: "Exams",
      students: "Students",
      notifications: "Notifications",
      roles: "Roles",
      permissions: "Permissions",
    };

    const label = groupNameMap[group] || "Others";

    if (!groups[label]) {
      groups[label] = [];
    }

    groups[label].push(permission);
  });

  return groups;
});

const isPermissionSelected = (slug) => {
  return form.value.permissions.includes(slug);
};

const togglePermission = (slug) => {
  if (isPermissionSelected(slug)) {
    form.value.permissions = form.value.permissions.filter((p) => p !== slug);
  } else {
    form.value.permissions.push(slug);
  }
};

const selectAllPermissions = () => {
  form.value.permissions = permissions.value.map((p) => p.slug);
};

const clearAllPermissions = () => {
  form.value.permissions = [];
};

const toggleGroupPermissions = (groupPermissions) => {
  const slugs = groupPermissions.map((p) => p.slug);

  const allSelected = slugs.every((slug) =>
    form.value.permissions.includes(slug),
  );

  if (allSelected) {
    form.value.permissions = form.value.permissions.filter(
      (slug) => !slugs.includes(slug),
    );
  } else {
    form.value.permissions = [
      ...new Set([...form.value.permissions, ...slugs]),
    ];
  }
};

const isGroupSelected = (groupPermissions) => {
  return groupPermissions.every((p) => form.value.permissions.includes(p.slug));
};

onMounted(async () => {
  await fetchPermissions();
  await fetchRole();
});
</script>

<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">
          {{ isEdit ? "Edit Role" : "Create Role" }}
        </h1>

        <p class="text-grey">Assign permissions to control user access.</p>
      </div>

      <v-btn variant="outlined" @click="router.back()"> Back </v-btn>
    </div>

    <v-progress-linear v-if="loading" indeterminate class="mb-4" />

    <v-card class="pa-5 rounded-xl" elevation="0">
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="form.name"
            label="Role Name"
            variant="outlined"
            :error-messages="errors.name"
            @input="generateSlug"
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field
            v-model="form.slug"
            label="Role Slug"
            variant="outlined"
            :error-messages="errors.slug"
          />
        </v-col>
      </v-row>

      <v-divider class="my-4" />

      <div class="d-flex justify-space-between align-center mb-4">
        <div>
          <div class="text-h6 font-weight-bold">Permissions</div>
          <div class="text-caption text-grey">
            Select permissions by group or individual chips.
          </div>
        </div>

        <div class="d-flex ga-2 align-center">
          <v-chip color="primary" variant="tonal">
            {{ form.permissions.length }} Selected
          </v-chip>

          <v-btn
            size="small"
            color="primary"
            variant="tonal"
            @click="selectAllPermissions"
          >
            Select All
          </v-btn>

          <v-btn
            size="small"
            color="error"
            variant="tonal"
            @click="clearAllPermissions"
          >
            Clear
          </v-btn>
        </div>
      </div>

      <v-row>
        <v-col
          v-for="(groupPermissions, groupName) in permissionGroups"
          :key="groupName"
          cols="12"
          md="6"
        >
          <v-card
            class="pa-4 rounded-xl permission-group-card"
            variant="outlined"
          >
            <div class="d-flex justify-space-between align-center mb-3">
              <div>
                <div class="text-subtitle-1 font-weight-bold">
                  {{ groupName }}
                </div>

                <div class="text-caption text-grey">
                  {{ groupPermissions.length }} permissions
                </div>
              </div>

              <v-chip
                size="small"
                :color="
                  isGroupSelected(groupPermissions) ? 'success' : 'primary'
                "
                variant="tonal"
                class="cursor-pointer"
                @click="toggleGroupPermissions(groupPermissions)"
              >
                {{
                  isGroupSelected(groupPermissions)
                    ? "Selected"
                    : "Select Group"
                }}
              </v-chip>
            </div>

            <div class="d-flex flex-wrap ga-2">
              <v-chip
                v-for="permission in groupPermissions"
                :key="permission.id"
                :color="
                  isPermissionSelected(permission.slug) ? 'primary' : 'grey'
                "
                :variant="
                  isPermissionSelected(permission.slug) ? 'flat' : 'tonal'
                "
                class="permission-chip"
                @click="togglePermission(permission.slug)"
              >
                <v-icon start size="16">
                  {{
                    isPermissionSelected(permission.slug)
                      ? "mdi-check-circle"
                      : "mdi-circle-outline"
                  }}
                </v-icon>

                {{ permission.name }}
              </v-chip>
            </div>
          </v-card>
        </v-col>
      </v-row>



      <v-card-actions class="px-0 mt-4">
        <v-spacer />

        <v-btn variant="text" @click="router.back()"> Cancel </v-btn>

        <v-btn color="primary" :loading="saving" @click="saveRole">
          {{ isEdit ? "Update Role" : "Create Role" }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<style scoped>
.permission-group-card {
  transition: all 0.2s ease;
}

.permission-group-card:hover {
  border-color: rgb(var(--v-theme-primary));
}

.permission-chip {
  cursor: pointer;
  user-select: none;
}
</style>
