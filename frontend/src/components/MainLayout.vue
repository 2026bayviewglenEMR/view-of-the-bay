<template>
    <div class="app-layout">
        <TopBar :title="title" />

        <div class="layout-body">
            <Sidebar @toggle="handleSidebarToggle" />

            <main class="main-content" :class="{ 'sidebar-collapsed': !isSidebarOpen }">
                <slot :sidebarOpen="isSidebarOpen" />
            </main>
        </div>

        <div v-if="showWelcome" class="welcome-overlay" @animationend="showWelcome = false">
            <p class="welcome-text">Welcome to The Bay, {{ welcomeName }}</p>
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

.welcome-overlay {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    z-index: 9999;
}

.welcome-text {
    font-family: Georgia, 'Palatino Linotype', Palatino, serif;
    font-style: italic;
    font-size: clamp(1.6rem, 3vw, 2.6rem);
    color: #b8762a;
    text-shadow: 0 2px 12px rgba(184, 118, 42, 0.25);
    margin: 0;
    text-align: center;
    padding: 0 2rem;
    animation: welcomeFade 4.2s ease forwards;
}

@keyframes welcomeFade {
    0%   { opacity: 0; transform: translateY(12px); }
    18%  { opacity: 1; transform: translateY(0); }
    72%  { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(-8px); }
}
</style>