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
          :key="item.key"
          class="legend-item d-inline-flex align-center"
        >
          <span
            class="legend-indicator"
            :class="[`legend-indicator--${item.shape || 'dot