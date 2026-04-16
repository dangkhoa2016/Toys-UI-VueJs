<template>

  <b-modal id='modal-edit-toy' centered hide-header hide-footer size='lg'
    content-class='toy-modal-content border-0'>
    <div class='modal-header border-0 pb-0'>
      <div>
        <p class='toy-modal-eyebrow mb-2'>Shelf maintenance</p>
        <h2 id='modal-edit-toy-title' class='h3 mb-1'>Edit toy details</h2>
        <p class='text-muted mb-0'>Update the selected toy without resetting its current likes.</p>
      </div>
      <button type='button' class='btn-close' aria-label='Close' @click.prevent='$bvModal.hide("modal-edit-toy")'></button>
    </div>

    <div class='modal-body pt-3'>
      <form id='edit-toy-form' class='text-start'>
        <div class='card toy-form-card border-0 shadow-sm mx-auto'>
          <div class='card-body p-4 p-md-4'>
            <div class='row g-3'>
              <div class='col-12'>
                <p class='form-text toy-form-hint my-0'>Editing <span class='toy-edit-info fw-semibold'>the selected toy</span></p>
              </div>

              <div class='col-12 col-md-6'>
                <label for='edit-toy-name' class='form-label'>Toy name</label>
                <input id='edit-toy-name' type='text' name='name' value='' placeholder="Update the toy's name..."
                  class='form-control' autocomplete='off' />
              </div>

              <div class='col-12 col-md-6'>
                <label for='edit-toy-image' class='form-label'>Image URL</label>
                <input id='edit-toy-image' type='text' name='image' value='' placeholder="Update the toy's image URL..."
                  class='form-control' autocomplete='off' />
              </div>

              <div class='col-12 toy-form-actions d-flex flex-column flex-md-row align-items-stretch align-items-md-center gap-2 gap-md-3'>
                <button type='submit' name='submit' class='btn btn-primary px-4 toy-form-submit' disabled>Save Changes</button>
                <span class='form-text toy-form-hint my-0'>Changes are sent to the API immediately after you save.</span>
              </div>

              <div class='col-12'>
                <div role='alert' class='alert alert-danger d-none mb-0'></div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  </b-modal>

</template>