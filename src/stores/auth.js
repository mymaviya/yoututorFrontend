import { defineStore } from "pinia";
import api from "../plugins/api";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    drawer: true,
    user: null,
    token: localStorage.getItem("token") || null,
    theme: localStorage.getItem("theme") || "light", // light | dark
    permissions: [],
    sidebarMenus: [],
    allowedFeatureKeys: [],
  }),

  getters: {
    isAuth: (state) => !!state.token,
    role: (state) => state.user?.role,
  },

  actions: {
    toggleDrawer() {
      this.drawer = !this.drawer;
    },

    toggleTheme() {
      this.theme = this.theme === "light" ? "dark" : "light";
      localStorage.setItem("theme", this.theme);
    },

    async login(credentials) {
      try {
        const res = await api.post("/login", credentials);

        this.token = res.data.token;
        this.user = res.data.user;
        this.permissions = res.data.user.permissions || [];
        this.sidebarMenus = res.data.user.sidebar_menus || [];
        this.allowedFeatureKeys = res.data.user.allowed_feature_keys || [];

        localStorage.setItem("token", this.token);

        api.defaults.headers.common.Authorization = `Bearer ${this.token}`;

        await this.fetchUser();

        return {
          success: true,
        };
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

        this.user = res.data;
        this.permissions = res.data.permissions || [];
        this.sidebarMenus = res.data.sidebar_menus || [];
        this.allowedFeatureKeys = res.data.allowed_feature_keys || [];

      } catch (error) {
        console.error(error);
        localStorage.removeItem("token");
        delete api.defaults.headers.common.Authorization;

        this.user = null;
        this.token = null;
        this.permissions = [];
        this.sidebarMenus = [];
        this.allowedFeatureKeys = [];

        throw error;
      }
    },

    async heartbeat() {
      try {
        await api.post("/heartbeat");
      } catch (e) {
        console.error(e);
      }
    },

    async logout() {
      const hasToken = !!this.token;
      if (hasToken) {
        try {
          await api.post("/logout");
        } catch (e) {
          console.error(e);
        }
      }

      localStorage.removeItem("token");
      delete api.defaults.headers.common.Authorization;

      this.user = null;
      this.token = null;
      this.permissions = [];
      this.sidebarMenus = [];
      this.allowedFeatureKeys = [];
    },
  },
});
