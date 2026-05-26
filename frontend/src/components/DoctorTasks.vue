<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { api } from '@/api/api.js'; 

const isDropdownOpen = ref(false);
const newTaskText = ref('');
const tasks = ref([]);

const componentRef = ref(null);

const closeOnClickOutside = (event) => {
  if (componentRef.value && !componentRef.value.contains(event.target)) {
    isDropdownOpen.value = false;
  }
};

onMounted(async () => {
  document.addEventListener('mousedown', closeOnClickOutside);
  try {
    const allTasks = await api.getTasks();
    // FIXED: Backend uses 'status' string instead of 'completed' boolean
    tasks.value = allTasks.filter(task => task.status !== 'completed'); 
  } catch (error) {
    console.error("Error fetching tasks:", error);
  }
});

onUnmounted(() => {
  document.removeEventListener('mousedown', closeOnClickOutside);
});

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const addTask = async () => {
  if (newTaskText.value.trim() === '') return;
  
  try {
    // 1. Dig into the browser's storage to find out who is currently logged in
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    
    // 2. Grab their ID (checking for both standard id and MongoDB's _id just in case)
    const currentDoctorId = currentUser._id || currentUser.id;

    // 3. Send BOTH the title and the doctorId to satisfy the backend bouncer!
    const savedTask = await api.createTask({ 
      title: newTaskText.value, 
      doctorId: currentDoctorId
    });
    
    tasks.value.push(savedTask);
    newTaskText.value = ''; // Clear input
  } catch (error) {
    console.error("Error adding task:", error);
  }
};

const completeTask = async (id) => {
  tasks.value = tasks.value.filter(task => task._id !== id);
  
  try {
    await api.completeTask(id);
  } catch (error) {
    console.error("Error completing task:", error);
  }
};
</script>

<template>
  <div ref="componentRef" style="position: relative; display: inline-block;">
    
    <button @click="toggleDropdown" style="background: transparent; border: none; cursor: pointer; padding: 0; position: relative;">
      <span style="font-size: 1.5rem;">📋</span>
      <span v-if="tasks.length > 0" style="position: absolute; top: -5px; right: -5px; background-color: #5c4033; color: white; border-radius: 50%; padding: 2px 6px; font-size: 0.75rem; font-weight: bold;">
        {{ tasks.length }}
      </span>
    </button>

    <div v-show="isDropdownOpen" style="position: absolute; top: 120%; right: 0; width: 320px; background-color: white; border: 2px solid #32cd32; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.15); z-index: 9999; padding: 1rem; text-align: left; color: #333333;">
      <h3 style="margin: 0 0 10px 0; font-size: 1.1rem; font-weight: bold; border-bottom: 1px solid #eee; padding-bottom: 8px; color: #333333;">Daily Tasks</h3>
      
      <div style="display: flex; gap: 8px; margin-bottom: 15px;">
        <input 
          v-model="newTaskText" 
          @keyup.enter="addTask"
          placeholder="Add a new task..." 
          style="flex-grow: 1; padding: 6px; border: 1px solid #ccc; border-radius: 4px; color: #333333;"
        />
        <button @click="addTask" style="background: #5c4033; color: white; border: none; border-radius: 4px; padding: 6px 12px; cursor: pointer;">Add</button>
      </div>

      <div v-if="tasks.length > 0" style="display: flex; flex-direction: column; gap: 10px; max-height: 250px; overflow-y: auto;">
        <div v-for="task in tasks" :key="task._id" style="display: flex; justify-content: space-between; align-items: center; background: #f9f9f9; padding: 8px; border-radius: 4px;">
          <span style="font-size: 0.9rem; color: #333333;">{{ task.title }}</span>
          <button @click.stop="completeTask(task._id)" style="background: #effaf3; border: 1px solid #48c774; color: #48c774; border-radius: 4px; cursor: pointer; margin-left: 10px;">✔️</button>
        </div>
      </div>
      
      <div v-else style="text-align: center; color: #888; font-size: 0.9rem; padding: 10px 0;">
        <p>All caught up for the day! 🎉</p>
      </div>
    </div>
    
  </div>
</template>