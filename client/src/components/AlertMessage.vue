<template>
  <div class="alert-message">
    <div class="alert-title">{{ message.caption }}</div>
    <div class="alert-body">{{ message.text }}</div>
  </div>
</template>

<script>
export default {
  name: 'AlertMessage',
  props: { message: Object },
};
</script>

<style scoped>
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
