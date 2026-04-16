/*jshint esversion: 9 */
import { fetchWithRetry } from '../../assets/js/utils.js';
import { toyService } from '../../assets/js/services/api.js';

const state = {
  addFormStatus: false,

  toys: [],
  toy: null,

  loadingToys: null,
  totalToys: null,
  errorLoadToys: null,

  saveToyResult: null,
  errorSaveToy: null,
  savingToy: null,


  errorDeleteToy: null,
  deletingToy: null,
  deleteToyResult: null,
  confirmDeleteToyId: null,
};

const mutations = {
  SET_ADD_FORM_STATUS(state, payload) {
    state.addFormStatus = payload;
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
    state.confirmDeleteToyId = '';
  },


  INTERNAL_UPDATE_DATA(state, payload) {
    const toys = state.toys;
    const id = payload.id.toString();
    const indx = toys.findIndex(n => n.id.toString() === id);
    if (indx !== -1)
      toys[indx] = { ...toys[indx], ...payload };
    else
      toys.push(payload);
    state.toys = [...toys];
  },
};

const actions = {
  setAddFormStatus(context, payload) {
    const { commit } = context;
    commit('SET_ADD_FORM_STATUS', payload);
  },
  toggleAddFormStatus(context) {
    const { commit, state: { addFormStatus } } = context;
    commit('SET_ADD_FORM_STATUS', !addFormStatus);
  },

  async loadToys(context) {
    const { commit, rootGetters } = context;
    const endpoint = rootGetters['appStore/getEndpoint'];

    commit('SET_LOADING_TOYS', true);
    commit('SET_ERROR_LOAD_TOYS', null);
    commit('SET_TOYS', []);

    try {
      const result = await toyService.getAll(endpoint);
      commit('SET_LOADING_TOYS', false);

      if (typeof (result) === 'object' && result.error) {
        commit('SET_ERROR_LOAD_TOYS', result.error);
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
    const { commit, rootGetters } = context;
    const endpoint = rootGetters['appStore/getEndpoint'];
    let { name, image = '', enabled = false, likes = 0 } = payload;

    commit('SET_SAVING_TOY', true);
    commit('SET_ERROR_SAVE_TOY', null);
    commit('SET_SAVE_TOY_RESULT', null);

    try {
      const result = await toyService.create(endpoint, { name, enabled, likes, image });
      commit('SET_SAVING_TOY', false);

      if (result.error) {
        commit('SET_ERROR_SAVE_TOY', result.error);
      } else {
        commit('SET_SAVE_TOY_RESULT', result);
        commit('INTERNAL_UPDATE_DATA', result);
      }
      return result;
    } catch (err) {
      console.error('Error save toy', err);
      commit('SET_SAVING_TOY', false);
      commit('SET_ERROR_SAVE_TOY', err);
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
    const { commit, rootGetters, state: { confirmDeleteToyId: id } } = context;
    const endpoint = rootGetters['appStore/getEndpoint'];

    commit('SET_DELETING_TOY', true);
    commit('SET_ERROR_DELETE_TOY', null);
    commit('SET_DELETE_TOY_RESULT', null);

    try {
      const result = await toyService.delete(endpoint, id);
      commit('SET_DELETING_TOY', false);

      if (typeof (result) === 'object' && result.error) {
        commit('SET_ERROR_DELETE_TOY', result.error);
      } else {
        commit('SET_DELETE_TOY_RESULT', { id });
        commit('REMOVE_SELECTED_TOY');
      }
    } catch (err) {
      console.error('Error delete toy', err);
      commit('SET_DELETING_TOY', false);
      commit('SET_ERROR_DELETE_TOY', err);
    }
  },
  
  async likeToy(context, id) {
    const { commit, getters, rootGetters } = context;
    const endpoint = rootGetters['appStore/getEndpoint'];
    const toy = getters.getCacheToyInfo(id);
    if (!toy) return;

    try {
      const result = await toyService.like(endpoint, id, toy.likes + 1);
      commit('INTERNAL_UPDATE_DATA', result);
      return result;
    } catch (err) {
      console.error('Error like toy', err);
      return { error: err.message };
    }
  },

};

const getters = {
  getAddFormStatus: (state) => state.addFormStatus,
  getCachedToys: (state) => state.toys,

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

  getErrorLoadToys: (state) => state.errorLoadToys,
  getLoadingToys: (state) => state.loadingToys,

  getErrorSaveToy: (state) => state.errorSaveToy,
  getSavingToy: (state) => state.savingToy,
  getSaveToyResult: (state) => state.saveToyResult,

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