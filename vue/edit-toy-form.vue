<template>

  <b-modal id='modal-edit-toy' centered hide-header hide-footer size='lg'
    content-class='toy-modal-content border-0' @shown='onShown' @hidden='onHidden'>
    <div class='modal-header border-0 pb-0'>
      <div>
        <p class='toy-modal-eyebrow mb-2'>Shelf maintenance</p>
        <h2 id='modal-edit-toy-title' class='h3 mb-1'>Edit toy details</h2>
        <p class='text-muted mb-0'>Update the selected toy without resetting its current likes.</p>
      </div>
      <button type='button' class='btn-close' aria-label='Close' @click.prevent='hideModal()'></button>
    </div>

    <div class='modal-body pt-3'>
      <form id='edit-toy-form' class='text-start' novalidate @submit.prevent='updateToy'>
        <div class='card toy-form-card border-0 shadow-sm mx-auto'>
          <div class='card-body p-4 p-md-4'>
            <div class='row g-3'>
              <div class='col-12'>
                <p class='form-text toy-form-hint my-0'>Editing <span class='toy-edit-info fw-semibold'>{{ toyLabel }}</span></p>
              </div>

              <div class='col-12 col-md-6'>
                <label for='edit-toy-name' class='form-label'>Toy name</label>
                <input id='edit-toy-name' ref='nameInput' type='text' name='name' v-model='form.name' :disabled='isUpdating'
                  placeholder="Update the toy's name..." class='form-control' autocomplete='off'
                  @input='clearFieldError("name")' :class="{ 'is-invalid': Boolean(validationErrors.name) }"
                  :aria-invalid='Boolean(validationErrors.name)' :aria-describedby='validationErrors.name ? "edit-toy-name-error" : null' />
                <div v-if='validationErrors.name' id='edit-toy-name-error' class='invalid-feedback d-block'>
                  {{ validationErrors.name }}
                </div>
              </div>

              <div class='col-12 col-md-6'>
                <label for='edit-toy-image' class='form-label'>Image URL</label>
                <input id='edit-toy-image' type='text' name='image' v-model='form.image' :disabled='isUpdating'
                  placeholder="Update the toy's image URL..." class='form-control' autocomplete='off'
                  @input='clearFieldError("image")' :class="{ 'is-invalid': Boolean(validationErrors.image) }"
                  :aria-invalid='Boolean(validationErrors.image)' :aria-describedby='validationErrors.image ? "edit-toy-image-error" : null' />
                <div v-if='validationErrors.image' id='edit-toy-image-error' class='invalid-feedback d-block'>
                  {{ validationErrors.image }}
                </div>
              </div>

              <div class='col-12 toy-form-actions d-flex flex-column flex-md-row align-items-stretch align-items-md-center gap-2 gap-md-3'>
                <button type='submit' name='submit' class='btn btn-primary px-4 toy-form-submit' :disabled='isUpdating'>
                  {{ isUpdating ? 'Saving...' : 'Save Changes' }}
                </button>
                <span class='form-text toy-form-hint my-0'>Changes are sent to the API immediately after you save.</span>
              </div>

              <div class='col-12'>
                <div role='alert' class='alert alert-danger mb-0' :class="{ 'd-none': !errorUpdateToy }">
                  {{ errorUpdateToy }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  </b-modal>

</template>

<script src='./edit-toy-form.js' />
