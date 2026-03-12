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
  {
    path: '/test',
    name: 'test',
    component: () => import('./views/TestView.tsx'),
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
