<template>

  <div class='col toy-card-shell' :data-id='toy.id'>
    <article class='card toy-card'>
      <img :src='toy.image' :alt='toy.name' class='my-1' loading='lazy' />
      <div class='card-body'>
        <h5 class='card-title'>{{ toy.name }}</h5>
        <p class='card-text'><span class='likes-count'>{{ toy.likes }}</span> likes</p>
        <div class='d-flex gap-2 flex-wrap toy-card-actions'>
          <button type='button' class='btn btn-success' @click.prevent='likeToy'>Like &lt;3</button>
          <button type='button' class='btn btn-outline-primary' disabled>Edit</button>
          <button type='button' class='btn btn-danger' @click.prevent='setConfirmDeleteToy'>Delete</button>
        </div>
      </div>
    </article>
  </div>
      
</template>

<script src='./toy.js' />
