<script setup>
import { ref, onMounted, computed } from "vue";
import api from "../../plugins/api";
import { useUIStore } from "../../stores/snackBar";
import { formatDate } from "../../utils/date";
import { usePermissionStore } from "../../stores/permission";

const ui = useUIStore();

const portions = ref([]);
const teachers = ref([]);

const dialog = ref(false);
const previewDialog = ref(false);
const rejectDialog = ref(false);

const editMode = ref(false);
const loading = ref(false);
const saving = ref(false);
const rejecting = ref(false);

const errors = ref({});
const selectedAssignment = ref(null);
const selectedPortion = ref(null);
const rejectionReason = ref("");

const permission = usePermissionStore();

const examNames = ref([]);

const fetchExamNames = async () => {
  const res = await api.get("/exam-names");
  examNames.value = (res.data.data || res.data).filter(
    (item) => item.is_active,
  );
};

const statusItems = ["assigned", "submitted", "approved", "rejected"];

const filters = ref({
  status: null,
  teacher_id: null,
});

const headers = [
  { title: "Teacher", key: "teacher" },
  { title: "Grade", key: "grade.name" },
  { title: "Subject", key: "subject.name" },
  { title: "Exam", key: "exam_name.name" },
  { title: "Due Date", key: "due_date" },
  { title: "Status", key: "status" },
  { title: "Actions", key: "actions", sortable: false },
];

const fetchPortions = async () => {
  loading.value = true;

  try {
    const res = await api.get("/exam-portions", {
      params: filters.value,
    });

    portions.value = res.data.data || res.data;
  } finally {
    loading.value = false;
  }
};

const getList = (res) => {
  if (Array.isArray(res.data?.data?.data)) return res.data.data.data
  if (Array.isArray(res.data?.data)) return res.data.data
  if (Array.isArray(res.data)) return res.data
  return []
}

const normalizeTeacher = (teacher) => {
  return {
    ...teacher,
    teacher_name: teacher.name || teacher.email || 'Unknown Teacher',
    assignments: Array.isArray(teacher.teacher_assignments)
      ? teacher.teacher_assignments
      : [],
  }
}

const fetchTeachers = async () => {
  const res = await api.get('/teachers')
  teachers.value = getList(res).map(normalizeTeacher)
}

const getDefaultForm = () => ({
  id: null,
  teacher_id: null,
  grade_id: null,
  subject_id: null,
  exam_name_ids: [],
  due_date: null,
});

const form = ref(getDefaultForm());

const resetForm = () => {
  form.value = getDefaultForm();
  errors.value = {};
  editMode.value = false;
};

const openAdd = () => {
  editMode.value = false;
  errors.value = {};
  selectedAssignment.value = null;

  form.value = {
    id: null,
    teacher_id: null,
    grade_id: null,
    subject_id: null,
    exam_name_ids: [],
    due_date: null,
  };

  dialog.value = true;
};

const openEdit = (portion) => {
  editMode.value = true;
  errors.value = {};

  form.value = {
    id: portion.id,
    teacher_id:
      portion.teacher_id ||
      portion.teacher?.id ||
      portion.teacher?.user?.id ||
      null,
    grade_id: portion.grade?.id,
    subject_id: portion.subject?.id,
    exam_name_ids: [
      portion.exam_name_id || portion.exam_name?.id || portion.examName?.id,
    ].filter(Boolean),
    due_date: portion.due_date,
  };

  selectedAssignment.value = selectedTeacher.value?.assignments?.find(
    (a) =>
      Number(a.grade_id) === Number(form.value.grade_id) &&
      Number(a.subject_id) === Number(form.value.subject_id),
  );

  dialog.value = true;
};

const onTeacherChange = () => {
  selectedAssignment.value = null
  form.value.grade_id = null
  form.value.subject_id = null
}

const selectAssignment = (assignment) => {
  selectedAssignment.value = assignment

  form.value.grade_id = Number(assignment.grade_id)
  form.value.subject_id = Number(assignment.subject_id)
  form.value.stream_id = assignment.stream_id ? Number(assignment.stream_id) : null
}

