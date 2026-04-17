<template>

  <div>
    <div v-if='showSkeletons' id='toy-collection'
      :class='[wrapperClass, "toy-collection-skeleton"]'>
      <div v-if='isAutoSeeding' class='col-12 toy-status-shell'>
        <div class='alert alert-info toy-status-alert' role='status'>
          <p class='mb-0'>
            <strong>Server has no data yet.</strong>
            Initializing sample data, please wait...
          </p>
        </div>
      </div>
      <toy-skeleton :count='skeletonCount'></toy-skeleton>
    </div>

    <div v-else-if='loadToysError' id='toy-collection' :class='wrapperClass'>
      <div class='col-12 toy-status-shell'>
        <div class='alert alert-danger toy-status-alert' role='alert'>
          <p class='mb-0'>{{ loadToysError }}</p>
          <div class='toy-status-actions mt-3'>
            <button type='button' class='btn btn-danger toy-status-reload' @click.prevent='reloadToys'>Reload data</button>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if='isFilteredEmpty' id='toy-collection' :class='wrapperClass'>
      <div class='col-12 toy-status-shell'>
        <div class='alert toy-status-alert toy-status-alert-info' role='alert'>
          <p class='mb-0'>No toys match the current search or sort view.</p>
        </div>
      </div>
    </div>

    <div v-else-if='!hasStoredToys' id='toy-collection' :class='wrapperClass'>
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

    <transition-group v-else id='toy-collection' name='toy-list' tag='div' :class='wrapperClass'>
      <toy v-for='item in toys' :key='item.id' :toy='item'></toy>
    </transition-group>
  </div>

</template>

<script src='./toy-collection.js' />
