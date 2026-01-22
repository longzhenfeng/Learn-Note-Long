<script setup lang="ts">
// 直接复用原 App.vue 的用户管理逻辑
import { ref, onMounted } from 'vue';
import { UserService, type User } from '../services/api';

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
    role: user.role,
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

onMounted(fetchUsers);
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
              <input
                v-model="hobbyInput"
                @keydown.enter.prevent="handleAddHobby"
                placeholder="输入爱好按回车"
              />
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
  padding: 2rem;
  font-family: 'Inter', sans-serif;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;

  h1 {
    font-size: 2rem;
    color: #333;
  }
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
  }

  &-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    
    h3 { margin: 0; font-size: 1.25rem; }
  }

  &-footer {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #eee;
    text-align: right;
  }
}

.tag {
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 500;

  &.admin { background: #e0f2fe; color: #0369a1; }
  &.user { background: #dcfce7; color: #15803d; }
  &.guest { background: #f3f4f6; color: #4b5563; }
}

.hobby-tag {
  display: inline-block;
  background: #f1f5f9;
  color: #64748b;
  padding: 0.1rem 0.5rem;
  border-radius: 4px;
  margin-right: 0.5rem;
  font-size: 0.8rem;
  
  .remove { cursor: pointer; color: #999; margin-left: 4px; }
}

.btn {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;

  &.primary {
    background: #000;
    color: white;
    &:hover { background: #333; }
  }

  &.danger {
    background: #fee2e2;
    color: #b91c1c;
    &:hover { background: #fecaca; }
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
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);

  h2 { margin-top: 0; }
}

.form-group {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;

  label {
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #374151;
  }

  input, select {
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 1rem;
    
    &:focus { outline: 2px solid #000; border-color: transparent; }
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}
</style>
