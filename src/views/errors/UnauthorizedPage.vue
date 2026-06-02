<template>
  <v-container class="fill-height">
    <v-row justify="center" align="center">
      <v-col cols="12" md="6" class="text-center">
        <v-icon size="96" color="error">mdi-lock-alert</v-icon>

        <h1 class="text-h4 font-weight-bold mt-4">
          Unauthorized
        </h1>

        <p class="text-grey mt-2">
          You do not have permission to access this page.
        </p>

        <v-btn color="primary" class="mt-4" @click="$router.push('/dashboard')">
          Back to Dashboard
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>