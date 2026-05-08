<script setup>
import { useUIStore } from '../stores/snackBar';
const ui = useUIStore()
</script>

<template>
  <v-progress-linear
    :active="ui.AppLoader.loading"
    indeterminate
    :color="ui.AppLoader.color"
    height="5"
    fixed
    top
  />
</template>