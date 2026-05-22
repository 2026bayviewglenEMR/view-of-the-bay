<script setup>
import { ref, onMounted } from 'vue';

const isDropdownOpen = ref(false);
const newTaskText = ref('');
const tasks = ref([]);
const baseURL = 'http://localhost:3000';

// 1. GET /api/tasks
onMounted(async () => {
  try {
    const response = await fetch(`${baseURL}/api/tasks`);
    if (response.ok) {
      const allTasks = await response.json();
      tasks.value = allTasks.filter(task => !task.completed); 
    }
  } catch (error) {
    console.error("Error fetching tasks:", error);
  }
});

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

// 2. POST /api/tasks
const addTask = async () => {
  if (newTaskText.value.trim() === '') return;
  
  try {
    const response = await fetch(`${baseURL}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        text: newTaskText.value,
        completed: false
      })
    });
    
    if (response.ok) {
      const savedTask = await response.json();
      tasks.value.push(savedTask);
      newTaskText.value = ''; // Clear input
    }
  } catch (error) {
    console.error("Error adding task:", error);
  }
};

// 3. PATCH /api/tasks/:id (Updates the checkbox status)
const completeTask = async (id) => {
  tasks.value = tasks.value.filter(task => task.id !== id);
  
  try {
    await fetch(`${baseURL}/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: true })
    });
  } catch (error) {
    console.error("Error completing task:", error);
  }
};
</script>

<template>
  <div style="position: relative; display: inline-block;">
    
    <button @click="toggleDropdown" style="background: transparent; border: none; cursor: pointer; padding: 0; position: relative;">
      <span style="font-size: 1.5rem;">📋</span>
      <span v-if="tasks.length > 0" style="position: absolute; top: -5px; right: -5px; background-color: #3273dc; color: white; border-radius: 50%; padding: 2px 6px; font-size: 0.75rem; font-weight: bold;">
        {{ tasks.length }}
      </span>
    </button>

    <div v-show="isDropdownOpen" style="position: absolute; top: 120%; right: 0; width: 320px; background-color: white; border: 1px solid #e5e5e5; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.15); z-index: 9999; padding: 1rem; text-align: left;">
      <h3 style="margin: 0 0 10px 0; font-size: 1.1rem; font-weight: bold; border-bottom: 1px solid #eee; padding-bottom: 8px;">Daily Tasks</h3>
      
      <div style="display: flex; gap: 8px; margin-bottom: 15px;">
        <input 
          v-model="newTaskText" 
          @keyup.enter="addTask"
          placeholder="Add a new task..." 
          style="flex-grow: 1; padding: 6px; border: 1px solid #ccc; border-radius: 4px;"
        />
        <button @click="addTask" style="background: #3273dc; color: white; border: none; border-radius: 4px; padding: 6px 12px; cursor: pointer;">Add</button>
      </div>

      <div v-if="tasks.length > 0" style="display: flex; flex-direction: column; gap: 10px; max-height: 250px; overflow-y: auto;">
        <div v-for="task in tasks" :key="task.id" style="display: flex; justify-content: space-between; align-items: center; background: #f9f9f9; padding: 8px; border-radius: 4px;">
          <span style="font-size: 0.9rem;">{{ task.text }}</span>
          <button @click.stop="completeTask(task.id)" style="background: #effaf3; border: 1px solid #48c774; color: #48c774; border-radius: 4px; cursor: pointer; margin-left: 10px;">✔️</button>
        </div>
      </div>
      
      <div v-else style="text-align: center; color: #888; font-size: 0.9rem; padding: 10px 0;">
        <p>All caught up for the day! 🎉</p>
      </div>
    </div>
    
  </div>
</template>