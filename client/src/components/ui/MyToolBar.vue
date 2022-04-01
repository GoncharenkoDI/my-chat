<template>
  <div class="toolbar">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'my-tool-bar',
};
</script>

<style lang="scss" scoped>
.toolbar {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  height: 4.8rem !important;
  padding: 0.5rem 1rem;
  background: #2780e3;
}
</style>
