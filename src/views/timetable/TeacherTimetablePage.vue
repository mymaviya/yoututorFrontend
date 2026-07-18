<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import teacherTimetableService from '../../services/teacherTimetableService'
import TimetableToolbar from '../../components/timetable/TimetableToolbar.vue'
import TimetableFilters from '../../components/timetable/TimetableFilters.vue'
import SummaryCards from '../../components/timetable/SummaryCards.vue'
import WeeklyGrid from '../../components/timetable/WeeklyGrid.vue'
import TimetableLegend from '../../components/timetable/TimetableLegend.vue'

const loading=ref(false),exporting=ref(false),printing=ref(false),error=ref('')
const filters=reactive({academic_year_id:null,teacher_id:null,grade_id:null,section_id:null,stream_id:null})
const options=reactive({academicYears:[],teachers:[],grades:[],sections:[],streams:[],subjects:[],schools:[]})
const timetable=reactive({days:['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],periods:[],entries:[],summary:{}})
const unwrap=p=>p?.data?.data??p?.data??p??{}
const list=(data,...keys)=>{for(const key of keys)if(Array.isArray(data?.[key]))return data[key];return[]}
const params=computed(()=>Object.fromEntries(Object.entries(filters).filter(([,v])=>v!==null&&v!=='')))
const summary=computed(()=>timetable.summary||{})
const messageOf=e=>e?.response?.data?.message||e?.message||'Unable to load the teacher timetable.'
const hydrateOptions=data=>{options.academicYears=list(data,'academic_years','academicYears');options.teachers=list(data,'teachers');options.grades=list(data,'grades');options.sections=list(data,'sections');options.streams=list(data,'streams')}
const hydrateTimetable=raw=>{const data=unwrap(raw);timetable.periods=list(data,'bells','periods','time_slots');timetable.entries=list(data,'entries','items');timetable.summary=data.summary||{}}
const loadFilters=async()=>{try{hydrateOptions(unwrap(await teacherTimetableService.getFilters()))}catch(e){error.value=messageOf(e)}}
const load=async()=>{if(!filters.teacher_id){timetable.entries=[];timetable.summary={};return}loading.value=true;error.value='';try{hydrateTimetable(await teacherTimetableService.getTimetable(params.value))}catch(e){error.value=messageOf(e)}finally{loading.value=false}}
const refresh=async()=>{await loadFilters();await load()}
const reset=()=>{Object.keys(filters).forEach(k=>filters[k]=null);timetable.entries=[];timetable.summary={};error.value=''}
const exportExcel=async()=>{if(!filters.teacher_id)return;exporting.value=true;try{await teacherTimetableService.exportExcel(params.value)}catch(e){error.value=messageOf(e)}finally{exporting.value=false}}
const printPdf=async()=>{if(!filters.teacher_id)return;printing.value=true;try{await teacherTimetableService.downloadPdf(params.value)}catch(e){error.value=messageOf(e)}finally{printing.value=false}}
onMounted(loadFilters)
</script>

<template>
<v-container fluid class="pa-4 pa-md-6"><div class="d-flex flex-column ga-4">
<TimetableToolbar :loading="loading||exporting||printing" @refresh="refresh" @export="exportExcel" @print="printPdf"/>
<v-alert v-if="error" type="error" variant="tonal" closable @click:close="error=''">{{ error }}</v-alert>
<TimetableFilters v-model="filters" :academic-years="options.academicYears" :schools="options.schools" :grades="options.grades" :sections="options.sections" :streams="options.streams" :subjects="options.subjects" :teachers="options.teachers" :loading="loading" :show-school="false" @apply="load" @reset="reset"/>
<v-alert v-if="!filters.teacher_id" type="info" variant="tonal" icon="mdi-account-search">Select a teacher and click Apply to view the weekly timetable.</v-alert>
<template v-else><SummaryCards :total-periods="summary.weekly_periods??0" :assigned-classes="summary.weekly_periods??0" :subjects-handled="summary.subjects??0" :free-periods="summary.free_periods??0" :weekly-capacity="(summary.weekly_periods??0)+(summary.free_periods??0)" :loading="loading"/><WeeklyGrid :days="timetable.days" :periods="timetable.periods" :entries="timetable.entries" :loading="loading"/><TimetableLegend/></template>
</div></v-container>
</template>

<style scoped>@media print{.v-container{padding:0!important}}</style>
