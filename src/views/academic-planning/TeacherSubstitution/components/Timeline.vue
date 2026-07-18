<template>
  <v-dialog
    :model-value="modelValue"
    max-width="620"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card rounded="xl">
      <v-card-title class="d-flex align-center justify-space-between">
        <span>Substitution Timeline</span>

        <v-btn
          icon="mdi-close"
          variant="text"
          @click="$emit('update:modelValue', false)"
        />
      </v-card-title>

      <v-divider />

      <v-card-text>
        <v-timeline side="end" density="compact">
          <v-timeline-item
            dot-color="primary"
            icon="mdi-calendar-plus"
          >
            <div class="font-weight-bold">Substitution Created</div>
            <div class="text-caption text-medium-emphasis">
              {{ substitution?.created_at || '-' }}
            </div>
          </v-timeline-item>

          <v-timeline-item
            v-if="substitution?.substitute_teacher"
            dot-color="success"
            icon="mdi-account-check"
          >
            <div class="font-weight-bold">Substitute Assigned</div>
            <div class="text-caption text-medium-emphasis">
              {{ substitution.substitute_teacher?.name }}
            </div>
          </v-timeline-item>

          <v-timeline-item
            v-if="substitution?.approved_at"
            dot-color="info"
            icon="mdi-check-decagram"
          >
            <div class="font-weight-bold">Approved / Completed</div>
            <div class="text-caption text-medium-emphasis">
              {{ substitution.approved_at }}
            </div>
          </v-timeline-item>

          <v-timeline-item
            v-if="substitution?.status === 'cancelled'"
            dot-color="error"
            icon="mdi-close-circle"
          >
            <div class="font-weight-bold">Cancelled</div>
            <div class="text-caption text-medium-emphasis">
              {{ substitution.remarks || 'No remarks' }}
            </div>
          </v-timeline-item>
        </v-timeline>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  substitution: {
    type: Object,
    default: null,
  },
})

defineEmits(['update:modelValue'])
</script>