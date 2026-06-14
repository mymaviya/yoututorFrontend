<template>
  <v-container fluid>
    <v-card class="rounded-xl">
      <v-card-title class="d-flex align-center justify-space-between">
        <div>
          <div class="text-h6 font-weight-bold">Subject Templates</div>
          <div class="text-caption text-medium-emphasis">
            Create reusable subject templates with common/stream-specific subjects.
          </div>
        </div>

        <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreate">
          Add Template
        </v-btn>
      </v-card-title>

      <v-divider />

      <v-card-text>
        <v-table>
          <thead>
            <tr>
              <th>Template Name</th>
              <th>Subjects</th>
              <th>Status</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="template in templates" :key="template.id">
              <td class="font-weight-bold">
                {{ template.name }}
              </td>

              <td>
                <div class="d-flex flex-wrap ga-1">
                  <v-chip
                    v-for="item in template.items || []"
                    :key="item.id"
                    size="small"
                    :color="item.is_common ? 'success' : 'primary'"
                    variant="tonal"
                  >
                    {{ item.subject_name }}
                    <span v-if="item.is_common" class="ml-1">(Common)</span>
                  </v-chip>
                </div>
              </td>

              <td>
                <v-chip
                  size="small"
                  :color="template.is_active ? 'success' : 'error'"
                  variant="tonal"
                >
                  {{ template.is_active ? 'Active' : 'Inactive' }}
                </v-chip>
              </td>

              <td class="text-right">
                <v-btn
                  icon="mdi-play"
                  size="small"
                  variant="text"
                  color="success"
                  @click="openApply(template)"
                />

                <v-btn
                  icon="mdi-pencil"
                  size="small"
                  variant="text"
                  color="primary"
                  @click="openEdit(template)"
                />

                <v-btn
                  icon="mdi-delete"
                  size="small"
                  variant="text"
                  color="error"
                  @click="deleteTemplate(template)"
                />
              </td>
            </tr>

            <tr v-if="!templates.length">
              <td colspan="4" class="text-center text-medium-emphasis py-8">
                No subject templates found.
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>

    <!-- Create/Edit Dialog -->
    <v-dialog v-model="dialog" max-width="900">
      <v-card class="rounded-xl">
        <v-card-title class="d-flex align-center justify-space-between">
          <span class="font-weight-bold">
            {{ form.id ? 'Edit Subject Template' : 'Add Subject Template' }}
          </span>

          <v-btn icon="mdi-close" variant="text" @click="dialog = false" />
        </v-card-title>

        <v-divider />

        <v-card-text>
          <v-form @submit.prevent="saveTemplate">
            <v-text-field
              v-model="form.name"
              label="Template Name"
              variant="outlined"
              density="comfortable"
              :error-messages="formErrors.name"
              class="mb-4"
            />

            <div class="text-subtitle-2 font-weight-bold mb-2">
              Subjects
            </div>

            <v-alert type="info" variant="tonal" class="mb-4">
              Mark subjects as <strong>Common</strong> if they should be shared across all streams.
            </v-alert>

            <v-card variant="outlined" class="rounded-lg mb-4">
              <v-table>
                <thead>
                  <tr>
                    <th style="width: 65%">Subject Name</th>
                    <th style="width: 20%">Common</th>
                    <th style="width: 15%" class="text-right">Action</th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-for="(subject, index) in form.subjects" :key="index">
                    <td>
                      <v-text-field
                        v-model="subject.subject_name"
                        placeholder="Example: English Core (301)"
                        variant="outlined"
                        density="compact"
                        hide-details
                      />
                    </td>

                    <td>
                      <v-checkbox
                        v-model="subject.is_common"
                        color="success"
                        hide-details
                        density="compact"
                      />
                    </td>

                    <td class="text-right">
                      <v-btn
                        icon="mdi-delete"
                        color="error"
                        variant="text"
                        size="small"
                        :disabled="form.subjects.length === 1"
                        @click="removeSubject(index)"
                      />
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </v-card>

            <v-alert
              v-if="formErrors.subjects"
              type="error"
              variant="tonal"
              class="mb-4"
            >
              {{ formErrors.subjects[0] }}
            </v-alert>

            <v-btn
              color="primary"
              variant="tonal"
              prepend-icon="mdi-plus"
              class="mb-4"
              @click="addSubject"
            >
              Add Subject
            </v-btn>

            <v-switch
              v-model="form.is_active"
              color="success"
              label="Active"
              inset
            />
          </v-form>
        </v-card-text>

        <v-divider />

        <v-card-actions>
          <v-spacer />

          <v-btn variant="text" @click="dialog = false">
            Cancel
          </v-btn>

          <v-btn color="primary" :loading="saving" @click="saveTemplate">
            Save Template
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Apply Dialog -->
    <v-dialog v-model="applyDialog" max-width="700">
      <v-card class="rounded-xl">
        <v-card-title class="d-flex align-center justify-space-between">
          <span class="font-weight-bold">Apply Subject Template</span>
          <v-btn icon="mdi-close" variant="text" @click="applyDialog = false" />
        </v-card-title>

        <v-divider />

        <v-card-text>
          <v-alert type="info" variant="tonal" class="mb-4">
            Applying template:
            <strong>{{ applyForm.template_name }}</strong>
          </v-alert>

          <v-select
            v-model="applyForm.grade_ids"
            :items="grades"
            item-title="name"
            item-value="id"
            label="Classes"
            multiple
            chips
            variant="outlined"
            :error-messages="applyErrors.grade_ids"
          />

          <v-select
            v-model="applyForm.stream_id"
            :items="streams"
            item-title="name"
            item-value="id"
            label="Stream (Optional)"
            clearable
            variant="outlined"
            class="mt-4"
            :error-messages="applyErrors.stream_id"
          />

          <v-alert type="warning" variant="tonal" class="mt-4">
            Common subjects will be created with <strong>stream_id = NULL</strong>.
            Stream-specific subjects will use the selected stream.
          </v-alert>
        </v-card-text>

        <v-divider />

        <v-card-actions>
          <v-spacer />

          <v-btn variant="text" @click="applyDialog = false">
            Cancel
          </v-btn>

          <v-btn color="success" :loading="applying" @click="applyTemplate">
            Apply Template
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from "../../plugins/api";
import { useUIStore } from "../../stores/snackBar";

