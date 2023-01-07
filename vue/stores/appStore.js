/*jshint esversion: 9 */

(function () {

  const state = {
    appLoaded: false,
    endpoint: 'https://Toy-Api-Server-Nodejs.khoa2016.repl.co/api/toys',
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
        endpoint = '';

      return endpoint;
    },
    getAppLoaded: (state) => state.appLoaded,
  };

  if (!window.store)
    window.store = {};
  window.store.appStore = {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
  };

})();
