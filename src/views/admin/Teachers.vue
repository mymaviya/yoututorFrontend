<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import api from '../../plugins/api'
import { useUIStore } from '../../stores/snackBar'
import { useAppStore } from '../../stores/app'

const ui = useUIStore()
const appStore = useAppStore()

const teachers = ref([])
const grades = ref([])
const search = ref('')
const statusFilter = ref('all')
const dialog = ref(false)
const editMode = ref(false)
const loading = ref(false)
const saving = ref(false)
const errors = ref({})
const subscriptionStatus = ref(null)

const selectedAcademicYearId = computed(() => appStore.selectedAcademicYearId)
const selectedAcademicYear = computed(() => appStore.selectedAcademicYear)

const usedUsers = computed(() => Number(subscriptionStatus.value?.used_users ?? 0))
const maxUsers = computed(() => Number(subscriptionStatus.value?.max_users ?? 0))
const remainingUsers = computed(() => Number(subscriptionStatus.value?.remaining_users ?? 0))
const canCreateUsers = computed(() => Boolean(subscriptionStatus.value?.can_create_users ?? true))
const hasUserLimit = computed(() => maxUsers.value > 0)
const userLimitReached = computed(() => hasUserLimit.value && !canCreateUsers.value)

const teacherAssignments = teacher => {
  const assignments = teacher.teacher_assignments || []
  if (!selectedAcademicYearId.value) return assignments
  return assignments.filter(item => Number(item.academic_year_id) === Number(selectedAcademicYearId.value))
}

const filteredTeachers = computed(() => {
  const needle = search.value.trim().toLowerCase()

  return teachers.value.filter(teacher => {
    if (statusFilter.value === 'active' && !teacher.is_active) return false
    if (statusFilter.value === 'inactive' && teacher.is_active) return false
    if (!needle) return true

    const assignmentText = teacherAssignments(teacher)
      .map(item => [
        item.grade?.name,
        item.section?.display_name || item.section?.name,
        item.stream?.name,
        item.subject?.name,
      ].filter(Boolean).join(' '))
      .join(' ')

    return [teacher.name, teacher.email, teacher.contact, teacher.designation, assignmentText]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(needle)
  })
})

const totalTeachers = computed(() => filteredTeachers.value.length)
const activeTeachers = computed(() => filteredTeachers.value.filter(item => item.is_active).length)
const inactiveTeachers = computed(() => filteredTeachers.value.filter(item => !item.is_active).length)
const totalAssignments = computed(() =>
  filteredTeachers.value.reduce((total, teacher) => total + teacherAssignments(teacher).length, 0)
)

const headers = [
  { title: 'Teacher', key: 'teacher', minWidth: 280 },
  { title: 'Academic Assignments', key: 'teacher_assignments', minWidth: 360 },
  { title: 'Status', key: 'is_active', width: 120 },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end', width: 150 },
]

const newAssignment = () => ({
  academic_year_id: selectedAcademicYearId.value,
  grade_id: null,
  section_id: null,
  stream_id: null,
  subject_id: null,
  sections: [],
  subjects: [],
})

const form = ref({
  id: null,
  name: '',
  email: '',
  contact: '',
  qualification: '',
  designation: '',
  is_active: true,
  assignments: [newAssignment()],
})

const initials = name => {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean)
  return parts.slice(0, 2).map(part => part.charAt(0).toUpperCase()).join('') || 'T'
}

const profileUrl = teacher => teacher?.profile || teacher?.profile_url || teacher?.avatar || null

const fetchSubscriptionStatus = async () => {
  try {
    const res = await api.get('/my-subscription-status')
    subscriptionStatus.value = res.data?.data || res.data
  } catch (error) {
    console.error(error)
    subscriptionStatus.value = null
  }
}

const fetchTeachers = async () => {
  loading.value = true
  try {
    const res = await api.get('/teachers')
    teachers.value = res.data?.data || res.data || []
  } finally {
    loading.value = false
  }
}

const fetchGrades = async () => {
  const res = await api.get('/grades')
  grades.value = res.data?.data || res.data || []
}

