<template>
  <div class="my-input">
    <div class="form-control" :class="layout">
      <label
        :class="{ 'label-outline': labelOutline }"
        @click="labelClick"
        ref="label"
        v-if="label && !isInline"
        :style="labelStyle"
      >
        {{ label }}
      </label>
      <input
        :type="inputType"
        ref="input"
        :placeholder="placeholder"
        :value="value"
        @input="$emit('input', $event.target.value)"
      />
    </div>

    <div class helper></div>
  </div>
</template>

<script>
export default {
  name: 'my-input',
  props: [
    'label',
    'placeholder',
    'help-text',
    'value',
    'type',
    'layout',
    'labelWidth',
  ],
  data: () => ({}),
  computed: {
    labelOutline() {
      // const input = this.$refs.input;
      //console.log(Object.keys(this.$refs));
      // (( input === document.activeElement) ||
      // ( input.value !== ''))}
      return true;
    },
    hasLabel() {
      if (this.label) {
        return true;
      } else {
        return false;
      }
    },
    inputType() {
      if (this.type) {
        return this.type;
      }
      return 'text';
    },
    isInline() {
      return this.layout && this.layout === 'inline';
    },
    labelStyle() {
      return 'width:' + this.labelWidth;
    },
  },
  mounted() {},
  methods: {
    labelClick() {
      console.log(this.$refs.input);
      this.$refs.input.focus();
    },
  },
};
</script>

<style lang="scss" scoped>
.my-input {
  width: 100%;
}
.form-control {
  position: relative;
}
.my-input .form-control.horizontal-left {
  display: flex;
  flex-direction: row;
}

.my-input .form-control.horizontal-right {
  display: flex;
  flex-direction: row-reverse;
}

.my-input .form-control.vertical-top {
  display: flex;
  flex-direction: column;
}
.form-control label {
  // position: absolute;
  // left: 1rem;
  margin: 0.2rem 1rem;
}

.label-outline {
  bottom: 0.5rem;
}

.my-input input {
  width: 100%;
  padding: 0.6rem 1rem;
  border: 1px solid #e9ecef;
}

.my-input input:focus {
  outline: none;
  border-bottom: 2px solid #2fa4e7;
}
</style>
