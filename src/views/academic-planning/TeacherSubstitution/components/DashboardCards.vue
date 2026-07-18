<template>
  <v-row>
    <v-col
      v-for="card in cards"
      :key="card.key"
      cols="12"
      sm="6"
      md="3"
      lg="2"
    >
      <v-card
        class="substitution-card"
        rounded="xl"
        :class="{ active: activeStatus === card.status }"
        @click="$emit('filter', card.status)"
      >
        <v-card-text class="d-flex align-center justify-space-between">
          <div>
            <div class="text-caption text-medium-emphasis">
              {{ card.label }}
            </div>

            <div class="text-h5 font-weight-bold">
              {{ card.value }}
            </div>

            <div class="text-caption text-medium-emphasis">
              {{ card.sub }}
            </div>
          </div>

          <v-avatar :color="card.color" variant="tonal" size="52">
            <v-icon size="28">{{ card.icon }}</v-icon>
          </v-avatar>
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
  analytics: {
    type: Object,
    default: () => ({}),
  },
  activeStatus: {
    type: String,
    default: null,
  },
})

defineEmits(['filter'])

const summary = computed(() => props.analytics?.summary || props.stats || {})
const ai = computed(() => props.analytics?.ai || {})

const cards = computed(() => [
  {
    key: 'total',
    label: 'Total',
    value: summary.value.total || 0,
    sub: 'Today',
    icon: 'mdi-calendar-account',
    color: 'primary',
    status: null,
  },
  {
    key: 'pending',
    label: 'Pending',
    value: summary.value.pending || 0,
    sub: 'Need assignment',
    icon: 'mdi-alert-circle-outline',
    color: 'warning',
    status: 'pending',
  },
  {
    key: 'assigned',
    label: 'Assigned',
    value: summary.value.assigned || 0,
    sub: 'Covered',
    icon: 'mdi-account-check-outline',
    color: 'success',
    status: 'assigned',
  },
  {
    key: 'completed',
    label: 'Completed',
    value: summary.value.completed || 0,
    sub: 'Approved',
    icon: 'mdi-check-decagram-outline',
    color: 'info',
    status: 'completed',
  },
  {
    key: 'coverage',
    label: 'Coverage',
    value: `${summary.value.coverage_percentage || 0}%`,
    sub: 'Assigned + completed',
    icon: 'mdi-shield-check-outline',
    color: 'success',
    status: null,
  },
  {
    key: 'ai_score',
    label: 'Avg AI Score',
    value: `${ai.value.average_score || 0}%`,
    sub: `${ai.value.auto_assigned || 0} auto assigned`,
    icon: 'mdi-robot-outline',
    color: 'deep-purple',
    status: null,
  },
])
</script>

<style scoped>
.substitution-card {
  cursor: pointer;
  border: 1px solid rgba(var(--v-border-color), 0.14);
  transition: 0.18s ease;
  background: rgb(var(--v-theme-surface));
}

.substitution-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.12);
}

.substitution-card.active {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 0 0 2px rgba(var(--v-theme-primary), 0.18);
}
</style>
