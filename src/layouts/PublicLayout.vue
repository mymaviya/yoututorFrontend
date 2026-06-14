<template>
  <v-app>
    <PublicHeader />

    <v-main>
      <router-view />
    </v-main>

    <PublicFooter />
  </v-app>
</template>

<script setup>
import PublicHeader from '../components/public/PublicHeader.vue'
import PublicFooter from '../components/public/PublicFooter.vue'
</script>