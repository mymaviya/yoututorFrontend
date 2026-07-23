import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";
import Login from "../views/Login.vue";
import Dashboard from "../views/Dashboard.vue";
import Home from "../views/Home.vue";
import About from "../views/About.vue";
import { useUiLoaderStore } from "../stores/uiLoader";

import DashboardLayout from "../layouts/DashboardLayout.vue";
import AuthLayout from "../layouts/AuthLayout.vue";

const APP_NAME = "YouTutor ERP";

const routes = [
  {
    path: '/',
    component: () => import('../layouts/PublicLayout.vue'),
    children: [
      {
        path: '',
        name: 'public.home',
        component: () => import('../views/public/HomePage.vue')
      },
      {
        path: 'pricing',
        name: 'public.pricing',
        component: () => import('../views/public/PricingPage.vue')
      },
      {
        path: 'contact',
        name: 'public.contact',
        component: () => import('../views/public/ContactPage.vue')
      },
      {
        path: '/subscription-expired',
        name: 'subscription.expired',
        component: () => import('../views/errors/SubscriptionExpired.vue'),
        meta: {
          public: true
        }
      },
      {
        path: '/about',
        name: 'public.about',
        component: () => import('../views/public/AboutPage.vue'),
        meta: { public: true }
      },
      {
        path: '/terms-and-conditions',
        name: 'public.terms',
        component: () => import('../views/public/TermsPage.vue'),
        meta: { public: true }
      },
      {
        path: '/privacy-policy',
        name: 'public.privacy',
        component: () => import('../views/public/PrivacyPolicyPage.vue'),
        meta: { public: true }
      },
      {
        path: '/refund-policy',
        name: 'public.refund',
        component: () => import('../views/public/RefundPolicyPage.vue'),
        meta: { public: true }
      },
      {
        path: '/shipping-policy',
        name: 'public.shipping',
        component: () => import('../views/public/ShippingPolicyPage.vue'),
        meta: { public: true }
      },
      {
        path: '/checkout',
        name: 'public.checkout',
        component: () => import('../views/public/CheckoutPage.vue'),
        meta: {
          public: true,
          title: 'Checkout'
        }
      },
      {
        path: '/subscription-success',
        name: 'subscription.success',
        component: () => import('../views/public/SubscriptionSuccessPage.vue'),
        meta: {
          public: true,
          title: 'Subscription Success'
        }
      },
      {
        path: '/subscription-failed',
        name: 'subscription.failed',
        component: () => import('../views/public/SubscriptionFailedPage.vue'),
        meta: {
          public: true,
          title: 'Payment Failed'
        }
      },
      {
        path: '/desktop-dashboard',
        name: 'DesktopDashboard',
        component: () => import('../views/public/DesktopDashboard.vue'),
        meta: {
          public: true,
          layout: 'blank'
        }
      }
    ]
  },
  {
    path: "/",
    name: "root",
    redirect: () => {
      const token = localStorage.getItem("token");
      return token ? "/dashboard" : "/login";
    },
  },
  {
    path: "/",
    component: AuthLayout,
    children: [
      {
        path: "login",
        name: "login",
        component: () => import("../views/auth/Login.vue"),
        meta: { title: "Login", guestOnly: true },
      },
      {
        path: "register",
        component: () => import("../views/auth/Register.vue"),
        meta: { title: "Login", guestOnly: true },
      },
      {
        path: "forgot-password",
        component: () => import("../views/auth/ForgotPassword.vue"),
        meta: { title: "Login", guestOnly: true },
      },
    ],
  },

  {
    path: "/",
    component: DashboardLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: "dashboard",
        name: "Dashboard",
        component: () => import("../views/admin/Dashboard.vue"),
        meta: { title: "Dashboard" },
      },
      {
        path: "dashboard-analytics",
        name: "dashboard.analytics",
        component: () => import("../views/admin/DashboardAnalytics.vue"),
        meta: { title: "Analytics Dashboard" },
      },
      {
        path: "profile",
        name: "profile",
        component: () => import("../views/Profile.vue"),
        meta: { title: "User Profile" },
      },
      {
        path: "grades",
        name: "grades.index",
        component: () => import("../views/manage/Grades.vue"),
        meta: { title: "All Grades" },
      },
      {
        path: "subjects",
        name: "subjects.index",
        component: () => import("../views/manage/Subjects.vue"),
        meta: { title: "All Subjects" },
      },
      {
        path: '/subject-templates',
        name: 'subject-templates',
        component: () => import('../views/exams/SubjectTemplates.vue'),
        meta: {
          title: 'Subject Templates',
          requiresAuth: true,
          permission: 'subjects.manage'
        }
      },
      {
        path: '/lesson-import',
        name: 'lesson.import',
        component: () => import('../views/imports/LessonImport.vue'),
        meta: {
          title: 'Import Lessons',
          requiresAuth: true,
          permission: 'lessons.import'
        }
      },
      {
        path: '/question-import',
        name: 'question.import',
        component: () => import('../views/imports/QuestionImport.vue'),
        meta: {
          title: 'Import Questions',
          requiresAuth: true,
          permission: 'questions.import'
        }
      },
      {
        path: "lessons",
        name: "lessons.index",
        component: () => import("../views/manage/Lessons.vue"),
        meta: { title: "All Lessons" },
      },
      {
        path: "questions",
        name: "questions.index",
        component: () => import("../views/exams/Questions/QuestionsPage.vue"),
        meta: { title: "All Questions" },
      },
      {
        path: "questions/create",
        name: "questions.create",
        component: () => import("../views/exams/Questions/QuestionForm.vue"),
        meta: { title: "Create Question" },
      },
      {
        path: "questions/:id/edit",
        name: "questions.edit",
        component: () => import("../views/exams/Questions/QuestionForm.vue"),
        meta: { title: "Edit Question" },
      },
      {
        path: "language-questions/edit",
        name: "language.questions.edit",
        component: () =>
          import("../views/exams/Questions/LanguageQuestionEdit.vue"),
        meta: { title: "Edit Language Questions" },
      },
      {
        path: "papers",
        name: "papers.index",
        component: () => import("../views/exams/Papers/PapersPage.vue"),
        meta: { title: "All Papers" },
      },
      {
        path: "papers/:id/edit",
        name: "paper.edit",
        component: () => import("../views/exams/Papers/PaperCreator.vue"),
        meta: { title: "Edit Papers" },
      },
      {
        path: "papers/creator",
        name: "papers.creator",
        component: () => import("../views/exams/Papers/PaperCreator.vue"),
        meta: { title: "Create Paper" },
      },
      {
        path: "papers/:id",
        name: "ViewQuestion",
        component: () => import("../views/exams/Papers/PaperView.vue"),
        meta: { title: "View Paper" },
      },

      // Teachers
      {
        path: "teacher-dashboard",
        name: "teacher.dashboard",
        component: () => import("../views/teacher/TeacherDashboard.vue"),
        meta: { title: "Teacher Dashboard" },
      },
      {
        path: "teachers",
        name: "teachers.index",
        component: () => import("../views/admin/Teachers.vue"),
        meta: { title: "All Teachers" },
      },
      {
        path: "question-approvals",
        name: "question.approvals",
        component: () => import("../views/admin/QuestionApprovalPage.vue"),
        meta: { title: "Question Approval" },
      },
      {
        path: "my-question-tasks",
        name: "teacher.my.tasks",
        component: () => import("../views/teacher/MyQuestionTasks.vue"),
        meta: { title: "My Tasks" },
      },

      // Reports
      {
        path: "reports/teacher-progress",
        name: "teacher.progress",
        component: () => import("../views/reports/TeacherProgressReport.vue"),
        meta: { title: "Teachers Progress Report" },
      },
      {
        path: "/teacher-analytics",
        name: "teacher.analytics",
        component: () => import("../views/admin/TeacherAnalyticsDashboard.vue"),
        meta: { title: "Teacher Analytics" },
      },

      // Assign Task To Teachers

      {
        path: "teacher-question-tasks",
        name: "teacher.tasks",
        component: () => import("../views/admin/TeacherQuestionTasks.vue"),
        meta: { title: "Teachers Task" },
      },

      // Exam Portion
      {
        path: "exam-names",
        name: "exam.names",
        component: () => import("../views/admin/ExamNames.vue"),
        meta: { title: "Exam Names" },
      },
      {
        path: "exam-portions",
        name: "exam.portions",
        component: () => import("../views/admin/ExamPortions.vue"),
        meta: { title: "Exam Portions" },
      },
      {
        path: "my-exam-portions",
        name: "teacher.exam.portions",
        component: () => import("../views/teacher/MyExamPortions.vue"),
        meta: { title: "My Exam Portions" },
      },
      {
        path: "paper-generate",
        name: "papers.generate",
        component: () => import("../views/admin/PaperGenerator_copy.vue"),
        meta: { title: "Generate Paper" },
      },

      {
        path: "question-papers/:id",
        name: "question.paper.view",
        component: () => import("../views/admin/QuestionPaperView.vue"),
        meta: { title: "Question Paper View" },
      },

      // BluePrint
      {
        path: "paper-blueprints",
        name: "paper.blueprints",
        component: () => import("../views/admin/PaperBlueprints.vue"),
        meta: { title: "Paper Blueprints", permission: "paper.blueprints" },
      },
      {
        path: "question-types",
        name: "question.types",
        component: () => import("../views/admin/QuestionTypes.vue"),
        meta: { title: "Question Types" },
      },
      {
        path: "/question-type-templates",
        name: "question-type-templates",
        component: () => import("../views/exams/QuestionTypeTemplates.vue"),
        meta: {
          requiresAuth: true,
          permission: "question.types.view",
        },
      },
      {
        path: "/blueprint-excel-import",
        name: "blueprint.excel.import",
        component: () => import("../views/exams/BlueprintExcelImport.vue"),
        meta: {
          title: "Blueprint Excel Import",
          requiresAuth: true,
          permission: "blueprint.import",
        },
      },
      {
        path: "paper-generator",
        name: "paper.generator",
        component: () => import("../views/admin/PaperGenerator.vue"),
        meta: { title: "Paper Generator" },
      },

      {
        path: "/permissions",
        name: "permissions.index",
        component: () =>
          import("../views/admin/permissions/PermissionManagement.vue"),
        meta: { title: "Permission Management" },
      },

      // Role
      {
        path: "/roles",
        name: "roles.index",
        component: () => import("../views/admin/roles/RolesPage.vue"),
        meta: { title: "Roles Management" },
      },
      {
        path: "/roles/create",
        name: "roles.create",
        component: () => import("../views/admin/roles/RoleForm.vue"),
        meta: { title: "Create Role" },
      },
      {
        path: "/roles/:id/edit",
        name: "roles.edit",
        component: () => import("../views/admin/roles/RoleForm.vue"),
        meta: { title: "Edit Role" },
      },

      {
        path: "/school-profile",
        name: "school.profile",
        component: () => import("../views/admin/SchoolProfilePage.vue"),
        meta: {
          title: "School Profile",
          requiresAuth: true,
        },
      },

      {
        path: "/users",
        name: "users.index",
        component: () => import("../views/admin/users/UsersPage.vue"),
        meta: { title: "Users" },
      },
      {
        path: "/users/create",
        name: "users.create",
        component: () => import("../views/admin/users/UserForm.vue"),
        meta: { title: "Create User" },
      },
      {
        path: "/users/:id/edit",
        name: "users.edit",
        component: () => import("../views/admin/users/UserForm.vue"),
        meta: { title: "Edit User" },
      },

      //Security
      {
        path: "/security-settings",
        name: "security.settings",
        component: () =>
          import("../views/admin/security/SecuritySettingsPage.vue"),
        meta: { title: "Security Settings" },
      },
      {
        path: "/login-holidays",
        name: "login.holidays",
        component: () => import("../views/admin/security/LoginHolidayPage.vue"),
        meta: { title: "Login Holidays" },
      },
      {
        path: "/user-devices",
        name: "user.devices",
        component: () => import("../views/admin/security/UserDevicesPage.vue"),
        meta: { title: "User Devices" },
      },
      {
        path: "/audit-logs",
        name: "audit.logs",
        component: () => import("../views/admin/security/AuditLogsPage.vue"),
        meta: { title: "Audit Logs" },
      },

      // All Imports
      {
        path: "/teachers/import",
        name: "teachers.import",
        component: () =>
          import("../views/admin/teachers/TeacherImportPage.vue"),
        meta: { title: "Import Teachers" },
      },
      {
        path: "/sidebar-menus",
        name: "sidebar.menus",
        component: () => import("../views/admin/sidebar/SidebarMenusPage.vue"),
        meta: {
          title: "Sidebar Menus",
          permission: "manage.sidebar.menus",
        },
      },
      {
        path: "/app-routes",
        name: "app.routes",
        component: () => import("../views/admin/security/AppRoutesPage.vue"),
        meta: {
          title: "App Routes",
          permission: "manage.permissions",
        },
      },
      {
        path: "/change-password",
        name: "change.first.password",
        component: () => import("../views/auth/ChangeFirstPassword.vue"),
        meta: {
          title: "Change Password",
          requiresAuth: true,
          allowPasswordChange: true,
        },
      },
      {
        path: '/admin/demo-enquiries',
        name: 'admin.demo.enquiries',
        component: () => import('../views/admin/DemoEnquiries.vue'),
        meta: {
          requiresAuth: true,
          permission: 'demo.enquiries.view',
          title: 'Demo Enquiries'
        }
      },
      {
        path: '/admin/subscriptions',
        name: 'admin.subscriptions',
        component: () => import('../views/admin/SubscriptionManagement.vue'),
        meta: {
          requiresAuth: true,
          permission: 'subscriptions.view',
          title: 'Subscriptions'
        }
      },
      {
        path: '/admin/subscription-plans',
        name: 'admin.subscription.plans',
        component: () => import('../views/admin/SubscriptionPlans.vue'),
        meta: {
          requiresAuth: true,
          permission: 'subscription.plans.manage',
          title: 'Subscription Plans'
        }
      },
      {
        path: '/admin/payment-transactions',
        name: 'admin.payment.transactions',
        component: () => import('../views/admin/PaymentTransactions.vue'),
        meta: {
          requiresAuth: true,
          permission: 'payments.view',
          title: 'Payment Transactions'
        }
      },
      {
        path: '/admin/license-keys',
        name: 'admin.license.keys',
        component: () => import('../views/admin/LicenseKeys.vue'),
        meta: {
          requiresAuth: true,
          permission: 'licenses.view',
          title: 'License Keys'
        }
      },
      {
        path: '/admin/settings',
        name: 'admin.settings',
        component: () => import('../views/admin/Settings.vue'),
        meta: {
          requiresAuth: true,
          permission: 'settings.manage',
          title: 'Website Settings'
        }
      },
      {
        path: '/admin/saas-dashboard',
        name: 'admin.saas.dashboard',
        component: () => import('../views/admin/SaasDashboard.vue'),
        meta: {
          requiresAuth: true,
          permission: 'saas.dashboard',
          title: 'SaaS Dashboard'
        }
      },
      {
        path: '/admin/proposals',
        name: 'admin.proposals',
        component: () => import('../views/admin/proposals/ProposalList.vue'),
        meta: {
          requiresAuth: true,
          title: 'Proposals'
        }
      },
      {
        path: '/admin/proposals/create',
        name: 'admin.proposals.create',
        component: () => import('../views/admin/proposals/CreateProposal.vue'),
        meta: {
          requiresAuth: true,
          title: 'Create Proposal'
        }
      },
      {
        path: '/admin/proposals/:id/edit',
        name: 'admin.proposals.edit',
        component: () => import('../views/admin/proposals/ProposalBuilder.vue'),
        meta: {
          requiresAuth: true,
          title: 'Proposal Builder'
        }
      },
      {
        path: '/admin/proposals/:id/preview',
        name: 'admin.proposals.preview',
        component: () => import('../views/admin/proposals/ProposalPreview.vue'),
        meta: {
          requiresAuth: true,
          title: 'Proposal Preview'
        }
      },
      {
        path: '/admin/quotations',
        name: 'admin.quotations',
        component: () => import('../views/admin/quotations/QuotationList.vue'),
        meta: {
          requiresAuth: true,
          title: 'Quotations'
        }
      },
      {
        path: '/admin/quotations/:id/edit',
        name: 'admin.quotations.edit',
        component: () => import('../views/admin/quotations/QuotationBuilder.vue'),
        meta: {
          requiresAuth: true,
          title: 'Quotation Builder'
        }
      },
      {
        path: '/admin/invoices',
        name: 'admin.invoices',
        component: () => import('../views/admin/invoices/InvoiceList.vue'),
        meta: {
          requiresAuth: true,
          title: 'Invoices'
        }
      },
      {
        path: '/admin/invoices/:id/edit',
        name: 'admin.invoices.edit',
        component: () => import('../views/admin/invoices/InvoiceBuilder.vue'),
        meta: {
          requiresAuth: true,
          title: 'Invoice Builder'
        }
      },
      {
        path: '/admin/proposal-templates',
        name: 'admin.proposal.templates',
        component: () => import('../views/admin/proposals/templates/ProposalTemplateList.vue'),
        meta: {
          requiresAuth: true,
          title: 'Proposal Templates'
        }
      },
      {
        path: '/admin/proposal-templates/create',
        name: 'admin.proposal.templates.create',
        component: () => import('../views/admin/proposals/templates/ProposalTemplateBuilder.vue'),
        meta: {
          requiresAuth: true,
          title: 'Create Proposal Template'
        }
      },
      {
        path: '/admin/proposal-templates/:id/edit',
        name: 'admin.proposal.templates.edit',
        component: () => import('../views/admin/proposals/templates/ProposalTemplateBuilder.vue'),
        meta: {
          requiresAuth: true,
          title: 'Edit Proposal Template'
        }
      },
      {
        path: '/admin/crm-dashboard',
        name: 'admin.crm.dashboard',
        component: () => import('../views/admin/crm/CrmDashboard.vue'),
        meta: {
          requiresAuth: true,
          title: 'CRM Dashboard'
        }
      },
      {
        path: "/teachers/:id/profile",
        name: "teachers.profile",
        component: () => import("../views/admin/teachers/TeacherProfilePage.vue"),
        meta: {
          title: "Teacher Profile",
          requiresAuth: true,
          permission: "teachers.view",
        },
      },
      {
        path: "/master-question-bank",
        name: "master-question-bank.questions",
        component: () => import("../views/exams/MasterQuestionBank.vue"),
        meta: {
          title: "Premium Question Bank",
          requiresAuth: true,
          permission: "premium.question.bank.view",
        },
      },
      {
        path: "/admin/question-bank-packages",
        name: "admin.question-bank-packages.index",
        component: () => import("../views/admin/question-bank/QuestionBankPackages.vue"),
        meta: {
          title: "Question Bank Packages",
          requiresAuth: true,
          permission: "question.bank.packages.manage",
        },
      },
      {
        path: "/admin/master-questions",
        name: "admin.master-questions.index",
        component: () => import("../views/admin/question-bank/MasterQuestions.vue"),
        meta: {
          title: "Master Questions",
          requiresAuth: true,
          permission: "master.questions.manage",
        },
      },
      {
        path: "/admin/question-bank-purchases",
        name: "admin.question-bank-purchases.index",
        component: () => import("../views/admin/question-bank/QuestionBankPurchases.vue"),
        meta: {
          title: "Question Bank Purchases",
          requiresAuth: true,
          permission: "question.bank.purchases.manage",
        },
      },
      {
        path: "/admin/master-questions/create",
        name: "admin.master-questions.create",
        component: () => import("../views/exams/Questions/QuestionForm.vue"),
        meta: {
          title: "Create Master Question",
          requiresAuth: true,
          permission: "master.questions.manage",
          mode: "master",
        },
      },
      {
        path: "/admin/master-questions/:id/edit",
        name: "admin.master-questions.edit",
        component: () => import("../views/exams/Questions/QuestionForm.vue"),
        meta: {
          title: "Edit Master Question",
          requiresAuth: true,
          permission: "master.questions.manage",
          mode: "master",
        },
      },
      {
        path: "/admin/master-questions/import",
        name: "admin.master-questions.import",
        component: () => import("../views/imports/QuestionImport.vue"),
        meta: {
          title: "Import Master Questions",
          requiresAuth: true,
          permission: "master.questions.manage",
          mode: "master",
        },
      },
      {
        path: "/paper-generator/ai",
        name: "ai.paper.generator.index",
        component: () => import("../views/paper-generator/AiPaperGeneratorPage.vue"),
        meta: {
          title: "AI Paper Generator",
          requiresAuth: true,
          permission: "ai.paper.generator.index",
          featureKey: "ai_paper_generator",
        },
      },
      {
        path: '/bell-schedules',
        name: 'bell.schedules',
        component: () => import('../views/admin/BellSchedulePage.vue'),
        meta: {
          requiresAuth: true,
          title: 'Bell Schedule',
          permission: 'bell_schedule_management',
          featureKey: 'bell_schedule_management'
        }
      },
      {
        path: '/school-notices',
        name: 'school-notices',
        component: () => import('../views/admin/SchoolNoticePage.vue'),
        meta: {
          title: 'School Notices',
          requiresAuth: true,
          permission: 'bell_schedule_management',
        }
      },
      {
        path: '/academic-planning',
        name: 'academic.planning.dashboard',
        component: () => import('../pages/AcademicPlanning/Dashboard.vue'),
        meta: {
          requiresAuth: true,
          permission: 'academic.planning.dashboard',
          featureKey: 'academic_planning',
          title: 'Academic Planning',
        },
      },
      {
        path: '/academic-planning/subject-allocation',
        name: 'subject.allocation',
        component: () => import('../pages/AcademicPlanning/SubjectPeriodAllocation/Index.vue'),
        meta: {
          requiresAuth: true,
          permission: 'subject.allocation',
          featureKey: 'academic_planning',
          title: 'Subject Allocation',
        },
      },
      {
        path: '/academic-planning/teacher-availability',
        name: 'teacher.availability',
        component: () => import('../pages/AcademicPlanning/TeacherAvailability/Index.vue'),
        meta: {
          requiresAuth: true,
          permission: 'teacher.availability',
          featureKey: 'academic_planning',
          title: 'Teacher Availability',
        },
      },
      {
        path: '/academic-planning/teacher-substitutions',
        name: 'teacher.substitution',
        component: () => import('../views/academic-planning/TeacherSubstitution/Index.vue'),
        meta: {
          title: 'Teacher Substitution',
          requiresAuth: true,
          permission: 'teacher.substitution',
          featureKey: 'academic_planning',
        },
      },
      {
        path: '/academic-planning/teacher-timetable',
        name: 'teacher.timetable',
        component: () =>
          import('../views/academic-planning/TeacherTimetable/TeacherTimetablePage.vue'),
        meta: {
          title: 'Teacher Timetable',
          requiresAuth: true,
          permission: 'teacher.timetable',
          featureKey: 'academic_planning',
        },
      },
      {
        path: '/academic-planning/reports',
        name: 'timetable.reports',
        component: () => import('../pages/AcademicPlanning/TimetableReports/ReportsPage.vue'),
        meta: {
          title: 'Timetable Reports & Analytics',
          requiresAuth: true,
          permission: 'academic.planning.dashboard',
          featureKey: 'academic_planning',
        },
      },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: () => import("../views/errors/NotFound.vue"),
    meta: { title: "404 Not Found" },
  },

];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const hasPermission = (auth, permission) => {
  if (!permission) return true;
  return (auth.permissions || []).includes(permission);
};

