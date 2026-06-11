<script setup>
import { ref } from "vue";
import api from "../../plugins/api";
import { useUIStore } from "../../stores/snackBar";

const ui = useUIStore();

const file = ref(null);
const importing = ref(false);
const result = ref(null);

const importOptions = [
  {
    title: "Import All",
    value: "all",
    description:
      "Imports question type masters, templates, assignments, paper blueprints and blueprint sections.",
  },
  {
    title: "Question Type Template Only",
    value: "question-type-template",
    description:
      "Imports only question type masters, templates and assignments.",
  },
  {
    title: "Paper Blueprint Only",
    value: "paper-blueprint",
    description:
      "Imports only paper blueprints and blueprint sections.",
  },
];

const importType = ref("all");

const endpointMap = {
  all: "/blueprint-import/all",
  "question-type-template": "/blueprint-import/question-type-template",
  "paper-blueprint": "/blueprint-import/paper-blueprint",
};

const downloadTemplate = async () => {
  try {
    const res = await api.get("/blueprint-import/template", {
      responseType: "blob",
    });

    const blob = new Blob([res.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "blueprint_import_template.xlsx";
    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    ui.showSnackbar("Failed to download template", "error");
  }
};

const importExcel = async () => {
  if (!file.value) {
    ui.showSnackbar("Please select an Excel file", "warning");
    return;
  }

  importing.value = true;
  result.value = null;

  const formData = new FormData();
  formData.append("file", file.value);

  try {
    const res = await api.post(endpointMap[importType.value], formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    result.value = res.data;
    ui.showSnackbar("Import completed successfully", "success");
  } catch (error) {
    if (error.response?.status === 422) {
      result.value = error.response.data;
      ui.showSnackbar("Please check the uploaded file", "error");
    } else {
      ui.showSnackbar("Import failed", "error");
    }
  } finally {
    importing.value = false;
  }
};

const resetForm = () => {
  file.value = null;
  result.value = null;
  importType.value = "all";
};

const getErrors = (data) => {
  if (!data) return [];

  if (Array.isArray(data.errors)) return data.errors;

  const errors = [];

  if (data.question_type_import?.errors?.length) {
    errors.push(...data.question_type_import.errors);
  }

  if (data.paper_blueprint_import?.errors?.length) {
    errors.push(...data.paper_blueprint_import.errors);
  }

  return errors;
};

const getCreated = (data) => {
  if (!data) return 0;

  if (data.created !== undefined) return data.created;

  return (
    Number(data.question_type_import?.created || 0) +
    Number(data.paper_blueprint_import?.created || 0)
  );
};

const getSkipped = (data) => {
  if (!data) return 0;

  if (data.skipped !== undefined) return data.skipped;

  return (
    Number(data.question_type_import?.skipped || 0) +
    Number(data.paper_blueprint_import?.skipped || 0)
  );
};
</script>

<template>
  <v-container>
    <div class="mb-6">
      <h1 class="text-h4 font-weight-bold">Blueprint Excel Import</h1>
      <p class="text-grey">
        Import CBSE question type templates and paper blueprints from Excel.
      </p>
    </div>

    <v-row>
      <v-col cols="12" md="7">
        <v-card class="rounded-xl pa-4" elevation="0">
          <v-card-title class="font-weight-bold">
            Upload Excel File
          </v-card-title>

          <v-card-text>
            <v-radio-group v-model="importType">
              <v-radio v-for="option in importOptions" :key="option.value" :value="option.value">
                <template #label>
                  <div>
                    <div class="font-weight-medium">
                      {{ option.title }}
                    </div>
                    <div class="text-caption text-grey">
                      {{ option.description }}
                    </div>
                  </div>
                </template>
              </v-radio>
            </v-radio-group>

            <v-file-input v-model="file" label="Select Excel File" accept=".xlsx,.xls,.csv"
              prepend-icon="mdi-file-excel" show-size clearable />

            <v-alert type="info" variant="tonal" class="mt-4">
              The Excel file should contain sheets in this order:
              Question Type Masters, Question Type Templates, Question Type
              Assignments, Paper Blueprints, and Blueprint Sections.
            </v-alert>
          </v-card-text>

          <v-card-actions>
            <v-spacer />

            <v-btn variant="text" @click="resetForm">
              Reset
            </v-btn>

            <v-btn color="primary" :loading="importing" prepend-icon="mdi-upload" @click="importExcel">
              Import Excel
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12" md="5">
        <v-card class="rounded-xl pa-4" elevation="0">
          <v-card-title class="font-weight-bold">
            Expected Sheets
          </v-card-title>

          <v-card-text>
            <v-list density="compact">
              <v-list-item title="1. Question Type Masters" />
              <v-list-item title="2. Question Type Templates" />
              <v-list-item title="3. Question Type Assignments" />
              <v-list-item title="4. Paper Blueprints" />
              <v-list-item title="5. Blueprint Sections" />
            </v-list>

            <v-divider class="my-3" />

            <div class="text-caption text-grey">
              Use this importer for CBSE English, Hindi, Science, Maths and
              other subject paper patterns.
            </div>
            <v-btn color="success" variant="tonal" prepend-icon="mdi-download" @click="downloadTemplate">
              Download Template
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-card v-if="result" class="rounded-xl mt-5" elevation="0">
      <v-card-title class="font-weight-bold">
        Import Result
      </v-card-title>

      <v-card-text>
        <v-row>
          <v-col cols="12" md="4">
            <v-sheet class="pa-4 rounded-lg bg-green-lighten-5">
              <div class="text-caption text-grey">Created</div>
              <div class="text-h5 font-weight-bold">
                {{ getCreated(result) }}
              </div>
            </v-sheet>
          </v-col>

          <v-col cols="12" md="4">
            <v-sheet class="pa-4 rounded-lg bg-orange-lighten-5">
              <div class="text-caption text-grey">Skipped</div>
              <div class="text-h5 font-weight-bold">
                {{ getSkipped(result) }}
              </div>
            </v-sheet>
          </v-col>

          <v-col cols="12" md="4">
            <v-sheet class="pa-4 rounded-lg bg-red-lighten-5">
              <div class="text-caption text-grey">Errors</div>
              <div class="text-h5 font-weight-bold">
                {{ getErrors(result).length }}
              </div>
            </v-sheet>
          </v-col>
        </v-row>

        <v-alert v-if="getErrors(result).length" type="error" variant="tonal" class="mt-4">
          <div class="font-weight-bold mb-2">
            Import Errors
          </div>

          <ul>
            <li v-for="(error, index) in getErrors(result)" :key="index">
              {{ error }}
            </li>
          </ul>
        </v-alert>

        <v-alert v-else type="success" variant="tonal" class="mt-4">
          Import completed without errors.
        </v-alert>
      </v-card-text>
    </v-card>
  </v-container>
</template>