<template>
    <div
        class="sidebar"
        :class="{ collapsed: !isOpen }"
        @mouseenter="expandSidebar"
        @mouseleave="collapseSidebar"
    >
        <nav class="nav-menu">
            <template v-for="item in navConfig" :key="item.path">
                <router-link 
                    v-if="item.roles.includes(role)"
                    :to="item.path" 
                    class="nav-link"
                >
                    <span class="icon">{{ item.icon }}</span>
                    <span class="label">{{ item.label }}</span>
                </router-link>
            </template>
        </nav>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const emit = defineEmits(['toggle'])

const isOpen = ref(false)

const role = JSON.parse(localStorage.getItem("user")).role

// 1. Define the Navigation Structure Array
const navConfig = [
    { path: '/dashboard',     label: 'Dashboard',      icon: '📊', roles: ['doctor', 'admin'] },
    { path: '/patients',      label: 'Patient Records', icon: '👥', roles: ['doctor', 'admin', 'patient'] },
    { path: '/messaging',     label: 'Messaging',      icon: '💬', roles: ['doctor', 'admin', 'patient'] },
    { path: '/waitingroom',   label: 'Waiting Room',   icon: '🪑', roles: ['admin'] },
    { path: '/PatientPortal', label: 'Patient Portal', icon: '🌀', roles: ['patient'] }
]

// Emit the initial state when the component mounts
onMounted(() => {
    emit('toggle', isOpen.value)
})

function expandSidebar() {
    isOpen.value = true
    emit('toggle', true)
}

function collapseSidebar() {
    isOpen.value = false
    emit('toggle', false)
}
</script>

<style scoped>
.sidebar {
    position: fixed;
    left: 0;
    top: 0;
    width: 20vw;
    height: 100vh;
    box-sizing: border-box;
    background-color: var(--color-sidebar-dark);
    color: var(--color-text-1-dark);
    padding: 60px 0px 20px 0px;
    box-shadow: 2px 0 12px rgba(0,0,0,0.25);
    z-index: 10;
    transition: width 0.3s ease;
    overflow: hidden;
    border-radius: 0;
}

.sidebar.collapsed {
    width: 70px;
}

.nav-menu {
    display: flex;
    flex-direction: column;
    gap: 10px;
    position: relative;
}

.nav-link {
    color: var(--color-text-1-dark);
    text-decoration: none;
    padding: 12px 8px;
    border-radius: 4px;
    transition: background-color 0.2s;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 0.95rem;
    white-space: nowrap;
}

.nav-link:hover {
    background-color: rgba(255, 255, 255, 0.1);
}

.nav-link.router-link-active {
    background-color: var(--color-primary);
    font-weight: 600;
}

.icon {
    font-size: 1.2rem;
    min-width: 20px;
    flex-shrink: 0;
}

.label {
    transition: opacity 0.3s ease;
}

.sidebar.collapsed .label {
    opacity: 0;
    width: 0;
    overflow: hidden;
}

.sidebar.collapsed .nav-link {
    justify-content: center;
    padding: 12px;
}
</style>