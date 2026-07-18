<template>
    <v-container fluid class="pa-6">
        <div class="d-flex align-center justify-space-between mb-6">
            <div>
                <h2 class="text-h4 font-weight-bold mb-1">
                    School Notices
                </h2>
                <p class="text-body-2 text-medium-emphasis mb-0">
                    Manage notices for desktop dashboard, website, students, teachers and parents.
                </p>
            </div>

            <v-btn color="primary" @click="openCreate">
                Add Notice
            </v-btn>
        </div>

        <v-card rounded="lg">
            <v-card-title class="d-flex align-center justify-space-between">
                <v-text-field v-model="search" label="Search notices" prepend-inner-icon="mdi-magnify"
                    variant="outlined" density="comfortable" hide-details style="max-width: 360px"
                    @input="loadNotices" />

                <v-btn variant="tonal" @click="loadNotices">
                    Refresh
                </v-btn>
            </v-card-title>

            <v-card-text>
                <v-alert v-if="message" :type="messageType" variant="tonal" class="mb-4" closable
                    @click:close="message = ''">
                    {{ message }}
                </v-alert>

                <v-table>
                    <thead>
                        <tr>
                            <th>Notice</th>
                            <th>Visibility</th>
                            <th>Dates</th>
                            <th>Priority</th>
                            <th>Status</th>
                            <th class="text-right">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr v-for="notice in notices" :key="notice.id">
                            <td>
                                <div class="d-flex align-center ga-3">
                                    <div class="notice-icon">
                                        {{ notice.icon || '📢' }}
                                    </div>

                                    <div>
                                        <div class="font-weight-medium">
                                            {{ notice.title }}
                                        </div>
                                        <div class="text-caption text-medium-emphasis">
                                            {{ notice.description }}
                                        </div>
                                    </div>
                                </div>
                            </td>

                            <td>
                                <v-chip v-if="notice.show_on_dashboard" size="small" color="primary" variant="tonal"
                                    class="mr-1 mb-1">
                                    Dashboard
                                </v-chip>

                                <v-chip v-if="notice.show_on_website" size="small" color="purple" variant="tonal"
                                    class="mr-1 mb-1">
                                    Website
                                </v-chip>

                                <v-chip v-if="notice.show_to_students" size="small" color="green" variant="tonal"
                                    class="mr-1 mb-1">
                                    Students
                                </v-chip>

                                <v-chip v-if="notice.show_to_teachers" size="small" color="blue" variant="tonal"
                                    class="mr-1 mb-1">
                                    Teachers
                                </v-chip>

                                <v-chip v-if="notice.show_to_parents" size="small" color="orange" variant="tonal"
                                    class="mr-1 mb-1">
                                    Parents
                                </v-chip>
                            </td>

                            <td>
                                <div class="text-caption">
                                    Start: {{ formatDate(notice.start_date) }}
                                </div>
                                <div class="text-caption">
                                    End: {{ formatDate(notice.end_date) }}
                                </div>
                            </td>

                            <td>
                                <v-chip size="small" color="indigo" variant="tonal">
                                    {{ notice.priority }}
                                </v-chip>
                            </td>

                            <td>
                                <v-chip size="small" :color="notice.is_active ? 'green' : 'red'" variant="tonal">
                                    {{ notice.is_active ? 'Active' : 'Inactive' }}
                                </v-chip>
                            </td>

                            <td class="text-right">
                                <v-btn icon="mdi-pencil" size="small" variant="text" @click="openEdit(notice)" />

                                <v-btn icon="mdi-power" size="small" variant="text"
                                    :color="notice.is_active ? 'red' : 'green'" @click="toggleNotice(notice)" />

                                <v-btn icon="mdi-delete" size="small" variant="text" color="red"
                                    @click="deleteNotice(notice)" />
                            </td>
                        </tr>

                        <tr v-if="!notices.length">
                            <td colspan="6" class="text-center text-medium-emphasis py-8">
                                No notices found.
                            </td>
                        </tr>
                    </tbody>
                </v-table>

                <div class="d-flex justify-end mt-4">
                    <v-pagination v-model="page" :length="lastPage" total-visible="5"
                        @update:model-value="loadNotices" />
                </div>
            </v-card-text>
        </v-card>

        <v-dialog v-model="dialog" max-width="720">
            <v-card>
                <v-card-title>
                    {{ form.id ? 'Edit Notice' : 'Add Notice' }}
                </v-card-title>

                <v-card-text>
                    <v-text-field v-model="form.title" label="Title" variant="outlined" density="comfortable" />

                    <v-textarea v-model="form.description" label="Description" variant="outlined" density="comfortable"
                        rows="3" />

                    <v-row>
                        <v-col cols="12" md="4">
                            <v-text-field v-model="form.icon" label="Icon / Emoji" variant="outlined"
                                density="comfortable" placeholder="📢" />
                        </v-col>

                        <v-col cols="12" md="4">
                            <v-text-field v-model.number="form.priority" label="Priority" type="number"
                                variant="outlined" density="comfortable" />
                        </v-col>

                        <v-col cols="12" md="4">
                            <v-switch v-model="form.is_active" label="Active" color="primary" />
                        </v-col>
                    </v-row>

                    <v-row>
                        <v-col cols="12" md="6">
                            <v-text-field v-model="form.start_date" label="Start Date" type="date" variant="outlined"
                                density="comfortable" />
                        </v-col>

                        <v-col cols="12" md="6">
                            <v-text-field v-model="form.end_date" label="End Date" type="date" variant="outlined"
                                density="comfortable" />
                        </v-col>
                    </v-row>

                    <v-divider class="my-4" />

                    <div class="text-subtitle-2 mb-2">
                        Display Options
                    </div>

                    <v-row>
                        <v-col cols="12" md="4">
                            <v-switch v-model="form.show_on_dashboard" label="Desktop Dashboard" color="primary" />
                        </v-col>

                        <v-col cols="12" md="4">
                            <v-switch v-model="form.show_on_website" label="Website" color="primary" />
                        </v-col>

                        <v-col cols="12" md="4">
                            <v-switch v-model="form.show_to_students" label="Students" color="primary" />
                        </v-col>

                        <v-col cols="12" md="4">
                            <v-switch v-model="form.show_to_teachers" label="Teachers" color="primary" />
                        </v-col>

                        <v-col cols="12" md="4">
                            <v-switch v-model="form.show_to_parents" label="Parents" color="primary" />
                        </v-col>
                    </v-row>

                    <v-alert v-if="formError" type="error" variant="tonal" class="mt-3">
                        {{ formError }}
                    </v-alert>
                </v-card-text>

                <v-card-actions class="px-4 pb-4">
                    <v-spacer />

                    <v-btn variant="text" @click="dialog = false">
                        Cancel
                    </v-btn>

                    <v-btn color="primary" :loading="saving" @click="saveNotice">
                        Save
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import api from '../../plugins/api'
import {formatDate, } from '../../utils/date'

