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
      const res = await api.post("/login", credentials);

      this.token = res.data.token;
      this.user = res.data.user;
      this.permissions = res.data.user.permissions || [];
      this.sidebarMenus = res.data.user.sidebar_menus || [];

      localStorage.setItem("token", this.token);

      api.defaults.headers.common.Authorization = `Bearer ${this.token}`;

      await this.fetchUser();
      
    },

    async fetchUser() {
      try {
        const res = await api.get("/current-user");
        this.user = res.data;
        this.permissions = res.data.permissions || [];
        this.sidebarMenus = res.data.sidebar_menus || [];
        console.log("SIDEBAR MENUS:", this.sidebarMenus);
      } catch (error) {
        console.error(error);
        this.logout();
      }
    },

    async logout() {
      try {
        await api.post("/logout");
      } catch (e) {
        // ignore
      }

      localStorage.removeItem("token");
      this.user = null;
      this.token = null;
    },
  },
});
