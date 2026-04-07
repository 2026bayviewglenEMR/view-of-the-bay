<template>
  <div class="dashboard-layout">
    <header class="header">
      <h1 class="title">Theme Overview</h1>
      <p class="subtitle">
        This page demonstrates your color variables applied to both raw HTML elements and live Element Plus components.
      </p>
    </header>

    <div class="grid-container">
      
      <section class="custom-card">
        <h2 class="card-title">Custom Typography</h2>
        <p class="body-text">
          This text uses <code>--color-text-2</code>. It's highly legible and perfect for standard paragraph bodies.
        </p>
        <p class="muted-text">
          This text uses <code>--color-text-3</code>. It is slightly darker than the background, making it perfect for subtle muted notes or timestamps.
        </p>
        
        <br />
        
        <h2 class="card-title">Custom Elements</h2>
        <p class="body-text">Here is a standard HTML button styled with your secondary color variables:</p>
        <button class="custom-secondary-btn">Run Diagnostics</button>
      </section>

      <el-card shadow="never" class="ep-demo-card">
        <template #header>
          <div class="card-header">
            <h2 class="card-title">Element Plus Overrides</h2>
          </div>
        </template>
        
        <p class="body-text" style="margin-top: 0;">
          These buttons automatically inherit your custom <code>--el-color-*</code> variables:
        </p>
        
        <div class="button-row">
          <el-button type="primary">Deploy Server</el-button>
          <el-button type="success">Success</el-button>
          <el-button type="warning">Warning</el-button>
          <el-button type="danger">Critical</el-button>
        </div>

        <el-divider />

        <p class="body-text">Form inputs inherit your backgrounds, text colors, and borders:</p>
        
        <el-form label-position="top">
          <el-form-item label="Username">
            <el-input v-model="username" placeholder="Please enter your username" />
          </el-form-item>
          
          <el-form-item label="System Status">
            <el-alert 
              title="Database Connection Stable" 
              type="success" 
              :closable="false" 
              show-icon 
            />
          </el-form-item>
        </el-form>
      </el-card>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const username = ref('')
</script>

<style scoped>
/* Component-specific layout styles */
.dashboard-layout {
  max-width: 1000px;
  margin: 40px auto;
  padding: 20px;
}

.header {
  margin-bottom: 30px;
}

.title {
  margin: 0 0 8px 0;
  color: var(--color-text-1);
}

.subtitle {
  margin: 0;
  color: var(--color-text-2);
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
}

/* Base text classes */
.card-title {
  margin: 0 0 12px 0;
  font-size: 1.5em;
  color: var(--color-text-1);
}

.body-text {
  color: var(--color-text-2);
  line-height: 1.5;
}

.muted-text {
  color: var(--color-text-3);
  font-size: 13px;
  margin: 0;
}

/* Custom Card (Raw HTML) */
.custom-card {
  background-color: var(--color-paper);
  border: 1px solid var(--color-border);
  padding: 24px;
  border-radius: 8px;
}

.custom-secondary-btn {
  background-color: var(--color-secondary);
  color: var(--color-text-1);
  border: 1px solid var(--color-border);
  padding: 10px 16px;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 10px;
  transition: opacity 0.2s;
}

.custom-secondary-btn:hover {
  opacity: 0.8;
}

/* Element Plus Specific Layout Overrides for this demo */
.ep-demo-card {
  /* Using Element Plus's built-in CSS variables to match our custom card */
  border-color: var(--color-border);
  background-color: var(--color-paper);
}

.button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
}
</style>