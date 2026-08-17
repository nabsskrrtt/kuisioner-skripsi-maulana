<template>
  <div class="container animate-fade login-container">
    <div class="card login-card">
      <div class="login-header">
        <span class="lock-icon">🔒</span>
        <h2>Portal Peneliti</h2>
        <p>Silakan masuk untuk mengakses Dasbor Kuesioner Maulana Yusuf Angkasa - FKUI</p>
      </div>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label class="form-label" for="username">Username</label>
          <input 
            type="text" 
            id="username" 
            class="form-control" 
            v-model="username" 
            placeholder="Masukkan username admin"
            required
            autocomplete="username"
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="password">Kata Sandi</label>
          <input 
            type="password" 
            id="password" 
            class="form-control" 
            v-model="password" 
            placeholder="Masukkan password admin"
            required
            autocomplete="current-password"
          />
        </div>

        <div v-if="error" class="error-banner animate-fade">
          {{ error }}
        </div>

        <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
          {{ loading ? 'Sedang Masuk...' : 'Masuk ke Dasbor' }}
        </button>
      </form>
      
      <div class="back-link">
        <router-link to="/">Kembali ke Kuesioner</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const username = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

const API_BASE = window.location.hostname === 'localhost' 
  ? 'http://localhost:5005/api' 
  : '/api';

const handleLogin = async () => {
  error.value = '';
  loading.value = true;

  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username.value,
        password: password.value
      })
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_username', data.username);
      router.push('/admin');
    } else {
      error.value = data.message || 'Username atau password salah.';
    }
  } catch (err) {
    console.error('Login error:', err);
    error.value = 'Terjadi kesalahan koneksi ke server.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 100px);
}

.login-card {
  width: 100%;
  max-width: 420px;
  padding: 40px 32px;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.lock-icon {
  font-size: 2.5rem;
  display: inline-block;
  margin-bottom: 12px;
}

.login-header h2 {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 8px;
}

.login-header p {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.btn-block {
  width: 100%;
  margin-top: 8px;
}

.error-banner {
  background-color: var(--pastel-red);
  color: var(--pastel-red-accent);
  padding: 12px;
  border-radius: var(--radius-md);
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 20px;
  text-align: center;
  border: 1px solid #ffccd2;
}

.back-link {
  text-align: center;
  margin-top: 24px;
}

.back-link a {
  color: var(--text-muted);
  font-size: 0.9rem;
  text-decoration: none;
  font-weight: 500;
  transition: var(--transition-smooth);
}

.back-link a:hover {
  color: var(--sky-blue-hover);
}
</style>
