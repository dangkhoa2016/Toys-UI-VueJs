/*jshint esversion: 9 */

const TOY_FORM = Vue.prototype.$toyForm || {};
const TOY_NAME_MIN_LENGTH = TOY_FORM.TOY_NAME_MIN_LENGTH || 2;
const TOY_NAME_MAX_LENGTH = TOY_FORM.TOY_NAME_MAX_LENGTH || 120;
const IMAGE_PREVIEW_DEBOUNCE_MS = TOY_FORM.IMAGE_PREVIEW_DEBOUNCE_MS || 300;
const DEFAULT_PREVIEW_PLACEHOLDER = TOY_FORM.DEFAULT_PREVIEW_PLACEHOLDER || 'Preview will appear here after the image URL is checked.';
const INVALID_PREVIEW_PLACEHOLDER = TOY_FORM.INVALID_PREVIEW_PLACEHOLDER || 'Enter a valid image URL or local toy image path to preview it.';
const ERROR_PREVIEW_PLACEHOLDER = TOY_FORM.ERROR_PREVIEW_PLACEHOLDER || 'This image could not be loaded in preview.';
const CREATE_PREVIEW_MESSAGE = TOY_FORM.CREATE_PREVIEW_MESSAGE || 'Enter an image URL to verify it before submitting.';
const TOY_IMAGE_FORM_COMPUTED = Vue.prototype.$toyImageFormComputed || {};
const MODAL_FORM = Vue.prototype.$modalForm || {};
const armModalBackdropObserver = MODAL_FORM.armModalBackdropObserver || (() => {});
const stopModalBackdropObserver = MODAL_FORM.stopModalBackdropObserver || (() => {});
const focusFormField = MODAL_FORM.focusFormField || (() => {});
const resetManagedForm = MODAL_FORM.resetManagedForm || ((options = {}) => {
  if (typeof options.afterReset === 'function') {
    options.afterReset();
  }
});

const createValidationErrors = TOY_FORM.createValidationErrors || (() => ({ name: '', image: '' }));
const createToyFormValues = TOY_FORM.createToyFormValues || (({ toy = null, includeLikes = false } = {}) => {
  const form = {
    name: String(toy && toy.name ? toy.name : ''),
    image: String(toy && toy.image ? toy.image : ''),
  };

  if (includeLikes) {
    form.likes = Number.isFinite(toy && toy.likes) ? Number(toy.likes) : 0;
  }

  return form;
});
const createToyFormLifecycleState = TOY_FORM.createToyFormLifecycleState || ((options = {}) => ({
  form: createToyFormValues(options),
  localSubmitting: false,
  preview: createFormPreviewState(),
  validationErrors: createValidationErrors(),
}));

function createFormPreviewState() {
  const createState = TOY_FORM.createPreviewState;
  return typeof createState === 'function'
    ? createState({ message: CREATE_PREVIEW_MESSAGE, placeholderMessage: DEFAULT_PREVIEW_PLACEHOLDER })
    : {
        status: 'idle',
        src: '',
        source: '',
        message: CREATE_PREVIEW_MESSAGE,
        placeholderMessage: DEFAULT_PREVIEW_PLACEHOLDER,
        token: 0,
      };
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
      return (this.form.name || '').trim();
    },
    trimmedImage() {
      return (this.form.image || '').trim();
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
    ...TOY_IMAGE_FORM_COMPUTED,
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
      this.$queueToyImagePreview(this, immediate);
    },
    handleFieldInput(field) {
      this.clearSubmitState();
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
