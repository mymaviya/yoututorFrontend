<script setup>
import MathContent from "../../../components/common/MathContent.vue";

const props = defineProps({
  modelValue: Boolean,
  question: Object,
});

const emit = defineEmits(["update:modelValue"]);

const close = () => {
  emit("update:modelValue", false);
};

const isCorrectOption = (option) => {
  return Number(option.is_correct) === 1 || option.is_correct === true;
};
</script>

<template>
  <v-navigation-drawer
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    location="right"
    temporary
    width="700"
  >
    <div class="pa-4">
      <!-- HEADER -->

      <div class="d-flex justify-space-between align-center">
        <div>
          <div class="text-h6 font-weight-bold">Question Preview</div>

          <div class="text-caption text-grey">Complete Question Details</div>
        </div>

        <v-btn icon="mdi-close" variant="text" @click="close" />
      </div>

      <v-divider class="my-4" />

      <!-- BASIC INFO -->

      <div class="d-flex flex-wrap ga-2 mb-4">
        <v-chip color="primary">
          {{ question?.grade?.name }}
        </v-chip>

        <v-chip color="secondary">
          {{ question?.subject?.name }}
        </v-chip>

        <v-chip color="info">
          {{
            question?.lesson?.title ||
            question?.lesson?.name ||
            "Lesson Not Available"
          }}
        </v-chip>

        <v-chip color="success">
          {{ question?.type }}
        </v-chip>

        <v-chip color="warning">
          {{ question?.difficulty }}
        </v-chip>

        <v-chip color="purple"> {{ question?.marks }} Marks </v-chip>
      </div>

      <!-- QUESTION -->

      <v-card class="mb-4" variant="outlined">
        <v-card-title> Question </v-card-title>

        <v-divider />

        <v-card-text>
          <MathContent :html="question?.question" />
        </v-card-text>
      </v-card>

      <!-- OPTIONS -->

      <v-card
        v-if="question?.type === 'mcq' || question?.type === 'multiple_mcq'"
        class="mb-4"
        variant="outlined"
      >
        <v-card-title> Options </v-card-title>

        <v-divider />

        <v-list>
          <v-list-item
            v-for="(option, index) in question.options || []"
            :key="option.id || index"
            :class="{ 'correct-option': isCorrectOption(option) }"
          >
            <template #prepend>
              <v-icon :color="isCorrectOption(option) ? 'success' : 'grey'">
                {{
                  isCorrectOption(option)
                    ? "mdi-check-circle"
                    : "mdi-circle-outline"
                }}
              </v-icon>
            </template>

            <MathContent :html="option.option_text" />
          </v-list-item>
        </v-list>
      </v-card>

      <!-- ANSWER -->

      <v-card v-if="question?.answer" class="mb-4" variant="outlined">
        <v-card-title> Answer </v-card-title>

        <v-divider />

        <v-card-text>
          <MathContent :html="question.answer" />
        </v-card-text>
      </v-card>

      <!-- EXPLANATION -->

      <v-card v-if="question?.explanation" variant="outlined">
        <v-card-title> Explanation </v-card-title>

        <v-divider />

        <v-card-text>
          <MathContent :html="question.explanation" />
        </v-card-text>
      </v-card>
    </div>
  </v-navigation-drawer>
</template>
<style scoped>
.correct-option {
  background: rgba(76, 175, 80, 0.12);
  border-radius: 10px;
}
</style>
