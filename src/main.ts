import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { pinia } from './store';
import { i18n } from './i18n';
import './style.css';
import ToastPlugin from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-bootstrap.css';
import { useThemeStore } from './store/theme';

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

// Initialize theme store after pinia is installed
useThemeStore();

app.mount('#app');
