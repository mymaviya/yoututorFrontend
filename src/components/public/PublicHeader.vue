<template>
  <v-app-bar flat height="78" class="public-appbar">
    <v-container class="header-container d-flex align-center">
      <router-link to="/" class="brand-link" aria-label="Go to home page">
        <v-avatar rounded="lg" size="48" class="brand-logo">
          <v-img :src="settings?.site_logo || '/logo.png'" contain />
        </v-avatar>

        <div class="brand-text">
          <div class="brand-title">
            {{ settings?.site_name || 'YouTutor ERP' }}
          </div>
          <div class="brand-subtitle">
            {{ settings?.site_tagline || 'Assessment Management Platform' }}
          </div>
        </div>
      </router-link>

      <v-spacer />

      <nav class="desktop-menu d-none d-md-flex" aria-label="Main navigation">
        <router-link
          v-for="item in menuItems"
          :key="item.to"
          :to="item.to"
          class="menu-link"
          :class="{ active: isActive(item.to) }"
        >
          {{ item.title }}
        </router-link>
      </nav>

      <div class="header-actions d-none d-md-flex align-center">
        <button
          type="button"
          class="theme-switch"
          :aria-label="isDark ? 'Switch to light theme' : 'Switch to dark theme'"
          @click="toggleTheme"
        >
          <v-icon size="20">
            {{ isDark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}
          </v-icon>
        </button>

        <router-link to="/contact" class="demo-link">
          Free Demo
        </router-link>

        <router-link to="/login" class="login-link mr-4">
          Login
        </router-link>
      </div>

      <button
        type="button"
        class="mobile-menu-button d-md-none"
        aria-label="Open navigation menu"
        @click="drawer = true"
      >
        <v-icon size="26">mdi-menu</v-icon>
      </button>
    </v-container>
  </v-app-bar>

  <v-navigation-drawer
    v-model="drawer"
    temporary
    location="right"
    width="315"
    class="mobile-drawer"
  >
    <div class="drawer-content">
      <div class="d-flex align-center justify-space-between mb-7">
        <div class="d-flex align-center">
          <v-avatar rounded="lg" size="44" class="brand-logo mr-3">
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

        <v-btn icon variant="text" @click="drawer = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <div class="mobile-menu-list">
        <router-link
          v-for="item in menuItems"
          :key="item.to"
          :to="item.to"
          class="mobile-menu-link"
          :class="{ active: isActive(item.to) }"
          @click="drawer = false"
        >
          <v-icon size="20">{{ item.icon }}</v-icon>
          <span>{{ item.title }}</span>
        </router-link>
      </div>

      <v-divider class="my-5" />

      <button type="button" class="mobile-theme-row" @click="toggleTheme">
        <span class="d-flex align-center ga-3">
          <v-icon size="20">
            {{ isDark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}
          </v-icon>
          {{ isDark ? 'Light Theme' : 'Dark Theme' }}
        </span>
        <v-icon size="18">mdi-chevron-right</v-icon>
      </button>

      <router-link to="/contact" class="mobile-primary-link" @click="drawer = false">
        Request Free Demo
      </router-link>

      <router-link to="/login" class="mobile-secondary-link" @click="drawer = false">
        Login
      </router-link>
    </div>
  </v-navigation-drawer>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useTheme } from 'vuetify'
import { useSettings } from '../../composables/useSettings'

const drawer = ref(false)
const theme = useTheme()
const route = useRoute()

const { settings, fetchSettings } = useSettings()

const menuItems = [
  { title: 'Home', to: '/', icon: 'mdi-home-outline' },
  { title: 'About', to: '/about', icon: 'mdi-information-outline' },
  { title: 'Pricing', to: '/pricing', icon: 'mdi-currency-inr' },
  { title: 'Contact', to: '/contact', icon: 'mdi-phone-outline' },
]

const isDark = computed(() => theme.global.current.value.dark)

const isActive = (path) => {
  if (path === '/') {
    return route.path === '/'
  }

  return route.path.startsWith(path)
}

const toggleTheme = () => {
  const nextTheme = isDark.value ? 'light' : 'dark'
  document.documentElement.classList.add('theme-changing')
  theme.global.name.value = nextTheme
  localStorage.setItem('theme', nextTheme)

  window.setTimeout(() => {
    document.documentElement.classList.remove('theme-changing')
  }, 500)
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
  background: rgba(var(--v-theme-surface), 0.88) !important;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  transition: background-color 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease;
}

.header-container {
  max-width: 1220px;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: rgb(var(--v-theme-on-surface));
  min-width: 235px;
}

.brand-logo {
  background: rgba(var(--v-theme-primary), 0.1);
  border: 1px solid rgba(var(--v-theme-primary), 0.24);
  box-shadow: 0 10px 30px rgba(var(--v-theme-primary), 0.12);
}

.brand-title {
  font-size: 19px;
  font-weight: 950;
  line-height: 1.1;
  color: rgb(var(--v-theme-primary));
}

.brand-subtitle {
  margin-top: 3px;
  font-size: 12px;
  color: rgba(var(--v-theme-on-surface), 0.64);
  white-space: nowrap;
}

.desktop-menu {
  align-items: center;
  gap: 26px;
  margin-right: 24px;
}

.menu-link {
  position: relative;
  padding: 8px 0;
  text-decoration: none;
  color: rgba(var(--v-theme-on-surface), 0.76);
  font-size: 15px;
  font-weight: 750;
  letter-spacing: 0.01em;
  transition: color 0.25s ease;
}

.menu-link::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 1px;
  height: 2px;
  border-radius: 999px;
  background: rgb(var(--v-theme-primary));
  transform: scaleX(0);
  transform-origin: center;
  transition: transform 0.25s ease;
}

