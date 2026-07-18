<template>
  <v-card rounded="xl">
    <v-card-title class="text-subtitle-1 font-weight-bold">
      Teacher Workload
    </v-card-title>

    <v-card-text>
      <div
        v-for="item in items"
        :key="item.teacher?.id"
        class="mb-4"
      >
        <div class="d-flex justify-space-between mb-1">
          <span class="font-weight-medium">
            {{ item.teacher?.name }}
          </span>

          <span class="text-caption text-medium-emphasis">
            {{ item.workload?.today || 0 }} periods
          </span>
        </div>

        <v-progress-linear
          :model-value="percentage(item.workload?.today || 0)"
          height="10"
          rounded
          color="primary"
        />
      </div>

      <v-alert
        v-if="!items.length"
        type="info"
        variant="tonal"
      >
        No workload data available.
      </v-alert>
    </v-card-text>
  </v-card>
</template>

<script setup>
defineProps({
  items: {
    type: Array,
    default: () => [],
  },
})

const percentage = (value) => {
  return Math.min((Number(value) / 8) * 100, 100)
}
</script>