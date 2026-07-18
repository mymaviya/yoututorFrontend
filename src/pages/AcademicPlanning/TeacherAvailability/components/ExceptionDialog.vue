<template>
  <v-dialog
    :model-value="modelValue"
    max-width="720"
    persistent
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card rounded="xl">
      <v-card-title class="d-flex align-center justify-space-between">
        <span>{{ form.id ? 'Edit Exception' : 'Add Exception' }}</span>

        <v-btn icon="mdi-close" variant="text" @click="$emit('update:modelValue', false)" />
      </v-card-title>

      <v-divider />

      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-select
              v-model="form.teacher_id"
              :items="teachers"
              item-title="name"
              item-value="id"
              label="Teacher"
              variant="outlined"
              density="compact"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.exception_date"
              type="date"
              label="Date"
              variant="outlined"
              density="compact"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-select
              v-model="form.status"
              :items="statusOptions"
              item-title="label"
              item-value="value"
              label="Status"
              variant="outlined"
              density="compact"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-select
              v-model="form.school_bell_id"
              :items="bells"
              :item-title="bellTitle"
              item-value="id"
              label="Period"
              variant="outlined"
              density="compact"
              clearable
              :disabled="form.is_full_day"
            />
          </v-col>

          <v-col cols="12">
            <v-checkbox v-model="form.is_full_day" label="Full day exception" density="compact" hide-details />
          </v-col>

          <v-col cols="12">
            <v-text-field
              v-model="form.reason"
              label="Reason"
              variant="outlined"
              density="compact"
              placeholder="Example: Assembly duty, Department meeting, Workshop"
            />
          </v-col>

          <v-col cols="12">
            <v-textarea v-model="form.remarks" label="Remarks" variant="outlined" rows="3" />
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-btn
          v-if="form.id"
          color="error"
          variant="tonal"
          prepend-icon="mdi-delete"
          @click="$emit('delete', form.id)"
        >
          Delete
        </v-btn>

        <v-spacer />

        <v-btn variant="text" @click="$emit('update:modelValue', false)">
          Cancel
        </v-btn>

        <v-btn color="primary" prepend-icon="mdi-content-save" :loading="saving" @click="$emit('save')">
          Save Exception
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
  form: { type: Object, required: true },
  teachers: { type: Array, default: () => [] },
  bells: { type: Array, default: () => [] },
  saving: { type: Boolean, default: false },
})

defineEmits(['update:modelValue', 'save', 'delete'])

const statusOptions = [
  { label: 'Busy / Duty', value: 'busy' },
  { label: 'Leave', value: 'leave' },
  { label: 'Meeting', value: 'meeting' },
  { label: 'Training', value: 'training' },
  { label: 'Exam Duty', value: 'exam_duty' },
  { label: 'Assembly', value: 'assembly' },
  { label: 'Extra Class', value: 'extra_class' },
  { label: 'Blocked', value: 'blocked' },
]

const bellTitle = (bell) => {
  if (!bell) return ''
  return `P${bell.period_number} - ${bell.title}`
}
</script>
