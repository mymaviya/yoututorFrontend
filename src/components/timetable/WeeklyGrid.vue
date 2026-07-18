<script setup>
import { computed } from 'vue'

const props = defineProps({
  days: {
    type: Array,
    default: () => [],
  },
  periods: {
    type: Array,
    default: () => [],
  },
  entries: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  emptyMessage: {
   