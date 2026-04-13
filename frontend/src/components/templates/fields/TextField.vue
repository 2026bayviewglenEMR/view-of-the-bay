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
  border: 1px solid #cbd5e1;
  padding: 10px;
  border-radius: 8px;
  font: inherit;
}
input:focus {
  outline: 2px solid #93c5fd;
}
</style>
