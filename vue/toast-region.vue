<template>

  <div id='toast-region' class='toast-container position-fixed top-0 end-0 p-3'>
    <transition-group name='toy-toast' tag='div' class='d-flex flex-column gap-3'>
      <div v-for='toast in toasts' :key='toast.id' class='toast show toy-toast' :class='`toy-toast-${toast.variant || "primary"}`'
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

  export default {
    data() {
      return {
        toastTimers: {},
      };
    },
    computed: {
      ...Vuex.mapGetters({
        toasts: 'toyStore/getToasts',
      }),
    },
    watch: {
      toasts: {
        immediate: true,
        handler(nextToasts) {
          const activeIds = new Set(nextToasts.map((toast) => toast.id));

          nextToasts.forEach((toast) => {
            if (this.toastTimers[toast.id]) {
              return;
            }

            this.toastTimers[toast.id] = window.setTimeout(() => {
              this.dismissToast(toast.id);
            }, toast.delay || 5000);
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
      ...Vuex.mapActions({
        removeToast: 'toyStore/removeToast',
      }),
      dismissToast(toastId) {
        if (this.toastTimers[toastId]) {
          window.clearTimeout(this.toastTimers[toastId]);
          delete this.toastTimers[toastId];
        }

        this.removeToast(toastId);
      },
    },
  };

</script>
