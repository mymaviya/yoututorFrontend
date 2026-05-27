<script setup>
import { ref, onMounted, computed } from "vue";
import api from "../../plugins/api";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

import { Pie, Bar, Line, Doughnut } from "vue-chartjs";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartDataLabels,
);

const loading = ref(false);

const summary = ref({});
const statusDistribution = ref([]);
const difficultyDistribution = ref([]);
const questionTypeDistribution = ref([]);
const monthlySubmissions = ref([]);
const teacherProgress = ref([]);

const fetchAnalytics = async () => {
  loading.value = true;

  try {
    const res = await api.get("/teacher-analytics");

    summary.value = res.data.summary || {};
    statusDistribution.value = res.data.status_distribution || [];
    difficultyDistribution.value = res.data.difficulty_distribution || [];
    questionTypeDistribution.value = res.data.question_type_distribution || [];
    monthlySubmissions.value = res.data.monthly_submissions || [];
    teacherProgress.value = res.data.teacher_progress || [];
  } finally {
    loading.value = false;
  }
};

const headers = [
  { title: "Teacher", key: "name" },
  { title: "Total Tasks", key: "total_tasks" },
  { title: "Completed", key: "completed_tasks" },
  { title: "Pending", key: "pending_tasks" },
  { title: "Progress", key: "progress" },
];

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,

  plugins: {
    legend: {
      position: "bottom",
    },

    datalabels: {
      color: "#fff",

      font: {
        weight: "bold",
        size: 14,
      },

      formatter: (value) => value,
    },
  },
};

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,

  plugins: {
    legend: {
      display: false,
    },

    datalabels: {
      anchor: "end",
      align: "top",
      color: "#111827",

      font: {
        weight: "bold",
      },
    },
  },
};

const monthlyChartOptions = {
  responsive: true,
  maintainAspectRatio: false,

  plugins: {
    legend: {
      position: "bottom",
    },

    datalabels: {
      anchor: "end",
      align: "top",

      color: "#111827",

      font: {
        weight: "bold",
        size: 13,
      },

      formatter: (value) => value,
    },
  },

  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        precision: 0,
      },
    },
  },
};

const statusChartData = computed(() => ({
  labels: statusDistribution.value.map((i) => i.status),
  datasets: [
    {
      data: statusDistribution.value.map((i) => i.total),

      backgroundColor: [
        "#22c55e",
        "#f59e0b",
        "#ef4444",
      ],

      borderRadius: 8,
    },
  ],
}));

const difficultyChartData = computed(() => ({
  labels: difficultyDistribution.value.map((i) => i.difficulty),
  datasets: [
    {
      data: difficultyDistribution.value.map((i) => i.total),

      backgroundColor: [
        "#3b82f6",
        "#8b5cf6",
        "#ec4899",
      ],
    },
  ],
}));

const typeChartData = computed(() => ({
  labels: questionTypeDistribution.value.map((i) => i.type),
  datasets: [
    {
      label: "Question Types",

      data: questionTypeDistribution.value.map((i) => i.total),

      backgroundColor: [
        "#6366f1",
        "#06b6d4",
        "#14b8a6",
        "#f97316",
        "#eab308",
        "#ec4899",
        "#84cc16",
      ],

      borderRadius: 10,
    },
  ],
}));

const monthlyChartData = computed(() => ({
  labels: monthlySubmissions.value.map((i) => i.month),

  datasets: [
    {
      label: "Monthly Submissions",

      data: monthlySubmissions.value.map((i) => i.total),

      borderColor: "#6366f1",

      backgroundColor: "rgba(99,102,241,0.2)",

      fill: true,

      tension: 0.4,

      pointBackgroundColor: "#ec4899",

      pointRadius: 5,
    },
  ],
}));



onMounted(fetchAnalytics);
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-h4 font-weight-bold">Teacher Analytics Dashboard</h1>
      <p class="text-grey">
        Track teachers, tasks, question creation and approval performance.
      </p>
    </div>

    <v-progress-linear v-if="loading" indeterminate class="mb-4" />

    <v-row>
      <v-col cols="12" md="3">
        <v-card class="pa-4 rounded-xl" color="primary" variant="tonal">
          <div class="text-caption">Total Teachers</div>
          <div class="text-h4 font-weight-bold">
            {{ summary.total_teachers || 0 }}
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card class="pa-4 rounded-xl" color="info" variant="tonal">
          <div class="text-caption">Total Tasks</div>
          <div class="text-h4 font-weight-bold">
            {{ summary.total_tasks || 0 }}
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card class="pa-4 rounded-xl" color="success" variant="tonal">
          <div class="text-caption">Approved Questions</div>
          <div class="text-h4 font-weight-bold">
            {{ summary.approved_questions || 0 }}
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card class="pa-4 rounded-xl" color="warning" variant="tonal">
          <div class="text-caption">Pending Questions</div>
          <div class="text-h4 font-weight-bold">
            {{ summary.pending_questions || 0 }}
          </div>
        </v-card>
      </v-col>
    </v-row>


    <v-row class="mt-5">
  <v-col cols="12" md="6">
    <v-card class="pa-4 rounded-xl" elevation="0">
      <div class="text-h6 font-weight-bold mb-3">Question Status</div>

      <div style="height: 280px">
        <Doughnut :data="statusChartData" :options="chartOptions" />
      </div>
    </v-card>
  </v-col>

  <v-col cols="12" md="6">
    <v-card class="pa-4 rounded-xl" elevation="0">
      <div class="text-h6 font-weight-bold mb-3">Difficulty Distribution</div>

      <div style="height: 280px">
        <Pie :data="difficultyChartData" :options="chartOptions" />
      </div>
    </v-card>
  </v-col>

  <v-col cols="12" md="6">
    <v-card class="pa-4 rounded-xl" elevation="0">
      <div class="text-h6 font-weight-bold mb-3">Question Type Distribution</div>

      <div style="height: 320px">
        <Bar :data="typeChartData" :options="chartOptions" />
      </div>
    </v-card>
  </v-col>

  <v-col cols="12" md="6">
    <v-card class="pa-4 rounded-xl" elevation="0">
      <div class="text-h6 font-weight-bold mb-3">Monthly Submissions</div>

      <div style="height: 320px">
        <Line :data="monthlyChartData" :options="monthlyChartOptions" />
      </div>
    </v-card>
  </v-col>
</v-row>
   

    <v-card class="pa-4 rounded-xl mt-6" elevation="0">
      <div class="text-h6 font-weight-bold mb-3">Teacher Progress</div>

      <v-data-table
        :headers="headers"
        :items="teacherProgress"
        density="comfortable"
      >
        <template #item.progress="{ item }">
          <div class="d-flex align-center ga-2">
            <v-progress-linear
              :model-value="item.progress"
              height="8"
              rounded
              style="width: 120px"
            />

            <strong>{{ item.progress }}%</strong>
          </div>
        </template>
      </v-data-table>
    </v-card>

  </div>
</template>

<style scoped>
.analytics-card {
  transition: all 0.25s ease;
}

.analytics-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0,0,0,0.12);
}
</style>
