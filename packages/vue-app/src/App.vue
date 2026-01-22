<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
</script>

<template>
  <div class="app-layout">
    <header class="nav">
      <!-- 用户管理按钮 -->
      <RouterLink to="/" class="nav-link">用户管理</RouterLink>
      <!-- 文章列表按钮 -->
      <RouterLink to="/articles" class="nav-link">文章列表</RouterLink>
    </header>
    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped lang="scss">
.app-layout {
  min-height: 100vh;
  background: #f9fafb;
}

.nav {
  display: flex;
  gap: 1rem;
  padding: 1rem 2rem;
  background: #111827;
}

.nav-link {
  color: #e5e7eb;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;

  &.router-link-active {
    background: #f9fafb;
    color: #111827;
  }
}

.content {
  padding: 2rem;
}
</style>
