<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

const user = computed(() => auth.user || {})

const initials = computed(() => {
  return user.value?.name
    ? user.value.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'U'
})

const menu = computed(() => [
  {
    title: 'Dashboard',
    icon: 'mdi-view-dashboard',
    routeName: 'Dashboard',
    roles: ['admin', 'teacher', 'student']
  },

  {
    title: 'Academic',
    icon: 'mdi-school',
    roles: ['admin'],
    children: [
      {
        title: 'Grades',
        icon: 'mdi-google-classroom',
        routeName: 'grades.index',
        roles: ['admin']
      },
      {
        title: 'Subjects',
        icon: 'mdi-book-open-page-variant',
        routeName: 'subjects.index',
        roles: ['admin']
      },
      {
        title: 'Lessons',
        icon: 'mdi-book-education',
        routeName: 'lessons.index',
        roles: ['admin']
      }
    ]
  },

  {
    title: 'Teachers',
    icon: 'mdi-account-tie',
    roles: ['admin'],
    children: [
      {
        title: 'All Teachers',
        icon: 'mdi-account-group',
        routeName: 'teachers.index',
        roles: ['admin']
      },
      {
        title: 'Question Tasks',
        icon: 'mdi-clipboard-text-clock',
        routeName: 'teacher.tasks',
        roles: ['admin']
      },
      {
        title: 'Teacher Progress',
        icon: 'mdi-chart-timeline-variant',
        routeName: 'teacher.progress',
        roles: ['admin']
      }
    ]
  },

  {
    title: 'Question Bank',
    icon: 'mdi-help-box-multiple',
    roles: ['admin', 'teacher'],
    children: [
      {
        title: 'All Questions',
        icon: 'mdi-format-list-bulleted',
        routeName: 'questions.index',
        roles: ['admin', 'teacher']
      },
      {
        title: 'Add Question',
        icon: 'mdi-plus-circle',
        routeName: 'questions.create',
        roles: ['admin', 'teacher']
      }
    ]
  },

  {
    title: 'Question Papers',
    icon: 'mdi-file-document-multiple',
    roles: ['admin', 'teacher'],
    children: [
      {
        title: 'All Papers',
        icon: 'mdi-file-document-outline',
        routeName: 'papers.index',
        roles: ['admin', 'teacher']
      },
      {
        title: 'Generate Paper',
        icon: 'mdi-file-document-edit',
        routeName: 'papers.generate',
        roles: ['admin', 'teacher']
      }
    ]
  },

  {
    title: 'Online Exams',
    icon: 'mdi-laptop',
    roles: ['admin', 'teacher'],
    children: [
      {
        title: 'All Exams',
        icon: 'mdi-format-list-checks',
        routeName: 'Dashboard',
        roles: ['admin', 'teacher']
      },
      {
        title: 'Create Exam',
        icon: 'mdi-plus-box',
        routeName: 'dashboard',
        roles: ['admin', 'teacher']
      }
    ]
  },

  {
    title: 'Results',
    icon: 'mdi-chart-box',
    routeName: 'dashboard',
    roles: ['admin', 'teacher', 'student']
  },

  {
    title: 'Profile',
    icon: 'mdi-account-circle',
    routeName: 'profile',
    roles: ['admin', 'teacher', 'student']
  }
])

const hasRole = (item) => {
  if (!item.roles) return true
  return item.roles.includes(user.value?.role)
}

const filteredMenu = computed(() => {
  return menu.value
    .filter(hasRole)
    .map(item => {
      if (!item.children) return item

      return {
        ...item,
        children: item.children.filter(hasRole)
      }
    })
    .filter(item => !item.children || item.children.length)
})

const go = (item) => {
  if (!item) return

  if (item.routeName) {
    router.push({ name: item.routeName })
    return
  }

  if (item.route) {
    router.push(item.route)
    return
  }

  if (item.to) {
    router.push(item.to)
  }
}
</script>

<template>
  <v-navigation-drawer
    app
    width="290"
    class="app-sidebar"
  >
    <!-- LOGO -->
    <div class="pa-4">
      <div class="d-flex align-center ga-3">
        <v-avatar
          size="48"
          color="primary"
          variant="tonal"
        >
          <v-icon size="28">
            mdi-school
          </v-icon>
        </v-avatar>

        <div>
          <div class="text-h6 font-weight-bold">
            School ERP
          </div>

          <div class="text-caption text-grey">
            Admin Dashboard
          </div>
        </div>
      </div>
    </div>

    <v-divider />

    <!-- USER PROFILE -->
    <div class="pa-4">
      <div class="user-card">
        <v-avatar
          size="48"
          color="primary"
        >
          <v-img
            v-if="user.profile"
            :src="user.profile"
            cover
          />

          <span v-else class="text-white font-weight-bold">
            {{ initials }}
          </span>
        </v-avatar>

        <div class="flex-grow-1 overflow-hidden">
          <div class="font-weight-bold text-truncate">
            {{ user.name || 'User' }}
          </div>

          <div class="text-caption text-grey text-truncate">
            {{ user.role || 'Role' }}
          </div>
        </div>
      </div>
    </div>

    <v-divider />

    <!-- MENU -->
    <v-list
      nav
      density="comfortable"
      class="px-3 py-4"
    >
      <template
        v-for="item in filteredMenu"
        :key="item.title"
      >
        <!-- SIMPLE ITEM -->
        <v-list-item
          v-if="!item.children"
          :prepend-icon="item.icon"
          :title="item.title"
          rounded="xl"
          @click="go(item)"
        />

        <!-- GROUP ITEM -->
        <v-list-group
          v-else
          :value="item.title"
        >
          <template #activator="{ props }">
            <v-list-item
              v-bind="props"
              :prepend-icon="item.icon"
              :title="item.title"
              rounded="xl"
            />
          </template>

          <v-list-item
            v-for="child in item.children"
            :key="child.title"
            :prepend-icon="child.icon"
            :title="child.title"
            rounded="xl"
            class="ml-4"
            @click="go(child)"
          />
        </v-list-group>
      </template>
    </v-list>
  </v-navigation-drawer>
</template>

<style scoped>
.app-sidebar {
  border-right: 1px solid rgba(255, 255, 255, 0.08);
}

.user-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.04);
}

.v-list-item {
  margin-bottom: 4px;
}
</style>