import Vue from 'vue';
import App from './App.vue';
import './registerServiceWorker';
import router from './router';
import store from './store';

import { library } from '@fortawesome/fontawesome-svg-core';
import icons from './components/ui/icons';

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
icons.forEach(icon => {
  library.add(icon);
});
Vue.component('font-awesome-icon', FontAwesomeIcon);

import components from '@/components/ui';

components.forEach(component => {
  Vue.component(component.name, component);
});

Vue.config.productionTip = false;

const app = new Vue({
  router,
  store,
  render: h => h(App)
});

app.$mount('#app');
