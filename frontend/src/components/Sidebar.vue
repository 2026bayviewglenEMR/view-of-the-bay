<template>
    <div class="sidebar">
        <div class="spacer-1"></div>
        <nav class="nav-menu">
            <router-link to="/dashboard" class="nav-link">
                <span class="icon">📊</span> Dashboard
            </router-link>
            <router-link to="/patients" class="nav-link">
                <span class="icon">👥</span> Patient Records
            </router-link>
            <router-link to="/messaging" class="nav-link">
                <span class="icon">💬</span> Messaging
            </router-link>
            <router-link to="/templates" class="nav-link">
                <span class="icon">📋</span> Templates
            </router-link>
            <router-link to="/tasks" class="nav-link">
                <span class="icon">✓</span> Tasks
            </router-link>
            <router-link to="/alerts" class="nav-link">
                <span class="icon">🔔</span> Alerts
            </router-link>
        </nav>
    </div>
</template>

<script setup>
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
    padding: 20px;
    box-shadow: 2px 0 4px rgba(0,0,0,0.25);
    z-index: 10;
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
    padding: 12px 10px;
    border-radius: 4px;
    transition: background-color 0.2s;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 0.95rem;
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
}
</style>
