<template>
  <div class="setup-page">
    <v-card class="hero-card mb-6" rounded="xl" elevation="0">
      <v-card-text class="pa-6 pa-md-8">
        <div class="d-flex flex-wrap align-center justify-space-between ga-4">
          <div>
            <div class="d-flex align-center ga-3 mb-2">
              <v-avatar color="primary" variant="tonal" size="46"><v-icon>mdi-calendar-multiple</v-icon></v-avatar>
              <div>
                <h1 class="text-h4 font-weight-bold">Timetable Templates</h1>
                <p class="text-body-2 text-medium-emphasis mb-0">Create reusable timetable structures for regular, seasonal and special schedules.</p>
              </div>
            </div>
          </div>
          <v-btn color="primary" size="large" rounded="lg" prepend-icon="mdi-plus" @click="openCreate">New Template</v-btn>
        </div>
      </v-card-text>
    </v-card>

    <v-row class="mb-2">
      <v-col v-for="card in summaryCards" :key="card.label" cols="6" md="3">
        <v-card rounded="xl" elevation="0" border>
          <v-card-text class="d-flex align-center ga-3">
            <v-avatar :color="card.color" variant="tonal"><v-icon>{{ card.icon }}</v-icon></v-avatar>
            <div><div class="text-h5 font-weight-bold">{{ card.value }}</div><div class="text-caption text-medium-emphasis">{{ card.label }}</div></div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-card rounded="xl" elevation="0" border>
      <v-card-text class="pa-4">
        <v-row align="center">
          <v-col cols="12" md="5">
            <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="Search templates" variant="outlined" density="comfortable" hide-details clearable />
          </v-col>
          <v-col cols="6" md="3">
            <v-select v-model="typeFilter" :items="templateTypes" label="Template type" variant="outlined" density="comfortable" hide-details clearable />
          </v-col>
          <v-col cols="6" md="2">
            <v-select v-model="statusFilter" :items="statusOptions" label="Status" variant="outlined" density="comfortable" hide-details clearable />
          </v-col>
          <v-col cols="12" md="2" class="d-flex justify-end">
            <v-btn variant="tonal" prepend-icon="mdi-refresh" :loading="loading" @click="load">Refresh</v-btn>
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider />
      <v-skeleton-loader v-if="loading" type="table-heading, table-row@5" />
      <v-data-table v-else :headers="headers" :items="items" :items-per-page="10" hover>
        <template #item.name="{ item }">
          <div class="py-2">
            <div class="font-weight-bold d-flex align-center ga-2">{{ item.name }}<v-chip v-if="item.is_default" size="x-small" color="primary">Default</v-chip></div>
            <div class="text-caption text-medium-emphasis">{{ formatDateRange(item) }}</div>
          </div>
        </template>
        <template #item.type="{ item }"><v-chip size="small" variant="tonal" color="info">{{ titleCase(item.type) }}</v-chip></template>
        <template #item.weekly_timetables_count="{ item }"><span class="font-weight-medium">{{ item.weekly_timetables_count || 0 }}</span></template>
        <template #item.is_active="{ item }"><v-chip size="small" :color="item.is_active ? 'success' : 'default'" variant="tonal">{{ item.is_active ? 'Active' : 'Inactive' }}</v-chip></template>
        <template #item.actions="{ item }">
          <div class="d-flex justify-end ga-1">
            <v-btn icon="mdi-pencil-outline" size="small" variant="text" @click="openEdit(item)" />
            <v-btn icon="mdi-content-copy" size="small" variant="text" @click="openDuplicate(item)" />
            <v-btn :icon="item.is_active ? 'mdi-pause-circle-outline' : 'mdi-play-circle-outline'" size="small" variant="text" :color="item.is_active ? 'warning' : 'success'" @click="toggleStatus(item)" />
            <v-btn icon="mdi-delete-outline" size="small" variant="text" color="error" @click="confirmDelete(item)" />
          </div>
        </template>
        <template #no-data>
          <div class="text-center py-12"><v-icon size="52" color="medium-emphasis">mdi-calendar-blank-outline</v-icon><div class="text-h6 mt-3">No templates found</div><div class="text-body-2 text-medium-emphasis mb-4">Create your first reusable timetable template.</div><v-btn color="primary" prepend-icon="mdi-plus" @click="openCreate">Create Template</v-btn></div>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="620" persistent>
      <v-card rounded="xl">
        <v-card-title class="d-flex align-center justify-space-between pa-5"><span>{{ dialogTitle }}</span><v-btn icon="mdi-close" variant="text" @click="dialog = false" /></v-card-title>
        <v-divider />
        <v-card-text class="pa-5">
          <v-form ref="formRef" @submit.prevent="save">
            <v-text-field v-model.trim="form.name" label="Template name" variant="outlined" :rules="requiredRules" autofocus />
            <v-select v-model="form.type" :items="templateTypes" label="Template type" variant="outlined" :rules="requiredRules" />
            <v-row><v-col cols="12" sm="6"><v-text-field v-model="form.effective_from" type="date" label="Effective from" variant="outlined" /></v-col><v-col cols="12" sm="6"><v-text-field v-model="form.effective_to" type="date" label="Effective to" variant="outlined" /></v-col></v-row>
            <v-alert type="info" variant="tonal" density="compact" class="mb-4">Default templates are preferred automatically when creating a timetable.</v-alert>
            <div class="d-flex flex-wrap ga-6"><v-switch v-model="form.is_active" color="success" label="Active" hide-details /><v-switch v-model="form.is_default" color="primary" label="Make default" hide-details /></div>
          </v-form>
        </v-card-text>
        <v-divider /><v-card-actions class="pa-5"><v-spacer /><v-btn variant="text" @click="dialog = false">Cancel</v-btn><v-btn color="primary" :loading="saving" @click="save">{{ editingId ? 'Save Changes' : duplicateSource ? 'Create Copy' : 'Create Template' }}</v-btn></v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="440">
      <v-card rounded="xl"><v-card-text class="pa-6 text-center"><v-avatar color="error" variant="tonal" size="64" class="mb-4"><v-icon size="34">mdi-delete-alert-outline</v-icon></v-avatar><div class="text-h6 font-weight-bold">Delete template?</div><p class="text-body-2 text-medium-emphasis mt-2">{{ selected?.name }} will be permanently removed if it is not used by a timetable.</p></v-card-text><v-card-actions class="pa-5 pt-0"><v-btn block variant="tonal" @click="deleteDialog = false">Cancel</v-btn><v-btn block color="error" :loading="deleting" @click="remove">Delete</v-btn></v-card-actions></v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import timetableApi from '../../../services/timetableApi'
