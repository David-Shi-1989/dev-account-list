import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ArcoVue from '@arco-design/web-vue'
import ArcoVueIcon from '@arco-design/web-vue/es/icon'
import mixin from '@/global-mixin'

import '@arco-design/web-vue/dist/arco.css'
import '@/style/index.scss'


const app = createApp(App)
app.mixin(mixin)
app.use(router).use(ArcoVue).use(ArcoVueIcon).mount('#app')
