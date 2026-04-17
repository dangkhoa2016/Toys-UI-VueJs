/*jshint esversion: 9 */
import { fetchWithRetry } from '../../assets/js/utils.js';
import { toyService } from '../../assets/js/services/api.js';

const state = {
  addFormStatus: false,
  editingToyId: null,
  searchTerm: '',
  sortOrder: 'default',
  toasts: [],
  highlightedToy: {
    id: null,
    nonce: 0,
  },

  toys: [],
  toy: null,

  loadingToys: null,
  totalToys: null,
  errorLoadToys: null,

  saveToyResult: null,
  errorSaveToy: null,
  savingToy: null,

  updateToyResult: null,
  errorUpdateToy: null,
  updatingToy: null,


  errorDeleteToy: null,
  deletingToy: null,
  deleteToyResult: null,
  confirmDeleteToyId: null,
};

const mutations = {
  SET_ADD_FORM_STATUS(state, payload) {
    state.addFormStatus = payload;
  },
  SET_EDITING_TOY_ID(state, payload) {
    state.editingToyId = payload;
  },
  SET_SEARCH_TERM(state, payload) {
    state.searchTerm = payload;
  },
  SET_SORT_ORDER(state, payload) {
    state.sortOrder = payload;
  },
  SET_HIGHLIGHTED_TOY(state, payload) {
    state.highlightedToy = payload;
  },
  PUSH_TOAST(state, payload) {
    state.toasts = [...state.toasts, payload];
  },
  REMOVE_TOAST(state, payload) {
    state.toasts = state.toasts.filter((toast) => toast.id !== payload);
  },


  SET_ERROR_LOAD_TOYS(state, payload) {
    state.errorLoadToys = (payload && payload.message) ? payload.message : payload;
  },
  SET_LOADING_TOYS(state, payload) {
    state.loadingToys = payload;
  },
  SET_TOYS(state, payload) {
    state.toys = payload;
  },
  SET_TOTAL_TOYS(state, payload) {
    state.totalToys = payload;
  },


  SET_SAVE_TOY_RESULT(state, payload) {
    state.saveToyResult = payload;
  },
  SET_ERROR_SAVE_TOY(state, payload) {
    state.errorSaveToy = payload && payload.error ? payload.error : payload;
  },
  SET_SAVING_TOY(state, payload) {
    state.savingToy = payload;
  },
  SET_UPDATE_TOY_RESULT(state, payload) {
    state.updateToyResult = payload;
  },
  SET_ERROR_UPDATE_TOY(state, payload) {
    state.errorUpdateToy = payload && payload.error ? payload.error : payload;
  },
  SET_UPDATING_TOY(state, payload) {
    state.updatingToy = payload;
  },


  SET_CONFIRM_DELETED_TOY_ID(state, payload) {
    state.confirmDeleteToyId = payload;
  },
  SET_ERROR_DELETE_TOY(state, payload) {
    state.errorDeleteToy = payload && payload.error ? payload.error : payload;
  },
  SET_DELETING_TOY(state, payload) {
    state.deletingToy = payload;
  },
  SET_DELETE_TOY_RESULT(state, payload) {
    state.deleteToyResult = payload;
  },
  REMOVE_SELECTED_TOY(state) {
    if (!state.confirmDeleteToyId)
      return;

    const indx = state.toys.findIndex(t => t.id.toString() === state.confirmDeleteToyId.toString());
    if (indx < 0)
      return;

    state.toys.splice(indx, 1);
    state.totalToys = state.toys.length;
    state.confirmDeleteToyId = '';
  },

  PREPEND_TOY(state, payload) {
    state.toys = [payload, ...state.toys.filter((toy) => toy.id.toString() !== payload.id.toString())];
    state.totalToys = state.toys.length;
  },


  INTERNAL_UPDATE_DATA(state, payload) {
    const toys = [...state.toys];
    const id = payload.id.toString();
    const indx = toys.findIndex(n => n.id.toString() === id);
    if (indx !== -1)
      toys[indx] = { ...toys[indx], ...payload };
    else
      toys.push(payload);
    state.toys = [...toys];
    state.totalToys = state.toys.length;
  },
};

let highlightTimer = null;

