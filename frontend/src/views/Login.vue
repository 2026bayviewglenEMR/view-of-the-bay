<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <h2 class="login-title">Vue of the Bay</h2>
      </template>

      <el-form label-position="top">
        <el-form-item label="Username">
          <el-input v-model="username" placeholder="Please enter your username" />
        </el-form-item>

        <el-form-item label="Password">
          <el-input v-model="password" type="password" placeholder="Please enter password" show-password />
        </el-form-item>

        <el-button @click="submit" type="primary" class="full-width">Log In</el-button>
        <el-button @click="testServer" type="primary" class="full-width">Test Server</el-button>
      </el-form>
      
      <div class="footer">
        <el-link @click="forgotPassword" type="info">Forgot Password?</el-link>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { api } from './../api/api';
import { ref } from 'vue';

const username = ref("");
const password = ref("");

const submit = () => {
    console.log(username.value, password.value);
}

const forgotPassword = () => {
    alert("TODO: implement forgot password");
}

const testServer = async () => {
  alert("testing");
  const res = await api.testServer();
  alert(JSON.stringify(res));
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
.login-card {
  width: 400px;
  background-color: var(--color-paper)
}
.login-title {
  margin: 0;
  text-align: center;
}
.full-width {
  width: 100%;
  margin-top: 10px;
}
.footer {
  margin-top: 20px;
  text-align: center;
}
</style>