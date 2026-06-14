<template>
  <v-card class="pa-4 mb-6 rounded-xl" elevation="0">
    <div class="d-flex justify-space-between align-center mb-4">
      <div>
        <div class="text-h6 font-weight-bold">
          {{ title }}
        </div>

        <div class="text-caption text-grey">
          {{ subtitle }}
        </div>
      </div>
    </div>

    <v-row class="align-end">
      <v-col cols="12" :md="showGenerateButton ? 9 : 12">
        <v-select :model-value="modelValue" :items="blueprints" item-title="name" item-value="id"
          label="Select Blueprint" variant="outlined" density="comfortable" hide-details clearable :disabled="disabled"
          @update:model-value="$emit('update:modelValue', $event)" />
      </v-col>

      <v-col v-if="showGenerateButton" cols="12" md="3">
        <v-btn block color="primary" size="large" prepend-icon="mdi-auto-fix" :loading="loading"
          :disabled="!modelValue || hasInsufficientExactQuestions" @click="$emit('generate')">
          Generate
        </v-btn>
      </v-col>
    </v-row>

    <v-card v-if="selectedBlueprint" class="mt-4 rounded-xl" variant="outlined">
      <v-card-text>
        <div class="d-flex align-center flex-wrap ga-2 mb-2">
          <v-chip color="primary" variant="tonal">
            {{ selectedBlueprint.name || selectedBlueprint.title }}
          </v-chip>

          <v-chip variant="tonal">
            {{ selectedBlueprint.grade?.name }}
          </v-chip>

          <v-chip variant="tonal">
            {{ selectedBlueprint.subject?.name }}
          </v-chip>

          <v-chip v-if="selectedBlueprint.exam_name" variant="tonal">
            {{ selectedBlueprint.exam_name?.name }}
          </v-chip>

          <v-spacer />

          <v-switch :model-value="moderateDifficultyMode" color="warning" true-icon="mdi-check" density="compact"
            hide-details inset class="moderate-switch" label="Moderate Mode"
            @update:model-value="$emit('update:moderateDifficultyMode', $event)" />
        </div>

        <v-alert v-if="hasInsufficientExactQuestions" type="warning" variant="tonal" class="mb-4">
          Some blueprint rows do not have enough matching approved questions.
        </v-alert>

        <v-alert v-else type="info" variant="tonal" class="mb-4">
          Blueprint:
          <strong>{{ blueprintTotalQuestions }}</strong>
          Questions |
          <strong>{{ blueprintTotalMarks }}</strong>
          Marks
        </v-alert>

        <v-table v-if="selectedBlueprint?.sections?.length" density="compact">
          <thead>
            <tr>
              <th>Section</th>
              <th>Question Type</th>
              <th>Difficulty</th>
              <th>Qty</th>
              <th>Marks</th>
              <th>Total</th>
              <th>Available</th>
              <th>Status</th>
              <th>Bloom Status</th>
            </tr>
          </thead>

          <tbody>
            <template v-for="section in selectedBlueprint.sections" :key="section.id">
              <tr v-for="item in section.items || []" :key="item.id">
                <td>{{ section.section_name }}</td>
                <td>{{ item.question_type_name || item.question_type }}</td>
                <td>
                  <span v-if="moderateDifficultyMode">Bypassed</span>
                  <span v-else>{{ item.difficulty || '-' }}</span>
                </td>
                <td>{{ item.question_count }}</td>
                <td>{{ item.marks_per_question }}</td>
                <td>
                  {{
                    Number(item.question_count || 0) *
                    Number(item.marks_per_question || 0)
                  }}
                </td>
                <td>
                  <v-chip size="small" :color="getCurrentRowCount(section.section_name, item) >= Number(item.question_count || 0) ||
                      Number(item.available_questions || 0) >= Number(item.question_count || 0)
                      ? 'success'
                      : 'error'
                    " variant="tonal">
                    {{ item.available_questions || 0 }}
                  </v-chip>
                </td>
                <td>
                  <v-chip size="small" :color="getRowStatusColor(section.section_name, item)" variant="tonal">
                    {{ getCurrentRowCount(section.section_name, item) }}/{{ item.question_count }}
                  </v-chip>
                </td>
                <td>
                  <div v-if="hasBloomRules(item)" class="d-flex flex-wrap ga-1">
                    <v-chip v-for="rule in item.bloom_levels" :key="`${item.id}-${rule.bloom_level}`" size="small"
                      :color="getBloomStatusColor(section.section_name, item, rule)" variant="tonal">
                      {{ formatBloom(rule.bloom_level) }}
                      {{ getCurrentBloomCount(section.section_name, item, rule) }}/{{ rule.calculated_count }}
                    </v-chip>
                  </div>

                  <v-chip v-else size="small" variant="tonal">
                    Not Applied
                  </v-chip>
                </td>
              </tr>
            </template>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>
  </v-card>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  modelValue: {
    type: [Number, String, null],
    default: null,
  },

  moderateDifficultyMode: {
    type: Boolean,
    default: false,
  },

  currentSections: {
    type: Array,
    default: () => [],
  },

  blueprints: {
    type: Array,
    default: () => [],
  },

  selectedBlueprint: {
    type: Object,
    default: null,
  },

  loading: {
    type: Boolean,
    default: false,
  },

  disabled: {
    type: Boolean,
    default: false,
  },

  showGenerateButton: {
    type: Boolean,
    default: true,
  },

  title: {
    type: String,
    default: "Generate from Blueprint",
  },

  subtitle: {
    type: String,
    default: "Select a blueprint to preview its pattern and generate paper automatically.",
  },
});

