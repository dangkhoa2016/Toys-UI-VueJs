/*jshint esversion: 9 */

export default {
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
  data() {
    return {
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
  watch: {
    editingToyId(value) {
      if (value) {
        this.syncFormFromToy();
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
  methods: {
    ...Vuex.mapActions({
      updateToyBase: 'toyStore/updateToy',
      setEditingToyId: 'toyStore/setEditingToyId',
    }),
    syncBackdropClasses() {
      this.$nextTick(() => {
        document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {
          backdrop.classList.add('fade', 'show');
        });
      });
    },
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
      this.syncBackdropClasses();
      this.$nextTick(() => {
        this.$refs.nameInput?.focus();
      });
    },
    hideModal() {
      this.$bvModal.hide('modal-edit-toy');
    },
    onHidden() {
      this.setEditingToyId(null);
    },
  },
};