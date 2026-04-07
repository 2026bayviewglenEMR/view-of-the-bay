<template>
  <div class="dashboard-layout">
    
    <header class="header">
      <h1 class="title">System Overview</h1>
      <p class="subtitle">This is some secondary text explaining what this page does.</p>
    </header>

    <div class="grid-container">
      
      <section class="card">
        <h2 class="card-title">Quick Actions</h2>
        <p class="card-text">Here are some buttons you can click to do random things.</p>
        
        <div class="button-group">
          <button class="btn primary-btn">Deploy Server</button>
          <button class="btn secondary-btn">Run Diagnostics</button>
        </div>
        
        <div class="divider"></div>
        <p class="muted-note">Last deployed 2 hours ago.</p>
      </section>

      <section class="card">
        <h2 class="card-title">Active Alerts</h2>
        
        <div class="alert-list">
          <div class="alert alert-danger">
            <strong>Critical:</strong> Database connection lost in Region US-East.
          </div>
          
          <div class="alert alert-warning">
            <strong>Warning:</strong> Server capacity is currently at 89%.
          </div>
          
          <div class="alert alert-success">
            <strong>Resolved:</strong> Nightly backups completed successfully.
          </div>
        </div>
      </section>

    </div>
  </div>
</template>

<style scoped>
/* Assuming your global.css is loaded, we just use the variables!
*/

.dashboard-layout {
  /* Uses the main deep background */
  background-color: var(--color-bg); 
  min-height: 100vh;
  padding: 40px;
  font-family: sans-serif;
}

.header {
  margin-bottom: 30px;
}

.title {
  /* Brightest text for main headers */
  color: var(--color-text-1); 
  margin: 0 0 8px 0;
}

.subtitle {
  /* Softer text for descriptions */
  color: var(--color-text-2); 
  margin: 0;
  font-size: 16px;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.card {
  /* Slightly lighter background for elevation, with a subtle border */
  background-color: var(--color-paper);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 24px;
}

.card-title {
  color: var(--color-text-1);
  margin-top: 0;
  font-size: 18px;
}

.card-text {
  color: var(--color-text-2);
  line-height: 1.5;
  margin-bottom: 20px;
}

/* BUTTONS */
.button-group {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.primary-btn {
  /* Primary color, plus hover state */
  background-color: var(--color-primary);
  color: #fff; /* Keeping white for strict contrast on the button */
}
.primary-btn:hover {
  background-color: var(--color-primary-hover);
}

.secondary-btn {
  /* Secondary accent color */
  background-color: var(--color-secondary);
  color: #fff;
}
.secondary-btn:hover {
  opacity: 0.8;
}

/* DIVIDER & MUTED TEXT */
.divider {
  height: 1px;
  background-color: var(--color-border);
  margin: 20px 0;
}

.muted-note {
  /* The darkest/most subtle text color for tiny notes */
  color: var(--color-text-3);
  font-size: 12px;
  margin: 0;
}

/* ALERTS */
.alert-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.alert {
  padding: 12px;
  border-radius: 6px;
  border-left: 4px solid;
  font-size: 14px;
  /* Using text-1 so it's readable over the dark tinted backgrounds */
  color: var(--color-text-1); 
}

.alert-danger {
  /* Tinting the background slightly red, keeping the bright border */
  background-color: rgba(239, 68, 68, 0.1);
  border-color: var(--color-danger);
}

.alert-warning {
  /* Tinting the background slightly yellow, keeping the bright border */
  background-color: rgba(245, 158, 11, 0.1);
  border-color: var(--color-warning);
}

.alert-success {
  /* Tinting the background slightly green, keeping the bright border */
  background-color: rgba(16, 185, 129, 0.1);
  border-color: var(--color-success);
}
</style>