function getToastMessage(error, fallbackMessage) {
  if (typeof error === 'string' && error.trim()) {
    return error;
  }

  if (error && typeof error.message === 'string' && error.message.trim()) {
    return error.message;
  }

  if (error && typeof error.error === 'string' && error.error.trim()) {
    return error.error;
  }

  return fallbackMessage;
}

const actions = {
  setAddFormStatus(context, payload) {
    const { commit } = context;
    commit('SET_ADD_FORM_STATUS', payload);
  },
  toggleAddFormStatus(context) {
    const { commit, state: { addFormStatus } } = context;
    commit('SET_ADD_FORM_STATUS', !addFormStatus);
  },
  setEditingToyId(context, payload) {
    const { commit } = context;
    commit('SET_EDITING_TOY_ID', payload);
    if (!payload) {
      commit('SET_ERROR_UPDATE_TOY', null);
      commit('SET_UPDATE_TOY_RESULT', null);
    }
  },
  setSearchTerm(context, payload) {
    const { commit } = context;
    commit('SET_SEARCH_TERM', payload || '');
  },
  setSortOrder(context, payload) {
    const { commit } = context;
    const nextSortOrder = ['default', 'likes-desc', 'likes-asc'].includes(payload) ? payload : 'default';
    commit('SET_SORT_ORDER', nextSortOrder);
  },
  flashToy(context, payload) {
    const { commit } = context;
    const toyId = payload ? payload.toString() : null;

    if (highlightTimer) {
      clearTimeout(highlightTimer);
    }

    commit('SET_HIGHLIGHTED_TOY', {
      id: toyId,
      nonce: Date.now(),
    });

    highlightTimer = setTimeout(() => {
      commit('SET_HIGHLIGHTED_TOY', {
        id: null,
        nonce: 0,
      });
      highlightTimer = null;
    }, 700);
  },
  pushToast(context, payload) {
    const { commit } = context;
    const toast = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: payload && payload.title ? payload.title : 'Toy Tale',
      message: payload && payload.message ? payload.message : '',
      variant: payload && payload.variant ? payload.variant : 'primary',
      delay: payload && payload.delay ? payload.delay : 5000,
    };

    commit('PUSH_TOAST', toast);
    return toast.id;
  },
  removeToast(context, payload) {
    const { commit } = context;
    commit('REMOVE_TOAST', payload);
  },

  async loadToys(context) {
    const { commit, dispatch, rootGetters } = context;
    const endpoint = rootGetters['appStore/getEndpoint'];

    commit('SET_LOADING_TOYS', true);
    commit('SET_ERROR_LOAD_TOYS', null);
    commit('SET_TOYS', []);

    try {
      const result = await toyService.getAll(endpoint);
      commit('SET_LOADING_TOYS', false);

      if (typeof (result) === 'object' && result.error) {
        commit('SET_ERROR_LOAD_TOYS', result.error);
        dispatch('pushToast', {
          title: 'Unable to load toys',
          message: getToastMessage(result, 'The collection could not be loaded from the API.'),
          variant: 'danger',
          delay: 5000,
        });
        return false;
      } else {
        commit('SET_TOYS', result);
        commit('SET_TOTAL_TOYS', result.length);
        return true;
      }
    } catch (err) {
      console.error('Error load toys', err);
      commit('SET_LOADING_TOYS', false);
      commit('SET_ERROR_LOAD_TOYS', err);
      dispatch('pushToast', {
        title: 'Unable to load toys',
        message: getToastMessage(err, 'The collection could not be loaded from the API.'),
        variant: 'danger',
        delay: 5000,
      });
      return false;
    }
  },

  toApiImageUrl(context, value) {
    if (!value || typeof (value) !== 'string') {
      return '';
    }

    value = value.trim();
    if (!value) {
      return '';
    }

    if (/^\s*https?:\/\//.test(value)) {
      return value;
    }

    return new URL(value, window.location.origin).href;
  },

  async importDemo(context) {
    const { rootGetters, dispatch } = context;
    const endpoint = rootGetters['appStore/getEndpoint'];

    try {
      const response = await fetchWithRetry('/assets/db.json');
      const toys = (await response.json()).toys;
      await Promise.all(toys.map(async toy => {
        toy.image = await dispatch('toApiImageUrl', toy.image);
        await toyService.create(endpoint, toy);
      }));
      return true;
    } catch (err) {
      console.error('Error import demo', err);
      return false;
    }
  },

  async createToy(context, payload) {
    const { commit, dispatch, rootGetters } = context;
    const endpoint = rootGetters['appStore/getEndpoint'];
    let { name, image = '', enabled = false, likes = 0 } = payload;
    image = await context.dispatch('toApiImageUrl', image);

    commit('SET_SAVING_TOY', true);
    commit('SET_ERROR_SAVE_TOY', null);
    commit('SET_SAVE_TOY_RESULT', null);

    try {
      const result = await toyService.create(endpoint, { name, enabled, likes, image });
      commit('SET_SAVING_TOY', false);

      if (result.error) {
        commit('SET_ERROR_SAVE_TOY', result.error);
        dispatch('pushToast', {
          title: 'Create failed',
          message: getToastMessage(result, 'The toy could not be created.'),
          variant: 'danger',
          delay: 3600,
        });
      } else {
        commit('SET_SAVE_TOY_RESULT', result);
        commit('PREPEND_TOY', result);
        dispatch('pushToast', {
          title: 'Toy created',
          message: `${result.name} is now on the shelf.`,
          variant: 'success',
        });
      }
      return result;
    } catch (err) {
      console.error('Error save toy', err);
      commit('SET_SAVING_TOY', false);
      commit('SET_ERROR_SAVE_TOY', err);
      dispatch('pushToast', {
        title: 'Create failed',
        message: getToastMessage(err, 'The toy could not be created.'),
        variant: 'danger',
        delay: 3600,
      });
      return { error: err.message };
    }
  },

  async updateToy(context, payload) {
    const { commit, dispatch, getters, rootGetters } = context;
    const endpoint = rootGetters['appStore/getEndpoint'];
    let { id, name = '', image = '' } = payload || {};
    const currentToy = getters.getCacheToyInfo(id);

    image = await dispatch('toApiImageUrl', image);

    if (!currentToy) {
      dispatch('pushToast', {
        title: 'Update failed',
        message: 'The selected toy could not be found.',
        variant: 'danger',
        delay: 3600,
      });
      return { error: 'Toy not found.' };
    }

    commit('SET_UPDATING_TOY', id ? id.toString() : null);
    commit('SET_ERROR_UPDATE_TOY', null);
    commit('SET_UPDATE_TOY_RESULT', null);

    try {
      const result = await toyService.update(endpoint, id, {
        name,
        image,
        likes: currentToy.likes,
        enabled: currentToy.enabled,
      });
      commit('SET_UPDATING_TOY', null);

      if (result.error) {
        commit('SET_ERROR_UPDATE_TOY', result.error);
        dispatch('pushToast', {
          title: 'Update failed',
          message: getToastMessage(result, 'The toy could not be updated.'),
          variant: 'danger',
          delay: 3600,
        });
      } else {
        commit('SET_UPDATE_TOY_RESULT', result);
        commit('INTERNAL_UPDATE_DATA', result);
        dispatch('flashToy', result.id);
        dispatch('pushToast', {
          title: 'Toy updated',
          message: `${result.name} was saved successfully.`,
          variant: 'primary',
        });
      }

      return result;
    } catch (err) {
      console.error('Error update toy', err);
      commit('SET_UPDATING_TOY', null);
      commit('SET_ERROR_UPDATE_TOY', err);
      dispatch('pushToast', {
        title: 'Update failed',
        message: getToastMessage(err, 'The toy could not be updated.'),
        variant: 'danger',
        delay: 3600,
      });
      return { error: err.message };
    }
  },


  setConfirmDeleteToyId(context, payload) {
    const { commit } = context;
    commit('SET_CONFIRM_DELETED_TOY_ID', payload);
  },

  setErrorDeleteToy(context, payload) {
    const { commit } = context;
    commit('SET_ERROR_DELETE_TOY', payload);
  },

  async deleteToy(context) {
    const { commit, dispatch, getters, rootGetters, state: { confirmDeleteToyId: id } } = context;
    const endpoint = rootGetters['appStore/getEndpoint'];
    const toy = getters.getCacheToyInfo(id);

    commit('SET_DELETING_TOY', true);
    commit('SET_ERROR_DELETE_TOY', null);
    commit('SET_DELETE_TOY_RESULT', null);

    try {
      const result = await toyService.delete(endpoint, id);
      commit('SET_DELETING_TOY', false);

      if (typeof (result) === 'object' && result.error) {
        commit('SET_ERROR_DELETE_TOY', result.error);
        dispatch('pushToast', {
          title: 'Delete failed',
          message: getToastMessage(result, 'The toy could not be deleted.'),
          variant: 'danger',
          delay: 3600,
        });
      } else {
        commit('SET_DELETE_TOY_RESULT', { id });
        commit('REMOVE_SELECTED_TOY');
        dispatch('pushToast', {
          title: 'Toy deleted',
          message: `${toy && toy.name ? toy.name : 'The toy'} was removed from the shelf.`,
          variant: 'warning',
        });
      }
    } catch (err) {
      console.error('Error delete toy', err);
      commit('SET_DELETING_TOY', false);
      commit('SET_ERROR_DELETE_TOY', err);
      dispatch('pushToast', {
        title: 'Delete failed',
        message: getToastMessage(err, 'The toy could not be deleted.'),
        variant: 'danger',
        delay: 3600,
      });
    }
  },
  
  async likeToy(context, id) {
    const { commit, dispatch, getters, rootGetters } = context;
    const endpoint = rootGetters['appStore/getEndpoint'];
    const toy = getters.getCacheToyInfo(id);
    if (!toy) return;

    try {
      const result = await toyService.like(endpoint, id, toy.likes + 1);
      commit('INTERNAL_UPDATE_DATA', result);
      dispatch('flashToy', result.id);
      dispatch('pushToast', {
        title: 'Likes updated',
        message: `${result.name} now has ${result.likes} likes.`,
        variant: 'success',
        delay: 5000,
      });
      return result;
    } catch (err) {
      console.error('Error like toy', err);
      dispatch('pushToast', {
        title: 'Like failed',
        message: getToastMessage(err, 'The like count could not be updated.'),
        variant: 'danger',
        delay: 5000,
      });
      return { error: err.message };
    }
  },

};

