<template>

  <div class='col toy-card-shell' :data-id='toy.id'>
    <article ref='card' class='card toy-card' :class="{ 'is-busy': isBusy }">
      <img :src='normalizedImageUrl' :alt='toy.name' class='my-1' loading='lazy' />
      <div class='card-body'>
        <h5 class='card-title'>{{ toy.name }}</h5>
        <p class='card-text'><span class='likes-count'>{{ toy.likes }}</span> likes</p>
        <div class='d-flex gap-2 flex-wrap toy-card-actions'>
          <button type='button' class='btn btn-success' :disabled='isBusy' @click.prevent='incrementToyLikes'>Like &lt;3</button>
          <button type='button' class='btn btn-outline-primary' :disabled='isBusy' @click.prevent='openEditToy'>Edit</button>
          <button type='button' class='btn btn-danger' :disabled='isBusy' @click.prevent='openDeleteToyConfirm'>Delete</button>
        </div>
      </div>
    </article>
  </div>
      
</template>

<script src='./toy.js' />
