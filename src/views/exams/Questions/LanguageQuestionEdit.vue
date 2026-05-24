<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "../../../plugins/api";
import { useUIStore } from "../../../stores/snackBar";

const route = useRoute();
const router = useRouter();
const ui = useUIStore();

const loading = ref(false);
const saving = ref(false);

const form = ref({
  grade_id: null,
  subject_id: null,
  lesson_id: null,
  type: "",
  type_name: "",
  difficulty: "",
  bloom_level: "",
  marks: 1,
  status: "",
  items: [],
});

const fetchGroup = async () => {
  loading.value = true;

  try {
    const res = await api.get("/language-questions/group", {
      params: {
        ids: route.query.ids,
      },
    });

    const rows = res.data.data || res.data;

    if (!rows.length) {
      ui.showSnackbar("No language questions found", "warning");
      return;
    }

    const first = rows[0];

    form.value = {
      grade_id: first.grade_id,
      subject_id: first.subject_id,
      lesson_id: first.lesson_id,
      type: first.type,
      type_name: first.question_type?.name || first.type,
      difficulty: first.difficulty,
      bloom_level: first.bloom_level,
      marks: first.marks,
      status: first.status,
      items: rows.map((row) => ({
        id: row.id,
        word: row.question,
        answer: row.answer || "",
      })),
    };
  } catch (err) {
    ui.showSnackbar(
      err.response?.data?.message || "Failed to load language questions",
      "error",
    );
  } finally {
    loading.value = false;
  }
};

const addRow = () => {
  form.value.items.push({
    id: null,
    word: "",
    answer: "",
  });
};

const removeRow = (index) => {
  form.value.items.splice(index, 1);
};

const save = async () => {
  const validItems = form.value.items.filter(
    (item) => item.word && item.word.trim() !== "",
  );

  if (!validItems.length) {
    ui.showSnackbar("Please add at least one word", "warning");
    return;
  }

  saving.value = true;

  try {
    await api.put("/language-questions/group", {
      grade_id: form.value.grade_id,
      subject_id: form.value.subject_id,
      lesson_id: form.value.lesson_id,
      type: form.value.type,
      difficulty: form.value.difficulty,
      bloom_level: form.value.bloom_level,
      marks: form.value.marks,
      status: form.value.status,
      items: validItems,
    });

    ui.showSnackbar("Language questions updated successfully");

    router.push({ name: "questions.index" });
  } catch (err) {
    ui.showSnackbar(
      err.response?.data?.message || "Failed to update language questions",
      "error",
    );
  } finally {
    saving.value = false;
  }
};

onMounted(fetchGroup);
</script>

<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">
          Edit Language Questions
        </h1>

        <p class="text-grey">
          Update grouped words, meanings, sentences or difficult words.
        </p>
      </div>

      <v-btn variant="outlined" @click="router.back()">
        Back
      </v-btn>
    </div>

    <v-card v-if="loading" class="pa-6 rounded-xl">
      Loading...
    </v-card>

    <v-card v-else class="pa-4 rounded-xl" elevation="0">
      <v-row>
        <v-col cols="12" md="3">
          <v-text-field
            :model-value="form.type_name"
            label="Question Type"
            readonly
            variant="outlined"
          />
        </v-col>

        <v-col cols="12" md="3">
          <v-select
            v-model="form.difficulty"
            :items="['easy', 'medium', 'hard']"
            label="Difficulty"
            variant="outlined"
          />
        </v-col>

        <v-col cols="12" md="3">
          <v-select
            v-model="form.bloom_level"
            :items="['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create']"
            label="Bloom Level"
            clearable
            variant="outlined"
          />
        </v-col>

        <v-col cols="12" md="3">
          <v-text-field
            v-model="form.marks"
            type="number"
            label="Marks"
            variant="outlined"
          />
        </v-col>
      </v-row>

      <v-divider class="my-4" />

      <div class="d-flex justify-space-between align-center mb-4">
        <div class="text-h6 font-weight-bold">
          Items
        </div>

        <v-btn
          color="primary"
          variant="tonal"
          prepend-icon="mdi-plus"
          @click="addRow"
        >
          Add Row
        </v-btn>
      </div>

      <v-row
        v-for="(item, index) in form.items"
        :key="item.id || index"
        class="align-center"
      >
        <v-col cols="12" md="5">
          <v-text-field
            v-model="item.word"
            label="Word"
            variant="outlined"
          />
        </v-col>

        <v-col
          v-if="form.type !== 'difficult_words'"
          cols="12"
          md="5"
        >
          <v-text-field
            v-model="item.answer"
            :label="form.type === 'make_sentence' ? 'Sentence' : 'Meaning'"
            variant="outlined"
          />
        </v-col>

        <v-col cols="12" md="2">
          <v-btn
            icon="mdi-delete"
            color="error"
            variant="text"
            :disabled="form.items.length === 1"
            @click="removeRow(index)"
          />
        </v-col>
      </v-row>

      <v-card-actions class="px-0">
        <v-spacer />

        <v-btn variant="text" @click="router.back()">
          Cancel
        </v-btn>

        <v-btn color="primary" :loading="saving" @click="save">
          Update
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>