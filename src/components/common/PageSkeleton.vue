<template>
  <div>
    <template v-if="loading">
      <v-card class="pa-4 rounded-xl mb-4" elevation="0">
        <v-skeleton-loader type="heading, text" />
      </v-card>

      <v-card class="pa-4 rounded-xl" elevation="0">
        <v-skeleton-loader :type="type" />
      </v-card>
    </template>

    <template v-else>
      <slot />
    </template>
  </div>
</template>

<script setup>
defineProps({
  loading: {
    type: Boolean,
    default: false,
  },

  type: {
    type: String,
    default: "table-heading, table-row-divider@8",
  },
});
</script>