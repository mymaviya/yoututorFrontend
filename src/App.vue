<script setup>
import AppSnackbar from "./components/AppSnackbar.vue";
import AppConfirm from "./components/AppConfirm.vue";
import AppLoader from "./components/AppLoader.vue";
</script>

<template>
  <v-app>
      <AppLoader />
    <router-view />

    <!-- Global Components -->
    <AppSnackbar />
    <AppConfirm />
  </v-app>
</template>