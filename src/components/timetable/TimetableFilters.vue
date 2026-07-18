<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  },
  academicYears: {
    type: Array,
    default: () => []
  },
  schools: {
    type: Array,
    default: () => []
  },
  grades: {
    type: Array,
    default: () => []
  },
  sections: {
    type: Array,
    default: () => []
  },
  streams: {
    type: Array,
    default: () => []
  },
  subjects: {
    type: Array,
    default: () => []
  },
  teachers: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  showSchool: {
    type: Boolean,
   