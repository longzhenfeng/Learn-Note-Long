<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { StatusBar, Style } from '@capacitor/status-bar';
import { UserService, type User } from './services/api';
import { Capacitor } from '@capacitor/core';

const users = ref<User[]>([]);
const loading = ref(false);
const showModal = ref(false);

const form = ref<Omit<User, 'id'>>({
  name: '',
  age: 18,
  address: '',
  hobbies: [],
  role: 'user',
});

const hobbyInput = ref('');

const editingId = ref<string | null>(null);

const fetchUsers = async () => {
  loading.value = true;
  try {
    const res = await UserService.getAll();
    users.value = res.data.data;
  } catch (err) {
    console.error(err);
    alert('加载失败');
  } finally {
    loading.value = false;
  }
};

const handleDelete = async (id: string) => {
  if (!confirm('确定删除吗?')) return;
  try {
    await UserService.delete(id);
    await fetchUsers();
  } catch (err) {
    alert('删除失败');
  }
};

const handleEdit = (user: User) => {
  editingId.value = user.id;
  form.value = {
    name: user.name,
    age: user.age,
    address: user.address,
    hobbies: [...user.hobbies],
    role: user.role
  };
  showModal.value = true;
};

const handleAddHobby = () => {
  if (hobbyInput.value) {
    form.value.hobbies.push(hobbyInput.value);
    hobbyInput.value = '';
  }
};

const closeModal = () => {
  showModal.value = false;
  editingId.value = null;
  form.value = { name: '', age: 18, address: '', hobbies: [], role: 'user' };
};

const handleSubmit = async () => {
  try {
    if (editingId.value) {
      await UserService.update(editingId.value, form.value);
    } else {
      await UserService.create(form.value);
    }
    closeModal();
    await fetchUsers();
  } catch (err) {
    alert(editingId.value ? '更新失败' : '创建失败');
  }
};

onMounted(async () => {
  await fetchUsers();
  
  // 适配 Android/iOS 沉浸式状态栏
  if (Capacitor.isNativePlatform()) {
    try {
      // 将 WebView 延伸到状态栏下方
      await StatusBar.setOverlaysWebView({ overlay: true });
      // 设置状态栏文字颜色（Light = 白色文字，用于深色背景；Dark = 黑色文字，用于浅色背景）
      await StatusBar.setStyle({ style: Style.Light });
    } catch (e) {
      console.error('StatusBar plugin not available', e);
    }
  }
});
</script>

<template>
  <div class="container">
    <div class="header">
      <h1>用户管理</h1>
      <button class="btn primary" @click="showModal = true">新增用户</button>
    </div>

    <div v-if="loading" class="loading">加载中...</div>

    <div v-else class="grid">
      <div v-for="user in users" :key="user.id" class="card">
        <div class="card-header">
          <h3>{{ user.name }}</h3>
          <span :class="['tag', user.role]">{{ user.role }}</span>
        </div>
        <div class="card-body">
          <p><strong>年龄:</strong> {{ user.age }}</p>
          <p><strong>地址:</strong> {{ user.address }}</p>
          <div class="hobbies">
            <span v-for="hobby in user.hobbies" :key="hobby" class="hobby-tag">#{{ hobby }}</span>
          </div>
        </div>
        <div class="card-footer">
          <button class="btn" @click="handleEdit(user)" style="margin-right: 8px;">编辑</button>
          <button class="btn danger" @click="handleDelete(user.id)">删除</button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h2>{{ editingId ? '编辑用户' : '新增用户' }}</h2>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>姓名</label>
            <input v-model="form.name" required />
          </div>
          <div class="form-group">
            <label>年龄</label>
            <input type="number" v-model="form.age" required />
          </div>
          <div class="form-group">
            <label>地址</label>
            <input v-model="form.address" required />
          </div>
          <div class="form-group">
            <label>角色</label>
            <select v-model="form.role">
              <option value="user">普通用户</option>
              <option value="admin">管理员</option>
              <option value="guest">访客</option>
            </select>
          </div>
          <div class="form-group">
            <label>爱好 (回车添加)</label>
            <div class="hobby-input">
              <input v-model="hobbyInput" @keydown.enter.prevent="handleAddHobby" placeholder="输入爱好按回车" />
              <div class="tags">
                <span v-for="(h, i) in form.hobbies" :key="i" class="hobby-tag">
                  {{ h }} <span class="remove" @click="form.hobbies.splice(i, 1)">×</span>
                </span>
              </div>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn" @click="closeModal">取消</button>
            <button type="submit" class="btn primary">保存</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  min-height: 100vh;
  background: #f9fafb;

  @media (min-width: 768px) {
    padding: 2rem;
  }
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;

  h1 {
    font-size: 1.5rem;
    color: #333;
    margin: 0;

    @media (min-width: 768px) {
      font-size: 2rem;
    }
  }
}

