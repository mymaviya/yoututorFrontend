<script setup>
import { ref, onMounted } from "vue";
import api from "../../plugins/api";

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

    <v-row class="mt-2">
      <v-col cols="12" md="4">
        <v-card class="pa-4 rounded-xl" elevation="0">
          <div class="text-h6 font-weight-bold mb-3">Question Status</div>

          <div
            v-for="item in statusDistribution"
            :key="item.status"
            class="mb-3"
          >
            <div class="d-flex justify-space-between mb-1">
              <span class="text-capitalize">{{ item.status }}</span>
              <strong>{{ item.total }}</strong>
            </div>

            <v-progress-linear
              :model-value="summary.total_questions ? (item.total / summary.total_questions) * 100 : 0"
              height="10"
              rounded
            />
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="pa-4 rounded-xl" elevation="0">
          <div class="text-h6 font-weight-bold mb-3">Difficulty Distribution</div>

          <div
            v-for="item in difficultyDistribution"
            :key="item.difficulty"
            class="mb-3"
          >
            <div class="d-flex justify-space-between mb-1">
              <span class="text-capitalize">{{ item.difficulty }}</span>
              <strong>{{ item.total }}</strong>
            </div>

            <v-progress-linear
              :model-value="summary.total_questions ? (item.total / summary.total_questions) * 100 : 0"
              height="10"
              rounded
            />
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="pa-4 rounded-xl" elevation="0">
          <div class="text-h6 font-weight-bold mb-3">Task Summary</div>

          <v-list density="compact">
            <v-list-item>
              <template #prepend>
                <v-icon color="success">mdi-check-circle</v-icon>
              </template>
              <v-list-item-title>Completed Tasks</v-list-item-title>
              <template #append>
                <strong>{{ summary.completed_tasks || 0 }}</strong>
              </template>
            </v-list-item>

            <v-list-item>
              <template #prepend>
                <v-icon color="warning">mdi-clock-outline</v-icon>
              </template>
              <v-list-item-title>Pending Tasks</v-list-item-title>
              <template #append>
                <strong>{{ summary.pending_tasks || 0 }}</strong>
              </template>
            </v-list-item>

            <v-list-item>
              <template #prepend>
                <v-icon color="error">mdi-close-circle</v-icon>
              </template>
              <v-list-item-title>Rejected Questions</v-list-item-title>
              <template #append>
                <strong>{{ summary.rejected_questions || 0 }}</strong>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-2">
      <v-col cols="12" md="6">
        <v-card class="pa-4 rounded-xl" elevation="0">
          <div class="text-h6 font-weight-bold mb-3">Question Types</div>

          <div
            v-for="item in questionTypeDistribution"
            :key="item.type"
            class="mb-3"
          >
            <div class="d-flex justify-space-between mb-1">
              <span>{{ item.type }}</span>
              <strong>{{ item.total }}</strong>
            </div>

            <v-progress-linear
              :model-value="summary.total_questions ? (item.total / summary.total_questions) * 100 : 0"
              height="10"
              rounded
            />
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card class="pa-4 rounded-xl" elevation="0">
          <div class="text-h6 font-weight-bold mb-3">Monthly Submissions</div>

          <v-table density="comfortable">
            <thead>
              <tr>
                <th>Month</th>
                <th class="text-right">Questions</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="item in monthlySubmissions" :key="item.month">
                <td>{{ item.month }}</td>
                <td class="text-right font-weight-bold">{{ item.total }}</td>
              </tr>
            </tbody>
          </v-table>
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