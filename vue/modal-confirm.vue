<template>
  
  <b-modal id='modal-delete-toy' centered hide-header hide-footer size='md'
    content-class='toy-modal-content border-0' no-close-on-backdrop='true'
    @hidden='handleModalHidden'>
    <div class='modal-header border-0'>
      <h4 class='mb-0'>Please confirm</h4>
      <button type='button' v-if='!isDeletingToy' class='btn-close' aria-label='Close' @click.prevent='closeModal()'></button>
    </div>

    <div class='modal-body'>
      <p class='mb-0'>Are you sure to delete toy <span class='text-danger'>{{ toyInfo }}</span> ?</p>
      <div class='col-12' :class="errorAction ? 'text-danger' : 'd-none'">
        {{ errorAction }}
      </div>
    </div>

    <div class='modal-footer border-0'>
      <button type='button' class='btn btn-secondary' :disabled='isDeletingToy' @click.prevent='closeModal()'>Close</button>
      <button type='button' class='btn btn-danger btn-confirm' :disabled='isDeletingToy' @click.prevent='submitDeleteToy'>
        {{ isDeletingToy ? 'Deleting...' : 'Yes' }}
      </button>
    </div>
  </b-modal>

</template>

<script src='./modal-confirm.js'></script>
