<template>

  <div>
    <div v-if='showSkeletons' id='toy-collection-skeleton' class='row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 gx-3 gy-4'>
      <div v-for='skeleton in skeletonCount' :key='`skeleton-${skeleton}`' class='col'>
        <div class='card toy-card-skeleton'>
          <div class='toy-skeleton-image shimmer-block'></div>
          <div class='card-body'>
            <div class='toy-skeleton-line shimmer-block'></div>
            <div class='toy-skeleton-line toy-skeleton-line-short shimmer-block'></div>
            <div class='toy-skeleton-actions'>
              <div class='toy-skeleton-button shimmer-block'></div>
              <div class='toy-skeleton-button shimmer-block'></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if='errorLoadToys' class='toy-collection-state text-center' role='alert'>
      <h4>Unable to load toys right now.</h4>
      <p class='mb-3'>{{ errorLoadToys }}</p>
      <b-button variant='primary' @click.prevent='reloadToys'>Try again</b-button>
    </div>

    <div v-else-if='!hasToys' class='toy-collection-state text-center'>
      <h4>No toys available yet.</h4>
      <p class='mb-3'>Load the bundled demo data to populate the collection.</p>
      <div v-if='emptyStateError' class='alert alert-danger d-inline-block mb-3' role='alert'>
        {{ emptyStateError }}
      </div>
      <div>
        <b-button variant='primary' @click.prevent='seedDemoToys' :disabled='seedingDemo'>
          {{ seedingDemo ? 'Loading demo toys...' : 'Load demo toys' }}
        </b-button>
      </div>
    </div>

    <div v-else id='toy-collection' class='row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 gx-3 gy-4'>
      <toy v-for='item in toys' :key='item.id' :toy='item'></toy>
    </div>
  </div>

</template>

<script src='./toy-collection.js' />
