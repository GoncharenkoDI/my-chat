<template>
  <div class="wrapper">
    <div class="navbar">
      <div>
        <my-button
          :icon-name="iconName"
          class="btn"
          @click.native="changeLeftActive"
        />
      </div>
      <p class="user-info"> Користувач: {{ userName }}</p>
      <div>
        <my-button icon-name="user" class="btn" @click.native="logout" />
      </div>
    </div>
    <div v-if="!socket">Ви не під'єднані до програми</div>
    <div v-else class="main-content">
      <LeftSide :isActive="isActive" />
      <ChatBox />
    </div>
  </div>
</template>

<script>
// import MyToolBar from '@/components/ui/MyToolBar.vue';
import ChatBox from '@/components/ChatBox.vue';
import LeftSide from '@/components/LeftSide.vue';
// import MyButton from '@/components/ui/MyButton.vue';

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
    room() {
      return this.$store.state.room;
    },
    userName() {
      const user = this.$store.state.user ? this.$store.state.user : {};
      return user.user_name ? user.user_name : '';
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
    console.log('mounted');
    this.$store.dispatch('newConnection');
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
  components: { ChatBox, LeftSide }
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
.user-info{
  color: #fff;
}
</style>
