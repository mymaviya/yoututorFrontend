<template>
  <v-container fluid class="pa-6">
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between mb-6">
          <div>
            <h2 class="text-h4 font-weight-bold mb-1">
              Bell Schedule Management
            </h2>
            <p class="text-body-2 text-medium-emphasis mb-0">
              Configure school start time, school over time, periods and breaks.
            </p>
          </div>

          <v-btn
            color="primary"
            :loading="generating"
            @click="generateSchedule"
          >
            Generate Schedule
          </v-btn>
        </div>
      </v-col>

      <v-col cols="12" md="5">
        <v-card rounded="lg">
          <v-card-title>
            Schedule Settings
          </v-card-title>

          <v-card-text>
            <v-form ref="formRef">
              <v-text-field
                v-model="form.name"
                label="Schedule Name"
                variant="outlined"
                density="comfortable"
              />

              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.assembly_bell_time"
                    label="Assembly Bell Time"
                    type="time"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.school_over_time"
                    label="School Over Time"
                    type="time"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
              </v-row>

              <v-text-field
                v-model.number="form.total_periods"
                label="Total Number of Periods"
                type="number"
                variant="outlined"
                density="comfortable"
              />

              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="form.teacher_arrival_before_assembly"
                    label="Teacher Arrival Before Assembly"
                    suffix="minutes"
                    type="number"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="form.student_arrival_before_assembly"
                    label="Student Arrival Before Assembly"
                    suffix="minutes"
                    type="number"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
              </v-row>

              <v-text-field
                v-model.number="form.assembly_duration"
                label="Assembly Duration"
                suffix="minutes"
                type="number"
                variant="outlined"
                density="comfortable"
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

              <v-row
                v-if="form.break_mode === 'short_only' || form.break_mode === 'short_and_long'"
              >
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="form.short_break_after_period"
                    label="Short Break After Period"
                    type="number"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="form.short_break_duration"
                    label="Short Break Duration"
                    suffix="minutes"
                    type="number"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
              </v-row>

              <v-row
                v-if="form.break_mode === 'long_only' || form.break_mode === 'short_and_long'"
              >
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="form.long_break_after_period"
                    label="Long Break After Period"
                    type="number"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="form.long_break_duration"
                    label="Long Break Duration"
                    suffix="minutes"
                    type="number"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="form.bus_dispersal_duration"
                    label="Bus Dispersal Duration"
                    suffix="minutes"
                    type="number"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="form.teacher_dispersal_after_school_over"
                    label="Teacher Dispersal After School Over"
                    suffix="minutes"
                    type="number"
                    variant="outlined"
                    density="comfortable"
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
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="form.regular_period_duration"
                    label="Regular Period Duration"
                    suffix="minutes"
                    type="number"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
              </v-row>

              <v-text-field
                v-model="form.effective_from"
                label="Effective From"
                type="date"
                variant="outlined"
                density="comfortable"
              />
            </v-form>
          </v-card-text>

          <v-card-actions class="px-4 pb-4">
            <v-btn
              color="primary"
              :loading="saving"
              @click="saveSettings"
            >
              Save Settings
            </v-btn>

            <v-btn
              variant="tonal"
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

            <v-table density="comfortable">
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
                <tr
                  v-for="bell in bells"
                  :key="bell.id"
                >
                  <td class="font-weight-medium">
                    {{ bell.title }}
                  </td>

                  <td>
                    <v-chip
                      size="small"
                      :color="chipColor(bell)"
                      variant="tonal"
                    >
                      {{ formatType(bell.type) }}
                    </v-chip>
                  </td>

                  <td>{{ formatTime(bell.start_time) }}</td>
                  <td>{{ formatTime(bell.end_time) }}</td>
                  <td>{{ bell.duration_minutes }} min</td>
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
          <v-card-title>
            Notes
          </v-card-title>

          <v-card-text>
            <ul class="text-body-2">
              <li>Enter only Assembly Bell Time, School Over Time and Total Periods.</li>
              <li>The system can automatically calculate period duration.</li>
              <li>You can choose no break, short break, long break, or both.</li>
              <li>After saving settings, click Generate Schedule.</li>
            </ul>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import api from "../../plugins/api";

const saving = ref(false)
const generating = ref(false)
const message = ref('')
const messageType = ref('success')
const bells = ref([])

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
  bus_dispersal_duration: 10,
  teacher_dispersal_after_school_over: 90,
  auto_calculate_period_duration: true,
  first_period_duration: null,
  regular_period_duration: null,
  effective_from: new Date().toISOString().slice(0, 10),
  is_active: true,
})

const setMessage = (text, type = 'success') => {
  message.value = text
  messageType.value = type
}

const normalizeTime = (time) => {
  if (!time) return ''
  return String(time).slice(0, 5)
}

const fillForm = (data) => {
  if (!data) return

  Object.assign(form, {
    ...data,
    assembly_bell_time: normalizeTime(data.assembly_bell_time),
    school_over_time: normalizeTime(data.school_over_time),
    effective_from: data.effective_from
      ? String(data.effective_from).slice(0, 10)
      : new Date().toISOString().slice(0, 10),
  })
}

const loadData = async () => {
  try {
    const { data } = await api.get('/bell-schedules/settings')
    fillForm(data.data)
    await loadPreview()
  } catch (error) {
    setMessage(
      error.response?.data?.message || 'Failed to load bell schedule.',
      'error'
    )
  }
}

const loadPreview = async () => {
  try {
    const { data } = await api.get('/bell-schedules/preview')
    bells.value = data.data || []
  } catch (error) {
    setMessage(
      error.response?.data?.message || 'Failed to load generated schedule.',
      'error'
    )
  }
}

const saveSettings = async () => {
  saving.value = true

  try {
    const { data } = await api.post('/bell-schedules/settings', form)
    fillForm(data.data)
    setMessage(data.message || 'Settings saved successfully.')
  } catch (error) {
    setMessage(
      error.response?.data?.message || 'Failed to save settings.',
      'error'
    )
  } finally {
    saving.value = false
  }
}

const generateSchedule = async () => {
  generating.value = true

  try {
    const { data } = await api.post('/bell-schedules/generate')
    bells.value = data.data || []
    setMessage(data.message || 'Bell schedule generated successfully.')
  } catch (error) {
    setMessage(
      error.response?.data?.message || 'Failed to generate schedule.',
      'error'
    )
  } finally {
    generating.value = false
  }
}

const formatTime = (time) => {
  if (!time) return '-'

  const [hour, minute] = String(time).split(':')
  const date = new Date()
  date.setHours(Number(hour), Number(minute), 0)

  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatType = (type) => {
  return String(type || '')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

const chipColor = (bell) => {
  if (bell.is_dispersal) return 'red'
  if (bell.is_break) return 'orange'
  if (bell.is_teaching_period) return 'green'
  if (bell.type === 'assembly') return 'blue'
  return 'primary'
}

onMounted(() => {
  loadData()
})
</script>