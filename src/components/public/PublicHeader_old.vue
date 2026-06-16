<template>
  <v-app-bar
    flat
    height="76"
    class="public-appbar"
  >
    <v-container class="d-flex align-center">
      <router-link to="/" class="brand-link">
        <v-avatar rounded="lg" size="48" class="brand-logo">
          <v-img :src="settings?.site_logo || '/logo.png'" contain />
        </v-avatar>

        <div>
          <div class="brand-title">
            {{ settings?.site_name || 'YouTutor ERP' }}
          </div>
          <div class="brand-subtitle">
            {{ settings?.site_tagline || 'Assessment Management Platform' }}
          </div>
        </div>
      </router-link>

      <v-spacer />

      <div class="nav-links d-none d-md-flex">
        <v-btn variant="text" to="/">Home</v-btn>
        <v-btn variant="text" to="/about">About</v-btn>
        <v-btn variant="text" to="/pricing">Pricing</v-btn>
        <v-btn variant="text" to="/contact">Contact</v-btn>
      </div>

      <v-btn
        icon
        variant="tonal"
        class="ml-2"
        @click="toggleTheme"
      >
        <v-icon>
          {{ isDark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}
        </v-icon>
      </v-btn>

      <v-btn
        color="primary"
        rounded="xl"
        class="ml-3 d-none d-md-inline-flex"
        to="/contact"
      >
        Free Demo
      </v-btn>

      <v-btn
        variant="outlined"
        rounded="xl"
        class="ml-2 d-none d-md-inline-flex"
        to="/login"
      >
        Login
      </v-btn>

      <v-app-bar-nav-icon
        class="d-md-none ml-2"
        @click="drawer = true"
      />
    </v-container>
  </v-app-bar>

  <v-navigation-drawer
    v-model="drawer"
    temporary
    location="right"
    width="300"
  >
    <div class="pa-5">
      <div class="d-flex align-center mb-6">
        <v-avatar rounded="lg" size="44" class="mr-3">
          <v-img :src="settings?.site_logo || '/logo.png'" contain />
        </v-avatar>

        <div>
          <div class="font-weight-bold">
            {{ settings?.site_name || 'YouTutor ERP' }}
          </div>
          <div class="text-caption text-medium-emphasis">
            {{ settings?.site_tagline || 'Assessment Platform' }}
          </div>
        </div>
      </div>

      <v-list nav density="comfortable">
        <v-list-item prepend-icon="mdi-home" title="Home" to="/" @click="drawer = false" />
        <v-list-item prepend-icon="mdi-information" title="About" to="/about" @click="drawer = false" />
        <v-list-item prepend-icon="mdi-currency-inr" title="Pricing" to="/pricing" @click="drawer = false" />
        <v-list-item prepend-icon="mdi-phone" title="Contact" to="/contact" @click="drawer = false" />
        <v-divider class="my-3" />
        <v-list-item prepend-icon="mdi-gift" title="Free Demo" to="/contact" @click="drawer = false" />
        <v-list-item prepend-icon="mdi-login" title="Login" to="/login" @click="drawer = false" />
      </v-list>
    </div>
  </v-navigation-drawer>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useTheme } from 'vuetify'
import { useSettings } from '../../composables/useSettings'

const drawer = ref(false)
const theme = useTheme()

const { settings, fetchSettings } = useSettings()

const isDark = computed(() => theme.global.current.value.dark)

const toggleTheme = () => {
  const nextTheme = isDark.value ? 'light' : 'dark'
  theme.global.name.value = nextTheme
  localStorage.setItem('theme', nextTheme)
}

onMounted(() => {
  const savedTheme = localStorage.getItem('theme')

  if (savedTheme) {
    theme.global.name.value = savedTheme
  }

  fetchSettings()
})
</script>

<style scoped>
.public-appbar {
  backdrop-filter: blur(18px);
  background: rgba(var(--v-theme-surface), 0.86) !important;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: rgb(var(--v-theme-on-surface));
}

.brand-logo {
  background: rgba(var(--v-theme-primary), 0.1);
  border: 1px solid rgba(var(--v-theme-primary), 0.25);
}

.brand-title {
  font-size: 19px;
  font-weight: 900;
  line-height: 1.1;
  color: rgb(var(--v-theme-primary));
}

.brand-subtitle {
  font-size: 12px;
  color: rgba(var(--v-theme-on-surface), 0.65);
}

.nav-links {
  align-items: center;
  gap: 4px;
}

.nav-links :deep(.v-btn) {
  font-weight: 600;
  text-transform: none;
}
</style>