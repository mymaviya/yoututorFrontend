<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import api from "../../plugins/api";
import { useAuthStore } from "../../stores/auth";
import { useUIStore } from "../../stores/snackBar";

const router = useRouter();
const auth = useAuthStore();
const ui = useUIStore();

const loading = ref(false);

const form = reactive({
  password: "",
  password_confirmation: "",
});

const submit = async () => {
  loading.value = true;

  try {
    await api.post("/change-first-password", form);

    ui.showSnackbar("Password changed successfully.", "success");

    await auth.fetchUser();

    router.replace({
      name: auth.user?.dashboard_route || "Dashboard",
    });
  } catch (error) {
    ui.showSnackbar(
      error.response?.data?.message || "Failed to change password",
      "error"
    );
  } finally {
    loading.value = false;
  }
};
</script>
<template>
  <v-container class="fill-height">
    <v-row justify="center" align="center">
      <v-col cols="12" md="5">
        <v-card class="pa-6 rounded-xl">
          <v-card-title class="text-h5 font-weight-bold">
            Change Password
          </v-card-title>

          <v-card-text>
            <v-alert type="warning" variant="tonal" class="mb-4">
              You are logging in for the first time. Please change your password to continue.
            </v-alert>

            <v-form @submit.prevent="submit">
              <v-text-field
                v-model="form.password"
                label="New Password"
                type="password"
                variant="outlined"
              />

              <v-text-field
                v-model="form.password_confirmation"
                label="Confirm Password"
                type="password"
                variant="outlined"
              />

              <v-btn
                block
                color="primary"
                type="submit"
                :loading="loading"
              >
                Change Password
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

