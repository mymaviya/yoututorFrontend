<script setup>
import { useUiLoaderStore } from "../../stores/uiLoader";

const loader = useUiLoaderStore();
</script>
<template>
  <v-fade-transition>
    <div v-if="loader.loading" class="page-loader">
      <v-progress-circular
        indeterminate
        color="primary"
        size="56"
        width="5"
      />

      <div class="mt-4 text-subtitle-2 text-medium-emphasis">
        Loading, please wait...
      </div>
    </div>
  </v-fade-transition>
</template>

<style scoped>
.page-loader {
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