<script setup>
import { ref, onMounted } from 'vue';

const newTask = ref('');

const tasks = ref([]);

// 1. GET ROUTE: Fetch the tasks when the dashboard loads
onMounted(async () => {
  try {
    const response = await fetch('http://localhost:3000/api/tasks');
    if (!response.ok) throw new Error('Network response was not ok');
    
    const data = await response.json();
    tasks.value = data;
  } catch (error) {
    console.error("Error fetching tasks:", error);
  }
});

// 2. POST ROUTE: Add a new task to the database
const addTask = async () => {
  if (newTask.value.trim() === '') return; 
  
  try {
    const response = await fetch('http://localhost:3000/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: newTask.value, completed: false })
    });

    if (!response.ok) throw new Error('Failed to save new task');

    const createdTask = await response.json();

    tasks.value.push(createdTask);
    newTask.value = ''; 
    
  } catch (error) {
    console.error("Error adding task:", error);
  }
};

// 3. PATCH ROUTE: Tell the database when a box is checked or unchecked
const toggleTask = async (task) => {
  try {
    const response = await fetch(`http://localhost:3000/api/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: task.completed })
    });

    if (!response.ok) throw new Error('Failed to update task status');
  } catch (error) {
    console.error("Error updating task:", error);
    task.completed = !task.completed;
  }
};

// 4. DELETE ROUTE: Permanently remove the task from the database
const removeTask = async (id) => {
  try {
    const response = await fetch(`http://localhost:3000/api/tasks/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) throw new Error('Failed to delete task');

    tasks.value = tasks.value.filter(task => task.id !== id);
    
  } catch (error) {
    console.error("Error deleting task:", error);
  }
};
</script>

<template>
  <nav class="panel is-info shadow-sm has-background-white">
    <p class="panel-heading">
      📝 Daily Tasks
    </p>
    
    <div class="panel-block">
      <p class="control">
        <input 
          class="input is-info" 
          type="text" 
          placeholder="Add a new task and press Enter..." 
          v-model="newTask" 
          @keyup.enter="addTask"
        >
      </p>
    </div>

    <label 
      class="panel-block is-flex is-justify-content-space-between is-align-items-center py-3" 
      v-for="task in tasks" 
      :key="task.id"
    >
      <div>
        <input 
          type="checkbox" 
          v-model="task.completed" 
          @change="toggleTask(task)" 
          class="mr-3"
        >
        
        <span :class="{ 'is-completed': task.completed }">
          {{ task.text }}
        </span>
      </div>
      
      <button class="delete is-medium" @click.prevent="removeTask(task.id)"></button>
    </label>

    <div v-if="tasks.length === 0" class="panel-block p-5 has-text-grey is-justify-content-center">
      All caught up for the day! 🎉
    </div>
  </nav>
</template>

<style scoped>
.shadow-sm {
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  border-radius: 6px;
}

.is-completed {
  text-decoration: line-through;
  color: #b5b5b5; 
}

.panel-block:hover {
  background-color: #f5f5f5;
  cursor: pointer;
}
</style>