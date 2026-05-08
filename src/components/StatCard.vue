<template>
  <v-card class="pa-4 rounded-xl elevation-2">
    <div class="d-flex justify-space-between align-center">
      <div>
        <div class="text-caption">{{ title }}</div>
        <div class="text-h5 font-weight-bold">{{ value }}</div>
      </div>
      <v-icon size="32">{{ icon }}</v-icon>
    </div>
  </v-card>
</template>

<script setup>
defineProps(['title', 'value', 'icon'])
</script>