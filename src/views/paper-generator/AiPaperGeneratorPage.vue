<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12">
                <v-card class="rounded-xl">
                    <v-card-title class="d-flex align-center">
                        <v-icon class="mr-2" color="primary">mdi-robot</v-icon>
                        AI Paper Generator
                    </v-card-title>

                    <v-card-text>
                        <v-row>
                            <v-col cols="12" md="4">
                                <v-select v-model="form.paper_blueprint_id" :items="blueprints" item-title="name"
                                    item-value="id" label="Select Blueprint" variant="outlined" density="comfortable"
                                    :disabled="saving" />
                            </v-col>

                            <v-col cols="12" md="4">
                                <v-select v-model="form.exam_name_id" :items="examNames" item-title="name"
                                    item-value="id" label="Select Exam" variant="outlined" density="comfortable"
                                    :disabled="saving" :loading="syllabusLoading"
                                    @update:model-value="loadExamPortion" />
                            </v-col>

                            <v-col cols="12" md="4">
                                <v-select v-model="form.difficulty" :items="difficultyOptions" label="Difficulty"
                                    variant="outlined" density="comfortable" :disabled="saving" />
                            </v-col>

                            <v-col cols="12" md="6">
                                <v-text-field v-model="form.title" label="Paper Title" variant="outlined"
                                    density="comfortable" :disabled="saving" />
                            </v-col>

                            <v-col cols="12" md="3">
                                <v-select v-model="form.language" :items="languageOptions" label="Language"
                                    variant="outlined" density="comfortable" :disabled="saving" />
                            </v-col>

                            <v-col cols="12" md="3" class="d-flex align-center">
                                <v-btn color="primary" size="large" block :loading="saving" @click="generatePaper">
                                    Generate AI Paper
                                </v-btn>
                            </v-col>
                        </v-row>

                        <v-alert v-if="syllabus" type="success" variant="tonal" class="mt-4">
                            Approved syllabus loaded:
                            {{ syllabus.grade?.name || '-' }} /
                            {{ syllabus.subject?.name || '-' }}
                        </v-alert>

                        <v-card v-if="syllabus?.lessons?.length" class="mt-4" variant="tonal">
                            <v-card-title>Approved Syllabus</v-card-title>

                            <v-card-text>
                                <v-list density="compact">
                                    <v-list-item v-for="lesson in syllabus.lessons" :key="lesson.id">
                                        <template #title>
                                            {{ lesson.lesson?.name || lesson.lesson_name || '-' }}
                                        </template>

                                        <template #subtitle>
                                            Topics: {{ lesson.topics || '-' }}
                                            <br />
                                            Objectives: {{ lesson.learning_objectives || '-' }}
                                        </template>
                                    </v-list-item>
                                </v-list>
                            </v-card-text>
                        </v-card>
                    </v-card-text>
                </v-card>
            </v-col>

            <v-col cols="12">
                <v-card class="rounded-xl">
                    <v-card-title class="d-flex align-center">
                        <v-icon class="mr-2" color="primary">mdi-file-document-outline</v-icon>
                        AI Generations

                        <v-spacer />

                        <v-btn variant="tonal" color="primary" :loading="loading" @click="fetchGenerations">
                            Refresh
                        </v-btn>
                    </v-card-title>

                    <v-card-text>
                        <v-data-table :headers="headers" :items="generations" :loading="loading" item-value="id">
                            <template #item.status="{ item }">
                                <v-chip size="small" :color="statusColor(item.status)" variant="tonal">
                                    {{ item.status }}
                                </v-chip>
                            </template>

                            <template #item.progress="{ item }">
                                <div style="min-width: 150px">
                                    <v-progress-linear :model-value="item.progress_percentage || 0" height="14" rounded
                                        color="primary">
                                        <small>{{ item.progress_percentage || 0 }}%</small>
                                    </v-progress-linear>

                                    <div class="text-caption mt-1">
                                        {{ item.progress_message || '-' }}
                                    </div>
                                </div>
                            </template>

                            <template #item.total_marks="{ item }">
                                {{ item.total_marks || 0 }}
                            </template>

                            <template #item.actions="{ item }">
                                <v-btn icon size="small" variant="text" color="primary" @click="viewGeneration(item)">
                                    <v-icon>mdi-eye</v-icon>
                                </v-btn>

                                <v-btn icon size="small" variant="text" color="success"
                                    :disabled="item.status !== 'generated'" @click="saveToQuestionBank(item)">
                                    <v-icon>mdi-content-save-check</v-icon>
                                </v-btn>

                                <v-btn icon size="small" variant="text" color="error" @click="deleteGeneration(item)">
                                    <v-icon>mdi-delete</v-icon>
                                </v-btn>
                            </template>
                        </v-data-table>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <v-dialog v-model="showProgressDialog" max-width="560" persistent>
            <v-card class="rounded-xl">
                <v-card-title class="d-flex align-center">
                    <v-icon class="mr-2" color="primary">mdi-robot</v-icon>
                    Generating AI Paper
                </v-card-title>

                <v-card-text>
                    <div class="text-subtitle-1 font-weight-medium mb-1">
                        {{ generationProgress.progress_message || 'Preparing...' }}
                    </div>

                    <div class="text-caption text-grey mb-4">
                        {{ generationProgress.current_section || 'Starting generation...' }}
                    </div>

                    <v-progress-linear :model-value="generationProgress.progress_percentage || 0" height="22" rounded
                        striped color="primary">
                        <strong>{{ generationProgress.progress_percentage || 0 }}%</strong>
                    </v-progress-linear>

                    <v-alert v-if="generationProgress.status === 'generated'" type="success" variant="tonal"
                        class="mt-4">
                        AI paper generated successfully.
                        Total Questions: {{ generationProgress.total_questions }},
                        Marks: {{ generationProgress.total_marks }}
                    </v-alert>

                    <v-alert v-if="generationProgress.status === 'failed'" type="error" variant="tonal" class="mt-4">
                        {{ generationProgress.error_message || 'Generation failed.' }}
                    </v-alert>
                </v-card-text>

                <v-card-actions>
                    <v-spacer />

                    <v-btn v-if="['generated', 'failed', 'converted'].includes(generationProgress.status)"
                        color="primary" @click="showProgressDialog = false">
                        Close
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="previewDialog" max-width="1000">
            <v-card class="rounded-xl">
                <v-card-title class="d-flex align-center">
                    <v-icon class="mr-2" color="primary">mdi-eye</v-icon>
                    AI Generated Questions

                    <v-spacer />

                    <v-btn icon variant="text" @click="previewDialog = false">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-card-title>

                <v-card-text>
                    <v-alert v-if="selectedGeneration?.status === 'failed'" type="error" variant="tonal" class="mb-4">
                        {{ selectedGeneration.error_message }}
                    </v-alert>

                    <v-expansion-panels>
                        <v-expansion-panel v-for="question in selectedGeneration?.questions || []" :key="question.id">
                            <v-expansion-panel-title>
                                <div class="w-100 d-flex align-center">
                                    <div class="flex-grow-1">
                                        <strong>Q{{ question.sort_order }}.</strong>
                                        {{ question.question }}

                                        <v-chip size="x-small" class="ml-2" color="primary" variant="tonal">
                                            {{ question.marks }} Marks
                                        </v-chip>

                                        <v-chip v-if="question.saved_to_question_bank" size="x-small" class="ml-2"
                                            color="success" variant="tonal">
                                            Saved
                                        </v-chip>

                                        <v-chip v-else size="x-small" class="ml-2" color="warning" variant="tonal">
                                            Not Saved
                                        </v-chip>
                                    </div>
                                </div>
                            </v-expansion-panel-title>

                            <v-expansion-panel-text>
                                <div class="d-flex justify-end mb-3">
                                    <v-btn size="small" color="primary" variant="tonal" prepend-icon="mdi-refresh"
                                        :loading="regeneratingQuestionId === question.id"
                                        :disabled="savingToBank || selectedGeneration?.status !== 'generated'"
                                        @click="regenerateQuestion(question)">
                                        Regenerate
                                    </v-btn>
                                </div>

                                <div class="mb-2">
                                    <strong>Answer:</strong>
                                    {{ question.answer || '-' }}
                                </div>

                                <div class="mb-2">
                                    <strong>Lesson:</strong>
                                    {{ question.lesson?.name || '-' }}
                                </div>

                                <div class="mb-2">
                                    <strong>Type:</strong>
                                    {{ question.type?.name || '-' }}
                                </div>

                                <div class="mb-2">
                                    <strong>Difficulty:</strong>
                                    {{ question.difficulty || '-' }}
                                </div>

                                <div class="mb-2">
                                    <strong>Bloom Level:</strong>
                                    {{ question.bloom_level || '-' }}
                                </div>

                                <div v-if="question.explanation" class="mb-2">
                                    <strong>Explanation:</strong>
                                    {{ question.explanation }}
                                </div>

                                <div v-if="question.options?.length" class="mb-2">
                                    <strong>Options:</strong>
                                    <v-list density="compact">
                                        <v-list-item v-for="option in question.options" :key="option.option_text">
                                            <template #prepend>
                                                <v-icon :color="option.is_correct ? 'success' : 'grey'">
                                                    {{ option.is_correct ? 'mdi-check-circle' : 'mdi-circle-outline' }}
                                                </v-icon>
                                            </template>

                                            {{ option.option_text }}
                                        </v-list-item>
                                    </v-list>
                                </div>

                                <div v-if="question.match_pairs?.length">
                                    <strong>Match Pairs:</strong>
                                    <v-table density="compact">
                                        <tbody>
                                            <tr v-for="pair in question.match_pairs" :key="pair.left_value">
                                                <td>{{ pair.left_value }}</td>
                                                <td>{{ pair.right_value }}</td>
                                            </tr>
                                        </tbody>
                                    </v-table>
                                </div>
                            </v-expansion-panel-text>
                        </v-expansion-panel>
                    </v-expansion-panels>
                </v-card-text>

                <v-card-actions>
                    <v-spacer />

                    <v-btn color="success" :disabled="selectedGeneration?.status !== 'generated'"
                        :loading="savingToBank" @click="saveToQuestionBank(selectedGeneration)">
                        Save to Question Bank & Paper
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog
            v-model="regenerationPreviewDialog"
            width="1600"
            max-width="96vw"
            persistent
            scrollable
        >
            <v-card class="rounded-xl review-dialog-card">
                <v-card-title class="d-flex align-center px-6 py-4">
                    <v-avatar color="primary" variant="tonal" size="36" class="mr-3">
                        <v-icon color="primary">mdi-compare-horizontal</v-icon>
                    </v-avatar>

                    <div>
                        <div class="text-h6 font-weight-bold">
                            Review Regenerated Question
                        </div>
                        <div class="text-caption text-grey">
                            Compare the current question with the new AI suggestion before accepting.
                        </div>
                    </div>

                    <v-spacer />

                    <v-btn icon variant="text" @click="rejectRegeneratedQuestion">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-card-title>

                <v-divider />

                <v-card-text class="pa-5 review-dialog-body">
                    <v-row class="align-stretch" no-gutters>
                        <v-col cols="12" md="6" class="d-flex pr-md-3 pb-4 pb-md-0">
                            <v-card class="comparison-card current-card flex-grow-1" elevation="2">
                                <v-card-title class="comparison-card-title bg-grey-lighten-4">
                                    <v-icon class="mr-2" color="grey-darken-1">mdi-file-document-outline</v-icon>
                                    Current Question
                                </v-card-title>

                                <v-card-text class="question-content">
                                    <div class="field-block">
                                        <div class="field-label">Question</div>
                                        <div class="field-value">
                                            {{ originalQuestionForPreview?.question || '-' }}
                                        </div>
                                    </div>

                                    <div class="field-block">
                                        <div class="field-label">Answer</div>
                                        <div class="field-value">
                                            {{ originalQuestionForPreview?.answer || '-' }}
                                        </div>
                                    </div>

                                    <v-row dense>
                                        <v-col cols="12" sm="6">
                                            <div class="field-block">
                                                <div class="field-label">Lesson</div>
                                                <div class="field-value">
                                                    {{ originalQuestionForPreview?.lesson?.name || '-' }}
                                                </div>
                                            </div>
                                        </v-col>

                                        <v-col cols="12" sm="6">
                                            <div class="field-block">
                                                <div class="field-label">Marks</div>
                                                <div class="field-value">
                                                    {{ originalQuestionForPreview?.marks || '-' }}
                                                </div>
                                            </div>
                                        </v-col>

                                        <v-col cols="12" sm="6">
                                            <div class="field-block">
                                                <div class="field-label">Difficulty</div>
                                                <div class="field-value text-capitalize">
                                                    {{ originalQuestionForPreview?.difficulty || '-' }}
                                                </div>
                                            </div>
                                        </v-col>

                                        <v-col cols="12" sm="6">
                                            <div class="field-block">
                                                <div class="field-label">Bloom Level</div>
                                                <div class="field-value text-capitalize">
                                                    {{ originalQuestionForPreview?.bloom_level || '-' }}
                                                </div>
                                            </div>
                                        </v-col>
                                    </v-row>

                                    <div v-if="originalQuestionForPreview?.options?.length" class="field-block">
                                        <div class="field-label mb-2">Options</div>

                                        <v-list density="comfortable" class="pa-0 option-list">
                                            <v-list-item
                                                v-for="option in originalQuestionForPreview.options"
                                                :key="option.option_text"
                                                rounded="lg"
                                                class="option-item mb-2"
                                            >
                                                <template #prepend>
                                                    <v-icon :color="option.is_correct ? 'success' : 'grey'">
                                                        {{ option.is_correct ? 'mdi-check-circle' : 'mdi-circle-outline' }}
                                                    </v-icon>
                                                </template>

                                                <v-list-item-title>
                                                    {{ option.option_text }}
                                                </v-list-item-title>

                                                <template #append>
                                                    <v-chip
                                                        v-if="option.is_correct"
                                                        color="success"
                                                        size="x-small"
                                                        variant="tonal"
                                                    >
                                                        Correct
                                                    </v-chip>
                                                </template>
                                            </v-list-item>
                                        </v-list>
                                    </div>

                                    <div v-if="originalQuestionForPreview?.match_pairs?.length" class="field-block">
                                        <div class="field-label mb-2">Match Pairs</div>

                                        <v-table density="compact" class="rounded-lg">
                                            <tbody>
                                                <tr
                                                    v-for="pair in originalQuestionForPreview.match_pairs"
                                                    :key="pair.left_value"
                                                >
                                                    <td>{{ pair.left_value }}</td>
                                                    <td>{{ pair.right_value }}</td>
                                                </tr>
                                            </tbody>
                                        </v-table>
                                    </div>
                                </v-card-text>
                            </v-card>
                        </v-col>

                        

                        <v-col cols="12" md="6" class="d-flex pl-md-3">
                            <v-card class="comparison-card ai-card flex-grow-1" elevation="2">
                                <v-card-title class="comparison-card-title bg-primary text-white">
                                    <v-icon class="mr-2">mdi-robot</v-icon>
                                    New AI Suggestion
                                </v-card-title>

                                <v-card-text class="question-content">
                                    <div class="field-block">
                                        <div class="field-label text-primary">Question</div>
                                        <div class="field-value">
                                            {{ regeneratedPreviewData?.question || '-' }}
                                        </div>
                                    </div>

                                    <div class="field-block">
                                        <div class="field-label text-primary">Answer</div>
                                        <div class="field-value">
                                            {{ regeneratedPreviewData?.answer || '-' }}
                                        </div>
                                    </div>

                                    <v-row dense>
                                        <v-col cols="12" sm="6">
                                            <div class="field-block">
                                                <div class="field-label text-primary">Marks</div>
                                                <div class="field-value">
                                                    {{ regeneratedPreviewData?.marks || '-' }}
                                                </div>
                                            </div>
                                        </v-col>

                                        <v-col cols="12" sm="6">
                                            <div class="field-block">
                                                <div class="field-label text-primary">Difficulty</div>
                                                <div class="field-value text-capitalize">
                                                    {{ regeneratedPreviewData?.difficulty || '-' }}
                                                </div>
                                            </div>
                                        </v-col>

                                        <v-col cols="12" sm="6">
                                            <div class="field-block">
                                                <div class="field-label text-primary">Bloom Level</div>
                                                <div class="field-value text-capitalize">
                                                    {{ regeneratedPreviewData?.bloom_level || '-' }}
                                                </div>
                                            </div>
                                        </v-col>
                                    </v-row>

                                    <div v-if="regeneratedPreviewData?.options?.length" class="field-block">
                                        <div class="field-label text-primary mb-2">Options</div>

                                        <v-list density="comfortable" class="pa-0 option-list">
                                            <v-list-item
                                                v-for="option in regeneratedPreviewData.options"
                                                :key="option.option_text"
                                                rounded="lg"
                                                class="option-item mb-2"
                                            >
                                                <template #prepend>
                                                    <v-icon :color="option.is_correct ? 'success' : 'grey'">
                                                        {{ option.is_correct ? 'mdi-check-circle' : 'mdi-circle-outline' }}
                                                    </v-icon>
                                                </template>

                                                <v-list-item-title>
                                                    {{ option.option_text }}
                                                </v-list-item-title>

                                                <template #append>
                                                    <v-chip
                                                        v-if="option.is_correct"
                                                        color="success"
                                                        size="x-small"
                                                        variant="tonal"
                                                    >
                                                        Correct
                                                    </v-chip>
                                                </template>
                                            </v-list-item>
                                        </v-list>
                                    </div>

                                    <div v-if="regeneratedPreviewData?.match_pairs?.length" class="field-block">
                                        <div class="field-label text-primary mb-2">Match Pairs</div>

                                        <v-table density="compact" class="rounded-lg">
                                            <tbody>
                                                <tr
                                                    v-for="pair in regeneratedPreviewData.match_pairs"
                                                    :key="pair.left_value"
                                                >
                                                    <td>{{ pair.left_value }}</td>
                                                    <td>{{ pair.right_value }}</td>
                                                </tr>
                                            </tbody>
                                        </v-table>
                                    </div>
                                </v-card-text>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-card-text>

                <v-divider />

                <v-card-actions class="pa-5">
                    <v-btn
                        variant="outlined"
                        color="grey-darken-1"
                        prepend-icon="mdi-close"
                        @click="rejectRegeneratedQuestion"
                    >
                        Reject
                    </v-btn>

                    <v-spacer />

                    <v-btn
                        color="success"
                        size="large"
                        prepend-icon="mdi-check"
                        :loading="acceptingRegenerated"
                        @click="acceptRegeneratedQuestion"
                    >
                        Accept New Question
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

    </v-container>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import api from '../../plugins/api'
