<template>
  <v-container fluid class="dashboard-page pa-4">
    <!-- HEADER -->
    <v-card class="hero-card pa-6 mb-6 rounded-xl" elevation="0">
      <div class="d-flex flex-wrap justify-space-between align-center ga-4">
        <div>
          <div class="text-h4 font-weight-bold">
            Admin Dashboard
          </div>
          <div class="text-body-2 text-grey mt-1">
            Complete overview of Question Bank, Papers, Teachers and Exam Portions
          </div>
        </div>

        <div class="d-flex ga-2">
          <v-btn
            color="primary"
            prepend-icon="mdi-plus"
            :to="{ name: 'questions.create' }"
          >
            Add Question
          </v-btn>

          <v-btn
            color="secondary"
            variant="tonal"
            prepend-icon="mdi-file-plus"
            :to="{ name: 'papers.creator' }"
          >
            Create Paper
          </v-btn>
        </div>
      </div>
    </v-card>

    <!-- MAIN STATS -->
    <v-row>
      <v-col
        v-for="card in statCards"
        :key="card.title"
        cols="12"
        sm="6"
        md="3"
      >
        <v-card class="stat-card pa-4 rounded-xl" elevation="0">
          <div class="d-flex justify-space-between align-start">
            <div>
              <div class="text-caption text-grey">
                {{ card.title }}
              </div>

              <div class="text-h4 font-weight-bold mt-2">
                {{ card.value }}
              </div>

              <div class="text-caption mt-1" :class="card.textColor">
                {{ card.subtitle }}
              </div>
            </div>

            <v-avatar :color="card.color" variant="tonal" size="48">
              <v-icon size="26">
                {{ card.icon }}
              </v-icon>
            </v-avatar>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- QUESTION + PAPER SUMMARY -->
    <v-row class="mt-2">
      <v-col cols="12" md="8">
        <v-card class="pa-5 rounded-xl h-100" elevation="0">
          <div class="d-flex justify-space-between align-center mb-4">
            <div>
              <div class="text-h6 font-weight-bold">
                Question Bank Health
              </div>
              <div class="text-caption text-grey">
                Approval and content readiness overview
              </div>
            </div>

            <v-btn
              size="small"
              color="primary"
              variant="tonal"
              :to="{ name: 'question.approvals' }"
            >
              Review Pending
            </v-btn>
          </div>

          <v-row>
            <v-col cols="12" sm="4">
              <div class="mini-box success-box">
                <div class="text-caption">Approved</div>
                <strong>{{ dashboard.stats?.approved_questions || 0 }}</strong>
              </div>
            </v-col>

            <v-col cols="12" sm="4">
              <div class="mini-box warning-box">
                <div class="text-caption">Pending</div>
                <strong>{{ dashboard.stats?.pending_questions || 0 }}</strong>
              </div>
            </v-col>

            <v-col cols="12" sm="4">
              <div class="mini-box error-box">
                <div class="text-caption">Rejected</div>
                <strong>{{ dashboard.stats?.rejected_questions || 0 }}</strong>
              </div>
            </v-col>
          </v-row>

          <v-progress-linear
            class="mt-5 rounded-pill"
            height="12"
            color="success"
            :model-value="approvalPercentage"
          />

          <div class="text-caption text-grey mt-2">
            {{ approvalPercentage }}% questions are approved and ready for paper generation.
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="pa-5 rounded-xl h-100" elevation="0">
          <div class="text-h6 font-weight-bold mb-1">
            Paper Summary
          </div>
          <div class="text-caption text-grey mb-4">
            Question paper publishing status
          </div>

          <div class="paper-count-row">
            <span>Total Papers</span>
            <strong>{{ dashboard.stats?.question_papers || 0 }}</strong>
          </div>

          <div class="paper-count-row">
            <span>Published</span>
            <v-chip color="success" variant="tonal" size="small">
              {{ dashboard.stats?.published_papers || 0 }}
            </v-chip>
          </div>

          <div class="paper-count-row">
            <span>Draft</span>
            <v-chip color="warning" variant="tonal" size="small">
              {{ dashboard.stats?.draft_papers || 0 }}
            </v-chip>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- EXAM PORTION SUMMARY -->
    <v-card class="pa-5 rounded-xl mt-6" elevation="0">
      <div class="d-flex flex-wrap justify-space-between align-center mb-4">
        <div>
          <div class="text-h6 font-weight-bold">
            Exam Portion Summary
          </div>
          <div class="text-caption text-grey">
            Track syllabus assignment, submission and approval status
          </div>
        </div>

        <v-btn
          color="primary"
          variant="tonal"
          size="small"
          :to="{ name: 'exam.portions' }"
        >
          Manage Portions
        </v-btn>
      </div>

      <v-row>
        <v-col
          v-for="item in examPortionCards"
          :key="item.title"
          cols="12"
          sm="6"
          md="3"
        >
          <v-card class="portion-card pa-4 rounded-xl" :color="item.color" variant="tonal">
            <div class="d-flex justify-space-between">
              <div>
                <div class="text-caption">
                  {{ item.title }}
                </div>

                <div class="text-h4 font-weight-bold mt-1">
                  {{ item.value }}
                </div>
              </div>

              <v-icon size="34">
                {{ item.icon }}
              </v-icon>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-card>

    <!-- RECENT ACTIVITY -->
    <v-row class="mt-6">
      <v-col cols="12" md="6">
        <v-card class="pa-5 rounded-xl h-100" elevation="0">
          <div class="d-flex justify-space-between align-center mb-4">
            <div>
              <div class="text-h6 font-weight-bold">
                Recent Questions
              </div>
              <div class="text-caption text-grey">
                Latest submitted questions
              </div>
            </div>

            <v-btn size="small" variant="text" :to="{ name: 'questions.index' }">
              View All
            </v-btn>
          </div>

          <v-list density="compact">
            <v-list-item
              v-for="q in dashboard.recent_questions || []"
              :key="q.id"
              class="rounded-lg mb-2 activity-item"
            >
              <template #prepend>
                <v-avatar color="primary" variant="tonal">
                  <v-icon>mdi-help-circle</v-icon>
                </v-avatar>
              </template>

              <v-list-item-title class="text-truncate">
                <span v-html="stripHtml(q.question)"></span>
              </v-list-item-title>

              <v-list-item-subtitle>
                {{ q.grade?.name || '-' }} • {{ q.subject?.name || '-' }}
              </v-list-item-subtitle>

              <template #append>
                <v-chip
                  size="small"
                  variant="tonal"
                  :color="statusColor(q.status)"
                >
                  {{ q.status || 'pending' }}
                </v-chip>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card class="pa-5 rounded-xl h-100" elevation="0">
          <div class="d-flex justify-space-between align-center mb-4">
            <div>
              <div class="text-h6 font-weight-bold">
                Recent Exam Portions
              </div>
              <div class="text-caption text-grey">
                Latest syllabus activities
              </div>
            </div>

            <v-btn size="small" variant="text" :to="{ name: 'exam.portions' }">
              View All
            </v-btn>
          </div>

          <v-list density="compact">
            <v-list-item
              v-for="p in dashboard.exam_portions?.recent || []"
              :key="p.id"
              class="rounded-lg mb-2 activity-item"
            >
              <template #prepend>
                <v-avatar color="secondary" variant="tonal">
                  <v-icon>mdi-book-open-page-variant</v-icon>
                </v-avatar>
              </template>

              <v-list-item-title>
                {{ p.exam_name?.name || '-' }}
              </v-list-item-title>

              <v-list-item-subtitle>
                {{ p.teacher?.user?.name || '-' }} •
                {{ p.grade?.name || '-' }} •
                {{ p.subject?.name || '-' }}
              </v-list-item-subtitle>

              <template #append>
                <v-chip
                  size="small"
                  variant="tonal"
                  :color="statusColor(p.status)"
                >
                  {{ p.status }}
                </v-chip>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>

    <!-- TEACHER PROGRESS -->
    <v-card class="pa-5 rounded-xl mt-6" elevation="0">
      <div class="d-flex justify-space-between align-center mb-4">
        <div>
          <div class="text-h6 font-weight-bold">
            Teacher Progress
          </div>
          <div class="text-caption text-grey">
            Contribution summary of teachers
          </div>
        </div>

        <v-btn
          size="small"
          color="primary"
          variant="tonal"
          :to="{ name: 'teacher.progress' }"
        >
          Full Report
        </v-btn>
      </div>

      <v-table density="comfortable">
        <thead>
          <tr>
            <th>Teacher</th>
            <th>Assignments</th>
            <th>Questions</th>
            <th>Papers</th>
            <th>Progress</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="teacher in dashboard.teacher_progress || []"
            :key="teacher.teacher_id"
          >
            <td>
              <div class="font-weight-medium">
                {{ teacher.name || '-' }}
              </div>
              <div class="text-caption text-grey">
                {{ teacher.contact || '-' }}
              </div>
            </td>

            <td>{{ teacher.assignments_count }}</td>
            <td>{{ teacher.questions_count }}</td>
            <td>{{ teacher.papers_count }}</td>
            <td style="width: 220px">
              <v-progress-linear
                height="8"
                rounded
                color="primary"
                :model-value="teacherProgressPercent(teacher)"
              />
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </v-container>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import api from "../../plugins/api";
import { useUIStore } from "../../stores/snackBar";

