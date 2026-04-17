/*jshint esversion: 9 */

const TOY_STORE_HELPERS = Vue.prototype.$toyStoreHelpers || {};
const getHighlightedToySignature = TOY_STORE_HELPERS.getHighlightedToySignature || ((state) => {
  const highlightedToy = state && state.highlightedToy ? state.highlightedToy : { id: null, nonce: 0 };
  return `${highlightedToy.id || ''}:${highlightedToy.nonce || 0}`;
});

export default {
  props: {
    toy: {
      type: Object,
      default: () => { return {}; }
    },
  },
  computed: {
    ...Vuex.mapGetters({
      isDeletingToy: 'toyStore/getIsDeletingToy',
      deleteToyTarget: 'toyStore/getDeleteToyTarget',
      highlightedToy: 'toyStore/getHighlightedToy',
      updatingToyId: 'toyStore/getUpdatingToyId',
    }),
    isBusy() {
      const toyId = this.toy && this.toy.id ? this.toy.id.toString() : '';
      return (this.isDeletingToy && toyId === (this.deleteToyTarget || '').toString())
        || (this.updatingToyId && toyId === this.updatingToyId.toString());
    },
    normalizedImageUrl() {
      return this.$normalizeImageUrl(this.toy && this.toy.image ? this.toy.image : '');
    },
    highlightSignature() {
      return getHighlightedToySignature({ highlightedToy: this.highlightedToy });
    },
  },
  watch: {
    highlightSignature() {
      const toyId = this.toy && this.toy.id ? this.toy.id.toString() : '';
      if (toyId && this.highlightedToy && this.highlightedToy.id === toyId) {
        this.flashToyCard();
      }
    },
  },
  methods: {
    openDeleteToyConfirm() {
      if (this.toy && this.toy.id)
        this.$store.dispatch('toyStore/setDeleteToyTarget', this.toy.id);
    },
    openEditToy() {
      if (this.toy && this.toy.id)
        this.$store.dispatch('toyStore/setEditingToy', this.toy.id);
    },
    flashToyCard() {
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
    incrementToyLikes() {
      if (this.toy && this.toy.id)
        this.$store.dispatch('toyStore/incrementToyLikes', this.toy.id);
    },
  },
};
