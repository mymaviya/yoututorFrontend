<template>
  <div class="setup-page">
    <v-card class="hero-card mb-6" rounded="xl" elevation="0">
      <v-card-text class="pa-6 pa-md-8">
        <div class="d-flex flex-wrap align-center justify-space-between ga-4">
          <div class="d-flex align-center ga-3">
            <v-avatar color="indigo" variant="tonal" size="46"><v-icon>mdi-door-open</v-icon></v-avatar>
            <div><h1 class="text-h4 font-weight-bold">Rooms & Learning Spaces</h1><p class="text-body-2 text-medium-emphasis mb-0">Manage classrooms, laboratories and special spaces used during timetable generation.</p></div>
          </div>
          <v-btn color="primary" size="large" rounded="lg" prepend-icon="mdi-plus" @click="openCreate">Add Room</v-btn>
        </div>
      </v-card-text>
    </v-card>

    <v-row class="mb-2">
      <v-col v-for="card in summaryCards" :key="card.label" cols="6" md="3">
        <v-card rounded="xl" elevation="0" border><v-card-text class="d-flex align-center ga-3"><v-avatar :color="card.color" variant="tonal"><v-icon>{{ card.icon }}</v-icon></v-avatar><div><div class="text-h5 font-weight-bold">{{ card.value }}</div><div class="text-caption text-medium-emphasis">{{ card.label }}</div></div></v-card-text></v-card>
      </v-col>
    </v-row>

    <v-card rounded="xl" elevation="0" border>
      <v-card-text class="pa-4">
        <v-row align="center">
          <v-col cols="12" md="5"><v-text-field v-model="search" label="Search by name or code" prepend-inner-icon="mdi-magnify" variant="outlined" density="comfortable" hide-details clearable /></v-col>
          <v-col cols="6" md="3"><v-select v-model="typeFilter" :items="roomTypes" label="Room type" variant="outlined" density="comfortable" hide-details clearable /></v-col>
          <v-col cols="6" md="2"><v-select v-model="statusFilter" :items="statusOptions" label="Status" variant="outlined" density="comfortable" hide-details clearable /></v-col>
          <v-col cols="12" md="2" class="d-flex justify-end"><v-btn variant="tonal" prepend-icon="mdi-refresh" :loading="loading" @click="load">Refresh</v-btn></v-col>
        </v-row>
      </v-card-text>
      <v-divider />
      <v-skeleton-loader v-if="loading" type="table-heading, table-row@5" />
      <v-data-table v-else :headers="headers" :items="items" :items-per-page="10" hover>
        <template #item.name="{ item }"><div class="py-2"><div class="font-weight-bold">{{ item.name }}</div><div class="text-caption text-medium-emphasis">{{ item.code || 'No room code' }}</div></div></template>
        <template #item.room_type="{ item }"><v-chip size="small" variant="tonal" :color="typeMeta(item.room_type).color"><v-icon start size="16">{{ typeMeta(item.room_type).icon }}</v-icon>{{ typeMeta(item.room_type).title }}</v-chip></template>
        <template #item.capacity="{ item }"><span>{{ item.capacity || '—' }}</span></template>
        <template #item.supported_subject_ids="{ item }"><v-chip size="small" variant="outlined">{{ item.supported_subject_ids?.length || 0 }} subjects</v-chip></template>
        <template #item.is_active="{ item }"><v-chip size="small" :color="item.is_active ? 'success' : 'default'" variant="tonal">{{ item.is_active ? 'Available' : 'Inactive' }}</v-chip></template>
        <template #item.actions="{ item }"><div class="d-flex justify-end ga-1"><v-btn icon="mdi-pencil-outline" size="small" variant="text" @click="openEdit(item)" /><v-btn :icon="item.is_active ? 'mdi-pause-circle-outline' : 'mdi-play-circle-outline'" size="small" variant="text" :color="item.is_active ? 'warning' : 'success'" @click="toggleStatus(item)" /><v-btn icon="mdi-delete-outline" size="small" variant="text" color="error" @click="confirmDelete(item)" /></div></template>
        <template #no-data><div class="text-center py-12"><v-icon size="52" color="medium-emphasis">mdi-door-closed</v-icon><div class="text-h6 mt-3">No rooms configured</div><div class="text-body-2 text-medium-emphasis mb-4">Add classrooms and laboratories before assigning spaces automatically.</div><v-btn color="primary" prepend-icon="mdi-plus" @click="openCreate">Add Room</v-btn></div></template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="680" persistent>
      <v-card rounded="xl">
        <v-card-title class="d-flex align-center justify-space-between pa-5"><div><div>{{ editingId ? 'Edit Room' : 'Add Room' }}</div><div class="text-caption text-medium-emphasis font-weight-regular">Define capacity and subject compatibility for automatic assignment.</div></div><v-btn icon="mdi-close" variant="text" @click="dialog = false" /></v-card-title>
        <v-divider />
        <v-card-text class="pa-5"><v-form ref="formRef" @submit.prevent="save">
          <v-row><v-col cols="12" sm="8"><v-text-field v-model.trim="form.name" label="Room name" variant="outlined" :rules="requiredRules" autofocus /></v-col><v-col cols="12" sm="4"><v-text-field v-model.trim="form.code" label="Code" variant="outlined" placeholder="LAB-01" /></v-col></v-row>
          <v-row><v-col cols="12" sm="7"><v-select v-model="form.room_type" :items="roomTypes" label="Room type" variant="outlined" :rules="requiredRules" /></v-col><v-col cols="12" sm="5"><v-text-field v-model.number="form.capacity" label="Capacity" type="number" min="1" variant="outlined" prepend-inner-icon="mdi-account-group-outline" /></v-col></v-row>
          <v-autocomplete v-model="form.supported_subject_ids" :items="subjects" item-title="name" item-value="id" label="Compatible subjects" variant="outlined" multiple chips closable-chips clearable :loading="subjectsLoading" hint="Leave empty to allow all subjects." persistent-hint />
          <v-alert type="info" variant="tonal" density="compact" class="my-4">Laboratories should list only the subjects they can safely support. General classrooms may be left unrestricted.</v-alert>
          <v-switch v-model="form.is_active" color="success" label="Room is available for timetable generation" hide-details />
        </v-form></v-card-text>
        <v-divider /><v-card-actions class="pa-5"><v-spacer /><v-btn variant="text" @click="dialog = false">Cancel</v-btn><v-btn color="primary" :loading="saving" @click="save">{{ editingId ? 'Save Changes' : 'Add Room' }}</v-btn></v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="440"><v-card rounded="xl"><v-card-text class="pa-6 text-center"><v-avatar color="error" variant="tonal" size="64" class="mb-4"><v-icon size="34">mdi-delete-alert-outline</v-icon></v-avatar><div class="text-h6 font-weight-bold">Delete room?</div><p class="text-body-2 text-medium-emphasis mt-2">Rooms used by active timetable entries cannot be deleted. You can deactivate them instead.</p></v-card-text><v-card-actions class="pa-5 pt-0"><v-btn block variant="tonal" @click="deleteDialog = false">Cancel</v-btn><v-btn block color="error" :loading="deleting" @click="remove">Delete</v-btn></v-card-actions></v-card></v-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import api from '../../../plugins/api'