const savePortion = async () => {
  saving.value = true;
  errors.value = {};

  try {
    if (!form.value.exam_name_ids || form.value.exam_name_ids.length === 0) {
      ui.showSnackbar("Please select Atleast one Exam", "warning");
      return;
    }

    if (!form.value.grade_id || !form.value.subject_id) {
      ui.showSnackbar("Please select assigned grade and subject", "warning");
      return;
    }

    if (editMode.value) {
      await api.put(`/exam-portions/${form.value.id}`, form.value);
      ui.showSnackbar("Exam portion updated successfully");
    } else {
      await api.post("/exam-portions", form.value);
      ui.showSnackbar("Exam portion assigned successfully");
    }

    dialog.value = false;
    fetchPortions();
  } catch (err) {
    if (err.response?.status === 422) {
      errors.value = err.response.data.errors;
      ui.showSnackbar(
        err.response?.data?.message || "Failed to save exam portion",
      );
    } else if (err.response?.status === 500) {
      ui.showSnackbar(
        err.response?.data?.message || "Failed to save exam portion",
        "error",
      );
      selectedTeacher.value = null;
      selectedAssignment.value = null;
      saving.value = false;
      resetForm();
      // dialog.value = false;
      return;
    } else {
      ui.showSnackbar("Failed to save exam portion", "error");
      ui.showSnackbar(
        err.response?.data?.message || "Failed to save exam portion",
      );
    }
  } finally {
    saving.value = false;
  }
};

const openPreview = (portion) => {
  selectedPortion.value = portion;
  previewDialog.value = true;
};

const approvePortion = async (portion) => {
  const ok = await ui.confirmDialog(
    "Approve Syllabus",
    "Are you sure you want to approve this submitted syllabus?",
  );

  if (!ok) return;

  try {
    await api.post(`/exam-portions/${portion.id}/approve`);
    ui.showSnackbar("Syllabus approved successfully");
    previewDialog.value = false;
    fetchPortions();
  } catch (err) {
    ui.showSnackbar("Failed to approve syllabus", "error");
  }
};

const openReject = (portion) => {
  selectedPortion.value = portion;
  rejectionReason.value = "";
  rejectDialog.value = true;
};

const rejectPortion = async () => {
  if (!rejectionReason.value) {
    ui.showSnackbar("Please enter rejection reason", "warning");
    return;
  }

  rejecting.value = true;

  try {
    await api.post(`/exam-portions/${selectedPortion.value.id}/reject`, {
      rejection_reason: rejectionReason.value,
    });

    ui.showSnackbar("Syllabus rejected successfully");
    rejectDialog.value = false;
    previewDialog.value = false;
    fetchPortions();
  } catch (err) {
    ui.showSnackbar("Failed to reject syllabus", "error");
  } finally {
    rejecting.value = false;
  }
};

const deletePortion = async (portion) => {
  const ok = await ui.confirmDialog(
    "Delete Exam Portion",
    "Are you sure you want to delete this exam portion?",
  );

  if (!ok) return;

  await api.delete(`/exam-portions/${portion.id}`);
  ui.showSnackbar("Exam portion deleted successfully");
  fetchPortions();
};

const statusColor = (status) => {
  if (status === "approved") return "success";
  if (status === "rejected") return "error";
  if (status === "submitted") return "info";
  return "warning";
};

const clearFilters = () => {
  filters.value = {
    status: null,
    teacher_id: null,
  };

  fetchPortions();
};

const selectedTeacher = computed(() => {
  return teachers.value.find(
    t => Number(t.id) === Number(form.value.teacher_id)
  )
})

onMounted(() => {
  fetchTeachers();
  fetchExamNames();
  fetchPortions();
});
</script>

