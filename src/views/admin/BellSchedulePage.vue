<template>
  <v-container fluid class="pa-6">
    <v-row>
      <v-col cols="12">
        <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-6">
          <div>
            <h2 class="text-h4 font-weight-bold mb-1">Bell Schedule Management</h2>
            <p class="text-body-2 text-medium-emphasis mb-0">
              Configure school timings, teaching periods, breaks and dispersal.
            </p>
          </div>

          <v-btn
            color="primary"
            prepend-icon="mdi-auto-fix"
            :loading="generating"
            :disabled="loading || saving || generating"
            @click="generateSchedule"
          >
            Generate Schedule
          </v-btn>
        </div>
      </v-col>

      <v-col cols="12" md="5">
        <v-card rounded="lg">
          <v-card-title>Schedule Settings</v-card-title>

          <v-card-text>
            <v-skeleton-loader v-if="loading" type="article, article, actions" />

            <v-form v-else ref="formRef" @submit.prevent="saveSettings">
              <v-text-field
                v-model.trim="form.name"
                label="Schedule Name"
                variant="outlined"
                density="comfortable"
                :rules="requiredRules"
              />

              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.assembly_bell_time"
                    label="Assembly Bell Time"
                    type="time"
                    variant="outlined"
                    density="comfortable"
                    :rules="requiredRules"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.school_over_time"
                    label="School Over Time"
                    type="time"
                    variant="outlined"
                    density="comfortable"
                    :rules="requiredRules"
                  />
                </v-col>
              </v-row>

              <v-text-field
                v-model.number="form.total_periods"
                label="Total Number of Periods"
                type="number"
                min="1"
                max="20"
                variant="outlined"
                density="comfortable"
                :rules="periodRules"
              />

              <v-alert type="info" variant="tonal" density="comfortable" class="mb-4">
                First period will be {{ form.first_period_extra_minutes || 0 }} minutes longer than regular periods.
              </v-alert>

              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="form.first_period_extra_minutes"
                    label="First Period Extra Minutes"
                    suffix="minutes"
                    type="number"
                    min="0"
                    variant="outlined"
                    density="comfortable"
                    :rules="nonNegativeRules"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="form.period_after_break_gap"
                    label="Gap After Break"
                    suffix="minutes"
                    type="number"
                    min="0"
                    variant="outlined"
                    density="comfortable"
                    :rules="nonNegativeRules"
                  />
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="form.teacher_arrival_before_assembly"
                    label="Teacher Arrival Before Assembly"
                    suffix="minutes"
                    type="number"
                    min="0"
                    variant="outlined"
                    density="comfortable"
                    :rules="nonNegativeRules"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="form.student_arrival_before_assembly"
                    label="Student Arrival Before Assembly"
                    suffix="minutes"
                    type="number"
                    min="0"
                    variant="outlined"
                    density="comfortable"
                    :rules="nonNegativeRules"
                  />
                </v-col>
              </v-row>

              <v-text-field
                v-model.number="form.assembly_duration"
                label="Assembly Duration"
                suffix="minutes"
                type="number"
                min="0"
                variant="outlined"
                density="comfortable"
                :rules="nonNegativeRules"
              />

              <v-select
                v-model="form.break_mode"
                label="Break Mode"
                :items="breakModes"
                item-title="title"
                item-value="value"
                variant="outlined"
                density="comfortable"
              />

              <v-row v-if="hasShortBreak">
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="form.short_break_after_period"
                    label="Short Break After Period"
                    type="number"
                    min="1"
                    :max="form.total_periods"
                    variant="outlined"
                    density="comfortable"
                    :rules="breakPeriodRules"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="form.short_break_duration"
                    label="Short Break Duration"
                    suffix="minutes"
                    type="number"
                    min="1"
                    variant="outlined"
                    density="comfortable"
                    :rules="positiveRules"
                  />
                </v-col>
              </v-row>

              <v-row v-if="hasLongBreak">
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="form.long_break_after_period"
                    label="Long Break After Period"
                    type="number"
                    min="1"
                    :max="form.total_periods"
                    variant="outlined"
                    density="comfortable"
                    :rules="breakPeriodRules"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="form.long_break_duration"
                    label="Long Break Duration"
                    suffix="minutes"
                    type="number"
                    min="1"
                    variant="outlined"
                    density="comfortable"
                    :rules="positiveRules"
                  />
                </v-col>
              </v-row>

              <v-switch
                v-model="form.bus_dispersal_enabled"
                label="Enable Bus Dispersal"
                color="primary"
              />

              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="form.bus_dispersal_duration"
                    label="Bus Dispersal Duration"
                    suffix="minutes"
                    type="number"
                    min="0"
                    variant="outlined"
                    density="comfortable"
                    :disabled="!form.bus_dispersal_enabled"
                    :rules="form.bus_dispersal_enabled ? nonNegativeRules : []"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="form.teacher_dispersal_after_school_over"
                    label="Teacher Dispersal After School Over"
                    suffix="minutes"
                    type="number"
                    min="0"
                    variant="outlined"
                    density="comfortable"
                    :rules="nonNegativeRules"
                  />
                </v-col>
              </v-row>

              <v-switch
                v-model="form.auto_calculate_period_duration"
                label="Auto Calculate Period Duration"
                color="primary"
              />

              <v-row v-if="!form.auto_calculate_period_duration">
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="form.first_period_duration"
                    label="First Period Duration"
                    suffix="minutes"
                    type="number"
                    min="1"
                    variant="outlined"
                    density="comfortable"
                    :rules="positiveRules"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="form.regular_period_duration"
                    label="Regular Period Duration"
                    suffix="minutes"
                    type="number"
                    min="1"
                    variant="outlined"
                    density="comfortable"
                    :rules="positiveRules"
                  />
                </v-col>
              </v-row>

              <v-text-field
                v-model="form.effective_from"
                label="Effective From"
                type="date"
                variant="outlined"
                density="comfortable"
                :rules="requiredRules"
              />
            </v-form>
          </v-card-text>

          <v-card-actions class="px-4 pb-4">
            <v-btn
              color="primary"
              :loading="saving"
              :disabled="loading || generating"
              @click="saveSettings"
            >
              Save Settings
            </v-btn>

            <v-btn
              variant="tonal"
              :disabled="loading || saving || generating"
              @click="loadData"
            >
              Reset
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12" md="7">
        <v-card rounded="lg">
          <v-card-title class="d-flex align-center justify-space-between">
            <span>Generated Bell Schedule</span>

            <v-btn
              size="small"
              variant="tonal"
              prepend-icon="mdi-refresh"
              :loading="previewLoading"
              :disabled="loading || generating"
              @click="loadPreview"
            >
              Refresh
            </v-btn>
          </v-card-title>

          <v-card-text>
            <v-alert
              v-if="message"
              :type="messageType"
              variant="tonal"
              class="mb-4"
              closable
              @click:close="message = ''"
            >
              {{ message }}
            </v-alert>

            <v-skeleton-loader v-if="previewLoading" type="table" />

            <v-table v-else density="comfortable">
              <thead>
                <tr>
                  <th>Bell</th>
                  <th>Type</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Duration</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="bell in bells" :key="bell.id || `${bell.type}-${bell.start_time}`">
                  <td class="font-weight-medium">{{ bell.title }}</td>
                  <td>
                    <v-chip size="small" :color="chipColor(bell)" variant="tonal">
                      {{ formatType(bell.type) }}
                    </v-chip>
                  </td>
                  <td>{{ formatTime(bell.start_time) }}</td>
                  <td>{{ formatTime(bell.end_time) }}</td>
                  <td>{{ bell.duration_minutes ?? 0 }} min</td>
                </tr>

                <tr v-if="!bells.length">
                  <td colspan="5" class="text-center text-medium-emphasis py-8">
                    No bell schedule generated yet.
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>

        <v-card rounded="lg" class="mt-4">
          <v-card-title>Notes</v-card-title>
          <v-card-text>
            <ul class="text-body-2">
              <li>Save the settings before generating a new schedule.</li>
              <li>The first period can be longer than regular periods.</li>
              <li>Break placement must be within the configured period count.</li>
              <li>Bus dispersal can be enabled or disabled.</li>
            </ul>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import api from '../../plugins/api'
