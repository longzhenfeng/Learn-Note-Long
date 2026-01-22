<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ArticleService, type Article } from '../services/api';

const articles = ref<Article[]>([]);
const loading = ref(false);
const error = ref('');

const fetchArticles = async () => {
  loading.value = true;
  error.value = '';
  try {
    const res = await ArticleService.getAll();
    articles.value = res.data.data;
  } catch (err) {
    console.error(err);
    error.value = '加载文章失败';
  } finally {
    loading.value = false;
  }
};

onMounted(fetchArticles);
</script>

<template>
  <div class="article-container">
    <h1>文章列表</h1>
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <div v-if="articles.length === 0">暂无文章</div>
      <ul v-else class="article-list">
        <li v-for="item in articles" :key="item.id" class="article-item">
          <h2>{{ item.title }}</h2>
          <p class="content">{{ item.content }}</p>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped lang="scss">
.article-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.article-list {
  list-style: none;
  padding: 0;
}

.article-item {
  padding: 1.5rem 0;
  border-bottom: 1px solid #eee;
}

.article-item h2 {
  margin: 0 0 0.5rem;
}

.article-item .content {
  margin: 0;
  color: #4b5563;
  white-space: pre-wrap;
}
</style>
