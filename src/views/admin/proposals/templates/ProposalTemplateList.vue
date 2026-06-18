<template>
  <v-container fluid>
    <v-card elevation="2">
      <v-card-title class="d-flex align-center justify-space-between">
        <div>
          <h2 class="text-h5 font-weight-bold">Proposal Templates</h2>
          <p class="text-body-2 text-medium-emphasis mb-0">
            Create and manage reusable proposal templates
          </p>
        </div>

        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          to="/admin/proposal-templates/create"
        >
          Create Template
        </v-btn>
      </v-card-title>

      <v-divider />

      <v-card-text>
        <v-text-field
          v-model="search"
          label="Search template..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="comfortable"
          clearable
          class="mb-4"
        />

        <v-data-table
          :headers="headers"
          :items="filteredTemplates"
          :loading="loading"
          item-value="id"
        >
          <template #item.name="{ item }">
            <strong>{{ item.name }}</strong>
          </template>

          <template #item.is_active="{ item }">
            <v-chip :color="item.is_active ? 'success' : 'error'" size="small" variant="flat">
              {{ item.is_active ? 'Active' : 'Inactive' }}
            </v-chip>
          </template>

          <template #item.actions="{ item }">
            <v-btn
              icon
              size="small"
              variant="text"
              color="primary"
              @click="$router.push(`/admin/proposal-templates/${item.id}/edit`)"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import proposalService from '../../../../services/proposalService'
import { useUIStore } from '../../../../stores/snackBar'

const ui = useUIStore()

const loading = ref(false)
const search = ref('')
const templates = ref([])

const headers = [
  { title: 'Name', key: 'name' },
  { title: 'Project Type', key: 'project_type' },
  { title: 'Sections', key: 'sections_count' },
  { title: 'Sort', key: 'sort_order' },
  { title: 'Status', key: 'is_active' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
]

const filteredTemplates = computed(() => {
  if (!search.value) return templates.value

  const keyword = search.value.toLowerCase()

  return templates.value.filter((item) => {
    return (
      item.name?.toLowerCase().includes(keyword) ||
      item.project_type?.toLowerCase().includes(keyword)
    )
  })
})

const fetchTemplates = async () => {
  loading.value = true

  try {
    const response = await proposalService.getTemplates()
    templates.value = response.data.data || []
  } catch (error) {
    ui.showSnackbar?.('Failed to load proposal templates.', 'error')
    console.error(error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchTemplates)
</script>