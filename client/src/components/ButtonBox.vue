<template>
  <div class="chat-box">
    <my-tool-bar class="tool-bar">
      <p class="info">контакт: {{ contactName }}</p>
    </my-tool-bar>
    <div class="message-list" ref="messages">
      <div class="messages-wrapper">
        <div class="buttons">
          <my-button
            icon-name="handshake"
            class="btn"
            @click.native="newChat"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: [],
  data: function () {
    return {};
  },
  computed: {
    contact() {
      return this.$store.state.contact;
    },
    contactName() {
      const contact = this.$store.state.contact;
      const name =
        contact && contact.user_name ? contact.user_name : 'не визначено';
      return name;
    },
  },
  mounted() {},
  updated() {},
  methods: {
    newChat() {
      if (this.contact) {
        this.$store.dispatch('newChat', this.contact.id);
      }
      this.$router.push({
        path: '/',
      });
    },
  },
  components: {},
};
</script>

<style scoped>
.chat-box {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
  color: #373a3c;
  flex-grow: 1;
}
.message-list {
  flex-grow: 1;
  overflow: auto;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
.btn {
  background: none;
  color: #dee2e6;
  border: 1px solid #dee2e6;
}
.btn:hover {
  color: #fff;
  border: 1px solid #fff;
}
.messages-wrapper {
  height: auto;
  padding: 1.5rem 0;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
.buttons {
  background: #00a36c;
  padding: 1rem 0.6rem;
}
.info {
  color: #fff;
}
</style>
