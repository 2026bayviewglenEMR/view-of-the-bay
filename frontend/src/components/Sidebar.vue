<template>
    <div class="sidebar">
        <div class="spacer-1"></div>
        <nav class="nav-menu">
            <router-link to="/" class="nav-link">Home</router-link>
            <router-link to="/dashboard" class="nav-link">Dashboard</router-link>
            <router-link to="/messaging" class="nav-link">Messaging</router-link>
            <!-- Add more links as needed -->
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
    position: fixed;
}

.nav-link {
    color: var(--color-text-1-dark);
    text-decoration: none;
    padding: 10px;
    border-radius: 4px;
    transition: background-color 0.2s;
}

.nav-link:hover {
    background-color: rgba(255, 255, 255, 0.1);
}

.nav-link.router-link-active {
    background-color: var(--color-primary);
}
</style>
