<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/auth";
import { useUIStore } from "../../stores/snackBar";

const ui = useUIStore();
const email = ref("");
const password = ref("");
const remember = ref("");
const loading = ref(false);
const errors = ref({});

const router = useRouter();
const auth = useAuthStore();
const showPassword = ref(false);

const login = async () => {
  loading.value = true;

  try {
    const result = await auth.login({
      email: email.value,
      password: password.value,
      remember: remember.value,
    });

    if (!result.success) {
      ui.showSnackbar(
        result.message || "Login failed",
        result.code === "USER_ALREADY_LOGGED_IN" ? "warning" : "error",
      );
      return;
    }

    ui.showSnackbar("Login successful", "success");

    if (auth.user?.password_change_required) {
      router.replace({ name: "change.first.password" });
      return;
    }

    router.replace({
      name: auth.user?.dashboard_route || "Dashboard",
    });

    router.replace(
      auth.user?.dashboard_route
        ? { name: auth.user.dashboard_route }
        : { name: "Dashboard" },
    );
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <v-card width="440" class="pa-8 rounded-xl" elevation="10">
    <v-alert
      v-if="errors.general"
      type="warning"
      variant="tonal"
      border="start"
      class="mb-4"
    >
      {{ errors.general }}
    </v-alert>
    <div class="text-center mb-6">
      <v-avatar color="primary" size="64" class="mb-3">
        <v-icon size="34">mdi-lock</v-icon>
      </v-avatar>

      <h2 class="text-h5 font-weight-bold">Welcome Back</h2>

      <p class="text-grey">Login to continue to your dashboard</p>
    </div>

    <v-text-field
      v-model="email"
      label="Email Address"
      prepend-inner-icon="mdi-email"
      variant="outlined"
      :error-messages="errors.email"
    />

    <v-text-field
      v-model="password"
      label="Password"
      prepend-inner-icon="mdi-lock"
      :type="showPassword ? 'text' : 'password'"
      :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
      variant="outlined"
      :error-messages="errors.password"
      @keyup.enter="login"
      @click:append-inner="showPassword = !showPassword"
    />

    <div class="d-flex justify-space-between align-center mb-4">
      <v-checkbox
        v-model="remember"
        label="Remember me"
        density="compact"
        hide-details
      />

      <router-link to="/forgot-password" class="text-primary">
        Forgot password?
      </router-link>
    </div>

    <v-btn
      :loading="loading"
      color="primary"
      block
      size="large"
      class="rounded-lg"
      @click="login"
    >
      Login
    </v-btn>

    <div class="text-center mt-5">
      <span class="text-grey">Don’t have an account?</span>
      <router-link to="/register" class="text-primary ml-1">
        Register
      </router-link>
    </div>
  </v-card>
</template>
