<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: 'Legend',
  },
  showTitle: {
    type: Boolean,
    default: true,
  },
  items: {
    type: Array,
    default: () => [],
  },
})

const defaultItems = [
  {
    key: 'assigned',
    label: 'Assigned Class',
    color: 'primary',
    icon: 'mdi-book-open-variant',
  },
  {
    key: 'substitution',
    label: 'Substitution',
    color: 'warning',
    icon: 'mdi-account-switch-outline',
  },
  {
    key: 'free',
    label: 'Free Period',
    color: 'success',
    icon: 'mdi-check-circle-outline',
  },
]

const resolvedItems = computed(() => (
  props.items.length ? props.items : defaultItems
))
</script>

<template>
  <v-card
    class="timetable-legend"
    rounded="lg"
    variant="outlined"
  >
    <v-card-text class="pa-4">
      <div class="d-flex flex-wrap align-center ga-3">
        <div
          v-if="showTitle"
          class="text-subtitle-2 font-weight-semibold me-1"
        >
          {{ title }}
        </div>

        <div
          v-for="item in resolvedItems"
          :key="item.key || item.label"
          class="legend-item d-inline-flex align-center ga-2"
        >
          <v-icon
            v-if="item.icon"
            :icon="item.icon"
            :color="item.color || 'primary'"
            size="18"
          />

          <span
            v-else
            class="legend-indicator"
            :class="[`legend-indicator--${item.shape || 'dot'}`]"
            :style="{ backgroundColor: item.color || 'currentColor' }"
          />

          <span class="text-body-2 text-medium-emphasis">
            {{ item.label }}
          </span>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.timetable-legend {
  background: rgb(var(--v-theme-surface));
}

.legend-item {
  min-height: 24px;
  white-space: nowrap;
}

.legend-indicator {
  display: inline-block;
  flex: 0 0 auto;
  width: 12px;
  height: 12px;
}

.legend-indicator--dot {
  border-radius: 50%;
}

.legend-indicator--square {
  border-radius: 3px;
}

.legend-indicator--line {
  width: 18px;
  height: 4px;
  border-radius: 999px;
}

@media print {
  .timetable-legend {
    break-inside: avoid;
    box-shadow: none !important;
  }
}
</style>
