<script setup>
import { computed } from 'vue'
const props=defineProps({totalPeriods:{type:Number,default:0},assignedClasses:{type:Number,default:0},subjectsHandled:{type:Number,default:0},freePeriods:{type:Number,default:0},weeklyCapacity:{type:Number,default:0},loading:{type:Boolean,default:false}})
const cards=computed(()=>[
{label:'Total Periods',value:props.totalPeriods,icon:'mdi-calendar-clock',color:'primary'},
{label:'Assigned Classes',value:props.assignedClasses,icon:'mdi-google-classroom',color:'success'},
{label:'Subjects',value:props.subjectsHandled,icon:'mdi-book-open-page-variant',color:'info'},
{label:'Free Periods',value:props.freePeriods,icon:'mdi-coffee-outline',color:'warning'},
{label:'Weekly Capacity',value:props.weeklyCapacity,icon:'mdi-chart-donut',color:'secondary'}])
</script>
<template>
<v-row dense><v-col v-for="card in cards" :key="card.label" cols="12" sm="6" md="4" lg="2"><v-card rounded="xl" border height="100%"><v-card-text class="d-flex align-center ga-3 pa-4"><v-avatar :color="card.color" variant="tonal" rounded="lg"><v-icon :icon="card.icon"/></v-avatar><div><v-skeleton-loader v-if="loading" type="text" width="48"/><div v-else class="text-h6 font-weight-bold">{{ card.value }}</div><div class="text-caption text-medium-emphasis">{{ card.label }}</div></div></v-card-text></v-card></v-col></v-row>
</template>
