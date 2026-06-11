import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useTableStore = defineStore('table', () => {
  const itemsPerPage = ref(
    Number(localStorage.getItem('itemsPerPage') || 50)
  )

  watch(
    itemsPerPage,
    (value) => {
      localStorage.setItem('itemsPerPage', value)
    },
    { immediate: true }
  )

  const setItemsPerPage = (value) => {
    itemsPerPage.value = Number(value || 50)
  }

  return {
    itemsPerPage,
    setItemsPerPage,
  }
})