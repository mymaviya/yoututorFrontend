<template>
  <div class="editor-page">
    <v-card class="hero-card mb-5" rounded="xl" elevation="0">
      <v-card-text class="pa-6 pa-md-8">
        <div class="d-flex flex-wrap align-center justify-space-between ga-4">
          <div class="d-flex align-center ga-3">
            <v-avatar color="primary" variant="tonal" size="50"><v-icon size="28">mdi-calendar-edit</v-icon></v-avatar>
            <div>
              <h1 class="text-h4 font-weight-bold">Weekly Timetable Editor</h1>
              <p class="text-body-2 text-medium-emphasis mb-0">Review, correct, lock, version, publish and export generated timetables.</p>
            </div>
          </div>
          <div class="d-flex flex-wrap ga-2">
            <v-btn variant="tonal" prepend-icon="mdi-refresh" :loading="loading" @click="loadTimetables">Refresh</v-btn>
            <v-btn color="primary" prepend-icon="mdi-auto-fix" @click="router.push({ name: 'timetable.generator' })">Generate</v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <v-row>
      <v-col cols="12" lg="3">
        <v-card rounded="xl" elevation="0" border class="browser-card">
          <v-card-title>Timetables</v-card-title>
          <v-card-text>
            <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="Search timetable" variant="outlined" density="comfortable" hide-details clearable class="mb-3" />
            <v-select v-model="statusFilter" :items="statusOptions" label="Status" variant="outlined" density="comfortable" hide-details clearable class="mb-3" />
          </v-card-text>
          <v-divider />
          <v-skeleton-loader v-if="loading" type="list-item-avatar-three-line@5" />
          <v-list v-else lines="three" class="timetable-list">
            <v-list-item v-for="item in filteredTimetables" :key="item.id" :active="selectedId === item.id" color="primary" rounded="lg" class="ma-2" @click="selectTimetable(item)">
              <template #prepend><v-avatar :color="statusColor(item.status)" variant="tonal"><v-icon>mdi-calendar-week</v-icon></v-avatar></template>
              <v-list-item-title class="font-weight-bold">{{ item.name || `Timetable #${item.id}` }}</v-list-item-title>
              <v-list-item-subtitle>{{ classLabel(item) }}</v-list-item-subtitle>
              <v-list-item-subtitle class="mt-1"><v-chip size="x-small" :color="statusColor(item.status)" variant="tonal">{{ item.status }}</v-chip> <span class="ms-2">v{{ item.version || 1 }} · {{ item.entries_count || 0 }} entries</span></v-list-item-subtitle>
            </v-list-item>
            <div v-if="!filteredTimetables.length" class="text-center text-medium-emphasis pa-8"><v-icon size="48">mdi-calendar-blank-outline</v-icon><div class="mt-3">No timetables found.</div></div>
          </v-list>
        </v-card>
      </v-col>

      <v-col cols="12" lg="9">
        <v-card v-if="!selectedId" rounded="xl" border elevation="0" class="empty-workspace">
          <v-card-text class="text-center pa-12"><v-avatar color="primary" variant="tonal" size="76"><v-icon size="42">mdi-calendar-cursor</v-icon></v-avatar><h2 class="text-h5 mt-5">Select a timetable</h2><p class="text-body-2 text-medium-emphasis">Choose a timetable from the left panel to review and edit its weekly grid.</p></v-card-text>
        </v-card>

        <template v-else>
          <v-card rounded="xl" border elevation="0" class="mb-4">
            <v-card-text class="pa-5">
              <div class="d-flex flex-wrap align-center justify-space-between ga-3">
                <div>
                  <div class="d-flex align-center ga-2 flex-wrap"><h2 class="text-h5 font-weight-bold">{{ timetable?.name }}</h2><v-chip :color="statusColor(timetable?.status)" variant="tonal" size="small">{{ timetable?.status }}</v-chip><v-chip variant="outlined" size="small">Version {{ timetable?.version || 1 }}</v-chip></div>
                  <div class="text-body-2 text-medium-emphasis mt-1">{{ classLabel(timetable) }} · {{ entries.length }} entries · {{ lockedCount }} locked</div>
                </div>
                <div class="d-flex flex-wrap ga-2">
                  <v-btn variant="tonal" prepend-icon="mdi-file-excel" @click="download('excel')">Excel</v-btn>
                  <v-btn variant="tonal" prepend-icon="mdi-file-pdf-box" @click="download('pdf')">PDF</v-btn>
                  <v-menu>
                    <template #activator="{ props }"><v-btn v-bind="props" variant="tonal" append-icon="mdi-chevron-down">Lifecycle</v-btn></template>
                    <v-list density="compact">
                      <v-list-item v-if="timetable?.status === 'draft'" prepend-icon="mdi-publish" title="Publish" @click="lifecycle('publish')" />
                      <v-list-item v-if="timetable?.status !== 'archived'" prepend-icon="mdi-archive-outline" title="Archive" @click="lifecycle('archive')" />
                      <v-list-item v-if="timetable?.status === 'archived'" prepend-icon="mdi-restore" title="Restore to draft" @click="lifecycle('restore')" />
                      <v-list-item prepend-icon="mdi-source-branch" title="Create new version" @click="versionDialog = true" />
                    </v-list>
                  </v-menu>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <v-alert v-if="timetable?.status === 'archived'" type="warning" variant="tonal" class="mb-4">Archived timetables are read-only. Restore this timetable to draft before editing.</v-alert>

          <v-card rounded="xl" border elevation="0">
            <v-card-title class="d-flex align-center justify-space-between flex-wrap ga-2"><span>Weekly Grid</span><div class="d-flex ga-2"><v-chip size="small" variant="tonal" color="success"><v-icon start>mdi-lock</v-icon>{{ lockedCount }} locked</v-chip><v-btn size="small" color="primary" prepend-icon="mdi-plus" :disabled="timetable?.status === 'archived'" @click="openCreate()">Add Entry</v-btn></div></v-card-title>
            <v-divider />
            <v-skeleton-loader v-if="gridLoading" type="table-heading, table-row@6" />
            <div v-else class="grid-scroll">
              <table class="timetable-grid">
                <thead><tr><th class="period-col">Period</th><th v-for="day in workingDays" :key="day.value">{{ day.title }}</th></tr></thead>
                <tbody>
                  <tr v-for="bell in bells" :key="bell.id">
                    <th class="period-col"><div class="font-weight-bold">{{ bell.title || `Period ${bell.period_number || ''}` }}</div><div class="text-caption text-medium-emphasis">{{ formatTime(bell.start_time) }}–{{ formatTime(bell.end_time) }}</div></th>
                    <td v-for="day in workingDays" :key="day.value" class="slot-cell" @click="openCreate(day.value, bell.id)">
                      <div v-if="slotEntries(day.value, bell.id).length" class="d-flex flex-column ga-2">
                        <v-card v-for="entry in slotEntries(day.value, bell.id)" :key="entry.id" class="entry-card" :class="{ locked: entry.is_locked, parallel: entry.is_parallel }" rounded="lg" elevation="0" @click.stop="openEdit(entry)">
                          <v-card-text class="pa-3"><div class="d-flex justify-space-between ga-2"><div class="font-weight-bold text-body-2">{{ entry.subject?.name || 'Unassigned subject' }}</div><v-icon v-if="entry.is_locked" size="15" color="warning">mdi-lock</v-icon></div><div class="text-caption mt-1"><v-icon size="13">mdi-account</v-icon> {{ entry.substituteTeacher?.name || entry.teacher?.name || 'No teacher' }}</div><div v-if="entry.room?.name || entry.room_no" class="text-caption"><v-icon size="13">mdi-door</v-icon> {{ entry.room?.name || entry.room_no }}</div></v-card-text>
                        </v-card>
                      </div>
                      <div v-else class="empty-slot"><v-icon size="18">mdi-plus</v-icon><span>Add</span></div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </v-card>
        </template>
      </v-col>
    </v-row>

    <v-dialog v-model="entryDialog" max-width="760" persistent>
      <v-card rounded="xl"><v-card-title class="d-flex justify-space-between pa-5"><div><div>{{ editingEntry ? 'Edit timetable entry' : 'Add timetable entry' }}</div><div class="text-caption text-medium-emphasis font-weight-regular">Conflicts are checked automatically before saving.</div></div><v-btn icon="mdi-close" variant="text" @click="entryDialog = false" /></v-card-title><v-divider />
        <v-card-text class="pa-5"><v-form ref="formRef"><v-row><v-col cols="12" sm="6"><v-select v-model="form.weekday" :items="workingDays" label="Day" variant="outlined" :rules="requiredRules" /></v-col><v-col cols="12" sm="6"><v-select v-model="form.school_bell_id" :items="bells" item-title="title" item-value="id" label="Period" variant="outlined" :rules="requiredRules" /></v-col><v-col cols="12" sm="6"><v-autocomplete v-model="form.subject_id" :items="subjects" item-title="name" item-value="id" label="Subject" variant="outlined" clearable /></v-col><v-col cols="12" sm="6"><v-autocomplete v-model="form.teacher_id" :items="teachers" item-title="name" item-value="id" label="Teacher" variant="outlined" clearable /></v-col><v-col cols="12" sm="6"><v-autocomplete v-model="form.room_id" :items="rooms" item-title="name" item-value="id" label="Room" variant="outlined" clearable /></v-col><v-col cols="12" sm="6"><v-text-field v-model="form.student_group_name" label="Student group" variant="outlined" /></v-col></v-row>
          <v-row><v-col cols="12" sm="4"><v-switch v-model="form.is_parallel" label="Parallel entry" color="primary" hide-details /></v-col><v-col cols="12" sm="4"><v-switch v-model="form.is_substitution" label="Substitution" color="warning" hide-details /></v-col><v-col cols="12" sm="4"><v-switch v-model="form.is_locked" label="Lock entry" color="success" hide-details /></v-col></v-row>
          <v-autocomplete v-if="form.is_substitution" v-model="form.substitute_teacher_id" :items="teachers" item-title="name" item-value="id" label="Substitute teacher" variant="outlined" :rules="requiredRules" class="mt-3" />
          <v-textarea v-model="form.remarks" label="Remarks" variant="outlined" rows="2" auto-grow class="mt-3" />
        </v-form></v-card-text>
        <v-divider /><v-card-actions class="pa-5"><v-btn v-if="editingEntry" color="error" variant="text" :loading="deleting" @click="removeEntry">Delete</v-btn><v-spacer /><v-btn variant="text" @click="entryDialog = false">Cancel</v-btn><v-btn color="primary" :loading="saving" @click="saveEntry">Save Entry</v-btn></v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="versionDialog" max-width="460"><v-card rounded="xl"><v-card-title>Create new version</v-card-title><v-card-text><v-text-field v-model="versionName" label="Version name (optional)" variant="outlined" hint="Entries will be copied into a new draft version." persistent-hint /></v-card-text><v-card-actions class="pa-5 pt-0"><v-spacer /><v-btn variant="text" @click="versionDialog = false">Cancel</v-btn><v-btn color="primary" :loading="versioning" @click="createVersion">Create Version</v-btn></v-card-actions></v-card></v-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../../plugins/api'
