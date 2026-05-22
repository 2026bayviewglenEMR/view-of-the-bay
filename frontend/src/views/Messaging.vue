<template>
  <MainLayout>
    <div class="chat-page">
      <div class="messages-container" ref="messagesContainer">
        <div 
          v-for="msg in pastMessages" 
          :key="msg.id" 
          class="message-wrapper"
          :class="msg.senderId === currentUser ? 'sent' : 'received'"
        >
          <div class="message">
            <strong>{{ msg.senderId }} to {{ msg.receiverId }}</strong>
            <p v-if="msg.content">{{ msg.content }}</p>

            <div v-if="msg.attachment" class="attachment">
              <a :href="msg.attachmentUrl" target="_blank"> {{ msg.attachment.name }} </a>
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

        <div v-if="selectedFile" class="selected-file">
          <span> Selected: {{ selectedFile.name }} </span>
          <el-button type="danger" size="small" @click="removeFile"> Cancel </el-button>
        </div>
      </div>

    </div>
  </MainLayout>
</template>


<script setup>
import { api } from './../api/api.js'
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '../components/MainLayout.vue'

const router = useRouter()
const currentUser = "user_123"
const message = ref("")
const selectedFile = ref(null)
const messagesContainer = ref(null)

// loadMessages route to get
const pastMessages = ref([
  {
    id: 1,
    senderId: "user_123",
    receiverId: "doctor_01",
    content: "random text message"
  },
  {
    id: 2,
    senderId: "doctor_01",
    receiverId: "user_123",
    content: "Oh look, here's a wonderful generic reply to you kind sir"
  },
  {
    id: 3,
    senderId: "user_123",
    receiverId: "doctor_01",
    content: "Thank you for your extraordinary space filler comment!"
  }
])

// route for this, post, will write actual thing later
const sendMessage = async () => {
  if (message.value.trim() === "" && selectedFile.value === null) {
    return
  }

  try {
    pastMessages.value.push({
      id: Date.now(),
      senderId: currentUser,
      receiverId: "doctor_01",
      content: message.value,
      isRead: true,
      attachment: selectedFile.value,
      attachmentUrl: selectedFile.value ? URL.createObjectURL(selectedFile.value.raw) : null,
      timestamp: 0
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

const removeFile = () => {
  selectedFile.value = null
}
</script>


<style scoped>
.chat-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.messages-container {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  min-height: 0;
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

.selected-file {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}
</style>