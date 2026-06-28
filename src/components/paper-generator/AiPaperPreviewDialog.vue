<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  generation: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue'])

const close = () => {
  emit('update:modelValue', false)
}
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    max-width="1000"
    scrollable
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card class="rounded-xl">
      <v-card-title class="d-flex justify-space-between align-center">
        <div>
          <div class="text-h6 font-weight-bold">
            {{ generation?.title || 'AI Generated Paper' }}
          </div>

          <div class="text-caption text-grey">
            {{ generation?.total_questions || 0 }} Questions ·
            {{ generation?.total_marks || 0 }} Marks
          </div>
        </div>

        <v-btn
          icon="mdi-close"
          variant="text"
          @click="close"
        />
      </v-card-title>

      <v-divider />

      <v-card-text>
        <v-alert
          v-if="!generation?.questions?.length"
          type="info"
          variant="tonal"
        >
          No generated questions found.
        </v-alert>

        <div
          v-for="(question, index) in generation?.questions || []"
          :key="question.id"
          class="mb-5"
        >
          <v-card variant="outlined" class="rounded-lg">
            <v-card-text>
              <div class="d-flex justify-space-between align-center mb-2">
                <div class="font-weight-bold">
                  Q{{ index + 1 }}.
                  <span v-html="question.question" />
                </div>

                <v-chip size="small" color="primary" variant="tonal">
                  {{ question.marks }} Marks
                </v-chip>
              </div>

              <div class="text-caption text-grey mb-2">
                {{ question.type?.name || '-' }}
                · {{ question.difficulty || '-' }}
                · {{ question.bloom_level || '-' }}
              </div>

              <div
                v-if="question.options?.length"
                class="mt-3"
              >
                <div class="font-weight-medium mb-1">
                  Options
                </div>

                <v-list density="compact">
                  <v-list-item
                    v-for="(option, optionIndex) in question.options"
                    :key="optionIndex"
                  >
                    <template #prepend>
                      <v-chip
                        size="x-small"
                        :color="option.is_correct ? 'success' : 'default'"
                        variant="tonal"
                      >
                        {{ String.fromCharCode(65 + optionIndex) }}
                      </v-chip>
                    </template>

                    <v-list-item-title>
                      {{ option.option_text }}
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </div>

              <div
                v-if="question.match_pairs?.length"
                class="mt-3"
              >
                <div class="font-weight-medium mb-1">
                  Match Pairs
                </div>

                <v-table density="compact">
                  <tbody>
                    <tr
                      v-for="(pair, pairIndex) in question.match_pairs"
                      :key="pairIndex"
                    >
                      <td>{{ pair.left_value }}</td>
                      <td>{{ pair.right_value }}</td>
                    </tr>
                  </tbody>
                </v-table>
              </div>

              <v-divider class="my-3" />

              <div>
                <div class="font-weight-medium">
                  Answer
                </div>

                <div v-html="question.answer || '-'" />
              </div>

              <div class="mt-3">
                <div class="font-weight-medium">
                  Explanation
                </div>

                <div v-html="question.explanation || '-'" />
              </div>
            </v-card-text>
          </v-card>
        </div>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer />

        <v-btn
          variant="text"
          @click="close"
        >
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>