<script>

  import ToyCollection from './toy-collection.vue';
  import AddToyForm from './add-toy-form.vue';
  import MosaicLoader from './mosaic-loader.vue';
  import TopAction from './top-action.vue';
  import ModalConfirm from './modal-confirm.vue';

  const store = new Vuex.Store({
    modules: {
      appStore: window.store.appStore,
      toyStore: window.store.toyStore,
    },
  });
  
  app = new Vue({
    components: {
      ToyCollection,
      AddToyForm,
      MosaicLoader,
      TopAction,
      ModalConfirm,
    },
    el: '#app',
    template: app.html,
    store,
    data() {
      return {
        showGoToTop: false,
      };
    },
    methods: {
      setCompleted() {
        delete window.store;
        delete window.options;
        delete window.handleErrors;
        delete window.sleep;
      },
      handleScroll(ev) {
        this.showGoToTop = window.scrollY > 300;
      },
      goToTop() {
        window.scrollTo(0, 0);
      },
    },
    created() {
      window.addEventListener('scroll', this.handleScroll);
    },
    destroyed() {
      window.removeEventListener('scroll', this.handleScroll);
    },
  });

  export default app;

</script>
