/*jshint esversion: 9 */

export default {
  computed: {
    ...Vuex.mapGetters({
      addFormStatus: 'toyStore/getAddFormStatus',
      errorSaveToy: 'toyStore/getErrorSaveToy',
      savingToy: 'toyStore/getSavingToy',
      saveToyResult: 'toyStore/getSaveToyResult',
    }),
  },
  data() {
    return {
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
  watch: {
    addFormStatus(val) {
      if (val) {
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
  methods: {
    ...Vuex.mapActions({
      createToyBase: 'toyStore/createToy',
      setAddFormStatus: 'toyStore/setAddFormStatus',
    }),
    syncBackdropClasses() {
      this.$nextTick(() => {
        document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {
          backdrop.classList.add('fade', 'show');
        });
      });
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
      this.syncBackdropClasses();
      this.$nextTick(() => {
        this.$refs.nameInput?.focus();
      });
    },
    onHidden() {
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
