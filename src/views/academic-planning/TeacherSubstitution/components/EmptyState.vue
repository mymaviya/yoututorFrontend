<template>
  <v-card rounded="xl">
    <v-card-text class="text-center py-12">
      <v-avatar color="success" variant="tonal" size="82" class="mb-4">
        <v-icon size="44">mdi-account-check-outline</v-icon>
      </v-avatar>

      <div class="text-h6 font-weight-bold">
        No Teacher Substitutions Today
      </div>

      <div class="text-body-2 text-medium-emphasis mt-1">
        Everyone is available or no substitution records have been generated.
      </div>

      <v-btn
        color="primary"
        variant="tonal"
        prepend-icon="mdi-refresh"
        class="mt-5"
        @click="$emit('refresh')"
      >
        Refresh
      </v-btn>
    </v-card-text>
  </v-card>
</template>

<script setup>
defineEmits(['refresh'])
</script>