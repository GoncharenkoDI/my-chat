<template>
  <div class="wrapper">
    <div class="navbar">
      <div>
        <my-button
          id="active-switch"
          :icon-name="iconName"
          class="btn"
          @click.native="changeLeftActive"
        />
      </div>
      <div class="user-info" @click="showProfile">
        <img :src="'avatars/' + avatarName" alt="А" />
        <p>{{ userName }}</p>
      </div>
      <div>
        <my-button
          icon-name="sign-out-alt"
          class="btn"
          @click.native="logout"
        />
      </div>
    </div>
    <div v-if="!socket">Ви не під'єднані до програми</div>
    <div v-else class="main-content">
      <alert-container />
      <LeftSide :isActive="isActive" />
      <ChatBox />
    </div>
    <profile :isActive="isShowProfile" @close="closeProfile" />
  </div>
</template>

<script>
import ChatBox from '@/components/ChatBox.vue';
import LeftSide from '@/components/LeftSide.vue';
import AlertContainer from '@/components/AlertContainer.vue';
import Profile from '@/components/Profile.vue';

export default {
  data: () => ({
    isJoin: false,
    isActive: true,
    isShowProfile: false,
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
    },
    avatarName() {
      const user = this.$store.state.user ? this.$store.state.user : {};
      return user.avatar ? user.avatar : '';
    },
  },
  watch: {
    connectionError() {
      if (this.connectionError === 'unauthorized') {
        this.$router.push({ path: '/login' });
      }
    },
    room() {
      this.isActive = false;
    },
  },
  async mounted() {
    console.log('mounted');
    if (!this.socket) {
      await this.$store.dispatch('newConnection');
    }
    console.log(`this.room - ${JSON.stringify(this.room)}`);
    if (Object.keys(this.room).length !== 0) {
      console.log('change room on mounted');
      this.$store.dispatch('changeRoom', this.room.id);
    }
  },
  methods: {
    changeLeftActive() {
      this.isActive = !this.isActive;
    },
    async logout() {
      await this.$store.dispatch('logout');
      this.$router.push({
        path: '/login',
      });
    },
    closeProfile() {
      this.isShowProfile = false;
    },
    showProfile() {
      this.isShowProfile = true;
    },
  },
  components: { ChatBox, LeftSide, AlertContainer, Profile },
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
.user-info {
  cursor: pointer;
  color: #fff;
}
</style>
