<template>
  <div class="setup-page">
    <v-card class="hero-card mb-6" rounded="xl" elevation="0">
      <v-card-text class="pa-6 pa-md-8">
        <div class="d-flex flex-wrap align-center justify-space-between ga-4">
          <div class="d-flex align-center ga-3">
            <v-avatar color="teal" variant="tonal" size="48">
              <v-icon>mdi-vector-combine</v-icon>
            </v-avatar>
            <div>
              <h1 class="text-h4 font-weight-bold">Parallel Groups</h1>
              <p class="text-body-2 text-medium-emphasis mb-0">
                Schedule electives, streams and split classes together in the same period.
              </p>
            </div>
          </div>
          <v-btn color="primary" size="large" rounded="lg" prepend-icon="mdi-plus" @click="openCreate">
            New Parallel Group
          </v-btn>
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
          <v-col cols="12" md="5"><v-text-field v-model="search" label="Search groups" prepend-inner-icon="mdi-magnify" variant="outlined" density="comfortable" hide-details clearable /></v-col>
          <v-col cols="6" md="3"><v-select v-model="gradeFilter" :items="grades" item-title="name" item-value="id" label="Grade" variant="outlined" density="comfortable" hide-details clearable /></v-col>
          <v-col cols="6" md="2"><v-select v-model="statusFilter" :items="statusOptions" label="Status" variant="outlined" density="comfortable" hide-details clearable /></v-col>
          <v-col cols="12" md="2" class="d-flex justify-end"><v-btn variant="tonal" prepend-icon="mdi-refresh" :loading="loading" @click="load">Refresh</v-btn></v-col>
        </v-row>
      </v-card-text>
      <v-divider />
      <v-skeleton-loader v-if="loading" type="table-heading, table-row@5" />
      <v-data-table v-else :headers="headers" :items="items" :items-per-page="10" hover>
        <template #item.name="{ item }">
          <div class="py-2"><div class="font-weight-bold">{{ item.name }}</div><div class="text-caption text-medium-emphasis">{{ item.grade?.name || `Grade #${item.grade_id}` }}</div></div>
        </template>
        <template #item.items="{ item }">
          <div class="d-flex flex-wrap ga-1 py-2">
            <v-chip v-for="groupItem in item.items || []" :key="groupItem.id || groupItem.subject_id" size="small" color="primary" variant="tonal">
              {{ groupItem.subject?.name || `Subject #${groupItem.subject_id}` }}
            </v-chip>
          </div>
        </template>
        <template #item.weekly_periods="{ item }"><strong>{{ item.weekly_periods }}</strong> / week</template>
        <template #item.same_period_required="{ item }"><v-chip size="small" :color="item.same_period_required ? 'success' : 'info'" variant="tonal">{{ item.same_period_required ? 'Same period' : 'Flexible' }}</v-chip></template>
        <template #item.is_active="{ item }"><v-chip size="small" :color="item.is_active ? 'success' : 'default'" variant="tonal">{{ item.is_active ? 'Active' : 'Inactive' }}</v-chip></template>
        <template #item.actions="{ item }"><div class="d-flex justify-end ga-1"><v-btn icon="mdi-pencil-outline" size="small" variant="text" @click="openEdit(item)" /><v-btn :icon="item.is_active ? 'mdi-pause-circle-outline' : 'mdi-play-circle-outline'" size="small" variant="text" :color="item.is_active ? 'warning' : 'success'" @click="toggleStatus(item)" /><v-btn icon="mdi-delete-outline" size="small" variant="text" color="error" @click="confirmDelete(item)" /></div></template>
        <template #no-data><div class="text-center py-12"><v-icon size="56" color="medium-emphasis">mdi-vector-combine</v-icon><div class="text-h6 mt-3">No parallel groups configured</div><p class="text-body-2 text-medium-emphasis">Create a group when multiple subjects must run together.</p><v-btn color="primary" prepend-icon="mdi-plus" @click="openCreate">Create Group</v-btn></div></template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="980" persistent scrollable>
      <v-card rounded="xl">
        <v-card-title class="d-flex align-center justify-space-between pa-5">
          <div><div>{{ editingId ? 'Edit Parallel Group' : 'Create Parallel Group' }}</div><div class="text-caption text-medium-emphasis font-weight-regular">Define the shared period and the participating subjects.</div></div>
          <v-btn icon="mdi-close" variant="text" @click="dialog = false" />
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-5">
          <v-form ref="formRef" @submit.prevent="save">
            <v-row>
              <v-col cols="12" md="5"><v-text-field v-model.trim="form.name" label="Group name" variant="outlined" :rules="requiredRules" placeholder="Example: Grade 11 Electives" /></v-col>
              <v-col cols="12" md="4"><v-select v-model="form.grade_id" :items="grades" item-title="name" item-value="id" label="Grade" variant="outlined" :rules="requiredRules" @update:model-value="onGradeChange" /></v-col>
              <v-col cols="12" md="3"><v-text-field v-model.number="form.weekly_periods" label="Periods per week" type="number" min="1" max="50" variant="outlined" :rules="positiveRules" /></v-col>
            </v-row>

            <v-card rounded="lg" variant="tonal" class="mb-5">
              <v-card-text>
                <div class="d-flex flex-wrap ga-4">
                  <v-switch v-model="form.same_period_required" label="Same period required" color="primary" hide-details inset />
                  <v-switch v-model="form.period_number_fixed" label="Fix period number" color="primary" hide-details inset />
                  <v-switch v-model="form.prefer_morning" label="Prefer morning" color="primary" hide-details inset />
                  <v-switch v-model="form.prefer_last_period" label="Prefer last period" color="primary" hide-details inset />
                  <v-switch v-model="form.prefer_saturday" label="Prefer Saturday" color="primary" hide-details inset />
                </div>
                <v-text-field v-if="form.period_number_fixed" v-model.number="form.preferred_period_number" class="mt-4" style="max-width:260px" label="Preferred period number" type="number" min="1" max="50" variant="outlined" :rules="positiveRules" />
              </v-card-text>
            </v-card>

            <div class="d-flex align-center justify-space-between mb-3">
              <div><div class="text-h6 font-weight-bold">Participating subjects</div><div class="text-caption text-medium-emphasis">Add at least two subjects. The same subject cannot be repeated.</div></div>
              <v-btn color="primary" variant="tonal" prepend-icon="mdi-plus" :disabled="!form.grade_id" @click="addItem">Add Subject</v-btn>
            </div>

            <v-alert v-if="!form.grade_id" type="info" variant="tonal" class="mb-4">Select a grade before adding subjects.</v-alert>
            <v-card v-for="(groupItem, index) in form.items" :key="groupItem.localKey" rounded="lg" border elevation="0" class="mb-3">
              <v-card-text>
                <div class="d-flex align-start ga-3">
                  <v-avatar color="primary" variant="tonal" size="34">{{ index + 1 }}</v-avatar>
                  <v-row class="flex-grow-1">
                    <v-col cols="12" md="4"><v-select v-model="groupItem.subject_id" :items="availableSubjects(index)" item-title="name" item-value="id" label="Subject" variant="outlined" density="comfortable" :rules="requiredRules" /></v-col>
                    <v-col cols="12" md="4"><v-select v-model="groupItem.teacher_id" :items="teachers" item-title="name" item-value="id" label="Teacher (optional)" variant="outlined" density="comfortable" clearable /></v-col>
                    <v-col cols="12" md="4"><v-text-field v-model.trim="groupItem.student_group_name" label="Student group name" variant="outlined" density="comfortable" placeholder="Example: Biology Group" /></v-col>
                    <v-col cols="12" md="4"><v-select v-model="groupItem.stream_ids" :items="streams" item-title="name" item-value="id" label="Streams" variant="outlined" density="comfortable" multiple chips clearable /></v-col>
                    <v-col cols="12" md="4"><v-text-field v-model.trim="groupItem.room_no" label="Room / Lab" variant="outlined" density="comfortable" /></v-col>
                    <v-col cols="12" md="4"><v-text-field v-model.number="groupItem.teacher_split_order" label="Teacher split order" type="number" min="1" max="100" variant="outlined" density="comfortable" /></v-col>
                  </v-row>
                  <v-btn icon="mdi-delete-outline" variant="text" color="error" :disabled="form.items.length <= 2" @click="removeItem(index)" />
                </div>
              </v-card-text>
            </v-card>
            <v-switch v-model="form.is_active" label="Group is active" color="success" hide-details />
          </v-form>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-5"><v-spacer /><v-btn variant="text" @click="dialog = false">Cancel</v-btn><v-btn color="primary" :loading="saving" @click="save">{{ editingId ? 'Save Changes' : 'Create Group' }}</v-btn></v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="440"><v-card rounded="xl"><v-card-text class="pa-6 text-center"><v-avatar color="error" variant="tonal" size="64" class="mb-4"><v-icon size="34">mdi-delete-alert-outline</v-icon></v-avatar><div class="text-h6 font-weight-bold">Delete parallel group?</div><p class="text-body-2 text-medium-emphasis mt-2">This permanently removes <strong>{{ selected?.name }}</strong>.</p></v-card-text><v-card-actions class="pa-5 pt-0"><v-btn block variant="tonal" @click="deleteDialog = false">Cancel</v-btn><v-btn block color="error" :loading="deleting" @click="remove">Delete</v-btn></v-card-actions></v-card></v-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import api from '../../../plugins/api'
