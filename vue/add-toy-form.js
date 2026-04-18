/*jshint esversion: 9 */
import {
  TOY_NAME_MIN_LENGTH,
  TOY_NAME_MAX_LENGTH,
  IMAGE_PREVIEW_DEBOUNCE_MS,
  DEFAULT_PREVIEW_PLACEHOLDER,
  INVALID_PREVIEW_PLACEHOLDER,
  ERROR_PREVIEW_PLACEHOLDER,
  CREATE_PREVIEW_MESSAGE,
  createValidationErrors,
  createToyFormLifecycleState,
  createPreviewState,
} from '/assets/js/toyForm.js';
import {
  TOY_FORM_FIELD_NAMES,
  TOY_PREVIEW_STATUS,
} from '/assets/js/config.js';
import {
  armModalBackdropObserver,
  focusFormField,
  resetManagedForm,
  stopModalBackdropObserver,
} from '/assets/js/modalForm.js';
import {
  getToyImageError,
  queueToyImagePreview,
  toyVueJsFormComputed,
} from '/assets/js/toyVueJsForm.js';

function createFormPreviewState() {
  return createPreviewState({ message: CREATE_PREVIEW_MESSAGE, placeholderMessage: DEFAULT_PREVIEW_PLACEHOLDER });
}

function createAddFormState() {
  return createToyFormLifecycleState({
    includeLikes: true,
    previewMessage: CREATE_PREVIEW_MESSAGE,
    previewPlaceholderMessage: DEFAULT_PREVIEW_PLACEHOLDER,
  });
}

export default {
  data() {
    const lifecycleState = createAddFormState();
    return {
      backdropObserver: null,
      previewDebounceId: 0,
      ...lifecycleState,
    };
  },
  computed: {
    ...Vuex.mapGetters({
      createToyModalOpen: 'toyStore/getCreateToyModalOpen',
      createToyError: 'toyStore/getCreateToyError',
      isCreatingToy: 'toyStore/getIsCreatingToy',
      createToyResult: 'toyStore/getCreateToyResult',
    }),
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
    isFormBusy() {
      return Boolean(this.isCreatingToy) || this.localSubmitting;
    },
    formBusyMessage() {
      return 'Creating toy...';
    },
    unchangedSubmitMessage() {
      return '';
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
      return this.isFormBusy ? 'Creating toy...' : 'Create New Toy';
    },
  },
  watch: {
    createToyModalOpen(val) {
      if (val) {
        armModalBackdropObserver(this);
        this.$bvModal.show('modal-add-toy');
        return;
      }

      this.$bvModal.hide('modal-add-toy');
    },
    createToyResult(val) {
      if (val && val.id) {
        this.resetFormState();
        this.$bvModal.hide('modal-add-toy');
      }
    },
  },
  beforeDestroy() {
    this.clearPreviewTimer();
    stopModalBackdropObserver(this);
  },
  methods: {
    clearSubmitState() {
      this.$store.commit('toyStore/SET_CREATE_TOY_ERROR', null);
      this.$store.commit('toyStore/SET_CREATE_TOY_RESULT', null);
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

      const imageInput = this.$el.querySelector('#toy-image-input');
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
        ...this.form,
        [this.nameField]: this.trimmedName,
        [this.imageField]: this.trimmedImage,
      };
    },
    async submitCreateToy() {
      if (this.localSubmitting || this.isCreatingToy) {
        return;
      }

      const payload = this.validateForm();
      if (!payload) {
        this.focusFirstInvalidInput();
        return;
      }

      this.localSubmitting = true;

      try {
        await this.$store.dispatch('toyStore/submitCreateToy', payload);
      } finally {
        this.localSubmitting = false;
      }
    },
    handleModalShown() {
      this.$nextTick(() => {
        focusFormField(this.$el);
      });
    },
    handleModalHidden() {
      resetManagedForm({
        stopObserver: () => stopModalBackdropObserver(this),
        afterReset: () => {
          this.resetFormState();
          this.clearSubmitState();
          this.$store.dispatch('toyStore/setCreateToyModalOpen', false);
        },
      });
    },
    closeModal() {
      this.$bvModal.hide('modal-add-toy');
    },
    resetFormState() {
      const lifecycleState = createAddFormState();

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
