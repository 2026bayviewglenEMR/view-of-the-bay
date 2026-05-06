<template>
    <div class="tasks-container">
        <top-bar title="Tasks" />
        <div class="main-content">
            <h2>Tasks</h2>
            <p>Task management view - to be implemented</p>
            <!-- Add task management UI here -->
        </div>
    </div>
</template>

<script setup>
import TopBar from '../components/TopBar.vue';
</script>

<style scoped>
.tasks-container {
    margin-left: 20vw;
    margin-top: 60px;
}

.main-content {
    padding: 20px;
}
</style>
