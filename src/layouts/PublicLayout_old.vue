<template>
  <v-app>
    <PublicHeader />

    <v-main>
      <router-view />
    </v-main>
    <WhatsAppFloatingButton />
    <PublicFooter />
  </v-app>
</template>

<script setup>
import PublicHeader from '../components/public/PublicHeader.vue'
import PublicFooter from '../components/public/PublicFooter.vue'
import WhatsAppFloatingButton from '../components/public/WhatsAppFloatingButton.vue'
</script>

