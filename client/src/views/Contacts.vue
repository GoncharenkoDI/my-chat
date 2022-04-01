<template>
  <div class="wraper">
    <div class="navbar">
      <div>
        <my-button
          :icon-name="iconName"
          class="btn"
          @click.native="changeLeftActive"
        />
      </div>
      <div>
        <my-button icon-name="user" class="btn" @click.native="logout" />
      </div>
    </div>
    <div v-if="!socket">Ви не під'єднані до програми</div>
    <div v-else class="main-content">
      <ContactList :isActive="isActive" />
      <ButtonBox />
    </div>
  </div>
</template>

<script>
import ContactList from '../components/ContactList.vue';
import ButtonBox from '../components/ButtonBox.vue';
export default {
  data: () => ({
    isJoin: false,
    isActive: true
  }),
  created() {},

  computed: {
    iconName() {
      return this.isActive ? 'chevron-left' : 'chevron-right';
    },
    socket() {
      return this.$store.state.socket;
    },
    connectionError() {
      return this.$store.state.connectionError;
    },
    user() {
      return this.$store.state.user;
    }
  },
  watch: {
    connectionError() {
      if (this.connectionError === 'unauthorized') {
        this.$router.push({ path: '/login' });
      }
    },
    room() {
      this.isActive = false;
    }
  },
  async mounted() {
    const socket = this.socket;
    const user = this.user;
    console.dir({ socket, user });
    if (socket && Object.keys(user).length !== 0) {
      socket.emit('contacts', user.id);
    }
  },
  methods: {
    changeLeftActive() {
      this.isActive = !this.isActive;
    },
    async logout() {
      await this.$store.dispatch('logout');
      this.$router.push({
        path: '/login'
      });
    }
  },
  components: { ButtonBox, ContactList }
};
</script>

<style scoped>
.btn {
  background: none;
  color: #dee2e6;
  border: 1px solid #dee2e6;
}
.btn:hover {
  color: #fff;
  border: 1px solid #fff;
}
</style>
