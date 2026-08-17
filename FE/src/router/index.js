import { createRouter, createWebHashHistory } from 'vue-router';
import KuesionerWizard from '../views/KuesionerWizard.vue';
import AdminLogin from '../views/AdminLogin.vue';
import AdminPanel from '../views/AdminPanel.vue';

const routes = [
  {
    path: '/',
    name: 'Kuesioner',
    component: KuesionerWizard
  },
  {
    path: '/admin-survei-login',
    name: 'AdminLogin',
    component: AdminLogin
  },
  {
    path: '/admin',
    name: 'AdminPanel',
    component: AdminPanel,
    beforeEnter: (to, from, next) => {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        next('/admin-survei-login');
      } else {
        next();
      }
    }
  },
  // Fallback redirect
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
