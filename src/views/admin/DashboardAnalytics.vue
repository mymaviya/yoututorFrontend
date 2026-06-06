<script setup>
import { ref, computed, onMounted } from "vue";
import api from "../../plugins/api";
import { Bar, Doughnut } from "vue-chartjs";
import ChartDataLabels from "chartjs-plugin-datalabels";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend, ChartDataLabels);

const dashboard = ref({ stats: {}, analytics: {} });

const fetchDashboard = async () => {
  const res = await api.get("/dashboard");
  dashboard.value = res.data;
};

onMounted(fetchDashboard);

const colors = {
  approved: "#16A34A",
  pending: "#F59E0B",
  rejected: "#DC2626",
  assigned: "#2563EB",
  submitted: "#F97316",
  purple: "#7C3AED",
  cyan: "#0891B2",
  teal: "#14B8A6",
};

const bloomColors = ["#60A5FA", "#34D399", "#FBBF24", "#FB7185", "#A78BFA", "#F97316"];

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: "bottom" },
    datalabels: {
      color: "#fff",
      font: { weight: "bold", size: 12 },
      formatter: (value) => value || "",
    },
  },
};

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    datalabels: {
      anchor: "end",
      align: "top",
      color: "#333",
      font: { weight: "bold" },
    },
  },
  scales: {
    y: { beginAtZero: true, ticks: { precision: 0 } },
  },
};

const horizontalBarOptions = {
  ...barOptions,
  indexAxis: "y",
  plugins: {
    ...barOptions.plugins,
    datalabels: {
      anchor: "end",
      align: "right",
      color: "#333",
      font: { weight: "bold" },
    },
  },
};

const formatBloom = (value = "") =>
  value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const questionStatusChart = computed(() => {
  const items = dashboard.value.analytics?.question_status || [];

  return {
    labels: items.map((i) => i.status || "pending"),
    datasets: [
      {
        data: items.map((i) => Number(i.total || 0)),
        backgroundColor: items.map((i) =>
          i.status === "approved"
            ? colors.approved
            : i.status === "rejected"
              ? colors.rejected
              : colors.pending
        ),
        borderWidth: 0,
      },
    ],
  };
});

const bloomLevelChart = computed(() => {
  const items = dashboard.value.analytics?.bloom_levels || [];

  return {
    labels: items.map((i) => formatBloom(i.bloom_level)),
    datasets: [
      {
        label: "Questions",
        data: items.map((i) => Number(i.total || 0)),
        backgroundColor: bloomColors,
        borderRadius: 10,
      },
    ],
  };
});

const examPortionChart = computed(() => {
  const items = dashboard.value.analytics?.exam_portion_status || [];

  return {
    labels: items.map((i) => i.status),
    datasets: [
      {
        data: items.map((i) => Number(i.total || 0)),
        backgroundColor: items.map((i) =>
          i.status === "approved"
            ? colors.approved
            : i.status === "rejected"
              ? colors.rejected
              : i.status === "submitted"
                ? colors.submitted
                : colors.assigned
        ),
        borderWidth: 0,
      },
    ],
  };
});

const questionsByGradeChart = computed(() => {
  const items = dashboard.value.analytics?.questions_by_grade || [];

  return {
    labels: items.map((i) => i.grade_name || "Unknown"),
    datasets: [
      {
        label: "Questions",
        data: items.map((i) => Number(i.total || 0)),
        backgroundColor: "#3B82F6",
        borderRadius: 10,
      },
    ],
  };
});

const questionsBySubjectChart = computed(() => {
  const items = dashboard.value.analytics?.questions_by_subject || [];

  return {
    labels: items.map((i) => i.subject_name || "Unknown"),
    datasets: [
      {
        label: "Questions",
        data: items.map((i) => Number(i.total || 0)),
        backgroundColor: "#8B5CF6",
        borderRadius: 10,
      },
    ],
  };
});

