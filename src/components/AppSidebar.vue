<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { buildSidebarMenus } from "../config/sidebar";
import api from "../plugins/api";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

onMounted(async () => {
  if (!auth.user) {
    await auth.fetchUser();
  }
});

const user = computed(() => auth.user || {});

const openGroup = ref(null);

const filteredMenu = computed(() => {
  return buildSidebarMenus(auth.sidebarMenus || []);
});

const toggleGroup = (title) => {
  openGroup.value = openGroup.value === title ? null : title;
};

const isActive = (item) => {
  return route.name === item.routeName;
};

const isGroupActive = (item) => {
  return item.children?.some(
    (child) => child.routeName === route.name
  );
};

const initials = computed(() => {
  return user.value?.name
    ? user.value.name
        .split(" ")
        .map((x) => x[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "U";
});

const go = (item) => {
  if (!item?.routeName) return;

  router.push({
    name: item.routeName,
  });
};

const logout = async () => {
  try {
    await api.post("/logout");
  } catch (e) {
    //
  }

  auth.logout();

  router.push("/login");
};
</script>

<template>
  <v-navigation-drawer
    app
    width="260"
    class="app-sidebar"
  >
    <div class="sidebar-wrapper">
      <!-- Logo -->
      <div class="logo-section">
        <div class="d-flex align-center ga-3">
          <v-avatar
            size="48"
            color="primary"
            variant="tonal"
          >
            <v-icon size="28">
              mdi-school
            </v-icon>
          </v-avatar>

          <div>
            <div class="text-h6 font-weight-bold">
              School ERP
            </div>

            <div class="text-caption text-grey">
              Question Bank System
            </div>
          </div>
        </div>
      </div>

      <v-divider />

      <!-- User -->
      <div class="pa-3">
        <div class="user-card">
          <v-avatar size="48" color="primary">
            <v-img
              v-if="user.profile"
              :src="user.profile"
              cover
            />

            <span v-else>
              {{ initials }}
            </span>
          </v-avatar>

          <div class="overflow-hidden">
            <div class="font-weight-bold text-truncate">
              {{ user.name }}
            </div>

            <div
              class="text-caption text-grey text-truncate"
            >
              {{ user.role }}
            </div>
          </div>
        </div>
      </div>

      <v-divider />

      <!-- Menu -->
      <div class="sidebar-menu">
        <v-list
          nav
          density="compact"
          class="px-2 py-2"
        >
          <template
            v-for="item in filteredMenu"
            :key="item.title"
          >
            <!-- Single -->
            <v-list-item
              v-if="!item.children"
              :prepend-icon="item.icon"
              :title="item.title"
              rounded="lg"
              class="sidebar-item"
              :class="{
                'active-menu': isActive(item),
              }"
              @click="go(item)"
            />

            <!-- Group -->
            <div
              v-else
              class="menu-group"
            >
              <v-list-item
                :prepend-icon="item.icon"
                :title="item.title"
                rounded="lg"
                class="sidebar-item"
                :class="{
                  'active-menu': isGroupActive(item),
                }"
                @click="toggleGroup(item.title)"
              >
                <template #append>
                  <v-icon>
                    {{
                      openGroup === item.title
                        ? "mdi-chevron-up"
                        : "mdi-chevron-down"
                    }}
                  </v-icon>
                </template>
              </v-list-item>

              <v-expand-transition>
                <div
                  v-show="
                    openGroup === item.title ||
                    isGroupActive(item)
                  "
                  class="child-menu"
                >
                  <v-list-item
                    v-for="child in item.children"
                    :key="child.title"
                    :prepend-icon="child.icon"
                    :title="child.title"
                    class="child-item"
                    rounded="lg"
                    :class="{
                      'active-child':
                        isActive(child),
                    }"
                    @click="go(child)"
                  />
                </div>
              </v-expand-transition>
            </div>
          </template>
        </v-list>
      </div>

      <!-- Logout -->
      <div class="sidebar-footer">
        <v-btn
          block
          color="error"
          prepend-icon="mdi-logout"
          variant="tonal"
          @click="logout"
        >
          Logout
        </v-btn>
      </div>
    </div>
  </v-navigation-drawer>
</template>

<style scoped>
.app-sidebar {
  border-right: 1px solid rgba(255,255,255,.08);
}

.sidebar-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.logo-section {
  padding: 12px;
}

.user-card {
  display: flex;
  gap: 12px;
  align-items: center;
}

.sidebar-menu {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;

  scrollbar-width: none;
  -ms-overflow-style: none;
}

.sidebar-menu::-webkit-scrollbar {
  display: none;
}

.sidebar-item {
  margin-bottom: 2px;
}

.child-menu {
  margin-left: 12px;
  padding-left: 8px;
  border-left: 2px solid
    rgba(var(--v-theme-primary), .2);
}

.child-item {
  margin-top: 2px;
}

.active-menu {
  background:
    rgba(var(--v-theme-primary), .15) !important;

  color:
    rgb(var(--v-theme-primary)) !important;

  font-weight: 700;
}

.active-child {
  background:
    rgba(var(--v-theme-primary), .2) !important;

  color:
    rgb(var(--v-theme-primary)) !important;

  font-weight: 700;
}

.sidebar-footer {
  padding: 12px;
}

:deep(.v-list-item-title) {
  font-size: 13px;
}
</style>