<script setup>
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const store = useAuthStore();
const auth = useAuthStore();

const go = (route) => router.push(route);

// Generate initials
const getInitials = (name) => {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

// Role-based menus
const menus = {
  admin: [
    { title: "Dashboard", icon: "mdi-view-dashboard", route: "/dashboard" },
    {
      title: "Academic",
      icon: "mdi-school",
      children: [
        { title: "Grades", icon: "mdi-file-document", route: "/grades" },
        { title: "Subjects", icon: "mdi-file-document", route: "/subjects" },
        { title: "Lessons", icon: "mdi-file-document", route: "/lessons" },
        { title: "Users", icon: "mdi-account", route: "/users" },
        { title: "Teachers", icon: "mdi-account-multiple", route: "/teachers" },
        { title: "Students", icon: "mdi-account-circle", route: "/students" },
      ],
    },
    {
      title: 'Question Bank',
      icon: 'mdi-help-box-multiple',
      children: [
        { title: 'All Questions', icon: 'mdi-format-list-bulleted', route: '/questions' },
        { title: 'Add Question', icon: 'mdi-plus-circle', route: '/questions/create' },
        { title: 'Generate Question', icon: 'mdi-plus-circle', route: '/papers/generate' }
      ]
    },
    { title: "All Papers", icon: "mdi-format-list-bulleted", route: "/papers" },
    { title: "Settings", icon: "mdi-cog", route: "/settings" },
  ],

  teacher: [
    { title: "Dashboard", icon: "mdi-view-dashboard", route: "/dashboard" },
    { title: "Students", icon: "mdi-account-group", route: "/students" },
    { title: "Reports", icon: "mdi-chart-bar", route: "/reports" },
  ],

  student: [
    { title: "Dashboard", icon: "mdi-view-dashboard", route: "/dashboard" },
    { title: "My Courses", icon: "mdi-book", route: "/courses" },
    { title: "Profile", icon: "mdi-account", route: "/profile" },
  ],
};

const menu = menus[auth.role] || menus.student;
console.log("Current Menu:", menu);
</script>

<template>
  <v-navigation-drawer app v-model="store.drawer" width="260">
    <div class="pa-4 d-flex align-center gap-3">
      <!-- Avatar -->
      <v-avatar size="42" color="primary">
        <v-img v-if="auth.user?.profile" :src="auth.user.profile" />
        <span v-else class="text-white font-weight-bold">
          {{ getInitials(auth.user?.name) }}
        </span>
      </v-avatar>

      <!-- Name + Role -->
      <div class="d-flex flex-column ml-2">
        <div class="text-subtitle-2 font-weight-bold">
          {{ auth.user?.name || "User" }}
        </div>
        <div class="text-caption text-grey">
          {{ auth.user?.role || "Role" }}
        </div>
      </div>
    </div>
    <v-divider />
    <v-list density="compact" nav>
      <template v-for="item in menu" :key="item.title">
        <!-- Single -->
        <v-list-item
          v-if="!item.children"
          :title="item.title"
          :prepend-icon="item.icon"
          @click="go(item.route)"
        />

        <!-- Nested -->
        <v-list-group v-else>
          <template #activator="{ props }">
            <v-list-item
              v-bind="props"
              :title="item.title"
              :prepend-icon="item.icon"
            />
          </template>

          <v-list-item
            v-for="child in item.children"
            :key="child.title"
            :title="child.title"
            :prepend-icon="child.icon"
            class="pl-6"
            @click="go(child.route)"
          />
        </v-list-group>
      </template>
    </v-list>
  </v-navigation-drawer>
</template>
