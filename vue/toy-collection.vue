<template>

  <div id='toy-collection' class='row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 gx-3 gy-4'>
    <toy v-for='(item, index) in toys' :key='`toy-${index}`' :toy='item'></toy>
  </div>

</template>

<script src='./toy-collection.js' />
