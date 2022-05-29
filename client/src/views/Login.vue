<template>
  <div class="login">
    <alert-container />
    <div class="card">
      <div class="card-header">
        <h4 class="card-title">Vue-chat</h4>
      </div>
      <form action="" class="login-form" @submit.prevent="submitForm">
        <div class="card-body">
          <my-input
            class="login-input"
            type="text"
            placeholder="Логін"
            layout="horizontal-left"
            label-width="10rem"
            v-model="login"
          />
          <my-input
            class="login-input"
            type="password"
            placeholder="Пароль"
            layout="horizontal-left"
            label-width="10rem"
            v-model="password"
          />
        </div>
        <div class="card-footer">
          <my-button caption="Приєднатися" class="btn" btn-type="submit" />
          <div class="register">
            <label for="btn-register" class="label-link">
              Не маєте акаунту?
            </label>
            <my-button
              caption="Реєстрація"
              class="btn-link"
              id="btn-register"
              @click.native="registerClick"
            />
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import AlertContainer from '../components/AlertContainer.vue';
export default {
  components: { AlertContainer },
  name: 'Login',
  data() {
    return {
      login: '',
      password: '',
    };
  },
  methods: {
    async submitForm() {
      try {
        await this.$store.dispatch('loginUser', {
          login: this.login,
          password: this.password,
        });
        this.login = '';
        this.password = '';
        this.$router.push({
          path: '/',
        });
      } catch (error) {
        this.$store.dispatch('addAlertMessage', {
          text: error.message,
          type: 'danger',
          caption: 'loginUser error',
        });
      }
    },
    registerClick() {
      this.$router.push({
        path: '/register',
      });
    },
  },
};
</script>

<style scoped>
.btn {
  color: #ffffff;
  background-color: #00a35c;
  font-size: 1.8rem;
  border-radius: 0.5rem;
  border: none;
  padding: 1.2rem 1.8rem !important;
  font-weight: 600 !important;
}
.btn-link {
  color: #00a35c;
  border: 2px solid #00a35c;
  font-size: 1.8rem;
  border-radius: 0.5rem;
  padding: 1.2rem 1.8rem !important;
  font-weight: 600 !important;
}
</style>
