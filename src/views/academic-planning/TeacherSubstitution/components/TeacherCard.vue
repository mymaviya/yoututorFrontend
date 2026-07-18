<template>
  <v-card
    rounded="xl"
    class="teacher-card mb-3"
    :class="{ selected: selected }"
    elevation="2"
  >
    <v-card-text class="pa-4">

      <!-- Header -->
      <div class="d-flex justify-space-between align-start">

        <div class="d-flex">

          <v-avatar
            color="primary"
            size="52"
            class="me-3"
          >
            <span class="text-subtitle-1 font-weight-bold">
              {{ initials }}
            </span>
          </v-avatar>

          <div>

            <div class="text-subtitle-1 font-weight-bold">
              {{ teacher.name }}
            </div>

            <div class="text-caption text-medium-emphasis">
              {{ teacher.email }}
            </div>

          </div>

        </div>

        <v-chip
          color="primary"
          variant="flat"
          prepend-icon="mdi-star"
        >
          {{ score }}%
        </v-chip>

      </div>

      <v-divider class="my-4" />

      <!-- Reasons -->

      <div
        v-if="reasons.length"
        class="mb-4"
      >

        <div
          v-for="reason in reasons"
          :key="reason"
          class="d-flex align-center mb-2"
        >

          <v-icon
            color="success"
            size="18"
            class="me-2"
          >
            mdi-check-circle
          </v-icon>

          <span class="text-body-2">
            {{ reason }}
          </span>

        </div>

      </div>

      <!-- Warnings -->

      <div
        v-if="warnings.length"
        class="mb-4"
      >

        <div
          v-for="warning in warnings"
          :key="warning"
          class="d-flex align-center mb-2"
        >

          <v-icon
            color="warning"
            size="18"
            class="me-2"
          >
            mdi-alert-circle
          </v-icon>

          <span class="text-body-2">
            {{ warning }}
          </span>

        </div>

      </div>

      <!-- Workload -->

      <div class="mb-4">

        <div class="d-flex justify-space-between mb-1">

          <span class="text-caption">
            Today's Workload
          </span>

          <strong>
            {{ workload.today }} Periods
          </strong>

        </div>

        <v-progress-linear
          :model-value="todayPercentage"
          rounded
          height="10"
          color="primary"
        />

      </div>

      <div class="mb-5">

        <div class="d-flex justify-space-between mb-1">

          <span class="text-caption">
            Monthly Substitutions
          </span>

          <strong>
            {{ workload.monthly_substitutions }}
          </strong>

        </div>

        <v-progress-linear
          :model-value="monthPercentage"
          rounded
          height="10"
          color="orange"
        />

      </div>

      <!-- Footer -->

      <div class="d-flex justify-space-between align-center">

        <v-chip
          v-if="subjectMatch"
          color="success"
          variant="tonal"
        >
          Same Subject
        </v-chip>

        <v-spacer />

        <v-btn
          color="primary"
          prepend-icon="mdi-account-check"
          @click="$emit('assign', teacher.id)"
        >
          Assign
        </v-btn>

      </div>

    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({

  teacher: {
    type: Object,
    required: true,
  },

  score: {
    type: Number,
    default: 0,
  },

  workload: {
    type: Object,
    default: () => ({
      today: 0,
      monthly_substitutions: 0,
    }),
  },

  reasons: {
    type: Array,
    default: () => [],
  },

  warnings: {
    type: Array,
    default: () => [],
  },

  subjectMatch: {
    type: Boolean,
    default: false,
  },

  selected: {
    type: Boolean,
    default: false,
  },

})

defineEmits([
  'assign',
])

const initials = computed(() => {
  return props.teacher.name
    ?.split(' ')
    .map(v => v[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
})

const todayPercentage = computed(() => {
  return Math.min((props.workload.today / 8) * 100, 100)
})

const monthPercentage = computed(() => {
  return Math.min((props.workload.monthly_substitutions / 20) * 100, 100)
})
</script>

<style scoped>

.teacher-card{

    transition:.18s;

    border:1px solid rgba(var(--v-border-color),.14);

}

.teacher-card:hover{

    transform:translateY(-2px);

    box-shadow:0 12px 28px rgba(0,0,0,.12);

}

.selected{

    border:2px solid rgb(var(--v-theme-primary));

}

</style>