export default {
  state: {
    loading: false
  },
  mutations: {
    setLoading(state, loading) {
      state.loading = loading;
    }
  },
  actions: {
    async request(
      { commit },
      { url, method = 'GET', body = null, headers = {} }
    ) {
      commit('setLoading', true);
      try {
        if (
          body &&
          headers['Content-Type'] &&
          headers['Content-Type'] == 'application/json'
        ) {
          body = JSON.stringify(body);
        }
        const response = await fetch(url, {
          method,
          credentials: 'include', // include, *same-origin, omit
          body,
          headers
        });
        //console.dir(response);
        let data = await response.text();
        try {
          data = JSON.parse(data);
        } catch (error) {
          data = { message: data };
        }
        if (!response.ok) {
          throw new Error(data.message || 'Виникла якась помилка!');
        }
        return data;
      } catch (error) {
        console.dir(error);
        throw error;
      } finally {
        commit('setLoading', false);
      }
    }
  }
};
