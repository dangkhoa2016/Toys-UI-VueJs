/*jshint esversion: 9 */

export default {
  computed: {
    ...Vuex.mapGetters({
      deleteToyResult: 'toyStore/getDeleteToyResult',
      deletingToy: 'toyStore/getDeletingToy',
      errorDeleteToy: 'toyStore/getErrorDeleteToy',
      getCacheToyInfo: 'toyStore/getCacheToyInfo',
      confirmDeleteToyId: 'toyStore/getConfirmDeleteToyId',
    }),
    toyInfo() {
      const toy = this.getCacheToyInfo(this.confirmDeleteToyId);
      if (toy)
        return `[${toy.id}] [${toy.name}]`;
    },
    errorAction() {
      return this.errorDeleteToy || '';
    },
  },
  watch: {
    confirmDeleteToyId(id) {
      if (id)
        this.$bvModal.show('modal-delete-toy');
    },
    deleteToyResult(data) {
      if (!data)
        return;

      this.$bvModal.hide('modal-delete-toy');
    },
  },
  methods: {
    ...Vuex.mapActions({
      setErrorDeleteToy: 'toyStore/setErrorDeleteToy',
      setConfirmDeleteToyId: 'toyStore/setConfirmDeleteToyId',
      deleteToy: 'toyStore/deleteToy',
    }),
    handleOk(bvModalEvt) {
      // Prevent modal from closing
      bvModalEvt.preventDefault();

      this.deleteToy();
    },
    onHidden() {
      this.setConfirmDeleteToyId(null);
    },
  }
};
