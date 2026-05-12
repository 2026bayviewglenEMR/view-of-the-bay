<template>
    <div class="sidebar" :class="{ collapsed: !isOpen }">
        <button class="toggle-btn" @click="toggleSidebar" :title="isOpen ? 'Collapse' : 'Expand'">
            <span class="toggle-icon">{{ isOpen ? '◀' : '▶' }}</span>
        </button>
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
        </nav>
    </div>
</template>

<script setup>
import { ref } from 'vue';

const isOpen = ref(true);

function toggleSidebar() {
    isOpen.value = !isOpen.value;
}
</script>

<style scoped>
.sidebar {
    position: fixed;
    left: 0;
    top: 0;
    width: 20vw;
    height: 100vh;
    background-color: var(--color-sidebar-dark);
    color: var(--color-text-1-dark);
    padding: 60px 0px 20px 0px;
    box-shadow: 2px 0 4px rgba(0,0,0,0.25);
    z-index: 10;
    transition: width 0.3s ease;
    overflow: hidden;
}

.sidebar.collapsed {
    width: 70px;
}

.toggle-btn {
    position: absolute;
    bottom: 100px;
    right: 10px;
    background: none;
    border: none;
    color: var(--color-text-1-dark);
    cursor: pointer;
    font-size: 1rem;
    padding: 8px;
    border-radius: 4px;
    transition: background-color 0.2s;
    z-index: 20;
}

.toggle-btn:hover {
    background-color: rgba(255, 255, 255, 0.1);
}

.toggle-icon {
    display: inline-block;
    transition: transform 0.3s ease;
}

.spacer-1 {
    height: 50px;
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
