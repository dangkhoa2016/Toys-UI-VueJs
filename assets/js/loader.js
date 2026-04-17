/*jshint esversion: 9 */
import { appStore } from '../../vue/stores/appStore.js';
import { toyStore } from '../../vue/stores/toyStore.js';
import { config, normalizeToyImageUrl, toApiImageUrl } from './config.js';
import {
  armModalBackdropObserver,
  focusFormField,
  resetManagedForm,
  stopModalBackdropObserver,
} from './modalForm.js';
import { getHighlightedToySignature } from './toyStore.helpers.js';
import {
  CHECKING_PREVIEW_MESSAGE,
  CHECKING_PREVIEW_PLACEHOLDER,
  CREATE_PREVIEW_MESSAGE,
  createPreviewState,
  createToyFormLifecycleState,
  createToyFormValues,
  createValidationErrors,
  DEFAULT_PREVIEW_PLACEHOLDER,
  ERROR_PREVIEW_PLACEHOLDER,
  getImageError,
  getNameError,
  getSubmitDisableReason,
  IMAGE_PREVIEW_DEBOUNCE_MS,
  INVALID_PREVIEW_PLACEHOLDER,
  loadImagePreview,
  LOCKED_PREVIEW_MESSAGE,
  READY_PREVIEW_MESSAGE,
  TOY_IMAGE_VALIDATION_MESSAGES,
  TOY_NAME_MAX_LENGTH,
  TOY_NAME_MIN_LENGTH,
  UPDATE_PREVIEW_MESSAGE,
} from './toyForm.js';
import { handleErrors, sleep, fetchWithRetry } from './utils.js';

function normalizeImageUrl(value) {
  if (!value || typeof value !== 'string' || /\s/.test(value)) {
    return '';
  }

  return normalizeToyImageUrl(value);
}

function startToyImagePreviewCheck(vm, source, token) {
  vm.setPreviewState({
    status: 'pending',
    src: '',
    source,
    token,
    message: CHECKING_PREVIEW_MESSAGE,
    placeholderMessage: CHECKING_PREVIEW_PLACEHOLDER,
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
        message: READY_PREVIEW_MESSAGE,
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
        message: LOCKED_PREVIEW_MESSAGE,
        placeholderMessage: vm.errorPreviewPlaceholder,
      });
      vm.setFieldError('image', TOY_IMAGE_VALIDATION_MESSAGES.previewLoadError);
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
    message: CHECKING_PREVIEW_MESSAGE,
    placeholderMessage: CHECKING_PREVIEW_PLACEHOLDER,
  });

  vm.previewDebounceId = window.setTimeout(() => {
    vm.previewDebounceId = 0;
    vm.$startToyImagePreviewCheck(vm, vm.normalizedImageUrl, token);
  }, vm.imagePreviewDebounceMs);
}

function getToyImageError(value) {
  return getImageError({
    value,
    normalizedImageUrl: this.normalizedImageUrl,
    preview: this.preview,
  });
}

const toyImageFormComputed = Object.freeze({
  normalizedImageUrl() {
    return this.$normalizeImageUrl(this.trimmedImage);
  },
  previewAlt() {
    return `${this.trimmedName || 'Toy'} image preview`;
  },
  submitDisableReason() {
    return getSubmitDisableReason({
      isFormBusy: this.isFormBusy,
      formBusyMessage: this.formBusyMessage,
      nameError: this.getNameError(this.trimmedName),
      imageError: this.$getToyImageError(this.trimmedImage),
      unchangedSubmitMessage: this.unchangedSubmitMessage,
      normalizedImageUrl: this.normalizedImageUrl,
      preview: this.preview,
    });
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
    $toyForm: {
      value: Object.freeze({
        TOY_NAME_MIN_LENGTH,
        TOY_NAME_MAX_LENGTH,
        IMAGE_PREVIEW_DEBOUNCE_MS,
        DEFAULT_PREVIEW_PLACEHOLDER,
        INVALID_PREVIEW_PLACEHOLDER,
        ERROR_PREVIEW_PLACEHOLDER,
        CREATE_PREVIEW_MESSAGE,
        UPDATE_PREVIEW_MESSAGE,
        TOY_IMAGE_VALIDATION_MESSAGES,
        createToyFormLifecycleState,
        createToyFormValues,
        createValidationErrors,
        createPreviewState,
        getNameError,
        getImageError,
        getSubmitDisableReason,
        loadImagePreview,
      }),
      writable: false,
      configurable: false,
    },
    $modalForm: {
      value: Object.freeze({
        armModalBackdropObserver,
        focusFormField,
        resetManagedForm,
        stopModalBackdropObserver,
      }),
      writable: false,
      configurable: false,
    },
    $toyStoreHelpers: {
      value: Object.freeze({
        getHighlightedToySignature,
      }),
      writable: false,
      configurable: false,
    },
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
      value: TOY_IMAGE_VALIDATION_MESSAGES,
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