const teacherQuestionsChart = computed(() => {
  const items = dashboard.value.analytics?.teacher_performance || [];

  return {
    labels: items.map((i) => i.name || "Unknown"),
    datasets: [
      {
        label: "Questions Created",
        data: items.map((i) => Number(i.questions_count || 0)),
        backgroundColor: "#14B8A6",
        borderRadius: 10,
      },
    ],
  };
});

const kpiCards = computed(() => [
  {
    title: "Total Questions",
    value: dashboard.value.stats?.questions || 0,
    icon: "mdi-help-circle",
    gradient: "linear-gradient(135deg,#2563EB,#60A5FA)",
  },
  {
    title: "Approved",
    value: dashboard.value.stats?.approved_questions || 0,
    icon: "mdi-check-decagram",
    gradient: "linear-gradient(135deg,#16A34A,#86EFAC)",
  },
  {
    title: "Pending",
    value: dashboard.value.stats?.pending_questions || 0,
    icon: "mdi-clock-alert",
    gradient: "linear-gradient(135deg,#F59E0B,#FDE68A)",
  },
  {
    title: "Exam Portions",
    value: dashboard.value.exam_portions?.total || 0,
    icon: "mdi-book-open-page-variant",
    gradient: "linear-gradient(135deg,#7C3AED,#C4B5FD)",
  },
]);

const bloomHealth = computed(() => {
  const items = dashboard.value.analytics?.bloom_levels || [];
  const total = items.reduce((sum, i) => sum + Number(i.total || 0), 0);

  return items.map((item, index) => ({
    name: formatBloom(item.bloom_level),
    total: Number(item.total || 0),
    percent: total ? Math.round((Number(item.total || 0) / total) * 100) : 0,
    color: bloomColors[index % bloomColors.length],
  }));
});

const teacherPerformance = computed(() =>
  dashboard.value.analytics?.teacher_performance || []
);

const approvalPercent = (teacher) => {
  const total = Number(teacher.questions_count || 0);
  const approved = Number(teacher.approved_questions || 0);
  return total ? Math.round((approved / total) * 100) : 0;
};

const performanceScore = (teacher) => {
  const approved = Number(teacher.approved_questions || 0);
  const portions = Number(teacher.exam_portions_submitted || 0);
  return approved * 2 + portions * 5;
};
</script>

