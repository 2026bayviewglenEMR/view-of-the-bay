<template>
    <div
        class="sidebar"
        :class="{ collapsed: !isOpen }"
        @mouseenter="expandSidebar"
        @mouseleave="collapseSidebar"
    >
        <nav class="nav-menu">
            <router-link to="/dashboard" class="nav-link">
                <span class="icon">📊</span>
                <span class="label">Dashboard</span>
            </router-link>

            <router-link to="/patients" class="nav-link">
                <span class="icon">👥</span>
                <span class="label">Patient Records</span>
            </router-link>

            <router-link to="/messaging" class="nav-link">
                <span class="icon">💬</span>
                <span class="label">Messaging</span>
            </router-link>

            <router-link to="/templates" class="nav-link">
                <span class="icon">📋</span>
                <span class="label">Templates</span>
            </router-link>

            <router-link to="/tasks" class="nav-link">
                <span class="icon">✓</span>
                <span class="label">Tasks</span>
            </router-link>

            <router-link to="/alerts" class="nav-link">
                <span class="icon">🔔</span>
                <span class="label">Alerts</span>
            </router-link>

            <router-link to="/PatientPortal" class="nav-link">
                <span class="icon">🌀</span>
                <span class="label">Patient Portal</span>
            </router-link>
        </nav>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['toggle'])

const isOpen = ref(false)

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
    top: 12px;
    width: 20vw;
    height: calc(100vh - 24px);
    box-sizing: border-box;
    background-color: var(--color-sidebar-dark);
    color: var(--color-text-1-dark);
    padding: 60px 0px 20px 0px;
    box-shadow: 2px 0 12px rgba(0,0,0,0.25);
    z-index: 10;
    transition: width 0.3s ease;
    overflow: hidden;
    border-radius: 0 18px 18px 0;
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