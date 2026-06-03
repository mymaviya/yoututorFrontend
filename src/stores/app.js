import { defineStore } from "pinia";

export const useAppStore = defineStore("app", {
  state: () => ({
    refreshKey: 0,
  }),

  actions: {
    triggerRefresh() {
      this.refreshKey++;
    },
  },
});