import { defineStore } from 'pinia'
import api from './../plugins/api'

export const useTeacherTimetableStore = defineStore('teacherTimetable', {
  state: () => ({
    loading: false,
    exporting: false,

    timetable: [],
    bells: [],
    summary: {},

    academicYears: [],
    teachers: [],
    grades: [],
    sections: [],
    streams: [],

    filters: {
      mode: 'teacher',

      academic_year_id: null,

      teacher_id: null,

      grade_id: null,
      section_id: null,
      stream_id: null,
    },
  }),

  getters: {
    hasData: (state) => state.timetable.length > 0,

    weeklyPeriods: (state) => state.timetable.length,

    freePeriods: (state) => {
      const total = state.bells.length * 6
      return Math.max(total - state.timetable.length, 0)
    },

    substitutionCount: (state) =>
      state.timetable.filter(i => i.is_substitution).length,

    subjectCount: (state) =>
      new Set(
        state.timetable
          .map(i => i.subject_id)
          .filter(Boolean)
      ).size,
  },

  actions: {
    async loadFilters() {
      const requests = [
        api.get('/academic-years'),
        api.get('/teachers', {
          params: { per_page: 500 },
        }),
        api.get('/grades'),
        api.get('/sections'),
        api.get('/streams'),
        api.get('/bell-schedules'),
      ]

      const result = await Promise.allSettled(requests)

      this.academicYears = this.extract(result[0])
      this.teachers = this.extract(result[1])
      this.grades = this.extract(result[2])
      this.sections = this.extract(result[3])
      this.streams = this.extract(result[4])

      this.bells = this.extract(result[5]).sort(
        (a, b) =>
          Number(a.sort_order || 0) -
          Number(b.sort_order || 0)
      )

      if (
        !this.filters.academic_year_id &&
        this.academicYears.length
      ) {
        const active =
          this.academicYears.find(i => i.is_active)

        this.filters.academic_year_id =
          active?.id || this.academicYears[0].id
      }
    },

    async loadTeacherTimetable() {
      if (!this.filters.teacher_id) {
        this.timetable = []
        return
      }

      this.loading = true

      try {
        const { data } = await api.get(
          `/teacher-timetable/teacher/${this.filters.teacher_id}`,
          {
            params: {
              academic_year_id:
                this.filters.academic_year_id,
            },
          }
        )

        this.timetable =
          data.data?.entries ||
          data.entries ||
          []

        this.summary =
          data.data?.summary ||
          data.summary ||
          {}

        if (data.data?.bells) {
          this.bells = data.data.bells
        }
      } finally {
        this.loading = false
      }
    },

    async loadClassTimetable() {
      if (!this.filters.grade_id) {
        this.timetable = []
        return
      }

      this.loading = true

      try {
        const { data } = await api.get(
          '/teacher-timetable/class',
          {
            params: {
              academic_year_id:
                this.filters.academic_year_id,

              grade_id:
                this.filters.grade_id,

              section_id:
                this.filters.section_id,

              stream_id:
                this.filters.stream_id,
            },
          }
        )

        this.timetable =
          data.data?.entries ||
          data.entries ||
          []

        this.summary =
          data.data?.summary ||
          data.summary ||
          {}

        if (data.data?.bells) {
          this.bells = data.data.bells
        }
      } finally {
        this.loading = false
      }
    },

    async refresh() {
      if (this.filters.mode === 'teacher') {
        await this.loadTeacherTimetable()
      } else {
        await this.loadClassTimetable()
      }
    },

    async export() {
      this.exporting = true

      try {
        const response = await api.get(
          '/teacher-timetable/export',
          {
            params: this.filters,
            responseType: 'blob',
          }
        )

        const blob = new Blob([response.data])

        const url =
          window.URL.createObjectURL(blob)

        const a =
          document.createElement('a')

        a.href = url

        a.download =
          'TeacherTimetable.xlsx'

        a.click()

        window.URL.revokeObjectURL(url)
      } finally {
        this.exporting = false
      }
    },

    async print() {
      window.print()
    },

    extract(result) {
      if (result.status !== 'fulfilled') {
        return []
      }

      const payload = result.value.data

      if (Array.isArray(payload)) {
        return payload
      }

      if (Array.isArray(payload.data)) {
        return payload.data
      }

      if (
        payload.data &&
        Array.isArray(payload.data.data)
      ) {
        return payload.data.data
      }

      return []
    },

    reset() {
      this.timetable = []
      this.summary = {}

      this.filters = {
        mode: 'teacher',

        academic_year_id: null,

        teacher_id: null,

        grade_id: null,
        section_id: null,
        stream_id: null,
      }
    },
  },
})