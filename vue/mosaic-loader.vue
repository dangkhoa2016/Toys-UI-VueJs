<template>

  <div class='loader' :class='{ "d-none": !loading }'>
    <div class='mosaic-loader'>
      <div class='cell d-0'></div>
      <div class='cell d-1'></div>
      <div class='cell d-2'></div>
      <div class='cell d-3'></div>
      <div class='cell d-1'></div>
      <div class='cell d-2'></div>
      <div class='cell d-3'></div>
      <div class='cell d-4'></div>
      <div class='cell d-2'></div>
      <div class='cell d-3'></div>
      <div class='cell d-4'></div>
      <div class='cell d-5'></div>
      <div class='cell d-3'></div>
      <div class='cell d-4'></div>
      <div class='cell d-5'></div>
      <div class='cell d-6'></div>
    </div>
  </div>

</template>

<script>
  /*jshint esversion: 9 */

  export default {
    computed: {
      ...Vuex.mapGetters({
        isLoadingToys: 'toyStore/getIsLoadingToys',
        isCreatingToy: 'toyStore/getIsCreatingToy',
        // isDeletingToy: 'toyStore/getIsDeletingToy',
        isUpdatingToy: 'toyStore/getUpdatingToyId',
      }),
      loading() {
        return this.isLoadingToys || this.isCreatingToy /* || this.isDeletingToy */ || this.isUpdatingToy;
      },
    },
  };

</script>