import { useUIStore } from '../../stores/snackBar'

const ui = useUIStore()

const loading = ref(false)
const saving = ref(false)
const savingToBank = ref(false)
const syllabusLoading = ref(false)
const regeneratingQuestionId = ref(null)
const acceptingRegenerated = ref(false)
const regenerationPreviewDialog = ref(false)
const regeneratedQuestion = ref(null)
const originalQuestionForPreview = ref(null)

const blueprints = ref([])
const examNames = ref([])
const syllabus = ref(null)
const generations = ref([])
const selectedGeneration = ref(null)
const previewDialog = ref(false)

const showProgressDialog = ref(false)
const activeGenerationId = ref(null)
const progressTimer = ref(null)

const generationProgress = ref({
    id: null,
    status: null,
    progress_percentage: 0,
    current_section: null,
    progress_message: null,
    error_message: null,
    total_questions: 0,
    total_marks: 0,
})

const form = ref({
    paper_blueprint_id: null,
    exam_name_id: null,
    exam_portion_id: null,
    title: '',
    language: 'en',
    difficulty: 'medium',
})

const difficultyOptions = [
    { title: 'Easy', value: 'easy' },
    { title: 'Medium', value: 'medium' },
    { title: 'Hard', value: 'hard' },
]

const languageOptions = [
    { title: 'English', value: 'en' },
    { title: 'Hindi', value: 'hi' },
    { title: 'Urdu', value: 'ur' },
]

