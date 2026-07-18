<template>
  <div class="planner-toolbar">
    <div class="d-flex align-center ga-2 toolbar-block">
      <v-text-field
        :model-value="search"
        prepend-inner-icon="mdi-magnify"
        placeholder="Search teacher..."
        density="compact"
        variant="outlined"
        hide-details
        class="search-field"
        @update:model-value="$emit('update:search', $event)"
      />

      <v-btn icon="mdi-filter-variant" variant="tonal" />
    </div>

    <div class="d-flex align-center justify-center ga-2 toolbar-block week-controls">
      <v-btn icon="mdi-chevron-left" variant="tonal" @click="$emit('move-week', -1)" />

      <v-btn variant="tonal" @click="$emit('today')">
        Today
      </v-btn>

      <div class="week-label">
        <v-icon size="18" class="mr-2">mdi-calendar</v-icon>
        {{ weekLabel }}
      </div>

      <v-btn icon="mdi-chevron-right" variant="tonal" @click="$emit('move-week', 1)" />
    </div>

    <div class="d-flex align-center justify-end ga-2 toolbar-block">
      <v-btn-toggle
        :model-value="viewMode"
        density="compact"
        mandatory
        @update:model-value="$emit('update:viewMode', $event)"
      >
        <v-btn value="week">Week</v-btn>
        <v-btn value="month">Month</v-btn>
      </v-btn-toggle>

      <v-select
        :model-value="statusFilter"
        :items="statusFilterOptions"
        item-title="label"
        item-value="value"
        density="compact"
        variant="outlined"
        hide-details
        class="status-filter"
        @update:model-value="$emit('update:statusFilter', $event)"
      >
        <template #prepend-inner>
          <v-icon size="18">mdi-filter-variant</v-icon>
        </template>
      </v-select>

      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        @click="$emit('add-exception')"
      >
        Add Exception
      </v-btn>
    </div>
  </div>
</template>

<script setup>
defineProps({
  search: {
    type: String,
    default: '',
  },
  weekLabel: {
    type: String,
    default: '',
  },
  viewMode: {
    type: String,
    default: 'week',
  },
  statusFilter: {
    type: String,
    default: 'all',
  },
  statusFilterOptions: {
    type: Array,
    default: () => [],
  },
})

defineEmits([
  'update:search',
  'update:viewMode',
  'update:statusFilter',
  'move-week',
  'today',
  'add-exception',
])
</script>

<style scoped>
.planner-toolbar {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 16px;
  padding: 18px;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
}

.search-field,
.search-input {
  max-width: 280px;
  min-width: 220px;
}

.week-label {
  min-width: 270px;
  text-align: center;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
}

.status-filter {
  width: 160px;
}

@media (max-width: 1260px) {
  .planner-toolbar {
    grid-template-columns: 1fr;
  }

  .toolbar-block,
  .week-controls {
    justify-content: flex-start !important;
    flex-wrap: wrap;
  }
}
</style>
