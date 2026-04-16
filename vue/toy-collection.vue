<template>

  <div>
    <div v-if='showSkeletons' id='toy-collection' class='row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4'>
      <toy-skeleton :count='skeletonCount'></toy-skeleton>
    </div>

    <div v-else-if='errorLoadToys' id='toy-collection' class='row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4'>
      <div class='col-12 toy-status-shell'>
        <div class='alert alert-danger toy-status-alert' role='alert'>
          <p class='mb-0'>{{ errorLoadToys }}</p>
          <div class='toy-status-actions mt-3'>
            <button type='button' class='btn btn-danger toy-status-reload' @click.prevent='reloadToys'>Reload data</button>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if='!hasToys' id='toy-collection' class='row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4'>
      <div class='col-12 toy-status-shell'>
        <div class='alert toy-status-alert toy-status-alert-info' role='alert'>
          <p class='mb-0'>{{ emptyStateError || 'No toys available yet. Load the bundled demo data to populate the collection.' }}</p>
          <div class='toy-status-actions mt-3'>
            <button type='button' class='btn btn-danger toy-status-reload' :disabled='seedingDemo' @click.prevent='seedDemoToys'>
              {{ seedingDemo ? 'Loading demo toys...' : 'Load demo toys' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <transition-group v-else id='toy-collection' name='toy-list' tag='div' class='row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4'>
      <toy v-for='item in toys' :key='item.id' :toy='item'></toy>
    </transition-group>
  </div>

</template>

<script src='./toy-collection.js' />
