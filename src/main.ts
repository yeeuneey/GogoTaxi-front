import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(router)        // router를 전역 등록
app.mount('#app')      // 그 다음 mount