const ui = useUIStore();

const loading = ref(false);

const dashboard = ref({
  stats: {},
  exam_portions: {},
  recent_questions: [],
  recent_papers: [],
  teacher_progress: [],
});

const fetchDashboard = async () => {
  loading.value = true;

  try {
    const res = await api.get("/dashboard");
    dashboard.value = res.data;
  } catch (error) {
    ui.showSnackbar(
      error.response?.data?.message || "Failed to load dashboard",
      "error"
    );
  } finally {
    loading.value = false;
  }
};

onMounted(fetchDashboard);

const statCards = computed(() => [
  {
    title: "Teachers",
    value: dashboard.value.stats?.teachers || 0,
    subtitle: "Active teaching staff",
    icon: "mdi-account-school",
    color: "primary",
    textColor: "text-primary",
  },
  {
    title: "Questions",
    value: dashboard.value.stats?.questions || 0,
    subtitle: "Total question bank",
    icon: "mdi-help-circle",
    color: "success",
    textColor: "text-success",
  },
  {
    title: "Question Papers",
    value: dashboard.value.stats?.question_papers || 0,
    subtitle: "Created papers",
    icon: "mdi-file-document",
    color: "warning",
    textColor: "text-warning",
  },
  {
    title: "Exam Portions",
    value: dashboard.value.exam_portions?.total || 0,
    subtitle: "Assigned syllabus tasks",
    icon: "mdi-book-open-page-variant",
    color: "error",
    textColor: "text-error",
  },
]);