const hasFeature = (auth, featureKey) => {
  if (!featureKey) return true;
  return (auth.allowedFeatureKeys || []).includes(featureKey);
};

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore();
  const loader = useUiLoaderStore();

  loader.start();

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const isGuestOnly = to.meta.guestOnly;

  if (requiresAuth && !auth.token) {
    loader.stop();
    return next({ name: "login" });
  }

  if (auth.token && !auth.user) {
    try {
      await auth.fetchUser();
    } catch (e) {
      loader.stop();
      return next({ name: "login" });
    }
  }

  if (isGuestOnly && auth.token && auth.user) {
    loader.stop();
    return next({
      name: auth.user.dashboard_route || "Dashboard",
    });
  }

  const requiredPermission = to.matched.find((record) => record.meta.permission)?.meta.permission;
  const requiredFeature = to.matched.find((record) => record.meta.featureKey)?.meta.featureKey;

  if (requiresAuth && !hasPermission(auth, requiredPermission)) {
    loader.stop();
    return next({ name: auth.user?.dashboard_route || "Dashboard" });
  }

  if (requiresAuth && !hasFeature(auth, requiredFeature)) {
    loader.stop();
    return next({ name: auth.user?.dashboard_route || "Dashboard" });
  }

  if (
    requiresAuth &&
    auth.user?.password_change_required &&
    !to.meta.allowPasswordChange
  ) {
    loader.stop();
    return next({ name: "change.first.password" });
  }

  next();
});
router.afterEach((to, from) => {
  const loader = useUiLoaderStore();
  const toDepth = to.path.split("/").length;
  const fromDepth = from.path.split("/").length;
  const pageTitle = to.meta.title;
  document.title = pageTitle ? `${pageTitle} | ${APP_NAME}` : APP_NAME;

  to.meta.transition = toDepth < fromDepth ? "slide-right" : "slide-left";
  requestAnimationFrame(() => {
    setTimeout(() => {
      loader.stop();
    }, 300);
  });
});

router.onError(() => {
  const loader = useUiLoaderStore();
  loader.reset();
});

export default router;