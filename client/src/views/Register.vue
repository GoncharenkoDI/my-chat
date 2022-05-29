<template>
  <div class="login">
    <alert-container />
    <div class="card">
      <div class="card-header">
        <h4 class="card-title">Реєстрація</h4>
      </div>
      <form action="" class="register-form" @submit.prevent="submitForm">
        <div class="card-body">
          <my-input
            class="login-input"
            type="text"
            placeholder="Логін"
            layout="horizontal-left"
            v-model="login"
          />
          <my-input
            class="login-input"
            type="text"
            placeholder="Ім'я"
            layout="horizontal-left"
            v-model="username"
          />
          <my-input
            class="login-input"
            type="password"
            placeholder="Пароль"
            layout="horizontal-left"
            v-model="password"
          />
        </div>
        <div class="card-footer">
          <my-button caption="Зареєструватися" class="btn" btn-type="submit" />
          <div class="register">
            <label for="btn-register" class="label-link"> Вже є акаунт? </label>
            <my-button
              caption="Ввійти"
              class="btn-link"
              @click.native="loginClick"
              id="btn-register"
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
      username: '',
    };
  },
  methods: {
    async submitForm() {
      try {
        await this.$store.dispatch('registerUser', {
          login: this.login,
          password: this.password,
          username: this.username,
        });
        this.login = '';
        this.password = '';
        this.username = '';
        this.$router.push({
          path: '/',
        });
      } catch (error) {
        this.$store.dispatch('addAlertMessage', {
          text: error.message,
          type: 'danger',
          caption: 'Register user error',
        });
      }
    },
    loginClick() {
      this.$router.push({
        path: '/login',
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
.register {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  font-size: 1.8rem;
  padding: 2rem 0.5rem 0 0.5rem;
  align-items: center;
}
</style>
