<script setup>
import { onMounted } from "vue";
import AppSnackbar from "./components/AppSnackbar.vue";
import AppConfirm from "./components/AppConfirm.vue";
// import AppLoader from "./components/AppLoader.vue";
import PageLoader from "./components/common/PageLoader.vue";
import { useUiLoaderStore } from "./stores/uiLoader";

const loader = useUiLoaderStore();

onMounted(() => {
  loader.stop();
  loader.reset();
});
</script>

<template>
  <v-app>
      <AppLoader />
      <PageLoader />
    <router-view />

    <!-- Global Components -->
    <AppSnackbar />
    <AppConfirm />
  </v-app>
</template>