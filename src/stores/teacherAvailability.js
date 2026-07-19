import { defineStore } from 'pinia'
import api from '../plugins/api'

export const useTeacherAvailabilityStore = defineStore('teacherAvailability', {
    state: () => ({
        loading: false,
        saving: false,

        teacherId: null,
        academicYearId: null,

        availability: [],

        workingDays: 6,
        periodsPerDay: 8,
    }),

    getters: {
        grid: (state) => {
            const rows = {}

            for (let day = 1; day <= state.workingDays; day++) {
                rows[day] = {}

                for (let period = 1; period <= state.periodsPerDay; period++) {
                    rows[day][period] = {
                        weekday: day,
                        period_no: period,
                        status: 'available',
                        reason_type: null,
                        reason: null,
                    }
                }
            }

            state.availability.forEach(item => {
                if (rows[item.weekday]) {
                    rows[item.weekday][item.period_no] = {
                        ...item,
                    }
                }
            })

            return rows
        },
    },

    actions: {

        async load(teacherId, academicYearId) {

            this.loading = true

            this.teacherId = teacherId
            this.academicYearId = academicYearId

            try {

                const { data } = await api.get('/teacher-availabilities', {
                    params: {
                        teacher_id: teacherId,
                        academic_year_id: academicYearId,
                    },
                })

                this.availability = data.data ?? []

            } finally {

                this.loading = false
            }
        },

        async save() {

            this.saving = true

            try {

                const payload = []

                Object.values(this.grid).forEach(day => {
                    Object.values(day).forEach(slot => {
                        payload.push(slot)
                    })
                })

                await api.post('/teacher-availabilities', {
                    teacher_id: this.teacherId,
                    academic_year_id: this.academicYearId,
                    availability: payload,
                })

            } finally {

                this.saving = false
            }
        },

        async copy(sourceTeacherId, destinationTeacherId) {

            return api.post('/teacher-availabilities/copy', {
                academic_year_id: this.academicYearId,
                source_teacher_id: sourceTeacherId,
                destination_teacher_id: destinationTeacherId,
            })

        },

        async generateDefault() {

            const { data } = await api.post(
                '/teacher-availabilities/generate-default',
                {
                    teacher_id: this.teacherId,
                    academic_year_id: this.academicYearId,
                    working_days: this.workingDays,
                    periods_per_day: this.periodsPerDay,
                }
            )

            this.availability = data.data
        },

        async reset() {

            await api.delete(
                `/teacher-availabilities/${this.teacherId}`,
                {
                    data: {
                        academic_year_id: this.academicYearId,
                    },
                }
            )

            this.availability = []
        },

        toggle(day, period) {

            const slot = this.grid[day][period]

            switch (slot.status) {

                case 'available':
                    slot.status = 'preferred'
                    break

                case 'preferred':
                    slot.status = 'unavailable'
                    break

                default:
                    slot.status = 'available'
            }

            const index = this.availability.findIndex(item =>
                item.weekday === day &&
                item.period_no === period
            )

            if (index >= 0) {
                this.availability[index] = { ...slot }
            } else {
                this.availability.push({ ...slot })
            }
        },

        statusColor(status) {

            switch (status) {

                case 'preferred':
                    return 'success'

                case 'unavailable':
                    return 'error'

                default:
                    return 'primary'
            }
        },

        statusIcon(status) {

            switch (status) {

                case 'preferred':
                    return 'mdi-star'

                case 'unavailable':
                    return 'mdi-close'

                default:
                    return 'mdi-check'
            }
        },
    },
})