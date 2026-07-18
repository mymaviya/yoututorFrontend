<template>
  <v-navigation-drawer
    :model-value="modelValue"
    location="right"
    temporary
    width="460"
    class="suggestion-drawer"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="drawer-header">
      <div>
        <div class="text-h6 font-weight-bold">Assign Substitute</div>
        <div class="text-caption text-medium-emphasis">
          AI-ranked teacher suggestions
        </div>
      </div>

      <v-btn
        icon="mdi-close"
        variant="text"
        @click="$emit('update:modelValue', false)"
      />
    </div>

    <v-divider />

    <div class="drawer-body">
      <v-card
        v-if="substitution"
        rounded="xl"
        variant="tonal"
        color="primary"
        class="mb-4"
      >
        <v-card-text>
          <div class="text-caption">Absent Teacher</div>
          <div class="text-subtitle-1 font-weight-bold">
            {{ substitution.absent_teacher?.name || '-' }}
          </div>

          <div class="text-caption mt-2">
            {{ classLabel }} • {{ substitution.subject?.name || 'Subject' }}
          </div>

          <div class="text-caption">
            {{ substitution.bell ? `P${substitution.bell.period_number}` : '-' }}
            • {{ substitution.substitution_date }}
          </div>

          <v-chip
            class="mt-3"
            size="small"
            color="error"
            variant="flat"
          >
            {{ substitution.reason || 'Leave / Unavailable' }}
          </v-chip>
        </v-card-text>
      </v-card>

      <div class="d-flex align-center justify-space-between mb-3">
        <div class="text-subtitle-2 font-weight-bold">
          Suggested Teachers
        </div>

        <v-chip size="small" color="primary" variant="tonal">
          {{ suggestions.length }} Found
        </v-chip>
      </div>

      <v-skeleton-loader
        v-if="loading"
        type="card, card, card"
      />

      <template v-else>
        <TeacherCard
          v-for="item in suggestions"
          :key="item.teacher.id"
          :teacher="item.teacher"
          :score="item.score"
          :workload="item.workload"
          :reasons="item.reasons"
          :warnings="item.warnings"
          :subject-match="item.subject_match"
          @assign="$emit('assign', $event)"
        />

        <v-alert
          v-if="!suggestions.length"
          type="info"
          variant="tonal"
        >
          No available substitute teachers found for this period.
        </v-alert>
      </template>
    </div>
  </v-navigation-drawer>
</template>

<script setup>
import { computed } from 'vue'
import TeacherCard from './TeacherCard.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  substitution: {
    type: Object,
    default: null,
  },
  suggestions: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

defineEmits([
  'update:modelValue',
  'assign',
])

const classLabel = computed(() => {
  if (!props.substitution) return '-'

  const grade = props.substitution.grade?.name || ''
  const section = props.substitution.section?.name || ''

  return [grade, section].filter(Boolean).join('-') || 'Class'
})
</script>

<style scoped>
.suggestion-drawer {
  border-left: 1px solid rgba(var(--v-border-color), 0.14);
}

.drawer-header {
  min-height: 76px;
  padding: 16px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.drawer-body {
  height: calc(100vh - 77px);
  overflow-y: auto;
  padding: 18px;
}
</style>