<template>
  <div id="emr-app">
    <nav class="dev-navigation">
      <h3>EMR Dev Menu</h3>
      <div class="nav-links">
        <router-link to="/login" class="nav-btn">- Login</router-link>
      <div></div>
        <router-link to="/dashboard" class="nav-btn">- Dashboard</router-link>
      </div>
    </nav>

    <main class="page-content">
      <router-view />
    </main>
  </div>
</template>