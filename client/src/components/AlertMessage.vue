<template>
  <div class="alert-message" :class="messageClass(message.type)">
    <div class="close" @click="closeMessage">
      <font-awesome-icon icon="times" size="lg" />
    </div>
    <div class="alert-title">{{ message.caption }}</div>
    <div class="alert-body">{{ message.text }}</div>
  </div>
</template>

<script>
export default {
  name: 'AlertMessage',
  props: { message: Object, showTime: Number },
  computed: {},
  mounted() {
    if (this.showTime && this.showTime > 0 )
    setTimeout(() => {
      this.closeMessage();
    }, this.showTime)
  },
  methods: {
    messageClass(type) {
      return 'alert-' + type;
    },
    closeMessage() {
      this.$emit('close-message', this.message.id);
    },
  },
};
</script>

<style scoped>
.alert-message {
  position: relative;
  width: 100%;
  background-color: #f5f5f5;
  margin: 0 0 0.5rem 0;
  color: rgb(0, 0, 0);
  transition: 1s opacity;
}
.alert-title {
  font-size: 1.2em;
  margin-bottom: 1rem;
  background-color: rgba(0, 0, 0, 0.2);
  padding: 1rem;
}
.alert-body {
  padding: 1rem;
}
.close {
  position: absolute;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.01);
  right: 1rem;
  top: 1rem;
  width: 21px;
  height: 21px;
  text-align: center;
  cursor: pointer;
}
.alert-warning {
  color: #fff;
  background-color: rgb(233, 144, 2);
}
.alert-danger {
  color: #fff;
  background-color: rgb(240, 65, 36);
}
.alert-success {
  color: #fff;
  background-color: rgb(67, 172, 106);
}
.alert-info {
  color: #fff;
  background-color: rgb(91, 192, 222);
}
</style>
