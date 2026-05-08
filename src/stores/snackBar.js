import { defineStore } from 'pinia'

export const useUIStore = defineStore('ui', {
  state: () => ({
    snackbar: {
      show: false,
      text: '',
      color: 'success',
      timeout: 3000
    },

    confirm: {
      show: false,
      title: '',
      message: '',
      resolve: null
    },

    AppLoader: {
      loading: false,
      color: 'primary'
    },

    loadingCount: 0

  }),

  actions: {
    showSnackbar(text, color = 'success', timeout = 3000) {
      this.snackbar = {
        show: true,
        text,
        color,
        timeout
      }
    },

    hideSnackbar() {
      this.snackbar.show = false
    },

    // Confirm dialog (PROMISE based)
    confirmDialog(title, message) {
      return new Promise((resolve) => {
        this.confirm = {
          show: true,
          title,
          message,
          resolve
        }
      })
    },

    confirmYes() {
      this.confirm.resolve(true)
      this.confirm.show = false
    },

    confirmNo() {
      this.confirm.resolve(false)
      this.confirm.show = false
    },

    // Loading
    
    startLoading() {
      this.loadingCount++
      this.AppLoader.loading = true
      this.AppLoader.color = this.snackbar.color
    },

    stopLoading() {
      this.loadingCount--
      if (this.loadingCount <= 0) {
        this.AppLoader.loading = false
        this.loadingCount = 0
      }
    },

    //action end here
  }
})