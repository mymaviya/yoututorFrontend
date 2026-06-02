<script setup>
import { ref, onMounted } from "vue";
import api from "../../../plugins/api";

const loading = ref(false);
const routes = ref([]);

const headers = [
  { title: "Name", key: "name" },
  { title: "URI", key: "uri" },
  { title: "Methods", key: "methods" },
  { title: "Action", key: "action" },
];

const fetchRoutes = async () => {
  loading.value = true;

  try {
    const res = await api.get("/app-routes");
    routes.value = res.data;
  } finally {
    loading.value = false;
  }
};

onMounted(fetchRoutes);
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-h4 font-weight-bold">
        App Routes
      </h1>

      <p class="text-grey">
        View all registered Laravel backend routes.
      </p>
    </div>

    <v-card class="rounded-xl" elevation="0">
      <v-data-table
        :headers="headers"
        :items="routes"
        :loading="loading"
      >
        <template #item.methods="{ item }">
          <v-chip
            v-for="method in item.methods"
            :key="method"
            size="small"
            class="mr-1"
            color="primary"
            variant="tonal"
          >
            {{ method }}
          </v-chip>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>