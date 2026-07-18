import { defineStore } from "pinia";
import api from "../plugins/api";

const TIMETABLE_FEATURE = "teacher_timetable";
const TIMETABLE_ROUTE = "teacher.timetable";

const timetableMenu = {
  title: "Teacher Timetable",
  icon: "mdi-calendar-clock",
  route: "/teacher-timetable",
  route_name: TIMETABLE_ROUTE,
  group_name: "Teachers",
  parent_menu: "Teachers",
  permission_slug: "teacher.timetable",
  feature_key: TIMETABLE_FEATURE,
  role_slug: null,
  badge: null,
  badge_color: null,
  sort_order: 32,
  is_active: true,
  show_in_sidebar: true,
};

export const useAuthStore = defineStore("auth", {
  state: () => ({
    drawer: true,
    user: null,
    token: localStorage.getItem("token") || null,
    theme: localStorage.getItem("theme") || "light",
    permissions: [],
    sidebarMenus: [],
    allowedFeatureKeys: [],
  }),

  getters: {
    isAuth: (state) => !!state.token,
    role: (state) => state.user?.role,
    hasFeature: (state) => (featureKey) =>
      state.allowedFeatureKeys.includes(featureKey),
  },

  actions: {
    toggleDrawer() {
      this.drawer = !this.drawer;
    },

    toggleTheme() {
      this.theme = this.theme === "light" ? "dark" : "light";
      localStorage.setItem("theme", this.theme);
    },

    syncFeatureMenus() {
      const withoutTimetable = this.sidebarMenus.filter(
        (menu) => menu.route_name !== TIMETABLE_ROUTE
      );

      this.sidebarMenus = this.allowedFeatureKeys.includes(TIMETABLE_FEATURE)
        ? [...withoutTimetable, timetableMenu]
        : withoutTimetable;
    },

    hydrateUser(user) {
      this.user = user;
      this.permissions = user?.permissions || [];
      this.sidebarMenus = user?.sidebar_menus || [];
      this.allowedFeatureKeys = user?.allowed_feature_keys || [];
      this.syncFeatureMenus();
    },

    async login(credentials) {
      try {
        const res = await api.post("/login", credentials);
        this.token = res.data.token;
        this.hydrateUser(res.data.user);

        localStorage.setItem("token", this.token);
        api.defaults.headers.common.Authorization = `Bearer ${this.token}`;
        await this.fetchUser();

        return { success: true };
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message,
          code: error.response?.data?.code,
        };
      }
    },

    async fetchUser() {
      try {
        const res = await api.get("/current-user");
        this.hydrateUser(res.data);
      } catch (error) {
        console.error(error);
        localStorage.removeItem("token");
        delete api.defaults.headers.common.Authorization;
        this.resetAuth();
        throw error;
      }
    },

    async heartbeat() {
      try {
        await api.post("/heartbeat");
      } catch (error) {
        console.error(error);
      }
    },

    resetAuth() {
      this.user = null;
      this.token = null;
      this.permissions = [];
      this.sidebarMenus = [];
      this.allowedFeatureKeys = [];
    },

    async logout() {
      if (this.token) {
        try {
          await api.post("/logout");
        } catch (error) {
          console.error(error);
        }
      }

      localStorage.removeItem("token");
      delete api.defaults.headers.common.Authorization;
      this.resetAuth();
    },
  },
});
