<template>
  <MainLayout>
    <div class="chat-page">

      <!-- Contacts Sidebar -->
      <div class="sidebar" ref="sidebarRef">
        <div class="sidebar-title">Contacts</div>
        <input
          v-model="contactSearch"
          class="contact-search"
          placeholder="Search contacts..."
        />
        <div
          v-for="user in filteredContacts"
          :key="user._id"
          class="contact"
          :class="{ active: selectedUser?._id === user._id }"
          @click="selectUser(user)"
        >
          <div class="contact-name" :class="{ unread: unreadMap[user._id] > 0 }">
            {{ user.firstName }} {{ user.lastName }}
            <span v-if="unreadMap[user._id] > 0" class="unread-badge">{{ unreadMap[user._id] }}</span>
          </div>
          <div class="contact-role">{{ user.role }}</div>
        </div>
      </div>

      <!-- Resize Handle -->
      <div 
        class="resize-handle" 
        @mousedown="startResize"
      ></div>

      <!-- Chat Section -->
      <div class="chat-section">
        <div v-if="!selectedUser" class="no-chat">
          Select a contact to start messaging
        </div>

        <template v-else>
          <div class="messages-container" ref="messagesContainer">
            <div 
              v-for="msg in pastMessages" 
              :key="msg._id" 
              class="message-wrapper"
              :class="msg.senderId === currentUser ? 'sent' : 'received'"
            >
              <div class="message">
                <strong>{{ msg.senderId === currentUser ? 'You' : selectedUser.firstName }}</strong>
                <p v-if="msg.content">{{ msg.content }}</p>

                <div v-if="msg.attachments && msg.attachments.length > 0" class="attachment">
                  <a v-for="att in msg.attachments" :key="att.url" :href="att.url" target="_blank"> {{ att.name }} </a>
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
        </template>
      </div>

    </div>
  </MainLayout>
</template>


<script setup>
import { api } from './../api/api.js'
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '../components/MainLayout.vue'

const router = useRouter()
const currentUserObj = JSON.parse(localStorage.getItem("user"))
const currentUser = currentUserObj?.id
const message = ref("")
const selectedFile = ref(null)
const messagesContainer = ref(null)
const sidebarRef = ref(null)
const pastMessages = ref([])
const contacts = ref([])
const selectedUser = ref(null)
const unreadMap = ref({})
const contactSearch = ref("")
let pollInterval = null
let contactsInterval = null
let isResizing = false
let startX = 0

const filteredContacts = computed(() => {
  if (!contactSearch.value) return contacts.value
  const q = contactSearch.value.toLowerCase()
  return contacts.value.filter(u =>
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
    u.role.toLowerCase().includes(q)
  )
})

const handleFileChange = (file) => { selectedFile.value = file }
const removeFile = () => { selectedFile.value = null }

const loadContacts = async () => {
  try {
    const users = await api.getUsers()
    const conversations = await api.getConversations(currentUser)

    const recentMap = {}
    conversations.forEach(c => {
      recentMap[c.otherUserId] = c.lastTimestamp
      unreadMap.value[c.otherUserId] = c.unreadCount || 0
    })

    const others = users.filter(u => u._id !== currentUser)
    others.sort((a, b) => {
      const timeA = recentMap[a._id] ? new Date(recentMap[a._id]) : 0
      const timeB = recentMap[b._id] ? new Date(recentMap[b._id]) : 0
      return timeB - timeA
    })

    contacts.value = others
  } catch (err) {
    console.error("Failed to load contacts")
  }
}

const selectUser = async (user) => {
  selectedUser.value = user
  pastMessages.value = []
  unreadMap.value[user._id] = 0
  await loadMessages()

  if (pollInterval) clearInterval(pollInterval)
  pollInterval = setInterval(() => {
    loadMessages()
  }, 3000)
}

const loadMessages = async () => {
  try {
    const res = await api.loadMessages(currentUser, selectedUser.value._id)
    pastMessages.value = res
    await nextTick()
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  }
  catch (err) {
    console.error("Failed to load messages")
  }
}

const sendMessage = async () => {
  if (message.value.trim() === "" && selectedFile.value === null) {
    return
  }
  try {
    let attachments = []
    if (selectedFile.value) {
      const formData = new FormData()
      formData.append("file", selectedFile.value.raw)
      const uploaded = await api.uploadAttachment(formData)
      attachments = [uploaded]
    }
    const sentMessage = await api.sendMessage(currentUser, selectedUser.value._id, message.value, attachments)
    pastMessages.value.push(sentMessage)
    message.value = ""
    selectedFile.value = null
    loadContacts()

    await nextTick()
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
  catch (err) {
    console.error("Failed to send message")
  }
}

const startResize = (e) => {
  isResizing = true
  startX = e.clientX
  document.addEventListener('mousemove', doResize)
  document.addEventListener('mouseup', stopResize)
}

const doResize = (e) => {
  if (!isResizing || !sidebarRef.value) return
  
  const diff = e.clientX - startX
  const currentWidth = sidebarRef.value.offsetWidth
  const newWidth = Math.max(150, currentWidth + diff)
  
  sidebarRef.value.style.width = newWidth + 'px'
  startX = e.clientX
}

const stopResize = () => {
  isResizing = false
  document.removeEventListener('mousemove', doResize)
  document.removeEventListener('mouseup', stopResize)
}

onMounted(() => {
  loadContacts()
  contactsInterval = setInterval(() => {
    loadContacts()
  }, 5000)
})

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval)
  if (contactsInterval) clearInterval(contactsInterval)
  document.removeEventListener('mousemove', doResize)
  document.removeEventListener('mouseup', stopResize)
})
</script>


<style scoped>
.chat-page {
  display: flex;
  flex-direction: row;
  height: calc(100vh - 100px);
  overflow: hidden;
  margin: -20px;
  width: calc(100% + 40px);
}

.sidebar {
  width: 220px;
  border-right: 1px solid #ccc;
  overflow-y: auto;
  flex-shrink: 0;
  min-width: 150px;
  max-width: 67vw;
}

.sidebar-title {
  padding: 16px;
  font-weight: bold;
  border-bottom: 1px solid #ccc;
}

.contact-search {
  width: 100%;
  padding: 10px 12px;
  border: none;
  border-bottom: 1px solid #ccc;
  font-size: 13px;
  outline: none;
  box-sizing: border-box;
  background: #fafafa;
}

.contact-search:focus {
  background: white;
  border-bottom-color: #2D6A4F;
}

.contact {
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
}

.contact:hover {
  background: #f5f5f5;
}

.contact.active {
  background: #e6f4ee;
  border-left: 3px solid #2D6A4F;
}

.contact-name {
  font-weight: 500;
}

.contact-name.unread {
  font-weight: 800;
  color: #000;
}

.unread-badge {
  display: inline-block;
  background: #2D6A4F;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 11px;
  text-align: center;
  line-height: 18px;
  margin-left: 6px;
}

.contact-role {
  font-size: 12px;
  color: #888;
  text-transform: capitalize;
}

.chat-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}

.no-chat {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
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

.message .attachment a {
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

.resize-handle {
  width: 4px;
  cursor: col-resize;
  background: transparent;
  transition: background 0.2s;
  flex-shrink: 0;
}

.resize-handle:hover {
  background: #2D6A4F;
}
</style>