import timetableApi from '../../../services/timetableApi'
import { useUIStore } from '../../../stores/snackBar'

const ui = useUIStore()
const items = ref([]), grades = ref([]), subjects = ref([]), teachers = ref([]), streams = ref([])
const loading = ref(false), saving = ref(false), deleting = ref(false), dialog = ref(false), deleteDialog = ref(false)
const editingId = ref(null), selected = ref(null), formRef = ref(null), search = ref(''), gradeFilter = ref(null), statusFilter = ref(null)
const form = reactive({ name: '', grade_id: null, same_period_required: true, period_number_fixed: false, preferred_period_number: null, weekly_periods: 1, prefer_morning: false, prefer_last_period: false, prefer_saturday: false, is_active: true, items: [] })
const requiredRules = [(v) => !!v || 'This field is required.']
const positiveRules = [(v) => Number(v) > 0 || 'Enter a value greater than zero.']
const statusOptions = [{ title: 'Active', value: true }, { title: 'Inactive', value: false }]
const headers = [{ title: 'Group', key: 'name' }, { title: 'Subjects', key: 'items', sortable: false }, { title: 'Frequency', key: 'weekly_periods' }, { title: 'Scheduling', key: 'same_period_required' }, { title: 'Status', key: 'is_active' }, { title: '', key: 'actions', sortable: false, align: 'end' }]
const summaryCards = computed(() => [
  { label: 'Total groups', value: items.value.length, icon: 'mdi-vector-combine', color: 'primary' },
  { label: 'Active', value: items.value.filter(x => x.is_active).length, icon: 'mdi-check-circle', color: 'success' },
  { label: 'Subjects linked', value: items.value.reduce((sum, x) => sum + Number(x.items_count ?? x.items?.length ?? 0), 0), icon: 'mdi-book-multiple', color: 'info' },
  { label: 'In use', value: items.value.filter(x => Number(x.active_timetable_entries_count || 0) > 0).length, icon: 'mdi-calendar-check', color: 'warning' },
])
let timer
watch([search, gradeFilter, statusFilter], () => { clearTimeout(timer); timer = setTimeout(load, 350) })
const normalizeList = (payload) => payload?.data?.data || payload?.data || payload || []
const newItem = () => ({ localKey: `${Date.now()}-${Math.random()}`, subject_id: null, teacher_id: null, stream_ids: [], student_group_name: '', teacher_split_order: 1, room_no: '', is_active: true })
const resetForm = () => { Object.assign(form, { name: '', grade_id: null, same_period_required: true, period_number_fixed: false, preferred_period_number: null, weekly_periods: 1, prefer_morning: false, prefer_last_period: false, prefer_saturday: false, is_active: true, items: [newItem(), newItem()] }); subjects.value = [] }
const loadLookups = async () => { try { const [g, t, s] = await Promise.all([api.get('/grades'), api.get('/teachers', { params: { per_page: 100 } }), api.get('/streams', { params: { per_page: 100 } })]); grades.value = normalizeList(g); teachers.value = normalizeList(t); streams.value = normalizeList(s) } catch (e) { ui.showSnackbar('Some lookup data could not be loaded.', 'warning') } }
const loadSubjects = async (gradeId) => { subjects.value = []; if (!gradeId) return; try { const response = await api.get('/subjects', { params: { grade_id: gradeId, per_page: 200 } }); subjects.value = normalizeList(response) } catch (e) { ui.showSnackbar('Unable to load subjects for this grade.', 'error') } }
const load = async () => { loading.value = true; try { const data = await timetableApi.parallelGroups.list({ search: search.value || undefined, grade_id: gradeFilter.value || undefined, is_active: statusFilter.value ?? undefined, per_page: 100 }); items.value = data?.data || data || [] } catch (e) { ui.showSnackbar(e.response?.data?.message || 'Unable to load parallel groups.', 'error') } finally { loading.value = false } }
const openCreate = () => { editingId.value = null; resetForm(); dialog.value = true }
const openEdit = async (item) => { editingId.value = item.id; await loadSubjects(item.grade_id); Object.assign(form, { name: item.name, grade_id: item.grade_id, same_period_required: !!item.same_period_required, period_number_fixed: !!item.period_number_fixed, preferred_period_number: item.preferred_period_number, weekly_periods: item.weekly_periods, prefer_morning: !!item.prefer_morning, prefer_last_period: !!item.prefer_last_period, prefer_saturday: !!item.prefer_saturday, is_active: !!item.is_active, items: (item.items || []).map(x => ({ ...newItem(), subject_id: x.subject_id, teacher_id: x.teacher_id, stream_ids: x.stream_ids || [], student_group_name: x.student_group_name || '', teacher_split_order: x.teacher_split_order || 1, room_no: x.room_no || '', is_active: x.is_active !== false })) }); while (form.items.length < 2) form.items.push(newItem()); dialog.value = true }
const onGradeChange = async (gradeId) => { form.items = [newItem(), newItem()]; await loadSubjects(gradeId) }
const addItem = () => form.items.push(newItem())
const removeItem = (index) => { if (form.items.length > 2) form.items.splice(index, 1) }
const availableSubjects = (index) => { const selectedIds = form.items.map((x, i) => i === index ? null : x.subject_id).filter(Boolean); return subjects.value.filter(x => !selectedIds.includes(x.id)) }
const payload = () => ({ ...form, preferred_period_number: form.period_number_fixed ? Number(form.preferred_period_number) : null, weekly_periods: Number(form.weekly_periods), items: form.items.map(({ localKey, ...x }) => ({ ...x, teacher_split_order: Number(x.teacher_split_order || 1) })) })
const save = async () => { const result = await formRef.value?.validate(); if (!result?.valid) return; if (form.items.length < 2) return ui.showSnackbar('Add at least two subjects.', 'error'); saving.value = true; try { if (editingId.value) await timetableApi.parallelGroups.update(editingId.value, payload()); else await timetableApi.parallelGroups.create(payload()); ui.showSnackbar(editingId.value ? 'Parallel group updated.' : 'Parallel group created.'); dialog.value = false; await load() } catch (e) { const errors = e.response?.data?.errors; ui.showSnackbar(errors ? Object.values(errors).flat()[0] : e.response?.data?.message || 'Unable to save parallel group.', 'error') } finally { saving.value = false } }
const toggleStatus = async (item) => { try { item.is_active ? await timetableApi.parallelGroups.deactivate(item.id) : await timetableApi.parallelGroups.activate(item.id); ui.showSnackbar(item.is_active ? 'Parallel group deactivated.' : 'Parallel group activated.'); await load() } catch (e) { ui.showSnackbar(e.response?.data?.message || 'Unable to update status.', 'error') } }
const confirmDelete = (item) => { selected.value = item; deleteDialog.value = true }
const remove = async () => { deleting.value = true; try { await timetableApi.parallelGroups.remove(selected.value.id); ui.showSnackbar('Parallel group deleted.'); deleteDialog.value = false; await load() } catch (e) { ui.showSnackbar(e.response?.data?.message || Object.values(e.response?.data?.errors || {}).flat()[0] || 'Unable to delete group.', 'error') } finally { deleting.value = false } }
onMounted(async () => { await Promise.all([loadLookups(), load()]) })
</script>

<style scoped>
.hero-card { background: linear-gradient(135deg, rgba(var(--v-theme-primary), .14), rgba(var(--v-theme-surface), .96)); border: 1px solid rgba(var(--v-theme-primary), .18); }
.setup-page { animation: page-in .28s ease-out; }
@keyframes page-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
</style>
