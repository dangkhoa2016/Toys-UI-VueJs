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
      }
    };
  },
  watch: {
    saveToyResult(val) {
      if (val && val.id) {
        // created successful
        this.resetForm();
      }
    },
  },
  methods: {
    ...Vuex.mapActions({
      createToyBase: 'toyStore/createToy',
    }),
    createToy() {
      this.createToyBase(this.form);
    },
    resetForm() {
      this.form = {
        name: '',
        image: '',
        likes: 0,
      };
    },
  },
};