const headers = [
    { title: 'Title', key: 'title' },
    { title: 'Exam', key: 'exam_name.name' },
    { title: 'Status', key: 'status' },
    { title: 'Progress', key: 'progress', sortable: false },
    { title: 'Questions', key: 'total_questions' },
    { title: 'Marks', key: 'total_marks' },
    { title: 'Actions', key: 'actions', sortable: false },
]

const normalizeListResponse = (payload) => {
    if (Array.isArray(payload)) return payload
    if (Array.isArray(payload?.data)) return payload.data
    if (Array.isArray(payload?.data?.data)) return payload.data.data
    return []
}

const resetForm = () => {
    form.value = {
        paper_blueprint_id: null,
        exam_name_id: null,
        exam_portion_id: null,
        title: '',
        language: 'en',
        difficulty: 'medium',
    }

    syllabus.value = null
}

const statusColor = (status) => {
    if (status === 'generated') return 'success'
    if (status === 'generating') return 'primary'
    if (status === 'failed') return 'error'
    if (status === 'converted') return 'purple'
    return 'grey'
}

const fetchBlueprints = async () => {
    try {
        const res = await api.get('/paper-blueprints?per_page=1000')
        blueprints.value = normalizeListResponse(res.data)
    } catch (e) {
        ui.showSnackbar(
            e.response?.data?.message || 'Failed to load blueprints.',
            'error'
        )
    }
}

