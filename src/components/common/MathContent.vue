<script setup>
import { ref, watch, nextTick, onMounted } from 'vue'
import { renderMath } from '../../utils/renderMath'

const props = defineProps({
  html: {
    type: String,
    default: ''
  },
  tag: {
    type: String,
    default: 'div'
  }
})

const contentRef = ref(null)

const render = async () => {
  await nextTick()

  if (contentRef.value) {
    renderMath(contentRef.value)
  }
}

watch(
  () => props.html,
  render,
  { immediate: true }
)

onMounted(render)
</script>

<template>
  <component
    :is="tag"
    ref="contentRef"
    class="math-content"
    v-html="html"
  />
</template>

<style scoped>
.math-content :deep(p) {
  margin-bottom: 4px;
}

.math-content :deep(.katex) {
  font-size: 1.05em;
}
</style>