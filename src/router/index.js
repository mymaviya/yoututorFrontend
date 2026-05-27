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
      { path: 'dashboard', name:'Dashboard', component: () => import('../views/admin/Dashboard.vue'), meta: {title:'Dashboard'} },
      { path: 'profile', name:'profile', component: () => import('../views/Profile.vue'), meta: {title:'User Profile'} },
      { path: 'grades', name:'grades.index', component: () => import('../views/manage/Grades.vue'), meta: {title:'All Grades'} },
      { path: 'subjects', name:'subjects.index', component: () => import('../views/manage/Subjects.vue'), meta: {title:'All Subjects'} },
      { path: 'lessons', name:'lessons.index', component: () => import('../views/manage/Lessons.vue'), meta: {title:'All Lessons'} },
      { path: 'questions', name:'questions.index', component: () => import('../views/exams/Questions/QuestionsPage.vue'), meta: {title:'All Questions'} },
      { path: 'questions/create', name:'questions.create', component: () => import('../views/exams/Questions/QuestionForm.vue'), meta: {title:'Create Question'} },
      { path: 'questions/:id/edit', name:'questions.edit', component: () => import('../views/exams/Questions/QuestionForm.vue'), meta: {title:'Edit Question'} },
      { path: "language-questions/edit", name: "language.questions.edit", component: () => import('../views/exams/Questions/LanguageQuestionEdit.vue'), meta: { title: "Edit Language Questions" } },
      { path: 'papers', name:'papers.index', component: () => import('../views/exams/Papers/PapersPage.vue'), meta: {title:'All Papers'} },
      { path: 'papers/:id/edit', name:'paper.edit', component: () => import('../views/exams/Papers/PaperCreator.vue'), meta: {title:'Edit Papers'} },
      { path: 'papers/creator', name:'papers.creator', component: () => import('../views/exams/Papers/PaperCreator.vue'), meta: {title:'Create Paper'} },
      { path: 'papers/:id', name:'ViewQuestion', component: () => import('../views/exams/Papers/PaperView.vue'), meta: {title:'View Paper'} },


      // Teachers
      { path: 'teacher-dashboard', name: 'teacher.dashboard', component: () => import('../views/teacher/TeacherDashboard.vue'), meta: { title: 'Teacher Dashboard' } },
      { path: 'teachers', name:'teachers.index', component: () => import('../views/admin/Teachers.vue'), meta: {title:'All Teachers'}},
      { path: 'question-approvals', name: 'question.approvals', component: () => import('../views/admin/QuestionApprovalPage.vue'), meta: { title: 'Question Approval'} },
      { path: 'my-question-tasks', name: 'teacher.my.tasks', component: () => import('../views/teacher/MyQuestionTasks.vue'), meta: { title: 'My Tasks' }},

      // Reports
      { path: 'reports/teacher-progress', name:'teacher.progress', component: () => import('../views/reports/TeacherProgressReport.vue'), meta: {title:'Teachers Progress Report'}},
      { path: "/teacher-analytics", name: "teacher.analytics", component: () => import("../views/admin/TeacherAnalyticsDashboard.vue"), meta: { title: "Teacher Analytics" }},

      // Assign Task To Teachers

      {path: 'teacher-question-tasks', name:'teacher.tasks', component: () => import('../views/admin/TeacherQuestionTasks.vue'), meta: {title:'Teachers Task'}},
      

      // Exam Portion
      { path: 'exam-names', name: 'exam.names', component: () => import('../views/admin/ExamNames.vue'), meta: { title: 'Exam Names' }},
      { path: 'exam-portions', name: 'exam.portions', component: () => import('../views/admin/ExamPortions.vue'), meta: { title: 'Exam Portions' } },
      { path: 'my-exam-portions', name: 'teacher.exam.portions', component: () => import('../views/teacher/MyExamPortions.vue'), meta: { title: 'My Exam Portions' } },
      { path: 'paper-generate', name: 'papers.generate', component: () => import('../views/admin/PaperGenerator_copy.vue'), meta: { title: 'Generate Paper' } },

      { path: 'question-papers/:id', name: 'question.paper.view', component: () => import('../views/admin/QuestionPaperView.vue'), meta: { title: 'Question Paper View' } },

      // BluePrint
      { path: 'paper-blueprints', name: 'paper.blueprints', component: () => import('../views/admin/PaperBlueprints.vue'), meta: { title: 'Paper Blueprints' } },
      { path: 'question-types', name: 'question.types', component: () => import('../views/admin/QuestionTypes.vue'), meta: { title: 'Question Types' } },
      { path: 'paper-generator', name: 'paper.generator', component: () => import('../views/admin/PaperGenerator.vue'), meta: { title: 'Paper Generator' } },

      { path: "/permissions", name: "permissions.index", component: () => import("../views/admin/permissions/PermissionManagement.vue"), meta: { title: "Permission Management" } },

      // Role
      { path: "/roles", name: "roles.index", component: () => import("../views/admin/roles/RolesPage.vue"), meta: { title: "Roles Management" } },
      { path: "/roles/create", name: "roles.create", component: () => import("../views/admin/roles/RoleForm.vue"), meta: { title: "Create Role" } },
      { path: "/roles/:id/edit", name: "roles.edit", component: () => import("../views/admin/roles/RoleForm.vue"), meta: { title: "Edit Role" } },

      { path: "/users", name: "users.index", component: () => import("../views/admin/users/UsersPage.vue"), meta: { title: "Users" } },
      { path: "/users/create", name: "users.create", component: () => import("../views/admin/users/UserForm.vue"), meta: { title: "Create User" } },
      { path: "/users/:id/edit", name: "users.edit", component: () => import("../views/admin/users/UserForm.vue"), meta: { title: "Edit User" } },
      

      // { path: '/papers/:id', component: () => import('@/views/exam/Papers/PaperView.vue'), meta: {title:'Login'} },
      // { path: '/exams', component: () => import('../views/exams/Exams/ExamsPage.vue'), meta: {title:'Login'} },
      // { path: '/exams/create', component: () => import('../views/exams/Exams/ExamForm.vue'), meta: {title:'Login'}},
      // { path: '/results', component: () => import('../views/exams/Results/ResultsPage.vue'), meta: {title:'Login'}},
      { path: 'users', name: 'create.exam', component: { template: '<h2>Users</h2>' } },
      { path: 'users', name: 'create.index', component: { template: '<h2>Users</h2>' } },
      { path: 'users', component: { template: '<h2>Users</h2>' } },
      { path: 'students', component: { template: '<h2>Students</h2>' } },
      { path: 'sales', component: { template: '<h2>Sales</h2>' } },
      { path: 'performance', component: { template: '<h2>Performance</h2>' } },
      { path: 'settings', component: { template: '<h2>Settings</h2>' } }
    ]
  },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('../views/errors/NotFound.vue'), meta: { title: '404 Not Found' } }
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