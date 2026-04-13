<template>
  <div class="dashboard-layout">
    <header class="header">
      <div class="tutorial-badge">Raw HTML: &lt;h1&gt;</div>
      <h1 class="title">Theme & Component Tutorial</h1>
      <p class="tutorial-note">Applied: <code>color: var(--color-text-1)</code></p>

      <div class="tutorial-badge" style="margin-top: 15px;">Raw HTML: &lt;p&gt;</div>
      <p class="subtitle">
        This page acts as a living style guide. Each section explains the HTML structure and the specific custom CSS variables driving its appearance.
      </p>
      <p class="tutorial-note">Applied: <code>color: var(--color-text-2)</code></p>
    </header>

    <div class="grid-container">
      
      <section class="custom-card">
        <div class="tutorial-badge">Raw HTML: &lt;section&gt; (Custom Card)</div>
        <p class="tutorial-note" style="margin-bottom: 20px;">
          Applied:<br>
          <code>background-color: var(--color-paper)</code><br>
          <code>border: 1px solid var(--color-border)</code>
        </p>

        <div class="tutorial-badge">Raw HTML: &lt;h2&gt;</div>
        <h2 class="card-title">Custom Typography</h2>
        <p class="tutorial-note">Applied: <code>color: var(--color-text-1)</code></p>

        <div class="tutorial-badge" style="margin-top: 15px;">Raw HTML: &lt;p&gt;</div>
        <p class="body-text">
          This text is highly legible and perfect for standard paragraph bodies.
        </p>
        <p class="tutorial-note">Applied: <code>color: var(--color-text-2)</code></p>

        <div class="tutorial-badge" style="margin-top: 15px;">Raw HTML: &lt;p&gt;</div>
        <p class="muted-text">
          This text is slightly darker than the background, making it perfect for subtle muted notes or timestamps.
        </p>
        <p class="tutorial-note">Applied: <code>color: var(--color-text-3)</code></p>
        
        <br />
        
        <div class="tutorial-badge">Raw HTML: &lt;button&gt;</div>
        <button class="custom-secondary-btn">Run Diagnostics</button>
        <p class="tutorial-note" style="margin-top: 5px;">
          Applied:<br>
          <code>background-color: var(--color-secondary)</code><br>
          <code>color: var(--color-text-1)</code><br>
          <code>border: 1px solid var(--color-border)</code>
        </p>
      </section>

      <el-card shadow="never" class="ep-demo-card">
        <template #header>
          <div class="card-header">
            <div class="tutorial-badge">Element Plus: &lt;el-card&gt;</div>
            <h2 class="card-title" style="margin-top: 5px;">Element Plus Overrides</h2>
            <p class="tutorial-note">
              This component automatically inherits root overrides:<br>
              <code>--el-bg-color-overlay: var(--color-paper)</code><br>
              <code>--el-border-color: var(--color-border)</code>
            </p>
          </div>
        </template>
        
        <div class="tutorial-badge">Element Plus: &lt;el-button&gt;</div>
        <p class="body-text" style="margin-top: 5px; font-size: 14px;">
          These buttons inherit standard Element variables mapped to your custom colors (e.g., <code>--el-color-primary: var(--color-primary)</code>).
        </p>
        
        <div class="button-row">
          <el-button type="primary">Button. Type: "primary"</el-button>
          <el-button type="success">Button. Type: "success"</el-button>
          <el-button type="warning">Button. Type: "warning"</el-button>
          <el-button type="danger">Button. Type: "danger"</el-button>
        </div>

        <div class="tutorial-badge" style="margin-top: 20px;">Element Plus: &lt;el-divider&gt;</div>
        <el-divider />
        <p class="tutorial-note">Inherits: <code>--el-border-color: var(--color-border)</code></p>

        <div class="tutorial-badge" style="margin-top: 20px;">Element Plus: &lt;el-input&gt;</div>
        <el-form label-position="top" style="margin-top: 10px;">
          <el-form-item label="Username">
            <el-input v-model="username" placeholder="Please enter your username" />
          </el-form-item>
          <p class="tutorial-note">
            The input background, border, text, and placeholder automatically use the <code>--el-*</code> variables mapped in your root.
          </p>
          
          <div class="tutorial-badge" style="margin-top: 20px;">Element Plus: &lt;el-alert&gt;</div>
          <el-form-item style="margin-top: 5px;">
            <el-alert 
              title="Database Connection Stable" 
              type="success" 
              :closable="false" 
              show-icon 
            />
          </el-form-item>
           <p class="tutorial-note">
            Alert backgrounds are automatically tinted by Element Plus based on your mapped <code>--el-color-success</code>.
          </p>
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
  margin: 0 0 4px 0;
  color: var(--color-text-1);
}

.subtitle {
  margin: 0 0 4px 0;
  color: var(--color-text-2);
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
}

/* Base text classes */
.card-title {
  margin: 0 0 4px 0;
  font-size: 1.5em;
  color: var(--color-text-1);
}

.body-text {
  color: var(--color-text-2);
  line-height: 1.5;
  margin: 0 0 4px 0;
}

.muted-text {
  color: var(--color-text-3);
  font-size: 13px;
  margin: 0 0 4px 0;
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
  /* Note: Element Plus automatically applies --el-border-color and --el-bg-color-overlay
     if mapped in the root, but we can enforce it here if needed */
  border-color: var(--color-border);
  background-color: var(--color-paper);
}

.button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 10px;
}

/* --- TUTORIAL SPECIFIC STYLES --- */
.tutorial-badge {
  display: inline-block;
  background-color: var(--color-primary);
  color: white;
  font-size: 10px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 3px 8px;
  border-radius: 12px;
  margin-bottom: 4px;
}

.tutorial-note {
  font-size: 12px;
  color: var(--color-text-3);
  font-family: monospace;
  margin: 0;
  padding: 4px 8px;
  background-color: rgba(0,0,0,0.03);
  border-left: 2px solid var(--color-border);
  border-radius: 2px;
}
</style>