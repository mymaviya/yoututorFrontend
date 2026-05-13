<script setup>
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import api from "../plugins/api";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const user = computed(() => auth.user || {});

const openGroup = ref(null);
let closeTimer = null

const openMenuGroup = (title) => {
  clearTimeout(closeTimer)
  openGroup.value = title
}

const closeMenuGroup = () => {
  clearTimeout(closeTimer)

  closeTimer = setTimeout(() => {
    openGroup.value = null
  }, 250)
}

const isActive = (item) => {
  if (!item.routeName) return false;
  return route.name === item.routeName;
};

const isGroupActive = (item) => {
  return item.children?.some((child) => child.routeName === route.name);
};

const initials = computed(() => {
  return user.value?.name
    ? user.value.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase()
    : "U";
});

const menu = computed(() => [
  {
    title: "Dashboard",
    icon: "mdi-view-dashboard",
    routeName: "Dashboard",
    roles: ["admin", "student"],
  },
  {
    title: "Teacher Dashboard",
    icon: "mdi-view-dashboard",
    routeName: "teacher.dashboard",
    roles: ["admin", "teacher"],
  },

  {
    title: "Academic",
    icon: "mdi-school",
    roles: ["admin"],
    children: [
      {
        title: "Grades",
        icon: "mdi-google-classroom",
        routeName: "grades.index",
        roles: ["admin"],
      },
      {
        title: "Subjects",
        icon: "mdi-book-open-page-variant",
        routeName: "subjects.index",
        roles: ["admin"],
      },
      {
        title: "Lessons",
        icon: "mdi-book-education",
        routeName: "lessons.index",
        roles: ["admin"],
      },
      {
        title: "Exam Names",
        icon: "mdi-format-list-text",
        routeName: "exam.names",
        roles: ["admin"],
      },
    ],
  },

  {
    title: "Teachers",
    icon: "mdi-account-tie",
    roles: ["admin"],
    children: [
      {
        title: "All Teachers",
        icon: "mdi-account-group",
        routeName: "teachers.index",
        roles: ["admin"],
      },
      {
        title: "Question Tasks",
        icon: "mdi-clipboard-text-clock",
        routeName: "teacher.tasks",
        roles: ["admin"],
      },
      {
        title: "Exam Portions",
        icon: "mdi-book-check",
        routeName: "exam.portions",
        roles: ["admin"],
      },
      {
        title: "Teacher Progress",
        icon: "mdi-chart-timeline-variant",
        routeName: "teacher.progress",
        roles: ["admin"],
      },
    ],
  },
  {
    title: "My Tasks",
    icon: "mdi-clipboard-check",
    routeName: "teacher.my.tasks",
    roles: ["teacher"],
  },
  {
    title: "My Exam Portions",
    icon: "mdi-book-check-outline",
    routeName: "teacher.exam.portions",
    roles: ["teacher"],
  },
  {
    title: "Question Bank",
    icon: "mdi-help-box-multiple",
    roles: ["admin", "teacher"],
    children: [
      {
        title: "All Questions",
        icon: "mdi-format-list-bulleted",
        routeName: "questions.index",
        roles: ["admin", "teacher"],
      },
      {
        title: "Add Question",
        icon: "mdi-plus-circle",
        routeName: "questions.create",
        roles: ["admin", "teacher"],
      },
      {
        title: "Question Approval",
        icon: "mdi-check-decagram",
        routeName: "question.approvals",
        roles: ["admin"],
      },
    ],
  },

  {
    title: "Question Papers",
    icon: "mdi-file-document-multiple",
    roles: ["admin", "teacher"],
    children: [
      {
        title: "All Papers",
        icon: "mdi-file-document-outline",
        routeName: "papers.index",
        roles: ["admin", "teacher"],
      },
      {
        title: "Generate Paper",
        icon: "mdi-file-document-edit",
        routeName: "papers.generate",
        roles: ["admin", "teacher"],
      },
    ],
  },

  {
    title: "Online Exams",
    icon: "mdi-laptop",
    roles: ["admin", "teacher"],
    children: [
      {
        title: "All Exams",
        icon: "mdi-format-list-checks",
        routeName: "Dashboard",
        roles: ["admin", "teacher", "student"],
      },
      {
        title: "Create Exam",
        icon: "mdi-plus-box",
        routeName: "dashboard",
        roles: ["admin", "teacher", "student"],
      },
    ],
  },

  {
    title: "Results",
    icon: "mdi-chart-box",
    routeName: "dashboard",
    roles: ["admin", "teacher", "student"],
  },

  {
    title: "Profile",
    icon: "mdi-account-circle",
    routeName: "profile",
    roles: ["admin", "teacher", "student"],
  },
]);

