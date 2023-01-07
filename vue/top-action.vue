<template>

  <p class='text-center'>
    Andy needs your help!
    <b-button variant='primary' @click.prevent='toggleAddFormStatus' id='new-toy-btn'>Add a new toy!</b-button>
  </p>

</template>

<script>
  /*jshint esversion: 9 */

  export default {
    methods: {
      ...Vuex.mapActions({
        toggleAddFormStatus: 'toyStore/toggleAddFormStatus',
      }),
    },
  };

</script>
