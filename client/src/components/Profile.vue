<template>
  <div class="profile-container" :class="{ active: isActive }">
    <div class="card">
      <div class="close" @click="closeForm">
        <font-awesome-icon icon="times" size="lg" />
      </div>
      <div class="card-header">
        <h4 class="card-title">Профіль</h4>
      </div>
      <form action="" class="profile-form" @submit.prevent="submitForm">
        <div class="card-body">
          <my-input
            class="login-input"
            type="text"
            placeholder="Ім'я"
            layout="horizontal-left"
            v-model="userName"
          />
          <div class="avatar">
            <label for="avatar-file" class="btn">Вибрати файл</label>
            <p>{{ avatarFileName }}</p>
            <input
              type="file"
              id="avatar-file"
              accept="image/png"
              @change="uploadAvatar($event)"
              ref="avatar-file"
            />
          </div>
        </div>
        <div class="card-footer">
          <my-button caption="Записати" class="btn" btn-type="submit" />
          <my-button
            caption="Відмова"
            class="btn-link"
            id="btn-cancel"
            @click.native="closeForm"
          />
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { promiseReadAsArrayBuffer } from '../util/promiseFileReader.js';
export default {
  name: 'Profile',
  props: ['isActive'],
  data: () => ({
    avatar: '',
    userName: '',
    file: null,
  }),
  computed: {
    avatarFileName() {
      return this.avatar ? this.avatar : 'Файл не обрано';
    },
    user() {
      const user = this.$store.state.user ? this.$store.state.user : {};
      return user;
    },
  },
  watch: {
    user() {
      this.userName = this.user.user_name ? this.user.user_name : '';
    },
  },
  methods: {
    uploadAvatar(event) {
      try {
        //const formData = new FormData();
        const fileField = event.target;
        if (fileField.files && fileField.files.length > 0) {
          //formData.append('avatar', fileField.files[0]);

          const file = fileField.files[0];
          const fileSize = file.size;
          if (fileSize > 10240) {
            throw new Error('Розмір файлу не повинен перевищувати 10к.');
          }
          this.avatar = file.name;
          this.file = file;
        } else {
          this.avatar = '';
        }
      } catch (error) {
        console.log('upload avatar error: ', error);
        this.$store.dispatch('addAlertMessage', {
          text: error.message,
          type: 'danger',
          caption: 'upload avatar error',
        });
      }
    },
    async submitForm() {
      const data = {
        userName: this.userName,
      };
      const socket = this.$store.state.socket;
      try {
        if (!socket || !socket.connected) {
          throw new Error("відсутнє з'єднання.");
        }
        if (this.file) {
          data.avatar = await promiseReadAsArrayBuffer(this.file);
        }
        //console.dir(data);
        socket.emit('update user', data);
      } catch (error) {
        console.log('submit form error: ', error);
        this.$store.dispatch('addAlertMessage', {
          text: error.message,
          type: 'danger',
          caption: 'submit form error',
        });
      }
    },
    closeForm() {
      this.userName = '';
      this.avatar = '';
      this.file = null;
      console.log(this.$refs);
      this.$refs['avatar-file'].value = '';
      this.$emit('close');
    },
  },
};
</script>

<style scoped>
.btn {
  color: #ffffff;
  background-color: #00a35c;
  font-size: 1.8rem;
  border-radius: 0.5rem;
  border: none;
  padding: 1.2rem 1.8rem !important;
  font-weight: 600 !important;
  margin-bottom: 1rem;
}
.btn-link {
  color: #00a35c;
  background: none;
  font-size: 1.8rem;
  border-radius: 0.5rem;
  border: none;
  padding: 1.2rem 1.8rem !important;
  font-weight: 600 !important;
}
.close {
  position: absolute;
  color: #e9ecef;
  background-color: none;
  right: 0.5rem;
  top: 0.5rem;
  width: 21px;
  height: 21px;
  text-align: center;
  cursor: pointer;
}
#avatar-file {
  display: none;
}
.avatar {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
}
</style>
