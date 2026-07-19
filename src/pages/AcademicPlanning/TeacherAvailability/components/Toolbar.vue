<template>
  <div class="planner-toolbar">
    <div class="toolbar-search">
      <v-text-field
        :model-value="search"
        prepend-inner-icon="mdi-magnify"
        placeholder="Search teacher..."
        aria-label="Search teacher"
        density="compact"
        variant="outlined"
        hide-details
        clearable
        class="search-input"
        @update:model-value="emit('update:search', $event || '')"
      />
    </div>

    <div class="week-controls">
      <v-tooltip text="Previous week">
        <template #activator="{ props: tooltipProps }">
          <v-btn
            v-bind="tooltipProps"
            icon="mdi-chevron-left"
            variant="tonal"
            :disabled="loading"
            aria-label="Previous week"
            @click="emit('previous')"
          />
        </template>
      </v-tooltip>

      <v-btn variant="tonal" :disabled="loading" prepend-icon="mdi-calendar-today" @click="emit('today')">
        Today
      </v-btn>

      <div class="week-label" aria-live="polite">
        <v-icon size="18" class="mr-2">mdi-calendar-range</v-icon>
        <span>{{ weekLabel || 'Select week' }}</span>
      </div>

      <v-tooltip text="Next week">
        <template #activator="{ props: tooltipProps }">
          <v-btn
            v-bind="tooltipProps"
            icon="mdi-chevron-right"
            variant="tonal"
            :disabled="loading"
            aria-label="Next week"
            @click="emit('next')"
          />
        </template>
      </v-tooltip>
    </div>

    <div class="toolbar-actions">
      <v-btn-toggle
        :model-value="viewMode"
        density="compact"
        mandatory
        divided
        color="primary"
        aria-label="Planner view mode"
        @update:model-value="emit('update:viewMode', $event)"
      >
        <v-btn value="week" prepend-icon="mdi-calendar-week">Week</v-btn>
        <v-btn value="month" prepend-icon="mdi-calendar-month">Month</v-btn>
      </v-btn-toggle>

      <v-select
        :model-value="statusFilter"
        :items="statusFilterOptions"
        item-title="label"
        item-value="value"
        label="Status"
        aria-label="Filter exceptions by status"
        density="compact"
        variant="outlined"
        hide-details
        class="status-filter"
        @update:model-value="emit('update:statusFilter', $event || 'all')"
      />

      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        :loading="loading"
        :disabled="loading"
        @click="emit('add')"
      >
        Add Exception
      </v-btn>
    </div>
  </div>
</template>

<script setup>
defineProps({
  search: { type: String, default: '' },
  statusFilter: { type: String, default: 'all' },
  viewMode: { type: String, default: 'week' },
  weekLabel: { type: String, default: '' },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits([
  'update:search',
  'update:statusFilter',
  'update:viewMode',
  'today',
  'previous',
  'next',
  'add',
])

const statusFilterOptions = [
  { label: 'All Types', value: 'all' },
  { label: 'Busy / Duty', value: 'busy' },
  { label: 'Leave', value: 'leave' },
  { label: 'Meeting', value: 'meeting' },
  { label: 'Training', value: 'training' },
  { label: 'Exam Duty', value: 'exam_duty' },
  { label: 'Assembly', value: 'assembly' },
  { label: 'Extra Class', value: 'extra_class' },
  { label: 'Blocked', value: 'blocked' },
]
</script>

<style scoped>
.planner-toolbar {
  display: grid;
  grid-template-columns: minmax(220px, 320px) minmax(360px, 1fr) minmax(420px, auto);
  align-items: center;
  gap: 16px;
  padding: 18px;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
}

.toolbar-search,
.week-controls,
.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.week-controls {
  justify-content: center;
  flex-wrap: wrap;
}

.toolbar-actions {
  justify-content: flex-end;
  flex-wrap: wrap;
}

.search-input {
  width: 100%;
  min-width: 220px;
}

.week-label {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 250px;
  min-height: 40px;
  padding: 0 12px;
  text-align: center;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  border-radius: 10px;
  background: rgba(var(--v-theme-on-surface), 0.04);
}

.status-filter {
  width: 170px;
}

@media (max-width: 1280px) {
  .planner-toolbar {
    grid-template-columns: 1fr 1fr;
  }

  .toolbar-actions {
    grid-column: 1 / -1;
    justify-content: flex-start;
  }
}

@media (max-width: 760px) {
  .planner-toolbar {
    grid-template-columns: 1fr;
    padding: 14px;
  }

  .toolbar-actions {
    grid-column: auto;
  }

  .toolbar-search,
  .week-controls,
  .toolbar-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .search-input,
  .status-filter {
    width: 100%;
    min-width: 0;
  }

  .week-label {
    order: -1;
    width: 100%;
    min-width: 0;
  }
}
</style>