const getters = {
  getAddFormStatus: (state) => state.addFormStatus,
  getEditingToyId: (state) => state.editingToyId,
  getSearchTerm: (state) => state.searchTerm,
  getSortOrder: (state) => state.sortOrder,
  getToasts: (state) => state.toasts,
  getHighlightedToy: (state) => state.highlightedToy,
  getCachedToys: (state) => state.toys,
  getVisibleToys: (state) => {
    const toys = Array.isArray(state.toys) ? [...state.toys] : [];
    const normalizedSearchTerm = (state.searchTerm || '').trim().toLowerCase();
    const filteredToys = normalizedSearchTerm
      ? toys.filter((toy) => (toy.name || '').toLowerCase().includes(normalizedSearchTerm))
      : toys;

    if (state.sortOrder === 'likes-desc') {
      return filteredToys.sort((left, right) => right.likes - left.likes || left.name.localeCompare(right.name));
    }

    if (state.sortOrder === 'likes-asc') {
      return filteredToys.sort((left, right) => left.likes - right.likes || left.name.localeCompare(right.name));
    }

    return filteredToys;
  },

  getCacheToyInfo: (state) => (id) => {
    if (!Array.isArray(state.toys))
      return;

    if (!id)
      id = state.confirmDeleteToyId;
    if (!id)
      return;

    id = id.toString();
    return state.toys.find(n => n.id.toString() === id);
  },
  getEditingToy: (state, getters) => getters.getCacheToyInfo(state.editingToyId),

  getErrorLoadToys: (state) => state.errorLoadToys,
  getLoadingToys: (state) => state.loadingToys,

  getErrorSaveToy: (state) => state.errorSaveToy,
  getSavingToy: (state) => state.savingToy,
  getSaveToyResult: (state) => state.saveToyResult,

  getErrorUpdateToy: (state) => state.errorUpdateToy,
  getUpdatingToy: (state) => state.updatingToy,
  getUpdateToyResult: (state) => state.updateToyResult,

  getDeleteToyResult: (state) => state.deleteToyResult,
  getDeletingToy: (state) => state.deletingToy,
  getConfirmDeleteToyId: (state) => state.confirmDeleteToyId,
  getErrorDeleteToy: (state) => state.errorDeleteToy,
};

export const toyStore = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
