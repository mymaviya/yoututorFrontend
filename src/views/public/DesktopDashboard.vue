<template>
  <div class="desktop-wallpaper">
    <!-- LEFT BLANK AREA FOR DESKTOP ICONS -->
    <section class="icons-area">
      <div class="icons-placeholder">
        <div class="folder-icon">▦</div>
        <h2>Desktop Icons Area</h2>
        <p>This area is left blank for your desktop icons</p>
      </div>
    </section>

    <!-- RIGHT DASHBOARD AREA -->
    <section class="dashboard-area">
      <header class="school-header">
        <div class="school-info">
          <div class="logo">📘</div>
          <div>
            <h1>YouTutor Public School</h1>
            <p>Excellence in Education</p>
          </div>
        </div>

        <div class="weather-box">
          <div class="weather-icon">⛅</div>
          <div>
            <h2>30°C</h2>
            <p>Partly Cloudy</p>
          </div>
        </div>
      </header>

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
            <h2>{{ nextBell.time }}</h2>
            <span>{{ nextBell.title }}</span>
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
                <h3>{{ currentClass.class }} - {{ currentClass.subject }}</h3>
                <span>{{ currentClass.room }}</span>
                <small>{{ currentClass.time }}</small>
              </div>
            </div>

            <hr />

            <div class="class-row">
              <div class="circle blue">📅</div>
              <div>
                <p>NEXT CLASS</p>
                <h3>{{ nextClass.class }} - {{ nextClass.subject }}</h3>
                <span>{{ nextClass.room }}</span>
                <small>{{ nextClass.time }}</small>
              </div>
            </div>
          </div>

          <div class="card notices-card">
            <h3>📢 Important Notices</h3>

            <div
              v-for="notice in notices"
              :key="notice.id"
              class="notice-item"
            >
              <div class="notice-icon">{{ notice.icon }}</div>
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

            <table>
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
            <p>
              The beautiful thing about learning is nobody can take it away from you.
            </p>
            <span>- B.B. King</span>
          </div>

          <div class="card events-card">
            <h3>🚩 Upcoming Events</h3>

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
        <span>School will remain closed on 10th July on account of Muharram.</span>
        <small>Have a great day! 😊</small>
      </footer>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const currentTime = ref('')
const currentDate = ref('')

const nextBell = ref({
  time: '10:30 AM',
  title: 'Short Break',
  raw: '10:30:00'
})

const currentClass = ref({
  class: 'Class 8A',
  subject: 'Mathematics',
  room: 'Room 204',
  time: '09:50 AM - 10:30 AM'
})

const nextClass = ref({
  class: 'Class 9B',
  subject: 'Science',
  room: 'Room 205',
  time: '10:40 AM - 11:20 AM'
})

const timetable = ref([
  {
    id: 1,
    time: '09:00 - 09:40',
    class: '7B',
    subject: 'Mathematics',
    room: '203',
    status: '✓ Completed',
    statusClass: 'completed'
  },
  {
    id: 2,
    time: '09:50 - 10:30',
    class: '8A',
    subject: 'Mathematics',
    room: '204',
    status: '● Ongoing',
    statusClass: 'ongoing'
  },
  {
    id: 3,
    time: '10:40 - 11:20',
    class: '9B',
    subject: 'Science',
    room: '205',
    status: '⏳ Upcoming',
    statusClass: 'upcoming'
  },
  {
    id: 4,
    time: '11:30 - 12:10',
    class: '-',
    subject: 'Free Period',
    room: '-',
    status: 'Free',
    statusClass: 'free'
  },
  {
    id: 5,
    time: '12:40 - 01:20',
    class: '10A',
    subject: 'English',
    room: '206',
    status: 'Upcoming',
    statusClass: ''
  }
])

const notices = ref([
  {
    id: 1,
    icon: '🗓️',
    title: 'Staff Meeting',
    description: 'Staff meeting today at 3:00 PM in the conference room.',
    date: '02 Jul'
  },
  {
    id: 2,
    icon: '📖',
    title: 'Unit Test',
    description: 'Unit test for classes 6 to 10 starts from next Monday.',
    date: '02 Jul'
  },
  {
    id: 3,
    icon: '🪪',
    title: 'ID Card Verification',
    description: 'All students must carry their ID cards daily.',
    date: '01 Jul'
  },
  {
    id: 4,
    icon: '🏆',
    title: 'Inter School Competition',
    description: 'Science exhibition on 15th July.',
    date: '01 Jul'
  }
])

const events = ref([
  { id: 1, date: '10 Jul', title: 'School closed on account of Muharram.' },
  { id: 2, date: '15 Jul', title: 'Science Exhibition' },
  { id: 3, date: '20 Jul', title: 'Monthly PTM' },
  { id: 4, date: '25 Jul', title: 'Inter House Sports Competition' }
])

const countdown = computed(() => {
  const now = new Date()
  const target = new Date()

  const [h, m, s] = nextBell.value.raw.split(':')
  target.setHours(Number(h), Number(m), Number(s || 0), 0)

  const diff = target - now

  if (diff <= 0) {
    return '00:00'
  }

  const minutes = Math.floor(diff / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

let timer = null

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

onMounted(() => {
  updateClock()
  timer = setInterval(updateClock, 1000)
})

onBeforeUnmount(() => {
  clearInterval(timer)
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
  position: relative;
  margin: 24px;
  border: 2px dashed rgba(255, 255, 255, 0.45);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.03);
}

.icons-placeholder {
  position: absolute;
  inset: 0;
  display: grid;
  place-content: center;
  text-align: center;
  color: rgba(255, 255, 255, 0.75);
  pointer-events: none;
}

.folder-icon {
  font-size: 86px;
  opacity: 0.75;
}

.icons-placeholder h2 {
  margin: 20px 0 8px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.icons-placeholder p {
  font-size: 20px;
  margin: 0;
}

.dashboard-area {
  padding: 24px 28px 18px 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
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
  font-size: 16px;
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