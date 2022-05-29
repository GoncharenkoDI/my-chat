<template>
  <div v-if="isSentByCurrentUser" class="messageContainer justifyEnd">
    <p class="sentText pr-10"></p>
    <div class="messageBox backgroundBlue">
      <p class="messageText colorWhite">{{ this.message.text }}</p>
    </div>
  </div>
  <div v-else class="messageContainer justifyStart">
    <div class="messageBox backgroundLight">
      <p class="messageText colorDark">{{ this.message.text }}</p>
    </div>
    <p class="sentText pr-10"></p>
  </div>
</template>

<script>
export default {
  name: 'Message',
  props: ['message'],
  computed: {
    isSentByCurrentUser() {
      return this.$store.state.user.id === this.message.author;
    },
    authorName() {
      if (this.isSentByCurrentUser) {
        return 'від мене';
      }
      return `від ${this.message.user_name}`;
    },
  },
};
</script>

<style scoped>
.messageBox {
  background: #f3f3f3;
  border-radius: 5px;
  padding: 5px 20px;
  color: white;
  display: inline-block;
  max-width: 80%;
}

.messageText {
  width: 100%;
  letter-spacing: 0;
  float: left;
  font-size: 1.1em;
  word-wrap: break-word;
}

.messageText img {
  vertical-align: middle;
}

.messageContainer {
  display: flex;
  justify-content: flex-end;
  padding: 0 5%;
  margin-top: 3px;
}

.sentText {
  display: flex;
  align-items: center;
  font-family: Helvetica;
  color: #828282;
  letter-spacing: 0.3px;
}

.pl-10 {
  padding-left: 10px;
}

.pr-10 {
  padding-right: 10px;
}

.justifyStart {
  justify-content: flex-start;
}

.justifyEnd {
  justify-content: flex-end;
}

.colorWhite {
  color: white;
}

.colorDark {
  color: #353535;
}

.backgroundBlue {
  background: #00a36c;
}

.backgroundLight {
  background: #f3f3f3;
}
</style>
