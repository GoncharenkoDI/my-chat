<template>
  <div class="login">
    <div class="card">
      <div class="card-header">
        <h4 class="card-title">Зареєструватися в vue-chat</h4>
      </div>
      <form action="" class="register-form" @submit.prevent="submitForm">
        <div class="card-body">
          <my-input
            class="login-input"
            type="text"
            placeholder="login"
            label="login"
            layout="horizontal-left"
            label-width="10rem"
            v-model="login"
          />
          <my-input
            class="login-input"
            type="text"
            placeholder="ім'я"
            label="ім'я"
            layout="horizontal-left"
            label-width="10rem"
            v-model="username"
          />
          <my-input
            class="login-input"
            type="password"
            label="password"
            placeholder="password"
            layout="horizontal-left"
            label-width="10rem"
            v-model="password"
          />
        </div>
        <div class="card-footer">
          <my-button
            caption="Зареєструватися"
            icon-name="user-secret"
            class="btn"
            btn-type="submit"
          />
          <my-button
            caption="Приєднатися"
            icon-name="key"
            class="btn-link"
            @click.native="loginClick"
          />
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      login: '',
      password: '',
      username: ''
    };
  },
  methods: {
    async submitForm() {
      await this.$store.dispatch('registerUser', {
        login: this.login,
        password: this.password,
        username: this.username
      });
      this.login = '';
      this.password = '';
      this.username = '';
      this.$router.push({
        path: '/'
      });
    },
    loginClick() {
      this.$router.push({
        path: '/login'
      });
    }
  }
};
</script>

<style scoped>
.login {
  width: 100%;
  height: 100%;
  display: flex;
  background: white;
  color: #373a3c;
  justify-content: center;
  align-items: center;
}
.card {
  display: flex;
  flex-direction: column;
  border: 1px solid #2fa4e7;
  width: 32rem;
}
.card-header {
  padding: 1rem;
  border-bottom: 1px solid #2fa4e7;
  text-align: center;
  background: #e9ecef;
}
.card-title {
  font-size: 1.2;
  color: #2fa4e7;
}
.card-body {
  padding: 0.5rem 1rem;
}
.login-input {
  margin-bottom: 1rem;
}
.card-footer {
  padding: 1rem;
  border-top: 1px solid #2fa4e7;
  background: #e9ecef;
}
.btn {
  color: #2fa4e7;
  border-color: #2fa4e7;
}
.btn-link {
  color: #2fa4e7;
  border: none;
}
</style>
