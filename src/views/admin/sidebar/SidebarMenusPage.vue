<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useUIStore } from "../../../stores/snackBar";
import api from "../../../plugins/api";
import { getFrontendRoutes } from "../../../config/appRoutes";
import { suggestMdiIcon } from "../../../utils/iconSuggestions";
import draggable from "vuedraggable";

const ui = useUIStore();

const loading = ref(false);
const saving = ref(false);
const dialog = ref(false);
const editMode = ref(false);
const menus = ref([]);
const errors = ref({});

const permissions = ref([]);
const roles = ref([]);
const routes = ref([]);

const search = ref("");
const selectedGroup = ref(null);
const selectedStatus = ref(null);
const mdiPattern = /^mdi-/;

const form = ref({
  id: null,
  title: "",
  icon: "",
  route_name: "",
  group_name: "",
  permission_slug: "",
  role_slug: "",
  sort_order: 0,
  is_active: true,
});

const groups = computed(() => {
  return [...new Set(menus.value.map((m) => m.group_name).filter(Boolean))];
});

const filteredMenus = computed(() => {
  return menus.value.filter((menu) => {
    const matchesSearch =
      !search.value ||
      menu.title.toLowerCase().includes(search.value.toLowerCase()) ||
      menu.route_name.toLowerCase().includes(search.value.toLowerCase());

    const matchesGroup =
      !selectedGroup.value || menu.group_name === selectedGroup.value;

    const matchesStatus =
      selectedStatus.value === null || menu.is_active === selectedStatus.value;

    return matchesSearch && matchesGroup && matchesStatus;
  });
});

const fetchDropdowns = async () => {
  try {
    const [permissionsRes, rolesRes] = await Promise.all([
      api.get("/permissions"),
      api.get("/roles"),
    ]);

    permissions.value = permissionsRes.data.data || permissionsRes.data;
    roles.value = rolesRes.data.data || rolesRes.data;
  } catch (e) {
    console.error(e);
  }
};

