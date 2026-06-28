<template>
  <v-container fluid>
    <v-row class="mb-4">
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between flex-wrap ga-3">
          <div>
            <h2 class="text-h5 font-weight-bold mb-1">
              Premium Question Bank
            </h2>
            <div class="text-body-2 text-medium-emphasis">
              Browse purchased question bank packages and import selected questions into your school question bank.
            </div>
          </div>

          <v-btn
            color="primary"
            variant="flat"
            :disabled="isSuperAdminMode || !selected.length || importing"
            :loading="importing"
            @click="importSelected"
          >
            Import Selected
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <v-alert
      v-if="!packages.length && !loading"
      type="warning"
      variant="tonal"
      class="mb-4"
    >
      {{
        isSuperAdminMode
          ? 'No master question bank package has been created yet.'
          : 'No premium question bank package is assigned to your subscription yet.'
      }}
    </v-alert>

    <v-row v-if="packages.length" class="mb-4">
      <v-col
        v-for="item in packages"
        :key="`${item.source}-${item.package?.id}`"
        cols="12"
        md="4"
      >
        <v-card variant="outlined" class="h-100 rounded-xl">
          <v-card-text>
            <div class="d-flex align-start justify-space-between ga-3">
              <div>
                <div class="font-weight-bold">
                  {{ item.package?.name || '-' }}
                </div>
                <div class="text-caption text-medium-emphasis mt-1">
                  {{ item.package?.grade_group || 'Grade/package access' }}
                </div>
              </div>

              <v-chip
                size="small"
                variant="tonal"
                :color="packageSourceColor(item.source)"
              >
                {{ packageSourceLabel(item.source) }}
              </v-chip>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-card class="mb-4" variant="outlined">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="3">
            <v-select
              v-model="filters.question_bank_package_id"
              :items="packageOptions"
              item-title="name"
              item-value="id"
              label="Package"
              clearable
              density="comfortable"
              @update:model-value="fetchQuestions"
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-text-field
              v-model="filters.search"
              label="Search question"
              density="comfortable"
              clearable
              @keyup.enter="fetchQuestions"
              @click:clear="fetchQuestions"
            />
          </v-col>

          <v-col cols="12" md="2">
            <v-select
              v-model="filters.difficulty"
              :items="difficultyOptions"
              label="Difficulty"
              density="comfortable"
              clearable
              @update:model-value="fetchQuestions"
            />
          </v-col>

          <v-col cols="12" md="2">
            <v-select
              v-model="filters.bloom_level"
              :items="bloomOptions"
              label="Bloom Level"
              density="comfortable"
              clearable
              @update:model-value="fetchQuestions"
            />
          </v-col>

          <v-col cols="12" md="2" class="d-flex align-center">
            <v-btn
              block
              color="primary"
              variant="tonal"
              @click="fetchQuestions"
            >
              Filter
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card variant="outlined">
      <v-data-table-server
        v-model="selected"
        v-model:items-per-page="pagination.per_page"
        v-model:page="pagination.page"
        :headers="headers"
        :items="questions"
        :items-length="pagination.total"
        :loading="loading"
        item-value="id"
        show-select
        @update:options="onTableOptions"
      >
        <template #item.question="{ item }">
          <div class="py-2">
            <div class="font-weight-medium" v-html="item.question"></div>
            <div class="text-caption text-medium-emphasis mt-1">
              {{ displayName(item.grade) || '-' }}
              <span v-if="item.stream"> / {{ displayName(item.stream) }}</span>
              / {{ displayName(item.subject) || '-' }}
              <span v-if="item.lesson"> / {{ displayName(item.lesson) }}</span>
            </div>
          </div>
        </template>

        <template #item.type="{ item }">
          {{ item.type?.name || '-' }}
        </template>

        <template #item.package="{ item }">
          <div class="py-2">
            <div class="font-weight-medium">
              {{ item.package?.name || '-' }}
            </div>
            <v-chip
              v-if="packageSourceFor(item.question_bank_package_id)"
              size="x-small"
              variant="tonal"
              class="mt-1"
              :color="packageSourceColor(packageSourceFor(item.question_bank_package_id))"
            >
              {{ packageSourceLabel(packageSourceFor(item.question_bank_package_id)) }}
            </v-chip>
          </div>
        </template>

        <template #item.marks="{ item }">
          {{ Number(item.marks || 0).toFixed(2) }}
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex ga-1 justify-end">
            <v-btn
              size="small"
              variant="text"
              color="primary"
              @click="openPreview(item)"
            >
              View
            </v-btn>
            <v-btn
              v-if="!isSuperAdminMode"
              size="small"
              variant="text"
              color="success"
              @click="importSingle(item.id)"
            >
              Import
            </v-btn>
          </div>
        </template>
      </v-data-table-server>
    </v-card>

    <v-dialog v-model="previewDialog" max-width="800">
      <v-card>
        <v-card-title>Question Preview</v-card-title>

        <v-card-text v-if="preview">
          <div class="text-subtitle-2 mb-2">
            {{ preview.type?.name || '-' }} · {{ preview.difficulty }} · {{ preview.marks }} marks
          </div>

          <div class="d-flex flex-wrap ga-2 mb-3">
            <v-chip size="small" variant="tonal">
              {{ preview.package?.name || '-' }}
            </v-chip>
            <v-chip
              v-if="packageSourceFor(preview.question_bank_package_id)"
              size="small"
              variant="tonal"
              :color="packageSourceColor(packageSourceFor(preview.question_bank_package_id))"
            >
              {{ packageSourceLabel(packageSourceFor(preview.question_bank_package_id)) }}
            </v-chip>
          </div>

          <div class="mb-4" v-html="preview.question"></div>

          <v-divider class="my-3" />

          <div class="font-weight-bold mb-1">Answer</div>
          <div v-html="preview.answer || '-'"></div>

          <div class="font-weight-bold mt-4 mb-1">Explanation</div>
          <div v-html="preview.explanation || '-'"></div>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="previewDialog = false">
            Close
          </v-btn>
          <v-btn
            color="primary"
            :disabled="isSuperAdminMode"
            @click="importSingle(preview?.id)"
          >
            Import
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import api from '../../plugins/api'
import { useUIStore } from '../../stores/snackBar'

