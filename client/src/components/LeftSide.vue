<template>
  <div class="left-side" :class="{ active: isActive }">
    <my-tool-bar class="tool-bar">
      <my-button
        caption="список користувачів"
        class="btn"
        @click.native="goContacts"
      />
    </my-tool-bar>
    <div class="room-list">
      <p v-if="roomsCount === 0">Ви не зареєстровані в жодній кімнаті</p>
      <div v-else class="contacts">
        <p
          v-for="room in $store.state.rooms.values()"
          :key="room.room_id"
          class="room"
          :class="{ active: isActiveRoom(room.room_id) }"
          @click.prevent="changeRoom(room.room_id)"
        >
          {{ room.room_name }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
// import MyToolBar from '@/components/ui/MyToolBar.vue';
// import MyInput from '@/components/ui/MyInput.vue';
// import MyButton from '@/components/ui/MyButton.vue';
export default {
  name: 'LeftSide',
  props: { isActive: Boolean },
  computed: {
    rooms() {
      //if (this.$store.state.rooms && this.$store.state.rooms.length > 0) {
      return this.$store.state.rooms;
      // } else {
      //   return [];
      // }
    },
    roomsCount() {
      return this.rooms.length;
    },
  },
  methods: {
    isActiveRoom(roomId) {
      return roomId && this.$store.state.room.room_id === roomId;
    },
    changeRoom(id) {
      this.$store.dispatch('changeRoom', id);
    },
    goContacts() {
      this.$router.push({
        path: '/contacts',
      });
    },
    getRooms() {
      if (this.$store.state.rooms && this.$store.state.rooms.length > 0) {
        return this.$store.state.rooms;
      } else {
        return [];
      }
    },
  },
  components: {
    /*MyToolBar, MyInput, MyButton*/
  },
};
</script>

<style lang="scss" scoped>
.btn {
  background: none;
  color: #dee2e6;
  border: 1px solid #dee2e6;
  width: 100%;
}
.btn:hover {
  color: #fff;
  border: 1px solid #fff;
}
</style>
