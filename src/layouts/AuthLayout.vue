<template>
  <v-app>
    <v-main class="auth-bg">
      <v-container fluid class="fill-height">
        <v-row class="fill-height">
          <v-col
            cols="12"
            md="6"
            class="d-none d-md-flex align-center justify-center auth-left"
          >
            <div class="text-center text-white px-10">
              <img
                src="../assets/images/logo.png"
                alt="School Logo"
                class="auth-logo mb-6"
                />

              <h1 class="text-h3 font-weight-bold mb-4">
                GoLearn ERP
              </h1>

              <p class="text-h6">
                Manage teachers, questions, exams, papers and reports in one smart system.
              </p>
            </div>
          </v-col>

          <v-col
            cols="12"
            md="6"
            class="d-flex align-center justify-center"
          >
            <router-view />
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
.auth-bg {
  min-height: 100vh;
  background: linear-gradient(135deg, #eef2ff, #f8fafc);
}

.auth-left {
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  border-radius: 0 40px 40px 0;
}

.auth-logo {
  width: 120px;
  height: 120px;
  object-fit: contain;
  
  padding: 12px;
  border-radius: 24px;
}

</style>