/*jshint esversion: 9 */
const MODAL_FORM = Vue.prototype.$modalForm || {};
const armModalBackdropObserver = MODAL_FORM.armModalBackdropObserver || (() => {});
const stopModalBackdropObserver = MODAL_FORM.stopModalBackdropObserver || (() => {});

export default {
  data() {
    return {
      backdropObserver: null,
    };
  },
  computed: {
    ...Vuex.mapGetters({
      deleteToyResult: 'toyStore/getDeleteToyResult',
      isDeletingToy: 'toyStore/getIsDeletingToy',
      deleteToyError: 'toyStore/getDeleteToyError',
      getToyById: 'toyStore/getToyById',
      deleteToyTarget: 'toyStore/getDeleteToyTarget',
    }),
    toyInfo() {
      const toy = this.getToyById(this.deleteToyTarget);
      if (toy)
        return `[${toy.id}] [${toy.name}]`;
    },
    errorAction() {
      return this.deleteToyError || '';
    },
  },
  watch: {
    deleteToyTarget(id) {
      if (id) {
        armModalBackdropObserver(this);
        this.$bvModal.show('modal-delete-toy');
      }
    },
    deleteToyResult(data) {
      if (!data)
        return;

      this.$bvModal.hide('modal-delete-toy');
    },
  },
  beforeDestroy() {
    stopModalBackdropObserver(this);
  },
  methods: {
    submitDeleteToy() {
      this.$store.dispatch('toyStore/submitDeleteToy');
    },
    closeModal() {
      this.$bvModal.hide('modal-delete-toy');
    },
    handleModalHidden() {
      stopModalBackdropObserver(this);
      this.$store.dispatch('toyStore/setDeleteToyTarget', null);
    },
  }
};
