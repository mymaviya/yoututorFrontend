<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import teacherTimetableService from '../../services/teacherTimetableService'
import TimetableToolbar from '../../components/timetable/TimetableToolbar.vue'
import TimetableFilters from '../../components/timetable/TimetableFilters.vue'
import SummaryCards from '../../components/timetable/SummaryCards.vue'
import WeeklyGrid from '../../components/timetable/WeeklyGrid.vue'
import TimetableLegend from '../../components/timetable/TimetableLegend.vue'

const loading=ref(false),exporting=ref(false),printing=ref(false),error=ref('')
const filters=reactive({academic_year_id:null,school_id:null,grade_id:null,section_id:null,stream_id:null,subject_id:null,teacher_id:null})
const options=reactive({academicYears:[],schools:[],grades:[],sections:[],streams:[],subjects:[],teachers:[]})
const timetable=reactive({days:[],periods:[],entries:[],summary:{}})
const payloadData=p=>p?.data?.data??p?.data??p??{}
const list=(data,...keys)=>{for(const key of keys)if(Array.isArray(data?.[key]))return data[key];return[]}
const messageOf=e=>e?.response?.data?.message||e?.message||'Unable to load the teacher timetable.'
const params=computed(()=>Object.fromEntries(Object.entries(filters).filter(([,v])=>v!==null&&v!=='')))
const summary=computed(()=>timetable.summary||{})
const hydrateOptions=data=>{options.academicYears=list(data,'academic_years','academicYears');options.schools=list(data,'schools');options.grades=list(data,'grades');options.sections=list(data,'sections');options.streams=list(data,'streams');options.subjects=list(data,'subjects');options.teachers=list(data,'teachers')}
const hydrateTimetable=raw=>{const data=payloadData(raw);timetable.days=list(data,'days','week_days');timetable.periods=list(data,'periods','time_slots');timetable.entries=list(data,'entries','timetable','items');timetable.summary=data.summary||data.workload||{};hydrateOptions(data.filters||data.options||data.meta||{})}
const loadFilters=async()=>{try{hydrateOptions(payloadData(await teacherTimetableService.getFilters(params.value)))}catch{/* filters may be included in timetable response */}}
const load=async()=>{loading.value=true;error.value='';try{hydrateTimetable(await teacherTimetableService.getTimetable(params.value))}catch(e){error.value=messageOf(e)}finally{loading.value=false}}
const refresh=async()=>{await loadFilters();await load()}
const reset=()=>{Object.keys(filters).forEach(k=>filters[k]=null);refresh()}
const exportExcel=async()=>{exporting.value=true;error.value='';try{await teacherTimetableService.exportExcel(params.value)}catch(e){error.value=messageOf(e)}finally{exporting.value=false}}
const printPdf=async()=>{printing.value=true;error.value='';try{await teacherTimetableService.downloadPdf(params.value)}catch(e){error.value=messageOf(e)}finally{printing.value=false}}
onMounted(refresh)
</script>

<template>
<v-container fluid class="pa-4 pa-md-6"><div class="d-flex flex-column ga-4"><TimetableToolbar :loading="loading||exporting||printing" @refresh="refresh" @export="exportExcel" @print="printPdf"/><v-alert v-if="error" type="error" variant="tonal" closable @click:close="error=''">{{ error }}</v-alert><TimetableFilters v-model="filters" :academic-years="options.academicYears" :schools="options.schools" :grades="options.grades" :sections="options.sections" :streams="options.streams" :subjects="options.subjects" :teachers="options.teachers" :loading="loading" @apply="load" @reset="reset"/><SummaryCards :total-periods="summary.total_periods??timetable.entries.length" :assigned-classes="summary.assigned_classes??summary.classes??0" :subjects-handled="summary.subjects_handled??summary.subjects??0" :free-periods="summary.free_periods??0" :weekly-capacity="summary.weekly_capacity??summary.capacity??0" :loading="loading"/><WeeklyGrid :days="timetable.days" :periods="timetable.periods" :entries="timetable.entries" :loading="loading"/><TimetableLegend/></div></v-container>
</template>

<style scoped>@media print{.v-container{padding:0!important}}</style>