const fetchSectionsByGrade = async index => {
  const assignment = form.value.assignments[index]
  assignment.section_id = null
  assignment.sections = []

  if (!assignment.grade_id) return

  const res = await api.get('/sections', { params: { grade_id: assignment.grade_id } })
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
      stream_id: assignment.stream_id || undefined,
    },
  })

  assignment.subjects = res.data?.data || res.data || []
}

const onGradeChange = async index => {
  await Promise.all([
    fetchSectionsByGrade(index),
    fetchSubjectsByGrade(index),
  ])
}

const openAdd = () => {
  if (!selectedAcademicYearId.value) {
    ui.showSnackbar('Please select an academic session from the app bar first.', 'warning')
    return
  }

  if (userLimitReached.value) {
    ui.showSnackbar('User limit reached for this subscription plan. Please upgrade your plan to add more teachers.', 'warning')
    return
  }

  editMode.value = false
  errors.value = {}
  form.value = {
    id: null,
    name: '',
    email: '',
    contact: '',
    qualification: '',
    designation: '',
    is_active: true,
    assignments: [newAssignment()],
  }
  dialog.value = true
}

const openEdit = async teacher => {
  if (!selectedAcademicYearId.value) {
    ui.showSnackbar('Please select an academic session from the app bar first.', 'warning')
    return
  }

  editMode.value = true
  errors.value = {}
  const assignmentsForSession = teacherAssignments(teacher)

  form.value = {
    id: teacher.id,
    name: teacher.name || '',
    email: teacher.email || '',
    contact: teacher.contact || '',
    qualification: teacher.qualification || '',
    designation: teacher.designation || '',
    is_active: Boolean(teacher.is_active),
    assignments: assignmentsForSession.length
      ? assignmentsForSession.map(item => ({
        academic_year_id: selectedAcademicYearId.value,
        grade_id: item.grade_id,
        section_id: item.section_id,
        stream_id: item.stream_id,
        subject_id: item.subject_id,
        sections: [],
        subjects: [],
      }))
      : [newAssignment()],
  }

  dialog.value = true

  for (let i = 0; i < form.value.assignments.length; i++) {
    const assignment = form.value.assignments[i]
    if (!assignment.grade_id) continue

    const [sectionsRes, subjectsRes] = await Promise.all([
      api.get('/sections', { params: { grade_id: assignment.grade_id } }),
      api.get('/subjects', { params: { grade_id: assignment.grade_id, stream_id: assignment.stream_id || undefined } }),
    ])

    assignment.sections = sectionsRes.data?.data || sectionsRes.data || []
    assignment.subjects = subjectsRes.data?.data || subjectsRes.data || []
  }
}

const addAssignment = () => form.value.assignments.push(newAssignment())

const removeAssignment = index => {
  form.value.assignments.splice(index, 1)
  if (!form.value.assignments.length) addAssignment()
}

const saveTeacher = async () => {
  if (!selectedAcademicYearId.value) {
    ui.showSnackbar('Please select an academic session from the app bar first.', 'warning')
    return
  }

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
      academic_year_id: selectedAcademicYearId.value,
      grade_id: item.grade_id,
      section_id: item.section_id || null,
      stream_id: item.stream_id || null,
      subject_id: item.subject_id,
    })),
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
    await fetchTeachers()
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

const deleteTeacher = async teacher => {
  const ok = await ui.confirmDialog('Delete Teacher', `Are you sure you want to delete ${teacher.name}?`)
  if (!ok) return
  await api.delete(`/teachers/${teacher.id}`)
  ui.showSnackbar('Teacher deleted successfully')
  await fetchTeachers()
}

watch(selectedAcademicYearId, () => {
  search.value = ''
  if (dialog.value) dialog.value = false
})

watch(() => appStore.refreshKey, fetchTeachers)

onMounted(async () => {
  await Promise.all([
    fetchSubscriptionStatus(),
    fetchTeachers(),
    fetchGrades(),
  ])
})
</script>

