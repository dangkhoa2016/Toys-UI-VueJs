/*jshint esversion: 9 */
import {
  TOY_NAME_MIN_LENGTH,
  TOY_NAME_MAX_LENGTH,
  IMAGE_PREVIEW_DEBOUNCE_MS,
  DEFAULT_PREVIEW_PLACEHOLDER,
  INVALID_PREVIEW_PLACEHOLDER,
  ERROR_PREVIEW_PLACEHOLDER,
  UPDATE_PREVIEW_MESSAGE,
  createValidationErrors,
  createToyFormLifecycleState,
  createPreviewState,
} from '/assets/js/toyForm.js';
import {
  TOY_FORM_FIELD_NAMES,
  TOY_PREVIEW_STATUS,
} from '/assets/js/config/config.js';
import {
  armModalBackdropObserver,
  focusFormField,
  resetManagedForm,
  stopModalBackdropObserver,
} from '/assets/js/modalForm.js';
import {
  getToyImageError,
  normalizeImageUrl,
  queueToyImagePreview,
  toyVueJsFormComputed,
} from '/assets/js/toyVueJsForm.js';

function createFormPreviewState() {
  return createPreviewState({ message: UPDATE_PREVIEW_MESSAGE, placeholderMessage: DEFAULT_PREVIEW_PLACEHOLDER });
}

function createEditFormState(toy = null) {
  return createToyFormLifecycleState({
    toy,
    previewMessage: UPDATE_PREVIEW_MESSAGE,
    previewPlaceholderMessage: DEFAULT_PREVIEW_PLACEHOLDER,
  });
}

export default {
  data() {
    const lifecycleState = createEditFormState();
    return {
      backdropObserver: null,
      previewDebounceId: 0,
      ...lifecycleState,
    };
  },
  computed: {
    ...Vuex.mapGetters({
      editingToyId: 'toyStore/getEditingToyId',
      editingToy: 'toyStore/getEditingToy',
      updateToyError: 'toyStore/getUpdateToyError',
      updatingToyId: 'toyStore/getUpdatingToyId',
      updateToyResult: 'toyStore/getUpdateToyResult',
    }),
    isUpdating() {
      return Boolean(this.updatingToyId) && this.updatingToyId.toString() === (this.editingToyId || '').toString();
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
      return (this.form[this.nameField] || '').trim();
    },
    trimmedImage() {
      return (this.form[this.imageField] || '').trim();
    },
    nameField() {
      return TOY_FORM_FIELD_NAMES.NAME;
    },
    imageField() {
      return TOY_FORM_FIELD_NAMES.IMAGE;
    },
    previewStatus() {
      return TOY_PREVIEW_STATUS;
    },
    nameMinLength() {
      return TOY_NAME_MIN_LENGTH;
    },
    nameMaxLength() {
      return TOY_NAME_MAX_LENGTH;
    },
    currentImageUrl() {
      return normalizeImageUrl(this.editingToy && this.editingToy.image ? this.editingToy.image : '');
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
    ...toyVueJsFormComputed,
    submitLabel() {
      return this.isFormBusy ? 'Saving changes...' : 'Save Changes';
    },
  },
  watch: {
    editingToyId(value) {
      if (value) {
        this.syncFormState();
        armModalBackdropObserver(this);
        this.$bvModal.show('modal-edit-toy');
        return;
      }

      this.$bvModal.hide('modal-edit-toy');
    },
    editingToy(value) {
      if (value && this.editingToyId) {
        this.syncFormState();
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
    clearSubmitState() {
      this.$store.commit('toyStore/SET_UPDATE_TOY_ERROR', null);
      this.$store.commit('toyStore/SET_UPDATE_TOY_RESULT', null);
    },
    clearPreviewTimer() {
      if (!this.previewDebounceId) {
        return;
      }

      window.clearTimeout(this.previewDebounceId);
      this.previewDebounceId = 0;
    },
    syncFormState() {
      const lifecycleState = createEditFormState(this.editingToy);

      this.form = lifecycleState.form;
      this.validationErrors = lifecycleState.validationErrors;
      this.localSubmitting = lifecycleState.localSubmitting;
      this.preview = {
        ...lifecycleState.preview,
        token: this.preview.token + 1,
      };
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
      if (field === this.nameField) {
        this.setFieldError(this.nameField, this.getNameError(this.trimmedName));
        return;
      }

      if (field === this.imageField) {
        this.setFieldError(this.imageField, getToyImageError(this, this.trimmedImage));
      }
    },
    focusFirstInvalidInput() {
      if (this.validationErrors[this.nameField] && this.$refs.nameInput) {
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
        ...createFormPreviewState(),
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
      queueToyImagePreview(this, immediate);
    },
    handleFieldInput(field) {
      this.clearSubmitState();
      this.validateField(field);

      if (field === this.imageField) {
        this.queueImagePreview(false);
      }
    },
    validateForm() {
      this.validationErrors = createValidationErrors();
      this.validateField(this.nameField);
      this.validateField(this.imageField);

      if (this.validationErrors[this.nameField] || this.validationErrors[this.imageField]) {
        return null;
      }

      if (this.submitDisableReason) {
        return null;
      }

      return {
        [this.nameField]: this.trimmedName,
        [this.imageField]: this.trimmedImage,
      };
    },
    async submitUpdateToy() {
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
        await this.$store.dispatch('toyStore/submitUpdateToy', {
          id: this.editingToyId,
          ...payload,
        });
      } finally {
        this.localSubmitting = false;
      }
    },
    handleModalShown() {
      this.$nextTick(() => {
        focusFormField(this.$el);
      });
    },
    closeModal() {
      this.$bvModal.hide('modal-edit-toy');
    },
    handleModalHidden() {
      resetManagedForm({
        stopObserver: () => stopModalBackdropObserver(this),
        afterReset: () => {
          this.resetFormState();
          this.clearSubmitState();
          this.$store.dispatch('toyStore/setEditingToy', null);
        },
      });
    },
    resetFormState() {
      const lifecycleState = createEditFormState();

      this.form = lifecycleState.form;
      this.localSubmitting = lifecycleState.localSubmitting;
      this.preview = {
        ...lifecycleState.preview,
        token: this.preview.token + 1,
      };
      this.validationErrors = lifecycleState.validationErrors;
    },
  },
};
