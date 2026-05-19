<script setup>
const props = defineProps({
  blueprint: {
    type: Object,
    required: true,
  },
})

const totalQuestions = (blueprint) => {
  return (blueprint.sections || []).reduce((sum, section) => {
    return (
      sum +
      (section.items || []).reduce(
        (s, item) => s + Number(item.question_count || 0),
        0
      )
    )
  }, 0)
}

const totalMarks = (blueprint) => {
  return (blueprint.sections || []).reduce((sum, section) => {
    return (
      sum +
      (section.items || []).reduce(
        (s, item) =>
          s +
          Number(item.question_count || 0) *
            Number(item.marks_per_question || 0),
        0
      )
    )
  }, 0)
}

const bloomColors = {
  remember: 'deep-purple',
  understand: 'blue',
  apply: 'green',
  analyze: 'orange',
  evaluate: 'amber',
  create: 'pink',
}
</script>

<template>
  <div>
    <!-- HEADER -->
    <div class="d-flex flex-wrap ga-2 mb-4">
      <v-chip color="primary" variant="flat" prepend-icon="mdi-file-document">
        {{ blueprint.title }}
      </v-chip>

      <v-tooltip
        v-if="blueprint.bloom_levels?.length"
        location="top"
      >
        <template #activator="{ props }">
          <v-chip
            v-bind="props"
            color="deep-purple"
            variant="flat"
            prepend-icon="mdi-brain"
          >
            Bloom
          </v-chip>
        </template>

        Includes Bloom Taxonomy Distribution
      </v-tooltip>

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

    <!-- SUMMARY -->
    <v-card
      class="pa-4 mb-4 rounded-xl preview-summary-card"
      variant="outlined"
    >
      <div class="d-flex align-center ga-8 flex-wrap">
        <div class="d-flex align-center ga-3">
          <v-avatar color="primary" variant="tonal">
            <v-icon>mdi-information</v-icon>
          </v-avatar>

          <div>
            <div class="text-caption text-grey">
              Total Questions
            </div>

            <div class="text-h5 font-weight-bold text-primary">
              {{ totalQuestions(blueprint) }}
            </div>
          </div>
        </div>

        <v-divider vertical />

        <div>
          <div class="text-caption text-grey">
            Total Marks
          </div>

          <div class="text-h5 font-weight-bold text-success">
            {{ totalMarks(blueprint) }}
          </div>
        </div>
      </div>
    </v-card>

    <!-- BLOOM -->
    <v-card
      v-if="blueprint.bloom_levels?.length"
      class="pa-4 mb-4 rounded-xl bloom-card"
      variant="outlined"
    >
      <div class="d-flex align-center ga-2 mb-4">
        <v-icon color="deep-purple">
          mdi-brain
        </v-icon>

        <div class="text-h6 font-weight-bold">
          Bloom Taxonomy Distribution
        </div>
      </div>

      <v-row>
        <v-col
          v-for="level in blueprint.bloom_levels"
          :key="level.id || level.bloom_level"
          cols="12"
          md="4"
          lg="2"
        >
          <v-card
            class="pa-3 rounded-lg h-100"
            :color="`${bloomColors[level.bloom_level]}-darken-4`"
            variant="tonal"
          >
            <div class="d-flex align-center ga-2 mb-2">
              <v-icon
                size="18"
                :color="bloomColors[level.bloom_level]"
              >
                mdi-brain
              </v-icon>

              <span class="text-capitalize font-weight-medium">
                {{ level.bloom_level }}
              </span>
            </div>

            <div
              class="text-h4 font-weight-bold mb-3"
              :class="`text-${bloomColors[level.bloom_level]}`"
            >
              {{ Number(level.percentage) }}%
            </div>

            <v-progress-linear
              :model-value="Number(level.percentage)"
              height="8"
              rounded
              :color="bloomColors[level.bloom_level]"
              bg-color="grey-darken-3"
            />
          </v-card>
        </v-col>
      </v-row>
    </v-card>

    <!-- TABLE -->
    <v-card
      class="rounded-xl preview-table-card"
      variant="outlined"
    >
      <v-table>
        <thead>
          <tr>
            <th>Section</th>
            <th>Type</th>
            <th>Difficulty</th>
            <th>Bloom</th>
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
                <v-chip
                  size="small"
                  color="success"
                  variant="tonal"
                >
                  {{ item.difficulty }}
                </v-chip>
              </td>

              <td>
                <v-chip
                  size="small"
                  :color="bloomColors[item.bloom_level]"
                  variant="tonal"
                >
                  {{ item.bloom_level }}
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