<template>
  <div>
    <!-- HEADER -->
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">Exam Portions</h1>

        <p class="text-grey">
          Assign teachers to prepare exam-wise syllabus and review submissions.
        </p>
      </div>

      <v-btn color="primary" prepend-icon="mdi-book-plus" @click="openAdd">
        Assign Portion
      </v-btn>
    </div>

    <!-- FILTERS -->
    <v-card class="pa-4 mb-6 rounded-xl" elevation="0">
      <v-row>
        <v-col cols="12" md="4">
          <v-select v-model="filters.teacher_id" :items="teachers" item-title="teacher_name" item-value="id"
            label="Teacher" clearable variant="outlined" @update:model-value="fetchPortions" />
        </v-col>

        <v-col cols="12" md="4">
          <v-select v-model="filters.status" :items="statusItems" label="Status" clearable variant="outlined"
            @update:model-value="fetchPortions" />
        </v-col>

        <v-col cols="12" md="4" class="d-flex align-center ga-2">
          <v-btn variant="outlined" prepend-icon="mdi-filter-remove" @click="clearFilters">
            Clear
          </v-btn>
        </v-col>
      </v-row>
    </v-card>

    <!-- TABLE -->
    <v-card class="rounded-xl" elevation="0">
      <appDataTable :headers="headers" :items="portions" :loading="loading">
        <template #item.teacher="{ item }">
          <div>
            <div class="font-weight-medium">
              {{
                item.teacher?.name ||
                item.teacher_name ||
                item.teacher?.user?.name ||
                "-"
              }}
            </div>

            <div class="text-caption text-grey">
              {{
                item.teacher?.email ||
                item.teacher_email ||
                item.teacher?.user?.email ||
                ""
              }}
            </div>
          </div>
        </template>

        <template #item.due_date="{ item }">
          {{ formatDate(item.due_date) }}
        </template>

        <template #item.status="{ item }">
          <v-chip size="small" variant="tonal" :color="statusColor(item.status)">
            {{ item.status }}
          </v-chip>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex ga-1">
            <v-btn icon="mdi-eye" size="small" variant="text" color="info" @click="openPreview(item)" />

            <v-btn icon="mdi-pencil" size="small" variant="text" color="primary" :disabled="item.status === 'approved'"
              @click="openEdit(item)" />

            <v-btn v-if="item.status === 'submitted'" icon="mdi-check-circle" size="small" variant="text"
              color="success" @click="approvePortion(item)" />

            <v-btn v-if="item.status === 'submitted'" icon="mdi-close-circle" size="small" variant="text" color="error"
              @click="openReject(item)" />

            <v-btn icon="mdi-delete" size="small" variant="text" color="error" @click="deletePortion(item)" />
          </div>
        </template>
      </appDataTable>
    </v-card>

    <!-- ADD / EDIT DIALOG -->
    <v-dialog v-model="dialog" max-width="760" persistent>
      <v-card class="rounded-xl">
        <v-card-title class="d-flex justify-space-between align-center">
          {{ editMode ? "Edit Exam Portion" : "Assign Exam Portion" }}

          <v-btn icon="mdi-close" variant="text" @click="dialog = false" />
        </v-card-title>

        <v-divider />

        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-autocomplete v-model="form.teacher_id" :items="teachers" item-title="teacher_name" item-value="id"
                label="Teacher" variant="outlined" :error-messages="errors.teacher_id"
                @update:model-value="onTeacherChange" />
            </v-col>

            <v-col cols="12">
              <div v-if="selectedTeacher && selectedTeacher.assignments?.length" class="mb-4">
                <div class="text-subtitle-2 font-weight-bold mb-2">
                  Assigned Grades & Subjects
                </div>

                <div class="d-flex flex-wrap ga-2">
                  <v-chip v-for="assignment in selectedTeacher?.assignments || []" :key="assignment.id" :color="selectedAssignment?.id === assignment.id
                    ? 'primary'
                    : 'default'
                    " :variant="selectedAssignment?.id === assignment.id
                      ? 'flat'
                      : 'tonal'
                      " filter @click="selectAssignment(assignment)">
                    {{ assignment.grade?.name }}

                    <template v-if="assignment.stream?.name">
                      - {{ assignment.stream.name }}
                    </template>

                    - {{ assignment.subject?.name }}
                  </v-chip>
                </div>
              </div>

              <v-alert v-else type="info" variant="tonal">
                Select a teacher to view assigned grades and subjects.
              </v-alert>
            </v-col>

            <v-col cols="12">
              <div class="text-subtitle-2 font-weight-bold mb-2">
                Select Exam Names
              </div>

              <v-chip-group v-model="form.exam_name_ids" multiple column selected-class="bg-primary text-white">
                <v-chip v-for="exam in examNames" :key="exam.id" :value="exam.id" filter variant="tonal">
                  {{ exam.name }}

                  <span v-if="exam.tentative_date" class="ml-1 text-caption">
                    ({{ formatDate(exam.tentative_date) }})
                  </span>
                </v-chip>
              </v-chip-group>

              <div class="mt-2 d-flex ga-2">
                <v-btn size="small" variant="tonal" @click="form.exam_name_ids = examNames.map((e) => e.id)">
                  Select All
                </v-btn>

                <v-btn size="small" variant="text" @click="form.exam_name_ids = []">
                  Clear
                </v-btn>
              </div>

              <div v-if="errors.exam_name_ids" class="text-error text-caption mt-1">
                {{ errors.exam_name_ids[0] }}
              </div>
            </v-col>

            <v-col cols="12" md="12">
              <v-text-field v-model="form.due_date" type="date" label="Due Date" variant="outlined"
                :error-messages="errors.due_date" />
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />

          <v-btn variant="text" @click="dialog = false"> Cancel </v-btn>

          <v-btn color="primary" :loading="saving" @click="savePortion">
            {{ editMode ? "Update Portion" : "Assign Portion" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- PREVIEW DIALOG -->
    <v-dialog v-model="previewDialog" max-width="900">
      <v-card class="rounded-xl">
        <v-card-title class="d-flex justify-space-between align-center">
          Exam Portion Details

          <v-btn icon="mdi-close" variant="text" @click="previewDialog = false" />
        </v-card-title>

        <v-divider />

        <v-card-text v-if="selectedPortion">
          <div class="d-flex flex-wrap ga-2 mb-4">
            <v-chip color="primary" variant="tonal">
              {{
                selectedPortion.exam_name?.name ||
                selectedPortion.examName?.name ||
                "-"
              }}

              <span v-if="
                selectedPortion.exam_name?.tentative_date ||
                selectedPortion.examName?.tentative_date
              " class="ml-1 text-caption">
                ({{
                  formatDate(
                    selectedPortion.exam_name?.tentative_date ||
                    selectedPortion.examName?.tentative_date,
                  )
                }})
              </span>
            </v-chip>

            <v-chip variant="tonal">
              {{ selectedPortion.grade?.name }}
            </v-chip>

            <v-chip variant="tonal">
              {{ selectedPortion.subject?.name }}
            </v-chip>

            <v-chip :color="statusColor(selectedPortion.status)" variant="tonal">
              {{ selectedPortion.status }}
            </v-chip>
          </div>

          <v-alert v-if="selectedPortion.rejection_reason" type="error" variant="tonal" class="mb-4">
            {{ selectedPortion.rejection_reason }}
          </v-alert>

          <div class="text-h6 font-weight-bold mb-3">Submitted Syllabus</div>

          <v-table v-if="selectedPortion.lessons?.length" density="comfortable">
            <thead>
              <tr>
                <th>Lesson</th>
                <th>Topics</th>
                <th>Learning Objectives</th>
                <th>Remarks</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="item in selectedPortion.lessons" :key="item.id">
                <td>{{ item.lesson?.title || "-" }}</td>
                <td>{{ item.topics || "-" }}</td>
                <td>{{ item.learning_objectives || "-" }}</td>
                <td>{{ item.remarks || "-" }}</td>
              </tr>
            </tbody>
          </v-table>

          <v-alert v-else type="info" variant="tonal">
            Teacher has not submitted syllabus yet.
          </v-alert>
        </v-card-text>

        <v-card-actions v-if="selectedPortion?.status === 'submitted'">
          <v-spacer />

          <v-btn color="success" @click="approvePortion(selectedPortion)">
            Approve
          </v-btn>

          <v-btn color="error" variant="tonal" @click="openReject(selectedPortion)">
            Reject
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- REJECT DIALOG -->
    <v-dialog v-model="rejectDialog" max-width="520">
      <v-card class="rounded-xl">
        <v-card-title> Reject Syllabus </v-card-title>

        <v-card-text>
          <v-textarea v-model="rejectionReason" label="Rejection Reason" rows="4" auto-grow variant="outlined" />
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn variant="text" @click="rejectDialog = false"> Cancel </v-btn>

          <v-btn color="error" :loading="rejecting" @click="rejectPortion">
            Reject
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