const ui = useUIStore()

const loading = ref(false)
const importing = ref(false)
const packages = ref([])
const questions = ref([])
const isSuperAdminMode = ref(false)
const selected = ref([])

const previewDialog = ref(false)
const preview = ref(null)

const filters = reactive({
  question_bank_package_id: null,
  search: '',
  difficulty: null,
  bloom_level: null,
})

const pagination = reactive({
  page: 1,
  per_page: 20,
  total: 0,
})

const difficultyOptions = ['easy', 'medium', 'hard']

const bloomOptions = [
  'remember',
  'understand',
  'apply',
  'analyze',
  'evaluate',
  'create',
]

const headers = [
  { title: 'Question', key: 'question', sortable: false },
  { title: 'Package', key: 'package', sortable: false },
  { title: 'Type', key: 'type', sortable: false },
  { title: 'Difficulty', key: 'difficulty', sortable: false },
  { title: 'Bloom', key: 'bloom_level', sortable: false },
  { title: 'Marks', key: 'marks', sortable: false },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
]

const displayName = (item) => {
  if (!item) return ''

  return (
    item.name ||
    item.title ||
    item.subject_name ||
    item.lesson_name ||
    item.lesson_title ||
    item.stream_name ||
    item.grade_name ||
    ''
  )
}

const normalizePackageAccess = (item, source = 'subscription_plan') => {
  if (item?.package) {
    return {
      ...item,
      source: item.source || source,
      source_label: item.source_label || packageSourceLabel(item.source || source),
      package: item.package,
    }
  }

  return {
    id: null,
    source,
    source_label: packageSourceLabel(source),
    package: item,
  }
}

const packageOptions = computed(() => {
  return packages.value
    .map((purchase) => purchase.package)
    .filter(Boolean)
    .map((packageItem) => ({
      ...packageItem,
      name: `${packageItem.name || '-'}${packageSourceFor(packageItem.id) ? ` (${packageSourceLabel(packageSourceFor(packageItem.id))})` : ''}`,
    }))
})

const packageSourceMap = computed(() => {
  const map = {}

  packages.value.forEach((item) => {
    if (item.package?.id) {
      map[item.package.id] = item.source
    }
  })

  return map
})

const packageSourceFor = (packageId) => {
  if (!packageId) return null

  return packageSourceMap.value[packageId] || null
}

