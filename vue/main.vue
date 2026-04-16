<template>
  <div class='app'>

    <mosaic-loader></mosaic-loader>

    <div id='toy-header'>
      <img src='/assets/images/logo.png' alt='toy-header' />

      <add-toy-form></add-toy-form>
    </div>

    <b-container fluid>
      <div class='container-fluid mt-3'>
        <top-action></top-action>

        <toy-collection></toy-collection>
      </div>

      <modal-confirm></modal-confirm>
    </b-container>

    <a href='#' @click='goToTop' class='to-top text-success' v-show='showGoToTop'>
      <svg xmlns='http://www.w3.org/2000/svg' width='2em' height='2em' viewBox='0 0 24 24' fill='none'
        stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'>
        <circle cx='12' cy='12' r='10'></circle>
        <polyline points='16 12 12 8 8 12'></polyline>
        <line x1='12' y1='16' x2='12' y2='8'></line>
      </svg>
    </a>

  </div>
</template>

<script>
import ToyCollection from './toy-collection.vue';
import AddToyForm from './add-toy-form.vue';
import MosaicLoader from './mosaic-loader.vue';
import TopAction from './top-action.vue';
import ModalConfirm from './modal-confirm.vue';

export default {
  components: {
    ToyCollection,
    AddToyForm,
    MosaicLoader,
    TopAction,
    ModalConfirm,
  },
  data() {
    return {
      showGoToTop: false,
    };
  },
  methods: {
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
};
</script>
