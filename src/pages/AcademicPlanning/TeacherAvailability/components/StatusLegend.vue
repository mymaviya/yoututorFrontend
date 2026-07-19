<template>
  <v-card class="bottom-card" rounded="xl">
    <v-card-title class="d-flex align-center ga-2 text-subtitle-1 font-weight-bold">
      <v-icon size="20" color="primary">mdi-map-legend</v-icon>
      <span>Status Legend</span>
    </v-card-title>

    <v-divider />

    <v-card-text>
      <div class="legend-grid" role="list" aria-label="Teacher availability statuses">
        <div
          v-for="item in items"
          :key="item.value"
          class="legend-item"
          role="listitem"
          :aria-label="item.label"
        >
          <v-avatar :color="item.color" variant="tonal" size="42" aria-hidden="true">
            <v-icon size="22">{{ item.icon }}</v-icon>
          </v-avatar>

          <div class="legend-copy">
            <div class="legend-label">{{ item.label }}</div>
            <div class="legend-description">{{ item.description }}</div>
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
const items = [
  {
    label: 'Available',
    value: 'available',
    color: 'success',
    icon: 'mdi-check-circle-outline',
    description: 'Default status',
  },
  {
    label: 'Busy / Duty',
    value: 'busy',
    color: 'warning',
    icon: 'mdi-clock-alert-outline',
    description: 'Unavailable for a period',
  },
  {
    label: 'Leave',
    value: 'leave',
    color: 'error',
    icon: 'mdi-calendar-remove',
    description: 'Absent for leave',
  },
  {
    label: 'Meeting',
    value: 'meeting',
    color: 'deep-purple',
    icon: 'mdi-account-group',
    description: 'Attending a meeting',
  },
  {
    label: 'Training',
    value: 'training',
    color: 'purple',
    icon: 'mdi-school-outline',
    description: 'Attending training',
  },
  {
    label: 'Exam Duty',
    value: 'exam_duty',
    color: 'info',
    icon: 'mdi-file-document-check-outline',
    description: 'Assigned exam duty',
  },
  {
    label: 'Extra Class',
    value: 'extra_class',
    color: 'primary',
    icon: 'mdi-book-open-page-variant',
    description: 'Taking an extra class',
  },
  {
    label: 'Assembly',
    value: 'assembly',
    color: 'orange',
    icon: 'mdi-bullhorn-outline',
    description: 'Assigned to assembly',
  },
  {
    label: 'Blocked',
    value: 'blocked',
    color: 'grey',
    icon: 'mdi-close-circle-outline',
    description: 'Manually blocked',
  },
]
</script>

<style scoped>
.bottom-card {
  height: 100%;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  box-shadow: 0 10px 28px rgba(var(--v-theme-on-surface), 0.08);
}

.legend-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.legend-item {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  border-radius: 12px;
  background: rgba(var(--v-theme-on-surface), 0.02);
}

.legend-copy {
  min-width: 0;
}

.legend-label {
  font-size: 0.875rem;
  font-weight: 700;
  line-height: 1.25;
}

.legend-description {
  margin-top: 2px;
  color: rgba(var(--v-theme-on-surface), 0.65);
  font-size: 0.75rem;
  line-height: 1.3;
}

@media (max-width: 1280px) {
  .legend-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .legend-grid {
    grid-template-columns: 1fr;
  }
}
</style>
