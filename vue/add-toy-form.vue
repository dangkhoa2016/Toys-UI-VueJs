<template>

  <form id='add-toy-form' @submit.prevent='createToy' class='mt-5' :class="{ 'd-none': !addFormStatus }" novalidate>
    <h3>Create a toy!</h3>

    <div class='toy-form-field'>
      <label for='toy-name-input' class='toy-form-label'>Toy name</label>
      <input id='toy-name-input' type='text' name='name' v-model='form.name' :disabled='savingToy'
        placeholder="Enter a toy's name..." class='input-text' @input='clearFieldError("name")'
        :aria-invalid='Boolean(validationErrors.name)' :aria-describedby='validationErrors.name ? "toy-name-error" : null' />
      <div v-if='validationErrors.name' id='toy-name-error' class='field-error' role='alert'>
        {{ validationErrors.name }}
      </div>
    </div>

    <div class='toy-form-field'>
      <label for='toy-image-input' class='toy-form-label'>Image URL</label>
      <input id='toy-image-input' type='text' name='image' v-model='form.image' :disabled='savingToy'
        placeholder="Enter a toy's image URL..." class='input-text' @input='clearFieldError("image")'
        :aria-invalid='Boolean(validationErrors.image)' :aria-describedby='validationErrors.image ? "toy-image-error" : null' />
      <div v-if='validationErrors.image' id='toy-image-error' class='field-error' role='alert'>
        {{ validationErrors.image }}
      </div>
    </div>

    <input type='submit' name='submit' :value='savingToy ? "Saving..." : "Create New Toy"'
      class='submit' :disabled='savingToy' />

    <div v-if='errorSaveToy' class='alert alert-danger w-50 mx-auto mt-2 mb-0 p-2' role='alert'>
      {{ errorSaveToy }}
    </div>
  </form>

</template>

<script src='./add-toy-form.js' />
