import './assets/main.css' 
import 'katex/dist/katex.min.css'
import "../src/assets/print.css";
import { createApp, watch  } from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import { createPinia } from 'pinia'
import { useAuthStore } from './stores/auth'
import mathDirective from './directives/math'

// Components
import MathContent from './components/common/MathContent.vue'
import AppDataTable from './components/common/AppDataTable.vue'

const app = createApp(App)
const pinia = createPinia()

app.directive('math', mathDirective)
app.component('MathContent', MathContent)
app.component('AppDataTable', AppDataTable)
app.use(pinia)
app.use(vuetify)
app.use(router)

const auth = useAuthStore()

const token = localStorage.getItem('token')

if (token) {
  await auth.fetchUser()
  
}


watch(
  () => auth.theme,
  (val) => {
    vuetify.theme.change(val)
  },
  { immediate: true }
)



app.mount('#app')

