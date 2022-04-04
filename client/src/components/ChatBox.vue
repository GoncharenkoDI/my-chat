<template>
  <div class="chat-box">
    <my-tool-bar> <p>toolbar</p> </my-tool-bar>
    <div class="message-list" ref="messages">
      <div class="messages-wrapper">
        <Message
          v-for="message in messages"
          :key="message.id"
          :message="message"
        />
      </div>
    </div>
    <my-tool-bar>
      <form class="form" action="#" @submit.prevent="formSubmit">
        <my-input
          placeholder="Повідомлення"
          v-model="text"
          layout="inline"
          :disabled="!enabledSend"
        />
        <my-button
          icon-name="paper-plane"
          class="btn"
          btn-type="submit"
          :disabled="!enabledSend"
        />
      </form>
    </my-tool-bar>
  </div>
</template>

<script>
import Message from '@/components/Message.vue';
export default {
  props: [],
  data: function() {
    return {
      text: ''
    };
  },
  computed: {
    name() {
      return this.$store.state.user.user_name;
    },
    messages() {
      return this.$store.state.messages;
    },
    socket() {
      return this.$store.state.socket;
    },
    room() {
      return this.$store.state.room;
    },
    user() {
      return this.$store.state.user;
    },
    enabledSend() {
      const hasRoom = Object.keys(this.room).length;
      const hasUser = Object.keys(this.user).length;
      return hasRoom && hasUser;
    }
  },
  mounted() {
    this.scrollToEnd();
  },
  updated() {
    this.scrollToEnd();
  },
  methods: {
    formSubmit() {
      const text = this.text;
      this.sendMessage(text);
      this.text = '';
    },
    sendMessage(text) {
      console.log(`повідослення з текстом ${text} відправлено.`);
      this.$store.dispatch('sendMessage', text);
    },
    scrollToEnd() {
      var content = this.$refs.messages;
      content.scrollTop = content.scrollHeight;
    }
  },
  components: { Message }
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
.form {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  height: 100%;
  width: 100%;
}
.messages-wrapper {
  height: auto;
  padding: 1.5rem 0;
}
</style>