<template>
  <v-container fluid class="analytics-page pa-4">
    <v-card class="analytics-hero pa-6 rounded-xl mb-6" elevation="0">
      <div class="d-flex flex-wrap justify-space-between align-center ga-4">
        <div>
          <div class="text-h4 font-weight-bold text-white">
            Analytics Dashboard
          </div>
          <div class="text-body-2 text-white mt-1">
            Bloom Level, Question Bank, Teacher Performance and Exam Portion Analytics
          </div>
        </div>

        <v-btn color="white" variant="flat" :to="{ name: 'Dashboard' }">
          Executive Dashboard
        </v-btn>
      </div>
    </v-card>

    <v-row>
      <v-col v-for="card in kpiCards" :key="card.title" cols="12" sm="6" md="3">
        <v-card class="kpi-card pa-5 rounded-xl text-white" :style="{ background: card.gradient }" elevation="0">
          <div class="d-flex justify-space-between align-center">
            <div>
              <div class="text-caption">{{ card.title }}</div>
              <div class="text-h4 font-weight-bold mt-2">{{ card.value }}</div>
            </div>

            <v-avatar size="50" color="white" variant="tonal">
              <v-icon size="30">{{ card.icon }}</v-icon>
            </v-avatar>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12" md="4">
        <v-card class="chart-card pa-5 rounded-xl" elevation="0">
          <div class="text-h6 font-weight-bold">Question Status</div>
          <div class="text-caption text-grey mb-4">Approved, pending and rejected questions</div>
          <div class="chart-box">
            <Doughnut :data="questionStatusChart" :options="doughnutOptions" />
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="chart-card pa-5 rounded-xl" elevation="0">
          <div class="text-h6 font-weight-bold">Bloom Level Distribution</div>
          <div class="text-caption text-grey mb-4">Question Bank mapped by Bloom taxonomy</div>
          <div class="chart-box">
            <Bar :data="bloomLevelChart" :options="barOptions" />
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="chart-card pa-5 rounded-xl" elevation="0">
          <div class="text-h6 font-weight-bold">Exam Portion Status</div>
          <div class="text-caption text-grey mb-4">Assigned, submitted, approved and rejected portions</div>
          <div class="chart-box">
            <Doughnut :data="examPortionChart" :options="doughnutOptions" />
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12" md="6">
        <v-card class="chart-card pa-5 rounded-xl" elevation="0">
          <div class="text-h6 font-weight-bold">Questions by Grade</div>
          <div class="text-caption text-grey mb-4">Grade-wise question bank coverage</div>
          <div class="bar-chart-box">
            <Bar :data="questionsByGradeChart" :options="barOptions" />
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card class="chart-card pa-5 rounded-xl" elevation="0">
          <div class="text-h6 font-weight-bold">Questions by Subject</div>
          <div class="text-caption text-grey mb-4">Subject-wise contribution summary</div>
          <div class="bar-chart-box">
            <Bar :data="questionsBySubjectChart" :options="barOptions" />
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12" md="7">
        <v-card class="chart-card pa-5 rounded-xl h-100" elevation="0">
          <div class="text-h6 font-weight-bold">Top Teachers by Question Creation</div>
          <div class="text-caption text-grey mb-4">
            Teachers ranked by contribution to the question bank
          </div>

          <div class="bar-chart-box">
            <Bar :data="teacherQuestionsChart" :options="horizontalBarOptions" />
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="5">
        <v-card class="chart-card pa-5 rounded-xl h-100" elevation="0">
          <div class="text-h6 font-weight-bold">Bloom Level Health</div>
          <div class="text-caption text-grey mb-4">
            Percentage distribution across Bloom levels
          </div>

          <div v-for="item in bloomHealth" :key="item.name" class="mb-4">
            <div class="d-flex justify-space-between mb-1">
              <span class="text-body-2 font-weight-medium">{{ item.name }}</span>
              <strong>{{ item.percent }}%</strong>
            </div>

            <v-progress-linear
              :model-value="item.percent"
              height="12"
              rounded
              :color="item.color"
            />
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-card class="chart-card pa-5 rounded-xl mt-4" elevation="0">
      <div class="text-h6 font-weight-bold mb-4">Teacher Performance Matrix</div>

      <v-table density="comfortable">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Teacher</th>
            <th>Questions</th>
            <th>Approved</th>
            <th>Approval %</th>
            <th>Portions Submitted</th>
            <th>Score</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(teacher, index) in teacherPerformance" :key="teacher.name">
            <td>
              <v-chip size="small" color="primary" variant="tonal">
                #{{ index + 1 }}
              </v-chip>
            </td>

            <td class="font-weight-medium">{{ teacher.name || "-" }}</td>
            <td>{{ teacher.questions_count || 0 }}</td>
            <td>{{ teacher.approved_questions || 0 }}</td>

            <td>
              <v-chip
                size="small"
                :color="approvalPercent(teacher) >= 70 ? 'success' : 'warning'"
                variant="tonal"
              >
                {{ approvalPercent(teacher) }}%
              </v-chip>
            </td>

            <td>{{ teacher.exam_portions_submitted || 0 }}</td>

            <td>
              <v-chip size="small" color="purple" variant="tonal">
                {{ performanceScore(teacher) }}
              </v-chip>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </v-container>
</template>

<style scoped>
.analytics-page {
  background:
    radial-gradient(circle at top left, rgba(37, 99, 235, 0.08), transparent 35%),
    radial-gradient(circle at top right, rgba(124, 58, 237, 0.08), transparent 35%);
}

.analytics-hero {
  background: linear-gradient(135deg, #2563eb, #7c3aed);
}

.kpi-card,
.chart-card {
  transition: 0.25s ease;
}

.kpi-card:hover,
.chart-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.14);
}

.chart-card {
  border: 1px solid rgba(var(--v-theme-primary), 0.08);
}

.chart-box {
  height: 285px;
  position: relative;
}

.bar-chart-box {
  height: 360px;
  position: relative;
}
</style>