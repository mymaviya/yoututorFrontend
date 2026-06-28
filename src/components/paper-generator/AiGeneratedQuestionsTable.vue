<script setup>
defineProps({
  questions: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const selected = defineModel({
  type: Array,
  default: () => [],
})

const headers = [
  { title: 'Question', key: 'question', sortable: false },
  { title: 'Type', key: 'type', sortable: false },
  { title: 'Difficulty', key: 'difficulty', sortable: false },
  { title: 'Bloom', key: 'bloom_level', sortable: false },
  { title: 'Marks', key: 'marks', sortable: false },
  { title: 'Saved', key: 'saved_to_question_bank', sortable: false },
]
</script>

<template>
  <v-data-table
    v-model="selected"
    :headers="headers"
    :items="questions"
    :loading="loading"
    item-value="id"
    show-select
  >
    <template #item.question="{ item }">
      <div class="py-2">
        <div class="font-weight-medium" v-html="item.question" />

        <div class="text-caption text-grey mt-1">
          {{ item.lesson?.name || '-' }}
        </div>
      </div>
    </template>

    <template #item.type="{ item }">
      {{ item.type?.name || '-' }}
    </template>

    <template #item.marks="{ item }">
      {{ Number(item.marks || 0).toFixed(2) }}
    </template>

    <template #item.saved_to_question_bank="{ item }">
      <v-chip
        size="small"
        variant="tonal"
        :color="item.saved_to_question_bank ? 'success' : 'warning'"
      >
        {{ item.saved_to_question_bank ? 'Saved' : 'Pending' }}
      </v-chip>
    </template>
  </v-data-table>
</template>