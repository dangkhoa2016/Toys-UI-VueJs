/*jshint esversion: 9 */
import { appStore } from '../../vue/stores/appStore.js';
import { toyStore } from '../../vue/stores/toyStore.js';
import { config, normalizeToyImageUrl, toApiImageUrl } from './config.js';
import { handleErrors, sleep, fetchWithRetry } from './utils.js';

const toyImageValidationMessages = Object.freeze({
  required: 'Image URL is required.',
  invalidPath: 'Enter an absolute URL or a local toy image path.',
  previewLoadError: 'Image preview could not be loaded. Please check the URL or use another image.',
});

function normalizeImageUrl(value) {
  if (!value || typeof value !== 'string' || /\s/.test(value)) {
    return '';
  }

  return normalizeToyImageUrl(value);
}

function loadImagePreview(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.decoding = 'async';
    image.onload = () => resolve(source);
    image.onerror = () => reject(new Error('Image preview could not be loaded.'));
    image.src = source;
  });
}

function startToyImagePreviewCheck(vm, source, token) {
  vm.setPreviewState({
    status: 'pending',
    src: '',
    source,
    token,
    message: 'Checking whether this image can be loaded...',
    placeholderMessage: 'Checking image preview...',
  });

  loadImagePreview(source)
    .then(() => {
      if (vm.preview.token !== token || vm.normalizedImageUrl !== source) {
        return;
      }

      vm.setPreviewState({
        status: 'ready',
        src: source,
        source,
        message: 'Image preview is ready. This is what the toy card will use.',
        placeholderMessage: vm.defaultPreviewPlaceholder,
      });
      vm.setFieldError('image', '');
    })
    .catch(() => {
      if (vm.preview.token !== token || vm.normalizedImageUrl !== source) {
        return;
      }

      vm.setPreviewState({
        status: 'error',
        src: '',
        source,
        message: 'The image could not be loaded, so submit stays locked.',
        placeholderMessage: vm.errorPreviewPlaceholder,
      });
      vm.setFieldError('image', toyImageValidationMessages.previewLoadError);
    });
}

function queueToyImagePreview(vm, immediate = false) {
  vm.clearPreviewTimer();

  const imageError = vm.$getToyImageError(vm.trimmedImage);

  if (imageError && imageError !== vm.$toyImageValidationMessages.previewLoadError) {
    vm.setPreviewState({
      status: 'idle',
      src: '',
      source: '',
      message: 'Enter a valid image URL or local toy image path to unlock submit.',
      placeholderMessage: vm.invalidPreviewPlaceholder,
      token: vm.preview.token + 1,
    });
    return;
  }

  if (!vm.normalizedImageUrl) {
    vm.resetPreview();
    return;
  }

  if (vm.preview.source === vm.normalizedImageUrl && (vm.preview.status === 'pending' || vm.preview.status === 'ready')) {
    return;
  }

  const token = vm.preview.token + 1;

  if (immediate) {
    vm.$startToyImagePreviewCheck(vm, vm.normalizedImageUrl, token);
    return;
  }

  vm.setPreviewState({
    status: 'pending',
    src: '',
    source: vm.normalizedImageUrl,
    token,
    message: 'Checking whether this image can be loaded...',
    placeholderMessage: 'Checking image preview...',
  });

  vm.previewDebounceId = window.setTimeout(() => {
    vm.previewDebounceId = 0;
    vm.$startToyImagePreviewCheck(vm, vm.normalizedImageUrl, token);
  }, vm.imagePreviewDebounceMs);
}

function getToyImageError(value) {
  if (!value) {
    return toyImageValidationMessages.required;
  }

  if (!this.normalizedImageUrl) {
    return toyImageValidationMessages.invalidPath;
  }

  if (this.preview.status === 'error' && this.preview.source === this.normalizedImageUrl) {
    return toyImageValidationMessages.previewLoadError;
  }

  return '';
}

const toyImageFormComputed = Object.freeze({
  normalizedImageUrl() {
    return this.$normalizeImageUrl(this.trimmedImage);
  },
  previewAlt() {
    return `${this.trimmedName || 'Toy'} image preview`;
  },
  submitDisableReason() {
    if (this.isFormBusy) {
      return this.formBusyMessage || 'Please wait...';
    }

    if (this.getNameError(this.trimmedName) || this.$getToyImageError(this.trimmedImage)) {
      return 'Complete the required fields with valid values.';
    }

    if (this.unchangedSubmitMessage) {
      return this.unchangedSubmitMessage;
    }

    if (!this.normalizedImageUrl) {
      return 'Enter a valid image URL or local toy image path.';
    }

    if (this.preview.status === 'error' && this.preview.source === this.normalizedImageUrl) {
      return 'Use an image that can be loaded in preview.';
    }

    if (this.preview.source !== this.normalizedImageUrl || this.preview.status === 'pending') {
      return 'Wait until the image preview finishes loading.';
    }

    if (this.preview.status !== 'ready') {
      return 'Wait until the image preview is ready.';
    }

    return '';
  },
  isSubmitDisabled() {
    return Boolean(this.submitDisableReason);
  },
});

const { loadModule } = window['vue2-sfc-loader'];

const options = {
  moduleCache: {
    vue: Vue,
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
  Object.defineProperties(Vue.prototype, {
    $appConfig: {
      value: Object.freeze({ ...config }),
      writable: false,
      configurable: false,
    },
    $normalizeImageUrl: {
      value: normalizeImageUrl,
      writable: false,
      configurable: false,
    },
    $toyImageFormComputed: {
      value: toyImageFormComputed,
      writable: false,
      configurable: false,
    },
    $toyImageValidationMessages: {
      value: toyImageValidationMessages,
      writable: false,
      configurable: false,
    },
    $getToyImageError: {
      value: getToyImageError,
      writable: false,
      configurable: false,
    },
    $startToyImagePreviewCheck: {
      value: startToyImagePreviewCheck,
      writable: false,
      configurable: false,
    },
    $queueToyImagePreview: {
      value: queueToyImagePreview,
      writable: false,
      configurable: false,
    },
    $toApiImageUrl: {
      value: toApiImageUrl,
      writable: false,
      configurable: false,
    },
  });

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
