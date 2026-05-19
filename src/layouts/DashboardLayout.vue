<script setup>
import { watch, ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useTheme } from "vuetify";
import api from "../plugins/api";
import { useAuthStore } from "../stores/auth";
import AppSidebar from "../components/AppSidebar.vue";
import { useUIStore } from "../stores/snackBar";

const router = useRouter();
const route = useRoute();
const theme = useTheme();
const auth = useAuthStore();

const notificationMenu = ref(false);
const notifications = ref([]);
const unreadCount = ref(0);

const drawer = ref(true);
const ui = useUIStore();

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
  const res = await api.get("/notifications", {
    params: {
      unread_only: 1,
    },
  });

  notifications.value = res.data.data || res.data;
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

    notificationMenu.value = false;

    ui.showSnackbar("All notifications marked as read");
  } catch (err) {
    ui.showSnackbar("Failed to mark notifications", "error");
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

watch(notificationMenu, async (val) => {
  if (val) {
    await fetchNotifications();
    await fetchUnreadCount();
  }
});

let notificationTimer = null;

onMounted(() => {
  fetchUnreadCount();
  fetchNotifications();

  notificationTimer = setInterval(() => {
    fetchUnreadCount();
    fetchNotifications();
  }, 30000);
});

onBeforeUnmount(() => {
  if (notificationTimer) {
    clearInterval(notificationTimer);
  }
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
      :close-on-content-click="false"
    >
      <template #activator="{ props }">
        <v-btn
          v-bind="props"
          icon
          variant="tonal"
          color="primary"
          class="mr-2"
          @click="fetchNotifications"
        >
          <v-badge
            :content="unreadCount"
            :model-value="unreadCount > 0"
            color="error"
          >
            <v-icon>mdi-bell-outline</v-icon>
          </v-badge>
        </v-btn>
      </template>

      <v-card width="420" class="rounded-xl">
        <v-card-title class="d-flex justify-space-between align-center">
          Notifications

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

        <v-list v-if="notifications.length">
          <v-list-item
            v-for="item in notifications"
            :key="item.id"
            @click="openNotification(item)"
          >
            <template #prepend>
              <v-badge
                v-if="item.count > 1"
                :content="item.count"
                color="error"
              >
                <v-icon color="primary">mdi-bell</v-icon>
              </v-badge>

              <v-icon v-else color="primary">mdi-bell</v-icon>
            </template>

            <v-list-item-title>
              {{ item.title }}
              <span v-if="item.count > 1"> </span>
            </v-list-item-title>

            <v-list-item-subtitle>
              {{ item.message }}
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>

        <div v-else class="pa-6 text-center text-grey">
          No notifications found
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
  transition: 0.2s;
  cursor: pointer;
}

.notification-item:hover {
  background: rgba(var(--v-theme-primary), 0.08);
}

.notification-unread {
  background: rgba(var(--v-theme-primary), 0.06);
}
</style>
