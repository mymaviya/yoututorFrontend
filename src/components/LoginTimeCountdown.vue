<script setup>
import { ref, computed, onBeforeUnmount, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const props = defineProps({
  endTime: {
    type: String,
    default: null,
  },
});

const router = useRouter();
const auth = useAuthStore();

const remainingSeconds = ref(null);
const dialog = ref(false);
const logoutCounter = ref(5);

let countdownTimer = null;
let logoutTimer = null;

const getEndDateTime = () => {
  if (!props.endTime) return null;

  const parts = props.endTime.split(":").map(Number);

  const hours = parts[0] || 0;
  const minutes = parts[1] || 0;
  const seconds = parts[2] || 0;

  const end = new Date();
  end.setHours(hours, minutes, seconds, 0);

  return end;
};

const updateCountdown = () => {
  const end = getEndDateTime();

  if (!end) return;

  const now = new Date();

  remainingSeconds.value = Math.floor((end.getTime() - now.getTime()) / 1000);

  if (remainingSeconds.value <= 0 && !dialog.value) {
    startLogoutDialog();
  }
};

const startTimer = () => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
  }

  updateCountdown();

  countdownTimer = setInterval(() => {
    updateCountdown();
  }, 1000);
};

const showCountdown = computed(() => {
  return (
    remainingSeconds.value !== null &&
    remainingSeconds.value > 0 &&
    remainingSeconds.value <= 3600
  );
});

const formattedTime = computed(() => {
  if (!remainingSeconds.value || remainingSeconds.value <= 0) {
    return "00:00";
  }

  const hours = Math.floor(remainingSeconds.value / 3600);
  const minutes = Math.floor((remainingSeconds.value % 3600) / 60);
  const seconds = remainingSeconds.value % 60;

  let text = "";

  if (hours > 0) {text += `${hours}h `; }

  if (minutes > 0) {text += `${minutes}m `; }

  text += `${String(seconds).padStart(2, "0")}s`;

  return text.trim();
  
});

const startLogoutDialog = () => {
  if (dialog.value) return;

  dialog.value = true;
  logoutCounter.value = 5;

  if (countdownTimer) {
    clearInterval(countdownTimer);
  }

  logoutTimer = setInterval(async () => {
    logoutCounter.value--;

    if (logoutCounter.value <= 0) {
      clearInterval(logoutTimer);

      await auth.logout();

      router.push("/login");
    }
  }, 1000);
};

watch(
  () => props.endTime,
  (newValue) => {
    if (newValue) {
      startTimer();
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
  }

  if (logoutTimer) {
    clearInterval(logoutTimer);
  }
});
</script>

<template>
  <div>
    <v-chip
      v-if="showCountdown"
      color="warning"
      variant="tonal"
      prepend-icon="mdi-clock-outline"
    >
      System Logout in {{ formattedTime }}
    </v-chip>

    <v-dialog v-model="dialog" persistent max-width="420">
      <v-card class="rounded-xl">
        <v-card-title class="text-error"> Login Time Ended </v-card-title>

        <v-card-text>
          Your allowed login time has ended. You will be logged out in
          <strong>{{ logoutCounter }}</strong>
          seconds.
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn color="error" variant="tonal"> Logging out... </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
