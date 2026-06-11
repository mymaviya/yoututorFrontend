<script setup>
import { computed, ref } from "vue";
import api from "../../../plugins/api";
import { useUIStore } from "../../../stores/snackBar";

const ui = useUIStore();

const file = ref(null);

const templateLoading = ref(false);
const previewLoading = ref(false);
const importing = ref(false);

const preview = ref(null);
const previewRows = ref([]);
const previewTotal = ref(0);

const result = ref(null);
const credentials = ref([]);

const previewHeaders = [
  { title: "Name", key: "name" },
  { title: "Email", key: "email" },
  { title: "Mobile", key: "mobile" },
  { title: "Qualification", key: "qualification" },
  { title: "Address", key: "address" },
];

const credentialHeaders = [
  { title: "Teacher Name", key: "name" },
  { title: "Email / Login ID", key: "email" },
  { title: "Password", key: "password" },
];

const hasPreview = computed(() => previewRows.value.length > 0);

const canImport = computed(() => {
  return !!file.value && hasPreview.value && !importing.value;
});

const selectedFile = computed(() => {
  if (Array.isArray(file.value)) return file.value[0] || null;
  return file.value || null;
});

const resetOutput = () => {
  preview.value = null;
  previewRows.value = [];
  previewTotal.value = 0;
  result.value = null;
  credentials.value = [];
};

const downloadTemplate = async () => {
  templateLoading.value = true;

  try {
    const res = await api.get("/teachers/importTemplate", {
      responseType: "blob",
    });

    const contentDisposition = res.headers?.["content-disposition"] || "";
    const match = contentDisposition.match(/filename="?([^"]+)"?/i);

    const fileName = match?.[1] || "teacher-import-template.xlsx";

    const blob = new Blob([res.data], {
      type:
        res.headers?.["content-type"] ||
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error(error);
    ui.showSnackbar("Failed to download template", "error");
  } finally {
    templateLoading.value = false;
  }
};

const previewTeachers = async () => {
  if (!selectedFile.value) {
    ui.showSnackbar("Please select an Excel file", "warning");
    return;
  }

  previewLoading.value = true;
  result.value = null;
  credentials.value = [];

  try {
    const formData = new FormData();
    formData.append("file", selectedFile.value);

    const res = await api.post("/teachers/import-preview", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const rows = res.data.rows || [];

    preview.value = res.data;
    previewRows.value = rows.map((row) => {
      if (Array.isArray(row)) {
        return {
          name: row[0] || "",
          email: row[1] || "",
          mobile: row[2] || "",
          qualification: row[3] || "",
          address: row[4] || "",
        };
      }

      return {
        name: row.name || "",
        email: row.email || "",
        mobile: row.mobile || "",
        qualification: row.qualification || "",
        address: row.address || "",
      };
    });

    previewTotal.value = res.data.total_rows || previewRows.value.length;

    ui.showSnackbar("Preview loaded successfully", "success");
  } catch (error) {
    console.error(error);
    ui.showSnackbar(
      error.response?.data?.message || "Failed to preview import file",
      "error"
    );
  } finally {
    previewLoading.value = false;
  }
};

const importTeachers = async () => {
  if (!selectedFile.value) {
    ui.showSnackbar("Please select an Excel file", "warning");
    return;
  }

  importing.value = true;

  try {
    const formData = new FormData();
    formData.append("file", selectedFile.value);

    const response = await api.post("/teachers/import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    result.value = response.data;
    credentials.value = response.data.credentials || [];

    hasPreview.value = false;
    previewRows.value = [];
    previewTotal.value = 0;
    selectedFile.value = null;

    ui.showSnackbar("Teachers imported successfully", "success");
  } catch (error) {
    console.error(error);
    ui.showSnackbar(error.response?.data?.message || "Import failed", "error");
  } finally {
    importing.value = false;
  }
};

const exportCredentials = () => {
  let csv = "Teacher Name,Email/Login ID,Password\n";

  credentials.value.forEach((item) => {
    csv += `"${item.name || ""}","${item.email || ""}","${item.password || ""}"\n`;
  });

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "teacher-login-credentials.csv";
  link.click();

  URL.revokeObjectURL(url);
};
</script>

<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">Import Teachers</h1>

        <div class="text-grey">
          Upload Excel/CSV file and create teacher login accounts automatically.
        </div>
      </div>

      <v-btn color="primary" prepend-icon="mdi-download" :loading="templateLoading" @click="downloadTemplate">
        Download Template
      </v-btn>
    </div>

    <v-card class="rounded-xl pa-6 mb-6" elevation="0">
      <v-file-input v-model="file" label="Select Excel File" accept=".xlsx,.xls,.csv" prepend-icon="mdi-file-excel"
        variant="outlined" clearable @update:model-value="resetOutput" />

      <div class="d-flex flex-wrap ga-2 mt-4">
        <v-btn color="info" :loading="previewLoading" prepend-icon="mdi-eye" @click="previewTeachers">
          Preview
        </v-btn>

        <v-btn color="success" :loading="importing" :disabled="!canImport" prepend-icon="mdi-upload"
          @click="importTeachers">
          Confirm Import
        </v-btn>
      </div>
    </v-card>

    <v-card v-if="hasPreview" class="rounded-xl pa-4 mb-6" elevation="0">
      <div class="d-flex justify-space-between align-center mb-4">
        <div>
          <div class="text-h6 font-weight-bold">Import Preview</div>
          <div class="text-grey">
            Showing first {{ previewRows.length }} rows out of {{ previewTotal }} total rows.
          </div>
        </div>

        <v-chip color="primary" variant="tonal">
          Total Rows: {{ previewTotal }}
        </v-chip>
      </div>

      <AppDataTable :headers="previewHeaders" :items="previewRows" density="comfortable" />
    </v-card>

    <v-row v-if="result" class="mb-4">
      <v-col cols="12" md="4">
        <v-card color="success" class="pa-4 rounded-xl">
          <div class="text-h4">
            {{ result.imported || 0 }}
          </div>

          <div>Imported</div>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card color="warning" class="pa-4 rounded-xl">
          <div class="text-h4">
            {{ result.skipped || 0 }}
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

    <v-card v-if="result?.errors?.length" class="rounded-xl pa-4 mb-6" elevation="0">
      <div class="text-h6 mb-3">Import Errors</div>

      <v-alert v-for="(error, index) in result.errors" :key="index" type="error" variant="tonal" class="mb-2">
        {{ error }}
      </v-alert>
    </v-card>

    <v-card v-if="credentials.length" class="rounded-xl pa-4" elevation="0">
      <div class="d-flex justify-space-between align-center mb-4">
        <div>
          <div class="text-h6 font-weight-bold">Generated Login Credentials</div>
          <div class="text-grey">
            Download and share these credentials securely.
          </div>
        </div>

        <v-btn color="primary" prepend-icon="mdi-download" @click="exportCredentials">
          Download CSV
        </v-btn>
      </div>

      <AppDataTable :headers="credentialHeaders" :items="credentials" density="comfortable">
        <template #item.password="{ item }">
          <v-chip color="deep-purple" variant="tonal">
            {{ item.password }}
          </v-chip>
        </template>
      </AppDataTable>
    </v-card>
  </div>
</template>
