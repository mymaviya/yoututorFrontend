<script setup>
const props = defineProps({
  title: {
    type: String,
    default: 'Teacher Timetable'
  },
  subtitle: {
    type: String,
    default: 'View and manage weekly teaching assignments.'
  },
  loading: {
    type: Boolean,
    default: false
  },
  showPrint: {
    type: Boolean,
    default: true
  },
  showExport: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['refresh', 'print', 'export'])
</script>

<template>
  <v-card class="timetable-toolbar" rounded="xl" variant="flat">
    <v-card-text class="pa-4 pa-md-5">
      <div class="d-flex flex-column flex-lg-row align-lg-center justify-space-between ga-4">
        <div class="min-width-0">
          <div class="d-flex align-center ga-3 mb-1">
            <v-avatar color="primary" variant="tonal" rounded="lg" size="42">
              <v-icon icon="mdi-calendar-clock" />
            </v-avatar>

            <div class="min-width-0">
              <h1 class="text-h6 text-md-h5 font-weight-bold text-truncate">
                {{ props.title }}
              </h1>
              <p class="text-body-2 text-medium-emphasis mb-0">
                {{ props.subtitle }}
              </p>
            </div>
          </div>
        </div>

        <div class="d-flex flex-wrap align-center ga-2">
          <slot name="actions" />

          <v-btn
            v-if="props.showExport"
            variant="tonal"
            prepend-icon="mdi-file-export-outline"
            :disabled="props.loading"
            @click="emit('export')"
          >
            Export
          </v-btn>

          <v-btn
            v-if="props.showPrint"
            variant="tonal"
            prepend-icon="mdi-printer-outline"
            :disabled="props.loading"
            @click="emit('print')"
          >
            Print
          </v-btn>

          <v-btn
            color="primary"
            prepend-icon="mdi-refresh"
            :loading="props.loading"
            @click="emit('refresh')"
          >
            Refresh
          </v-btn>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.timetable-toolbar {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  background: rgb(var(--v-theme-surface));
}

.min-width-0 {
  min-width: 0;
}

@media print {
  .timetable-toolbar {
    display: none;
  }
}
</style>
