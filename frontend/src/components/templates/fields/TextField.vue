<template>
  <input
    :id="field.model"
    type="text"
    :placeholder="field.placeholder || ''"
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
  />
</template>

<script setup>
const props = defineProps({
  field: { type: Object, required: true },
  modelValue: { type: [String, Number], default: "" },
});

const emit = defineEmits(["update:modelValue"]);
</script>

<style scoped>
input {
  width: 100%;
  padding: 14px;

  border: 2px solid #d0d0d0;
  border-radius: 10px;

  font-size: 16px;
  font-family: inherit;

  box-sizing: border-box;

  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

input:focus {
  outline: none;

  border-color: #4f8cff;

  box-shadow: 0 0 0 3px rgba(79, 140, 255, 0.15);
}
</style>
