/*jshint esversion: 9 */
import { TOY_API_URL } from '../../assets/js/config.js';

const state = {
  appLoaded: false,
  endpoint: TOY_API_URL,
};

const mutations = {
  SET_ENDPOINT(state, payload) {
    state.endpoint = payload;
  },
  SET_APP_LOADED(state, payload) {
    state.appLoaded = payload;
  },
};

const actions = {
  setEndpoint(context, payload) {
    const { commit } = context;
    commit('SET_ENDPOINT', payload);
  },
  setAppLoaded(context, payload) {
    const { commit } = context;
    commit('SET_APP_LOADED', payload);
  },
};

const getters = {
  getEndpoint: (state) => {
    let endpoint = state.endpoint;
    if ((endpoint || '').length < 4)
      endpoint = TOY_API_URL;

    return endpoint;
  },
  getAppLoaded: (state) => state.appLoaded,
};

export const appStore = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};