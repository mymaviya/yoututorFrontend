<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { buildSidebarMenus } from "../config/sidebar";
import api from "../plugins/api";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const openGroup = ref(null);

const notificationCounts = ref({});

const fetchSidebarBadges = async () => {
  try {
    const res = await api.get("/notifications");

    const notifications = Array.isArray(res.data)
      ? res.data
      : res.data.data || [];

    const counts = {
      "question.approvals": 0,
      "exam.portions": 0,
      "teacher.my.tasks": 0,
      "teacher.exam.portions": 0,
    };

    notifications
      .filter((n) => !n.is_read)
      .forEach((n) => {
        if (n.url === "/question-approvals") {
          counts["question.approvals"] += Number(n.count || 1);
        }

        if (n.url === "/exam-portions") {
          counts["exam.portions"] += Number(n.count || 1);
        }

        if (n.url === "/my-question-tasks") {
          counts["teacher.my.tasks"] += Number(n.count || 1);
        }

        if (n.url === "/my-exam-portions") {
          counts["teacher.exam.portions"] += Number(n.count || 1);
        }
      });

    notificationCounts.value = counts;
  } catch (error) {
    console.error(error);
  }
};

onMounted(async () => {
  if (!auth.user && auth.token) {
    await auth.fetchUser();
  }

  await fetchSidebarBadges();
});

const hasRoute = (routeName) => {
  if (!routeName) return false;
  return router.hasRoute(routeName);
};

const menus = computed(() => {
  const builtMenus = buildSidebarMenus(auth.sidebarMenus || [], notificationCounts.value);

  return builtMenus
    .map((item) => {
      if (!item.children) {
        return hasRoute(item.routeName) ? item : null;
      }

      const children = item.children.filter((child) => hasRoute(child.routeName));

      if (!children.length) {
        return null;
      }

      return {
        ...item,
        children,
      };
    })
    .filter(Boolean);
});

const user = computed(() => auth.user || {});

const initials = computed(() => {
  if (!user.value?.name) return "U";

  return user.value.name
    .split(" ")
    .map((x) => x[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
});

const toggleGroup = (title) => {
  openGroup.value = openGroup.value === title ? null : title;
};

const isActive = (item) => route.name === item.routeName;

const isGroupActive = (item) =>
  item.children?.some((child) => child.routeName === route.name);

const go = (item) => {
  if (!item?.routeName) return;

  router.push({
    name: item.routeName,
  });
};

const logout = async () => {
  await auth.logout();
  router.replace({ name: "login" });
};
</script>

<template>
  <v-navigation-drawer app width="270" class="app-sidebar">
    <div class="sidebar-wrapper">
      <div class="logo-section">
        <div class="d-flex align-center ga-3">
          <v-avatar size="44" color="primary" variant="tonal">
            <v-icon size="26">mdi-school</v-icon>
          </v-avatar>

          <div>
            <div class="text-h6 font-weight-bold">GoLearn ERP</div>
            <div class="text-caption text-grey">Question Bank System</div>
          </div>
        </div>
      </div>

      <v-divider />

      <div class="pa-3">
        <div class="user-card">
          <v-avatar size="44" color="primary">
            <v-img v-if="user.profile" :src="user.profile" cover />
            <span v-else>{{ initials }}</span>
          </v-avatar>

          <div class="overflow-hidden">
            <div class="font-weight-bold text-truncate">
              {{ user.name }}
            </div>
            <div class="text-caption text-grey text-truncate">
              {{ user.role }}
            </div>
          </div>
        </div>
      </div>

      <v-divider />

      <div class="sidebar-menu">
        <v-list nav density="compact" class="px-2 py-2">
          <template v-for="item in menus" :key="item.title">
            <!-- SINGLE MENU -->
            <v-list-item
              v-if="!item.children"
              rounded="lg"
              class="sidebar-item"
              :class="{ 'active-menu': isActive(item) }"
              @click="go(item)"
            >
              <template #prepend>
                <div class="sidebar-icon-wrapper">
                  <v-badge
                    v-if="item.badge"
                    :content="item.badge"
                    :color="item.badgeColor || 'error'"
                    floating
                    location="top start"
                  >
                    <v-icon>{{ item.icon }}</v-icon>
                  </v-badge>

                  <v-icon v-else>
                    {{ item.icon }}
                  </v-icon>
                </div>
              </template>

              <v-list-item-title>
                {{ item.title }}
              </v-list-item-title>
            </v-list-item>

            <!-- GROUP MENU -->
            <div v-else class="menu-group">
              <v-list-item
                rounded="lg"
                class="sidebar-item"
                :class="{ 'active-menu': isGroupActive(item) }"
                @click="toggleGroup(item.title)"
              >
                <template #prepend>
                  <v-icon>{{ item.icon }}</v-icon>
                </template>

                <v-list-item-title>
                  {{ item.title }}
                </v-list-item-title>

                <template #append>
                  <v-icon>
                    {{
                      openGroup === item.title || isGroupActive(item)
                        ? "mdi-chevron-up"
                        : "mdi-chevron-down"
                    }}
                  </v-icon>
                </template>
              </v-list-item>

              <v-expand-transition>
                <div
                  v-show="openGroup === item.title || isGroupActive(item)"
                  class="child-menu"
                >
                  <v-list-item
                    v-for="child in item.children"
                    :key="child.title"
                    rounded="lg"
                    class="child-item"
                    :class="{ 'active-child': isActive(child) }"
                    @click="go(child)"
                  >
                    <template #prepend>
                      <div class="sidebar-icon-wrapper">
                        <v-badge
                          v-if="child.badge"
                          :content="child.badge"
                          :color="child.badgeColor || 'error'"
                          floating
                          location="top start"
                        >
                          <v-icon>{{ child.icon }}</v-icon>
                        </v-badge>

                        <v-icon v-else>
                          {{ child.icon }}
                        </v-icon>
                      </div>
                    </template>

                    <v-list-item-title>
                      {{ child.title }}
                    </v-list-item-title>
                  </v-list-item>
                </div>
              </v-expand-transition>
            </div>
          </template>
        </v-list>
      </div>

      <div class="sidebar-footer">
        <v-btn
          block
          color="error"
          variant="tonal"
          prepend-icon="mdi-logout"
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
  border-right: 1px solid rgba(255, 255, 255, 0.08);
}

.sidebar-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.logo-section {
  padding: 14px;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sidebar-menu {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none;
}

.sidebar-menu::-webkit-scrollbar {
  display: none;
}

.sidebar-item {
  margin-bottom: 4px;
}

.child-menu {
  margin-left: 18px;
  padding-left: 8px;
  border-left: 2px solid rgba(var(--v-theme-primary), 0.25);
}

.child-item {
  margin-top: 3px;
}

.sidebar-icon-wrapper {
  position: relative;
  width: 26px;
  min-width: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.active-menu {
  background: rgba(var(--v-theme-primary), 0.16) !important;
  color: rgb(var(--v-theme-primary)) !important;
  font-weight: 700;
}

.active-child {
  background: rgba(var(--v-theme-primary), 0.22) !important;
  color: rgb(var(--v-theme-primary)) !important;
  font-weight: 700;
}

.sidebar-footer {
  padding: 12px;
}

:deep(.v-list-item-title) {
  font-size: 13px;
}

:deep(.v-badge__badge) {
  font-size: 10px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
}
</style>