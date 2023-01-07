<template>

  <div class='col' :data-id='toy.id'>
    <div class='card'>
      <img :src='toy.image' :alt='toy.name' class='my-1' />
      <div class='card-body'>
        <h5 class='card-title'>{{ toy.name }}</h5>
        <p class='card-text'><span>{{ toy.likes }}</span> likes</p>
        <div>
          <b-button variant='success' class='like-btn' @click.prevent='likeToy'>Like &lt;3</b-button>
          <b-button variant='danger' class='delete-btn' @click.prevent='setConfirmDeleteToy'>Delete</b-button>
        </div>
      </div>
    </div>
  </div>
      
</template>

<script src='./toy.js' />
