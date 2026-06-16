<template>
  <v-container fluid class="expired-page">
    <v-row align="center" justify="center" class="fill-height">
      <v-col cols="12" md="7" lg="5">
        <v-card rounded="xl" elevation="8" class="pa-8 text-center">
          <v-avatar color="error" size="72" class="mb-5">
            <v-icon color="white" size="40">mdi-lock-alert</v-icon>
          </v-avatar>

          <h1 class="text-h4 font-weight-bold mb-3">
            Subscription Expired
          </h1>

          <p class="text-body-1 text-medium-emphasis mb-6">
            Your free demo or subscription plan has expired. Please renew your plan to continue using the ERP.
          </p>

          <div class="d-flex flex-wrap justify-center ga-3">
            <v-btn color="primary" size="large" rounded="lg" to="/pricing">
              View Plans
            </v-btn>

            <v-btn color="secondary" size="large" rounded="lg" variant="outlined" to="/contact">
              Contact Support
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.expired-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #fff1f2, #eef2ff);
}
</style>