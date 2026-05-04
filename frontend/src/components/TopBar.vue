<template>
    <div class="top-bar">
        <h1 class="title">{{ title }}</h1>
        <div class="user-info">
            <!-- Add user info or logout button here -->
        </div>
    </div>
</template>

<script setup>
import { defineProps } from 'vue';

defineProps({
    title: {
        type: String,
        default: 'Dashboard'
    }
});
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
    box-shadow: 0 2px 4px rgba(0,0,0,0.5);
    z-index: 1000;
}

.title {
    margin: 0;
    font-size: 1.5rem;
    color: var(--color-text-1-dark);
}

.user-info {
    /* Add styles for user info here */
}
</style>
