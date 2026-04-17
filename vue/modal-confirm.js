/*jshint esversion: 9 */
import {
  armModalBackdropObserver,
  stopModalBackdropObserver,
} from '/assets/js/modalForm.js';

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
      confirmDeleteToyId: 'toyStore/getConfirmDeleteToyId',
    }),
    toyInfo() {
      const toy = this.getToyById(this.confirmDeleteToyId);
      if (toy)
        return `[${toy.id}] [${toy.name}]`;
    },
    errorAction() {
      return this.deleteToyError || '';
    },
  },
  watch: {
    confirmDeleteToyId(id) {
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
      this.$store.dispatch('toyStore/setConfirmDeleteToyId', null);
    },
  }
};
