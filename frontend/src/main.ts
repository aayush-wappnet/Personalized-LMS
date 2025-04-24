import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';
import vuetify from './plugins/vuetify';
import Toast from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';
import '@mdi/font/css/materialdesignicons.css'; // Add this line
import './assets/styles/main.css';

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(vuetify);
app.use(Toast);

app.mount('#app');