const fetchExamNames = async () => {
    try {
        const res = await api.get('/exam-names?per_page=1000')
        examNames.value = normalizeListResponse(res.data)
    } catch (e) {
        ui.showSnackbar(
            e.response?.data?.message || 'Failed to load exam names.',
            'error'
        )
    }
}

const fetchGenerations = async () => {
    loading.value = true

    try {
        const res = await api.get('/ai-paper-generations?per_page=50')
        generations.value = normalizeListResponse(res.data)
    } catch (e) {
        ui.showSnackbar(
            e.response?.data?.message || 'Failed to load AI generations.',
            'error'
        )
    } finally {
        loading.value = false
    }
}

const loadExamPortion = async () => {
    syllabus.value = null
    form.value.exam_portion_id = null

    if (!form.value.exam_name_id) return

    syllabusLoading.value = true

    try {
        const res = await api.get(
            `/exam-portions/by-exam/${form.value.exam_name_id}`
        )

        const data = res.data?.data || res.data

        syllabus.value = data
        form.value.exam_portion_id = data.id
    } catch (e) {
        ui.showSnackbar(
            e.response?.data?.message || 'No approved syllabus found for this exam.',
            'warning'
        )
    } finally {
        syllabusLoading.value = false
    }
}

const stopProgressPolling = () => {
    if (progressTimer.value) {
        clearInterval(progressTimer.value)
        progressTimer.value = null
    }
}

