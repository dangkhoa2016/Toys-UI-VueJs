<template>

  <div id='toast-region' class='toast-container position-fixed top-0 end-0 p-3'>
    <transition-group name='toy-toast' tag='div' class='d-flex flex-column gap-3'>
      <div v-for='toast in toastList' :key='toast.id' class='toast show toy-toast' :class='`toy-toast-${toast.variant || toastVariants.PRIMARY}`'
        role='status' aria-live='polite' aria-atomic='true'>
        <div class='d-flex justify-content-between'>
          <div class='toast-body'>
            <div class='toy-toast-title'>{{ toast.title }}</div>
            <div class='toy-toast-message'>{{ toast.message }}</div>
          </div>
          <button type='button' class='btn-close me-2 mt-2' aria-label='Close' @click.prevent='dismissToast(toast.id)'></button>
        </div>
      </div>
    </transition-group>
  </div>

</template>

<script>
  /*jshint esversion: 9 */

  import { TOY_TOAST_SETTINGS, TOY_TOAST_VARIANTS } from '/assets/js/config/config.js';

  export default {
    data() {
      return {
        toastTimers: {},
        toastSettings: TOY_TOAST_SETTINGS,
        toastVariants: TOY_TOAST_VARIANTS,
      };
    },
    computed: {
      ...Vuex.mapGetters({
        toastList: 'toyStore/getToasts',
      }),
    },
    watch: {
      toastList: {
        immediate: true,
        handler(nextToasts) {
          const activeIds = new Set(nextToasts.map((toast) => toast.id));

          nextToasts.forEach((toast) => {
            if (this.toastTimers[toast.id]) {
              return;
            }

            this.toastTimers[toast.id] = window.setTimeout(() => {
              this.dismissToast(toast.id);
            }, toast.delay || this.toastSettings.DEFAULT_DELAY_MS);
          });

          Object.keys(this.toastTimers).forEach((toastId) => {
            if (activeIds.has(toastId)) {
              return;
            }

            window.clearTimeout(this.toastTimers[toastId]);
            delete this.toastTimers[toastId];
          });
        },
      },
    },
    beforeDestroy() {
      Object.keys(this.toastTimers).forEach((toastId) => {
        window.clearTimeout(this.toastTimers[toastId]);
      });
      this.toastTimers = {};
    },
    methods: {
      dismissToast(toastId) {
        if (this.toastTimers[toastId]) {
          window.clearTimeout(this.toastTimers[toastId]);
          delete this.toastTimers[toastId];
        }

        this.$store.dispatch('toyStore/removeToast', toastId);
      },
    },
  };

</script>