<template>
  <div class="teacher-page">
    <v-card class="hero-card mb-6" rounded="xl" elevation="0">
      <v-card-text class="pa-6 pa-md-8">
        <div class="d-flex flex-wrap align-center justify-space-between ga-4">
          <div class="d-flex align-center ga-4">
            <v-avatar color="primary" variant="tonal" size="58">
              <v-icon size="32">mdi-account-school</v-icon>
            </v-avatar>
            <div>
              <h1 class="text-h4 font-weight-bold mb-1">Teacher Management</h1>
              <div class="text-body-2 text-medium-emphasis">
                Manage teacher profiles and subject allocations for {{ selectedAcademicYear?.name || 'the selected session' }}.
              </div>
            </div>
          </div>

          <v-btn
            color="primary"
            size="large"
            prepend-icon="mdi-account-plus"
            :disabled="userLimitReached || !selectedAcademicYearId"
            @click="openAdd"
          >
            Add Teacher
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <v-card rounded="xl" elevation="0" border class="mb-5 filter-card">
      <v-card-text class="pa-4 pa-md-5">
        <v-row align="center">
          <v-col cols="12" md="8">
            <v-text-field
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              label="Search teacher, email, contact or subject"
              variant="outlined"
              density="comfortable"
              clearable
              hide-details
            />
          </v-col>

          <v-col cols="12" md="4">
            <v-btn-toggle v-model="statusFilter" mandatory divided color="primary" class="w-100">
              <v-btn value="all" class="flex-grow-1">All</v-btn>
              <v-btn value="active" class="flex-grow-1">Active</v-btn>
              <v-btn value="inactive" class="flex-grow-1">Inactive</v-btn>
            </v-btn-toggle>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-alert v-if="hasUserLimit" :type="userLimitReached ? 'warning' : 'info'" variant="tonal" class="mb-5" rounded="lg">
      Used Users: <strong>{{ usedUsers }}</strong> / <strong>{{ maxUsers }}</strong>
      <span v-if="!userLimitReached"> — Remaining: <strong>{{ remainingUsers }}</strong></span>
      <span v-else> — Plan limit reached. Upgrade your plan to add more teachers.</span>
    </v-alert>

    <v-row class="mb-2">
      <v-col cols="6" md="3">
        <v-card rounded="xl" border elevation="0"><v-card-text class="d-flex align-center ga-3"><v-avatar color="primary" variant="tonal"><v-icon>mdi-account-group</v-icon></v-avatar><div><div class="text-h5 font-weight-bold">{{ totalTeachers }}</div><div class="text-caption text-medium-emphasis">Teachers</div></div></v-card-text></v-card>
      </v-col>
      <v-col cols="6" md="3">
        <v-card rounded="xl" border elevation="0"><v-card-text class="d-flex align-center ga-3"><v-avatar color="success" variant="tonal"><v-icon>mdi-account-check</v-icon></v-avatar><div><div class="text-h5 font-weight-bold">{{ activeTeachers }}</div><div class="text-caption text-medium-emphasis">Active</div></div></v-card-text></v-card>
      </v-col>
      <v-col cols="6" md="3">
        <v-card rounded="xl" border elevation="0"><v-card-text class="d-flex align-center ga-3"><v-avatar color="error" variant="tonal"><v-icon>mdi-account-off</v-icon></v-avatar><div><div class="text-h5 font-weight-bold">{{ inactiveTeachers }}</div><div class="text-caption text-medium-emphasis">Inactive</div></div></v-card-text></v-card>
      </v-col>
      <v-col cols="6" md="3">
        <v-card rounded="xl" border elevation="0"><v-card-text class="d-flex align-center ga-3"><v-avatar color="deep-purple" variant="tonal"><v-icon>mdi-book-account</v-icon></v-avatar><div><div class="text-h5 font-weight-bold">{{ totalAssignments }}</div><div class="text-caption text-medium-emphasis">Assignments</div></div></v-card-text></v-card>
      </v-col>
    </v-row>

    <v-card class="rounded-xl" elevation="0" border>
      <v-card-title class="pa-5 d-flex flex-wrap align-center justify-space-between ga-2">
        <div>
          <div class="font-weight-bold">Teacher Directory</div>
          <div class="text-caption text-medium-emphasis">{{ selectedAcademicYear?.name || 'No session selected' }}</div>
        </div>
        <v-chip color="primary" variant="tonal">{{ filteredTeachers.length }} records</v-chip>
      </v-card-title>
      <v-divider />

      <appDataTable :headers="headers" :items="filteredTeachers" :loading="loading">
        <template #item.teacher="{ item }">
          <div class="d-flex align-center ga-3 py-2">
            <v-avatar size="48" color="primary" variant="tonal">
              <v-img v-if="profileUrl(item)" :src="profileUrl(item)" cover />
              <span v-else class="font-weight-bold">{{ initials(item.name) }}</span>
            </v-avatar>
            <div class="min-width-0">
              <div class="font-weight-bold text-body-1 text-truncate">{{ item.name }}</div>
              <div class="text-caption text-medium-emphasis d-flex align-center ga-1 text-truncate">
                <v-icon size="14">mdi-email-outline</v-icon>{{ item.email || 'No email' }}
              </div>
              <div class="text-caption text-medium-emphasis d-flex align-center ga-1 text-truncate">
                <v-icon size="14">mdi-phone-outline</v-icon>{{ item.contact || 'No contact' }}
              </div>
            </div>
          </div>
        </template>

        <template #item.teacher_assignments="{ item }">
          <div v-if="teacherAssignments(item).length" class="d-flex flex-wrap ga-2 py-2">
            <v-chip
              v-for="assignment in teacherAssignments(item)"
              :key="assignment.id"
              color="primary"
              variant="tonal"
              size="small"
              prepend-icon="mdi-book-open-variant"
            >
              {{ assignment.grade?.name || 'Grade' }}
              <span v-if="assignment.section?.display_name || assignment.section?.name">-{{ assignment.section?.display_name || assignment.section?.name }}</span>
              <span v-if="assignment.stream?.name"> · {{ assignment.stream.name }}</span>
              · {{ assignment.subject?.name || 'Subject' }}
            </v-chip>
          </div>
          <div v-else class="text-caption text-medium-emphasis py-2">No assignments in this session</div>
        </template>

        <template #item.is_active="{ item }">
          <v-chip :color="item.is_active ? 'success' : 'error'" variant="tonal" size="small" :prepend-icon="item.is_active ? 'mdi-check-circle' : 'mdi-close-circle'">
            {{ item.is_active ? 'Active' : 'Inactive' }}
          </v-chip>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex justify-end ga-1">
            <v-tooltip text="View profile"><template #activator="{ props }"><v-btn v-bind="props" icon="mdi-account-card" size="small" variant="text" color="info" :to="{ name: 'teachers.profile', params: { id: item.id } }" /></template></v-tooltip>
            <v-tooltip text="Edit teacher"><template #activator="{ props }"><v-btn v-bind="props" icon="mdi-pencil" size="small" variant="text" color="primary" @click="openEdit(item)" /></template></v-tooltip>
            <v-tooltip text="Delete teacher"><template #activator="{ props }"><v-btn v-bind="props" icon="mdi-delete" size="small" variant="text" color="error" @click="deleteTeacher(item)" /></template></v-tooltip>
          </div>
        </template>
      </appDataTable>
    </v-card>

    <v-dialog v-model="dialog" max-width="1040" persistent>
      <v-card rounded="xl">
        <v-card-title class="pa-5 d-flex align-center justify-space-between">
          <div class="d-flex align-center ga-3">
            <v-avatar color="primary" variant="tonal"><v-icon>{{ editMode ? 'mdi-account-edit' : 'mdi-account-plus' }}</v-icon></v-avatar>
            <div>
              <div class="font-weight-bold">{{ editMode ? 'Edit Teacher' : 'Add Teacher' }}</div>
              <div class="text-caption text-medium-emphasis">Assignments will be saved for {{ selectedAcademicYear?.name || 'the selected session' }}.</div>
            </div>
          </div>
          <v-btn icon="mdi-close" variant="text" @click="dialog = false" />
        </v-card-title>
        <v-divider />

        <v-card-text class="pa-5">
          <v-alert v-if="!editMode" type="info" variant="tonal" class="mb-5" rounded="lg">
            The default password will be generated automatically from the teacher's name and mobile number.
          </v-alert>

          <div class="section-label">Teacher Profile</div>
          <v-row>
            <v-col cols="12" md="6"><v-text-field v-model="form.name" label="Full Name" variant="outlined" prepend-inner-icon="mdi-account-outline" :error-messages="errors.name" /></v-col>
            <v-col cols="12" md="6"><v-text-field v-model="form.email" label="Email Address" variant="outlined" prepend-inner-icon="mdi-email-outline" :error-messages="errors.email" /></v-col>
            <v-col cols="12" md="6"><v-text-field v-model="form.contact" label="Mobile Number" variant="outlined" prepend-inner-icon="mdi-phone-outline" :error-messages="errors.contact" /></v-col>
            <v-col cols="12" md="6"><v-text-field v-model="form.qualification" label="Qualification" variant="outlined" prepend-inner-icon="mdi-school-outline" :error-messages="errors.qualification" /></v-col>
            <v-col cols="12" md="6"><v-text-field v-model="form.designation" label="Designation" variant="outlined" prepend-inner-icon="mdi-briefcase-outline" :error-messages="errors.designation" /></v-col>
            <v-col cols="12" md="6"><v-switch v-model="form.is_active" label="Active Teacher" color="success" inset /></v-col>
          </v-row>

          <v-divider class="my-5" />

          <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-4">
            <div>
              <div class="section-label mb-1">Subject Assignments</div>
              <div class="text-caption text-medium-emphasis">Session: {{ selectedAcademicYear?.name || 'Not selected' }}</div>
            </div>
            <v-btn color="primary" variant="tonal" prepend-icon="mdi-plus" @click="addAssignment">Add Assignment</v-btn>
          </div>

          <v-card
            v-for="(assignment, index) in form.assignments"
            :key="index"
            class="assignment-card mb-3"
            rounded="lg"
            variant="outlined"
          >
            <v-card-text class="pa-4">
              <div class="d-flex align-center justify-space-between mb-3">
                <div class="d-flex align-center ga-2"><v-avatar size="30" color="primary" variant="tonal"><span class="text-caption font-weight-bold">{{ index + 1 }}</span></v-avatar><strong>Assignment {{ index + 1 }}</strong></div>
                <v-btn icon="mdi-delete-outline" color="error" variant="text" size="small" @click="removeAssignment(index)" />
              </div>
              <v-row>
                <v-col cols="12" md="4"><v-select v-model="assignment.grade_id" :items="grades" item-title="name" item-value="id" label="Grade" variant="outlined" density="comfortable" :error-messages="errors[`assignments.${index}.grade_id`]" @update:model-value="onGradeChange(index)" /></v-col>
                <v-col cols="12" md="4"><v-select v-model="assignment.section_id" :items="assignment.sections" item-title="display_name" item-value="id" label="Section" variant="outlined" density="comfortable" clearable :disabled="!assignment.grade_id" :error-messages="errors[`assignments.${index}.section_id`]" /></v-col>
                <v-col cols="12" md="4"><v-select v-model="assignment.subject_id" :items="assignment.subjects" item-title="name" item-value="id" label="Subject" variant="outlined" density="comfortable" :disabled="!assignment.grade_id" :error-messages="errors[`assignments.${index}.subject_id`]" /></v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-card-text>

        <v-divider />
        <v-card-actions class="pa-5">
          <v-spacer />
          <v-btn variant="text" @click="dialog = false">Cancel</v-btn>
          <v-btn color="primary" prepend-icon="mdi-content-save" :loading="saving" :disabled="!selectedAcademicYearId || (!editMode && userLimitReached)" @click="saveTeacher">
            {{ editMode ? 'Update Teacher' : 'Save Teacher' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.teacher-page { padding-bottom: 24px; }
.hero-card { background: linear-gradient(135deg, rgba(var(--v-theme-primary), .12), rgba(103, 58, 183, .08)); border: 1px solid rgba(var(--v-theme-primary), .12); }
.filter-card { background: rgba(var(--v-theme-surface), .98); }
.section-label { font-size: .74rem; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; color: rgb(var(--v-theme-primary)); }
.assignment-card { background: rgba(var(--v-theme-primary), .025); }
.min-width-0 { min-width: 0; }
:deep(.v-btn-toggle) { display: flex; }
</style>