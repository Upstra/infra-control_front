import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { pinia } from './store';
import { i18n } from './i18n';
import ToastPlugin from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-bootstrap.css';
import { useThemeStore } from './store/theme';
import '@fontsource-variable/geist';
import '@fontsource/dm-mono/300.css';
import '@fontsource/dm-mono/400.css';
import '@fontsource/dm-mono/500.css';
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
import './style.css';

const app = createApp(App);

app.use(router);
app.use(pinia);
app.use(i18n);
app.use(ToastPlugin, {
  position: 'top-right',
  timeout: 3000,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
});

useThemeStore();

app.mount('#app');
