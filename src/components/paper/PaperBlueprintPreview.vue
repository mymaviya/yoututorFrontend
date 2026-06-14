<script setup>
import { computed } from "vue";

const props = defineProps({
  blueprint: {
    type: Object,
    required: true,
  },
});

const totalQuestions = computed(() => {
  return (props.blueprint.sections || []).reduce((sum, section) => {
    return (
      sum +
      (section.items || []).reduce(
        (s, item) => s + Number(item.question_count || 0),
        0
      )
    );
  }, 0);
});

const totalMarks = computed(() => {
  return (props.blueprint.sections || []).reduce((sum, section) => {
    return (
      sum +
      (section.items || []).reduce((s, item) => {
        return (
          s +
          Number(item.question_count || 0) *
            Number(item.marks_per_question || 0)
        );
      }, 0)
    );
  }, 0);
});

const bloomColors = {
  remember: "deep-purple",
  understand: "blue",
  apply: "green",
  analyze: "orange",
  evaluate: "amber",
  create: "pink",
};

const formatBloom = (value) => {
  const text = String(value || "");
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const bloomSummary = computed(() => {
  const summary = {};

  (props.blueprint.sections || []).forEach((section) => {
    (section.items || []).forEach((item) => {
      (item.bloom_levels || []).forEach((bloom) => {
        const key = bloom.bloom_level;

        if (!summary[key]) {
          summary[key] = {
            bloom_level: key,
            percentage: 0,
            calculated_count: 0,
          };
        }

        summary[key].calculated_count += Number(bloom.calculated_count || 0);
      });
    });
  });

  const total = Object.values(summary).reduce(
    (sum, item) => sum + Number(item.calculated_count || 0),
    0
  );

  return Object.values(summary).map((item) => ({
    ...item,
    percentage: total
      ? Math.round((Number(item.calculated_count || 0) / total) * 100)
      : 0,
  }));
});

const hasBloomDistribution = computed(() => bloomSummary.value.length > 0);
</script>

<template>
  <div>
    <div class="d-flex flex-wrap ga-2 mb-4">
      <v-chip color="primary" variant="flat" prepend-icon="mdi-file-document">
        {{ blueprint.name }}
      </v-chip>

      <v-chip
        v-if="hasBloomDistribution"
        color="deep-purple"
        variant="flat"
        prepend-icon="mdi-brain"
      >
        Bloom Applied
      </v-chip>

      <v-chip variant="tonal">
        {{ blueprint.grade?.name }}
      </v-chip>

      <v-chip variant="tonal">
        {{ blueprint.subject?.name }}
      </v-chip>

      <v-chip
        v-if="blueprint.exam_name"
        variant="tonal"
        prepend-icon="mdi-calendar"
      >
        {{ blueprint.exam_name?.name }}
      </v-chip>
    </div>

    <v-card class="pa-4 mb-4 rounded-xl preview-summary-card" variant="outlined">
      <div class="d-flex align-center ga-8 flex-wrap">
        <div class="d-flex align-center ga-3">
          <v-avatar color="primary" variant="tonal">
            <v-icon>mdi-information</v-icon>
          </v-avatar>

          <div>
            <div class="text-caption text-grey">Total Questions</div>
            <div class="text-h5 font-weight-bold text-primary">
              {{ totalQuestions }}
            </div>
          </div>
        </div>

        <v-divider vertical />

        <div>
          <div class="text-caption text-grey">Total Marks</div>
          <div class="text-h5 font-weight-bold text-success">
            {{ totalMarks }}
          </div>
        </div>
      </div>
    </v-card>

    <v-card
      v-if="hasBloomDistribution"
      class="pa-4 mb-4 rounded-xl bloom-card"
      variant="outlined"
    >
      <div class="d-flex align-center ga-2 mb-4">
        <v-icon color="deep-purple">mdi-brain</v-icon>

        <div class="text-h6 font-weight-bold">
          Bloom Taxonomy Distribution
        </div>
      </div>

      <v-row>
        <v-col
          v-for="level in bloomSummary"
          :key="level.bloom_level"
          cols="12"
          sm="6"
          md="4"
          lg="2"
        >
          <v-card
            class="pa-3 rounded-lg h-100"
            :color="`${bloomColors[level.bloom_level] || 'primary'}-darken-4`"
            variant="tonal"
          >
            <div class="d-flex align-center ga-2 mb-2">
              <v-icon
                size="18"
                :color="bloomColors[level.bloom_level] || 'primary'"
              >
                mdi-brain
              </v-icon>

              <span class="text-capitalize font-weight-medium">
                {{ formatBloom(level.bloom_level) }}
              </span>
            </div>

            <div class="text-h5 font-weight-bold mb-1">
              {{ level.calculated_count }} Questions
            </div>

            <div class="text-caption mb-2">
              {{ level.percentage }}%
            </div>

            <v-progress-linear
              :model-value="level.percentage"
              height="8"
              rounded
              :color="bloomColors[level.bloom_level] || 'primary'"
              bg-color="grey-darken-3"
            />
          </v-card>
        </v-col>
      </v-row>
    </v-card>

    <v-card class="rounded-xl preview-table-card" variant="outlined">
      <v-table>
        <thead>
          <tr>
            <th>Section</th>
            <th>Type</th>
            <th>Difficulty</th>
            <th>Questions</th>
            <th>Marks Each</th>
            <th>Total</th>
          </tr>
        </thead>

        <tbody>
          <template
            v-for="(section, sectionIndex) in blueprint.sections"
            :key="section.id || sectionIndex"
          >
            <tr
              v-for="(item, itemIndex) in section.items"
              :key="item.id || `${sectionIndex}-${itemIndex}`"
            >
              <td class="font-weight-bold text-primary">
                {{ section.section_name }}
              </td>

              <td>
                {{ item.question_type }}
              </td>

              <td>
                <v-chip size="small" color="success" variant="tonal">
                  {{ item.difficulty }}
                </v-chip>
              </td>

              <td>
                {{ item.question_count }}
              </td>

              <td>
                {{ item.marks_per_question }}
              </td>

              <td class="font-weight-bold text-warning">
                {{
                  Number(item.question_count || 0) *
                  Number(item.marks_per_question || 0)
                }}
              </td>
            </tr>
          </template>
        </tbody>
      </v-table>
    </v-card>
  </div>
</template>

<style scoped>
.preview-summary-card {
  backdrop-filter: blur(8px);
}

.bloom-card {
  border: 1px solid rgba(139, 92, 246, 0.4);
}

.preview-table-card {
  overflow: hidden;
}
</style>