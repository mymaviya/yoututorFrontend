<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useTheme } from "vuetify";
import api from "../plugins/api";
import { useAuthStore } from "../stores/auth";
import AppSidebar from "../components/AppSidebar.vue";

const router = useRouter();
const route = useRoute();
const theme = useTheme();
const auth = useAuthStore();

const notifications = ref([]);
const unreadCount = ref(0);
const notificationLoading = ref(false);
const notificationMenu = ref(false);

const drawer = ref(true);

const user = computed(() => auth.user || {});

const pageTitle = computed(() => {
  return route.meta?.title || "Dashboard";
});

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

const isDark = computed(() => {
  return theme.global.current.value.dark;
});

const toggleTheme = () => {
  theme.global.name.value = isDark.value ? "light" : "dark";
  localStorage.setItem("theme", theme.global.name.value);
};

const fetchNotifications = async () => {
  try {
    const res = await api.get("/notifications");

    notifications.value = res.data.data || res.data;
  } catch (err) {
    console.log(err);
  }
};

const fetchUnreadCount = async () => {
  try {
    const res = await api.get("/notifications/unread-count");

    unreadCount.value = res.data.count || 0;
  } catch (err) {
    console.log(err);
  }
};

const openNotification = async (notification) => {
  try {
    if (!notification.is_read) {
      await api.post(`/notifications/${notification.id}/read`);

      notification.is_read = true;

      unreadCount.value--;
    }

    if (notification.url) {
      router.push(notification.url);
    }
  } catch (err) {
    console.log(err);
  }
};

