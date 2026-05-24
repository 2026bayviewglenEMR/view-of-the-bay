<template>
    <div class="app-layout">
        <TopBar :title="title" />
        
        <div class="layout-body">
            <!-- 1. Listen for the toggle event from the Sidebar -->
            <Sidebar @toggle="handleSidebarToggle" />
            
            <!-- 2. Apply a dynamic class when the sidebar is NOT open -->
            <main class="main-content" :class="{ 'sidebar-collapsed': !isSidebarOpen }">
                <slot />
            </main>
        </div>
    </div>
</template>

<script setup>
import { defineProps, ref } from 'vue';
import TopBar from '../components/TopBar.vue';
import Sidebar from '../components/Sidebar.vue';

const props = defineProps({
    title: {
        type: String,
        default: 'View of the Bay'
    }
});

// 3. Track the sidebar's state here in the layout
const isSidebarOpen = ref(true);

// 4. Update the layout's state when the sidebar shouts
const handleSidebarToggle = (isOpen) => {
    isSidebarOpen.value = isOpen;
};
</script>

<style scoped>
/* Using the Flexbox layout we discussed earlier! */
.app-layout {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
}

.layout-body {
    display: flex;
    flex: 1;
    overflow: hidden;
}

/* 
  If your Sidebar uses fixed widths (like 20vw), 
  we apply that structural math here in the layout, 
  NOT in the individual pages!
*/
.main-content {
  flex: 1;
  margin-left: 20vw;
  padding: 20px;
  background-color: var(--color-bg);
  overflow-y: auto;
  transition: margin-left 0.3s ease;
  position: relative;
}

/* 2. Add this block to shrink the gap when collapsed! */
.main-content.sidebar-collapsed {
    margin-left: 70px;
}
</style>