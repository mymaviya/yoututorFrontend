<script setup>
import { computed, ref, onMounted } from 'vue'
import api from '../../plugins/api'
import { useUIStore } from '../../stores/snackBar'

const ui = useUIStore()

const teachers = ref([])
const grades = ref([])
const academicYears = ref([])

const dialog = ref(false)
const editMode = ref(false)
const loading = ref(false)
const saving = ref(false)
const errors = ref({})

const subscriptionStatus = ref(null)

const usedUsers = computed(() => Number(subscriptionStatus.value?.used_users ?? 0))
const maxUsers = computed(() => Number(subscriptionStatus.value?.max_users ?? 0))
const remainingUsers = computed(() => Number(subscriptionStatus.value?.remaining_users ?? 0))
const canCreateUsers = computed(() => Boolean(subscriptionStatus.value?.can_create_users ?? true))
const hasUserLimit = computed(() => maxUsers.value > 0)
const userLimitReached = computed(() => hasUserLimit.value && !canCreateUsers.value)

const fetchSubscriptionStatus = async () => {
  try {
    const res = await api.get('/my-subscription-status')
    subscriptionStatus.value = res.data?.data || res.data
  } catch (error) {
    console.error(error)
    subscriptionStatus.value = null
  }
}

const newAssignment = () => ({
  academic_year_id: null,
  grade_id: null,
  section_id: null,
  stream_id: null,
  subject_id: null,
  sections: [],
  subjects: []
})

const form = ref({
  id: null,
  name: '',
  email: '',
  contact: '',
  qualification: '',
  designation: '',
  is_active: true,
  assignments: [newAssignment()]
})

const headers = [
  { title: 'Name', key: 'name' },
  { title: 'Email', key: 'email' },
  { title: 'Contact', key: 'contact' },
  { title: 'Assignments', key: 'teacher_assignments' },
  { title: 'Status', key: 'is_active' },
  { title: 'Actions', key: 'actions', sortable: false }
]

const fetchTeachers = async () => {
  loading.value = true
  try {
    const res = await api.get('/teachers')
    teachers.value = res.data.data || res.data
  } finally {
    loading.value = false
  }
}

const fetchGrades = async () => {
  const res = await api.get('/grades')
  grades.value = res.data.data || res.data
}

const fetchAcademicYears = async () => {
  const res = await api.get('/academic-years', { params: { per_page: 100 } })
  const payload = res.data?.data || res.data
  academicYears.value = payload?.data || payload || []
}

const fetchSectionsByGrade = async (index) => {
  const assignment = form.value.assignments[index]
  assignment.section_id = null
  assignment.sections = []

  if (!assignment.grade_id) return

  const res = await api.get('/sections', {
    params: { grade_id: assignment.grade_id }
  })

  assignment.sections = res.data?.data || res.data || []
}

const fetchSubjectsByGrade = async (index, reset = true) => {
  const assignment = form.value.assignments[index]

  if (reset) {
    assignment.subject_id = null
    assignment.subjects = []
  }

  if (!assignment.grade_id) return

  const res = await api.get('/subjects', {
    params: {
      grade_id: assignment.grade_id,
      stream_id: assignment.stream_id || undefined
    }
  })

  assignment.subjects = res.data.data || res.data
}

const onGradeChange = async (index) => {
  await Promise.all([
    fetchSectionsByGrade(index),
    fetchSubjectsByGrade(index)
  ])
}

const openAdd = () => {
  if (userLimitReached.value) {
    ui.showSnackbar('User limit reached for this subscription plan. Please upgrade your plan to add more teachers.', 'warning')
    return
  }

  editMode.value = false
  errors.value = {}

  const defaultYearId = academicYears.value.find(item => item.is_active)?.id || academicYears.value[0]?.id || null

  form.value = {
    id: null,
    name: '',
    email: '',
    contact: '',
    qualification: '',
    designation: '',
    is_active: true,
    assignments: [{ ...newAssignment(), academic_year_id: defaultYearId }]
  }

  dialog.value = true
}

