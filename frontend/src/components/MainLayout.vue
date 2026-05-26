<template>
    <div class="app-layout">
        <TopBar :title="title" />

        <div class="layout-body">
            <Sidebar @toggle="handleSidebarToggle" />

            <main class="main-content" :class="{ 'sidebar-collapsed': !isSidebarOpen }">
                <slot :sidebarOpen="isSidebarOpen" />
            </main>
        </div>

        <div v-if="showWelcome" class="welcome-bar" @animationend="showWelcome = false">
            Welcome to The Bay, {{ welcomeName }}
        </div>
    </div>
</template>

<script setup>
import { defineProps, ref, onMounted } from 'vue';
import TopBar from '../components/TopBar.vue';
import Sidebar from '../components/Sidebar.vue';

const props = defineProps({
    title: {
        type: String,
        default: 'View of the Bay'
    }
});

const isSidebarOpen = ref(true);
const showWelcome = ref(false);
const welcomeName = ref('');

const handleSidebarToggle = (isOpen) => {
    isSidebarOpen.value = isOpen;
};

onMounted(() => {
    const loginTimestamp = localStorage.getItem('loginTimestamp');
    const alreadyShown = sessionStorage.getItem('welcomeShownAt');

    if (loginTimestamp && alreadyShown !== loginTimestamp) {
        sessionStorage.setItem('welcomeShownAt', loginTimestamp);

        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const firstName = user.firstName || user.username || 'there';
        const role = user.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : '';
        welcomeName.value = role ? `${firstName} — ${role}` : firstName;
        showWelcome.value = true;
    }
});
</script>

<style scoped>
.app-layout {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
}

.layout-body {
    display: flex;
    flex: 1;
    overflow: hidden;
}

.main-content {
  flex: 1;
  margin-left: 20vw;
  padding: 20px;
  background-color: var(--color-bg);
  overflow-y: auto;
  transition: margin-left 0.3s ease;
  position: relative;
  overflow-x: hidden;
}

.main-content.sidebar-collapsed {
    margin-left: 70px;
}

.welcome-bar {
    position: fixed;
    top: 16px;
    left: 50%;
    transform: translateX(-50%);
    background: white;
    color: #10231b;
    font-size: 13.5px;
    font-weight: 500;
    padding: 10px 22px;
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    pointer-events: none;
    z-index: 9999;
    white-space: nowrap;
    animation: barFade 2s ease forwards;
}

@keyframes barFade {
    0%   { opacity: 0; transform: translateX(-50%) translateY(-6px); }
    15%  { opacity: 1; transform: translateX(-50%) translateY(0); }
    70%  { opacity: 1; transform: translateX(-50%) translateY(0); }
    100% { opacity: 0; transform: translateX(-50%) translateY(-6px); }
}
</style>