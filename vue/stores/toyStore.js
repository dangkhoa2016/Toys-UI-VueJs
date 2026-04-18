/*jshint esversion: 9 */
import {
  toApiImageUrl,
  TOY_TOAST_SETTINGS,
  TOY_TOAST_VARIANTS,
  TOY_UI_DELAYS,
} from '../../assets/js/config/config.js';
import {
  addToastState,
  createHighlightedToyState,
  createToastPayload,
  createToyStoreState,
  getToastMessage,
  getVisibleToys,
  prependToyState,
  removeToastState,
  removeToyState,
  setSearchTerm,
  setSortOrder,
  setHighlightedToyState,
  syncToyState,
  updateToyState,
} from '../../assets/js/toyStore.helpers.js';
import {
  createToy as createToyRequest,
  deleteToy as deleteToyRequest,
  fetchToys,
  likeToy as likeToyRequest,
  seedDemoToys,
  updateToy as updateToyRequest,
} from '../../assets/js/services/toyService.js';

const state = createToyStoreState();

const mutations = {
  // UI / filters
  SET_CREATE_TOY_MODAL_OPEN(state, payload) {
    state.createToyModalOpen = payload;
  },
  SET_EDITING_TOY_ID(state, payload) {
    state.editingToyId = payload;
  },
  SET_SEARCH_TERM(state, payload) {
    setSearchTerm(state, payload);
  },
  SET_SORT_ORDER(state, payload) {
    setSortOrder(state, payload);
  },
  SET_HIGHLIGHTED_TOY(state, payload) {
    setHighlightedToyState(state, payload);
  },

  // List
  SET_LOAD_TOYS_ERROR(state, payload) {
    state.loadToysError = (payload && payload.message) ? payload.message : payload;
  },
  SET_IS_LOADING_TOYS(state, payload) {
    state.isLoadingToys = payload;
  },
  SET_IS_AUTO_SEEDING(state, payload) {
    state.isAutoSeeding = payload;
  },
  SYNC_TOYS(state, payload) {
    syncToyState(state, payload);
  },
  SET_TOTAL_TOYS(state, payload) {
    state.totalToys = payload;
  },

  // Create
  SET_IS_CREATING_TOY(state, payload) {
    state.isCreatingToy = payload;
  },
  SET_CREATE_TOY_ERROR(state, payload) {
    state.createToyError = payload && payload.error ? payload.error : payload;
  },
  SET_CREATE_TOY_RESULT(state, payload) {
    state.createToyResult = payload;
  },
  PREPEND_TOY(state, payload) {
    prependToyState(state, payload);
  },

  // Update
  SET_UPDATING_TOY_ID(state, payload) {
    state.updatingToyId = payload;
  },
  SET_UPDATE_TOY_ERROR(state, payload) {
    state.updateToyError = payload && payload.error ? payload.error : payload;
  },
  SET_UPDATE_TOY_RESULT(state, payload) {
    state.updateToyResult = payload;
  },
  UPSERT_TOY(state, payload) {
    updateToyState(state, payload);
  },

  // Delete
  SET_CONFIRM_DELETE_TOY_ID(state, payload) {
    state.confirmDeleteToyId = payload;
  },
  SET_IS_DELETING_TOY(state, payload) {
    state.isDeletingToy = payload;
  },
  SET_DELETE_TOY_ERROR(state, payload) {
    state.deleteToyError = payload && payload.error ? payload.error : payload;
  },
  SET_DELETE_TOY_RESULT(state, payload) {
    state.deleteToyResult = payload;
  },
  REMOVE_DELETE_TARGET_TOY(state) {
    removeToyState(state);
  },

  // Like
  SET_LIKING_TOY_ID(state, payload) {
    state.likingToyId = payload;
  },
  ADD_LIKING_TOY_ID(state, payload) {
    if (payload && !state.likingToyIds.includes(payload)) {
      state.likingToyIds = [...state.likingToyIds, payload];
    }
  },
  REMOVE_LIKING_TOY_ID(state, payload) {
    state.likingToyIds = state.likingToyIds.filter((id) => id !== payload);
  },

  // Toast
  ADD_TOAST(state, payload) {
    addToastState(state, payload);
  },
  REMOVE_TOAST(state, payload) {
    removeToastState(state, payload);
  },
};

