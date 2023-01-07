<template>
  
  <b-modal id='modal-delete-toy' centered :ok-disabled='deletingToy'
    ok-title='Yes' :cancel-disabled='deletingToy'
    cancel-title='Close' ok-variant='danger'
    no-close-on-backdrop='true' @ok='handleOk' size='md'
    @hidden='onHidden'>

    <template #modal-header='{ close }'>
      <h4 class='mb-0'>Please confirm</h4>
      <button type='button' v-if='!deletingToy' class='btn btn-close btn-sm' data-bs-dismiss='modal'
        aria-label='Close' @click.prevent='close()'></button>
    </template>

    <div class='modal-body'>
      <p class='mb-0'>Are you sure to delete toy <span class='text-danger'>{{ toyInfo }}</span> ?</p>
      <div class='col-12' :class="errorAction ? 'text-danger' : 'd-none'">
        {{ errorAction }}
      </div>
    </div>
  </b-modal>

</template>

<script src='./modal-confirm.js'></script>
