/*jshint esversion: 9 */

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
      form: {
        name: '',
        image: '',
        likes: 0,
      },
      validationErrors: {
        name: '',
        image: '',
      },
    };
  },
  computed: {
    ...Vuex.mapGetters({
      addFormStatus: 'toyStore/getAddFormStatus',
      errorSaveToy: 'toyStore/getErrorSaveToy',
      savingToy: 'toyStore/getSavingToy',
      saveToyResult: 'toyStore/getSaveToyResult',
    }),
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
    stopModalBackdropObserver(this);
  },
  methods: {
    ...Vuex.mapActions({
      createToyBase: 'toyStore/createToy',
      setAddFormStatus: 'toyStore/setAddFormStatus',
    }),
    clearFieldError(field) {
      if (this.validationErrors[field]) {
        this.validationErrors = {
          ...this.validationErrors,
          [field]: '',
        };
      }
    },
    isValidImageUrl(value) {
      if (!value || /\s/.test(value)) {
        return false;
      }

      try {
        const parsed = new URL(value, window.location.origin);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
      } catch (err) {
        return false;
      }
    },
    validateForm() {
      const errors = {
        name: '',
        image: '',
      };
      const name = (this.form.name || '').trim();
      const image = (this.form.image || '').trim();

      if (!name) {
        errors.name = 'Toy name is required.';
      }

      if (!image) {
        errors.image = 'Image URL is required.';
      } else if (!this.isValidImageUrl(image)) {
        errors.image = 'Use an http(s) URL or a valid site-relative image path.';
      }

      this.validationErrors = errors;

      if (errors.name || errors.image) {
        return null;
      }

      return {
        ...this.form,
        name,
        image,
      };
    },
    async createToy() {
      const payload = this.validateForm();
      if (!payload) {
        return;
      }

      await this.createToyBase(payload);
    },
    onShown() {
      this.$nextTick(() => {
        this.$refs.nameInput?.focus();
      });
    },
    onHidden() {
      stopModalBackdropObserver(this);
      this.setAddFormStatus(false);
    },
    resetForm() {
      this.form = {
        name: '',
        image: '',
        likes: 0,
      };
      this.validationErrors = {
        name: '',
        image: '',
      };
    },
  },
};
