<template>
  <div class="desktop-wallpaper">
    <!-- LEFT BLANK AREA FOR DESKTOP ICONS -->
    <section class="icons-area"></section>

    <!-- RIGHT DASHBOARD AREA -->
    <section class="dashboard-area">
      <header class="school-header">
        <div class="school-info">
          <div class="logo">
            <img
              v-if="school.logo"
              :src="school.logo"
              alt="School Logo"
            />
            <span v-else>📘</span>
          </div>

          <div>
            <h1>{{ school.name }}</h1>
            <p>{{ school.tagline }}</p>
          </div>
        </div>

        <div class="weather-box">
          <div class="weather-icon">⛅</div>
          <div>
            <h2>{{ weather.temperature }}</h2>
            <p>{{ weather.condition }}</p>
          </div>
        </div>
      </header>

      <div
        v-if="errorMessage"
        class="error-banner"
      >
        {{ errorMessage }}
      </div>

      <div class="top-grid">
        <div class="card clock-card">
          <div class="analog">🕘</div>
          <div>
            <h2>{{ currentTime }}</h2>
            <p>{{ currentDate }}</p>
          </div>
        </div>

        <div class="card bell-card">
          <div class="bell-icon">🔔</div>

          <div>
            <p>NEXT BELL</p>

            <h2>
              {{ nextBell?.time || 'No Bell' }}
            </h2>

            <span>
              {{ nextBell?.title || 'No upcoming bell found' }}
            </span>
          </div>

          <div class="countdown">
            {{ countdown }}
            <small>MIN : SEC</small>
          </div>
        </div>
      </div>

      <div class="main-grid">
        <div class="left-widgets">
          <div class="card class-card">
            <div class="class-row">
              <div class="circle green">👨‍🏫</div>

              <div>
                <p>CURRENT CLASS</p>

                <h3>
                  {{ currentClass?.class || 'No Current Class' }}
                  <template v-if="currentClass?.subject">
                    - {{ currentClass.subject }}
                  </template>
                </h3>

                <span>{{ currentClass?.room || '-' }}</span>
                <small>{{ currentClass?.time || '-' }}</small>
              </div>
            </div>

            <hr />

            <div class="class-row">
              <div class="circle blue">📅</div>

              <div>
                <p>NEXT CLASS</p>

                <h3>
                  {{ nextClass?.class || 'No Upcoming Class' }}
                  <template v-if="nextClass?.subject">
                    - {{ nextClass.subject }}
                  </template>
                </h3>

                <span>{{ nextClass?.room || '-' }}</span>
                <small>{{ nextClass?.time || '-' }}</small>
              </div>
            </div>
          </div>

          <div class="card notices-card">
            <h3>📢 Important Notices</h3>

            <div
              v-if="notices.length === 0"
              class="empty-state"
            >
              No notices found
            </div>

            <div
              v-for="notice in notices"
              :key="notice.id"
              class="notice-item"
            >
              <div class="notice-icon">
                {{ notice.icon || '📢' }}
              </div>

              <div>
                <h4>{{ notice.title }}</h4>
                <p>{{ notice.description }}</p>
              </div>

              <span>{{ notice.date }}</span>
            </div>
          </div>
        </div>

        <div class="right-widgets">
          <div class="card timetable-card">
            <h3>📅 Today's Timetable</h3>

            <div
              v-if="timetable.length === 0"
              class="empty-state"
            >
              No timetable found for today
            </div>

            <table v-else>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Class</th>
                  <th>Subject</th>
                  <th>Room</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="row in timetable"
                  :key="row.id"
                  :class="row.statusClass"
                >
                  <td>{{ row.time }}</td>
                  <td>{{ row.class }}</td>
                  <td>{{ row.subject }}</td>
                  <td>{{ row.room }}</td>
                  <td>{{ row.status }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="card quote-card">
            <h3>❝ Quote of the Day</h3>
            <p>{{ quote.text }}</p>
            <span>- {{ quote.author }}</span>
          </div>

          <div class="card events-card">
            <h3>🚩 Upcoming Events</h3>

            <div
              v-if="events.length === 0"
              class="empty-state"
            >
              No upcoming events found
            </div>

            <div
              v-for="event in events"
              :key="event.id"
              class="event-item"
            >
              <strong>{{ event.date }}</strong>
              <span>{{ event.title }}</span>
            </div>
          </div>
        </div>
      </div>

      <footer class="ticker">
        <strong>📢 Announcement:</strong>

        <span>
          {{ tickerMessage }}
        </span>

        <small>
          Last updated: {{ lastUpdated || '--' }}
        </small>
      </footer>
    </section>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import api from '../../plugins/api'

const route = useRoute()

const currentTime = ref('')
const currentDate = ref('')
const lastUpdated = ref('')
const errorMessage = ref('')

const school = ref({
  name: 'YouTutor Public School',
  tagline: 'Excellence in Education',
  logo: null
})

const weather = ref({
  temperature: '30°C',
  condition: 'Partly Cloudy'
})

const nextBell = ref(null)
const currentClass = ref(null)
const nextClass = ref(null)
const timetable = ref([])
const notices = ref([])
const events = ref([])

const quote = ref({
  text: 'The beautiful thing about learning is nobody can take it away from you.',
  author: 'B.B. King'
})

const tickerMessage = computed(() => {
  if (notices.value.length > 0) {
    return notices.value[0].description || notices.value[0].title
  }

  if (events.value.length > 0) {
    return events.value[0].title
  }

  return 'Welcome to YouTutor ERP Desktop Dashboard.'
})

const teacherId = computed(() => {
  return (
    route.query.teacher_id ||
    localStorage.getItem('desktop_dashboard_teacher_id') ||
    ''
  )
})

const countdown = computed(() => {
  if (!nextBell.value?.raw) {
    return '--:--'
  }

  const now = new Date()
  const target = new Date()
  const [h, m, s] = String(nextBell.value.raw).split(':')

  target.setHours(Number(h), Number(m), Number(s || 0), 0)

  const diff = target - now

  if (diff <= 0) {
    return '00:00'
  }

  const minutes = Math.floor(diff / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

let clockTimer = null
let refreshTimer = null

const normalizeClass = (value) => {
  if (!value) {
    return null
  }

  return {
    class: value.class || value.grade || '-',
    subject: value.subject || '-',
    room: value.room || '-',
    time: value.time || '-'
  }
}

const loadDashboard = async () => {
  try {
    errorMessage.value = ''

    const params = {}

    if (teacherId.value) {
      params.teacher_id = teacherId.value
    }

    const { data } = await api.get('/desktop-dashboard/data', {
      params
    })

    school.value = {
      ...school.value,
      ...(data.school || {})
    }

    weather.value = {
      ...weather.value,
      ...(data.weather || {})
    }

    nextBell.value = data.next_bell || null
    currentClass.value = normalizeClass(data.current_class)
    nextClass.value = normalizeClass(data.next_class)
    timetable.value = Array.isArray(data.timetable) ? data.timetable : []
    notices.value = Array.isArray(data.notices) ? data.notices : []
    events.value = Array.isArray(data.events) ? data.events : []

    if (data.quote) {
      quote.value = {
        ...quote.value,
        ...data.quote
      }
    }

    lastUpdated.value = new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    console.error('Desktop dashboard API error:', error)

    errorMessage.value =
      'Unable to fetch live dashboard data. Please check backend API.'
  }
}

const updateClock = () => {
  const now = new Date()

  currentTime.value = now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })

  currentDate.value = now.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

onMounted(async () => {
  updateClock()
  await loadDashboard()

  clockTimer = setInterval(updateClock, 1000)
  refreshTimer = setInterval(loadDashboard, 30000)
})

onBeforeUnmount(() => {
  clearInterval(clockTimer)
  clearInterval(refreshTimer)
})
</script>

<style scoped>
.desktop-wallpaper {
  width: 100vw;
  height: 100vh;
  display: grid;
  grid-template-columns: 38% 62%;
  overflow: hidden;
  color: white;
  background:
    linear-gradient(rgba(5, 15, 35, 0.55), rgba(5, 15, 35, 0.8)),
    radial-gradient(circle at bottom left, #1e90ff55, transparent 35%),
    linear-gradient(135deg, #061426, #08233f, #07111f);
  font-family: Inter, Roboto, Arial, sans-serif;
}

.icons-area {
  min-height: 100vh;
  pointer-events: none;
}

.dashboard-area {
  padding: 24px 28px 18px 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
}

.school-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.school-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo {
  width: 78px;
  height: 78px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 42px;
  background: linear-gradient(135deg, #0ea5e9, #1e3a8a);
  border: 2px solid #facc15;
  overflow: hidden;
}

.logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.school-info h1 {
  margin: 0;
  font-size: 34px;
  line-height: 1;
}

.school-info p {
  margin: 8px 0 0;
  color: #facc15;
  font-size: 18px;
}

.weather-box {
  display: flex;
  align-items: center;
  gap: 14px;
}

.weather-icon {
  font-size: 48px;
}

.weather-box h2,
.weather-box p {
  margin: 0;
}

.error-banner {
  padding: 10px 14px;
  border-radius: 12px;
  background: rgba(220, 38, 38, 0.85);
  border: 1px solid rgba(254, 202, 202, 0.8);
  font-size: 14px;
}

.top-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.main-grid {
  flex: 1;
  display: grid;
  grid-template-columns: 42% 58%;
  gap: 14px;
  min-height: 0;
}

.left-widgets,
.right-widgets {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 0;
}

.card {
  background: rgba(4, 18, 38, 0.78);
  border: 1px solid rgba(56, 189, 248, 0.35);
  border-radius: 16px;
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(14px);
}

.clock-card,
.bell-card {
  min-height: 120px;
  padding: 18px;
  display: flex;
  align-items: center;
  gap: 18px;
}

.analog {
  font-size: 58px;
}

.clock-card h2 {
  margin: 0;
  font-size: 48px;
}

.clock-card p {
  margin: 6px 0 0;
  color: #67e8f9;
  font-size: 20px;
}

.bell-icon {
  font-size: 48px;
}

.bell-card p,
.class-card p {
  margin: 0;
  text-transform: uppercase;
  font-weight: 700;
  opacity: 0.9;
}

.bell-card h2 {
  margin: 8px 0;
  color: #facc15;
  font-size: 34px;
}

.countdown {
  margin-left: auto;
  width: 96px;
  height: 96px;
  border: 8px solid #facc15;
  border-radius: 50%;
  display: grid;
  place-content: center;
  text-align: center;
  font-size: 24px;
  font-weight: 800;
}

.countdown small {
  display: block;
  font-size: 10px;
}

.class-card {
  padding: 18px;
}

.class-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.circle {
  width: 64px;
  height: 64px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  font-size: 34px;
  flex: 0 0 auto;
}

.green {
  background: linear-gradient(135deg, #16a34a, #22c55e);
}

.blue {
  background: linear-gradient(135deg, #0284c7, #2563eb);
}

.class-card h3 {
  margin: 8px 0;
  font-size: 24px;
  color: #4ade80;
}

.class-row:last-child h3 {
  color: #38bdf8;
}

.class-card small,
.class-card span {
  display: block;
  margin-top: 4px;
  opacity: 0.9;
}

hr {
  border: 0;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  margin: 18px 0;
}

.notices-card {
  flex: 1;
  padding: 16px;
  overflow: hidden;
}

.notices-card h3,
.timetable-card h3,
.quote-card h3,
.events-card h3 {
  margin: 0 0 14px;
  font-size: 20px;
}

.notice-item {
  display: grid;
  grid-template-columns: 46px 1fr auto;
  gap: 12px;
  padding: 10px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
}

.notice-icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: linear-gradient(135deg, #e11d48, #7c3aed);
  display: grid;
  place-items: center;
  font-size: 22px;
}

.notice-item h4,
.notice-item p {
  margin: 0;
}

.notice-item p {
  font-size: 13px;
  opacity: 0.9;
}

.notice-item span {
  font-size: 13px;
  opacity: 0.85;
}

.timetable-card {
  padding: 16px;
}

table {
  width: 100%;
  border-collapse: collapse;
  overflow: hidden;
}

th,
td {
  padding: 11px 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  text-align: left;
  font-size: 14px;
}

th {
  color: #bfdbfe;
  text-transform: uppercase;
  font-size: 12px;
}

.ongoing {
  color: #4ade80;
  font-weight: 800;
}

.upcoming {
  color: #facc15;
}

.completed {
  opacity: 0.75;
}

.free {
  color: #86efac;
}

.quote-card {
  padding: 20px;
  background:
    linear-gradient(rgba(4, 18, 38, 0.75), rgba(4, 18, 38, 0.85)),
    radial-gradient(circle at bottom right, #22c55e55, transparent 45%);
}

.quote-card p {
  font-size: 18px;
  line-height: 1.45;
  font-style: italic;
}

.quote-card span {
  color: #86efac;
}

.events-card {
  padding: 16px;
}

.event-item {
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: 12px;
  padding: 10px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
}

.event-item strong {
  color: #38bdf8;
}

.empty-state {
  padding: 18px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.07);
  color: rgba(255, 255, 255, 0.75);
  text-align: center;
}

.ticker {
  min-height: 48px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 18px;
  border-radius: 14px;
  background: rgba(4, 18, 38, 0.82);
  border: 1px solid rgba(56, 189, 248, 0.35);
}

.ticker strong {
  color: #facc15;
}

.ticker small {
  margin-left: auto;
  font-size: 14px;
  white-space: nowrap;
}

@media (max-width: 1200px) {
  .desktop-wallpaper {
    grid-template-columns: 34% 66%;
  }

  .clock-card h2 {
    font-size: 36px;
  }

  .school-info h1 {
    font-size: 28px;
  }
}
</style>