const startProgressPolling = (id) => {
    activeGenerationId.value = id
    showProgressDialog.value = true

    stopProgressPolling()

    progressTimer.value = setInterval(async () => {
        try {
            const res = await api.get(`/ai-paper-generations/${id}/progress`)
            generationProgress.value = res.data.data

            if (
                ['generated', 'failed', 'converted'].includes(
                    generationProgress.value.status
                )
            ) {
                stopProgressPolling()
                await fetchGenerations()
            }
        } catch (e) {
            stopProgressPolling()

            ui.showSnackbar(
                e.response?.data?.message || 'Failed to fetch generation progress.',
                'error'
            )
        }
    }, 2000)
}

const generatePaper = async () => {
    if (!form.value.paper_blueprint_id) {
        ui.showSnackbar('Please select a blueprint.', 'warning')
        return
    }

    if (!form.value.exam_name_id) {
        ui.showSnackbar('Please select an exam.', 'warning')
        return
    }

    if (!form.value.exam_portion_id) {
        ui.showSnackbar('Approved exam syllabus not loaded.', 'warning')
        return
    }

    const ok = await ui.confirmDialog(
        'Generate AI Paper',
        'Generate a new AI question paper using the selected blueprint and approved syllabus?'
    )

    if (!ok) return

    saving.value = true

    try {
        const res = await api.post('/ai-paper-generations', form.value)

        ui.showSnackbar(res.data?.message || 'AI paper generation started.')

        const generationId = res.data?.data?.id

        resetForm()
        await fetchGenerations()

        if (generationId) {
            generationProgress.value = {
                id: generationId,
                status: 'draft',
                progress_percentage: 0,
                current_section: null,
                progress_message: 'Starting AI generation...',
                error_message: null,
                total_questions: 0,
                total_marks: 0,
            }

            startProgressPolling(generationId)
        }
    } catch (e) {
        console.error('AI generation error:', e.response?.data || e)

        ui.showSnackbar(
            e.response?.data?.message || 'Failed to generate paper.',
            'error'
        )
    } finally {
        saving.value = false
    }
}

