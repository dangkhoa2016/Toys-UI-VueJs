/*jshint esversion: 9 */

const TOY_NAME_MIN_LENGTH = 2;
const TOY_NAME_MAX_LENGTH = 120;
const IMAGE_PREVIEW_DEBOUNCE_MS = 300;
const DEFAULT_PREVIEW_PLACEHOLDER = 'Preview will appear here after the image URL is checked.';
const INVALID_PREVIEW_PLACEHOLDER = 'Enter a valid image URL or local toy image path to preview it.';
const ERROR_PREVIEW_PLACEHOLDER = 'This image could not be loaded in preview.';

function createValidationErrors() {
  return {
    name: '',
    image: '',
  };
}

function createPreviewState() {
  return {
    status: 'idle',
    src: '',
    source: '',
    message: 'Enter an image URL to verify it before submitting.',
    placeholderMessage: DEFAULT_PREVIEW_PLACEHOLDER,
    token: 0,
  };
}

function normalizeImageUrl(value) {
  if (!value || typeof value !== 'string' || /\s/.test(value)) {
    return '';
  }

  try {
    const parsed = new URL(value.trim(), window.location.origin);

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return '';
    }

    return parsed.href;
  } catch (err) {
    return '';
  }
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

function normalizeBackdrop(backdrop) {
  if (!backdrop || !backdrop.classList) {
    return;
  }

  backdrop.classList.add('fade', 'show');
}

function findBackdrop(node) {
  if (!(node instanceof HTMLElement)) {
    return null;
  }

  if (node.classList.contains('modal-backdrop')) {
    return node;
  }

  return node.querySelector('.modal-backdrop');
}

function stopModalBackdropObserver(target) {
  if (!target || !target.backdropObserver) {
    return;
  }

  target.backdropObserver.disconnect();
  target.backdropObserver = null;
}

function armModalBackdropObserver(target) {
  if (!target) {
    return;
  }

  stopModalBackdropObserver(target);

  const existingBackdrop = document.querySelector('.modal-backdrop');
  if (existingBackdrop) {
    normalizeBackdrop(existingBackdrop);
    return;
  }

  target.backdropObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        const backdrop = findBackdrop(node);
        if (!backdrop) {
          continue;
        }

        normalizeBackdrop(backdrop);
        stopModalBackdropObserver(target);
        return;
      }
    }
  });

  target.backdropObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