const markAllAsRead = async () => {
  try {
    await api.post("/notifications/read-all");

    notifications.value = notifications.value.map((n) => ({
      ...n,
      is_read: true,
    }));

    unreadCount.value = 0;
  } catch (err) {
    console.log(err);
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

const goProfile = () => {
  router.push({ name: "profile" });
};

const goSettings = () => {
  router.push("/settings");
};

onMounted(() => {
  fetchNotifications();
  fetchUnreadCount();

  setInterval(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, 30000);
});
</script>

<template>
  <AppSidebar v-model="drawer" />

  <v-app-bar app elevation="0" class="app-bar">
    <v-app-bar-nav-icon @click="drawer = !drawer" />

    <div>
      <div class="text-h6 font-weight-bold">
        {{ pageTitle }}
      </div>

      <div class="text-caption text-grey">School ERP Management System</div>
    </div>

    <v-spacer />

    <!-- THEME -->
    <v-btn
      icon
      variant="tonal"
      color="primary"
      class="mr-2"
      @click="toggleTheme"
    >
      <v-icon>
        {{ isDark ? "mdi-weather-sunny" : "mdi-weather-night" }}
      </v-icon>
    </v-btn>

    <!-- NOTIFICATION -->
    <v-menu
      v-model="notificationMenu"
      location="bottom end"
      offset="10"
      width="420"
    >
      <template #activator="{ props }">
        <v-btn v-bind="props" icon variant="tonal" color="primary" class="mr-2">
          <v-badge
            :content="unreadCount"
            :model-value="unreadCount > 0"
            color="error"
          >
            <v-icon> mdi-bell-outline </v-icon>
          </v-badge>
        </v-btn>
      </template>

      <v-card class="rounded-xl" elevation="8">
        <!-- HEADER -->

        <v-card-title class="d-flex justify-space-between align-center">
          <div>Notifications</div>

          <v-btn
            size="small"
            variant="text"
            color="primary"
            @click="markAllAsRead"
          >
            Mark all read
          </v-btn>
        </v-card-title>

        <v-divider />

        <!-- LIST -->

        <div style="max-height: 500px; overflow-y: auto">
          <v-list v-if="notifications.length" density="comfortable">
            <v-list-item
              v-for="notification in notifications"
              :key="notification.id"
              class="notification-item"
              :class="{
                'notification-unread': !notification.is_read,
              }"
              @click="openNotification(notification)"
            >
              <template #prepend>
                <v-avatar
                  size="42"
                  :color="
                    notification.type === 'question_approved'
                      ? 'success'
                      : notification.type === 'question_rejected'
                        ? 'error'
                        : notification.type === 'task'
                          ? 'primary'
                          : 'info'
                  "
                  variant="tonal"
                >
                  <v-icon>
                    {{
                      notification.type === "question_approved"
                        ? "mdi-check-decagram"
                        : notification.type === "question_rejected"
                          ? "mdi-close-octagon"
                          : notification.type === "task"
                            ? "mdi-clipboard-text"
                            : "mdi-bell"
                    }}
                  </v-icon>
                </v-avatar>
              </template>

              <v-list-item-title class="font-weight-bold">
                {{ notification.title }}
              </v-list-item-title>

              <v-list-item-subtitle>
                {{ notification.message }}
              </v-list-item-subtitle>

              <template #append>
                <div class="text-caption text-grey">
                  {{ new Date(notification.created_at).toLocaleDateString() }}
                </div>
              </template>
            </v-list-item>
          </v-list>

          <!-- EMPTY -->

          <div v-else class="pa-8 text-center">
            <v-icon size="56" color="grey-lighten-1">
              mdi-bell-off-outline
            </v-icon>

            <div class="mt-3 text-grey">No notifications found</div>
          </div>
        </div>
      </v-card>
    </v-menu>

    <!-- PROFILE MENU -->
    <v-menu location="bottom end" offset="10">
      <template #activator="{ props }">
        <v-btn v-bind="props" variant="text" class="profile-btn">
          <v-avatar size="38" color="primary">
            <v-img v-if="user.profile" :src="user.profile" cover />

            <span v-else class="text-white font-weight-bold">
              {{ initials }}
            </span>
          </v-avatar>

          <div class="d-none d-md-block text-left ml-2">
            <div class="text-body-2 font-weight-bold">
              {{ user.name || "User" }}
            </div>

            <div class="text-caption text-grey">
              {{ user.role || "Role" }}
            </div>
          </div>

          <v-icon class="ml-1"> mdi-chevron-down </v-icon>
        </v-btn>
      </template>

      <v-card width="280" class="rounded-xl">
        <v-card-text>
          <div class="d-flex align-center ga-3">
            <v-avatar size="50" color="primary">
              <v-img v-if="user.profile" :src="user.profile" cover />

              <span v-else class="text-white font-weight-bold">
                {{ initials }}
              </span>
            </v-avatar>

            <div>
              <div class="font-weight-bold">
                {{ user.name || "User" }}
              </div>

              <div class="text-caption text-grey">
                {{ user.email }}
              </div>

              <v-chip
                size="x-small"
                color="primary"
                variant="tonal"
                class="mt-1"
              >
                {{ user.role }}
              </v-chip>
            </div>
          </div>
        </v-card-text>

        <v-divider />

        <v-list density="comfortable">
          <v-list-item
            prepend-icon="mdi-account-circle"
            title="My Profile"
            @click="goProfile"
          />

          <v-list-item
            prepend-icon="mdi-cog-outline"
            title="Settings"
            @click="goSettings"
          />

          <v-list-item
            prepend-icon="mdi-theme-light-dark"
            :title="isDark ? 'Light Mode' : 'Dark Mode'"
            @click="toggleTheme"
          />
        </v-list>

        <v-divider />

        <v-list density="comfortable">
          <v-list-item
            prepend-icon="mdi-logout"
            title="Logout"
            class="text-error"
            @click="logout"
          />
        </v-list>
      </v-card>
    </v-menu>
  </v-app-bar>

  <v-main class="main-bg">
    <v-container fluid class="pa-6">
      <router-view />
    </v-container>
  </v-main>
</template>

<style scoped>
.app-bar {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(14px);
}

.main-bg {
  min-height: 100vh;
  background:
    radial-gradient(
      circle at top left,
      rgba(var(--v-theme-primary), 0.08),
      transparent 28%
    ),
    rgb(var(--v-theme-background));
}

.profile-btn {
  text-transform: none;
  border-radius: 14px;
}

.notification-item {
  transition: .2s;
  cursor: pointer;
}

.notification-item:hover {
  background:
    rgba(var(--v-theme-primary), .08);
}

.notification-unread {
  background:
    rgba(var(--v-theme-primary), .06);
}
</style>
