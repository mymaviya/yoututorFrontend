<template>
    <v-container fluid class="pricing-page pa-0">
        <section class="pricing-hero py-12">
            <v-container>
                <div class="text-center">
                    <v-chip color="primary" variant="flat" class="mb-4">
                        Simple Annual Pricing
                    </v-chip>

                    <h1 class="page-title">
                        Choose the Best Plan for Your School
                    </h1>

                    <p class="page-subtitle">
                        Start with a 15 days free demo with all features enabled.
                    </p>
                </div>
            </v-container>
        </section>

        <v-container class="py-10">
            <!-- FREE DEMO -->
            <v-card class="demo-card pa-6 mb-10" rounded="xl" elevation="6">
                <v-row align="center">
                    <v-col cols="12" md="8">
                        <h2 class="text-h4 font-weight-bold mb-2">
                            15 Days Free Demo
                        </h2>

                        <p class="text-body-1 mb-0">
                            Get complete access to all features including Question Bank,
                            Blueprint Management, Bloom Distribution, Auto Paper Generator,
                            Teacher Tasks, PDF Export, and Reports.
                        </p>
                    </v-col>

                    <v-col cols="12" md="4" class="text-md-end">
                        <div class="text-h4 font-weight-bold mb-3">₹0</div>

                        <v-btn color="primary" size="large" rounded="lg" to="/contact">
                            Request Demo
                        </v-btn>
                    </v-col>
                </v-row>
            </v-card>

            <!-- PLANS -->
            <v-row>
                <v-col v-for="plan in plans" :key="plan.name" cols="12" md="4">
                    <v-card class="pricing-card h-100" :class="{ 'popular-plan': plan.popular }" rounded="xl"
                        elevation="6">
                        <div v-if="plan.popular" class="popular-badge">
                            Recommended
                        </div>

                        <v-card-text class="pa-6">
                            <h2 class="text-h5 font-weight-bold mb-1">
                                {{ plan.name }}
                            </h2>

                            <p class="text-body-2 text-medium-emphasis mb-5">
                                {{ plan.subtitle }}
                            </p>

                            <div class="price mb-1">
                                ₹{{ plan.monthlyPrice }}
                                <span class="text-body-2 font-weight-regular">/ month</span>
                            </div>

                            <div class="text-body-2 text-medium-emphasis mb-2">
                                Billed yearly at ₹{{ plan.yearlyPrice }}
                            </div>

                            <v-chip color="success" variant="tonal" size="small" class="mb-5">
                                Save ₹{{ plan.saving }} yearly
                            </v-chip>

                            <v-btn :color="plan.popular ? 'primary' : 'secondary'" block size="large" rounded="lg"
                                :variant="plan.popular ? 'flat' : 'outlined'" to="/contact">
                                Get Started
                            </v-btn>

                            <v-divider class="my-6" />

                            <div v-for="feature in plan.features" :key="feature" class="feature-item">
                                <v-icon color="success" size="20" class="mr-2">
                                    mdi-check-circle
                                </v-icon>
                                <span>{{ feature }}</span>
                            </div>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>

            <!-- ADDONS -->
            <v-card class="pa-6 mt-10" rounded="xl" elevation="3">
                <h2 class="text-h5 font-weight-bold mb-4">
                    Optional Add-ons
                </h2>

                <v-table>
                    <thead>
                        <tr>
                            <th>Service</th>
                            <th class="text-right">Charges</th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr v-for="addon in addons" :key="addon.name">
                            <td>{{ addon.name }}</td>
                            <td class="text-right font-weight-medium">{{ addon.price }}</td>
                        </tr>
                    </tbody>
                </v-table>
            </v-card>
        </v-container>
    </v-container>
</template>

<script setup>
const plans = [
  {
    name: 'Essential',
    subtitle: 'For small schools starting digital paper creation.',
    monthlyPrice: '2,499',
    yearlyPrice: '24,999',
    saving: '4,989',
    popular: false,
    features: [
      '1 School License',
      'Up to 30 Staff Users',
      'Question Bank Management',
      'Manual Question Paper Creation',
      'PDF Export',
      'Teacher Assignments',
      'Exam Portion Management',
      'Basic Reports',
      'Email Support'
    ]
  },
  {
    name: 'Professional',
    subtitle: 'Best for CBSE and ICSE schools.',
    monthlyPrice: '4,999',
    yearlyPrice: '49,999',
    saving: '9,989',
    popular: true,
    features: [
      'Unlimited Staff Users',
      'Blueprint Management',
      "Bloom's Taxonomy Distribution",
      'Difficulty Level Distribution',
      'Auto Question Paper Generator',
      'Teacher Task Monitoring',
      'Approval Workflow',
      'Question Paper History',
      'Academic Reports & Analytics',
      'Priority Support',
      'Data Backup'
    ]
  },
  {
    name: 'Enterprise',
    subtitle: 'For school groups and institutions.',
    monthlyPrice: '9,999',
    yearlyPrice: '99,999',
    saving: '19,989',
    popular: false,
    features: [
      'Multi-Campus Support',
      'Centralized Question Bank',
      'Role-Based Permissions',
      'Custom Branding',
      'Advanced Analytics Dashboard',
      'Question Bank Health Reports',
      'Academic Audit Reports',
      'API Integration',
      'Dedicated Account Manager',
      'Training Sessions',
      'WhatsApp Support',
      'Priority Feature Requests'
    ]
  }
]

const addons = [
    {
        name: 'Installation & Training',
        price: '₹10,000'
    },
    {
        name: 'Data Migration',
        price: '₹15,000'
    },
    {
        name: 'Custom Reports',
        price: '₹10,000 onwards'
    },
    {
        name: 'Custom Branding',
        price: '₹5,000'
    },
    {
        name: 'Question Bank Digitization',
        price: '₹2,000 per subject'
    },
    {
        name: 'Custom Features',
        price: 'As per requirement'
    }
]
</script>

<style scoped>
.pricing-hero {
    background: linear-gradient(135deg, #e3f2fd, #f8f9ff);
}

.page-title {
    font-size: 40px;
    font-weight: 800;
}

.page-subtitle {
    font-size: 17px;
    color: #666;
    margin-top: 10px;
}

.demo-card {
    background: linear-gradient(135deg, #ffffff, #edf6ff);
}

.pricing-card {
    position: relative;
    overflow: hidden;
    transition: 0.25s ease;
}

.pricing-card:hover {
    transform: translateY(-6px);
}

.popular-plan {
    border: 2px solid rgb(var(--v-theme-primary));
}

.popular-badge {
    position: absolute;
    top: 18px;
    right: -34px;
    background: rgb(var(--v-theme-primary));
    color: white;
    padding: 6px 40px;
    transform: rotate(35deg);
    font-size: 12px;
    font-weight: 700;
}

.price {
    font-size: 36px;
    font-weight: 800;
}

.feature-item {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    font-size: 14px;
}

@media (max-width: 600px) {
    .page-title {
        font-size: 30px;
    }
}
</style>