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
      highlightedToy: 'toyStore/getHighlightedToy',
      updatingToy: 'toyStore/getUpdatingToy',
    }),
    isBusy() {
      const toyId = this.toy && this.toy.id ? this.toy.id.toString() : '';
      return (this.deletingToy && toyId === (this.confirmDeleteToyId || '').toString())
        || (this.updatingToy && toyId === this.updatingToy.toString());
    },
    highlightSignature() {
      const id = this.highlightedToy && this.highlightedToy.id ? this.highlightedToy.id : '';
      const nonce = this.highlightedToy && this.highlightedToy.nonce ? this.highlightedToy.nonce : 0;
      return `${id}:${nonce}`;
    },
  },
  watch: {
    highlightSignature() {
      const toyId = this.toy && this.toy.id ? this.toy.id.toString() : '';
      if (toyId && this.highlightedToy && this.highlightedToy.id === toyId) {
        this.triggerHighlight();
      }
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
    triggerHighlight() {
      const card = this.$refs.card;
      if (!card) {
        return;
      }

      card.classList.remove('toy-card-updated');
      card.getBoundingClientRect();
      card.classList.add('toy-card-updated');
      card.addEventListener('animationend', () => {
        card.classList.remove('toy-card-updated');
      }, { once: true });
    },
    likeToy() {
      if (this.toy && this.toy.id)
        this.likeToyBase(this.toy.id);
    },
  },
};
