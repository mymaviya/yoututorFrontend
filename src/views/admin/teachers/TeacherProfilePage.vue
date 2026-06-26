<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../../../plugins/api'
import { useUIStore } from '../../../stores/snackBar'

const route = useRoute()
const router = useRouter()
const ui = useUIStore()

const loading = ref(false)
const saving = ref(false)
const errors = ref({})
const teacher = ref(null)

const form = ref({
  employee_code: '',
  designation: '',
  qualification: '',
  joining_date: '',
  experience_years: null,
  bio: '',
})

const teacherId = computed(() => route.params.id)

const profile = computed(() => teacher.value?.teacher_profile || teacher.value?.teacherProfile || {})

const assignments = computed(() => {
  return teacher.value?.teacher_assignments || teacher.value?.teacherAssignments || []
})

const loadProfile = async () => {
  loading.value = true
  errors.value = {}

  try {
    const res = await api.get(`/teachers/${teacherId.value}/profile`)
    teacher.value = res.data?.data || res.data

    const p = profile.value || {}

    form.value = {
      employee_code: p.employee_code || '',
      designation: p.designation || '',
      qualification: p.qualification || '',
      joining_date: p.joining_date || '',
      experience_years: p.experience_years ?? null,
      bio: p.bio || '',
    }
  } catch (error) {
    ui.showSnackbar(error.response?.data?.message || 'Failed to load teacher profile', 'error')
  } finally {
    loading.value = false
  }
}

const saveProfile = async () => {
  saving.value = true
  errors.value = {}

  try {
    const res = await api.put(`/teachers/${teacherId.value}/profile`, form.value)
    const updatedProfile = res.data?.data || res.data

    teacher.value = {
      ...teacher.value,
      teacher_profile: updatedProfile,
      teacherProfile: updatedProfile,
    }

    ui.showSnackbar('Teacher profile updated successfully', 'success')
  } catch (error) {
    if (error.response?.status === 422) {
      errors.value = error.response.data.errors || {}
    }

    ui.showSnackbar(error.response?.data?.message || 'Failed to update teacher profile', 'error')
  } finally {
    saving.value = false
  }
}

onMounted(loadProfile)
</script>

<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">
          Teacher Profile
        </h1>

        <p class="text-grey">
          View and update teacher professional details.
        </p>
      </div>

      <v-btn
        variant="tonal"
        prepend-icon="mdi-arrow-left"
        @click="router.push({ name: 'teachers.index' })"
      >
        Back to Teachers
      </v-btn>
    </div>

    <v-card v-if="loading" class="pa-8 rounded-xl" elevation="0">
      <v-progress-linear indeterminate />
      <div class="mt-4 text-grey">
        Loading teacher profile...
      </div>
    </v-card>

    <template v-else>
      <v-row>
        <v-col cols="12" md="4">
          <v-card class="rounded-xl pa-5" elevation="0">
            <div class="d-flex align-center ga-4 mb-4">
              <v-avatar color="primary" size="64">
                <span class="text-h5 text-white">
                  {{ teacher?.name?.charAt(0)?.toUpperCase() || 'T' }}
                </span>
              </v-avatar>

              <div>
                <div class="text-h6 font-weight-bold">
                  {{ teacher?.name || 'Teacher' }}
                </div>
                <div class="text-body-2 text-grey">
                  {{ teacher?.email || '-' }}
                </div>
                <div class="text-body-2 text-grey">
                  {{ teacher?.contact || '-' }}
                </div>
              </div>
            </div>

            <v-divider class="my-4" />

            <div class="text-subtitle-2 mb-2">
              Assignments
            </div>

            <div v-if="assignments.length" class="d-flex flex-wrap ga-2">
              <v-chip
                v-for="assignment in assignments"
                :key="assignment.id || `${assignment.grade_id}-${assignment.subject_id}`"
                color="primary"
                variant="tonal"
                size="small"
              >
                {{ assignment.grade?.name || 'Grade' }}
                <span v-if="assignment.stream?.name">
                  - {{ assignment.stream.name }}
                </span>
                - {{ assignment.subject?.name || 'Subject' }}
              </v-chip>
            </div>

            <div v-else class="text-grey text-body-2">
              No assignments found.
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" md="8">
          <v-card class="rounded-xl" elevation="0">
            <v-card-title>
              Professional Details
            </v-card-title>

            <v-divider />

            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.employee_code"
                    label="Employee Code"
                    :error-messages="errors.employee_code"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.designation"
                    label="Designation"
                    :error-messages="errors.designation"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.qualification"
                    label="Qualification"
                    :error-messages="errors.qualification"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.joining_date"
                    label="Joining Date"
                    type="date"
                    :error-messages="errors.joining_date"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="form.experience_years"
                    label="Experience Years"
                    type="number"
                    min="0"
                    max="60"
                    :error-messages="errors.experience_years"
                  />
                </v-col>

                <v-col cols="12">
                  <v-textarea
                    v-model="form.bio"
                    label="Bio / Notes"
                    rows="4"
                    auto-grow
                    :error-messages="errors.bio"
                  />
                </v-col>
              </v-row>
            </v-card-text>

            <v-card-actions class="pa-4">
              <v-spacer />

              <v-btn
                color="primary"
                :loading="saving"
                prepend-icon="mdi-content-save"
                @click="saveProfile"
              >
                Save Profile
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </div>
</template>
