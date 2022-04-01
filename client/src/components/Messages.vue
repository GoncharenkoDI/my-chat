<template>
  <div class="messages" ref="messages">
    <Message
      v-for="message in messages"
      :key="message.id"
      :message="message"
      :name="name"
    />
  </div>
</template>

<script>
import Message from '../components/Message.vue';
export default {
  name: 'Messages',
  props: ['name', 'messages'],
  mounted() {
    this.scrollToEnd();
  },
  updated() {
    this.scrollToEnd();
  },
  watch: {
    messagesCount() {
      this.scrollToEnd();
    },
  },
  computed: {
    messagesCount() {
      return this.messages.length;
    },
  },
  methods: {
    scrollToEnd() {
      var content = this.$refs.messages;
      content.scrollTop = content.scrollHeight;
    },
  },
  components: { Message },
};
</script>

<style scoped>
.messages {
  padding: 5% 0;
  overflow: auto;
  flex: auto;
}
</style>