.loading {
  text-align: center;
  padding: 3rem;
  font-size: 1.125rem;
  color: #64748b;
}

.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }
}

.card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.2s;

  @media (min-width: 768px) {
    padding: 1.5rem;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
    }
  }

  &-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    gap: 0.5rem;
    
    h3 { 
      margin: 0; 
      font-size: 1.125rem;
      word-break: break-word;

      @media (min-width: 768px) {
        font-size: 1.25rem;
      }
    }
  }

  &-body {
    p {
      margin: 0.5rem 0;
      font-size: 0.9375rem;
      line-height: 1.6;
    }
  }

  &-footer {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #eee;
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
}

.tag {
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.8125rem;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;

  &.admin { background: #e0f2fe; color: #0369a1; }
  &.user { background: #dcfce7; color: #15803d; }
  &.guest { background: #f3f4f6; color: #4b5563; }
}

.hobbies {
  margin-top: 0.75rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.hobby-tag {
  display: inline-block;
  background: #f1f5f9;
  color: #64748b;
  padding: 0.25rem 0.625rem;
  border-radius: 4px;
  font-size: 0.8125rem;
  
  .remove { 
    cursor: pointer; 
    color: #999; 
    margin-left: 4px;
    font-size: 1rem;
    
    &:hover { color: #ef4444; }
  }
}

.btn {
  padding: 0.625rem 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9375rem;
  transition: all 0.2s;
  white-space: nowrap;
  min-height: 44px; // 触摸友好的最小尺寸
  display: inline-flex;
  align-items: center;
  justify-content: center;

  @media (min-width: 768px) {
    padding: 0.6rem 1.2rem;
    min-height: auto;
  }

  &.primary {
    background: #000;
    color: white;
    
    &:hover { background: #333; }
    &:active { background: #555; }
  }

  &.danger {
    background: #fee2e2;
    color: #b91c1c;
    
    &:hover { background: #fecaca; }
    &:active { background: #fca5a5; }
  }
}

.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(4px);
  z-index: 1000;
  padding: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;

  @media (min-width: 768px) {
    padding: 1rem;
  }
}

.modal {
  background: white;
  padding: 1.25rem;
  /* 适配安全区 */
  padding-top: calc(1.25rem + env(safe-area-inset-top));
  padding-bottom: calc(1.25rem + env(safe-area-inset-bottom));
  padding-left: calc(1.25rem + env(safe-area-inset-left));
  padding-right: calc(1.25rem + env(safe-area-inset-right));
  border-radius: 0;
  width: 100%;
  max-width: 100%;
  height: 100%;
  max-height: 100vh;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;

  @media (min-width: 640px) {
    padding: 1.5rem;
    border-radius: 12px;
    width: 90%;
    max-width: 500px;
    height: auto;
    max-height: 90vh;
  }

  @media (min-width: 768px) {
    padding: 2rem;
    border-radius: 16px;
  }

  h2 { 
    margin-top: 0;
    font-size: 1.25rem;

    @media (min-width: 768px) {
      font-size: 1.5rem;
    }
  }
}

.form-group {
  margin-bottom: 1.25rem;
  display: flex;
  flex-direction: column;

  label {
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #374151;
    font-size: 0.9375rem;
  }

  input, select {
    padding: 0.875rem;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 1rem;
    min-height: 44px; // 触摸友好
    -webkit-appearance: none;
    appearance: none;
    
    &:focus { 
      outline: 2px solid #000; 
      border-color: transparent;
      outline-offset: 0;
    }
  }

  select {
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
    background-position: right 0.5rem center;
    background-repeat: no-repeat;
    background-size: 1.5em 1.5em;
    padding-right: 2.5rem;
  }
}

.hobby-input {
  .tags {
    margin-top: 0.75rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;

  @media (max-width: 640px) {
    flex-direction: column-reverse;

    .btn {
      width: 100%;
    }
  }
}
</style>
