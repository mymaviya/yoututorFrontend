<template>
  <v-app>
    <!-- Main Content -->
    <v-main>
      <v-container>
        <h1>Welcome to Dashboard</h1>

        <v-row>
          <template v-for="card in cards" :key="card.title">
            <v-col cols="12" md="3">
              <StatCard :title="card.title" :value="card.value" :icon="card.icon" />
            </v-col>
          </template>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import StatCard from "../components/StatCard.vue";
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const cards = [
  { title: "Students", value: "520", icon: "mdi-account-group" },
  { title: "Teachers", value: "40", icon: "mdi-account-tie" },
  { title: "Revenue", value: "₹2.5L", icon: "mdi-currency-inr" },
  { title: "Attendance", value: "92%", icon: "mdi-chart-line" }
];

const logout = () => {
  localStorage.removeItem("auth");
  router.push("/login");
};
</script>