const openEdit = async (teacher) => {
  editMode.value = true
  errors.value = {}

  form.value = {
    id: teacher.id,
    name: teacher.name || '',
    email: teacher.email || '',
    contact: teacher.contact || '',
    qualification: teacher.qualification || '',
    designation: teacher.designation || '',
    is_active: Boolean(teacher.is_active),
    assignments: teacher.teacher_assignments?.length
      ? teacher.teacher_assignments.map(item => ({
        academic_year_id: item.academic_year_id,
        grade_id: item.grade_id,
        section_id: item.section_id,
        stream_id: item.stream_id,
        subject_id: item.subject_id,
        sections: [],
        subjects: []
      }))
      : [newAssignment()]
  }

  dialog.value = true

  for (let i = 0; i < form.value.assignments.length; i++) {
    const assignment = form.value.assignments[i]
    if (assignment.grade_id) {
      const [sectionsRes, subjectsRes] = await Promise.all([
        api.get('/sections', { params: { grade_id: assignment.grade_id } }),
        api.get('/subjects', { params: { grade_id: assignment.grade_id, stream_id: assignment.stream_id || undefined } })
      ])
      assignment.sections = sectionsRes.data?.data || sectionsRes.data || []
      assignment.subjects = subjectsRes.data?.data || subjectsRes.data || []
    }
  }
}

const addAssignment = () => {
  const defaultYearId = academicYears.value.find(item => item.is_active)?.id || academicYears.value[0]?.id || null
  form.value.assignments.push({ ...newAssignment(), academic_year_id: defaultYearId })
}

const removeAssignment = (index) => {
  form.value.assignments.splice(index, 1)
  if (!form.value.assignments.length) addAssignment()
}

const saveTeacher = async () => {
  if (!editMode.value && userLimitReached.value) {
    ui.showSnackbar('User limit reached for this subscription plan. Please upgrade your plan to add more teachers.', 'warning')
    return
  }

  saving.value = true
  errors.value = {}

  const payload = {
    name: form.value.name,
    email: form.value.email,
    contact: form.value.contact,
    qualification: form.value.qualification,
    designation: form.value.designation,
    is_active: form.value.is_active,
    assignments: form.value.assignments.map(item => ({
      academic_year_id: item.academic_year_id,
      grade_id: item.grade_id,
      section_id: item.section_id || null,
      stream_id: item.stream_id || null,
      subject_id: item.subject_id
    }))
  }

  try {
    if (editMode.value) {
      await api.put(`/teachers/${form.value.id}`, payload)
      ui.showSnackbar('Teacher updated successfully')
    } else {
      const res = await api.post('/teachers', payload)
      ui.showSnackbar(`Teacher created successfully. Default Password: ${res.data.default_password}`, 'success', 7000)
    }

    dialog.value = false
    fetchTeachers()
  } catch (err) {
    if (err.response?.status === 422) {
      errors.value = err.response.data.errors || {}
      ui.showSnackbar(err.response?.data?.message || 'Validation failed', 'error')
    } else {
      ui.showSnackbar(err.response?.data?.message || 'Failed to save teacher', 'error')
    }
  } finally {
    saving.value = false
  }
}

const deleteTeacher = async (teacher) => {
  const ok = await ui.confirmDialog('Delete Teacher', `Are you sure you want to delete ${teacher.name}?`)
  if (!ok) return
  await api.delete(`/teachers/${teacher.id}`)
  ui.showSnackbar('Teacher deleted successfully')
  fetchTeachers()
}

onMounted(async () => {
  await Promise.all([
    fetchSubscriptionStatus(),
    fetchTeachers(),
    fetchGrades(),
    fetchAcademicYears()
  ])
})
</script>

