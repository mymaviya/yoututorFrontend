<template>
  <a
    :href="whatsAppUrl"
    class="whatsapp-float"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Ask a quick query on WhatsApp"
  >
    <span class="whatsapp-pulse"></span>
    <v-icon size="30" color="white">mdi-whatsapp</v-icon>
    <span class="whatsapp-label d-none d-sm-inline">Quick Query</span>
  </a>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useSettings } from '../../composables/useSettings'

const { settings, fetchSettings } = useSettings()

const normalizedPhone = computed(() => {
  const rawPhone = settings.value?.contact_phone || import.meta.env.VITE_PUBLIC_WHATSAPP_NUMBER || '919999999999'
  const digits = String(rawPhone).replace(/\D/g, '')

  if (digits.length === 10) {
    return `91${digits}`
  }

  return digits || '919999999999'
})

const whatsAppUrl = computed(() => {
  const message = encodeURIComponent(
    `Hello, I want to know more about ${settings.value?.site_name || 'YouTutor ERP'} and the 15 days free demo.`
  )

  return `https://wa.me/${normalizedPhone.value}?text=${message}`
})

onMounted(() => {
  fetchSettings()
})
</script>

<style scoped>
.whatsapp-float {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 1006;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 58px;
  padding: 0 18px;
  border-radius: 999px;
  color: #fff;
  text-decoration: none;
  background: linear-gradient(135deg, #25d366, #128c7e);
  box-shadow: 0 18px 36px rgba(18, 140, 126, 0.36);
  isolation: isolate;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.whatsapp-float:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 22px 44px rgba(18, 140, 126, 0.45);
}

.whatsapp-label {
  font-size: 14px;
  font-weight: 850;
  letter-spacing: 0.2px;
}

.whatsapp-pulse {
  position: absolute;
  inset: -7px;
  z-index: -1;
  border-radius: inherit;
  background: rgba(37, 211, 102, 0.25);
  animation: whatsappPulse 1.8s ease-out infinite;
}

@keyframes whatsappPulse {
  0% {
    opacity: 0.85;
    transform: scale(0.92);
  }

  100% {
    opacity: 0;
    transform: scale(1.22);
  }
}

@media (max-width: 600px) {
  .whatsapp-float {
    right: 18px;
    bottom: 18px;
    width: 58px;
    min-height: 58px;
    justify-content: center;
    padding: 0;
  }
}
</style>