const viewGeneration = async (item) => {
    try {
        const res = await api.get(`/ai-paper-generations/${item.id}`)
        selectedGeneration.value = res.data.data
        previewDialog.value = true
    } catch (e) {
        ui.showSnackbar(
            e.response?.data?.message || 'Failed to load AI generation.',
            'error'
        )
    }
}

const regeneratedPreviewData = computed(() => {
    return regeneratedQuestion.value?.regenerated_preview || null
})

const regenerateQuestion = async (question) => {
    const ok = await ui.confirmDialog(
        'Regenerate Question',
        'Generate a new version of this question for preview?'
    )

    if (!ok) return

    originalQuestionForPreview.value = question
    regeneratingQuestionId.value = question.id

    try {
        const res = await api.post(
            `/ai-generated-questions/${question.id}/regenerate-preview`
        )

        regeneratedQuestion.value = res.data.data
        regenerationPreviewDialog.value = true

        ui.showSnackbar(
            res.data?.message || 'Regenerated question preview created.'
        )
    } catch (e) {
        console.error('Question regeneration preview error:', e.response?.data || e)

        ui.showSnackbar(
            e.response?.data?.message || 'Failed to regenerate question preview.',
            'error'
        )
    } finally {
        regeneratingQuestionId.value = null
    }
}

