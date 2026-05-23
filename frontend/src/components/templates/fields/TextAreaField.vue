<template>
  <textarea v-model="model" class="textarea" placeholder="Enter notes..." :readonly="readonly"></textarea>
</template>

<script setup>
defineProps({
  readonly: Boolean
});
const model = defineModel();
</script>

<style scoped>
.textarea {
  width: 100%;

  min-height: 120px;

  padding: 14px;

  border: 2px solid #d0d0d0;
  border-radius: 10px;

  font-size: 16px;
  font-family: inherit;

  resize: vertical;

  box-sizing: border-box;

  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.textarea:focus {
  outline: none;

  border-color: #4f8cff;

  box-shadow: 0 0 0 3px rgba(79, 140, 255, 0.15);
}
</style>