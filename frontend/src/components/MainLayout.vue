<template>
    <div class="app-layout">
        <TopBar :title="title" />
        
        <div class="layout-body">
            <Sidebar @toggle="handleSidebarToggle" />
            
            <main class="main-content" :class="{ 'sidebar-collapsed': !isSidebarOpen }">
                <slot :sidebarOpen="isSidebarOpen" />
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

const isSidebarOpen = ref(true);

const handleSidebarToggle = (isOpen) => {
    isSidebarOpen.value = isOpen;
};
</script>

<style scoped>
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

.main-content {
  flex: 1;
  margin-left: 20vw;
  padding: 20px;
  background-color: var(--color-bg);
  overflow-y: auto;
  transition: margin-left 0.3s ease;
  position: relative;
  overflow-x: hidden;
}

.main-content.sidebar-collapsed {
    margin-left: 70px;
}
</style>