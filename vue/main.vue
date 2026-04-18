<template>
  <div class='app'>

    <mosaic-loader></mosaic-loader>

    <header id='toy-header'>
      <img src='/assets/images/logo.png' alt='Toy Tale logo' />
    </header>

    <main class='container-fluid mt-3'>
      <add-toy-form></add-toy-form>
      <edit-toy-form></edit-toy-form>
      <top-action></top-action>
      <toy-collection></toy-collection>
      <modal-confirm></modal-confirm>
      <toast-region></toast-region>
    </main>

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
import EditToyForm from './edit-toy-form.vue';
import MosaicLoader from './mosaic-loader.vue';
import TopAction from './top-action.vue';
import ModalConfirm from './modal-confirm.vue';
import ToastRegion from './toast-region.vue';
import { TOY_UI_LIMITS } from '/assets/js/config/config.js';

export default {
  components: {
    ToyCollection,
    AddToyForm,
    EditToyForm,
    MosaicLoader,
    TopAction,
    ModalConfirm,
    ToastRegion,
  },
  data() {
    return {
      showGoToTop: false,
    };
  },
  methods: {
    handleScroll(ev) {
      this.showGoToTop = window.scrollY > TOY_UI_LIMITS.SCROLL_TOP_VISIBLE_OFFSET_PX;
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
