<template>
    <div class="top-bar">
        <h1 class="title">Dashboard</h1>
        <div class="user-info">
            <!-- Add user info or logout button here -->
        </div>
    </div>
    <div class="sidebar">
        <nav class="nav-menu">
            <router-link to="/" class="nav-link">Home</router-link>
            <router-link to="/dashboard" class="nav-link">Dashboard</router-link>
            <!-- Add more links as needed -->
        </nav>
    </div>
    <div class="main-content">
        <!-- Main dashboard content goes here -->
        <h2>Welcome to the Dashboard</h2>
        <p>This is the main content area.</p>
    </div>
</template>


<script setup>

</script>


<style scoped>
.top-bar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 60px;
    background-color: var(--color-primary);
    color: var(--color-text-1-dark);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    z-index: 1000;
}

.title {
    margin: 0;
    font-size: 1.5rem;
}

.sidebar {
    position: fixed;
    left: 0;
    top: 0;
    width: 250px;
    height: 100vh;
    background-color: var(--color-sidebar-dark);
    color: var(--color-text-1-dark);
    padding: 20px;
    box-shadow: 2px 0 4px rgba(0,0,0,0.1);
    z-index: 999;
}

.nav-menu {
    display: flex;
    flex-direction: column;
    gap: 10px;
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

.main-content {
    margin-left: 250px;
    padding-top: 60px;
    padding: 80px 20px 20px 20px;
    background-color: var(--color-bg);
    min-height: calc(100vh - 60px);
}
</style>