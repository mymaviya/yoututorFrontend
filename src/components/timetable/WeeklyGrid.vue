<template>
  <v-card class="weekly-grid" rounded="xl" border>
    <v-card-title class="d-flex flex-wrap align-center justify-space-between ga-3 px-5 py-4">
      <div>
        <div class="text-h6 font-weight-bold">Weekly Timetable</div>
        <div class="text-body-2 text-medium-emphasis">
          View assigned classes, subjects, rooms, and free periods for the selected week.
        </div>
      </div>

      <div class="d-flex align-center ga-2">
        <v-chip
          v-if="conflictCount"