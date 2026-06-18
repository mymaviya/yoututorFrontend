<template>
  <v-container fluid>
    <v-card elevation="2">
      <v-card-title class="d-flex align-center justify-space-between">
        <div>
          <h2 class="text-h5 font-weight-bold">
            {{ isEdit ? 'Edit Proposal Template' : 'Create Proposal Template' }}
          </h2>
          <p class="text-body-2 text-medium-emphasis mb-0">
            Manage reusable proposal content sections
          </p>
        </div>

        <v-btn variant="tonal" prepend-icon="mdi-arrow-left" to="/admin/proposal-templates">
          Back
        </v-btn>
      </v-card-title>

      <v-divider />

      <v-card-text>
        <v-form @submit.prevent="saveTemplate">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.name"
                label="Template Name"
                variant="outlined"
                :error-messages="formErrors.name"
                @input="autoSlug"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.slug"
                label="Slug"
                variant="outlined"
                :error-messages="formErrors.slug"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.project_type"
                label="Project Type"
                variant="outlined"
                placeholder="question_paper_erp"
                :error-messages="formErrors.project_type"
              />
            </v-col>

            <v-col cols="12" md="3">
              <v-text-field
                v-model="form.sort_order"
                label="Sort Order"
                type="number"
                variant="outlined"
                :error-messages="formErrors.sort_order"
              />
            </v-col>

            <v-col cols="12" md="3">
              <v-switch
                v-model="form.is_active"
                label="Active"
                color="primary"
                inset
              />
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="form.description"
                label="Description"
                rows="3"
                variant="outlined"
                :error-messages="formErrors.description"
              />
            </v-col>
          </v-row>

          <v-divider class="my-4" />

          <div class="d-flex justify-space-between align-center mb-4">
            <h3 class="text-h6">Template Sections</h3>

            <v-btn color="primary" variant="tonal" prepend-icon="mdi-plus" @click="addSection">
              Add Section
            </v-btn>
          </div>

          <v-expansion-panels multiple>
            <v-expansion-panel
              v-for="(section, index) in form.sections"
              :key="index"
            >
              <v-expansion-panel-title>
                <div class="d-flex align-center justify-space-between w-100">
                  <strong>{{ section.title || 'Untitled Section' }}</strong>

                  <div class="d-flex align-center gap-2" @click.stop>
                    <v-chip size="small" color="primary" variant="tonal">
                      #{{ index + 1 }}
                    </v-chip>

                    <v-switch
                      v-model="section.is_editable"
                      label="Editable"
                      density="compact"
                      hide-details
                      color="primary"
                    />
                  </div>
                </div>
              </v-expansion-panel-title>

              <v-expansion-panel-text>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="section.title"
                      label="Section Title"
                      variant="outlined"
                      density="comfortable"
                      @input="autoSectionKey(section)"
                    />
                  </v-col>

                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="section.section_key"
                      label="Section Key"
                      variant="outlined"
                      density="comfortable"
                    />
                  </v-col>

                  <v-col cols="12" md="2">
                    <v-text-field
                      v-model="section.sort_order"
                      label="Sort"
                      type="number"
                      variant="outlined"
                      density="comfortable"
                    />
                  </v-col>

                  <v-col cols="12">
                    <v-textarea
                      v-model="section.content"
                      label="Section Content HTML"
                      rows="8"
                      variant="outlined"
                      density="comfortable"
                    />
                  </v-col>

                  <v-col cols="12" class="d-flex justify-end">
                    <v-btn
                      color="error"
                      variant="tonal"
                      prepend-icon="mdi-delete"
                      @click="removeSection(index)"
                    >
                      Remove Section
                    </v-btn>
                  </v-col>
                </v-row>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>

          <v-alert
            v-if="!form.sections.length"
            type="info"
            variant="tonal"
            class="mt-4"
          >
            No sections added yet. Add sections like Cover Page, Scope of Work, Deliverables,
            Commercials and Terms & Conditions.
          </v-alert>

          <v-divider class="my-4" />

          <div class="d-flex justify-end gap-2">
            <v-btn variant="tonal" to="/admin/proposal-templates">
              Cancel
            </v-btn>

            <v-btn color="primary" type="submit" :loading="saving" prepend-icon="mdi-content-save">
              {{ isEdit ? 'Update Template' : 'Create Template' }}
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import proposalService from '../../../../services/proposalService'
import { useUIStore } from '../../../../stores/snackBar'

