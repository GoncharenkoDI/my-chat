<template>
  <div class="left-side" :class="{ active: isActive }">
    <my-tool-bar class="tool-bar">
      <my-button caption="список чатів" class="btn" @click.native="goHome" />
    </my-tool-bar>
    <div class="contact-list">
      <p v-if="contactsCount === 0">Доступні контакти відсутні</p>
      <div v-else class="contacts">
        <div
          v-for="contact in contacts"
          :key="contact.id"
          class="contact"
          :class="{ active: isActiveContact(contact.id) }"
          @click.prevent="setActiveContact(contact.id)"
        >
          <img :src="`avatars/${contact.avatar}`" alt="А" />
          <p>{{ contact.user_name }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Contacts',
  props: { isActive: Boolean },
  computed: {
    contacts() {
      return this.$store.state.contacts;
    },
    contactsCount() {
      return this.$store.state.contacts.length;
    },
  },
  methods: {
    isActiveContact(id) {
      return this.$store.state.contact.id === id;
    },
    setActiveContact(id) {
      this.$store.dispatch('setActiveContact', id);
    },
    goHome() {
      this.$router.push({
        path: '/',
      });
    },
  },
  components: {},
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
