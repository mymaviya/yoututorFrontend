<template>
  <v-alert
    v-if="showWarning"
    :color="alertColor"
    variant="tonal"
    density="comfortable"
    class="ma-4"
    rounded="lg"
    border="start"
  >
    <div class="d-flex flex-wrap align-center ga-3">
      <div>
        <strong>{{ title }}</strong>
        <div class="text-body-2">
          {{ message }}
        </div>
      </div>

      <v-spacer />

      <v-btn
        color="primary"
        size="small"
        rounded="lg"
        to="/pricing"
      >
        Renew Now
      </v-btn>
    </div>
  </v-alert>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import api from '../../plugins/api'

const status = ref(null)

const fetchStatus = async () => {
  try {
    const response = await api.get('/my-subscription-status')
    status.value = response.data.data
  } catch (error) {
    console.error(error)
  }
}

const showWarning = computed(() => {
  if (!status.value) return false

  if (status.value.show_subscription_alert === false) {
    return false
  }
  
  return (
    !status.value.has_subscription ||
    status.value.days_left <= 7
  )
})

const alertColor = computed(() => {
  if (!status.value?.has_subscription) return 'error'
  if (status.value.days_left <= 3) return 'error'
  return 'warning'
})

const title = computed(() => {
  if (!status.value?.has_subscription) {
    return 'No Active Subscription'
  }

  if (status.value.status === 'trial') {
    return `Free Demo: ${status.value.days_left} days left`
  }

  return `Subscription: ${status.value.days_left} days left`
})

const message = computed(() => {
  if (!status.value?.has_subscription) {
    return 'Please activate or renew your subscription to continue using the ERP.'
  }

  return `${status.value.plan_name} plan will expire on ${formatDate(status.value.ends_at)}.`
})

const formatDate = (date) => {
  if (!date) return 'N/A'

  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

onMounted(fetchStatus)
</script>