const route = useRoute()
const router = useRouter()
const ui = useUIStore()

const isEdit = computed(() => !!route.params.id)

const saving = ref(false)
const formErrors = ref({})

const form = ref({
  name: '',
  slug: '',
  project_type: '',
  description: '',
  sort_order: 0,
  is_active: true,
  sections: [],
})

const slugify = (text) => {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const keyify = (text) => {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

const autoSlug = () => {
  if (!isEdit.value) {
    form.value.slug = slugify(form.value.name)
  }
}

const autoSectionKey = (section) => {
  if (!section.id) {
    section.section_key = keyify(section.title)
  }
}

const addSection = () => {
  const next = form.value.sections.length + 1

  form.value.sections.push({
    title: '',
    section_key: '',
    content: '',
    sort_order: next,
    is_editable: true,
  })
}

const removeSection = (index) => {
  form.value.sections.splice(index, 1)

  form.value.sections.forEach((section, i) => {
    section.sort_order = i + 1
  })
}

const fetchTemplate = async () => {
  if (!isEdit.value) {
    addDefaultSections()
    return
  }

  try {
    const response = await proposalService.getTemplate(route.params.id)
    const template = response.data.data

    form.value = {
      name: template.name || '',
      slug: template.slug || '',
      project_type: template.project_type || '',
      description: template.description || '',
      sort_order: template.sort_order || 0,
      is_active: !!template.is_active,
      sections: template.sections || [],
    }
  } catch (error) {
    ui.showSnackbar?.('Failed to load template.', 'error')
    console.error(error)
  }
}

const addDefaultSections = () => {
  form.value.sections = [
    {
      title: 'Cover Page',
      section_key: 'cover_page',
      content: '<h2>Project Proposal</h2><p>Prepared by <strong>Maviya IT Services</strong>.</p>',
      sort_order: 1,
      is_editable: true,
    },
    {
      title: 'About Company',
      section_key: 'about_company',
      content: '<p>Maviya IT Services provides professional software development, ERP, CRM, website, mobile app and SaaS solutions.</p>',
      sort_order: 2,
      is_editable: true,
    },
    {
      title: 'Scope of Work',
      section_key: 'scope_of_work',
      content: '<p>The scope of work will include planning, development, testing, deployment and training as per approved requirements.</p>',
      sort_order: 3,
      is_editable: true,
    },
    {
      title: 'Deliverables',
      section_key: 'deliverables',
      content: '<ul><li>Admin Panel</li><li>User Management</li><li>Reports</li><li>Deployment</li><li>Training</li></ul>',
      sort_order: 4,
      is_editable: true,
    },
    {
      title: 'Timeline',
      section_key: 'timeline',
      content: '<p>The final timeline will be decided after requirement confirmation and approval.</p>',
      sort_order: 5,
      is_editable: true,
    },
    {
      title: 'Terms & Conditions',
      section_key: 'terms_conditions',
      content: '<ul><li>Work will start after advance payment.</li><li>Additional requirements outside approved scope will be charged separately.</li><li>GST will be applicable as per government rules.</li></ul>',
      sort_order: 6,
      is_editable: true,
    },
  ]
}

const saveTemplate = async () => {
  saving.value = true
  formErrors.value = {}

  try {
    if (isEdit.value) {
      await proposalService.updateTemplate(route.params.id, form.value)
      ui.showSnackbar?.('Proposal template updated successfully.', 'success')
    } else {
      await proposalService.createTemplate(form.value)
      ui.showSnackbar?.('Proposal template created successfully.', 'success')
    }

    router.push('/admin/proposal-templates')
  } catch (error) {
    if (error.response?.status === 422) {
      formErrors.value = error.response.data.errors || {}
    }

    ui.showSnackbar?.('Failed to save proposal template.', 'error')
    console.error(error)
  } finally {
    saving.value = false
  }
}

onMounted(fetchTemplate)
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}

.w-100 {
  width: 100%;
}
</style>