<script setup>
import { useLoadingStore } from "../../stores/loading";

const loading = useLoadingStore();
</script>
<template>
  <v-fade-transition>
    <div v-if="loading.appLoading" class="app-loader">
      <v-progress-circular
        indeterminate
        color="primary"
        size="60"
        width="5"
      />

      <div class="mt-4 text-subtitle-2">
        Loading application...
      </div>
    </div>
  </v-fade-transition>
</template>

<style scoped>
.app-loader {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgb(var(--v-theme-background));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: all;
}
</style>