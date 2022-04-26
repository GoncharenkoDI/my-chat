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
    async testUserByEmail({ dispatch }, { email }) {
      try {
        const response = await dispatch('request', {
          url: `/api/auth/email/${email}`,
        }); // true | false
        return response;
      } catch (error) {
        console.log('testUserByEmail error:', error);
        throw error;
      }
    },
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
        dispatch('addAlertMessage', {
          text: error.message,
          type: 'danger',
          caption: 'loginUser error',
        });
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
    async getUser({ dispatch }, uuid) {
      try {
        const user = await dispatch('request', {
          url: `/api/auth/user/${uuid}`,
          method: 'GET',
        }); // повертає 200 user = { uuid: user.uuid, email: user.email, user_name: user.user_name, role: user.role, avatar: avatar } || {}
        return user;
      } catch (error) {
        console.log('getUser error:', error);
        throw error;
      }
    },
    async getProfile({ dispatch }, uuid) {
      try {
        const profile = await dispatch('request', {
          url: `/api/auth/profile/${uuid}`,
          method: 'GET',
        });
        return profile;
      } catch (error) {
        console.log('getProfile error:', error);
        throw error;
      }
    },
    async uploadAvatar({ dispatch }, formData) {
      try {
        const result = await dispatch('request', {
          url: '/api/auth/avatar/upload/',
          method: 'POST',
          body: formData,
        });
        return result;
      } catch (error) {
        console.log('uploadAvatar error: ', error);
        throw error;
      }
    },
    async updateCurrentUser(
      { state, dispatch, commit },
      { user_name, description, avatarFileName }
    ) {
      try {
        if (!state.currentUser) {
          throw new Error(
            'Оновлення профілю можливо тільки для зареєстрованих користувачів.'
          );
        }
        const uuid = state.currentUser.uuid;
        /**
         * @const result {{uuid: uuid, user_name: string, description: string, avatar: buffer}}
         */
        const result = await dispatch('request', {
          url: `/api/auth/profile/${uuid}`,
          method: 'PUT',
          body: { user_name, description, avatarFileName },
          headers: {
            'Content-Type': 'application/json',
          },
        });

        commit('updateProfile', {
          user_name: result.user_name,
          description: result.description,
          avatar: result.avatar,
        });
      } catch (error) {
        console.log('updateProfile error: ', error);
        throw error;
      }
    },
  },
};
