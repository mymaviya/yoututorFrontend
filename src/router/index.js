import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import Home from '../views/Home.vue'
import About from '../views/About.vue'

import DashboardLayout from '../layouts/DashboardLayout.vue'
import AuthLayout from '../layouts/AuthLayout.vue'

const APP_NAME = 'GoLearn'

const routes = [
  { path: '/', redirect: '/login' },
  {
    path: '/',
    component: AuthLayout,
    children: [
      { path: 'login', component: () => import('../views/auth/Login.vue'), meta: {title:'Login'}, meta: {title:'Login'} },
      { path: 'register', component: () => import('../views/auth/Register.vue'), meta: {title:'Login'} },
      { path: 'forgot-password', component: () => import('../views/auth/ForgotPassword.vue'), meta: {title:'Login'}}
    ]
  },
  
  
  {
    path: '/',
    component: DashboardLayout,
    children: [
      { path: 'dashboard', component: () => import('../views/admin/Dashboard.vue'), meta: {title:'Login'} },
      { path: 'profile', component: () => import('../views/Profile.vue'), meta: {title:'Login'}, name: 'Profile' },
      { path: 'grades', component: () => import('../views/manage/Grades.vue'), meta: {title:'Login'}, name: 'Grades' },
      { path: 'subjects', component: () => import('../views/manage/Subjects.vue'), meta: {title:'Login'}, name: 'Subjects' },
      { path: 'lessons', component: () => import('../views/manage/Lessons.vue'), meta: {title:'Login'}, name: 'Lessons' },
      { path: 'questions', component: () => import('../views/exams/Questions/QuestionsPage.vue'), meta: {title:'Login'} },
      { path: 'questions/create', component: () => import('../views/exams/Questions/QuestionForm.vue'), meta: {title:'Login'} },
      { path: 'papers', component: () => import('../views/exams/Papers/PapersPage.vue'), meta: {title:'Login'} },
      { path: '/papers/:id/edit', component: () => import('../views/exams/Papers/PaperGenerator.vue'), meta: {title:'Login'} },
      { path: 'papers/generate', component: () => import('../views/exams/Papers/PaperGenerator.vue'), meta: {title:'Login'} },
      { path: 'papers/:id', component: () => import('../views/exams/Papers/PaperView.vue'), meta: {title:'Login'} },

      // Teachers
      { path: 'teachers', component: () => import('../views/admin/Teachers.vue'), meta: {title:'Login'}},

      // Reports
      { path: 'reports/teacher-progress', component: () => import('../views/reports/TeacherProgressReport.vue'), meta: {title:'Login'}},

      // Assign Task To Teachers

      {path: 'teacher-question-tasks',component: () => import('../views/admin/TeacherQuestionTasks.vue'), meta: {title:'Login'}},

      // { path: '/papers/:id', component: () => import('@/views/exam/Papers/PaperView.vue'), meta: {title:'Login'} },
      // { path: '/exams', component: () => import('../views/exams/Exams/ExamsPage.vue'), meta: {title:'Login'} },
      // { path: '/exams/create', component: () => import('../views/exams/Exams/ExamForm.vue'), meta: {title:'Login'}},
      // { path: '/results', component: () => import('../views/exams/Results/ResultsPage.vue'), meta: {title:'Login'}},
      { path: 'users', component: { template: '<h2>Users</h2>' } },
      { path: 'students', component: { template: '<h2>Students</h2>' } },
      { path: 'sales', component: { template: '<h2>Sales</h2>' } },
      { path: 'performance', component: { template: '<h2>Performance</h2>' } },
      { path: 'settings', component: { template: '<h2>Settings</h2>' } }
    ]
  }
]


const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  if (!auth.isAuth && to.path !== '/login' && to.path !== '/register') {
    return next('/login')
  }

  next()
})

router.afterEach((to, from) => {
  const toDepth = to.path.split('/').length
  const fromDepth = from.path.split('/').length
  const pageTitle = to.meta.title
  document.title = pageTitle ? `${pageTitle} | ${APP_NAME}` : APP_NAME

  to.meta.transition = toDepth < fromDepth ? 'slide-right' : 'slide-left'
})

export default router