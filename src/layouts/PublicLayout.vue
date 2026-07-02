<template>
  <v-app>
    <!-- Blank layout pages -->
    <router-view v-if="isBlankLayout" />

    <!-- Normal website/admin layout -->
    <template v-else>
      <PublicHeader />

      <v-main>
        <router-view />
      </v-main>

      <WhatsAppFloatingButton />
    <PublicFooter />
    </template>
  </v-app>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import PublicHeader from '../components/public/PublicHeader.vue'
import PublicFooter from '../components/public/PublicFooter.vue'
import WhatsAppFloatingButton from '../components/public/WhatsAppFloatingButton.vue'

const route = useRoute()

const isBlankLayout = computed(() => {
  return route.meta.layout === 'blank'
})
</script>

