<template>

  <div class='toy-skeleton-list'>
    <div v-for='skeleton in count' :key='`skeleton-${skeleton}`' class='col toy-card-shell'>
      <div class='card toy-card toy-card-skeleton'>
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

</template>

<script>
  /*jshint esversion: 9 */

  export default {
    props: {
      count: {
        type: Number,
        default: 8,
      },
    },
  };

</script>
