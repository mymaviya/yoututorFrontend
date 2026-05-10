import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import Home from '../views/Home.vue'
import About from '../views/About.vue'

import DashboardLayout from '../layouts/DashboardLayout.vue'

const routes = [
  { path: '/login', component: () => import('../views/Login.vue') },
  { path: '/register', component: () => import('../views/Register.vue') },
  
  {
    path: '/',
    component: DashboardLayout,
    children: [
      { path: 'dashboard', component: () => import('../views/Dashboard.vue') },
      { path: 'profile', component: () => import('../views/Profile.vue'), name: 'Profile' },
      { path: 'grades', component: () => import('../views/manage/Grades.vue'), name: 'Grades' },
      { path: 'subjects', component: () => import('../views/manage/Subjects.vue'), name: 'Subjects' },
      { path: 'lessons', component: () => import('../views/manage/Lessons.vue'), name: 'Lessons' },
      { path: 'questions', component: () => import('../views/exams/Questions/QuestionsPage.vue') },
      { path: 'questions/create', component: () => import('../views/exams/Questions/QuestionForm.vue') },
      { path: 'papers', component: () => import('../views/exams/Papers/PapersPage.vue') },
      { path: '/papers/:id/edit', component: () => import('../views/exams/Papers/PaperGenerator.vue') },
      { path: 'papers/generate', component: () => import('../views/exams/Papers/PaperGenerator.vue') },
      { path: 'papers/:id', component: () => import('../views/exams/Papers/PaperView.vue') },

      // { path: '/papers/:id', component: () => import('@/views/exam/Papers/PaperView.vue') },
      // { path: '/exams', component: () => import('../views/exams/Exams/ExamsPage.vue') },
      // { path: '/exams/create', component: () => import('../views/exams/Exams/ExamForm.vue')},
      // { path: '/results', component: () => import('../views/exams/Results/ResultsPage.vue')},
      { path: 'users', component: { template: '<h2>Users</h2>' } },
      { path: 'teachers', component: { template: '<h2>Teachers</h2>' } },
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

  to.meta.transition = toDepth < fromDepth ? 'slide-right' : 'slide-left'
})

export default router