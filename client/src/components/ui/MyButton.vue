<template>
  <button :type="btnType">
    {{ caption }}
    <font-awesome-icon v-if="iconName" :icon="iconName" size="lg" />
  </button>
</template>

<script>
export default {
  name: 'my-button',
  props: {
    caption: {
      type: String,
      default: ''
    },
    iconName: {
      type: String,
      default: ''
    },
    btnType: {
      type: String,
      default: 'button'
    }
  }
};
</script>

<style lang="scss" scoped>
button {
  background: none;
  border: 1px solid green;
  padding: 0.6rem 1rem;
  cursor: pointer;
  margin: 0 0.6rem;
}
button:disabled {
  background: rgba(255, 255, 255, 0.5);
  cursor: default;
}
</style>
