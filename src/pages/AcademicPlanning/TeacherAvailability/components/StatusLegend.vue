<template>
  <v-card class="bottom-card" rounded="xl">
    <v-card-title class="text-subtitle-1 font-weight-bold">
      Status Legend
    </v-card-title>

    <v-card-text>
      <div class="legend-grid">
        <div v-for="item in items" :key="item.value" class="legend-item">
          <v-avatar :color="item.color" variant="tonal" size="44">
            <v-icon>{{ item.icon }}</v-icon>
          </v-avatar>

          <span>{{ item.label }}</span>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
const items = [
  { label: 'Available (Default)', value: 'available', color: 'success', icon: 'mdi-check-circle-outline' },
  { label: 'Busy / Duty', value: 'busy', color: 'warning', icon: 'mdi-clock-alert-outline' },
  { label: 'Leave', value: 'leave', color: 'error', icon: 'mdi-calendar-remove' },
  { label: 'Meeting / Training', value: 'meeting', color: 'deep-purple', icon: 'mdi-account-group' },
  { label: 'Extra Class', value: 'extra_class', color: 'blue', icon: 'mdi-book-open-page-variant' },
  { label: 'Assembly', value: 'assembly', color: 'orange', icon: 'mdi-bullhorn' },
  { label: 'Blocked', value: 'blocked', color: 'grey', icon: 'mdi-close-circle-outline' },
]
</script>

<style scoped>
.bottom-card {
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  box-shadow: 0 10px 28px rgba(var(--v-theme-on-surface), 0.08);
}

.legend-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
}

.legend-item {
  min-width: 96px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
  font-size: 12px;
}
</style>