import { useUIStore } from '../../../stores/snackBar'

const ui = useUIStore()
const items = ref([]), loading = ref(false), saving = ref(false), deleting = ref(false)
const search = ref(''), typeFilter = ref(null), statusFilter = ref(null)
const dialog = ref(false), deleteDialog = ref(false), editingId = ref(null), duplicateSource = ref(null), selected = ref(null), formRef = ref(null)
const form = reactive({ name: '', type: 'regular', effective_from: '', effective_to: '', is_active: true, is_default: false })
const templateTypes = [{ title: 'Regular', value: 'regular' }, { title: 'Summer', value: 'summer' }, { title: 'Winter', value: 'winter' }, { title: 'Exam', value: 'exam' }, { title: 'Special', value: 'special' }]
const statusOptions = [{ title: 'Active', value: true }, { title: 'Inactive', value: false }]
const requiredRules = [(v) => !!v || 'This field is required.']
const headers = [{ title: 'Template', key: 'name' }, { title: 'Type', key: 'type' }, { title: 'Timetables', key: 'weekly_timetables_count', align: 'center' }, { title: 'Status', key: 'is_active' }, { title: '', key: 'actions', sortable: false, align: 'end' }]
const summaryCards = computed(() => [
  { label: 'Total templates', value: items.value.length, icon: 'mdi-calendar-multiple', color: 'primary' },
  { label: 'Active', value: items.value.filter(x => x.is_active).length, icon: 'mdi-check-decagram', color: 'success' },
  { label: 'Default', value: items.value.filter(x => x.is_default).length, icon: 'mdi-star-circle', color: 'warning' },
  { label: 'In use', value: items.value.filter(x => Number(x.weekly_timetables_count) > 0).length, icon: 'mdi-link-variant', color: 'info' },
])
const dialogTitle = computed(() => editingId.value ? 'Edit Template' : duplicateSource.value ? 'Duplicate Template' : 'New Template')
let timer
watch([search, typeFilter, statusFilter], () => { clearTimeout(timer); timer = setTimeout(load, 350) })

