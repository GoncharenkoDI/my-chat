<template>
  <div class="infoBar">
    <div class="leftInnerContainer">
      <img
        class="onlineIcon"
        src="../assets/img/onlineIcon.png"
        alt="online icon"
      />
      <h3>{{ room }}</h3>
    </div>
    <div class="rightInnerContainer">
      <a href="/"><img src="../assets/img/closeIcon.png" alt="close icon" /></a>
    </div>
  </div>
</template>

<script>
export default {
  name: 'InfoBar',
  props: ['room'],
};
</script>

<style scoped>
.infoBar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #2979ff;
  border-radius: 4px 4px 0 0;
  border-bottom: 1px solid #d3d3d3;
  height: 48px;
  width: 100%;
}

.leftInnerContainer {
  flex: 0.5;
  display: flex;
  align-items: center;
  margin-left: 5%;
  color: white;
}

.rightInnerContainer {
  display: flex;
  flex: 0.5;
  justify-content: flex-end;
  margin-right: 5%;
}

.onlineIcon {
  margin-right: 5%;
}
</style>
