<script setup>
import AppSidebar from "../components/AppSidebar.vue";
import AppSnackbar from "../components/AppSnackbar.vue";
import AppConfirm from "../components/AppConfirm.vue";
import AppLoader from "../components/AppLoader.vue";
import { useAuthStore } from "../stores/auth";
import { useTheme } from "vuetify";

const store = useAuthStore();
const theme = useTheme();
import { useRouter } from "vue-router";

const router = useRouter();

const logout = () => {
  store.logout();
  router.push("/login");
};

const toggleTheme = () => {
  store.toggleTheme();

  setTimeout(() => {
    theme.change(store.theme);
  }, 150);
};

const getInitials = (name) => {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};
</script>

<template>
  <v-app>
    <transition name="theme-fade" mode="out-in">
      <div :key="store.theme">
        <AppSidebar />

        <v-app-bar app color="primary">
          <v-app-bar-nav-icon @click="store.toggleDrawer()" />
          <v-toolbar-title>Dashboard</v-toolbar-title>
          <v-text-field
            placeholder="Search..."
            density="compact"
            variant="outlined"
            hide-details
            class="mx-4"
            style="max-width: 300px"
          />

          <v-spacer />

          <v-btn icon @click="store.toggleTheme()">
            <v-icon>
              {{
                store.theme === "light"
                  ? "mdi-weather-night"
                  : "mdi-white-balance-sunny"
              }}
            </v-icon>
          </v-btn>

          <v-btn icon>
            <v-icon>mdi-bell-outline</v-icon>
          </v-btn>

          <v-menu>
            <template #activator="{ props }">
              <v-avatar v-bind="props" size="42" color="warning" class="mr-5">
                <v-img v-if="store.user?.profile" :src="store.user.profile" />
                <span v-else>{{ getInitials(store.user?.name) }}</span>
              </v-avatar>
            </template>

            <v-list>
              <v-list-item title="Profile" prepend-icon="mdi-account" :to="{ name: 'Profile' }" />
              <v-list-item
                title="Logout"
                @click="logout"
                prepend-icon="mdi-logout"
              />
            </v-list>
          </v-menu>
        </v-app-bar>

        <v-main>
          <AppLoader />
          <v-container>
            <!-- 🔥 Route Transition -->
             
            <router-view v-slot="{ Component, route }">
              <transition :name="route.meta.transition || 'page'" mode="out-in">
                <component :is="Component" />
              </transition>
            </router-view>
            <AppSnackbar />
            <AppConfirm />
            
          </v-container>
        </v-main>
      </div>
    </transition>
  </v-app>
</template>
