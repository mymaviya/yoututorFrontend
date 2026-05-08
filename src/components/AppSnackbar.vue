<script setup>
import { useUIStore } from '../stores/snackBar';

const ui = useUIStore()
</script>

<template>
  <v-snackbar
    v-model="ui.snackbar.show"
    :color="ui.snackbar.color"
    :timeout="ui.snackbar.timeout"
    location="top right"
    elevation="6"
  >

  <v-icon start>
    {{ ui.snackbar.color === 'error' ? 'mdi-alert' : 'mdi-check-circle' }}
  </v-icon>

    {{ ui.snackbar.text }}

    <template #actions>
      <v-btn
        variant="text"
        icon="mdi-close"
        @click="ui.hideSnackbar()"
      />
    </template>
  </v-snackbar>
</template>