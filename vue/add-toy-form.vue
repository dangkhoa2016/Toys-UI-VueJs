<template>

  <form id='add-toy-form' @submit.prevent='createToy' class='mt-5' :class="{ 'd-none': !addFormStatus }">
    <h3>Create a toy!</h3>

    <input type='text' name='name' v-model='form.name' :disabled='savingToy'
      placeholder="Enter a toy's name..." class='input-text' />
    <br />
    <input type='text' name='image' v-model='form.image' :disabled='savingToy'
      placeholder="Enter a toy's image URL..." class='input-text' />
    <br />
    <input type='submit' name='submit' value='Create New Toy'
      class='submit' :disabled='savingToy' />

    <div v-if='errorSaveToy' class='alert alert-danger w-50 mx-auto mt-2 mb-0 p-2' role='alert'>
      {{ errorSaveToy }}
    </div>
  </form>

</template>

<script src='./add-toy-form.js' />