let highlightTimer = null;

const actions = {
  setCreateToyModalOpen(context, payload) {
    const { commit } = context;
    commit('SET_CREATE_TOY_MODAL_OPEN', payload);
  },
  toggleCreateToyModal(context) {
    const { commit, state: { createToyModalOpen } } = context;
    commit('SET_CREATE_TOY_MODAL_OPEN', !createToyModalOpen);
  },
  setEditingToy(context, payload) {
    const { commit } = context;
    commit('SET_EDITING_TOY_ID', payload);
    if (!payload) {
      commit('SET_UPDATE_TOY_ERROR', null);
      commit('SET_UPDATE_TOY_RESULT', null);
    }
  },
  setSearchTerm(context, payload) {
    const { commit } = context;
    commit('SET_SEARCH_TERM', payload);
  },
  setSortOrder(context, payload) {
    const { commit } = context;
    commit('SET_SORT_ORDER', payload);
  },
  flashToyCard(context, payload) {
    const { commit } = context;
    const toyId = payload ? payload.toString() : null;

    if (highlightTimer) {
      clearTimeout(highlightTimer);
    }

    commit('SET_HIGHLIGHTED_TOY', createHighlightedToyState({
      id: toyId,
      nonce: Date.now(),
    }));

    highlightTimer = setTimeout(() => {
      commit('SET_HIGHLIGHTED_TOY', createHighlightedToyState());
      highlightTimer = null;
    }, TOY_UI_DELAYS.HIGHLIGHT_RESET_MS);
  },
  addToast(context, payload) {
    const { commit } = context;
    const toast = createToastPayload(payload);

    commit('ADD_TOAST', toast);
    return toast.id;
  },
  removeToast(context, payload) {
    const { commit } = context;
    commit('REMOVE_TOAST', payload);
  },

  async loadInitialToys(context) {
    const { commit, dispatch, rootGetters } = context;
    const endpoint = rootGetters['appStore/getEndpoint'];

    commit('SET_IS_LOADING_TOYS', true);
    commit('SET_IS_AUTO_SEEDING', false);
    commit('SET_LOAD_TOYS_ERROR', null);
    commit('SYNC_TOYS', []);

    try {
      let result = await fetchToys(endpoint);

      if (result.length === 0) {
        commit('SET_IS_AUTO_SEEDING', true);
        await seedDemoToys(endpoint);
        result = await fetchToys(endpoint);
        commit('SET_IS_AUTO_SEEDING', false);
      }

      commit('SET_IS_LOADING_TOYS', false);
      commit('SYNC_TOYS', result);
      commit('SET_TOTAL_TOYS', result.length);
      return true;
    } catch (err) {
      console.error('Error load toys', err);
      commit('SET_IS_LOADING_TOYS', false);
      commit('SET_IS_AUTO_SEEDING', false);
      commit('SET_LOAD_TOYS_ERROR', err);
      dispatch('addToast', {
        title: 'Unable to load toys',
        message: getToastMessage(err, 'The collection could not be loaded from the API.'),
        variant: TOY_TOAST_VARIANTS.DANGER,
        delay: TOY_TOAST_SETTINGS.DEFAULT_DELAY_MS,
      });
      return false;
    }
  },

  toApiImageUrl(context, value) {
    return toApiImageUrl(value);
  },

  async seedDemoToys(context) {
    const { rootGetters } = context;
    const endpoint = rootGetters['appStore/getEndpoint'];

    try {
      await seedDemoToys(endpoint);
      return true;
    } catch (err) {
      console.error('Error import demo', err);
      return false;
    }
  },

  async submitCreateToy(context, payload) {
    const { commit, dispatch, rootGetters } = context;
    const endpoint = rootGetters['appStore/getEndpoint'];
    let { name, image = '', enabled = false, likes = 0 } = payload;
    image = await context.dispatch('toApiImageUrl', image);

    commit('SET_IS_CREATING_TOY', true);
    commit('SET_CREATE_TOY_ERROR', null);
    commit('SET_CREATE_TOY_RESULT', null);

    try {
      const result = await createToyRequest({ name, enabled, likes, image }, endpoint);
      commit('SET_IS_CREATING_TOY', false);

      commit('SET_CREATE_TOY_RESULT', result);
      commit('PREPEND_TOY', result);
      dispatch('addToast', {
        title: 'Toy created',
        message: `${result.name} is now on the shelf.`,
        variant: TOY_TOAST_VARIANTS.SUCCESS,
      });
      return result;
    } catch (err) {
      console.error('Error save toy', err);
      commit('SET_IS_CREATING_TOY', false);
      commit('SET_CREATE_TOY_ERROR', err);
      dispatch('addToast', {
        title: 'Create failed',
        message: getToastMessage(err, 'The toy could not be created.'),
        variant: TOY_TOAST_VARIANTS.DANGER,
        delay: TOY_TOAST_SETTINGS.ERROR_DELAY_MS,
      });
      return { error: err.message };
    }
  },

  async submitUpdateToy(context, payload) {
    const { commit, dispatch, getters, rootGetters } = context;
    const endpoint = rootGetters['appStore/getEndpoint'];
    let { id, name = '', image = '' } = payload || {};
    const currentToy = getters.getToyById(id);

    image = await dispatch('toApiImageUrl', image);

    if (!currentToy) {
      dispatch('addToast', {
        title: 'Update failed',
        message: 'The selected toy could not be found.',
        variant: TOY_TOAST_VARIANTS.DANGER,
        delay: TOY_TOAST_SETTINGS.ERROR_DELAY_MS,
      });
      return { error: 'Toy not found.' };
    }

    commit('SET_UPDATING_TOY_ID', id ? id.toString() : null);
    commit('SET_UPDATE_TOY_ERROR', null);
    commit('SET_UPDATE_TOY_RESULT', null);

    try {
      const result = await updateToyRequest(id, {
        name,
        image,
        likes: currentToy.likes,
        enabled: currentToy.enabled,
      }, endpoint);
      commit('SET_UPDATING_TOY_ID', null);

      commit('SET_UPDATE_TOY_RESULT', result);
      commit('UPSERT_TOY', result);
      dispatch('flashToyCard', result.id);
      dispatch('addToast', {
        title: 'Toy updated',
        message: `${result.name} was saved successfully.`,
        variant: TOY_TOAST_VARIANTS.PRIMARY,
      });

      return result;
    } catch (err) {
      console.error('Error update toy', err);
      commit('SET_UPDATING_TOY_ID', null);
      commit('SET_UPDATE_TOY_ERROR', err);
      dispatch('addToast', {
        title: 'Update failed',
        message: getToastMessage(err, 'The toy could not be updated.'),
        variant: TOY_TOAST_VARIANTS.DANGER,
        delay: TOY_TOAST_SETTINGS.ERROR_DELAY_MS,
      });
      return { error: err.message };
    }
  },


  setConfirmDeleteToyId(context, payload) {
    const { commit } = context;
    commit('SET_CONFIRM_DELETE_TOY_ID', payload);
  },

  async submitDeleteToy(context) {
    const { commit, dispatch, getters, rootGetters, state: { confirmDeleteToyId: id } } = context;
    const endpoint = rootGetters['appStore/getEndpoint'];
    const toy = getters.getToyById(id);

    commit('SET_IS_DELETING_TOY', true);
    commit('SET_DELETE_TOY_ERROR', null);
    commit('SET_DELETE_TOY_RESULT', null);

    try {
      const result = await deleteToyRequest(id, endpoint);
      commit('SET_IS_DELETING_TOY', false);

      commit('SET_DELETE_TOY_RESULT', { id: result });
      commit('REMOVE_DELETE_TARGET_TOY');
      dispatch('addToast', {
        title: 'Toy deleted',
        message: `${toy && toy.name ? toy.name : 'The toy'} was removed from the shelf.`,
        variant: TOY_TOAST_VARIANTS.WARNING,
      });
    } catch (err) {
      console.error('Error delete toy', err);
      commit('SET_IS_DELETING_TOY', false);
      commit('SET_DELETE_TOY_ERROR', err);
      dispatch('addToast', {
        title: 'Delete failed',
        message: getToastMessage(err, 'The toy could not be deleted.'),
        variant: TOY_TOAST_VARIANTS.DANGER,
        delay: TOY_TOAST_SETTINGS.ERROR_DELAY_MS,
      });
    }
  },
  
  async incrementToyLikes(context, id) {
    const { commit, dispatch, getters, rootGetters } = context;
    const endpoint = rootGetters['appStore/getEndpoint'];
    const toy = getters.getToyById(id);
    if (!toy) return;

    const toyIdStr = id ? id.toString() : null;
    commit('ADD_LIKING_TOY_ID', toyIdStr);

    try {
      const result = await likeToyRequest(toy, endpoint);
      commit('UPSERT_TOY', result);
      dispatch('flashToyCard', result.id);
      dispatch('addToast', {
        title: 'Likes updated',
        message: `${result.name} now has ${result.likes} likes.`,
        variant: TOY_TOAST_VARIANTS.SUCCESS,
        delay: TOY_TOAST_SETTINGS.DEFAULT_DELAY_MS,
      });
      return result;
    } catch (err) {
      console.error('Error like toy', err);
      dispatch('addToast', {
        title: 'Like failed',
        message: getToastMessage(err, 'The like count could not be updated.'),
        variant: TOY_TOAST_VARIANTS.DANGER,
        delay: TOY_TOAST_SETTINGS.DEFAULT_DELAY_MS,
      });
      return { error: err.message };
    } finally {
      commit('REMOVE_LIKING_TOY_ID', toyIdStr);
    }
  },

};