const packageSourceLabel = (source) => {
  return {
    subscription_plan: 'Included in Plan',
    manual_purchase: 'Add-on Purchase',
    superadmin: 'Super Admin Preview',
  }[source] || 'Package Access'
}

const packageSourceColor = (source) => {
  return {
    subscription_plan: 'success',
    manual_purchase: 'primary',
    superadmin: 'secondary',
  }[source] || 'grey'
}

const fetchPackages = async () => {
  isSuperAdminMode.value = false

  try {
    const res = await api.get('/master-question-bank/packages')
    packages.value = (res.data.data || []).map((item) => normalizePackageAccess(item))

    if (!packages.value.length) {
      await fetchSuperAdminPackagesFallback()
    }
  } catch (err) {
    await fetchSuperAdminPackagesFallback()

    if (!isSuperAdminMode.value) {
      ui.showSnackbar(
        err.response?.data?.message || 'Failed to load purchased packages',
        'error'
      )
    }
  }
}

const fetchSuperAdminPackagesFallback = async () => {
  try {
    const res = await api.get('/admin/question-bank-packages', {
      params: {
        status: 'active',
        per_page: 1000,
      },
    })

    const payload = res.data.data
    const rows = Array.isArray(payload)
      ? payload
      : payload?.data || []

    if (rows.length) {
      isSuperAdminMode.value = true
      packages.value = rows.map((item) => normalizePackageAccess(item, 'superadmin'))
    }
  } catch (err) {
    // Non-superadmin users may not access admin package routes. Ignore fallback failure.
  }
}

const fetchQuestions = async () => {
  loading.value = true

  try {
    const endpoint = isSuperAdminMode.value
      ? '/admin/master-questions'
      : '/master-question-bank/questions'

    const res = await api.get(endpoint, {
      params: {
        ...filters,
        page: pagination.page,
        per_page: pagination.per_page,
      },
    })

    const payload = res.data.data

    questions.value = payload.data || []
    pagination.total = payload.total || 0
    pagination.page = payload.current_page || 1
    pagination.per_page = payload.per_page || 20
  } catch (err) {
    ui.showSnackbar(
      err.response?.data?.message || 'Failed to load premium questions',
      'error'
    )
  } finally {
    loading.value = false
  }
}

const onTableOptions = (options) => {
  pagination.page = options.page
  pagination.per_page = options.itemsPerPage
  fetchQuestions()
}

const openPreview = (item) => {
  preview.value = item
  previewDialog.value = true
}

const importSelected = async () => {
  if (!selected.value.length) return

  const ok = await ui.confirmDialog(
    'Import Questions',
    `Import ${selected.value.length} selected question(s) into your school question bank?`
  )

  if (!ok) return

  importing.value = true

  try {
    const res = await api.post('/master-question-bank/import', {
      master_question_ids: selected.value,
    })

    const created = res.data.created || 0
    const skipped = res.data.skipped || 0

    ui.showSnackbar(
      skipped > 0
        ? `${created} imported, ${skipped} already existed`
        : `${created} question(s) imported successfully`,
      skipped > 0 ? 'info' : 'success'
    )

    selected.value = []
    await fetchQuestions()
  } catch (err) {
    ui.showSnackbar(
      err.response?.data?.message || 'Failed to import selected questions',
      'error'
    )
  } finally {
    importing.value = false
  }
}

const importSingle = async (id) => {
  if (!id) return

  const ok = await ui.confirmDialog(
    'Import Question',
    'Import this question into your school question bank?'
  )

  if (!ok) return

  importing.value = true

  try {
    const res = await api.post('/master-question-bank/import', {
      master_question_ids: [id],
    })

    const created = res.data.created || 0
    const skipped = res.data.skipped || 0

    ui.showSnackbar(
      skipped > 0
        ? 'This question already exists in your question bank'
        : 'Question imported successfully',
      skipped > 0 ? 'info' : 'success'
    )

    previewDialog.value = false
    selected.value = []
    await fetchQuestions()
  } catch (err) {
    ui.showSnackbar(
      err.response?.data?.message || 'Failed to import question',
      'error'
    )
  } finally {
    importing.value = false
  }
}

onMounted(async () => {
  await fetchPackages()
  await fetchQuestions()
})
</script>