<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">Teachers</h1>
        <p class="text-grey">Manage teacher login, profile, grades, sections and subjects</p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-account-plus" :disabled="userLimitReached" @click="openAdd">
        Add Teacher & Assign Subjects
      </v-btn>
    </div>

    <v-alert v-if="hasUserLimit" :type="userLimitReached ? 'warning' : 'info'" variant="tonal" class="mb-4">
      Used Users: <strong>{{ usedUsers }}</strong> / <strong>{{ maxUsers }}</strong>
      <span v-if="!userLimitReached"> — Remaining: <strong>{{ remainingUsers }}</strong></span>
      <span v-else> — Plan limit reached. Upgrade your plan to add more teachers.</span>
    </v-alert>

    <v-card class="rounded-xl" elevation="0">
      <appDataTable :headers="headers" :items="teachers" :loading="loading">
        <template #item.teacher_assignments="{ item }">
          <div v-if="item.teacher_assignments?.length" class="d-flex flex-wrap ga-1">
            <v-chip v-for="assignment in item.teacher_assignments" :key="assignment.id" size="small" color="primary" variant="tonal">
              {{ assignment.academic_year?.name || 'Year' }} · {{ assignment.grade?.name || 'Grade' }}
              <span v-if="assignment.section?.display_name || assignment.section?.name"> - {{ assignment.section?.display_name || assignment.section?.name }}</span>
              <span v-if="assignment.stream?.name"> - {{ assignment.stream.name }}</span>
              - {{ assignment.subject?.name || 'Subject' }}
            </v-chip>
          </div>
          <span v-else class="text-grey">No assignments</span>
        </template>

        <template #item.is_active="{ item }">
          <v-chip :color="item.is_active ? 'success' : 'error'" variant="tonal" size="small">
            {{ item.is_active ? 'Active' : 'Inactive' }}
          </v-chip>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex ga-1">
            <v-btn icon="mdi-account-card" size="small" variant="text" color="info" :to="{ name: 'teachers.profile', params: { id: item.id } }" />
            <v-btn icon="mdi-pencil" size="small" variant="text" color="primary" @click="openEdit(item)" />
            <v-btn icon="mdi-delete" size="small" variant="text" color="error" @click="deleteTeacher(item)" />
          </div>
        </template>
      </appDataTable>
    </v-card>

    <v-dialog v-model="dialog" max-width="1100" persistent>
      <v-card class="rounded-xl">
        <v-card-title class="d-flex justify-space-between align-center">
          <span>{{ editMode ? 'Edit Teacher' : 'Add Teacher' }}</span>
          <v-btn icon="mdi-close" variant="text" @click="dialog = false" />
        </v-card-title>
        <v-divider />

        <v-card-text>
          <v-alert v-if="!editMode" type="info" variant="tonal" class="mb-4">
            Default password will be generated automatically using first 4 characters of name and first 6 digits of mobile number.
          </v-alert>

          <v-row>
            <v-col cols="12" md="6"><v-text-field v-model="form.name" label="Full Name" :error-messages="errors.name" /></v-col>
            <v-col cols="12" md="6"><v-text-field v-model="form.email" label="Email" :error-messages="errors.email" /></v-col>
            <v-col cols="12" md="6"><v-text-field v-model="form.contact" label="Mobile Number" :error-messages="errors.contact" /></v-col>
            <v-col cols="12" md="6"><v-text-field v-model="form.qualification" label="Qualification" :error-messages="errors.qualification" /></v-col>
            <v-col cols="12" md="6"><v-text-field v-model="form.designation" label="Designation" :error-messages="errors.designation" /></v-col>
            <v-col cols="12" md="6"><v-switch v-model="form.is_active" label="Active Teacher" color="success" /></v-col>
          </v-row>

          <v-divider class="my-4" />

          <div class="d-flex justify-space-between align-center mb-3">
            <div>
              <div class="text-h6">Academic Year, Grade, Section & Subject Assignments</div>
              <div class="text-caption text-grey">Assignments are stored separately for each academic year and section.</div>
            </div>
            <v-btn color="primary" variant="tonal" prepend-icon="mdi-plus" @click="addAssignment">Add Assignment</v-btn>
          </div>

          <v-card v-for="(assignment, index) in form.assignments" :key="index" class="pa-4 mb-3 rounded-lg" variant="outlined">
            <v-row>
              <v-col cols="12" md="3">
                <v-select v-model="assignment.academic_year_id" :items="academicYears" item-title="name" item-value="id" label="Academic Year" :error-messages="errors[`assignments.${index}.academic_year_id`]" />
              </v-col>
              <v-col cols="12" md="3">
                <v-select v-model="assignment.grade_id" :items="grades" item-title="name" item-value="id" label="Grade" :error-messages="errors[`assignments.${index}.grade_id`]" @update:model-value="onGradeChange(index)" />
              </v-col>
              <v-col cols="12" md="2">
                <v-select v-model="assignment.section_id" :items="assignment.sections" item-title="display_name" item-value="id" label="Section" clearable :disabled="!assignment.grade_id" :error-messages="errors[`assignments.${index}.section_id`]" />
              </v-col>
              <v-col cols="12" md="3">
                <v-select v-model="assignment.subject_id" :items="assignment.subjects" item-title="name" item-value="id" label="Subject" :disabled="!assignment.grade_id" :error-messages="errors[`assignments.${index}.subject_id`]" />
              </v-col>
              <v-col cols="12" md="1" class="d-flex align-center">
                <v-btn icon="mdi-delete" color="error" variant="text" @click="removeAssignment(index)" />
              </v-col>
            </v-row>
          </v-card>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="dialog = false">Cancel</v-btn>
          <v-btn color="primary" :loading="saving" :disabled="!editMode && userLimitReached" @click="saveTeacher">
            {{ editMode ? 'Update Teacher' : 'Save Teacher' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
