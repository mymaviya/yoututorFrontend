<script setup>
import '../../../assets/print.css'
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

const stripHtml = (html = '') => {
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent || div.innerText || ''
}


const getOptionLayout = (question) => {
  if (!question.options?.length) return 'two-column'

  const hasImage = question.options.some(option => option.option_image)

  if (hasImage) return 'one-column'

  const longestOption = Math.max(
    ...question.options.map(option =>
      stripHtml(option.option_text || '').length
    )
  )

  if (longestOption <= 20) return 'four-column'

  if (longestOption <= 60) return 'two-column'

  return 'one-column'
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
              <div class="question-html" v-html="q.question" />

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

                  <span
                    v-if="opt.option_text"
                    class="option-text"
                    v-html="opt.option_text"
                  />

                  <v-img
                    v-if="opt.option_image"
                    :src="opt.option_image"
                    max-width="120"
                    class="option-image"
                  />
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

@media print {

  body {

    background: white !important;

    margin: 0;

    padding: 0;
  }
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
  line-height: 1.45;
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
  display: grid;
  grid-template-columns: 38px 1fr 70px;
  gap: 8px;
  align-items: start;
}

.question-number {
  font-weight: bold;
}

.question-body {
  width: 100%;
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

  grid-template-columns:
    repeat(4, 1fr);
}

/*
|--------------------------------------------------------------------------
| 2 COLUMN
|--------------------------------------------------------------------------
*/

.two-column {

  grid-template-columns:
    repeat(2, 1fr);
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
