import DashboardLayout from '../layouts/DashboardLayout.vue'

export default {
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
        featureKey: 'academic_planning',
      },
    },
  ],
}