const fetchMenus = async () => {
  loading.value = true;

  try {
    const res = await api.get("/sidebar-menus");
    menus.value = res.data;
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  form.value = {
    id: null,
    title: "",
    icon: "",
    route_name: "",
    group_name: "",
    permission_slug: "",
    role_slug: "",
    sort_order: 0,
    is_active: true,
  };

  errors.value = {};
};

const openAdd = () => {
  resetForm();
  editMode.value = false;
  dialog.value = true;
};

const openEdit = (item) => {
  form.value = {
    id: item.id,
    title: item.title,
    icon: item.icon,
    route_name: item.route_name,
    group_name: item.group_name,
    permission_slug: item.permission_slug,
    role_slug: item.role_slug,
    sort_order: item.sort_order,
    is_active: Boolean(item.is_active),
  };

  errors.value = {};
  editMode.value = true;
  dialog.value = true;
};

const saveMenu = async () => {
  saving.value = true;
  errors.value = {};

  try {
    if (editMode.value) {
      await api.put(`/sidebar-menus/${form.value.id}`, form.value);
      ui.showSnackbar("Sidebar menu updated successfully", "success");
    } else {
      await api.post("/sidebar-menus", form.value);
      ui.showSnackbar("Sidebar menu created successfully", "success");
    }

    dialog.value = false;
    fetchMenus();
  } catch (err) {
    if (err.response?.status === 422) {
      errors.value = err.response.data.errors || {};
    }

    ui.showSnackbar(
      err.response?.data?.message || "Something went wrong",
      "error",
    );
  } finally {
    saving.value = false;
  }
};

const saveOrder = async () => {
  const payload = menus.value.map((menu, index) => ({
    id: menu.id,
    sort_order: index + 1,
  }));

  await api.post("/sidebar-menus/reorder", {
    menus: payload,
  });

  ui.showSnackbar("Sidebar order updated", "success");

  await fetchMenus();
};

const autoSuggestIcon = () => {
  form.value.icon = suggestMdiIcon(
    form.value.title,
    form.value.route_name,
    form.value.group_name,
  );
};

const deleteMenu = async (item) => {
  if (!confirm(`Delete ${item.title}?`)) return;

  await api.delete(`/sidebar-menus/${item.id}`);
  ui.showSnackbar("Sidebar menu deleted successfully", "success");
  fetchMenus();
};

const toggleStatus = async (item) => {
  await api.put(`/sidebar-menus/${item.id}`, {
    ...item,
    is_active: !item.is_active,
  });

  fetchMenus();
};

const isMenuVisible = (menu) => {
  const matchesSearch =
    !search.value ||
    menu.title?.toLowerCase().includes(search.value.toLowerCase()) ||
    menu.route_name?.toLowerCase().includes(search.value.toLowerCase());

  const matchesGroup =
    !selectedGroup.value || menu.group_name === selectedGroup.value;

  const matchesStatus =
    selectedStatus.value === null || menu.is_active === selectedStatus.value;

  return matchesSearch && matchesGroup && matchesStatus;
};

const hasActiveFilters = computed(() => {
  return (
    !!search.value ||
    selectedGroup.value !== null ||
    selectedStatus.value !== null
  );
});

watch(
  () => form.title,
  (newValue) => {
    if (!form.icon && newValue) {
      autoSuggestIcon();
    }
  }
);

onMounted(async () => {
  routes.value = getFrontendRoutes();

  await Promise.all([fetchMenus(), fetchDropdowns()]);
});
</script>

<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">Sidebar Menus</h1>
        <p class="text-grey">
          Manage sidebar menus dynamically by permission and role.
        </p>
      </div>

      <v-btn color="primary" prepend-icon="mdi-plus" @click="openAdd">
        Add Menu
      </v-btn>
    </div>

    <v-alert
      v-if="hasActiveFilters"
      type="warning"
      variant="tonal"
      class="mb-4"
    >
      Disable filters to reorder menus.
    </v-alert>
    <div class="d-flex ga-2 mb-4">
      <v-chip color="primary" variant="tonal">
        Total: {{ menus.length }}
      </v-chip>

      <v-chip color="success" variant="tonal">
        Active:
        {{ menus.filter((m) => m.is_active).length }}
      </v-chip>

      <v-chip color="error" variant="tonal">
        Inactive:
        {{ menus.filter((m) => !m.is_active).length }}
      </v-chip>
    </div>
    <v-row class="mb-4">
      <v-col cols="12" md="4">
        <v-text-field
          v-model="search"
          label="Search Menu"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          clearable
        />
      </v-col>

      <v-col cols="12" md="3">
        <v-select
          v-model="selectedGroup"
          :items="groups"
          label="Group"
          variant="outlined"
          density="compact"
          clearable
        />
      </v-col>

      <v-col cols="12" md="3">
        <v-select
          v-model="selectedStatus"
          :items="[
            { title: 'Active', value: true },
            { title: 'Inactive', value: false },
          ]"
          item-title="title"
          item-value="value"
          label="Status"
          variant="outlined"
          density="compact"
          clearable
        />
      </v-col>

      <v-col cols="12" md="2">
        <v-btn
          block
          color="secondary"
          variant="tonal"
          @click="
            search = '';
            selectedGroup = null;
            selectedStatus = null;
          "
        >
          Reset
        </v-btn>
      </v-col>
    </v-row>
    <v-card class="rounded-xl" elevation="0">
      <draggable
        v-model="menus"
        item-key="id"
        handle=".drag-handle"
        animation="200"
        :disabled="hasActiveFilters"
        @end="saveOrder"
      >
        <template #item="{ element }">
          <v-card
            v-if="isMenuVisible(element)"
            class="pa-3 mb-2 rounded-lg"
            variant="tonal"
          >
            <div class="d-flex align-center ga-3">
              <v-icon class="drag-handle cursor-move"> mdi-drag </v-icon>

              <v-icon>
                {{ element.icon || "mdi-circle-small" }}
              </v-icon>

              <div class="flex-grow-1">
                <div class="font-weight-bold">
                  {{ element.title }}
                </div>

                <div class="text-caption text-grey">
                  Route: {{ element.route_name }} | Group:
                  {{ element.group_name || "Single" }} | Permission:
                  {{ element.permission_slug || "Public" }}
                </div>
              </div>

              <v-chip
                size="small"
                :color="element.is_active ? 'success' : 'error'"
                variant="tonal"
              >
                {{ element.is_active ? "Active" : "Inactive" }}
              </v-chip>

              <v-btn
                icon="mdi-pencil"
                size="small"
                variant="text"
                color="primary"
                @click="openEdit(element)"
              />

              <v-btn
                :icon="element.is_active ? 'mdi-eye-off' : 'mdi-eye'"
                size="small"
                variant="text"
                color="warning"
                @click="toggleStatus(element)"
              />

              <v-btn
                icon="mdi-delete"
                size="small"
                variant="text"
                color="error"
                @click="deleteMenu(element)"
              />
            </div>
          </v-card>
        </template>
      </draggable>
    </v-card>

    <v-dialog v-model="dialog" max-width="720" persistent>
      <v-card class="rounded-xl">
        <v-card-title class="d-flex justify-space-between align-center">
          {{ editMode ? "Edit Sidebar Menu" : "Add Sidebar Menu" }}

          <v-btn icon="mdi-close" variant="text" @click="dialog = false" />
        </v-card-title>

        <v-divider />

        <v-card-text>
          <v-alert
            v-if="form.route_name"
            type="info"
            variant="tonal"
            density="compact"
            class="mb-4"
          >
            Selected Route:
            <strong>{{ form.route_name }}</strong>
          </v-alert>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.title"
                label="Menu Title"
                variant="outlined"
                :error-messages="errors.title"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.icon"
                label="MDI Icon"
                variant="outlined"
                :prepend-inner-icon="form.icon || 'mdi-circle-outline'"
              >
                <template #append-inner>
                  <v-tooltip text="Suggest Icon">
                    <template #activator="{ props }">
                      <v-btn
                        v-bind="props"
                        icon="mdi-auto-fix"
                        size="small"
                        variant="text"
                        color="primary"
                        @click="autoSuggestIcon"
                      />
                    </template>
                  </v-tooltip>
                </template>
              </v-text-field>
            </v-col>

            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="form.route_name"
                :items="routes"
                item-title="title"
                item-value="name"
                label="Route Name"
                variant="outlined"
                clearable
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.group_name"
                label="Group Name"
                placeholder="Administration"
                variant="outlined"
                :error-messages="errors.group_name"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="form.permission_slug"
                :items="permissions"
                item-title="name"
                item-value="slug"
                label="Permission"
                variant="outlined"
                clearable
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="form.role_slug"
                :items="roles"
                item-title="name"
                item-value="slug"
                label="Role Restriction"
                variant="outlined"
                clearable
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="form.sort_order"
                type="number"
                label="Sort Order"
                variant="outlined"
                :error-messages="errors.sort_order"
              />
            </v-col>

            <v-col cols="12" md="6" class="d-flex align-center">
              <v-switch
                v-model="form.is_active"
                color="success"
                label="Active"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />

          <v-btn variant="text" @click="dialog = false"> Cancel </v-btn>

          <v-btn color="primary" :loading="saving" @click="saveMenu">
            {{ editMode ? "Update" : "Save" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.cursor-move {
  cursor: move;
}
</style>
