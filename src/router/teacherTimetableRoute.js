import DashboardLayout from '../layouts/DashboardLayout.vue'

const teacherTimetableRoute = {
  path: '/',
  component: DashboardLayout,
  meta: { requiresAuth: true },
  children: [
    {
      path: 'teacher-timetable',
      name: 'teacher.timetable',
      component: () => import('../views/timetable/TeacherTimetablePage.vue'),
      meta: {
        title: 'Teacher Timetable',
        requiresAuth: true,
        feature_key: 'teacher_timetable',
      },
    },
  ],
}

export default teacherTimetableRoute