import timetableApi from '../../../services/timetableApi'
import { useUIStore } from '../../../stores/snackBar'

const router = useRouter(), ui = useUIStore()
const loading = ref(false), gridLoading = ref(false), saving = ref(false), deleting = ref(false), versioning = ref(false)
const timetables = ref([]), selectedId = ref(null), timetable = ref(null), entries = ref([]), bells = ref([]), teachers = ref([]), subjects = ref([]), rooms = ref([])
const search = ref(''), statusFilter = ref(null), entryDialog = ref(false), editingEntry = ref(null), formRef = ref(null), versionDialog = ref(false), versionName = ref('')
const workingDays = [{ title: 'Monday', value: 1 }, { title: 'Tuesday', value: 2 }, { title: 'Wednesday', value: 3 }, { title: 'Thursday', value: 4 }, { title: 'Friday', value: 5 }, { title: 'Saturday', value: 6 }]
const statusOptions = [{ title: 'Draft', value: 'draft' }, { title: 'Published', value: 'published' }, { title: 'Archived', value: 'archived' }]
const requiredRules = [(v) => v !== null && v !== '' && v !== undefined || 'This field is required.']
const form = reactive({ weekday: 1, school_bell_id: null, subject_id: null, teacher_id: null, room_id: null, student_group_name: '', is_parallel: false, is_substitution: false, substitute_teacher_id: null, is_locked: false, is_active: true, remarks: '' })

