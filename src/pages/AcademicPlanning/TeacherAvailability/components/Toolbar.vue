<template>
  <div class="planner-toolbar">
    <div class="d-flex align-center ga-2 flex-wrap">
      <v-text-field
        :model-value="search"
        prepend-inner-icon="mdi-magnify"
        placeholder="Search teacher..."
        density="compact"
        variant="outlined"
        hide-details
        class="search-input"
        @update:model-value="$emit('update:search', $event)"
      />

      <v-btn icon="mdi-filter-variant" variant="tonal" />
    </div>

    <div class="d-flex align-center ga-2 flex-wrap justify-center">
      <v-btn icon="mdi-chevron-left" variant="tonal" @click="$emit('previous')" />

      <v-btn variant="tonal" @click="$emit('today')">
        Today
      </v-btn>

      <div class="week-label">
        <v-icon size="18" class="mr-2">mdi-calendar</v-icon>
        {{ weekLabel }}
      </div>

      <v-btn icon="mdi-chevron-right" variant="tonal" @click="$emit('next')" />
    </div>

    <div class="d-flex align-center ga-2 flex-wrap justify-end">
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
      />

      <v-btn color="primary" prepend-icon="mdi-plus" :loading="loading" @click="$emit('add')">
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

defineEmits([
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
  grid-template-columns: 320px 1fr 440px;
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

@media (max-width: 1280px) {
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
