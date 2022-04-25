<template>
  <div class="alert-container" v-if="isShow">
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
  name: 'AlertContainer',
  data: () => ({
    showTime: 5000,
    alertMessages: [
      {id: 1, text: 'info message', type: 'info', caption: 'заголовок'},
      {id: 2, text: 'warning message', type: 'warning', caption: 'заголовок'},
      {id: 3, text: 'info message', type: 'info', caption: 'заголовок'},
      {id: 4, text: 'error message', type: 'error', caption: 'заголовок'},
      {id: 5, text: 'error message', type: 'error', caption: 'заголовок'},
      {id: 6, text: 'info message info message info message info message info message info message info message', type: 'info', caption: 'заголовок'},
      {id: 7, text: 'info message', type: 'info', caption: 'заголовок'},
    ]
  }),
  computed: {
    isShow() {
      return (this.alertMessages && this.alertMessages.length > 0 )
    }
  },
  components: { AlertMessage },
}
</script>

<style scoped>
.alert-container {
  position: absolute;
  width: 33.333333%;
  top: 0;
  right: 0;
  max-height: 100%;
  overflow: hidden;
  z-index: 2000;
}
</style>
