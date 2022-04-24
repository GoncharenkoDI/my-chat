<template>
  <div class="alert-container">
    <alert-message
      v-for="message in alertMessages"
      :key="message.id"
      :message="message"
    />
  </div>
</template>

<script>
import AlertMessage from '@/components/AlertMessage.vue'
export default {
  data: () => ({
    showTime: 5000,
    alertMessages = [
      {id: 1, text: 'info message', type: 'info', caption: 'заголовок'},
      {id: 2, text: 'warning message', type: 'warning', caption: 'заголовок'},
      {id: 3, text: 'info message', type: 'info', caption: 'заголовок'},
      {id: 4, text: 'error message', type: 'error', caption: 'заголовок'},
      {id: 5, text: 'error message', type: 'error', caption: 'заголовок'},
      {id: 6, text: 'info message info message info message info message info message info message info message', type: 'info', caption: 'заголовок'},
      {id: 7, text: 'info message', type: 'info', caption: 'заголовок'},
    ]
  }),
  components: { AlertMessage },
}
</script>

<style scoped>
.alert-container {
  position: absolute;
}
</style>
