<template>
  <v-card variant="outlined" class="school-header-preview pa-4">
    <div class="preview-title" v-if="showTitle">
      Question Paper Header Preview
    </div>

    <div class="header-wrapper">
      <div class="logo-wrapper">
        <img
          v-if="logoUrl"
          :src="logoUrl"
          class="school-logo"
          alt="School Logo"
        />
        <div v-else class="logo-placeholder">
          <v-icon size="42">mdi-school-outline</v-icon>
        </div>
      </div>

      <div class="school-info">
        <div class="school-name">
          {{ schoolName || 'SCHOOL NAME' }}
        </div>

        <div class="school-address">
          {{ schoolAddress || 'School Address' }}
        </div>

        <div v-if="schoolPhone || schoolEmail" class="school-contact">
          <span v-if="schoolPhone">Phone: {{ schoolPhone }}</span>
          <span v-if="schoolPhone && schoolEmail" class="mx-1">|</span>
          <span v-if="schoolEmail">Email: {{ schoolEmail }}</span>
        </div>
      </div>
    </div>

    <v-divider class="my-3" />

    <div class="exam-title">
      {{ resolvedExamTitle }}
    </div>

    <div v-if="showMeta" class="meta-row mt-3">
      <div>
        <strong>Subject:</strong> {{ subject }}
      </div>
      <div>
        <strong>Duration:</strong> {{ duration }} Minutes
      </div>
    </div>

    <div v-if="showMeta" class="meta-row">
      <div>
        <strong>Class:</strong> {{ grade }}
      </div>
      <div>
        <strong>Max Marks:</strong> {{ maxMarks }}
      </div>
    </div>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  schoolName: {
    type: String,
    default: '',
  },
  schoolAddress: {
    type: String,
    default: '',
  },
  schoolPhone: {
    type: String,
    default: '',
  },
  schoolEmail: {
    type: String,
    default: '',
  },
  schoolLogo: {
    type: String,
    default: '',
  },
  examTitle: {
    type: String,
    default: 'Periodic Assessment 1',
  },
  academicSession: {
    type: String,
    default: '',
  },
  subject: {
    type: String,
    default: 'Computer Science',
  },
  duration: {
    type: [String, Number],
    default: 60,
  },
  grade: {
    type: String,
    default: 'Grade 7',
  },
  maxMarks: {
    type: [String, Number],
    default: 20,
  },
  showTitle: {
    type: Boolean,
    default: true,
  },
  showMeta: {
    type: Boolean,
    default: true,
  },
})

const baseUrl = computed(() => {
  const apiBase = import.meta.env.VITE_API_BASE_URL || ''
  return apiBase.replace(/\/api\/?$/, '')
})

const logoUrl = computed(() => {
  if (!props.schoolLogo) return null

  if (
    props.schoolLogo.startsWith('blob:') ||
    props.schoolLogo.startsWith('data:') ||
    props.schoolLogo.startsWith('http')
  ) {
    return props.schoolLogo
  }

  const baseUrl =
    import.meta.env.VITE_API_BASE_URL?.replace('/api', '') ||
    'http://127.0.0.1:8000'

  const path = String(props.schoolLogo).replace(/^\/+/, '')

  if (path.startsWith('storage/')) {
    return `${baseUrl}/${path}`
  }

  return `${baseUrl}/storage/${path}`
})

const resolvedExamTitle = computed(() => {
  const title = props.examTitle || 'Periodic Assessment 1'
  const session = props.academicSession || ''

  if (!session) {
    return title
  }

  return `${title} | (Session ${session})`
})
</script>

<style scoped>
.school-header-preview {
  background: #ffffff !important;
  color: #000000 !important;
  border-color: rgba(0, 0, 0, 0.35) !important;
}

.preview-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #000000;
}

.header-wrapper {
  display: flex;
  align-items: center;
  min-height: 82px;
}

.logo-wrapper {
  width: 90px;
  flex-shrink: 0;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.school-logo {
  width: 72px;
  height: 72px;
  object-fit: contain;
}

.logo-placeholder {
  width: 72px;
  height: 72px;
  border: 1px dashed rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #555555;
}

.school-info {
  flex: 1;
  text-align: center;
  padding-right: 90px;
}

.school-name {
  font-family: 'Arial', 'Helvetica', sans-serif;
  font-size: 34px;
  font-weight: 800;
  line-height: 1.05;
  text-transform: uppercase;
  color: #222222;
}

.school-address,
.school-contact {
  font-family: 'Times New Roman', serif;
  font-size: 13px;
  line-height: 1.2;
  color: #222222;
}

.exam-title {
  text-align: center;
  font-size: 17px;
  font-weight: 700;
  text-transform: uppercase;
  color: #000000;
}

.meta-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  font-size: 13px;
  color: #000000;
}

@media (max-width: 600px) {
  .school-name {
    font-size: 22px;
  }

  .school-info {
    padding-right: 0;
  }

  .logo-wrapper {
    width: 70px;
  }

  .school-logo,
  .logo-placeholder {
    width: 56px;
    height: 56px;
  }
}
</style>