.menu-link:hover,
.menu-link.active {
  color: rgb(var(--v-theme-primary));
}

.menu-link:hover::after,
.menu-link.active::after {
  transform: scaleX(1);
}

.header-actions {
  gap: 10px;
}

.theme-switch,
.mobile-menu-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  background: rgba(var(--v-theme-surface-variant), 0.42);
  color: rgb(var(--v-theme-on-surface));
  cursor: pointer;
  transition: transform 0.2s ease, background-color 0.25s ease, border-color 0.25s ease;
}

.theme-switch {
  width: 42px;
  height: 42px;
  border-radius: 999px;
}

.mobile-menu-button {
  width: 44px;
  height: 44px;
  border-radius: 14px;
}

.theme-switch:hover,
.mobile-menu-button:hover {
  transform: translateY(-1px);
  background: rgba(var(--v-theme-primary), 0.1);
  border-color: rgba(var(--v-theme-primary), 0.24);
}

.demo-link,
.login-link,
.mobile-primary-link,
.mobile-secondary-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  font-weight: 850;
  transition: transform 0.2s ease, box-shadow 0.25s ease, background-color 0.25s ease;
}

.demo-link {
  min-height: 42px;
  padding: 0 18px;
  border-radius: 999px;
  color: white;
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)), rgba(var(--v-theme-primary), 0.78));
  box-shadow: 0 12px 28px rgba(var(--v-theme-primary), 0.22);
}

.login-link {
  min-height: 42px;
  padding: 0 17px;
  border-radius: 999px;
  color: rgb(var(--v-theme-primary));
  border: 1px solid rgba(var(--v-theme-primary), 0.28);
  background: rgba(var(--v-theme-primary), 0.06);
}

.demo-link:hover,
.login-link:hover,
.mobile-primary-link:hover,
.mobile-secondary-link:hover {
  transform: translateY(-1px);
}

.drawer-content {
  padding: 22px;
}

.mobile-menu-list {
  display: grid;
  gap: 10px;
}

.mobile-menu-link,
.mobile-theme-row {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 14px 15px;
  border-radius: 16px;
  color: rgba(var(--v-theme-on-surface), 0.8);
  background: transparent;
  border: 1px solid transparent;
  text-decoration: none;
  font-weight: 800;
  transition: background-color 0.25s ease, color 0.25s ease, border-color 0.25s ease;
}

.mobile-menu-link:hover,
.mobile-menu-link.active,
.mobile-theme-row:hover {
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.08);
  border-color: rgba(var(--v-theme-primary), 0.14);
}

.mobile-theme-row {
  justify-content: space-between;
  cursor: pointer;
  font-family: inherit;
  font-size: 15px;
}

.mobile-primary-link,
.mobile-secondary-link {
  width: 100%;
  min-height: 48px;
  border-radius: 16px;
  margin-top: 12px;
}

.mobile-primary-link {
  color: white;
  background: rgb(var(--v-theme-primary));
}

.mobile-secondary-link {
  color: rgb(var(--v-theme-primary));
  border: 1px solid rgba(var(--v-theme-primary), 0.25);
  background: rgba(var(--v-theme-primary), 0.06);
}

:global(html.theme-changing *),
:global(html.theme-changing *::before),
:global(html.theme-changing *::after) {
  transition:
    background-color 0.45s ease,
    color 0.45s ease,
    border-color 0.45s ease,
    box-shadow 0.45s ease !important;
}

@media (max-width: 960px) {
  .brand-link {
    min-width: auto;
  }

  .brand-subtitle {
    max-width: 180px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

@media (max-width: 430px) {
  .brand-subtitle {
    display: none;
  }

  .brand-title {
    font-size: 17px;
  }
}
</style>
