import { nextTick } from 'vue'
import { renderMath } from '../utils/renderMath'

export default {
  mounted(el) {
    nextTick(() => renderMath(el))
  },
  updated(el) {
    nextTick(() => renderMath(el))
  }
}