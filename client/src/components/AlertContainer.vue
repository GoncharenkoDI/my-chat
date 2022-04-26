<template>
  <div class="alert-container" v-if="isShow">
    <alert-message
      v-for="message in alertMessages"
      :key="message.id"
      :message="message"
      :show-time="showTime"
      @close-message="closeMessage"
    />
  </div>
</template>

<script>
import AlertMessage from '@/components/AlertMessage.vue';
export default {
  name: 'AlertContainer',
  data: () => ({}),
  computed: {
    isShow() {
      return this.alertMessages && this.alertMessages.length > 0;
    },
    showTime() {
      return this.$store.state.alertShowTime;
    },
    alertMessages() {
      return this.$store.state.alertMessages;
    },
  },
  methods: {
    closeMessage(id) {
      this.$store.dispatch('removeAlertMessage', id);
    },
  },
  components: { AlertMessage },
};
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