import { formatTime } from '../../utils/date'

const formRef = ref(null)
const loading = ref(false)
const previewLoading = ref(false)
const saving = ref(false)
const generating = ref(false)
const message = ref('')
const messageType = ref('success')
const bells = ref([])

const localDate = (date = new Date()) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const breakModes = [
  { title: 'No Break', value: 'none' },
  { title: 'Short Break Only', value: 'short_only' },
  { title: 'Long Break Only', value: 'long_only' },
  { title: 'Short + Long Break', value: 'short_and_long' },
]

const form = reactive({
  id: null,
  name: 'Default Bell Schedule',
  assembly_bell_time: '07:50',
  school_over_time: '13:00',
  total_periods: 7,
  teacher_arrival_before_assembly: 30,
  student_arrival_before_assembly: 10,
  assembly_duration: 10,
  break_mode: 'long_only',
  short_break_after_period: null,
  short_break_duration: 15,
  long_break_after_period: 4,
  long_break_duration: 20,
  first_period_extra_minutes: 5,
  period_after_break_gap: 5,
  bus_dispersal_enabled: true,
  bus_dispersal_duration: 10,
  teacher_dispersal_after_school_over: 90,
  auto_calculate_period_duration: true,
  first_period_duration: null,
  regular_period_duration: null,
  effective_from: localDate(),
  is_active: true,
})

const hasShortBreak = computed(() => ['short_only', 'short_and_long'].includes(form.break_mode))
const hasLongBreak = computed(() => ['long_only', 'short_and_long'].includes(form.break_mode))

