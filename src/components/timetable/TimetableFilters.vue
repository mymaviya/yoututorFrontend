<script setup>
const props=defineProps({modelValue:{type:Object,default:()=>({})},academicYears:{type:Array,default:()=>[]},teachers:{type:Array,default:()=>[]},loading:{type:Boolean,default:false},disabled:{type:Boolean,default:false}})
const emit=defineEmits(['update:modelValue','apply','reset'])
const set=(key,value)=>emit('update:modelValue',{...props.modelValue,[key]:value})
</script>

<template>
<v-card rounded="xl" border>
  <v-card-text class="pa-4">
    <v-row dense align="center">
      <v-col cols="12" md="5"><v-select label="Academic Year" :items="academicYears" item-title="name" item-value="id" :model-value="modelValue.academic_year_id" :loading="loading" :disabled="disabled" clearable hide-details @update:model-value="set('academic_year_id',$event)"/></v-col>
      <v-col cols="12" md="5"><v-select label="Teacher" :items="teachers" item-title="name" item-value="id" :model-value="modelValue.teacher_id" :loading="loading" :disabled="disabled" clearable hide-details @update:model-value="set('teacher_id',$event)"/></v-col>
      <v-col cols="12" md="2" class="d-flex ga-2"><v-btn color="primary" class="flex-grow-1" :loading="loading" :disabled="disabled||!modelValue.teacher_id" @click="emit('apply')">Apply</v-btn><v-btn icon="mdi-refresh" variant="tonal" :disabled="disabled||loading" @click="emit('reset')"/></v-col>
    </v-row>
  </v-card-text>
</v-card>
</template>