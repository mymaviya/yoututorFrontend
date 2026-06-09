<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from "../../../plugins/api";
import LivePaperPreview from '../components/LivePaperPreview.vue'
import { renderMath } from "../../../utils/renderMath";
import "katex/dist/katex.min.css";



const route = useRoute()

const router = useRouter()

const loading = ref(false)

const paper = ref({

  title: '',

  exam_type: '',

  duration: '',

  instructions: '',

  sections: []
})

const fetchPaper = async () => {
  loading.value = true

  try {
    const res = await api.get(`/question-papers/${route.params.id}`)
    const data = res.data

    const grouped = {}

    ;(data.questions || []).forEach((item) => {
      const section = item.section || 'Section A'

      if (!grouped[section]) {
        grouped[section] = {
          name: section,
          instructions: item.instructions || '',
          questions: []
        }
      }

      grouped[section].questions.push({
        ...item.question,

        // IMPORTANT: marks must come from question_paper_questions
        paper_question_id: item.id,
        question_id: item.question_id,
        marks: Number(item.marks),
        sort_order: item.sort_order,
        section: item.section,
        instructions: item.instructions
      })
    })

    Object.values(grouped).forEach(section => {
      section.questions.sort((a, b) => a.sort_order - b.sort_order)
    })

    paper.value = {
      ...data,
      sections: Object.values(grouped)
    }

    setTimeout(() => {
      renderMath('.a4-preview')
    }, 300)

  } finally {
    loading.value = false
  }
}

const allPaper = () => {

  router.push('/papers')
}

const editPaper = () => {

  router.push(
    `/papers/${route.params.id}/edit`
  )
}

/*
|--------------------------------------------------------------------------
| DOWNLOAD PDF
|--------------------------------------------------------------------------
*/

const downloadPdf = async (id) => {
  const res = await api.get(`/question-papers/${id}/pdf`, {
    responseType: 'blob'
  })

  const blob = new Blob([res.data], {
    type: 'application/pdf'
  })

  const url = window.URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `question-paper-${id}.pdf`
  link.click()

  window.URL.revokeObjectURL(url)
}

const printPaper = () => {

  window.print()
}

onMounted(fetchPaper)
</script>

<template>

  <div>

    <!-- HEADER -->
    <div
      class="d-flex justify-space-between align-center mb-6"
    >

      <div>

        <h1 class="text-h4 font-weight-bold">

          View Question Paper

        </h1>

        <p class="text-grey">

          Preview and export paper

        </p>

      </div>

      <!-- ACTIONS -->
      <div class="d-flex ga-2">

        <v-btn
          color="primary"
          prepend-icon="mdi-pencil"
          @click="editPaper"
        >
          Edit
        </v-btn>

        <v-btn
          color="error"
          prepend-icon="mdi-file-pdf-box"
          @click="downloadPdf(paper.id)"
        >
          PDF
        </v-btn>

        <v-btn
          color="secondary"
          prepend-icon="mdi-printer"
          @click="printPaper"
        >
          Print
        </v-btn>

        <v-btn
          color="orange"
          prepend-icon="mdi-format-list-bulleted"
          @click="allPaper"
        >
          Papers
        </v-btn>

      </div>

    </div>

    <!-- LOADER -->
    <v-card
      v-if="loading"
      class="rounded-xl pa-10"
      elevation="0"
    >

      <v-progress-linear
        indeterminate
      />

    </v-card>

    <!-- PREVIEW -->
    <LivePaperPreview
      v-else
      :paper="paper"
      @print="printPaper"
    />

  </div>

</template>