const examPortionCards = computed(() => [
  {
    title: "Assigned",
    value: dashboard.value.exam_portions?.assigned || 0,
    icon: "mdi-clipboard-text-clock",
    color: "primary",
  },
  {
    title: "Submitted",
    value: dashboard.value.exam_portions?.submitted || 0,
    icon: "mdi-send-check",
    color: "warning",
  },
  {
    title: "Approved",
    value: dashboard.value.exam_portions?.approved || 0,
    icon: "mdi-check-decagram",
    color: "success",
  },
  {
    title: "Rejected",
    value: dashboard.value.exam_portions?.rejected || 0,
    icon: "mdi-close-circle",
    color: "error",
  },
]);

const approvalPercentage = computed(() => {
  const total = Number(dashboard.value.stats?.questions || 0);
  const approved = Number(dashboard.value.stats?.approved_questions || 0);

  if (!total) return 0;

  return Math.round((approved / total) * 100);
});

const statusColor = (status) => {
  if (status === "approved") return "success";
  if (status === "submitted") return "warning";
  if (status === "rejected") return "error";
  if (status === "assigned") return "primary";
  return "grey";
};

const stripHtml = (html = "") => {
  return html.replace(/<[^>]*>/g, "").substring(0, 90);
};

const teacherProgressPercent = (teacher) => {
  const questions = Number(teacher.questions_count || 0);
  const assignments = Number(teacher.assignments_count || 1);

  return Math.min(100, Math.round((questions / assignments) * 20));
};
</script>

<style scoped>
.dashboard-page {
  background: rgb(var(--v-theme-background));
}

.hero-card {
  background: linear-gradient(
    135deg,
    rgba(var(--v-theme-primary), 0.16),
    rgba(var(--v-theme-secondary), 0.08)
  );
}

.stat-card {
  transition: 0.25s ease;
  border: 1px solid rgba(var(--v-theme-primary), 0.08);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
}

.mini-box {
  padding: 18px;
  border-radius: 18px;
}

.mini-box strong {
  font-size: 28px;
}

.success-box {
  background: rgba(var(--v-theme-success), 0.12);
  color: rgb(var(--v-theme-success));
}

.warning-box {
  background: rgba(var(--v-theme-warning), 0.12);
  color: rgb(var(--v-theme-warning));
}

.error-box {
  background: rgba(var(--v-theme-error), 0.12);
  color: rgb(var(--v-theme-error));
}

.paper-count-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px dashed rgba(var(--v-theme-on-surface), 0.12);
}

.portion-card {
  min-height: 120px;
}

.activity-item {
  background: rgba(var(--v-theme-surface-variant), 0.35);
}
</style>