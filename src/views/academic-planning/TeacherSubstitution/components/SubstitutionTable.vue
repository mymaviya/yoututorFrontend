<template>
  <v-card rounded="xl">
    <v-card-title class="d-flex align-center justify-space-between flex-wrap ga-2">
      <div>
        <div class="text-subtitle-1 font-weight-bold">
          Substitution Assignments
        </div>
        <div class="text-caption text-medium-emphasis">
          Manage daily teacher substitutions
        </div>
      </div>

      <v-chip color="primary" variant="tonal">
        {{ items.length }} Records
      </v-chip>
    </v-card-title>

    <v-divider />

    <v-data-table
      :headers="headers"
      :items="items"
      :loading="loading"
      density="comfortable"
      class="substitution-table"
    >
      <template #item.substitution_date="{ item }">
        {{ formatDate(item.substitution_date) }}
      </template>

      <template #item.bell="{ item }">
        <div class="font-weight-medium">
          {{ item.bell ? `P${item.bell.period_number}` : '-' }}
        </div>
        <div class="text-caption text-medium-emphasis">
          {{ item.bell?.title || '' }}
        </div>
      </template>

      <template #item.absent_teacher="{ item }">
        <div class="d-flex align-center ga-2">
          <v-avatar color="error" variant="tonal" size="34">
            {{ initials(item.absent_teacher?.name) }}
          </v-avatar>

          <div>
            <div class="font-weight-medium">
              {{ item.absent_teacher?.name || '-' }}
            </div>
            <div class="text-caption text-medium-emphasis">
              {{ item.reason || 'Unavailable' }}
            </div>
          </div>
        </div>
      </template>

      <template #item.class="{ item }">
        <div class="font-weight-medium">
          {{ classLabel(item) }}
        </div>
        <div class="text-caption text-medium-emphasis">
          {{ item.subject?.name || '-' }}
        </div>
      </template>

      <template #item.substitute_teacher="{ item }">
        <div
          v-if="item.substitute_teacher"
          class="d-flex align-center ga-2"
        >
          <v-avatar color="success" variant="tonal" size="34">
            {{ initials(item.substitute_teacher?.name) }}
          </v-avatar>

          <div>
            <div class="font-weight-medium">
              {{ item.substitute_teacher?.name }}
            </div>
            <div class="text-caption text-medium-emphasis">
              Substitute
            </div>
          </div>
        </div>

        <v-chip
          v-else
          color="warning"
          size="small"
          variant="tonal"
          prepend-icon="mdi-alert"
        >
          Not Assigned
        </v-chip>
      </template>

      <template #item.status="{ item }">
        <StatusChip :status="item.status" />
      </template>

      <template #item.actions="{ item }">
        <div class="d-flex ga-1 justify-end">
          <v-btn
            icon="mdi-account-plus"
            size="small"
            variant="text"
            color="primary"
            title="Assign Substitute"
            @click="$emit('assign', item)"
          />

          <v-btn
            icon="mdi-eye"
            size="small"
            variant="text"
            title="View Timeline"
            @click="$emit('view', item)"
          />

          <v-btn
            v-if="item.status === 'assigned'"
            icon="mdi-check-decagram"
            size="small"
            variant="text"
            color="success"
            title="Approve"
            @click="$emit('approve', item)"
          />

          <v-btn
            v-if="item.status !== 'cancelled'"
            icon="mdi-close-circle"
            size="small"
            variant="text"
            color="error"
            title="Cancel"
            @click="$emit('cancel', item)"
          />
        </div>
      </template>
    </v-data-table>
  </v-card>
</template>

<script setup>
import { formatDate } from '../../../../utils/date'
import StatusChip from './StatusChip.vue'

defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

defineEmits([
  'assign',
  'view',
  'approve',
  'cancel',
])

const headers = [
  { title: 'Date', key: 'substitution_date' },
  { title: 'Period', key: 'bell' },
  { title: 'Absent Teacher', key: 'absent_teacher' },
  { title: 'Class / Subject', key: 'class' },
  { title: 'Substitute Teacher', key: 'substitute_teacher' },
  { title: 'Status', key: 'status' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
]

const initials = (name) => {
  return String(name || '-')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

const classLabel = (item) => {
  const grade = item.grade?.name || ''
  const section = item.section?.name || ''

  return [grade, section].filter(Boolean).join('-') || '-'
}
</script>

<style scoped>
.substitution-table :deep(th) {
  white-space: nowrap;
}

.substitution-table :deep(td) {
  vertical-align: middle;
}
</style>