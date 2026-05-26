<template>
    <div class="top-bar">
        <h1 class="title">{{ title }}</h1>
        <div class="search-container">
            <input 
                type="text" 
                placeholder="Search patients..." 
                class="search-input"
                v-model="searchQuery"
                @input="handleSearch"
                @focus="showDropdown = searchResults.length > 0"
                @blur="setTimeout(() => showDropdown = false, 200)"
                autocomplete="off"
            />
            <span class="search-icon">🔍</span>
            <div v-if="showDropdown" class="search-dropdown">
                <div
                    v-for="patient in searchResults"
                    :key="patient._id"
                    class="search-result"
                    @click="goToPatient(patient._id)"
                >
                    <span class="result-name">{{ patient.firstName }} {{ patient.lastName }}</span>
                    <span class="result-dob">{{ new Date(patient.dateOfBirth).toLocaleDateString() }}</span>
                </div>
            </div>
        </div>
        <div class="user-info">
            
            <DoctorTasks />
            <PatientAlerts />

            <div class="profile-menu">
                <button class="profile-button" @click="toggleMenu">
                    <img v-if="avatarUrl" :src="avatarUrl" class="profile-avatar" alt="Profile" />
                    <span v-else class="profile-emoji">👤</span>
                    {{ userName }}
                </button>
                <div v-if="menuOpen" class="dropdown-menu">
                    <a href="#" class="menu-item" @click.prevent="goToProfile">Profile</a>
                    <a href="#" class="menu-item" v-if="isAdmin" @click.prevent="openCreateUserModal">Create User</a>
                    <a href="#" class="menu-item" @click.prevent="openPasswordModal">Update Password</a>
                    <a href="#" class="menu-item" @click.prevent="logout">Logout</a>
                </div>
            </div>
        </div>

        <!-- Update Password Modal -->
        <div v-if="showPasswordModal" class="modal-overlay" @click.self="closePasswordModal">
            <div class="modal-content">
                <h2>Update Password</h2>
                <form @submit.prevent="submitUpdatePassword">
                    <div class="form-group">
                        <label>New Password</label>
                        <input type="password" v-model="newPasswordInput" class="form-input" required />
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="btn-cancel" @click="closePasswordModal">Cancel</button>
                        <button type="submit" class="btn-submit">Save Password</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Create User Modal (Admin Only) -->
        <div v-if="showCreateUserModal" class="modal-overlay" @click.self="closeCreateUserModal">
            <div class="modal-content">
                <h2>Create New User</h2>
                <form @submit.prevent="submitCreateUser">
                    <div class="form-group">
                        <label>Username</label>
                        <input type="text" v-model="newUser.username" class="form-input" required />
                    </div>
                    <div class="form-group">
                        <label>Password</label>
                        <input type="password" v-model="newUser.password" class="form-input" required />
                    </div>
                    <div class="form-group">
                        <label>First Name</label>
                        <input type="text" v-model="newUser.firstName" class="form-input" required />
                    </div>
                    <div class="form-group">
                        <label>Last Name</label>
                        <input type="text" v-model="newUser.lastName" class="form-input" required />
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" v-model="newUser.email" class="form-input" required />
                    </div>
                    <div class="form-group">
                        <label>Role</label>
                        <select v-model="newUser.role" class="form-input" required>
                            <option value="admin">Admin</option>
                            <option value="doctor">Doctor</option>
                            <option value="patient">Patient</option>
                        </select>
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="btn-cancel" @click="closeCreateUserModal">Cancel</button>
                        <button type="submit" class="btn-submit">Create User</button>
                    </div>
                </form>
            </div>
        </div>

    </div>
</template>

<script setup>
import { defineProps, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../api/api.js';
import { currentUser, getAvatarUrl } from '../composables/useUser.js';

import PatientAlerts from './PatientAlerts.vue';
import DoctorTasks from './DoctorTasks.vue';

const props = defineProps({
    title: {
        type: String,
        default: 'Dashboard'
    }
});

const router = useRouter();
const menuOpen = ref(false);
const notificationCount = ref(0);
const searchQuery = ref("")
const searchResults = ref([])
const showDropdown = ref(false)

const showPasswordModal = ref(false);
const showCreateUserModal = ref(false);
const newPasswordInput = ref('');
const newUser = ref({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    email: '',
    role: 'doctor'
});

const userName = computed(() => {
    return localStorage.getItem('userName') || 'User';
});

const avatarUrl = computed(() => getAvatarUrl(currentUser.value?.profilePicture));

const isAdmin = computed(() => {
    try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const userObj = JSON.parse(userStr);
            return userObj.role?.toLowerCase() === 'admin';
        }
    } catch (e) {
        console.error("Failed to parse user from localStorage", e);
    }
    return false;
});