const extractList = (r) => { const p = r?.data; if (Array.isArray(p)) return p; if (Array.isArray(p?.data)) return p.data; if (Array.isArray(p?.data?.data)) return p.data.data; return [] }
const filteredTimetables = computed(() => timetables.value.filter(x => (!statusFilter.value || x.status === statusFilter.value) && (!search.value || String(x.name || '').toLowerCase().includes(search.value.toLowerCase()))))
const lockedCount = computed(() => entries.value.filter(x => x.is_locked).length)
const statusColor = (s) => ({ draft: 'info', published: 'success', archived: 'grey' }[s] || 'primary')
const classLabel = (x) => [x?.grade?.name, x?.section?.name, x?.stream?.name].filter(Boolean).join(' · ') || 'Class timetable'
const formatTime = (v) => v ? String(v).slice(0, 5) : '—'
const slotEntries = (day, bell) => entries.value.filter(x => Number(x.weekday) === Number(day) && Number(x.school_bell_id) === Number(bell) && x.is_active !== false)

const loadTimetables = async () => { loading.value = true; try { const data = await timetableApi.weeklyTimetables({ per_page: 100 }); timetables.value = data?.data || data || []; if (!selectedId.value && timetables.value.length) await selectTimetable(timetables.value[0]) } catch (e) { ui.showSnackbar(e.response?.data?.message || 'Unable to load timetables.', 'error') } finally { loading.value = false } }
const loadMasters = async () => { const results = await Promise.allSettled([api.get('/teachers', { params: { per_page: 999 } }), api.get('/subjects', { params: { per_page: 999 } }), timetableApi.rooms.list({ per_page: 100 }), api.get('/bell-schedules/preview')]); teachers.value = results[0].status === 'fulfilled' ? extractList(results[0].value) : []; subjects.value = results[1].status === 'fulfilled' ? extractList(results[1].value) : []; rooms.value = results[2].status === 'fulfilled' ? (results[2].value?.data || results[2].value || []) : []; bells.value = results[3].status === 'fulfilled' ? extractList(results[3].value) : [] }
const selectTimetable = async (item) => { selectedId.value = item.id; gridLoading.value = true; try { const data = await timetableApi.timetableGrid(item.id); timetable.value = data?.timetable || item; entries.value = data?.entries || []; if (!bells.value.length) bells.value = [...new Map(entries.value.map(x => [x.bell?.id, x.bell]).filter(([id]) => id)).values()] } catch (e) { ui.showSnackbar(e.response?.data?.message || 'Unable to load timetable grid.', 'error') } finally { gridLoading.value = false } }
const resetForm = () => Object.assign(form, { weekday: 1, school_bell_id: bells.value[0]?.id || null, subject_id: null, teacher_id: null, room_id: null, student_group_name: '', is_parallel: false, is_substitution: false, substitute_teacher_id: null, is_locked: false, is_active: true, remarks: '' })
const openCreate = (day = 1, bell = null) => { if (timetable.value?.status === 'archived') return; editingEntry.value = null; resetForm(); form.weekday = day; form.school_bell_id = bell || bells.value[0]?.id || null; entryDialog.value = true }
const openEdit = (entry) => { if (timetable.value?.status === 'archived') return; editingEntry.value = entry; Object.assign(form, { weekday: entry.weekday, school_bell_id: entry.school_bell_id, subject_id: entry.subject_id, teacher_id: entry.teacher_id, room_id: entry.room_id, student_group_name: entry.student_group_name || '', is_parallel: !!entry.is_parallel, is_substitution: !!entry.is_substitution, substitute_teacher_id: entry.substitute_teacher_id, is_locked: !!entry.is_locked, is_active: entry.is_active !== false, remarks: entry.remarks || '' }); entryDialog.value = true }
const payload = () => ({ ...form, weekday: Number(form.weekday), school_bell_id: Number(form.school_bell_id) })
const saveEntry = async () => { const result = await formRef.value?.validate(); if (result && !result.valid) return; saving.value = true; try { if (editingEntry.value) await timetableApi.updateEntry(selectedId.value, editingEntry.value.id, { ...payload(), allow_locked_update: true }); else await timetableApi.createEntry(selectedId.value, payload()); entryDialog.value = false; await selectTimetable({ id: selectedId.value }); ui.showSnackbar('Timetable entry saved.') } catch (e) { ui.showSnackbar(e.response?.data?.message || Object.values(e.response?.data?.errors || {})?.flat()?.[0] || 'Unable to save entry.', 'error') } finally { saving.value = false } }
const removeEntry = async () => { if (!editingEntry.value || !confirm('Delete this timetable entry?')) return; deleting.value = true; try { await timetableApi.deleteEntry(selectedId.value, editingEntry.value.id, !!editingEntry.value.is_locked); entryDialog.value = false; await selectTimetable({ id: selectedId.value }); ui.showSnackbar('Timetable entry deleted.') } catch (e) { ui.showSnackbar(e.response?.data?.message || 'Unable to delete entry.', 'error') } finally { deleting.value = false } }
const lifecycle = async (action) => { if (!confirm(`${action[0].toUpperCase() + action.slice(1)} this timetable?`)) return; try { await timetableApi[action](selectedId.value); await loadTimetables(); await selectTimetable({ id: selectedId.value }); ui.showSnackbar(`Timetable ${action}d successfully.`) } catch (e) { ui.showSnackbar(e.response?.data?.message || `Unable to ${action} timetable.`, 'error') } }
const createVersion = async () => { versioning.value = true; try { const created = await timetableApi.createVersion(selectedId.value, versionName.value || null); versionDialog.value = false; versionName.value = ''; await loadTimetables(); if (created?.id) await selectTimetable(created); ui.showSnackbar('New timetable version created.') } catch (e) { ui.showSnackbar(e.response?.data?.message || 'Unable to create version.', 'error') } finally { versioning.value = false } }
const download = async (format) => { try { const response = await timetableApi.downloadClassReport(selectedId.value, format); const blob = new Blob([response.data], { type: response.headers?.['content-type'] }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `${timetable.value?.name || 'timetable'}.${format === 'excel' ? 'xlsx' : 'pdf'}`; link.click(); URL.revokeObjectURL(url) } catch (e) { ui.showSnackbar(`Unable to download ${format.toUpperCase()} report.`, 'error') } }
watch(statusFilter, () => { if (selectedId.value && !filteredTimetables.value.some(x => x.id === selectedId.value)) { selectedId.value = null; timetable.value = null; entries.value = [] } })
onMounted(async () => { await Promise.all([loadMasters(), loadTimetables()]) })
</script>

<style scoped>
.hero-card{background:linear-gradient(135deg,rgba(var(--v-theme-primary),.13),rgba(var(--v-theme-secondary),.06))}.browser-card{position:sticky;top:84px}.timetable-list{max-height:72vh;overflow:auto}.empty-workspace{min-height:520px;display:grid;place-items:center}.grid-scroll{overflow:auto;max-height:72vh}.timetable-grid{border-collapse:separate;border-spacing:0;min-width:1050px;width:100%}.timetable-grid th,.timetable-grid td{border-right:1px solid rgba(var(--v-border-color),var(--v-border-opacity));border-bottom:1px solid rgba(var(--v-border-color),var(--v-border-opacity));padding:10px;vertical-align:top}.timetable-grid thead th{position:sticky;top:0;background:rgb(var(--v-theme-surface));z-index:3}.period-col{position:sticky;left:0;background:rgb(var(--v-theme-surface));z-index:2;min-width:145px}.slot-cell{min-width:150px;height:112px;cursor:pointer}.slot-cell:hover{background:rgba(var(--v-theme-primary),.035)}.entry-card{border-left:4px solid rgb(var(--v-theme-primary));cursor:pointer}.entry-card.locked{border-left-color:rgb(var(--v-theme-warning))}.entry-card.parallel{border-style:dashed}.empty-slot{height:90px;display:flex;align-items:center;justify-content:center;gap:5px;color:rgba(var(--v-theme-on-surface),.38);opacity:0;transition:.2s}.slot-cell:hover .empty-slot{opacity:1}@media(max-width:1279px){.browser-card{position:static}.timetable-list{max-height:360px}}
</style>
