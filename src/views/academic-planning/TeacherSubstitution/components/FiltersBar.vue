<template>
  <v-card rounded="xl">
    <v-card-text>
      <div class="d-flex align-center justify-space-between flex-wrap ga-3">
        <div>
          <div class="text-h6 font-weight-bold">
            Teacher Substitution Command Center
          </div>
          <div class="text-caption text-medium-emphasis">
            Assign substitute teachers for leave, busy periods and timetable conflicts.
          </div>
        </div>

        <div class="d-flex align-center flex-wrap ga-2">
          <v-text-field
            :model-value="date"
            type="date"
            label="Date"
            density="compact"
            variant="outlined"
            hide-details
            style="width: 170px"
            @update:model-value="$emit('update:date', $event)"
          />

          <v-select
            :model-value="status"
            :items="statuses"
            label="Status"
            density="compact"
            variant="outlined"
            hide-details
            clearable
            style="width: 170px"
            @update:model-value="$emit('update:status', $event)"
          />

          <v-btn
            variant="tonal"
            prepend-icon="mdi-refresh"
            @click="$emit('refresh')"
          >
            Refresh
          </v-btn>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
defineProps({
  date: {
    type: String,
    default: '',
  },
  grade: {
    type: [String, Number, null],
    default: null,
  },
  status: {
    type: String,
    default: null,
  },
})

defineEmits([
  'update:date',
  'update:grade',
  'update:status',
  'refresh',
])

const statuses = [
  { title: 'Pending', value: 'pending' },
  { title: 'Assigned', value: 'assigned' },
  { title: 'Completed', value: 'completed' },
  { title: 'Cancelled', value: 'cancelled' },
]
</script>