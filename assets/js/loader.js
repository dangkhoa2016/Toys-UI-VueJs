/*jshint esversion: 9 */
import { appStore } from '../../vue/stores/appStore.js';
import { toyStore } from '../../vue/stores/toyStore.js';
import { handleErrors, sleep, fetchWithRetry } from './utils.js';
import * as configModule from './config/config.js';
import * as toyFormModule from './toyForm.js';
import * as modalFormModule from './modalForm.js';
import * as toyVueJsFormModule from './toyVueJsForm.js';
import * as toyStoreHelpersModule from './toyStore.helpers.js';

const { loadModule } = window['vue2-sfc-loader'];

const options = {
  moduleCache: {
    vue: Vue,
    '/assets/js/config/config.js': configModule,
    '/assets/js/toyForm.js': toyFormModule,
    '/assets/js/modalForm.js': modalFormModule,
    '/assets/js/toyVueJsForm.js': toyVueJsFormModule,
    '/assets/js/toyStore.helpers.js': toyStoreHelpersModule,
  },
  async getFile(url) {
    const res = await fetchWithRetry(url);
    if (!res.ok) throw Object.assign(new Error(`${res.statusText}: ${url}`), { res });
    return await res.text();
  },

  addStyle(textContent) {
    const style = Object.assign(document.createElement('style'), { textContent });
    const ref = document.head.getElementsByTagName('style')[0] || null;
    document.head.insertBefore(style, ref);
  },

  pathResolve({ refPath, relPath }) {
    if (relPath === '.') return refPath;
    if (relPath.startsWith('./')) return refPath.slice(0, refPath.lastIndexOf('/') + 1) + relPath.slice(2);
    return relPath;
  },

  log(type, ...args) {
    if (type === 'error' || type === 'warn') {
      console[type](...args);
    }
  },
};

(async () => {
  if (window.BootstrapVue) {
    Vue.use(window.BootstrapVue);
  }

  // Set standard utilities on Vue prototype
  Vue.prototype.$handleErrors = handleErrors;
  Vue.prototype.$sleep = sleep;

  const store = new Vuex.Store({
    modules: {
      appStore,
      toyStore,
    }
  });

  new Vue({
    store,
    el: '#app',
    template: '<app></app>',
    components: {
      'app': () => loadModule('/vue/main.vue', options),
    },
  });
})();
