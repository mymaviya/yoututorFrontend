<template>
  <v-row>
    <v-col v-for="card in cards" :key="card.key" cols="12" sm="6" md="3">
      <v-card class="stat-card" rounded="xl">
        <v-card-text class="d-flex align-center justify-space-between">
          <v-avatar :color="card.color" variant="tonal" size="64">
            <v-icon size="34">{{ card.icon }}</v-icon>
          </v-avatar>

          <div class="text-right">
            <div class="text-body-2 text-medium-emphasis">{{ card.label }}</div>
            <div class="text-h4 font-weight-bold">{{ card.value }}</div>
            <div class="text-caption text-medium-emphasis">{{ card.sub }}</div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  stats: {
    type: Object,
    default: () => ({}),
  },
})

const cards = computed(() => [
  {
    key: 'teachers',
    label: 'Total Teachers',
    value: props.stats.total_teachers || 0,
    sub: 'Active Teachers',
    icon: 'mdi-account-group-outline',
    color: 'success',
  },
  {
    key: 'exceptions',
    label: "Today's Exceptions",
    value: props.stats.today_exceptions || 0,
    sub: 'Across all teachers',
    icon: 'mdi-calendar-alert-outline',
    color: 'warning',
  },
  {
    key: 'leave',
    label: 'Teachers on Leave',
    value: props.stats.teachers_on_leave || 0,
    sub: 'Today',
    icon: 'mdi-beach',
    color: 'error',
  },
  {
    key: 'busy',
    label: 'Busy Periods',
    value: props.stats.busy_periods || 0,
    sub: 'Today',
    icon: 'mdi-clock-outline',
    color: 'primary',
  },
])
</script>

<style scoped>
.stat-card {
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  box-shadow: 0 10px 28px rgba(var(--v-theme-on-surface), 0.08);
}
</style>
