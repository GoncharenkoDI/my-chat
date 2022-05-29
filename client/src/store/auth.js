export default {
  state: {
    currentUser: null,
  },
  getters: {},
  mutations: {
    setCurrentUser(state, user) {
      // user { id, login, username, state }
      state.currentUser = user;
    },
    logout(state) {
      state.currentUser = null;
    },
  },
  actions: {
    async registerUser({ dispatch, commit }, user) {
      /* user - {login, username, password } */
      try {
        const newUser = await dispatch('request', {
          url: '/api/register',
          method: 'POST',
          body: user,
          headers: {
            'Content-Type': 'application/json',
          },
        }); // повертає 200 { id, login, username, state }
        commit('setCurrentUser', newUser);
        return;
      } catch (error) {
        console.log('registerUser error:', error);
        throw error;
      }
    },
    async loginUser({ dispatch, commit }, data) {
      /* data - {login, password } */
      try {
        const user = await dispatch('request', {
          url: '/api/login',
          method: 'POST',
          body: data,
          headers: {
            'Content-Type': 'application/json',
          },
        }); // повертає { id, login, user_name, state, created_at, modified_at }
        //console.log(user);
        commit('setUser', user);
        return;
      } catch (error) {
        console.log('loginUser error:', error);
        throw error;
      }
    },
    async logout({ commit, dispatch }) {
      try {
        await dispatch('request', {
          url: '/api/logout',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        commit('logout');
      } catch (error) {
        console.log('logout error:', error);
        throw error;
      }
    },
  },
};
