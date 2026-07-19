<template>
  <div class="setup-page">
    <v-card class="hero-card mb-6" rounded="xl" elevation="0">
      <v-card-text class="pa-6 pa-md-8">
        <div class="d-flex flex-wrap align-center justify-space-between ga-4">
          <div class="d-flex align-center ga-3">
            <v-avatar color="deep-purple" variant="tonal" size="46"><v-icon>mdi-tune-variant</v-icon></v-avatar>
            <div><h1 class="text-h4 font-weight-bold">Timetable Rules</h1><p class="text-body-2 text-medium-emphasis mb-0">Control workload, blocked periods and scheduling preferences with clear priority and severity.</p></div>
          </div>
          <v-btn color="primary" size="large" rounded="lg" prepend-icon="mdi-plus" @click="openCreate">Add Rule</v-btn>
        </div>
      </v-card-text>
    </v-card>

    <v-row class="mb-2">
      <v-col v-for="card in summaryCards" :key="card.label" cols="6" md="3"><v-card rounded="xl" elevation="0" border><v-card-text class="d-flex align-center ga-3"><v-avatar :color="card.color" variant="tonal"><v-icon>{{ card.icon }}</v-icon></v-avatar><div><div class="text-h5 font-weight-bold">{{ card.value }}</div><div class="text-caption text-medium-emphasis">{{ card.label }}</div></div></v-card-text></v-card></v-col>
    </v-row>

    <v-card rounded="xl" elevation="0" border>
      <v-card-text class="pa-4"><v-row align="center"><v-col cols="12" md="5"><v-text-field v-model="search" label="Search rule key or description" prepend-inner-icon="mdi-magnify" variant="outlined" density="comfortable" hide-details clearable /></v-col><v-col cols="6" md="3"><v-select v-model="constraintFilter" :items="constraintTypes" label="Constraint" variant="outlined" density="comfortable" hide-details clearable /></v-col><v-col cols="6" md="2"><v-select v-model="statusFilter" :items="statusOptions" label="Status" variant="outlined" density="comfortable" hide-details clearable /></v-col><v-col cols="12" md="2" class="d-flex justify-end"><v-btn variant="tonal" prepend-icon="mdi-refresh" :loading="loading" @click="load">Refresh</v-btn></v-col></v-row></v-card-text>
      <v-divider />
      <v-skeleton-loader v-if="loading" type="table-heading, table-row@5" />
      <v-data-table v-else :headers="headers" :items="items" :items-per-page="10" hover>
        <template #item.rule_key="{ item }"><div class="py-2"><div class="font-weight-bold font-monospace">{{ item.rule_key }}</div><div class="text-caption text-medium-emphasis text-truncate rule-description">{{ item.description || 'No description' }}</div></div></template>
        <template #item.rule_value="{ item }"><v-chip size="small" variant="outlined" class="font-monospace">{{ displayValue(item) }}</v-chip></template>
        <template #item.constraint_type="{ item }"><v-chip size="small" variant="tonal" :color="constraintColor(item.constraint_type)">{{ titleCase(item.constraint_type) }}</v-chip></template>
        <template #item.priority="{ item }"><div class="d-flex align-center ga-2"><v-progress-linear :model-value="Number(item.priority || 1) * 10" height="6" rounded color="primary" style="width:64px" /><span>{{ item.priority || 1 }}</span></div></template>
        <template #item.is_active="{ item }"><v-chip size="small" :color="item.is_active ? 'success' : 'default'" variant="tonal">{{ item.is_active ? 'Active' : 'Inactive' }}</v-chip></template>
        <template #item.actions="{ item }"><div class="d-flex justify-end ga-1"><v-btn icon="mdi-pencil-outline" size="small" variant="text" @click="openEdit(item)" /><v-btn icon="mdi-content-copy" size="small" variant="text" @click="openDuplicate(item)" /><v-btn :icon="item.is_active ? 'mdi-pause-circle-outline' : 'mdi-play-circle-outline'" size="small" variant="text" :color="item.is_active ? 'warning' : 'success'" @click="toggleStatus(item)" /><v-btn icon="mdi-delete-outline" size="small" variant="text" color="error" @click="confirmDelete(item)" /></div></template>
        <template #no-data><div class="text-center py-12"><v-icon size="52" color="medium-emphasis">mdi-tune-variant</v-icon><div class="text-h6 mt-3">No timetable rules found</div><div class="text-body-2 text-medium-emphasis mb-4">Add constraints to guide the automatic timetable generator.</div><v-btn color="primary" prepend-icon="mdi-plus" @click="openCreate">Add Rule</v-btn></div></template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="720" persistent>
      <v-card rounded="xl">
        <v-card-title class="d-flex align-center justify-space-between pa-5"><div><div>{{ dialogTitle }}</div><div class="text-caption text-medium-emphasis font-weight-regular">Choose a known rule or define a custom advanced constraint.</div></div><v-btn icon="mdi-close" variant="text" @click="dialog = false" /></v-card-title>
        <v-divider />
        <v-card-text class="pa-5"><v-form ref="formRef" @submit.prevent="save">
          <v-combobox v-model="form.rule_key" :items="knownRules" item-title="title" item-value="value" label="Rule key" variant="outlined" :rules="keyRules" hint="Use lowercase letters, numbers, dots, underscores or hyphens." persistent-hint class="mb-2" />
          <v-row><v-col cols="12" sm="6"><v-select v-model="form.value_type" :items="valueTypes" label="Value type" variant="outlined" :rules="requiredRules" /></v-col><v-col cols="12" sm="6"><v-select v-model="form.constraint_type" :items="constraintTypes" label="Constraint strength" variant="outlined" :rules="requiredRules" /></v-col></v-row>

          <v-switch v-if="form.value_type === 'boolean'" v-model="booleanValue" color="primary" label="Enabled" inset />
          <v-text-field v-else-if="form.value_type === 'integer'" v-model.number="form.rule_value" type="number" label="Rule value" variant="outlined" :rules="requiredRules" />
          <v-textarea v-else-if="form.value_type === 'json'" v-model="jsonValue" label="JSON value" variant="outlined" rows="5" auto-grow :rules="jsonRules" hint='Example: [{"weekday":1,"school_bell_id":3}]' persistent-hint />
          <v-text-field v-else v-model="form.rule_value" label="Rule value" variant="outlined" :rules="requiredRules" />

          <v-row class="mt-1"><v-col cols="12" sm="4"><v-text-field v-model.number="form.priority" type="number" min="1" max="10" label="Priority (1–10)" variant="outlined" /></v-col><v-col cols="12" sm="4"><v-text-field v-model="form.effective_from" type="date" label="Effective from" variant="outlined" /></v-col><v-col cols="12" sm="4"><v-text-field v-model="form.effective_to" type="date" label="Effective to" variant="outlined" /></v-col></v-row>
          <v-textarea v-model.trim="form.description" label="Description" variant="outlined" rows="2" auto-grow counter="1000" />
          <v-alert :type="constraintAlert.type" variant="tonal" density="compact" class="mb-4">{{ constraintAlert.text }}</v-alert>
          <v-switch v-model="form.is_active" color="success" label="Rule is active" hide-details />
        </v-form></v-card-text>
        <v-divider /><v-card-actions class="pa-5"><v-spacer /><v-btn variant="text" @click="dialog = false">Cancel</v-btn><v-btn color="primary" :loading="saving" @click="save">{{ editingId ? 'Save Changes' : duplicateSource ? 'Create Copy' : 'Add Rule' }}</v-btn></v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="440"><v-card rounded="xl"><v-card-text class="pa-6 text-center"><v-avatar color="error" variant="tonal" size="64" class="mb-4"><v-icon size="34">mdi-delete-alert-outline</v-icon></v-avatar><div class="text-h6 font-weight-bold">Delete rule?</div><p class="text-body-2 text-medium-emphasis mt-2">The generator will stop applying <strong>{{ selected?.rule_key }}</strong>.</p></v-card-text><v-card-actions class="pa-5 pt-0"><v-btn block variant="tonal" @click="deleteDialog = false">Cancel</v-btn><v-btn block color="error" :loading="deleting" @click="remove">Delete</v-btn></v-card-actions></v-card></v-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import timetableApi from '../../../services/timetableApi'