import timetableApi from '../../../services/timetableApi'
import { useUIStore } from '../../../stores/snackBar'

const ui = useUIStore()
const items = ref([]), subjects = ref([]), loading = ref(false), subjectsLoading = ref(false), saving = ref(false), deleting = ref(false)
const search = ref(''), typeFilter = ref(null), statusFilter = ref(null), dialog = ref(false), deleteDialog = ref(false), editingId = ref(null), selected = ref(null), formRef = ref(null)
const form = reactive({ name: '', code: '', room_type: 'classroom', capacity: null, supported_subject_ids: [], is_active: true })
const roomTypes = [
  { title: 'Classroom', value: 'classroom' }, { title: 'Laboratory', value: 'laboratory' }, { title: 'Computer Lab', value: 'computer_lab' },
  { title: 'Library', value: 'library' }, { title: 'Activity Room', value: 'activity' }, { title: 'Other', value: 'other' },
]
const statusOptions = [{ title: 'Available', value: true }, { title: 'Inactive', value: false }]
const requiredRules = [(v) => !!v || 'This field is required.']
const headers = [{ title: 'Room', key: 'name' }, { title: 'Type', key: 'room_type' }, { title: 'Capacity', key: 'capacity', align: 'center' }, { title: 'Compatibility', key: 'supported_subject_ids' }, { title: 'Status', key: 'is_active' }, { title: '', key: 'actions', sortable: false, align: 'end' }]
const summaryCards = computed(() => [
  { label: 'Total spaces', value: items.value.length, icon: 'mdi-door-open', color: 'primary' },
  { label: 'Available', value: items.value.filter(x => x.is_active).length, icon: 'mdi-check-circle', color: 'success' },
  { label: 'Laboratories', value: items.value.filter(x => ['laboratory', 'computer_lab'].includes(x.room_type)).length, icon: 'mdi-flask-outline', color: 'purple' },
  { label: 'Total capacity', value: items.value.reduce((n, x) => n + Number(x.capacity || 0), 0), icon: 'mdi-account-group', color: 'info' },
])
let timer
watch([search, typeFilter, statusFilter], () => { clearTimeout(timer); timer = setTimeout(load, 350) })

