import { defineStore } from "pinia";

export const useUiLoaderStore = defineStore("uiLoader", {
  state: () => ({
    loading: false,
    counter: 0,
  }),

  actions: {
    start() {
      this.counter++;
      this.loading = true;
    },

    stop() {
      if (this.counter > 0) this.counter--;

      if (this.counter === 0) {
        setTimeout(() => {
          if (this.counter === 0) {
            this.loading = false;
          }
        }, 250);
      }
    },

    reset() {
      this.counter = 0;
      this.loading = false;
    },
  },
});