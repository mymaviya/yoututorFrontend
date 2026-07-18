<template>
  <v-chip
    :color="config.color"
    :prepend-icon="config.icon"
    size="small"
    variant="tonal"
  >
    {{ config.label }}
  </v-chip>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    default: 'pending',
  },
})

const config = computed(() => {
  return {
    pending: {
      label: 'Pending',
      color: 'warning',
      icon: 'mdi-alert-circle-outline',
    },
    assigned: {
      label: 'Assigned',
      color: 'success',
      icon: 'mdi-account-check-outline',
    },
    completed: {
      label: 'Completed',
      color: 'info',
      icon: 'mdi-check-decagram-outline',
    },
    cancelled: {
      label: 'Cancelled',
      color: 'error',
      icon: 'mdi-close-circle-outline',
    },
  }[props.status] || {
    label: props.status,
    color: 'grey',
    icon: 'mdi-help-circle-outline',
  }
})
</script>