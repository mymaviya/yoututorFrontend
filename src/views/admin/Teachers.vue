<script setup>
import { ref, onMounted } from 'vue'
import api from '../../plugins/api'
import { useUIStore } from '../../stores/snackBar'

const ui = useUIStore()

const teachers = ref([])
const grades = ref([])

const dialog = ref(false)
const editMode = ref(false)
const loading = ref(false)
const saving = ref(false)
const errors = ref({})

const form = ref({
  id: null,
  name: '',
  email: '',
  contact: '',
  qualification: '',
  designation: '',
  is_active: true,
  assignments: [
    {
      grade_id: null,
      subject_id: null,
      subjects: []
    }
  ]
})

const headers = [
  { title: 'Name', key: 'user.name' },
  { title: 'Email', key: 'user.email' },
  { title: 'Contact', key: 'contact' },
  { title: 'Designation', key: 'designation' },
  { title: 'Assignments', key: 'assignments' },
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

const fetchSubjectsByGrade = async (index) => {
  const gradeId = form.value.assignments[index].grade_id

  form.value.assignments[index].subject_id = null
  form.value.assignments[index].subjects = []

  if (!gradeId) return

  const res = await api.get('/subjects', {
    params: {
      grade_id: gradeId
    }
  })

  form.value.assignments[index].subjects = res.data.data || res.data
}

const openAdd = () => {
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
    assignments: [
      {
        grade_id: null,
        subject_id: null,
        subjects: []
      }
    ]
  }

  dialog.value = true
}

const openEdit = async (teacher) => {
  editMode.value = true
  errors.value = {}

  form.value = {
    id: teacher.id,
    name: teacher.user?.name || '',
    email: teacher.user?.email || '',
    contact: teacher.contact || '',
    qualification: teacher.qualification || '',
    designation: teacher.designation || '',
    is_active: Boolean(teacher.is_active),

    assignments: teacher.assignments?.length
      ? teacher.assignments.map(item => ({
          grade_id: item.grade_id,
          subject_id: item.subject_id,
          subjects: []
        }))
      : [
          {
            grade_id: null,
            subject_id: null,
            subjects: []
          }
        ]
  }

  dialog.value = true

  for (let i = 0; i < form.value.assignments.length; i++) {
    if (form.value.assignments[i].grade_id) {
      const res = await api.get('/subjects', {
        params: {
          grade_id: form.value.assignments[i].grade_id
        }
      })

      form.value.assignments[i].subjects = res.data.data || res.data
    }
  }
}

const addAssignment = () => {
  form.value.assignments.push({
    grade_id: null,
    subject_id: null,
    subjects: []
  })
}

const removeAssignment = (index) => {
  form.value.assignments.splice(index, 1)

  if (!form.value.assignments.length) {
    addAssignment()
  }
}

const saveTeacher = async () => {
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
      grade_id: item.grade_id,
      subject_id: item.subject_id
    }))
  }

  try {
    if (editMode.value) {
      await api.put(`/teachers/${form.value.id}`, payload)
      ui.showSnackbar('Teacher updated successfully')
    } else {
      const res = await api.post('/teachers', payload)

      ui.showSnackbar(
        `Teacher created successfully. Default Password: ${res.data.default_password}`,
        'success',
        7000
      )
    }

    dialog.value = false
    fetchTeachers()
  } catch (err) {
    if (err.response?.status === 422) {
      errors.value = err.response.data.errors
    } else {
      ui.showSnackbar('Failed to save teacher', 'error')
    }
  } finally {
    saving.value = false
  }
}

const deleteTeacher = async (teacher) => {
  const ok = await ui.confirmDialog(
    'Delete Teacher',
    `Are you sure you want to delete ${teacher.user?.name}?`
  )

  if (!ok) return

  await api.delete(`/teachers/${teacher.id}`)

  ui.showSnackbar('Teacher deleted successfully')

  fetchTeachers()
}

onMounted(() => {
  fetchTeachers()
  fetchGrades()
})
</script>

