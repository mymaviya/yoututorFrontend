<script setup>
import { computed } from 'vue'

const props = defineProps({
  totalPeriods: {
    type: Number,
    default: 0,
  },
  assignedClasses: {
    type: Number,
    default: 0,
  },
  subjectsHandled: {
    type: Number,
    default: 0,
  },
  freePeriods: {
    type: Number,
    default: 0,
  },
  weeklyCapacity: {
    type: Number,
    default: 0,
  },
  loading: {
    type: Boolean,
    default: false,
  },