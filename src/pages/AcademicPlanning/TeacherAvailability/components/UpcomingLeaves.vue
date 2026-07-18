<template>
  <v-card class="bottom-card" rounded="xl">
    <v-card-title class="d-flex align-center justify-space-between">
      <span class="text-subtitle-1 font-weight-bold">Upcoming Leaves</span>

      <v-btn variant="text" color="primary" append-icon="mdi-arrow-right" @click="$emit('view-all')">
        View All Leaves
      </v-btn>
    </v-card-title>

    <v-card-text>
      <div v-if="leaves.length" class="leave-strip">
        <div v-for="leave in leaves" :key="leave.id" class="leave-item">
          <v-avatar color="error" variant="tonal" size="42">
            <v-icon>mdi-calendar-remove</v-icon>
          </v-avatar>

          <div>
            <strong>{{ leave.teacher?.name || '-' }}</strong>
            <div class="text-caption text-medium-emphasis">
              {{ formatDate(leave.exception_date) }}
            </div>
            <div class="text-caption">
              {{ leave.reason || (leave.is_full_day ? 'Full Day' : 'Leave') }}
            </div>
          </div>
        </div>
      </div>

      <v-alert v-else type="success" variant="tonal" density="comfortable">
        No upcoming leaves.
      </v-alert>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { formatDate } from '../../../../utils/date'

defineProps({
  leaves: {
    type: Array,
    default: () => [],
  },
})

defineEmits(['view-all'])
</script>

<style scoped>
.bottom-card {
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  box-shadow: 0 10px 28px rgba(var(--v-theme-on-surface), 0.08);
}

.leave-strip {
  display: flex;
  overflow-x: auto;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  border-radius: 14px;
}

.leave-item {
  min-width: 220px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border-right: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}
</style>