const toggleMenu = () => {
    menuOpen.value = !menuOpen.value;
};

const goToProfile = () => {
    router.push('/profile');
    menuOpen.value = false;
};

const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userName');
    menuOpen.value = false;
    router.push('/login');
};

const openPasswordModal = () => {
    newPasswordInput.value = '';
    showPasswordModal.value = true;
    menuOpen.value = false;
};

const closePasswordModal = () => {
    showPasswordModal.value = false;
    newPasswordInput.value = '';
};

const submitUpdatePassword = async () => {
    try {
        const result = await api.updatePassword(newPasswordInput.value);
        if (result.status >= 200 && result.status < 300) {
            alert("Success: Your password has been updated!");
            closePasswordModal();
        } else {
            alert(`Error: ${result.data?.message || 'Failed to update password'}`);
        }
    } catch (error) {
        console.error("Failed to update password:", error);
        const errorMessage = error.response?.data?.message || "An unexpected error occurred.";
        alert(`Error: ${errorMessage}`);
    }
};

const openCreateUserModal = () => {
    newUser.value = { username: '', password: '', firstName: '', lastName: '', email: '', role: 'doctor' };
    showCreateUserModal.value = true;
    menuOpen.value = false;
};

const closeCreateUserModal = () => {
    showCreateUserModal.value = false;
};

const submitCreateUser = async () => {
    try {
        const result = await api.createUser(newUser.value);
        if (result.status >= 200 && result.status < 300) {
            alert("Success: New user created successfully!");
            closeCreateUserModal();
        } else {
            alert(`Error: ${result.data?.message || 'Failed to create user'}`);
        }
    } catch (error) {
        console.error("Failed to create user:", error);
        const errorMessage = error.response?.data?.message || "An unexpected error occurred.";
        alert(`Error: ${errorMessage}`);
    }
};

const handleSearch = async (event) => {
    searchQuery.value = event.target.value
    if (searchQuery.value.length < 1) {
        searchResults.value = []
        showDropdown.value = false
        return
    }
    try {
        const patients = await api.getAllPatients()
        const q = searchQuery.value.toLowerCase()
        searchResults.value = patients.filter(p =>
            p.firstName.toLowerCase().startsWith(q) ||
            p.lastName.toLowerCase().startsWith(q)
        ).slice(0, 6)
        showDropdown.value = searchResults.value.length > 0
    } catch (err) {
        console.error("Search failed", err)
    }
}

const goToPatient = (id) => {
    showDropdown.value = false
    searchQuery.value = ""
    router.push(`/patients/${id}`)
}
</script>

<style scoped>
.top-bar {
    position: sticky;
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

.search-dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    z-index: 2000;
    overflow: hidden;
}

.search-result {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 14px;
    cursor: pointer;
    color: #333;
    font-size: 0.9rem;
    border-bottom: 1px solid #f0f0f0;
}

.search-result:last-child {
    border-bottom: none;
}

.search-result:hover {
    background: #f0f7f4;
}

.result-name {
    font-weight: 600;
}

.result-dob {
    font-size: 0.8rem;
    color: #888;
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
    display: flex;
    align-items: center;
    gap: 8px;
}

.profile-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid rgba(255, 255, 255, 0.5);
    flex-shrink: 0;
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

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
}

.modal-content {
    background-color: white;
    color: #333;
    padding: 25px;
    border-radius: 8px;
    width: 100%;
    max-width: 400px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.modal-content h2 {
    margin-top: 0;
    margin-bottom: 20px;
    font-size: 1.5rem;
    color: #222;
}

.form-group {
    margin-bottom: 15px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: 600;
    font-size: 0.9rem;
}

.form-input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
    font-size: 1rem;
}

.form-input:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.2);
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 25px;
}

.btn-cancel {
    background-color: #f1f1f1;
    color: #333;
    border: 1px solid #ccc;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
}

.btn-cancel:hover {
    background-color: #e4e4e4;
}

.btn-submit {
    background-color: var(--color-primary, #007bff);
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
}

.btn-submit:hover {
    opacity: 0.9;
}
</style>