const hasRole = (item) => {
  if (!item.roles) return true;
  return item.roles.includes(user.value?.role);
};

const filteredMenu = computed(() => {
  return menu.value
    .filter(hasRole)
    .map((item) => {
      if (!item.children) return item;

      return {
        ...item,
        children: item.children.filter(hasRole),
      };
    })
    .filter((item) => !item.children || item.children.length);
});

const go = (item) => {
  if (!item) return;

  if (item.routeName) {
    router.push({ name: item.routeName });
    return;
  }

  if (item.route) {
    router.push(item.route);
    return;
  }

  if (item.to) {
    router.push(item.to);
  }
};

const logout = async () => {
  try {
    await api.post("/logout");
  } catch (err) {
    console.log(err);
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    delete api.defaults.headers.common.Authorization;

    router.push("/login");
  }
};
</script>

<template>
  <v-navigation-drawer app width="290" class="app-sidebar d-flex flex-column">
    <div class="d-flex flex-column h-screen" style="height: 90dvh !important">
      <!-- LOGO -->
      <div class="pa-4">
        <div class="d-flex align-center ga-3">
          <v-avatar size="48" color="primary" variant="tonal">
            <v-icon size="28"> mdi-school </v-icon>
          </v-avatar>

          <div>
            <div class="text-h6 font-weight-bold">School ERP</div>

            <div class="text-caption text-grey">Admin Dashboard</div>
          </div>
        </div>
      </div>

      <v-divider />

      <!-- USER PROFILE -->
      <div class="pa-4">
        <div class="user-card">
          <v-avatar size="48" color="primary">
            <v-img v-if="user.profile" :src="user.profile" cover />

            <span v-else class="text-white font-weight-bold">
              {{ initials }}
            </span>
          </v-avatar>

          <div class="flex-grow-1 overflow-hidden">
            <div class="font-weight-bold text-truncate">
              {{ user.name || "User" }}
            </div>

            <div class="text-caption text-grey text-truncate">
              {{ user.role || "Role" }}
            </div>
          </div>
        </div>
      </div>

      <v-divider />

      <!-- MENU -->
      <v-list nav density="comfortable" class="px-3 py-4">
        <template v-for="item in filteredMenu" :key="item.title">
          <!-- SIMPLE ITEM -->
          <v-list-item v-if="!item.children" :prepend-icon="item.icon" :title="item.title" rounded="xl"
            :class="{ 'active-menu': isActive(item) }" @click="go(item)" />

          <!-- HOVER GROUP -->
          <div v-else class="menu-group" @mouseenter="openMenuGroup(item.title)" @mouseleave="closeMenuGroup">
            <v-list-item :prepend-icon="item.icon" :title="item.title" rounded="xl"
              :class="{ 'active-menu': isGroupActive(item) }">
              <template #append>
                <v-icon size="18">
                  {{
                    openGroup === item.title || isGroupActive(item)
                      ? "mdi-chevron-up"
                      : "mdi-chevron-down"
                  }}
                </v-icon>
              </template>
            </v-list-item>

            <v-expand-transition>
              <div v-show="openGroup === item.title || isGroupActive(item)" class="child-menu">
                <v-list-item v-for="child in item.children" :key="child.title" :prepend-icon="child.icon"
                  :title="child.title" rounded="xl" class="child-item" :class="{ 'active-child': isActive(child) }"
                  @click="go(child)" />
              </div>
            </v-expand-transition>
          </div>
        </template>
      </v-list>
    </div>
    <div class="mt-auto pa-4">
      <v-btn block color="error" variant="tonal" size="large" prepend-icon="mdi-logout" class="rounded-xl"
        @click="logout">
        Logout
      </v-btn>
    </div>
  </v-navigation-drawer>
</template>

<style scoped>
.app-sidebar {
  border-right: 1px solid rgba(255, 255, 255, 0.08);
}

.user-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.04);
}

.v-list-item {
  margin-bottom: 4px;
}

.menu-group {
  position: relative;
  margin-bottom: 4px;
}

.child-menu {
  margin-left: 12px;
  padding-left: 8px;
  border-left: 2px solid rgba(var(--v-theme-primary), 0.25);
}

.child-menu,
.menu-group {
  pointer-events: auto;
}

.child-item {
  margin-top: 4px;
  font-size: 14px;
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

.v-list-item:hover {
  background: rgba(var(--v-theme-primary), 0.1) !important;
}
</style>