import { useUIStore } from '../../../stores/snackBar'

const ui = useUIStore()
const items = ref([]), loading = ref(false), saving = ref(false), deleting = ref(false)
const search = ref(''), constraintFilter = ref(null), statusFilter = ref(null), dialog = ref(false), deleteDialog = ref(false), editingId = ref(null), duplicateSource = ref(null), selected = ref(null), formRef = ref(null), jsonValue = ref('[]')
const form = reactive({ rule_key: '', rule_value: '', value_type: 'integer', constraint_type: 'hard', priority: 5, description: '', effective_from: '', effective_to: '', is_active: true })
const booleanValue = computed({ get: () => form.rule_value === true || form.rule_value === 'true' || form.rule_value === 1, set: (v) => { form.rule_value = v } })
const valueTypes = [{ title: 'Integer', value: 'integer' }, { title: 'Boolean', value: 'boolean' }, { title: 'Text', value: 'string' }, { title: 'JSON / List', value: 'json' }]
const constraintTypes = [{ title: 'Hard constraint', value: 'hard' }, { title: 'Soft preference', value: 'soft' }, { title: 'Hard or soft', value: 'hard_or_soft' }]
const statusOptions = [{ title: 'Active', value: true }, { title: 'Inactive', value: false }]
const knownRules = [
  { title: 'Teacher maximum daily periods', value: 'teacher.max_daily_periods' }, { title: 'Teacher maximum weekly periods', value: 'teacher.max_weekly_periods' },
  { title: 'Teacher maximum consecutive periods', value: 'teacher.max_consecutive_periods' }, { title: 'Spread subjects across days', value: 'subject.spread_across_days' },
  { title: 'Blocked class slots', value: 'class.blocked_slots' }, { title: 'Blocked teacher slots', value: 'teacher.blocked_slots' },
  { title: 'Blocked subject slots', value: 'subject.blocked_slots' }, { title: 'Require rooms for laboratories', value: 'room.required_for_labs' },
]
const requiredRules = [(v) => v !== '' && v !== null && v !== undefined || 'This field is required.']
const keyRules = [...requiredRules, (v) => /^[a-z0-9_.-]+$/.test(typeof v === 'object' ? v.value : v) || 'Use lowercase letters, numbers, dots, underscores or hyphens.']
const jsonRules = [(v) => { try { const parsed = JSON.parse(v); return Array.isArray(parsed) || 'JSON value must be a list.' } catch { return 'Enter valid JSON.' } }]
const headers = [{ title: 'Rule', key: 'rule_key' }, { title: 'Value', key: 'rule_value' }, { title: 'Constraint', key: 'constraint_type' }, { title: 'Priority', key: 'priority' }, { title: 'Status', key: 'is_active' }, { title: '', key: 'actions', sortable: false, align: 'end' }]
const summaryCards = computed(() => [
  { label: 'Total rules', value: items.value.length, icon: 'mdi-tune-variant', color: 'primary' },
  { label: 'Active', value: items.value.filter(x => x.is_active).length, icon: 'mdi-check-circle', color: 'success' },
  { label: 'Hard constraints', value: items.value.filter(x => x.constraint_type === 'hard').length, icon: 'mdi-shield-lock-outline', color: 'error' },
  { label: 'Soft preferences', value: items.value.filter(x => x.constraint_type === 'soft').length, icon: 'mdi-star-outline', color: 'warning' },
])
const dialogTitle = computed(() => editingId.value ? 'Edit Rule' : duplicateSource.value ? 'Duplicate Rule' : 'Add Rule')
const constraintAlert = computed(() => form.constraint_type === 'hard' ? { type: 'warning', text: 'Hard constraints must always be satisfied; they can make generation more difficult.' } : { type: 'info', text: 'Soft preferences improve quality but may be relaxed when necessary.' })
let timer
watch([search, constraintFilter, statusFilter], () => { clearTimeout(timer); timer = setTimeout(load, 350) })
watch(() => form.value_type, (type) => { if (type === 'json' && !jsonValue.value) jsonValue.value = '[]'; if (type === 'boolean' && form.rule_value === '') form.rule_value = true })

