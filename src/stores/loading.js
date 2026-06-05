import { defineStore } from "pinia";

export const useLoadingStore = defineStore("loading", {
  state: () => ({
    appLoading: false,
    pageLoading: false,
    requests: 0,
  }),

  actions: {
    startPage() {
      this.requests++;
      this.pageLoading = true;
    },

    stopPage() {
      if (this.requests > 0) this.requests--;

      if (this.requests === 0) {
        setTimeout(() => {
          this.pageLoading = false;
        }, 250);
      }
    },

    startApp() {
      this.appLoading = true;
    },

    stopApp() {
      setTimeout(() => {
        this.appLoading = false;
      }, 300);
    },
  },
});