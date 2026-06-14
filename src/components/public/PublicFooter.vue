<template>
  <footer class="footer">
    <v-container>
      <v-row>
        <v-col cols="12" md="4">
          <div class="d-flex align-center mb-4">
            <v-img
              src="/logo.png"
              width="45"
              height="45"
              class="mr-3"
            />

            <div>
              <div class="text-h6 font-weight-bold">
                YouTutor ERP
              </div>

              <div class="text-caption">
                Assessment Management Platform
              </div>
            </div>
          </div>

          <p class="text-body-2">
            Complete solution for Question Bank Management,
            Blueprint Management, Bloom's Taxonomy,
            Teacher Tasks and Auto Question Paper Generation.
          </p>
        </v-col>

        <v-col cols="12" md="2">
          <h4 class="mb-4">Links</h4>

          <div class="mb-2">
            <router-link to="/">Home</router-link>
          </div>

          <div class="mb-2">
            <router-link to="/pricing">Pricing</router-link>
          </div>

          <div class="mb-2">
            <router-link to="/contact">Contact</router-link>
          </div>
        </v-col>

        <v-col cols="12" md="3">
          <h4 class="mb-4">Features</h4>

          <div class="mb-2">Question Bank</div>
          <div class="mb-2">Blueprint Management</div>
          <div class="mb-2">Bloom Taxonomy</div>
          <div class="mb-2">Auto Paper Generator</div>
        </v-col>

        <v-col cols="12" md="3">
          <h4 class="mb-4">Contact</h4>

          <div class="mb-2">
            Maviya IT Services
          </div>

          <div class="mb-2">
            contact@yoututor.in
          </div>

          <div class="mb-2">
            Lucknow, Uttar Pradesh
          </div>
        </v-col>
      </v-row>

      <v-divider class="my-5" />

      <div class="text-center text-caption">
        © {{ new Date().getFullYear() }}
        YouTutor ERP. All Rights Reserved.
      </div>
    </v-container>
  </footer>
</template>

<style scoped>
.footer {
  background: #0f172a;
  color: white;
  padding: 60px 0 20px;
}

.footer a {
  color: white;
  text-decoration: none;
}
</style>