<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">
          Teachers
        </h1>

        <p class="text-grey">
          Manage teacher login, profile, grades and subjects
        </p>
      </div>

      <v-btn
        color="primary"
        prepend-icon="mdi-account-plus"
        @click="openAdd"
      >
        Add Teacher
      </v-btn>
    </div>

    <v-card class="rounded-xl" elevation="0">
      <v-data-table
        :headers="headers"
        :items="teachers"
        :loading="loading"
      >
        <template #item.assignments="{ item }">
          <div
            v-if="item.assignments?.length"
            class="d-flex flex-wrap ga-1"
          >
            <v-chip
              v-for="assignment in item.assignments"
              :key="`${assignment.grade_id}-${assignment.subject_id}`"
              size="small"
              color="primary"
              variant="tonal"
            >
              {{ assignment.grade?.name || 'Grade' }}
              -
              {{ assignment.subject?.name || 'Subject' }}
            </v-chip>
          </div>

          <span v-else class="text-grey">
            No assignments
          </span>
        </template>

        <template #item.is_active="{ item }">
          <v-chip
            :color="item.is_active ? 'success' : 'error'"
            variant="tonal"
            size="small"
          >
            {{ item.is_active ? 'Active' : 'Inactive' }}
          </v-chip>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex ga-1">
            <v-btn
              icon="mdi-pencil"
              size="small"
              variant="text"
              color="primary"
              @click="openEdit(item)"
            />

            <v-btn
              icon="mdi-delete"
              size="small"
              variant="text"
              color="error"
              @click="deleteTeacher(item)"
            />
          </div>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog
      v-model="dialog"
      max-width="900"
      persistent
    >
      <v-card class="rounded-xl">
        <v-card-title class="d-flex justify-space-between align-center">
          <span>
            {{ editMode ? 'Edit Teacher' : 'Add Teacher' }}
          </span>

          <v-btn
            icon="mdi-close"
            variant="text"
            @click="dialog = false"
          />
        </v-card-title>

        <v-divider />

        <v-card-text>
          <v-alert
            v-if="!editMode"
            type="info"
            variant="tonal"
            class="mb-4"
          >
            Default password will be generated automatically using first 4 characters of name and first 6 digits of mobile number.
          </v-alert>

          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.name"
                label="Full Name"
                :error-messages="errors.name"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.email"
                label="Email"
                :error-messages="errors.email"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.contact"
                label="Mobile Number"
                :error-messages="errors.contact"
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
                v-model="form.designation"
                label="Designation"
                :error-messages="errors.designation"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-switch
                v-model="form.is_active"
                label="Active Teacher"
                color="success"
              />
            </v-col>
          </v-row>

          <v-divider class="my-4" />

          <div class="d-flex justify-space-between align-center mb-3">
            <div>
              <div class="text-h6">
                Grade & Subject Assignments
              </div>

              <div class="text-caption text-grey">
                Same grade and subject can be assigned to many teachers.
              </div>
            </div>

            <v-btn
              color="primary"
              variant="tonal"
              prepend-icon="mdi-plus"
              @click="addAssignment"
            >
              Add Assignment
            </v-btn>
          </div>

          <v-card
            v-for="(assignment, index) in form.assignments"
            :key="index"
            class="pa-4 mb-3 rounded-lg"
            variant="outlined"
          >
            <v-row>
              <v-col cols="12" md="5">
                <v-select
                  v-model="assignment.grade_id"
                  :items="grades"
                  item-title="name"
                  item-value="id"
                  label="Grade"
                  :error-messages="errors[`assignments.${index}.grade_id`]"
                  @update:model-value="fetchSubjectsByGrade(index)"
                />
              </v-col>

              <v-col cols="12" md="5">
                <v-select
                  v-model="assignment.subject_id"
                  :items="assignment.subjects"
                  item-title="name"
                  item-value="id"
                  label="Subject"
                  :disabled="!assignment.grade_id"
                  :error-messages="errors[`assignments.${index}.subject_id`]"
                />
              </v-col>

              <v-col
                cols="12"
                md="2"
                class="d-flex align-center"
              >
                <v-btn
                  icon="mdi-delete"
                  color="error"
                  variant="text"
                  @click="removeAssignment(index)"
                />
              </v-col>
            </v-row>
          </v-card>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />

          <v-btn
            variant="text"
            @click="dialog = false"
          >
            Cancel
          </v-btn>

          <v-btn
            color="primary"
            :loading="saving"
            @click="saveTeacher"
          >
            {{ editMode ? 'Update Teacher' : 'Save Teacher' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>