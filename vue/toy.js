/*jshint esversion: 9 */

export default {
  props: {
    toy: {
      type: Object,
      default: () => { return {}; }
    },
  },
  computed: {
    ...Vuex.mapGetters({
      deletingToy: 'toyStore/getDeletingToy',
      confirmDeleteToyId: 'toyStore/getConfirmDeleteToyId',
      updatingToy: 'toyStore/getUpdatingToy',
    }),
    isBusy() {
      const toyId = this.toy && this.toy.id ? this.toy.id.toString() : '';
      return (this.deletingToy && toyId === (this.confirmDeleteToyId || '').toString())
        || (this.updatingToy && toyId === this.updatingToy.toString());
    },
  },
  methods: {
    ...Vuex.mapActions({
      setConfirmDeleteToyId: 'toyStore/setConfirmDeleteToyId',
      likeToyBase: 'toyStore/likeToy',
      setEditingToyId: 'toyStore/setEditingToyId',
    }),
    setConfirmDeleteToy() {
      if (this.toy && this.toy.id)
        this.setConfirmDeleteToyId(this.toy.id);
    },
    editToy() {
      if (this.toy && this.toy.id)
        this.setEditingToyId(this.toy.id);
    },
    likeToy() {
      if (this.toy && this.toy.id)
        this.likeToyBase(this.toy.id);
    },
  },
};
