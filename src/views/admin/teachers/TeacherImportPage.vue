<script setup>
import { ref } from "vue";
import api from "../../../plugins/api";
import { useUIStore } from "../../../stores/snackBar";

const ui = useUIStore();
const loading = ref(false);
const file = ref(null);
const result = ref(null);
const credentials = ref([]);

const downloadTemplate = async () => {
  const res = await api.get("/teachers/importTemplate", {
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");

  link.href = url;
  link.setAttribute("download", "teacher-import-template.xlsx");
  document.body.appendChild(link);
  link.click();
  link.remove();
};

const previewLoading = ref(false);
const preview = ref(null);

const previewTeachers = async () => {
  if (!file.value) {
    ui.showSnackbar("Please select an Excel file", "warning");
    return;
  }

  previewLoading.value = true;

  try {
    const formData = new FormData();
    formData.append("file", file.value);

    const res = await api.post("/teachers/import-preview", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    preview.value = res.data;
  } finally {
    previewLoading.value = false;
  }
};

const importTeachers = async () => {
  if (!file.value) {
    ui.showSnackbar("Please select an Excel file", "warning");
    return;
  }

  loading.value = true;

  try {
    const formData = new FormData();

    formData.append("file", file.value);

    const response = await api.post("/teachers/import", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    result.value = response.data;

    credentials.value = response.data.credentials || [];

    ui.showSnackbar("Teachers imported successfully", "success");
  } catch (error) {
    ui.showSnackbar(error.response?.data?.message || "Import failed", "error");
  } finally {
    loading.value = false;
  }
};

const exportCredentials = () => {
  let csv = "Teacher Name,Email/Login ID,Password\n";

  credentials.value.forEach((item) => {
    csv += `${item.name},${item.email},${item.password}\n`;
  });

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;

  link.download = "teacher-login-credentials.csv";

  link.click();
};

const headers = [
  {
    title: "Teacher Name",
    key: "name",
  },
  {
    title: "Login ID",
    key: "email",
  },
  {
    title: "Password",
    key: "password",
  },
];
</script>

<template>
  <div>
    <!-- PAGE HEADER -->

    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">Import Teachers</h1>

        <div class="text-grey">
          Upload Excel file and create teacher login accounts automatically.
        </div>
      </div>

      <v-btn
        color="primary"
        prepend-icon="mdi-download"
        @click="downloadTemplate"
      >
        Download Template
      </v-btn>
    </div>

    <!-- IMPORT CARD -->

    <v-card class="rounded-xl pa-6 mb-6" elevation="0">
      <v-file-input
        v-model="file"
        label="Select Excel File"
        accept=".xlsx,.xls,.csv"
        prepend-icon="mdi-file-excel"
        variant="outlined"
      />

      <div class="d-flex mt-4">
        <v-btn
          color="info"
          :loading="previewLoading"
          prepend-icon="mdi-eye"
          @click="previewTeachers"
          class="me-2"
        >
          Preview
        </v-btn>
        <v-btn
          color="success"
          :loading="loading"
          :disabled="!preview || preview.errors > 0"
          prepend-icon="mdi-upload"
          @click="importTeachers"
        >
          Confirm Import
        </v-btn>
      </div>
    </v-card>

    <v-card v-if="preview" class="rounded-xl pa-4 mb-6">
      <div class="text-h6 mb-3">Import Preview</div>

      <div class="d-flex ga-2 mb-4">
        <v-chip color="primary">Total: {{ preview.total }}</v-chip>
        <v-chip color="success">Ready: {{ preview.ready }}</v-chip>
        <v-chip color="error">Errors: {{ preview.errors }}</v-chip>
      </div>

      <v-table>
        <thead>
          <tr>
            <th>Row</th>
            <th>Name</th>
            <th>Email</th>
            <th>Mobile</th>
            <th>Status</th>
            <th>Errors</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="row in preview.rows" :key="row.row">
            <td>{{ row.row }}</td>
            <td>{{ row.name }}</td>
            <td>{{ row.email }}</td>
            <td>{{ row.mobile }}</td>
            <td>
              <v-chip
                size="small"
                :color="row.status === 'ready' ? 'success' : 'error'"
                variant="tonal"
              >
                {{ row.status }}
              </v-chip>
            </td>
            <td>
              <div v-for="err in row.errors" :key="err" class="text-error">
                {{ err }}
              </div>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <!-- SUMMARY -->

    <v-row v-if="result" class="mb-4">
      <v-col cols="12" md="4">
        <v-card color="success" class="pa-4 rounded-xl">
          <div class="text-h4">
            {{ result.imported }}
          </div>

          <div>Imported</div>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card color="warning" class="pa-4 rounded-xl">
          <div class="text-h4">
            {{ result.skipped }}
          </div>

          <div>Skipped</div>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card color="error" class="pa-4 rounded-xl">
          <div class="text-h4">
            {{ result.errors?.length || 0 }}
          </div>

          <div>Errors</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- ERRORS -->

    <v-card v-if="result?.errors?.length" class="rounded-xl pa-4 mb-6">
      <div class="text-h6 mb-3">Import Errors</div>

      <v-alert
        v-for="(error, index) in result.errors"
        :key="index"
        type="error"
        variant="tonal"
        class="mb-2"
      >
        {{ error }}
      </v-alert>
    </v-card>

    <!-- CREDENTIALS -->

    <v-card v-if="credentials.length" class="rounded-xl pa-4">
      <div class="d-flex justify-space-between align-center mb-4">
        <div class="text-h6">Generated Login Credentials</div>

        <v-btn
          color="primary"
          prepend-icon="mdi-download"
          @click="exportCredentials"
        >
          Download CSV
        </v-btn>
      </div>

      <v-data-table
        :headers="headers"
        :items="credentials"
        density="comfortable"
      >
        <template #item.password="{ item }">
          <v-chip color="deep-purple" variant="tonal">
            {{ item.password }}
          </v-chip>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>