const load = async () => { loading.value = true; try { const data = await timetableApi.rules.list({ search: search.value || undefined, constraint_type: constraintFilter.value || undefined, is_active: statusFilter.value ?? undefined, per_page: 100 }); items.value = data?.data || data || [] } catch (e) { ui.showSnackbar(e.response?.data?.message || 'Unable to load rules.', 'error') } finally { loading.value = false } }
const resetForm = () => { Object.assign(form, { rule_key: '', rule_value: '', value_type: 'integer', constraint_type: 'hard', priority: 5, description: '', effective_from: '', effective_to: '', is_active: true }); jsonValue.value = '[]' }
const normalizeKey = () => { if (typeof form.rule_key === 'object') form.rule_key = form.rule_key.value }
const openCreate = () => { editingId.value = null; duplicateSource.value = null; resetForm(); dialog.value = true }
const openEdit = (item) => { editingId.value = item.id; duplicateSource.value = null; Object.assign(form, { rule_key: item.rule_key, rule_value: item.typed_value ?? item.rule_value, value_type: item.value_type, constraint_type: item.constraint_type, priority: item.priority || 5, description: item.description || '', effective_from: item.effective_from || '', effective_to: item.effective_to || '', is_active: !!item.is_active }); jsonValue.value = item.value_type === 'json' ? JSON.stringify(item.typed_value ?? item.rule_value ?? [], null, 2) : '[]'; dialog.value = true }
const openDuplicate = (item) => { openEdit(item); editingId.value = null; duplicateSource.value = item; form.rule_key = `${item.rule_key}.copy` }
const save = async () => { normalizeKey(); const result = await formRef.value?.validate(); if (!result?.valid) return; saving.value = true; try { const payload = { ...form, rule_value: form.value_type === 'json' ? JSON.parse(jsonValue.value) : form.rule_value, effective_from: form.effective_from || null, effective_to: form.effective_to || null }; if (editingId.value) await timetableApi.rules.update(editingId.value, payload); else if (duplicateSource.value) await timetableApi.duplicateRule(duplicateSource.value.id, payload); else await timetableApi.rules.create(payload); ui.showSnackbar(editingId.value ? 'Rule updated.' : 'Rule created.'); dialog.value = false; await load() } catch (e) { ui.showSnackbar(e.response?.data?.message || Object.values(e.response?.data?.errors || {}).flat()[0] || 'Unable to save rule.', 'error') } finally { saving.value = false } }
const toggleStatus = async (item) => { try { item.is_active ? await timetableApi.rules.deactivate(item.id) : await timetableApi.rules.activate(item.id); ui.showSnackbar(`Rule ${item.is_active ? 'deactivated' : 'activated'}.`); await load() } catch (e) { ui.showSnackbar(e.response?.data?.message || 'Unable to update status.', 'error') } }
const confirmDelete = (item) => { selected.value = item; deleteDialog.value = true }
const remove = async () => { deleting.value = true; try { await timetableApi.rules.remove(selected.value.id); ui.showSnackbar('Rule deleted.'); deleteDialog.value = false; await load() } catch (e) { ui.showSnackbar(e.response?.data?.message || 'Unable to delete rule.', 'error') } finally { deleting.value = false } }
const displayValue = (item) => { const value = item.typed_value ?? item.rule_value; return typeof value === 'object' ? JSON.stringify(value) : String(value) }
const constraintColor = (v) => ({ hard: 'error', soft: 'warning', hard_or_soft: 'info' }[v] || 'default')
const titleCase = (v) => String(v || '').replaceAll('_', ' ').replace(/\b\w/g, c => c.toUpperCase())
onMounted(load)
</script>

<style scoped>
.hero-card { background: linear-gradient(135deg, rgba(var(--v-theme-deep-purple), .14), rgba(var(--v-theme-primary), .05)); border: 1px solid rgba(var(--v-theme-primary), .14); }
.rule-description { max-width: 360px; }
.font-monospace { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
.setup-page :deep(.v-data-table__tr:hover) { background: rgba(var(--v-theme-primary), .035); }
</style>
