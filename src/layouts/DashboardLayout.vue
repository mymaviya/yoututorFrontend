<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTheme } from 'vuetify'
import api from '../plugins/api'
import { useAuthStore } from "../stores/auth";
import AppSidebar from "../components/AppSidebar.vue";

const router = useRouter()
const route = useRoute()
const theme = useTheme()
const auth = useAuthStore()

const drawer = ref(true)

const user = computed(() => auth.user || {})

const pageTitle = computed(() => {
  return route.meta?.title || 'Dashboard'
})

const initials = computed(() => {
  return user.value?.name
    ? user.value.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'U'
})

const isDark = computed(() => {
  return theme.global.current.value.dark
})

const toggleTheme = () => {
  theme.global.name.value = isDark.value ? 'light' : 'dark'
  localStorage.setItem('theme', theme.global.name.value)
}

const logout = async () => {
  try {
    await api.post('/logout')
  } catch (err) {
    console.log(err)
  } finally {
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    delete api.defaults.headers.common.Authorization

    router.push('/login')
  }
}

const goProfile = () => {
  router.push({ name: 'profile' })
}

const goSettings = () => {
  router.push('/settings')
}
</script>

<template>
    <AppSidebar v-model="drawer" />

    <v-app-bar
      app
      elevation="0"
      class="app-bar"
    >
      <v-app-bar-nav-icon @click="drawer = !drawer" />

      <div>
        <div class="text-h6 font-weight-bold">
          {{ pageTitle }}
        </div>

        <div class="text-caption text-grey">
          School ERP Management System
        </div>
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
          {{ isDark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}
        </v-icon>
      </v-btn>

      <!-- NOTIFICATION -->
      <v-btn
        icon
        variant="tonal"
        color="primary"
        class="mr-2"
      >
        <v-badge
          content="3"
          color="error"
        >
          <v-icon>mdi-bell-outline</v-icon>
        </v-badge>
      </v-btn>

      <!-- PROFILE MENU -->
      <v-menu
        location="bottom end"
        offset="10"
      >
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            variant="text"
            class="profile-btn"
          >
            <v-avatar
              size="38"
              color="primary"
            >
              <v-img
                v-if="user.profile"
                :src="user.profile"
                cover
              />

              <span v-else class="text-white font-weight-bold">
                {{ initials }}
              </span>
            </v-avatar>

            <div class="d-none d-md-block text-left ml-2">
              <div class="text-body-2 font-weight-bold">
                {{ user.name || 'User' }}
              </div>

              <div class="text-caption text-grey">
                {{ user.role || 'Role' }}
              </div>
            </div>

            <v-icon class="ml-1">
              mdi-chevron-down
            </v-icon>
          </v-btn>
        </template>

        <v-card
          width="280"
          class="rounded-xl"
        >
          <v-card-text>
            <div class="d-flex align-center ga-3">
              <v-avatar
                size="50"
                color="primary"
              >
                <v-img
                  v-if="user.profile"
                  :src="user.profile"
                  cover
                />

                <span v-else class="text-white font-weight-bold">
                  {{ initials }}
                </span>
              </v-avatar>

              <div>
                <div class="font-weight-bold">
                  {{ user.name || 'User' }}
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
      <v-container
        fluid
        class="pa-6"
      >
        <router-view />
        <AppSnackbar />
            <AppConfirm />
      </v-container>
    </v-main>
</template>

<style scoped>
.app-bar {
  border-bottom: 1px solid rgba(255,255,255,.08);
  backdrop-filter: blur(14px);
}

.main-bg {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(var(--v-theme-primary), .08), transparent 28%),
    rgb(var(--v-theme-background));
}

.profile-btn {
  text-transform: none;
  border-radius: 14px;
}
</style>