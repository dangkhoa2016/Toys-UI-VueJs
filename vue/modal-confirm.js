/*jshint esversion: 9 */

function normalizeBackdrop(backdrop) {
  if (!backdrop || !backdrop.classList) {
    return;
  }

  backdrop.classList.add('fade', 'show');
}

function findBackdrop(node) {
  if (!(node instanceof HTMLElement)) {
    return null;
  }

  if (node.classList.contains('modal-backdrop')) {
    return node;
  }

  return node.querySelector('.modal-backdrop');
}

function stopModalBackdropObserver(target) {
  if (!target || !target.backdropObserver) {
    return;
  }

  target.backdropObserver.disconnect();
  target.backdropObserver = null;
}

function armModalBackdropObserver(target) {
  if (!target) {
    return;
  }

  stopModalBackdropObserver(target);

  const existingBackdrop = document.querySelector('.modal-backdrop');
  if (existingBackdrop) {
    normalizeBackdrop(existingBackdrop);
    return;
  }

  target.backdropObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        const backdrop = findBackdrop(node);
        if (!backdrop) {
          continue;
        }

        normalizeBackdrop(backdrop);
        stopModalBackdropObserver(target);
        return;
      }
    }
  });

  target.backdropObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

export default {
  data() {
    return {
      backdropObserver: null,
    };
  },
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
    ...Vuex.mapActions({
      setErrorDeleteToy: 'toyStore/setErrorDeleteToy',
      setConfirmDeleteToyId: 'toyStore/setConfirmDeleteToyId',
      deleteToy: 'toyStore/deleteToy',
    }),
    confirmDeleteToy() {
      this.deleteToy();
    },
    hideModal() {
      this.$bvModal.hide('modal-delete-toy');
    },
    onHidden() {
      stopModalBackdropObserver(this);
      this.setConfirmDeleteToyId(null);
    },
  }
};
