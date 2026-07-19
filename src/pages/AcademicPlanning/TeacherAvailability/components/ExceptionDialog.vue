<template>
  <v-dialog
    :model-value="modelValue"
    max-width="720"
    persistent
    @update:model-value="handleDialogUpdate"
  >
    <v-card rounded="xl">
      <v-card-title class="dialog-title d-flex align-center justify-space-between ga-3">
        <div>
          <div class="text-h6 font-weight-bold">
            {{ isEditing ? 'Edit Exception' : 'Add Exception' }}
          </div>
          <div class="text-caption text-medium-emphasis">
            Record a teacher's leave, duty, meeting, training, or other unavailable period.
          </div>
        </div>

        <v-tooltip text="Close dialog">
          <template #activator="{ props: tooltipProps }">
            <v-btn
              v-bind="tooltipProps"
              icon="mdi-close"
              variant="text"
              :disabled="saving"
              aria-label="Close exception dialog"
              @click="closeDialog"
            />
          </template>
        </v-tooltip>
      </v-card-title>

      <v-divider />

      <v-form ref="formRef" @submit.prevent="submitForm">
        <v-card-text class="pt-5">
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
                prepend-inner-icon="mdi-account-outline"
                :rules="requiredRules"
                :disabled="saving"
                no-data-text="No teachers available"
                required
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.exception_date"
                type="date"
                label="Date"
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-calendar-outline"
                :rules="requiredRules"
                :disabled="saving"
                required
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
                prepend-inner-icon="mdi-list-status"
                :rules="requiredRules"
                :disabled="saving"
                required
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
                prepend-inner-icon="mdi-clock-outline"
                clearable
                :rules="periodRules"
                :disabled="saving || form.is_full_day"
                :hint="form.is_full_day ? 'Not required for a full-day exception.' : 'Select the affected period.'"
                persistent-hint
                no-data-text="No periods available"
              />
            </v-col>

            <v-col cols="12">
              <v-checkbox
                v-model="form.is_full_day"
                label="Full-day exception"
                density="compact"
                color="primary"
                :disabled="saving"
                hide-details
                @update:model-value="handleFullDayChange"
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model="form.reason"
                label="Reason"
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-text-box-outline"
                placeholder="Example: Assembly duty, department meeting, workshop"
                :rules="reasonRules"
                :disabled="saving"
                counter="150"
                maxlength="150"
                required
              />
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="form.remarks"
                label="Remarks"
                variant="outlined"
                rows="3"
                auto-grow
                prepend-inner-icon="mdi-note-text-outline"
                :disabled="saving"
                counter="500"
                maxlength="500"
                placeholder="Add any optional details or instructions."
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider />

        <v-card-actions class="dialog-actions pa-4">
          <v-btn
            v-if="isEditing"
            color="error"
            variant="tonal"
            prepend-icon="mdi-delete-outline"
            :disabled="saving"
            @click="emit('delete', form.id)"
          >
            Delete
          </v-btn>

          <v-spacer />

          <v-btn variant="text" :disabled="saving" @click="closeDialog">
            Cancel
          </v-btn>

          <v-btn
            color="primary"
            prepend-icon="mdi-content-save-outline"
            :loading="saving"
            :disabled="saving"
            type="submit"
          >
            {{ isEditing ? 'Update Exception' : 'Save Exception' }}
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  form: { type: Object, required: true },
  teachers: { type: Array, default: () => [] },
  bells: { type: Array, default: () => [] },
  saving: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'save', 'delete'])

const formRef = ref(null)

const isEditing = computed(() => Boolean(props.form?.id))

const requiredRules = [
  (value) => value !== null && value !== undefined && value !== '' || 'This field is required.',
]

const periodRules = computed(() => [
  (value) => props.form.is_full_day || Boolean(value) || 'Select a period or mark this as a full-day exception.',
])

const reasonRules = [
  (value) => Boolean(String(value || '').trim()) || 'Reason is required.',
  (value) => String(value || '').trim().length >= 3 || 'Reason must contain at least 3 characters.',
]

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

  const period = bell.period_number ? `P${bell.period_number}` : 'Period'
  const title = bell.title || bell.name || ''
  const time = bell.start_time && bell.end_time
    ? ` (${bell.start_time} - ${bell.end_time})`
    : ''

  return `${period}${title ? ` - ${title}` : ''}${time}`
}

const closeDialog = () => {
  if (props.saving) return
  emit('update:modelValue', false)
}

const handleDialogUpdate = (value) => {
  if (!value) closeDialog()
}

const handleFullDayChange = (isFullDay) => {
  if (isFullDay) props.form.school_bell_id = null
}

const submitForm = async () => {
  if (props.saving) return

  const result = await formRef.value?.validate()
  if (result?.valid) emit('save')
}
</script>

<style scoped>
.dialog-title {
  padding: 20px 24px;
}

.dialog-actions {
  flex-wrap: wrap;
  gap: 8px;
}

@media (max-width: 600px) {
  .dialog-title {
    align-items: flex-start !important;
    padding: 16px;
  }

  .dialog-actions {
    justify-content: flex-end;
  }

  .dialog-actions :deep(.v-spacer) {
    display: none;
  }

  .dialog-actions :deep(.v-btn) {
    flex: 1 1 auto;
  }
}
</style>