const notices = ref([])
const page = ref(1)
const lastPage = ref(1)
const search = ref('')
const dialog = ref(false)
const saving = ref(false)
const message = ref('')
const messageType = ref('success')
const formError = ref('')

const defaultForm = () => ({
    id: null,
    title: '',
    description: '',
    icon: '📢',
    start_date: '',
    end_date: '',
    priority: 1,
    is_active: true,
    show_on_dashboard: true,
    show_on_website: false,
    show_to_students: true,
    show_to_teachers: true,
    show_to_parents: true,
})

const form = reactive(defaultForm())

const setMessage = (text, type = 'success') => {
    message.value = text
    messageType.value = type
}

const resetForm = () => {
    Object.assign(form, defaultForm())
    formError.value = ''
}

const openCreate = () => {
    resetForm()
    dialog.value = true
}

const openEdit = (notice) => {
    Object.assign(form, {
        ...notice,
        start_date: notice.start_date
            ? String(notice.start_date).slice(0, 10)
            : '',
        end_date: notice.end_date
            ? String(notice.end_date).slice(0, 10)
            : '',
    })

    formError.value = ''
    dialog.value = true
}

const loadNotices = async () => {
    const { data } = await api.get('/school-notices', {
        params: {
            page: page.value,
            search: search.value,
        },
    })

    notices.value = data.data || []
    lastPage.value = data.last_page || 1
}

const saveNotice = async () => {
    saving.value = true
    formError.value = ''

    try {
        let response

        if (form.id) {
            response = await api.put(`/school-notices/${form.id}`, form)
        } else {
            response = await api.post('/school-notices', form)
        }

        setMessage(response.data.message || 'Notice saved successfully.')
        dialog.value = false
        await loadNotices()
    } catch (error) {
        formError.value =
            error.response?.data?.message || 'Failed to save notice.'
    } finally {
        saving.value = false
    }
}

const toggleNotice = async (notice) => {
    await api.post(`/school-notices/${notice.id}/toggle`)
    await loadNotices()
}

const deleteNotice = async (notice) => {
    if (!confirm(`Delete notice "${notice.title}"?`)) {
        return
    }

    await api.delete(`/school-notices/${notice.id}`)
    setMessage('Notice deleted successfully.')
    await loadNotices()
}

onMounted(() => {
    loadNotices()
})
</script>

<style scoped>
.notice-icon {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    display: grid;
    place-items: center;
    font-size: 24px;
    background: rgba(var(--v-theme-primary), 0.12);
}
</style>