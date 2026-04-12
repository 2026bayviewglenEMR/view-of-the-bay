<template>
  <div>
    <p>load past messages here</p>
  </div>

  <div class="input-bar">
    <el-form>
      <el-form-item>
        <el-input v-model="message" type="textarea" placeholder="Type message here" />
      </el-form-item>

      <el-button @click="sendMessage" type="primary">Send</el-button>
    </el-form>
  </div>
</template>

<script setup>
import { api } from './../api/api.js';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const message = ref("");
const pastMessages = ref([])

const sendMessage = async () => {
  try {
    const res = await api.sendMessage(message.value);
  }
  catch (err) {
    console.error("Failed to send message");
  }
}
</script>

<style scoped>
  .input-bar {
    position: fixed;
    bottom: 0;
    width: 90%;
  }
</style>