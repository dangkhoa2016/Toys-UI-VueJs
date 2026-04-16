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
      },
      validationErrors: {
        name: '',
        image: '',
      },
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
    toyLabel() {
      if (!this.editingToy) {
        return 'the selected toy';
      }

      return `#${this.editingToy.id} ${this.editingToy.name}`;
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
    stopModalBackdropObserver(this);
  },
  methods: {
    ...Vuex.mapActions({
      updateToyBase: 'toyStore/updateToy',
      setEditingToyId: 'toyStore/setEditingToyId',
    }),
    syncFormFromToy() {
      if (!this.editingToy) {
        return;
      }

      this.form = {
        name: this.editingToy.name || '',
        image: this.editingToy.image || '',
      };
      this.validationErrors = {
        name: '',
        image: '',
      };
    },
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
        name,
        image,
      };
    },
    async updateToy() {
      const payload = this.validateForm();
      if (!payload || !this.editingToyId) {
        return;
      }

      await this.updateToyBase({
        id: this.editingToyId,
        ...payload,
      });
    },
    onShown() {
      this.$nextTick(() => {
        this.$refs.nameInput?.focus();
      });
    },
    hideModal() {
      this.$bvModal.hide('modal-edit-toy');
    },
    onHidden() {
      stopModalBackdropObserver(this);
      this.setEditingToyId(null);
    },
  },
};