const unwrapList = (data) => data?.data?.data || data?.data || data || []
const load = async () => { loading.value = true; try { const data = await timetableApi.rooms.list({ search: search.value || undefined, room_type: typeFilter.value || undefined, is_active: statusFilter.value ?? undefined, per_page: 100 }); items.value = data?.data || data || [] } catch (e) { ui.showSnackbar(e.response?.data?.message || 'Unable to load rooms.', 'error') } finally { loading.value = false } }
const loadSubjects = async () => { subjectsLoading.value = true; try { const response = await api.get('/subjects', { params: { per_page: 500 } }); subjects.value = unwrapList(response) } catch { subjects.value = [] } finally { subjectsLoading.value = false } }
const resetForm = () => Object.assign(form, { name: '', code: '', room_type: 'classroom', capacity: null, supported_subject_ids: [], is_active: true })
const openCreate = async () => { editingId.value = null; resetForm(); dialog.value = true; if (!subjects.value.length) await loadSubjects() }
const openEdit = async (item) => { editingId.value = item.id; Object.assign(form, { name: item.name, code: item.code || '', room_type: item.room_type, capacity: item.capacity || null, supported_subject_ids: [...(item.supported_subject_ids || [])], is_active: !!item.is_active }); dialog.value = true; if (!subjects.value.length) await loadSubjects() }
const save = async () => { const result = await formRef.value?.validate(); if (!result?.valid) return; saving.value = true; try { const payload = { ...form, code: form.code || null, capacity: form.capacity || null }; editingId.value ? await timetableApi.rooms.update(editingId.value, payload) : await timetableApi.rooms.create(payload); ui.showSnackbar(editingId.value ? 'Room updated.' : 'Room added.'); dialog.value = false; await load() } catch (e) { ui.showSnackbar(e.response?.data?.message || Object.values(e.response?.data?.errors || {}).flat()[0] || 'Unable to save room.', 'error') } finally { saving.value = false } }
const toggleStatus = async (item) => { try { item.is_active ? await timetableApi.rooms.deactivate(item.id) : await timetableApi.rooms.activate(item.id); ui.showSnackbar(`Room ${item.is_active ? 'deactivated' : 'activated'}.`); await load() } catch (e) { ui.showSnackbar(e.response?.data?.message || 'Unable to update room status.', 'error') } }
const confirmDelete = (item) => { selected.value = item; deleteDialog.value = true }
const remove = async () => { deleting.value = true; try { await timetableApi.rooms.remove(selected.value.id); ui.showSnackbar('Room deleted.'); deleteDialog.value = false; await load() } catch (e) { ui.showSnackbar(e.response?.data?.message || Object.values(e.response?.data?.errors || {}).flat()[0] || 'Unable to delete room.', 'error') } finally { deleting.value = false } }
const typeMeta = (type) => ({ classroom: { title: 'Classroom', icon: 'mdi-google-classroom', color: 'primary' }, laboratory: { title: 'Laboratory', icon: 'mdi-flask-outline', color: 'purple' }, computer_lab: { title: 'Computer Lab', icon: 'mdi-desktop-classic', color: 'indigo' }, library: { title: 'Library', icon: 'mdi-bookshelf', color: 'brown' }, activity: { title: 'Activity Room', icon: 'mdi-basketball', color: 'orange' }, other: { title: 'Other', icon: 'mdi-door', color: 'grey' } }[type] || { title: type, icon: 'mdi-door', color: 'grey' })
onMounted(load)
</script>

<style scoped>
.hero-card { background: linear-gradient(135deg, rgba(var(--v-theme-indigo), .14), rgba(var(--v-theme-primary), .05)); border: 1px solid rgba(var(--v-theme-primary), .14); }
.setup-page :deep(.v-data-table__tr:hover) { background: rgba(var(--v-theme-primary), .035); }
</style>
