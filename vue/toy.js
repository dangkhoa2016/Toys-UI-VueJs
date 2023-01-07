/*jshint esversion: 9 */

export default {
  props: {
    toy: {
      type: Object,
      default: () => { return {}; }
    },
  },
  methods: {
    ...Vuex.mapActions({
      setConfirmDeleteToyId: 'toyStore/setConfirmDeleteToyId',
      likeToyBase: 'toyStore/likeToy',
    }),
    setConfirmDeleteToy() {
      if (this.toy && this.toy.id)
        this.setConfirmDeleteToyId(this.toy.id);
    },
    likeToy() {
      if (this.toy && this.toy.id)
        this.likeToyBase(this.toy.id);
    },
  },
};
