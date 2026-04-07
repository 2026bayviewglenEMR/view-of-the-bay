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

        <el-button @click.prevent @click="signIn" type="primary" class="full-width">Log In</el-button>
        <el-button @click="testServer" type="primary" class="full-width">Test Server</el-button>
      </el-form>
      
      <div class="footer">
        <el-link @click="forgotPassword" type="info">Forgot Password?</el-link>
        <el-alert
          v-if="error"
          title="Error"
          type="error"
          :description="error"
          show-icon
          :closable="true"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { api } from './../api/api';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const username = ref("");
const password = ref("");
const error = ref("");

const signIn = async () => {
    console.log("signing in");
    try {
      const res = await api.signIn(username.value, password.value);
      if (res) {
        console.log("Authenticated");
        router.push("/")
      } else {
        error.value = res.error
      }
    } catch (e) {
      error.value = e?.response?.data?.message || e?.message || "An unexpected server error occurred.";
    }
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