<template>
  <textarea
    :id="field.model"
    :placeholder="field.placeholder || ''"
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
    rows="5"
  ></textarea>
</template>

<script setup>
const props = defineProps({
  field: { type: Object, required: true },
  modelValue: { type: String, default: "" },
});

const emit = defineEmits(["update:modelValue"]);
</script>

<style scoped>
textarea {
  width: 100%;
  border: 1px solid #cbd5e1;
  padding: 10px;
  border-radius: 8px;
  font: inherit;
  resize: vertical;
}
textarea:focus {
  outline: 2px solid #93c5fd;
}
</style>
