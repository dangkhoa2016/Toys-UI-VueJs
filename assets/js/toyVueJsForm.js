/*jshint esversion: 9 */
import { normalizeToyImageUrl } from '/assets/js/config.js';
import {
  CHECKING_PREVIEW_MESSAGE,
  CHECKING_PREVIEW_PLACEHOLDER,
  getImageError,
  getSubmitDisableReason,
  LOCKED_PREVIEW_MESSAGE,
  READY_PREVIEW_MESSAGE,
  TOY_IMAGE_VALIDATION_MESSAGES,
  loadImagePreview,
} from '/assets/js/toyForm.js';

export function normalizeImageUrl(value) {
  if (!value || typeof value !== 'string' || /\s/.test(value)) {
    return '';
  }

  return normalizeToyImageUrl(value);
}

export function getToyImageError(vm, value) {
  return getImageError({
    value,
    normalizedImageUrl: vm.normalizedImageUrl,
    preview: vm.preview,
  });
}

export function startToyImagePreviewCheck(vm, source, token) {
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

export function queueToyImagePreview(vm, immediate = false) {
  const imageError = getToyImageError(vm, vm.trimmedImage);

  if (imageError && imageError !== TOY_IMAGE_VALIDATION_MESSAGES.previewLoadError) {
    vm.clearPreviewTimer();
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
    vm.clearPreviewTimer();
    vm.resetPreview();
    return;
  }

  if (vm.preview.source === vm.normalizedImageUrl && (vm.preview.status === 'pending' || vm.preview.status === 'ready')) {
    return;
  }

  vm.clearPreviewTimer();

  const token = vm.preview.token + 1;

  if (immediate) {
    startToyImagePreviewCheck(vm, vm.normalizedImageUrl, token);
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
    startToyImagePreviewCheck(vm, vm.normalizedImageUrl, token);
  }, vm.imagePreviewDebounceMs);
}

export const toyVueJsFormComputed = Object.freeze({
  normalizedImageUrl() {
    return normalizeImageUrl(this.trimmedImage);
  },
  previewAlt() {
    return `${this.trimmedName || 'Toy'} image preview`;
  },
  submitDisableReason() {
    return getSubmitDisableReason({
      isFormBusy: this.isFormBusy,
      formBusyMessage: this.formBusyMessage,
      nameError: this.getNameError(this.trimmedName),
      imageError: getToyImageError(this, this.trimmedImage),
      unchangedSubmitMessage: this.unchangedSubmitMessage,
      normalizedImageUrl: this.normalizedImageUrl,
      preview: this.preview,
    });
  },
  isSubmitDisabled() {
    return Boolean(this.submitDisableReason);
  },
});
