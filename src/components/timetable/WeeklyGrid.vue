<script setup>
const props=defineProps({days:{type:Array,default:()=>[]},periods:{type:Array,default:()=>[]},entries:{type:Array,default:()=>[]},loading:{type:Boolean,default:false},emptyMessage:{type:String,default:'No timetable entries found.'}})
const dayName=d=>typeof d==='string'?d:(d?.name??d?.label??d?.value??'')
const periodId=p=>Number(p?.id??p?.school_bell_id??p?.value)
const entryFor=(day,period)=>props.entries.find(e=>String(e.weekday??e.day_name??e.day??'').toLowerCase()===String(dayName(day)).toLowerCase()&&Number(e.school_bell_id??e.bell_id??e.period_id)===periodId(period))
const periodTitle=(p,i)=>p?.name??p?.title??p?.label??`Period ${p?.period_no??p?.sort_order??i+1}`
const formatTime=v=>v?String(v).slice(0,5):''
const classLabel=e=>[e?.grade?.name??e?.grade_name,e?.section?.name??e?.section_name,e?.stream?.name??e?.stream_name].filter(Boolean).join(' - ')
const roomLabel=e=>e?.room_no??e?.room??e?.classroom
const isSubstitution=e=>Boolean(e?.is_substitution||e?.substitute_teacher_id)
</script>

<template>
<v-card rounded="xl" border>
  <v-card-title class="px-5 py-4 d-flex align-center ga-2"><v-icon icon="mdi-calendar-week" color="primary"/>Weekly Timetable</v-card-title>
  <v-divider/>
  <v-card-text v-if="loading"><v-skeleton-loader type="table"/></v-card-text>
  <v-card-text v-else-if="!days.length||!periods.length" class="text-center py-12"><v-icon icon="mdi-calendar-blank-outline" size="48" class="mb-3"/><div class="text-body-1">{{ emptyMessage }}</div></v-card-text>
  <div v-else class="table-wrap">
    <table class="timetable-table">
      <thead><tr><th>Period</th><th v-for="day in days" :key="dayName(day)">{{ dayName(day) }}</th></tr></thead>
      <tbody>
        <tr v-for="(period,index) in periods" :key="periodId(period)||index">
          <th><div>{{ periodTitle(period,index) }}</div><small>{{ formatTime(period.start_time) }}<span v-if="period.end_time"> - {{ formatTime(period.end_time) }}</span></small></th>
          <td v-for="day in days" :key="dayName(day)">
            <template v-if="entryFor(day,period)">
              <v-sheet rounded="lg" class="pa-3 timetable-entry" :color="isSubstitution(entryFor(day,period))?'warning-container':'primary-container'">
                <div class="font-weight-bold">{{ entryFor(day,period).subject?.name??entryFor(day,period).subject_name??'Assigned Class' }}</div>
                <div v-if="classLabel(entryFor(day,period))" class="text-caption">{{ classLabel(entryFor(day,period)) }}</div>
                <div v-if="roomLabel(entryFor(day,period))" class="text-caption">Room: {{ roomLabel(entryFor(day,period)) }}</div>
                <v-chip v-if="isSubstitution(entryFor(day,period))" size="x-small" color="warning" variant="tonal" class="mt-2">Substitution</v-chip>
              </v-sheet>
            </template>
            <span v-else class="text-caption text-medium-emphasis">Free</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</v-card>
</template>

<style scoped>
.table-wrap{overflow:auto}.timetable-table{width:100%;min-width:900px;border-collapse:collapse}.timetable-table th,.timetable-table td{border:1px solid rgba(var(--v-border-color),var(--v-border-opacity));padding:12px;vertical-align:top}.timetable-table thead th{background:rgb(var(--v-theme-surface-variant));position:sticky;top:0;z-index:1}.timetable-table tbody th{min-width:150px;background:rgb(var(--v-theme-surface))}.timetable-entry{min-height:82px}@media print{.table-wrap{overflow:visible}.timetable-table{min-width:0;font-size:10px}.timetable-table th,.timetable-table td{padding:6px}}
</style>