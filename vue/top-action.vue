<template>

  <section class='toy-controls-shell'>
    <div class='toy-controls card border-0 shadow-sm'>
      <div class='card-body p-3 p-lg-4'>
        <div class='row g-4 align-items-xl-end'>
          <div class='col-12 col-xl-4'>
            <div class='toy-controls-copy h-100 d-flex flex-column justify-content-center'>
              <p class='toy-controls-eyebrow mb-2'>Toy Tale control room</p>
              <h2 class='h4 mb-2'>Andy needs your help</h2>
              <p class='text-muted mb-0'>Create new toys, search the shelf instantly, or reorder the collection by likes.</p>
            </div>
          </div>

          <div class='col-12 col-xl-8'>
            <div class='row g-3 align-items-end'>
              <div class='col-12 col-md-6 col-lg-5'>
                <label class='toy-field h-100 d-flex flex-column'>
                  <span class='toy-field-label'>Search by name</span>
                  <input id='toy-search' type='search' class='form-control toy-control-input'
                    placeholder='Type a toy name...' autocomplete='off' v-model='searchTerm' />
                </label>
              </div>

              <div class='col-12 col-md-6 col-lg-4'>
                <label class='toy-field h-100 d-flex flex-column'>
                  <span class='toy-field-label'>Sort by likes</span>
                  <select id='toy-sort' class='form-select toy-control-input' v-model='sortOrder'>
                    <option :value='sortOrders.DEFAULT'>Default order</option>
                    <option :value='sortOrders.LIKES_DESC'>Most liked first</option>
                    <option :value='sortOrders.LIKES_ASC'>Least liked first</option>
                  </select>
                </label>
              </div>

              <div class='col-12 col-lg-3 d-grid'>
                <button class='btn btn-primary toy-create-trigger w-100' id='new-toy-btn' type='button'
                  @click.prevent='toggleCreateToyModal'>Add a new toy!</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

</template>

<script>
  /*jshint esversion: 9 */

  import { TOY_SORT_ORDERS } from '/assets/js/config.js';

  export default {
    data() {
      return {
        sortOrders: TOY_SORT_ORDERS,
      };
    },
    computed: {
      ...Vuex.mapGetters({
        searchTermValue: 'toyStore/getSearchTerm',
        sortOrderValue: 'toyStore/getSortOrder',
      }),
      searchTerm: {
        get() {
          return this.searchTermValue;
        },
        set(value) {
          this.setSearchTerm(value);
        },
      },
      sortOrder: {
        get() {
          return this.sortOrderValue;
        },
        set(value) {
          this.setSortOrder(value);
        },
      },
    },
    methods: {
      ...Vuex.mapActions({
        toggleCreateToyModal: 'toyStore/toggleCreateToyModal',
        setSearchTerm: 'toyStore/setSearchTerm',
        setSortOrder: 'toyStore/setSortOrder',
      }),
    },
  };

</script>