const requiredRules = [(value) => Boolean(value) || 'This field is required.']
const nonNegativeRules = [(value) => Number(value) >= 0 || 'Enter zero or a positive number.']
const positiveRules = [(value) => Number(value) > 0 || 'Enter a number greater than zero.']
const periodRules = [
  (value) => Number(value) >= 1 || 'At least one period is required.',
  (value) => Number(value) <= 20 || 'Maximum 20 periods are allowed.',
]
const breakPeriodRules = [
  (value) => Number(value) >= 1 || 'Enter a valid period number.',
  (value) => Number(value) < Number(form.total_periods) || 'Break must be before the last period.',
]

const setMessage = (text, type = 'success') => {
  message.value = text
  messageType.value = type
}

const errorMessage = (error, fallback) => error?.response?.data?.message || fallback
const normalizeTime = (time) => (time ? String(time).slice(0, 5) : '')

const fillForm = (data) => {
  if (!data) return

  Object.assign(form, {
    ...data,
    assembly_bell_time: normalizeTime(data.assembly_bell_time),
    school_over_time: normalizeTime(data.school_over_time),
    bus_dispersal_enabled: Boolean(data.bus_dispersal_enabled),
    auto_calculate_period_duration: Boolean(data.auto_calculate_period_duration),
    first_period_extra_minutes: data.first_period_extra_minutes ?? 5,
    period_after_break_gap: data.period_after_break_gap ?? 5,
    effective_from: data.effective_from ? String(data.effective_from).slice(0, 10) : localDate(),
  })
}

const payload = () => ({
  name: form.name,
  assembly_bell_time: form.assembly_bell_time,
  school_over_time: form.school_over_time,
  total_periods: Number(form.total_periods),
  teacher_arrival_before_assembly: Number(form.teacher_arrival_before_assembly || 0),
  student_arrival_before_assembly: Number(form.student_arrival_before_assembly || 0),
  assembly_duration: Number(form.assembly_duration || 0),
  break_mode: form.break_mode,
  short_break_after_period: hasShortBreak.value ? Number(form.short_break_after_period) : null,
  short_break_duration: hasShortBreak.value ? Number(form.short_break_duration) : null,
  long_break_after_period: hasLongBreak.value ? Number(form.long_break_after_period) : null,
  long_break_duration: hasLongBreak.value ? Number(form.long_break_duration) : null,
  first_period_extra_minutes: Number(form.first_period_extra_minutes || 0),
  period_after_break_gap: Number(form.period_after_break_gap || 0),
  bus_dispersal_enabled: Boolean(form.bus_dispersal_enabled),
  bus_dispersal_duration: form.bus_dispersal_enabled ? Number(form.bus_dispersal_duration || 0) : 0,
  teacher_dispersal_after_school_over: Number(form.teacher_dispersal_after_school_over || 0),
  auto_calculate_period_duration: Boolean(form.auto_calculate_period_duration),
  first_period_duration: form.auto_calculate_period_duration ? null : Number(form.first_period_duration),
  regular_period_duration: form.auto_calculate_period_duration ? null : Number(form.regular_period_duration),
  effective_from: form.effective_from,
  is_active: Boolean(form.is_active),
})

const sortBells = (items) => [...(Array.isArray(items) ? items : [])].sort((a, b) =>
  String(a.start_time || '').localeCompare(String(b.start_time || ''))
)

const loadPreview = async () => {
  previewLoading.value = true
  try {
    const { data } = await api.get('/bell-schedules/preview')
    bells.value = sortBells(data?.data)
  } catch (error) {
    bells.value = []
    setMessage(errorMessage(error, 'Failed to load generated schedule.'), 'error')
  } finally {
    previewLoading.value = false
  }
}

const loadData = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/bell-schedules/settings')
    fillForm(data?.data)
    await loadPreview()
  } catch (error) {
    setMessage(errorMessage(error, 'Failed to load bell schedule.'), 'error')
  } finally {
    loading.value = false
  }
}

const saveSettings = async () => {
  if (saving.value) return

  const validation = await formRef.value?.validate()
  if (validation && !validation.valid) return

  saving.value = true
  try {
    const { data } = await api.post('/bell-schedules/settings', payload())
    fillForm(data?.data)
    setMessage(data?.message || 'Settings saved successfully.')
  } catch (error) {
    setMessage(errorMessage(error, 'Failed to save settings.'), 'error')
  } finally {
    saving.value = false
  }
}

const generateSchedule = async () => {
  if (generating.value) return

  const validation = await formRef.value?.validate()
  if (validation && !validation.valid) return

  generating.value = true
  try {
    await api.post('/bell-schedules/settings', payload())
    const { data } = await api.post('/bell-schedules/generate')
    bells.value = sortBells(data?.data)
    setMessage(data?.message || 'Bell schedule generated successfully.')
  } catch (error) {
    setMessage(errorMessage(error, 'Failed to generate schedule.'), 'error')
  } finally {
    generating.value = false
  }
}

const formatType = (type) => String(type || '')
  .replaceAll('_', ' ')
  .replace(/\b\w/g, (character) => character.toUpperCase())

const chipColor = (bell) => {
  if (bell.is_dispersal) return 'red'
  if (bell.is_break) return 'orange'
  if (bell.is_teaching_period) return 'green'
  if (bell.type === 'assembly') return 'blue'
  return 'primary'
}

onMounted(loadData)
</script>
