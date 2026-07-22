import { defineStore } from "pinia";

const STORAGE_KEY = "selected_academic_year_id";

export const useAppStore = defineStore("app", {
  state: () => ({
    refreshKey: 0,
    academicYears: [],
    academicYearsLoading: false,
    selectedAcademicYearId: localStorage.getItem(STORAGE_KEY)
      ? Number(localStorage.getItem(STORAGE_KEY))
      : null,
  }),

  getters: {
    selectedAcademicYear(state) {
      return state.academicYears.find(
        (item) => Number(item.id) === Number(state.selectedAcademicYearId)
      ) || null;
    },
  },

  actions: {
    triggerRefresh() {
      this.refreshKey++;
    },

    setAcademicYears(items = []) {
      this.academicYears = Array.isArray(items) ? items : [];

      const storedExists = this.academicYears.some(
        (item) => Number(item.id) === Number(this.selectedAcademicYearId)
      );

      if (!storedExists) {
        const defaultYear = this.academicYears.find((item) => item.is_active)
          || this.academicYears[0]
          || null;

        this.setSelectedAcademicYear(defaultYear?.id || null, false);
      }
    },

    setSelectedAcademicYear(id, refresh = true) {
      this.selectedAcademicYearId = id ? Number(id) : null;

      if (this.selectedAcademicYearId) {
        localStorage.setItem(STORAGE_KEY, String(this.selectedAcademicYearId));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }

      if (refresh) {
        this.triggerRefresh();
      }
    },

    clearAcademicSession() {
      this.academicYears = [];
      this.selectedAcademicYearId = null;
      localStorage.removeItem(STORAGE_KEY);
    },
  },
});