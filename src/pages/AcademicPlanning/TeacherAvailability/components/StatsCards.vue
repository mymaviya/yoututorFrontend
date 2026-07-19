<template>
  <v-row class="stats-row">
    <v-col
      v-for="card in cards"
      :key="card.key"
      cols="12"
      sm="6"
      lg="3"
    >
      <v-card
        class="stat-card h-100"
        rounded="xl"
        variant="flat"
        :aria-label="`${card.label}: ${card.value}`"
      >
        <v-card-text class="stat-card-content">
          <v-avatar
            :color="card.color"
            variant="tonal"
            size="58"
            class="stat-icon"
          >
            <v-icon size="30" :icon="card.icon" />
          </v-avatar>

          <div class="stat-details">
            <div class="text-body-2 text-medium-emphasis stat-label">
              {{ card.label }}
            </div>

            <div class="text-h4 font-weight-bold stat-value">
              {{ formatValue(card.value) }}
            </div>

            <div class="text-caption text-medium-emphasis stat-subtitle">
              {{ card.sub }}
            </div>
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

const toNumber = (value) => {
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 ? number : 0
}

const formatValue = (value) => new Intl.NumberFormat().format(toNumber(value))

const cards = computed(() => [
  {
    key: 'teachers',
    label: 'Total Teachers',
    value: toNumber(props.stats?.total_teachers),
    sub: 'Active teachers',
    icon: 'mdi-account-group-outline',
    color: 'success',
  },
  {
    key: 'exceptions',
    label: "Today's Exceptions",
    value: toNumber(props.stats?.today_exceptions),
    sub: 'Across all teachers',
    icon: 'mdi-calendar-alert-outline',
    color: 'warning',
  },
  {
    key: 'leave',
    label: 'Teachers on Leave',
    value: toNumber(props.stats?.teachers_on_leave),
    sub: 'Today',
    icon: 'mdi-beach',
    color: 'error',
  },
  {
    key: 'busy',
    label: 'Busy Periods',
    value: toNumber(props.stats?.busy_periods),
    sub: 'Today',
    icon: 'mdi-clock-outline',
    color: 'primary',
  },
])
</script>

<style scoped>
.stats-row {
  align-items: stretch;
}

.stat-card {
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  box-shadow: 0 8px 24px rgba(var(--v-theme-on-surface), 0.07);
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(var(--v-theme-on-surface), 0.1);
}

.stat-card-content {
  min-height: 126px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 22px;
}

.stat-icon {
  flex: 0 0 auto;
}

.stat-details {
  min-width: 0;
  flex: 1;
  text-align: right;
}

.stat-label,
.stat-subtitle {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stat-value {
  line-height: 1.15;
  margin: 4px 0;
}

@media (max-width: 600px) {
  .stat-card-content {
    min-height: 108px;
    padding: 18px;
  }

  .stat-details {
    text-align: left;
  }

  .stat-value {
    font-size: 1.75rem !important;
  }
}

@media (prefers-reduced-motion: reduce) {
  .stat-card {
    transition: none;
  }

  .stat-card:hover {
    transform: none;
  }
}
</style>
