<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <h2 class="login-title">View of the Bay</h2>
      </template>

      <el-form label-position="top">
        <el-form-item label="Username">
          <el-input placeholder="Please enter your username" />
        </el-form-item>

        <el-form-item label="Password">
          <el-input type="password" placeholder="Please enter password" show-password />
        </el-form-item>

        <el-button type="primary" class="full-width">Log In</el-button>
      </el-form>
      
      <div class="footer">
        <el-link type="info">Forgot Password?</el-link>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
.login-card {
  width: 400px;
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