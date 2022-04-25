<template>
  <div
    class="alert-message"
    :class="messageClass(message.type)"
    >
    <div class="close"><font-awesome-icon :icon="times" size="lg" /></div>
    <div class="alert-title">{{ message.caption }}</div>
    <div class="alert-body">{{ message.text }}</div>
  </div>
</template>

<script>
export default {
  name: 'AlertMessage',
  props: { message: Object },
  computed: {

  },
  methods: {
    messageClass(type) {
      return 'alert-'+type;
    }
  },
};
</script>

<style scoped>
.alert-message {
  position: relative;
  width: 100%;
  background-color: #f5f5f5;
  margin: 0 0 0.5rem 0;
  color: #fff;
}
.close {
  position: absolute;
  background-color: rgba(0, 0, 0, 0.2);
  right: 100%;
  top: 0;
}
.alert-warning {
  background-color: rgb(233, 144, 2);
}
.alert-danger {
  background-color: rgb(240, 65, 36);
}
.alert-success {
  background-color: rgb(67, 172, 106);
}
.alert-info {
  background-color: rgb(91, 192, 222);
}
</style>
