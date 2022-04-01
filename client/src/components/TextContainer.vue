<template>
  <div class="textContainer">
    <div>
      <h1>People currently chatting:</h1>
      <div class="activeContainer">
        <h2>
          <div v-for="user in users" :key="user.id" class="activeItem">
            {{ user.name }}
            <img alt="Online Icon" src="../assets/img/closeIcon.png" />
          </div>
        </h2>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['users'],
};
</script>

<style scoped>
.textContainer {
  display: flex;
  flex-direction: column;
  margin-left: 100px;
  color: white;
  height: 60%;
  justify-content: space-between;
}

.activeContainer {
  display: flex;
  align-items: center;
  margin-bottom: 50%;
}

.activeItem {
  display: flex;
  align-items: center;
}

.activeContainer img {
  padding-left: 10px;
}

.textContainer h1 {
  margin-bottom: 0px;
}

@media (min-width: 320px) and (max-width: 1200px) {
  .textContainer {
    display: none;
  }
}
</style>
