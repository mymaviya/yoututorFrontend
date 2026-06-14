<template>
  <v-container fluid class="pa-0">
    <!-- HERO SECTION -->
    <section class="hero-section">
      <v-container>
        <v-row align="center" class="py-12">
          <v-col cols="12" md="6">
            <v-chip color="primary" variant="flat" class="mb-4">
              Smart Question Paper ERP
            </v-chip>

            <h1 class="hero-title">
              Create Board Pattern Question Papers in Minutes, Not Hours
            </h1>

            <p class="hero-subtitle mt-4">
              A complete academic assessment ERP for schools to manage question banks,
              blueprints, Bloom's Taxonomy, teacher tasks, approvals, exam portions,
              and auto-generated question papers.
            </p>

            <div class="mt-6 d-flex flex-wrap ga-3">
              <v-btn
                color="primary"
                size="large"
                rounded="lg"
                to="/pricing"
              >
                View Pricing
              </v-btn>

              <v-btn
                color="secondary"
                size="large"
                rounded="lg"
                variant="outlined"
                to="/contact"
              >
                Book Free Demo
              </v-btn>
            </div>
          </v-col>

          <v-col cols="12" md="6">
            <v-card class="dashboard-card pa-6" elevation="12" rounded="xl">
              <v-row>
                <v-col cols="6">
                  <v-card color="primary" class="pa-4 text-white" rounded="lg">
                    <div class="text-h5 font-weight-bold">5000+</div>
                    <div>Questions Managed</div>
                  </v-card>
                </v-col>

                <v-col cols="6">
                  <v-card color="success" class="pa-4 text-white" rounded="lg">
                    <div class="text-h5 font-weight-bold">80%</div>
                    <div>Time Saved</div>
                  </v-card>
                </v-col>

                <v-col cols="6">
                  <v-card color="warning" class="pa-4 text-white" rounded="lg">
                    <div class="text-h5 font-weight-bold">100%</div>
                    <div>Blueprint Based</div>
                  </v-card>
                </v-col>

                <v-col cols="6">
                  <v-card color="info" class="pa-4 text-white" rounded="lg">
                    <div class="text-h5 font-weight-bold">15 Days</div>
                    <div>Free Demo</div>
                  </v-card>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- FEATURES -->
    <section class="py-12">
      <v-container>
        <div class="text-center mb-10">
          <h2 class="section-title">Powerful Features for Modern Schools</h2>
          <p class="section-subtitle">
            Everything required to create, manage, verify, and generate academic question papers.
          </p>
        </div>

        <v-row>
          <v-col
            v-for="feature in features"
            :key="feature.title"
            cols="12"
            sm="6"
            md="4"
          >
            <v-card class="feature-card h-100 pa-5" rounded="xl" elevation="3">
              <v-avatar :color="feature.color" size="54" class="mb-4">
                <v-icon color="white" size="30">
                  {{ feature.icon }}
                </v-icon>
              </v-avatar>

              <h3 class="text-h6 font-weight-bold mb-2">
                {{ feature.title }}
              </h3>

              <p class="text-body-2 text-medium-emphasis">
                {{ feature.description }}
              </p>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- HOW IT WORKS -->
    <section class="py-12 bg-grey-lighten-4">
      <v-container>
        <div class="text-center mb-10">
          <h2 class="section-title">How It Works</h2>
          <p class="section-subtitle">
            From question creation to final PDF export, everything is systematic.
          </p>
        </div>

        <v-row>
          <v-col
            v-for="(step, index) in steps"
            :key="step.title"
            cols="12"
            md="3"
          >
            <v-card class="pa-5 h-100 text-center" rounded="xl" elevation="2">
              <v-avatar color="primary" size="48" class="mb-4">
                <span class="text-white font-weight-bold">{{ index + 1 }}</span>
              </v-avatar>

              <h3 class="text-h6 font-weight-bold mb-2">
                {{ step.title }}
              </h3>

              <p class="text-body-2 text-medium-emphasis">
                {{ step.description }}
              </p>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- CTA -->
    <section class="cta-section py-12">
      <v-container>
        <v-card class="pa-8 text-center cta-card" rounded="xl" elevation="8">
          <h2 class="text-h4 font-weight-bold mb-3">
            Start Your 15 Days Free Demo
          </h2>

          <p class="text-body-1 mb-6">
            Get full access to all features and experience automated question paper generation.
          </p>

          <v-btn color="primary" size="large" rounded="lg" to="/contact">
            Request Free Demo
          </v-btn>
        </v-card>
      </v-container>
    </section>
  </v-container>
</template>

<script setup>
const features = [
  {
    title: 'Question Bank Management',
    description: 'Create, import, approve, and manage questions with type, difficulty, marks, and Bloom level.',
    icon: 'mdi-database-edit',
    color: 'primary'
  },
  {
    title: 'Blueprint Based Papers',
    description: 'Create papers strictly according to predefined section-wise and question-type-wise blueprint rules.',
    icon: 'mdi-file-document-check',
    color: 'success'
  },
  {
    title: "Bloom's Taxonomy",
    description: 'Ensure academic balance using Remember, Understand, Apply, Analyze, Evaluate, and Create levels.',
    icon: 'mdi-brain',
    color: 'deep-purple'
  },
  {
    title: 'Auto Paper Generator',
    description: 'Generate complete question papers automatically based on blueprint, marks, difficulty, and Bloom rules.',
    icon: 'mdi-auto-fix',
    color: 'orange'
  },
  {
    title: 'Teacher Task Management',
    description: 'Assign question creation tasks to teachers and monitor progress from admin dashboard.',
    icon: 'mdi-account-clock',
    color: 'info'
  },
  {
    title: 'PDF Export & Print',
    description: 'Export well-formatted question papers in PDF with sections, marks, instructions, and paper layout.',
    icon: 'mdi-file-pdf-box',
    color: 'red'
  }
]

const steps = [
  {
    title: 'Create Question Bank',
    description: 'Teachers add questions by grade, subject, lesson, type, difficulty, and Bloom level.'
  },
  {
    title: 'Approve Questions',
    description: 'Admin verifies and approves questions before they are used in final papers.'
  },
  {
    title: 'Apply Blueprint',
    description: 'Set board-pattern rules for sections, marks, question types, and distribution.'
  },
  {
    title: 'Generate Paper',
    description: 'Create manual or auto-generated papers and export final PDF instantly.'
  }
]
</script>

<style scoped>
.hero-section {
  background: linear-gradient(135deg, #e3f2fd, #f8f9ff);
}

.hero-title {
  font-size: 46px;
  font-weight: 800;
  line-height: 1.15;
}

.hero-subtitle {
  font-size: 18px;
  color: #555;
  line-height: 1.7;
}

.section-title {
  font-size: 34px;
  font-weight: 800;
}

.section-subtitle {
  font-size: 16px;
  color: #666;
  margin-top: 8px;
}

.dashboard-card {
  background: rgba(255, 255, 255, 0.95);
}

.feature-card {
  transition: 0.25s ease;
}

.feature-card:hover {
  transform: translateY(-6px);
}

.cta-section {
  background: #f7f9fc;
}

.cta-card {
  background: linear-gradient(135deg, #ffffff, #eef5ff);
}

@media (max-width: 600px) {
  .hero-title {
    font-size: 32px;
  }

  .section-title {
    font-size: 26px;
  }
}
</style>