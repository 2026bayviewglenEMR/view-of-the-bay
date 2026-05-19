<template>
    <div class="top-bar">
        <h1 class="title">{{ title }}</h1>
        <div class="search-container">
            <input 
                type="text" 
                placeholder="Search patients..." 
                class="search-input"
                @input="handleSearch"
            />
            <span class="search-icon">🔍</span>
        </div>
        <div class="user-info">
            <span class="notification-icon" title="Notifications">
                🔔
                <span v-if="notificationCount > 0" class="notification-badge">
                    {{ notificationCount }}
                </span>
            </span>
            <div class="profile-menu">
                <button class="profile-button" @click="toggleMenu">
                    👤 {{ userName }}
                </button>
                <div v-if="menuOpen" class="dropdown-menu">
                    <a href="#" class="menu-item" @click.prevent="goToProfile">Profile</a>
                    <a href="#" class="menu-item" @click.prevent="logout">Logout</a>
                    <a href="#" class="menu-item" @click.prevent="updatePassword">Update Password</a>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { defineProps, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../api/api.js';

const props = defineProps({
    title: {
        type: String,
        default: 'Dashboard'
    }
});

const router = useRouter();
const menuOpen = ref(false);
const notificationCount = ref(0); // Can be updated from alerts data

// Get user name from localStorage or auth service
const userName = computed(() => {
    return localStorage.getItem('userName') || 'User';
});

const toggleMenu = () => {
    menuOpen.value = !menuOpen.value;
};

const goToProfile = () => {
    router.push('/profile');
    menuOpen.value = false;
};

const logout = () => {
    // Clear auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    menuOpen.value = false;
    router.push('/login');
};

const updatePassword = async () => {
    const newPassword = window.prompt("Enter your new password:");

    if (!newPassword || newPassword.trim() === "") {
        menuOpen.value = false;
        return; 
    }

    try {
        const result = await api.updatePassword(newPassword);

        alert(result.message);
    } catch (error) {
        console.error("Failed to update password:", error);
        const errorMessage = error.response?.data?.message || "An unexpected error occurred.";
        alert(`Error: ${errorMessage}`);
    } finally {
        menuOpen.value = false;
    }
};

const handleSearch = (event) => {
    const query = event.target.value;
    if (query.length > 0) {
        // Implement search functionality - redirect or emit event
        router.push(`/patients?search=${encodeURIComponent(query)}`);
    }
};
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
    gap: 20px;
}

.title {
    margin: 0;
    font-size: 1.5rem;
    color: var(--color-text-1-dark);
    min-width: 200px;
}

.search-container {
    flex: 1;
    max-width: 300px;
    position: relative;
    display: flex;
    align-items: center;
}

.search-input {
    width: 100%;
    padding: 8px 12px 8px 30px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    background-color: rgba(255, 255, 255, 0.1);
    color: var(--color-text-1-dark);
    font-size: 0.9rem;
}

.search-input::placeholder {
    color: rgba(255, 255, 255, 0.5);
}

.search-input:focus {
    outline: none;
    background-color: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.4);
}

.search-icon {
    position: absolute;
    left: 8px;
    pointer-events: none;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 20px;
}

.notification-icon {
    position: relative;
    cursor: pointer;
    font-size: 1.2rem;
}

.notification-badge {
    position: absolute;
    top: -5px;
    right: -8px;
    background-color: #ff4444;
    color: white;
    border-radius: 50%;
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    font-weight: bold;
}

.profile-menu {
    position: relative;
}

.profile-button {
    background-color: rgba(255, 255, 255, 0.1);
    color: var(--color-text-1-dark);
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background-color 0.2s;
    white-space: nowrap;
}

.profile-button:hover {
    background-color: rgba(255, 255, 255, 0.15);
}

.dropdown-menu {
    position: absolute;
    top: 100%;
    right: 0;
    background-color: var(--color-primary);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    margin-top: 5px;
    min-width: 150px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    z-index: 1001;
}

.menu-item {
    display: block;
    padding: 10px 15px;
    color: var(--color-text-1-dark);
    text-decoration: none;
    transition: background-color 0.2s;
}

.menu-item:hover {
    background-color: rgba(255, 255, 255, 0.1);
}

.menu-item:first-child {
    border-radius: 4px 4px 0 0;
}

.menu-item:last-child {
    border-radius: 0 0 4px 4px;
}
</style>