const acceptRegeneratedQuestion = async () => {
    if (!regeneratedQuestion.value?.id) return

    acceptingRegenerated.value = true

    try {
        const res = await api.post(
            `/ai-generated-questions/${regeneratedQuestion.value.id}/accept-regenerated`
        )

        ui.showSnackbar(
            res.data?.message || 'Regenerated question accepted.'
        )

        regenerationPreviewDialog.value = false
        regeneratedQuestion.value = null
        originalQuestionForPreview.value = null

        if (selectedGeneration.value?.id) {
            await viewGeneration(selectedGeneration.value)
        }
    } catch (e) {
        console.error('Accept regenerated question error:', e.response?.data || e)

        ui.showSnackbar(
            e.response?.data?.message || 'Failed to accept regenerated question.',
            'error'
        )
    } finally {
        acceptingRegenerated.value = false
    }
}

const rejectRegeneratedQuestion = () => {
    regenerationPreviewDialog.value = false
    regeneratedQuestion.value = null
    originalQuestionForPreview.value = null
}

const saveToQuestionBank = async (item) => {
    if (!item?.id) return

    const ok = await ui.confirmDialog(
        'Save AI Questions',
        'Save selected AI questions to Question Bank and create AI Question Paper?'
    )

    if (!ok) return

    savingToBank.value = true

    try {
        const res = await api.post(
            `/ai-paper-generations/${item.id}/save-to-question-bank`
        )

        ui.showSnackbar(
            res.data?.message || 'Saved to Question Bank and Paper successfully.'
        )

        previewDialog.value = false
        await fetchGenerations()
    } catch (e) {
        ui.showSnackbar(
            e.response?.data?.message || 'Failed to save questions.',
            'error'
        )
    } finally {
        savingToBank.value = false
    }
}

const deleteGeneration = async (item) => {
    const ok = await ui.confirmDialog(
        'Delete AI Generation',
        'Are you sure you want to delete this AI generation?'
    )

    if (!ok) return

    try {
        const res = await api.delete(`/ai-paper-generations/${item.id}`)

        ui.showSnackbar(res.data?.message || 'AI generation deleted.')
        await fetchGenerations()
    } catch (e) {
        ui.showSnackbar(
            e.response?.data?.message || 'Failed to delete AI generation.',
            'error'
        )
    }
}

onMounted(async () => {
    await fetchBlueprints()
    await fetchExamNames()
    await fetchGenerations()
})

onUnmounted(() => {
    stopProgressPolling()
})
</script>
<style scoped>
.review-dialog-card {
    overflow: hidden;
}

.review-dialog-body {
    background: #f7f9fc;
}

.comparison-card {
    min-height: 560px;
    max-height: 68vh;
    display: flex;
    flex-direction: column;
    border: 1px solid rgba(0, 0, 0, 0.08);
    background: #ffffff;
}

.comparison-card-title {
    min-height: 58px;
    display: flex;
    align-items: center;
    font-weight: 700;
}

.comparison-card .v-card-text {
    flex: 1;
}

.question-content {
    overflow-y: auto;
    padding: 20px !important;
}

.field-block {
    margin-bottom: 18px;
}

.field-label {
    font-size: 0.78rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #5f6b7a;
    margin-bottom: 6px;
}

.field-value {
    font-size: 0.96rem;
    line-height: 1.55;
    color: #263238;
    word-break: break-word;
}

.option-list {
    background: transparent;
}

.option-item {
    border: 1px solid rgba(0, 0, 0, 0.08);
    background: #ffffff;
}

.ai-card {
    border-color: rgba(var(--v-theme-primary), 0.24);
}

.ai-card .question-content {
    background: rgba(var(--v-theme-primary), 0.06);
}

.current-card .question-content {
    background: #ffffff;
}

.compare-arrow {
    width: 58px;
    height: 58px;
    border-radius: 50%;
    background: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.12);
}

@media (max-width: 959px) {
    .comparison-card {
        min-height: 420px;
        max-height: none;
    }
}
</style>