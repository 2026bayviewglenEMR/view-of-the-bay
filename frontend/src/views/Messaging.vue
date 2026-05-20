<template>
  <div class="chat-page">
    <top-bar title="Messages" />

    <div class="messages-container" ref="messagesContainer">
      <div 
        v-for="msg in pastMessages" 
        :key="msg.id" 
        class="message-wrapper"
        :class="msg.sender === currentUser ? 'sent' : 'received'"
      >
        <div class="message">
          <strong>{{ msg.sender }} to {{ msg.receiver }}</strong>
          <p>{{ msg.text }}</p>

          <div v-if="msg.file" class="attachment">
            <a :href="msg.fileUrl" target="_blank"> {{ msg.file.name }} </a>
          </div>
        </div>
      </div>
    </div>

    <div class="input-bar">
      <el-form class="message-form">
        <el-form-item class="message-input">
          <el-input v-model="message" type="textarea" placeholder="Type message here" />
        </el-form-item>

        <el-upload :auto-upload="false" :show-file-list="false" :on-change="handleFileChange">
          <el-button> Attach File </el-button>
        </el-upload>

        <el-button @click="sendMessage" type="primary">Send</el-button>
      </el-form>

      <p v-if="selectedFile"> Selected: {{ selectedFile.name }} </p>
    </div>

  </div>
</template>


<script setup>
import { api } from './../api/api.js'
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import TopBar from '../components/TopBar.vue'

const router = useRouter()
const currentUser = "user_123"
const message = ref("")
const selectedFile = ref(null)
const messagesContainer = ref(null)

// loadMessages route to get
const pastMessages = ref([
  {
    id: 1,
    sender: "user_123",
    receiver: "doctor_01",
    text: "random text message"
  },
  {
    id: 2,
    sender: "doctor_01",
    receiver: "user_123",
    text: "Oh look, here's a wonderful generic reply to you kind sir"
  },
  {
    id: 3,
    sender: "user_123",
    receiver: "doctor_01",
    text: "Thank you for your extraordinary space filler comment!"
  }
])

// route for this, post, will write actual thing later
const sendMessage = async () => {
  if (message.value.trim() === "") {
    return
  }

  try {
    pastMessages.value.push({
      id: Date.now(),
      sender: currentUser,
      receiver: "doctor_01",
      text: message.value,
      file: selectedFile.value,
      fileUrl: selectedFile.value ? URL.createObjectURL(selectedFile.value.raw) : null
    })
    message.value = ""

    await nextTick()
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
  catch (err) {
    console.error("Failed to send message");
  }
}

const handleFileChange = (file) => {
  selectedFile.value = file
}
</script>


<style scoped>
.chat-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.chat-header {
  padding: 16px;
  border-bottom: 1px solid #ccc;
}

.messages-container {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.message-wrapper {
  display: flex;
  margin-bottom: 12px;
}

.sent {
  justify-content: flex-end;
}

.received {
  justify-content: flex-start;
}

.message {
  max-width: 60%;
  padding: 12px;
  border-radius: 8px;
  background: #f4f4f4;
}

.sent .message {
  background: #2D6A4F;
  color: white;
}

.input-bar {
  padding: 16px;
  border-top: 1px solid #ccc;
}

.message-form {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.message-input {
  flex: 1;
  margin-bottom: 0;
}

.attachment {
  margin-top: 8px;
  padding: 8px;
  background: rgba(0,0,0,0.1);
  border-radius: 6px;
  font-size: 14px;
}
</style>