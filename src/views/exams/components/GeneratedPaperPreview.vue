<script setup>
import "../../../assets/print.css";

const props = defineProps({
  paper: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["print"]);

const isMCQ = (type) => {
  return ["mcq", "multiple_mcq", "true_false"].includes(type);
};

const stripHtml = (html = "") => {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
};

const getOptionLayout = (question) => {
  if (!question.options?.length) return "two-column";

  const hasImage = question.options.some((option) => option.option_image);

  if (hasImage) return "one-column";

  const longestOption = Math.max(
    ...question.options.map(
      (option) => stripHtml(option.option_text || "").length,
    ),
  );

  if (longestOption <= 20) return "four-column";
  if (longestOption <= 60) return "two-column";

  return "one-column";
};

const formatQuestionType = (type) => {
  const map = {
    mcq: "Multiple Choice Questions",
    multiple_mcq: "Multiple Correct Questions",
    true_false: "True / False",
    fill_blank: "Fill in the Blanks",
    short: "Short Answer Questions",
    long: "Long Answer Questions",
    match_column: "Match the Columns",
    assertion_reason: "Assertion & Reason",
    numerical: "Numerical Problems",
  };

  return map[type] || type;
};

const getGroups = (section) => {
  if (section.groups?.length) return section.groups;

  return [
    {
      type: null,
      marks_per_question: null,
      questions: section.questions || [],
    },
  ];
};

const getQuestionNumber = (sectionIndex, groupIndex, questionIndex) => {
  let count = 0

  for (let s = 0; s < sectionIndex; s++) {
    getGroups(props.paper.sections[s]).forEach(group => {
      count += group.questions?.length || 0
    })
  }

  const currentGroups = getGroups(props.paper.sections[sectionIndex])

  for (let g = 0; g < groupIndex; g++) {
    count += currentGroups[g].questions?.length || 0
  }

  return count + questionIndex + 1
}
const availableForBlueprintRow = (row) => {
  return questions.value.filter(q => {
    const typeMatch = q.type === row.question_type

    const difficultyMatch =
      !row.difficulty ||
      q.difficulty === row.difficulty

    const bloomMatch =
      !row.bloom_level ||
      q.bloom_level === row.bloom_level

    return typeMatch && difficultyMatch && bloomMatch
  }).length
}
</script>

<template>
  <div class="preview-container">
    <div class="preview-header">
      <v-btn
        color="primary"
        size="small"
        prepend-icon="mdi-printer"
        @click="emit('print')"
      >
        Print
      </v-btn>
    </div>

    <div class="a4-preview">
      <!-- PAPER HEADER -->
      <div class="paper-header">
        <h2>{{ paper.title || "Question Paper" }}</h2>

        <div class="paper-meta">
          <span>{{ paper.exam_type || "Exam" }}</span>
          <span>Duration: {{ paper.duration || 0 }} Minutes</span>
        </div>
      </div>

      <hr />

      <!-- GENERAL INSTRUCTIONS -->
      <div v-if="paper.instructions" class="general-instructions">
        <strong>General Instructions:</strong>
        <MathContent :html="paper.instructions" />
      </div>

      <!-- SECTIONS -->
      <div
        v-for="(section, sIndex) in paper.sections"
        :key="sIndex"
        class="preview-section"
      >
        <div class="section-heading">
          {{ section.name }}
        </div>

        <div v-if="section.instructions" class="section-instructions">
          {{ section.instructions }}
        </div>

        <!-- GROUPS -->
        <template v-for="(group, gIndex) in getGroups(section)" :key="gIndex">
          <div v-if="group.type" class="group-heading">
            {{ formatQuestionType(group.type) }}

            <span v-if="group.marks_per_question">
              ({{ group.marks_per_question }} 
              {{ Number(group.marks_per_question) > 1 ? "Marks" : "Mark" }} Each)
            </span>
          </div>

          <!-- QUESTIONS -->
          <div
            v-for="(q, qIndex) in group.questions"
            :key="q.id || qIndex"
            class="preview-question"
          >
            <div class="question-row">
              <div class="question-number">Q{{ getQuestionNumber(sIndex, gIndex, qIndex) }}.</div>

              <div class="question-body">
                <MathContent class="question-html" :html="q.question" />

                <v-img
                  v-if="q.question_image"
                  :src="q.question_image"
                  max-width="260"
                  class="question-image"
                />

                <!-- MCQ OPTIONS -->
                <div
                  v-if="isMCQ(q.type) && q.options?.length"
                  :class="['mcq-options', getOptionLayout(q)]"
                >
                  <div
                    v-for="(opt, i) in q.options"
                    :key="opt.id || i"
                    class="mcq-option"
                  >
                    <span class="option-label">
                      {{ String.fromCharCode(65 + i) }}.
                    </span>

                    <MathContent
                      v-if="opt.option_text"
                      class="option-text"
                      tag="span"
                      :html="opt.option_text"
                    />

                    <v-img
                      v-if="opt.option_image"
                      :src="opt.option_image"
                      max-width="120"
                      class="option-image"
                    />
                  </div>
                </div>

                <!-- MATCH COLUMN -->
                <div v-if="q.type === 'match_column'" class="match-column">
                  <div class="match-grid">
                    <div>
                      <strong>Column A</strong>

                      <div
                        v-for="(item, i) in q.left_column ||
                        q.match_pairs ||
                        []"
                        :key="item.id || i"
                        class="match-row"
                      >
                        {{ item.label || i + 1 }}.
                        {{ item.text || item.left_text }}
                      </div>
                    </div>

                    <div>
                      <strong>Column B</strong>

                      <div
                        v-for="(item, i) in q.right_column ||
                        q.match_pairs ||
                        []"
                        :key="item.id || i"
                        class="match-row"
                      >
                        {{ item.label || String.fromCharCode(65 + i) }}.
                        {{ item.text || item.right_text }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="marks-box">
                {{ q.marks }}
                {{ Number(q.marks) > 1 ? "Marks" : "Mark" }}
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>

.preview-container {
  height: calc(100vh - 120px);
  position: sticky;
  top: 80px;
}

.preview-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}

.a4-preview {
  background: #fff;
  color: #000;
  height: 100%;
  overflow-y: auto;
  padding: 28px;
  border-radius: 12px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
  font-family: "Times New Roman", serif;
  font-size: 14px;
  line-height: 1;
}

.paper-header {
  text-align: center;
  margin-bottom: 12px;
}

.paper-header h2 {
  margin: 0 0 8px;
  font-size: 22px;
  font-weight: bold;
}

.paper-meta {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  margin-top: 6px;
}

.general-instructions {
  margin: 14px 0;
  font-size: 14px;
}

.section-heading {
  margin: 6px 0 6px;
  padding-bottom: 4px;
  text-align: left;
  font-weight: bold;
  font-size: 18px;
  
}

.section-instructions {
  font-style: italic;
  margin-bottom: 12px;
}

.group-heading {
  margin: 10px 0 6px;
  font-weight: bold;
  font-size: 15px;
  border-bottom: 1px dashed #999;
  padding-bottom: 4px;
}

.preview-question {
  margin-bottom: 8px;
  page-break-inside: avoid;
}

.question-row {
  display: table;
  width: 100%;
  table-layout: fixed;
}

.question-number,
.question-body,
.marks-box {
  display: table-cell;
  vertical-align: top;
}

.question-number {
  width: 42px;
  font-weight: bold;
  padding-top: 1px;
  white-space: nowrap;
}

.question-body {
  padding-right: 10px;
  line-height: 1.15;
}

.question-html p,
.question-body p {
  margin: 0 0 6px;
}

.marks-box {
  width: 75px;
  text-align: right;
  font-size: 12px;
  font-weight: bold;
  white-space: nowrap;
  padding-top: 1px;
}

.question-image {
  margin: 8px 0;
  border: 1px solid #ddd;
}

/* MCQ OPTIONS */
.mcq-options {
  margin-top: 8px;
  display: grid;
  column-gap: 24px;
  row-gap: 6px;
  width: 100%;
}

.four-column {
  grid-template-columns: repeat(4, 1fr);
}

.two-column {
  grid-template-columns: repeat(2, 1fr);
}

.one-column {
  grid-template-columns: 1fr;
}

.mcq-option {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  min-height: 22px;
  break-inside: avoid;
}

.option-label {
  flex: 0 0 24px;
  font-weight: bold;
  line-height: 1.45;
}

.option-text {
  flex: 1;
  min-width: 0;
  line-height: 1.45;
}

.option-text p {
  margin: 0;
  display: inline;
}

.option-image {
  margin-top: 4px;
  border: 1px solid #ddd;
}

/* MATCH COLUMN */
.match-column {
  display: block;
  width: 100%;
  clear: both;
  margin-top: 10px;
}

.match-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 36px;
  width: 100%;
}

.match-row {
  margin-top: 5px;
  line-height: 1.5;
}

.general-instructions {
  margin: 8px 0 12px;
  font-size: 13px;
  line-height: 1.2;
}

.general-instructions ol,
.general-instructions ul {
  margin: 4px 0 0 16px;
  padding-left: 12px;
}

.general-instructions li {
  margin-bottom: 2px;
  padding-left: 1px;
}

.general-instructions p {
  margin: 0;
}

/* KATEX */
.katex {
  font-size: 1.05em;
}

.katex-display {
  margin: 6px 0;
  overflow-x: auto;
  overflow-y: hidden;
}

/* PRINT */
@media print {
  body {
    background: white !important;
    margin: 0;
    padding: 0;
  }

  .preview-header {
    display: none;
  }

  .a4-preview {
    box-shadow: none;
    height: auto;
    overflow: visible;
    padding: 0;
    border-radius: 0;
  }

  .preview-question {
    page-break-inside: avoid;
  }
}

@media (max-width: 768px) {
  .four-column,
  .two-column {
    grid-template-columns: 1fr;
  }
}
</style>
