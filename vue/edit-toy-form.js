/*jshint esversion: 9 */

const TOY_NAME_MIN_LENGTH = 2;
const TOY_NAME_MAX_LENGTH = 120;
const IMAGE_PREVIEW_DEBOUNCE_MS = 300;
const DEFAULT_PREVIEW_PLACEHOLDER = 'Preview will appear here after the image URL is checked.';
const INVALID_PREVIEW_PLACEHOLDER = 'Enter a valid image URL or local toy image path to preview it.';
const ERROR_PREVIEW_PLACEHOLDER = 'This image could not be loaded in preview.';
const TOY_IMAGE_FORM_COMPUTED = Vue.prototype.$toyImageFormComputed || {};

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
    message: 'The save button unlocks after the new image is verified.',
    placeholderMessage: DEFAULT_PREVIEW_PLACEHOLDER,
    token: 0,
  };
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
      },
      validationErrors: createValidationErrors(),
      preview: createPreviewState(),
    };
  },
  computed: {
    ...Vuex.mapGetters({
      editingToyId: 'toyStore/getEditingToyId',
      editingToy: 'toyStore/getEditingToy',
      errorUpdateToy: 'toyStore/getErrorUpdateToy',
      updatingToy: 'toyStore/getUpdatingToy',
      updateToyResult: 'toyStore/getUpdateToyResult',
    }),
    isUpdating() {
      return Boolean(this.updatingToy) && this.updatingToy.toString() === (this.editingToyId || '').toString();
    },
    isFormBusy() {
      return this.isUpdating || this.localSubmitting;
    },
    toyLabel() {
      if (!this.editingToy) {
        return 'the selected toy';
      }

      return `#${this.editingToy.id} ${this.editingToy.name}`;
    },
    trimmedName() {
      return (this.form.name || '').trim();
    },
    trimmedImage() {
      return (this.form.image || '').trim();
    },
    currentImageUrl() {
      return this.$normalizeImageUrl(this.editingToy && this.editingToy.image ? this.editingToy.image : '');
    },
    isUnchanged() {
      if (!this.editingToy) {
        return false;
      }

      return this.trimmedName === (this.editingToy.name || '').trim() && this.normalizedImageUrl === this.currentImageUrl;
    },
    formBusyMessage() {
      return 'Saving changes...';
    },
    unchangedSubmitMessage() {
      return this.isUnchanged ? 'Update the name or image to enable save.' : '';
    },
    defaultPreviewPlaceholder() {
      return DEFAULT_PREVIEW_PLACEHOLDER;
    },
    errorPreviewPlaceholder() {
      return ERROR_PREVIEW_PLACEHOLDER;
    },
    invalidPreviewPlaceholder() {
      return INVALID_PREVIEW_PLACEHOLDER;
    },
    imagePreviewDebounceMs() {
      return IMAGE_PREVIEW_DEBOUNCE_MS;
    },
    ...TOY_IMAGE_FORM_COMPUTED,
    submitLabel() {
      return this.isFormBusy ? 'Saving changes...' : 'Save Changes';
    },
  },
  watch: {
    editingToyId(value) {
      if (value) {
        this.syncFormFromToy();
        armModalBackdropObserver(this);
        this.$bvModal.show('modal-edit-toy');
        return;
      }

      this.$bvModal.hide('modal-edit-toy');
    },
    editingToy(value) {
      if (value && this.editingToyId) {
        this.syncFormFromToy();
      }
    },
    updateToyResult(value) {
      if (value && this.editingToyId && value.id.toString() === this.editingToyId.toString()) {
        this.$bvModal.hide('modal-edit-toy');
      }
    },
  },
  beforeDestroy() {
    this.clearPreviewTimer();
    stopModalBackdropObserver(this);
  },
  methods: {
    ...Vuex.mapActions({
      updateToyBase: 'toyStore/updateToy',
      setEditingToyId: 'toyStore/setEditingToyId',
    }),
    clearUpdateState() {
      this.$store.commit('toyStore/SET_ERROR_UPDATE_TOY', null);
      this.$store.commit('toyStore/SET_UPDATE_TOY_RESULT', null);
    },
    clearPreviewTimer() {
      if (!this.previewDebounceId) {
        return;
      }

      window.clearTimeout(this.previewDebounceId);
      this.previewDebounceId = 0;
    },
    syncFormFromToy() {
      if (!this.editingToy) {
        return;
      }

      this.form = {
        name: this.editingToy.name || '',
        image: this.editingToy.image || '',
      };
      this.validationErrors = createValidationErrors();
      this.localSubmitting = false;
      this.queueImagePreview(true);
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
        this.setFieldError('image', this.$getToyImageError(this.trimmedImage));
      }
    },
    focusFirstInvalidInput() {
      if (this.validationErrors.name && this.$refs.nameInput) {
        this.$refs.nameInput.focus();
        return;
      }

      const imageInput = this.$el.querySelector('#edit-toy-image');
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
    queueImagePreview(immediate = false) {
      this.$queueToyImagePreview(this, immediate);
    },
    handleFieldInput(field) {
      this.clearUpdateState();
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
        name: this.trimmedName,
        image: this.trimmedImage,
      };
    },
    async updateToy() {
      if (this.localSubmitting || this.isUpdating) {
        return;
      }

      const payload = this.validateForm();
      if (!payload || !this.editingToyId) {
        this.focusFirstInvalidInput();
        return;
      }

      this.localSubmitting = true;

      try {
        await this.updateToyBase({
          id: this.editingToyId,
          ...payload,
        });
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
    hideModal() {
      this.$bvModal.hide('modal-edit-toy');
    },
    onHidden() {
      stopModalBackdropObserver(this);
      this.resetPreview();
      this.validationErrors = createValidationErrors();
      this.localSubmitting = false;
      this.clearUpdateState();
      this.setEditingToyId(null);
    },
  },
};
