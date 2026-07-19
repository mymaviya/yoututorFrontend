import DashboardLayout from '../layouts/DashboardLayout.vue'

export default {
  path: '/',
  component: DashboardLayout,
  meta: { requiresAuth: true },
  children: [
    {
      path: 'academic-planning/timetable-generator',
      name: 'timetable.generator',
      component: () => import('../pages/AcademicPlanning/TimetableGenerator/GeneratorPage.vue'),
      meta: {
        title: 'Smart Timetable Generator',
        requiresAuth: true,
        featureKey: 'academic_planning',
      },
    },
    {
      path: 'academic-planning/timetable-batch-generator',
      name: 'timetable.batch-generator',
      component: () => import('../pages/AcademicPlanning/TimetableGenerator/BatchGeneratorPage.vue'),
      meta: {
        title: 'Batch Timetable Generator',
        requiresAuth: true,
        featureKey: 'academic_planning',
      },
    },
    {
      path: 'academic-planning/timetable-templates',
      name: 'timetable.templates',
      component: () => import('../pages/AcademicPlanning/TimetableSetup/TemplatesPage.vue'),
      meta: {
        title: 'Timetable Templates',
        requiresAuth: true,
        featureKey: 'academic_planning',
      },
    },
    {
      path: 'academic-planning/timetable-rules',
      name: 'timetable.rules',
      component: () => import('../pages/AcademicPlanning/TimetableSetup/RulesPage.vue'),
      meta: {
        title: 'Timetable Rules',
        requiresAuth: true,
        featureKey: 'academic_planning',
      },
    },
    {
      path: 'academic-planning/timetable-rooms',
      name: 'timetable.rooms',
      component: () => import('../pages/AcademicPlanning/TimetableSetup/RoomsPage.vue'),
      meta: {
        title: 'Timetable Rooms',
        requiresAuth: true,
        featureKey: 'academic_planning',
      },
    },
    {
      path: 'academic-planning/parallel-groups',
      name: 'timetable.parallel-groups',
      component: () => import('../pages/AcademicPlanning/TimetableSetup/ParallelGroupsPage.vue'),
      meta: {
        title: 'Parallel Groups',
        requiresAuth: true,
        featureKey: 'academic_planning',
      },
    },
  ],
}