export default {
  data() {
    return {
      backdropObserver: null,
      localSubmitting: false,
      previewDebounceId: 0,
      form: {
        name: '',
        image: '',
        likes: 0,
      },
      validationErrors: createValidationErrors(),
      preview: createPreviewState(),
    };
  },
  computed: {
    ...Vuex.mapGetters({
      addFormStatus: 'toyStore/getAddFormStatus',
      errorSaveToy: 'toyStore/getErrorSaveToy',
      savingToy: 'toyStore/getSavingToy',
      saveToyResult: 'toyStore/getSaveToyResult',
    }),
    trimmedName() {
      return (this.form.name || '').trim();
    },
    trimmedImage() {
      return (this.form.image || '').trim();
    },
    normalizedImageUrl() {
      return normalizeImageUrl(this.trimmedImage);
    },
    isFormBusy() {
      return Boolean(this.savingToy) || this.localSubmitting;
    },
    previewAlt() {
      return `${this.trimmedName || 'Toy'} image preview`;
    },
    submitLabel() {
      return this.isFormBusy ? 'Creating toy...' : 'Create New Toy';
    },
    submitDisableReason() {
      if (this.isFormBusy) {
        return 'Creating toy...';
      }

      if (this.getNameError(this.trimmedName) || this.getImageError(this.trimmedImage)) {
        return 'Complete the required fields with valid values.';
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
  },
  watch: {
    addFormStatus(val) {
      if (val) {
        armModalBackdropObserver(this);
        this.$bvModal.show('modal-add-toy');
        return;
      }

      this.$bvModal.hide('modal-add-toy');
    },
    saveToyResult(val) {
      if (val && val.id) {
        this.resetForm();
        this.$bvModal.hide('modal-add-toy');
      }
    },
  },
  beforeDestroy() {
    this.clearPreviewTimer();
    stopModalBackdropObserver(this);
  },
  methods: {
    ...Vuex.mapActions({
      createToyBase: 'toyStore/createToy',
      setAddFormStatus: 'toyStore/setAddFormStatus',
    }),
    clearCreateState() {
      this.$store.commit('toyStore/SET_ERROR_SAVE_TOY', null);
      this.$store.commit('toyStore/SET_SAVE_TOY_RESULT', null);
    },
    clearPreviewTimer() {
      if (!this.previewDebounceId) {
        return;
      }

      window.clearTimeout(this.previewDebounceId);
      this.previewDebounceId = 0;
    },
    getNameError(value) {
      if (!value) {
        return 'Toy name is required.';
      }

      if (value.length < TOY_NAME_MIN_LENGTH) {
        return `Toy name must have at least ${TOY_NAME_MIN_LENGTH} characters.`;
      }

      if (value.length > TOY_NAME_MAX_LENGTH) {
        return `Toy name must be ${TOY_NAME_MAX_LENGTH} characters or fewer.`;
      }

      return '';
    },
    getImageError(value) {
      if (!value) {
        return 'Image URL is required.';
      }

      if (!this.normalizedImageUrl) {
        return 'Enter an absolute URL or a local toy image path.';
      }

      if (this.preview.status === 'error' && this.preview.source === this.normalizedImageUrl) {
        return 'Image preview could not be loaded. Please check the URL or use another image.';
      }

      return '';
    },
    setFieldError(field, message) {
      this.validationErrors = {
        ...this.validationErrors,
        [field]: message,
      };
    },
    validateField(field) {
      if (field === 'name') {
        this.setFieldError('name', this.getNameError(this.trimmedName));
        return;
      }

      if (field === 'image') {
        this.setFieldError('image', this.getImageError(this.trimmedImage));
      }
    },
    focusFirstInvalidInput() {
      if (this.validationErrors.name && this.$refs.nameInput) {
        this.$refs.nameInput.focus();
        return;
      }

      const imageInput = this.$el.querySelector('#toy-image-input');
      if (imageInput) {
        imageInput.focus();
      }
    },
    resetPreview() {
      this.clearPreviewTimer();
      this.preview = {
        ...createPreviewState(),
        token: this.preview.token + 1,
      };
    },
    setPreviewState(patch) {
      this.preview = {
        ...this.preview,
        ...patch,
      };
    },
    startPreviewCheck(source, token) {
      this.setPreviewState({
        status: 'pending',
        src: '',
        source,
        token,
        message: 'Checking whether this image can be loaded...',
        placeholderMessage: 'Checking image preview...',
      });

      loadImagePreview(source)
        .then(() => {
          if (this.preview.token !== token || this.normalizedImageUrl !== source) {
            return;
          }

          this.setPreviewState({
            status: 'ready',
            src: source,
            source,
            message: 'Image preview is ready. This is what the toy card will use.',
            placeholderMessage: DEFAULT_PREVIEW_PLACEHOLDER,
          });
          this.setFieldError('image', '');
        })
        .catch(() => {
          if (this.preview.token !== token || this.normalizedImageUrl !== source) {
            return;
          }

          this.setPreviewState({
            status: 'error',
            src: '',
            source,
            message: 'The image could not be loaded, so submit stays locked.',
            placeholderMessage: ERROR_PREVIEW_PLACEHOLDER,
          });
          this.setFieldError('image', 'Image preview could not be loaded. Please check the URL or use another image.');
        });
    },
    queueImagePreview(immediate = false) {
      this.clearPreviewTimer();

      const imageError = this.getImageError(this.trimmedImage);

      if (imageError && imageError !== 'Image preview could not be loaded. Please check the URL or use another image.') {
        this.setPreviewState({
          status: 'idle',
          src: '',
          source: '',
          message: 'Enter a valid image URL or local toy image path to unlock submit.',
          placeholderMessage: INVALID_PREVIEW_PLACEHOLDER,
          token: this.preview.token + 1,
        });
        return;
      }

      if (!this.normalizedImageUrl) {
        this.resetPreview();
        return;
      }

      if (this.preview.source === this.normalizedImageUrl && (this.preview.status === 'pending' || this.preview.status === 'ready')) {
        return;
      }

      const token = this.preview.token + 1;

      if (immediate) {
        this.startPreviewCheck(this.normalizedImageUrl, token);
        return;
      }

      this.setPreviewState({
        status: 'pending',
        src: '',
        source: this.normalizedImageUrl,
        token,
        message: 'Checking whether this image can be loaded...',
        placeholderMessage: 'Checking image preview...',
      });

      this.previewDebounceId = window.setTimeout(() => {
        this.previewDebounceId = 0;
        this.startPreviewCheck(this.normalizedImageUrl, token);
      }, IMAGE_PREVIEW_DEBOUNCE_MS);
    },
    handleFieldInput(field) {
      this.clearCreateState();
      this.validateField(field);

      if (field === 'image') {
        this.queueImagePreview(false);
      }
    },
    validateForm() {
      this.validationErrors = createValidationErrors();
      this.validateField('name');
      this.validateField('image');

      if (this.validationErrors.name || this.validationErrors.image) {
        return null;
      }

      if (this.submitDisableReason) {
        return null;
      }

      return {
        ...this.form,
        name: this.trimmedName,
        image: this.trimmedImage,
      };
    },
    async createToy() {
      if (this.localSubmitting || this.savingToy) {
        return;
      }

      const payload = this.validateForm();
      if (!payload) {
        this.focusFirstInvalidInput();
        return;
      }

      this.localSubmitting = true;

      try {
        await this.createToyBase(payload);
      } finally {
        this.localSubmitting = false;
      }
    },
    onShown() {
      this.$nextTick(() => {
        if (this.$refs.nameInput) {
          this.$refs.nameInput.focus();
        }
      });
    },
    onHidden() {
      stopModalBackdropObserver(this);
      this.resetForm();
      this.clearCreateState();
      this.setAddFormStatus(false);
    },
    resetForm() {
      this.form = {
        name: '',
        image: '',
        likes: 0,
      };
      this.validationErrors = createValidationErrors();
      this.localSubmitting = false;
      this.resetPreview();
    },
  },
};