const ui = useUIStore()

const templates = ref([])
const grades = ref([])
const streams = ref([])

const dialog = ref(false)
const saving = ref(false)
const formErrors = ref({})

const applyDialog = ref(false)
const applying = ref(false)
const applyErrors = ref({})

const form = ref({
  id: null,
  name: '',
  subjects: [
    {
      subject_name: '',
      is_common: false,
    },
  ],
  is_active: true,
})

const applyForm = ref({
  template_id: null,
  template_name: '',
  grade_ids: [],
  stream_id: null,
})

const fetchTemplates = async () => {
  const res = await api.get('/subject-templates')
  templates.value = res.data || []
}

const loadMasters = async () => {
  const [gradesRes, streamsRes] = await Promise.all([
    api.get('/grades'),
    api.get('/streams'),
  ])

  grades.value = gradesRes.data || []
  streams.value = streamsRes.data || []
}

const resetForm = () => {
  formErrors.value = {}

  form.value = {
    id: null,
    name: '',
    subjects: [
      {
        subject_name: '',
        is_common: false,
      },
    ],
    is_active: true,
  }
}

const openCreate = () => {
  resetForm()
  dialog.value = true
}

const openEdit = (template) => {
  formErrors.value = {}

  form.value = {
    id: template.id,
    name: template.name,
    subjects: (template.items || []).length
      ? (template.items || []).map((item) => ({
          subject_name: item.subject_name,
          is_common: !!item.is_common,
        }))
      : [
          {
            subject_name: '',
            is_common: false,
          },
        ],
    is_active: !!template.is_active,
  }

  dialog.value = true
}

const addSubject = () => {
  form.value.subjects.push({
    subject_name: '',
    is_common: false,
  })
}

const removeSubject = (index) => {
  if (form.value.subjects.length === 1) return
  form.value.subjects.splice(index, 1)
}

const cleanSubjects = () => {
  return form.value.subjects
    .map((subject) => ({
      subject_name: String(subject.subject_name || '').trim(),
      is_common: !!subject.is_common,
    }))
    .filter((subject) => subject.subject_name)
}

const saveTemplate = async () => {
  formErrors.value = {}

  const payload = {
    name: form.value.name,
    subjects: cleanSubjects(),
    is_active: form.value.is_active,
  }

  if (!payload.subjects.length) {
    formErrors.value = {
      subjects: ['Please add at least one subject.'],
    }

    ui.showSnackbar('Please add at least one subject.', 'warning')
    return
  }

  saving.value = true

  try {
    if (form.value.id) {
      await api.put(`/subject-templates/${form.value.id}`, payload)
      ui.showSnackbar('Subject template updated successfully', 'success')
    } else {
      await api.post('/subject-templates', payload)
      ui.showSnackbar('Subject template created successfully', 'success')
    }

    dialog.value = false
    await fetchTemplates()
  } catch (err) {
    if (err.response?.status === 422) {
      formErrors.value = err.response.data.errors || {}
    }

    ui.showSnackbar(
      err.response?.data?.message || 'Failed to save subject template',
      'error'
    )
  } finally {
    saving.value = false
  }
}

const openApply = (template) => {
  applyErrors.value = {}

  applyForm.value = {
    template_id: template.id,
    template_name: template.name,
    grade_ids: [],
    stream_id: null,
  }

  applyDialog.value = true
}

const applyTemplate = async () => {
  applyErrors.value = {}

  if (!applyForm.value.grade_ids.length) {
    applyErrors.value = {
      grade_ids: ['Please select at least one class.'],
    }

    ui.showSnackbar('Please select at least one class.', 'warning')
    return
  }

  applying.value = true

  try {
    const res = await api.post(
      `/subject-templates/${applyForm.value.template_id}/apply`,
      {
        grade_ids: applyForm.value.grade_ids,
        stream_id: applyForm.value.stream_id,
      }
    )

    ui.showSnackbar(
      `Template applied successfully. Created: ${res.data.created}, Skipped: ${res.data.skipped}`,
      'success'
    )

    applyDialog.value = false
  } catch (err) {
    if (err.response?.status === 422) {
      applyErrors.value = err.response.data.errors || {}
    }

    ui.showSnackbar(
      err.response?.data?.message || 'Failed to apply template',
      'error'
    )
  } finally {
    applying.value = false
  }
}

const deleteTemplate = async (template) => {
  if (!confirm(`Delete template "${template.name}"?`)) return

  await api.delete(`/subject-templates/${template.id}`)
  ui.showSnackbar('Subject template deleted successfully', 'success')
  await fetchTemplates()
}

onMounted(async () => {
  await fetchTemplates()
  await loadMasters()
})
</script>