const getters = {
  getCreateToyModalOpen: (state) => state.createToyModalOpen,
  getEditingToyId: (state) => state.editingToyId,
  getSearchTerm: (state) => state.searchTerm,
  getSortOrder: (state) => state.sortOrder,
  getToasts: (state) => state.toasts,
  getHighlightedToy: (state) => state.highlightedToy,
  getToys: (state) => state.toys,
  getVisibleToys: (state) => getVisibleToys(state),

  getToyById: (state) => (id) => {
    if (!Array.isArray(state.toys))
      return;

    if (!id)
      id = state.confirmDeleteToyId;
    if (!id)
      return;

    id = id.toString();
    return state.toys.find(n => n.id.toString() === id);
  },
  getEditingToy: (state, getters) => getters.getToyById(state.editingToyId),

  getLoadToysError: (state) => state.loadToysError,
  getIsLoadingToys: (state) => state.isLoadingToys,
  getIsAutoSeeding: (state) => state.isAutoSeeding,

  getCreateToyError: (state) => state.createToyError,
  getIsCreatingToy: (state) => state.isCreatingToy,
  getCreateToyResult: (state) => state.createToyResult,

  getUpdateToyError: (state) => state.updateToyError,
  getUpdatingToyId: (state) => state.updatingToyId,
  getUpdateToyResult: (state) => state.updateToyResult,

  getDeleteToyResult: (state) => state.deleteToyResult,
  getIsDeletingToy: (state) => state.isDeletingToy,
  getConfirmDeleteToyId: (state) => state.confirmDeleteToyId,
  getDeleteToyError: (state) => state.deleteToyError,
  getLikingToyIds: (state) => state.likingToyIds,
};

export const toyStore = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
