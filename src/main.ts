import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { pinia } from "./store";
import "./style.css";
import ToastPlugin from "vue-toast-notification";
import "vue-toast-notification/dist/theme-bootstrap.css";
const app = createApp(App);

app.use(router);
app.use(pinia);
app.use(ToastPlugin, {
  position: "top-right",
  timeout: 3000,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
});

app.mount("#app");
