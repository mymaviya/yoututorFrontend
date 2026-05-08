import './assets/main.css' 
import 'katex/dist/katex.min.css'
import { createApp, watch  } from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import { createPinia } from 'pinia'
import { useAuthStore } from './stores/auth'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(vuetify)
app.use(router)

const auth = useAuthStore()

watch(
  () => auth.theme,
  (val) => {
    vuetify.theme.change(val)
  },
  { immediate: true }
)

await auth.fetchUser()

app.mount('#app')