defineEmits([
  "update:modelValue",
  "update:moderateDifficultyMode",
  "generate",
]);

const normalize = (value) => String(value || "").trim().toLowerCase();

const formatBloom = (value) => {
  const label = String(value || "");
  return label.charAt(0).toUpperCase() + label.slice(1);
};

const hasBloomRules = (item) => {
  return Array.isArray(item?.bloom_levels) && item.bloom_levels.length > 0;
};

const questionMatchesItem = (question, item) => {
  const qType = normalize(question.type || question.question_type);
  const itemType = normalize(item.question_type);

  if (qType !== itemType) return false;

  if (!props.moderateDifficultyMode && item.difficulty) {
    return normalize(question.difficulty || question.difficulty_level) === normalize(item.difficulty);
  }

  return true;
};

const getPaperSection = (sectionName) => {
  return props.currentSections.find(
    (section) => normalize(section.name) === normalize(sectionName)
  );
};

const getCurrentRowCount = (sectionName, item) => {
  const paperSection = getPaperSection(sectionName);

  if (!paperSection) return 0;

  return paperSection.questions.filter((q) => questionMatchesItem(q, item)).length;
};

const getRowStatusColor = (sectionName, item) => {
  const current = getCurrentRowCount(sectionName, item);
  const required = Number(item.question_count || 0);

  if (current === required) return "success";
  if (current > required) return "error";
  return "warning";
};

const getCurrentBloomCount = (sectionName, item, rule) => {
  const paperSection = getPaperSection(sectionName);

  if (!paperSection) return 0;

  return paperSection.questions.filter((q) => {
    return (
      questionMatchesItem(q, item) &&
      normalize(q.bloom_level || q.bloom) === normalize(rule.bloom_level)
    );
  }).length;
};

const getBloomStatusColor = (sectionName, item, rule) => {
  const current = getCurrentBloomCount(sectionName, item, rule);
  const required = Number(rule.calculated_count || 0);

  if (current === required) return "success";
  if (current > required) return "error";
  return "warning";
};

const blueprintTotalQuestions = computed(() => {
  if (!props.selectedBlueprint?.sections?.length) return 0;

  return props.selectedBlueprint.sections.reduce((total, section) => {
    return total + (section.items || []).reduce((sum, item) => {
      return sum + Number(item.question_count || 0);
    }, 0);
  }, 0);
});

const blueprintTotalMarks = computed(() => {
  if (!props.selectedBlueprint?.sections?.length) return 0;

  return props.selectedBlueprint.sections.reduce((total, section) => {
    return total + (section.items || []).reduce((sum, item) => {
      return sum + Number(item.question_count || 0) * Number(item.marks_per_question || 0);
    }, 0);
  }, 0);
});

const hasInsufficientExactQuestions = computed(() => {
  if (!props.selectedBlueprint?.sections?.length) return false;

  return props.selectedBlueprint.sections.some((section) => {
    return (section.items || []).some((item) => {
      const required = Number(item.question_count || 0);

      const current = getCurrentRowCount(section.section_name, item);

      // If paper already has required questions, no warning
      if (current >= required) {
        return false;
      }

      // Only show warning before generation when available is actually less
      return Number(item.available_questions || 0) < required;
    });
  });
});
</script>

<style scoped>
.moderate-switch {
  margin-top: -4px;
}
</style>