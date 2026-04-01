<template>
  <div id="emr-app">
    <nav class="dev-navigation">
      <h3>EMR Dev Menu</h3>
      <div class="nav-links">
        <router-link to="/" class="nav-btn">1. Login</router-link>
        <br>
        <router-link to="/dashboard" class="nav-btn">2. Dashboard</router-link>
        <br>
        <router-link to="/directory" class="nav-btn">3. Directory</router-link>
        <br>
        <router-link to="/record" class="nav-btn">4. Record</router-link>
        <br>
        <router-link to="/consultation" class="nav-btn">5. Consultation</router-link>
        <br>
        <router-link to="/prescriptions" class="nav-btn">6. Prescriptions</router-link>
        <br>
        <router-link to="/scheduling" class="nav-btn">7. Scheduling</router-link>
      </div>
    </nav>

    <main class="page-content">
      <router-view />
    </main>
  </div>
</template>