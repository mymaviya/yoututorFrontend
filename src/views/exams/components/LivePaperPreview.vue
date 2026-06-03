<script setup>
import "../../../assets/print.css";
const props = defineProps({
  paper: Object,
  mode: {
    type: String,
    default: "paper",
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
        <div v-html="paper.instructions"></div>
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

        <!-- QUESTIONS -->
        <div
          v-for="(q, qIndex) in section.questions"
          :key="q.id"
          class="preview-question"
        >
          <div class="question-row">
            <div class="question-number">Q{{ qIndex + 1 }}.</div>

            <div class="question-body">
              <MathContent :html="q.question" />

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

              <!-- Coulmn -->
              <div
                v-if="
                  q.type === 'match_column' &&
                  (q.left_column?.length || q.match_pairs?.length)
                "
                class="match-column"
              >
                <div class="match-grid">
                  <div>
                    <strong>Column A</strong>

                    <div
                      v-for="(item, i) in q.left_column || q.match_pairs"
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
                      v-for="(item, i) in q.right_column || q.match_pairs"
                      :key="item.id || i"
                      class="match-row"
                    >
                      {{ item.label || String.fromCharCode(65 + i) }}.
                      {{ item.text || item.right_text }}
                    </div>
                  </div>
                </div>
              </div>
              <!-- Question -->
              <div v-if="mode === 'scheme'" class="answer-box">
                
                <div v-if="q.answer">
                <strong>Answer:</strong>
                <MathContent :html="q.answer" />
                </div>

                <div
                  v-else-if="q.options?.some((o) => Number(o.is_correct) === 1)"
                >
                  <div
                    v-for="option in q.options.filter(
                      (o) => Number(o.is_correct) === 1,
                    )"
                    :key="option.id"
                  >
                    <strong>Correct Option:</strong>
                    {{ option.option_text }}
                  </div>
                </div>

                <div v-else class="text-grey">Answer not available</div>

                <div v-if="q.explanation" class="mt-2">
                  <strong>Explanation:</strong>
                  <MathContent :html="q.explanation" />
                </div>
              </div>
            </div>

            <div class="marks-box">{{ q.marks }} Marks</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.answer-box {
  margin-top: 8px;
  padding: 8px 10px;
  border-left: 4px solid #4caf50;
  background: #f3fff4;
  font-size: 13px;
}
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
  line-height: 1.15;
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
  margin-top: 22px;
  margin-bottom: 6px;
  padding: 6px 10px;
  text-align: center;
  font-weight: bold;
  border: 1px solid #000;
  background: #f5f5f5;
}

.section-instructions {
  font-style: italic;
  margin-bottom: 12px;
}

.preview-question {
  margin-bottom: 16px;
  page-break-inside: avoid;
}

.question-row {
  display: table;
  width: 100%;
  table-layout: fixed;
  margin-bottom: 10px;
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

.question-body p {
  margin: 0;
}

.marks-box {
  width: 75px;
  text-align: right;
  font-size: 12px;
  font-weight: bold;
  white-space: nowrap;
  padding-top: 1px;
}

.question-html :deep(p) {
  margin: 0 0 6px;
}

.question-image {
  margin: 8px 0;
  border: 1px solid #ddd;
}

.marks-box {
  text-align: right;
  font-size: 13px;
  font-weight: bold;
  white-space: nowrap;
}

.match-column {
  margin-top: 10px;
}

.match-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 36px;
}

.match-row {
  margin-top: 5px;
}

/* MCQ FORMAT */
.mcq-options {
  margin-top: 10px;
  padding-left: 4px;
  display: grid;
  gap: 10px;
}

/*
|--------------------------------------------------------------------------
| 4 COLUMN
|--------------------------------------------------------------------------
*/

.four-column {
  grid-template-columns: repeat(4, 1fr);
}

/*
|--------------------------------------------------------------------------
| 2 COLUMN
|--------------------------------------------------------------------------
*/

.two-column {
  grid-template-columns: repeat(2, 1fr);
}

/*
|--------------------------------------------------------------------------
| 1 COLUMN
|--------------------------------------------------------------------------
*/

.one-column {
  grid-template-columns: 1fr;
}

.mcq-option {
  display: grid;
  grid-template-columns: 26px 1fr;
  gap: 6px;
  align-items: start;
  break-inside: avoid;
}

.option-label {
  font-weight: bold;
}

.option-text :deep(p) {
  margin: 0;
  display: inline;
}

.option-image {
  margin-top: 4px;
  border: 1px solid #ddd;
}

/* KaTeX */
.question-html :deep(.katex-display),
.option-text :deep(.katex-display) {
  overflow-x: auto;
  margin: 6px 0;
}

.question-html :deep(.katex),
.option-text :deep(.katex) {
  font-size: 1.05em;
}

/* PRINT */
@media print {
  .preview-header {
    display: none;
  }

  .a4-preview {
    box-shadow: none;
    height: auto;
    overflow: visible;
    padding: 0;
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
