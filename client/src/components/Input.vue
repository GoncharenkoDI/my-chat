<template>
  <form class="form" @submit.prevent="sendMessage">
    <input
      class="input"
      type="text"
      placeholder="Type a message..."
      v-model.trim="text"
    />
    <button class="sendButton" type="submit">Send</button>
  </form>
</template>

<script>
export default {
  name: 'Input',
  data: () => ({
    text: '',
  }),

  methods: {
    sendMessage() {
      const text = this.text;
      this.text = '';
      this.$emit('send-message', text);
    },
  },
};
</script>

<style scoped>
.form {
  display: flex;
  border-top: 1px solid #d3d3d3;
}

.input {
  border: none;
  border-radius: 0;
  padding: 6px 10px;
  width: 80%;
  font-size: 1.2em;
}

input:focus,
textarea:focus,
select:focus {
  outline: none;
}

.sendButton {
  color: #fff !important;
  text-transform: uppercase;
  text-decoration: none;
  background: #2979ff;
  padding: 6px 10px;
  display: inline-block;
  border: none;
  width: 20%;
}
</style>
