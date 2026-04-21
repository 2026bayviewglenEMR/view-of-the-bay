<template>
  <div>
    <p>load past messages here</p>

    // ignore this, had to commit to pull
    <el-table :data="pastMessages" style="width: 100%">
      <el-table-column prop="sender" label="" />
      <el-table-column prop="age" label="Age" />
      <el-table-column prop="city" label="City" />
    </el-table> 
  </div>

  <div class="input-bar">
    <el-form>
      <el-form-item class="receiver-input">
        <el-select v-model="receiver" placeholder="Select user">
          <el-option
            v-for="u in users"
            :key="u.value"
            :label="u.label"
            :value="u.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item class="message-input">
        <el-input v-model="message" type="textarea" placeholder="Type message here" />
      </el-form-item>

      <el-button @click="sendMessage" type="primary">Send</el-button>
    </el-form>
  </div>
</template>

<script setup>
import { api } from './../api/api.js';
import { ref, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter()
const scrollbarRef = ref(null)
const message = ref("")
const pastMessages = ref([
  {value: "message content", sender:"user_123", receiver: "doctor_01"},
  {value: "message content", sender:"user_123", receiver: "doctor_01"},
])
const users = ref([
  {value: "user_123", label: "user_123"},
  {value: "doctor_01", label: "doctor_01"}
])
const receiver = ref("")


const sendMessage = async () => {
  try {
    const res = await api.sendMessage("user_123", "doctor_01", message.value);
    console.log("Message sent!", res);
    message.value = ""; // clear the input after sending
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
  }
  .receiver-input {
    width: 200px;
    margin-bottom: 10px;
  }
  .message-input {
    width: 600px;
    margin-bottom: 10px;
  }
</style>