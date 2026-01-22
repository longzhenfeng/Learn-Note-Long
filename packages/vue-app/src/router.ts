import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import UserView from './views/UserView.vue';
import ArticleView from './views/ArticleView.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'users',
    component: UserView,
  },
  {
    path: '/articles',
    name: 'articles',
    component: ArticleView,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
