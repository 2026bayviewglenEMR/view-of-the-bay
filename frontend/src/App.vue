<template>
  <div id="emr-app">
    <nav class="dev-navigation">
      <h3>EMR Dev Menu</h3>
      <div class="nav-links">
        <router-link to="/" class="nav-btn">1. Login</router-link>
      </div>
    </nav>

    <main class="page-content">
      <router-view />
    </main>
  </div>
</template>