<script setup>
import { useTableStore } from '../../stores/table'

const tableStore = useTableStore()
</script>

<template>
  <v-data-table
    v-bind="$attrs"
    v-model:items-per-page="tableStore.itemsPerPage"
    :items-per-page-options="[25, 50, 100, 200]"
  >
    <template
      v-for="(_, slot) in $slots"
      #[slot]="scope"
    >
      <slot :name="slot" v-bind="scope" />
    </template>
  </v-data-table>
</template>