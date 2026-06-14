<template>
  <v-app-bar
    elevation="0"
    color="white"
    height="80"
    class="border-b"
  >
    <v-container class="d-flex align-center">
      <!-- Logo -->
      <router-link
        to="/"
        class="d-flex align-center text-decoration-none"
      >
        <v-img
          src="/logo.png"
          width="50"
          height="50"
          contain
          class="mr-3"
        />

        <div>
          <div class="text-h6 font-weight-bold text-primary">
            YouTutor ERP
          </div>

          <div class="text-caption">
            Assessment Management Platform
          </div>
        </div>
      </router-link>

      <v-spacer />

      <v-btn variant="text" to="/">
        Home
      </v-btn>

      <v-btn variant="text" to="/pricing">
        Pricing
      </v-btn>

      <v-btn variant="text" to="/contact">
        Contact
      </v-btn>

      <v-btn
        color="primary"
        rounded="lg"
        class="ml-4"
      >
        Free Demo
      </v-btn>
    </v-container>
  </v-app-bar>
</template>