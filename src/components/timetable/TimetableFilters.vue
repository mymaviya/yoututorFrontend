<script setup>
const props = defineProps({
  modelValue: { type: Object, default: () => ({}) },
  academicYears: { type: Array, default: () => [] },
  teachers: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'apply', 'reset'])

const set = (key, value) => {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}
</script>

<template>
  <v-card rounded="xl" border>
    <v-card-text class="pa-4">
      <v-row dense align="center">
        <v-col cols="12" md="5">
          <v-select
            label="Academic Year"
            :items="props.academicYears"
            item-title="name"
            item-value="id"
            :model-value="props.modelValue.academic_year_id"
            :loading="props.loading"
            :disabled="props.disabled"
            clearable
            hide-details
            @update:model-value="set('academic_year_id', $event)"
          />
        </v-col>

        <v-col cols="12" md="5">
          <v-select
            label="Teacher"
            :items="props.teachers"
            item-title="name"
            item-value="id"
            :model-value="props.modelValue.teacher_id"
            :loading="props.loading"
            :disabled="props.disabled"
            clearable
            hide-details
            @update:model-value="set('teacher_id', $event)"
          />
        </v-col>

        <v-col cols="12" md="2">
          <div class="filter-actions d-flex ga-2">
            <v-btn
              color="primary"
              class="flex-grow-1"
              :loading="props.loading"
              :disabled="props.disabled || !props.modelValue.teacher_id"
              @click="emit('apply')"
            >
              Apply
            </v-btn>

            <v-tooltip text="Reset filters" location="top">
              <template #activator="{ props: activatorProps }">
                <v-btn
                  v-bind="activatorProps"
                  icon="mdi-refresh"
                  variant="tonal"
                  aria-label="Reset filters"
                  :disabled="props.disabled || props.loading"
                  @click="emit('reset')"
                />
              </template>
            </v-tooltip>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<style scoped>
@media (max-width: 599px) {
  .filter-actions,
  .filter-actions :deep(.v-btn:first-child) {
    width: 100%;
  }
}
</style>
