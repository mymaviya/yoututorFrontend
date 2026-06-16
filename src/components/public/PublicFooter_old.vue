<template>
  <footer class="public-footer">
    <v-container>
      <v-row>
        <v-col cols="12" md="4">
          <div class="d-flex align-center mb-4">
            <v-avatar rounded="lg" size="52" class="footer-logo mr-3">
              <v-img :src="settings?.site_logo || '/logo.png'" contain />
            </v-avatar>

            <div>
              <div class="text-h6 font-weight-black">
                {{ settings?.site_name || 'YouTutor ERP' }}
              </div>
              <div class="text-caption footer-muted">
                {{ settings?.site_tagline || 'Assessment Management Platform' }}
              </div>
            </div>
          </div>

          <p class="footer-muted footer-desc">
            A complete SaaS platform for question bank management, blueprint-based
            question paper generation, Bloom's Taxonomy, teacher tasks and academic reports.
          </p>

          <div class="d-flex ga-2 mt-4">
            <v-btn
              v-if="settings?.facebook_url"
              icon="mdi-facebook"
              size="small"
              variant="tonal"
              :href="settings.facebook_url"
              target="_blank"
            />

            <v-btn
              v-if="settings?.linkedin_url"
              icon="mdi-linkedin"
              size="small"
              variant="tonal"
              :href="settings.linkedin_url"
              target="_blank"
            />

            <v-btn
              v-if="settings?.youtube_url"
              icon="mdi-youtube"
              size="small"
              variant="tonal"
              :href="settings.youtube_url"
              target="_blank"
            />
          </div>
        </v-col>

        <v-col cols="12" sm="6" md="2">
          <h4 class="footer-heading">Quick Links</h4>

          <router-link v-for="link in quickLinks" :key="link.to" :to="link.to" class="footer-link">
            {{ link.label }}
          </router-link>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <h4 class="footer-heading">Legal</h4>

          <router-link v-for="link in legalLinks" :key="link.to" :to="link.to" class="footer-link">
            {{ link.label }}
          </router-link>
        </v-col>

        <v-col cols="12" md="3">
          <h4 class="footer-heading">Contact</h4>

          <div class="footer-contact">
            <v-icon size="18">mdi-domain</v-icon>
            <span>{{ settings?.company_name || 'Maviya IT Services' }}</span>
          </div>

          <div class="footer-contact">
            <v-icon size="18">mdi-email</v-icon>
            <span>{{ settings?.contact_email || 'mhmasti@gmail.com' }}</span>
          </div>

          <div v-if="settings?.contact_phone" class="footer-contact">
            <v-icon size="18">mdi-phone</v-icon>
            <span>{{ settings.contact_phone }}</span>
          </div>

          <div class="footer-contact">
            <v-icon size="18">mdi-map-marker</v-icon>
            <span>{{ settings?.business_address || 'Siddharth Nagar, Uttar Pradesh' }}</span>
          </div>
        </v-col>
      </v-row>

      <v-divider class="my-6" />

      <div class="footer-bottom">
        <span>
          © {{ currentYear }}
          {{ settings?.site_name || 'YouTutor ERP' }}
          by {{ settings?.company_name || 'Maviya IT Services' }}.
          All Rights Reserved.
        </span>

        <span class="footer-muted">
          Built for modern schools and institutions.
        </span>
      </div>
    </v-container>
  </footer>
</template>

<script setup>
import { onMounted } from 'vue'
import { useSettings } from '../../composables/useSettings'

const currentYear = new Date().getFullYear()

const { settings, fetchSettings } = useSettings()

const quickLinks = [
  { label: 'Home', to: '/' },
  { label: 'About Us', to: '/about' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Contact Us', to: '/contact' },
  { label: 'Subscribe', to: '/checkout' },
]

const legalLinks = [
  { label: 'Terms & Conditions', to: '/terms-and-conditions' },
  { label: 'Privacy Policy', to: '/privacy-policy' },
  { label: 'Refund Policy', to: '/refund-policy' },
  { label: 'Shipping Policy', to: '/shipping-policy' },
]

onMounted(fetchSettings)
</script>

<style scoped>
.public-footer {
  background:
    radial-gradient(circle at top left, rgba(var(--v-theme-primary), 0.18), transparent 30%),
    rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  padding: 70px 0 26px;
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.footer-logo {
  background: rgba(var(--v-theme-primary), 0.12);
  border: 1px solid rgba(var(--v-theme-primary), 0.25);
}

.footer-heading {
  margin-bottom: 18px;
  font-weight: 900;
}

.footer-link {
  display: block;
  color: rgba(var(--v-theme-on-surface), 0.7);
  text-decoration: none;
  margin-bottom: 12px;
  transition: 0.2s;
}

.footer-link:hover {
  color: rgb(var(--v-theme-primary));
  transform: translateX(4px);
}

.footer-muted {
  color: rgba(var(--v-theme-on-surface), 0.66);
}

.footer-desc {
  line-height: 1.8;
  max-width: 380px;
}

.footer-contact {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 14px;
  color: rgba(var(--v-theme-on-surface), 0.75);
  font-size: 14px;
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 14px;
  font-size: 13px;
  color: rgba(var(--v-theme-on-surface), 0.76);
}
</style>