const load = async () => {
  loading.value = true
  try {
    const data = await timetableApi.templates.list({ search: search.value || undefined, type: typeFilter.value || undefined, is_active: statusFilter.value ?? undefined, per_page: 100 })
    items.value = data?.data || data || []
  } catch (e) { ui.showSnackbar(e.response?.data?.message || 'Unable to load templates.', 'error') } finally { loading.value = false }
}
const resetForm = () => Object.assign(form, { name: '', type: 'regular', effective_from: '', effective_to: '', is_active: true, is_default: false })
const openCreate = () => { editingId.value = null; duplicateSource.value = null; resetForm(); dialog.value = true }
const openEdit = (item) => { editingId.value = item.id; duplicateSource.value = null; Object.assign(form, { name: item.name, type: item.type, effective_from: item.effective_from || '', effective_to: item.effective_to || '', is_active: !!item.is_active, is_default: !!item.is_default }); dialog.value = true }
const openDuplicate = (item) => { editingId.value = null; duplicateSource.value = item; Object.assign(form, { name: `${item.name} Copy`, type: item.type, effective_from: item.effective_from || '', effective_to: item.effective_to || '', is_active: true, is_default: false }); dialog.value = true }
const save = async () => {
  const result = await formRef.value?.validate(); if (!result?.valid) return
  saving.value = true
  try {
    if (editingId.value) await timetableApi.templates.update(editingId.value, { ...form })
    else if (duplicateSource.value) await timetableApi.duplicateTemplate(duplicateSource.value.id, { ...form })
    else await timetableApi.templates.create({ ...form })
    ui.showSnackbar(editingId.value ? 'Template updated.' : 'Template created.')
    dialog.value = false; await load()
  } catch (e) { ui.showSnackbar(e.response?.data?.message || Object.values(e.response?.data?.errors || {}).flat()[0] || 'Unable to save template.', 'error') } finally { saving.value = false }
}
const toggleStatus = async (item) => { try { item.is_active ? await timetableApi.templates.deactivate(item.id) : await timetableApi.templates.activate(item.id); ui.showSnackbar(`Template ${item.is_active ? 'deactivated' : 'activated'}.`); await load() } catch (e) { ui.showSnackbar(e.response?.data?.message || 'Unable to update status.', 'error') } }
const confirmDelete = (item) => { selected.value = item; deleteDialog.value = true }
const remove = async () => { deleting.value = true; try { await timetableApi.templates.remove(selected.value.id); ui.showSnackbar('Template deleted.'); deleteDialog.value = false; await load() } catch (e) { ui.showSnackbar(e.response?.data?.message || 'Unable to delete template.', 'error') } finally { deleting.value = false } }
const titleCase = (v) => String(v || '').replaceAll('_', ' ').replace(/\b\w/g, c => c.toUpperCase())
const formatDateRange = (item) => item.effective_from || item.effective_to ? `${item.effective_from || 'Any date'} – ${item.effective_to || 'No end date'}` : 'No date restriction'
onMounted(load)
</script>

<style scoped>
.hero-card { background: linear-gradient(135deg, rgba(var(--v-theme-primary), .13), rgba(var(--v-theme-secondary), .05)); border: 1px solid rgba(var(--v-theme-primary), .14); }
.setup-page :deep(.v-data-table__tr:hover) { background: rgba(var(--v-theme-primary), .035); }
</style>
