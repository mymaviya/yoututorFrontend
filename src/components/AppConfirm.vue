<script setup>
import { useUIStore } from '../stores/snackBar';
const ui = useUIStore()
</script>

<template>
  <v-dialog v-model="ui.confirm.show" max-width="400">
    <v-card>

      <v-card-title class="text-h6">
        {{ ui.confirm.title }}
      </v-card-title>

      <v-card-text>
        {{ ui.confirm.message }}
      </v-card-text>

      <v-card-actions class="justify-end">
        <v-btn variant="text" @click="ui.confirmNo()">Cancel</v-btn>
        <v-btn color="red" @click="ui.confirmYes()">Confirm</v-btn>
      </v-card-actions>

    </v-card>
  </v-dialog>
</template>