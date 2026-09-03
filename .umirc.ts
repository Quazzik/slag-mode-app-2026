import { defineConfig } from '@umijs/max';

export default defineConfig({
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  proxy: {
    '/api/SlagMode': {
      target: 'https://localhost:44324',
      changeOrigin: true,
      secure: false,
    },
  },
  layout: {
    title: '@umijs/max',
  },
  routes: [
    {
      path: '/',
      redirect: '/home',
    },
    {
      name: 'Расчёт',
      path: '/home',
      component: './Home',
    },
    {
      name: 'Справочники',
      path: '/guides',
      component: './Guides',
    },
    {
      name: 'Авторизация',
      path: '/access',
      component: './Access',
    },
  ],
  npmClient: 'npm',
  utoopack: {},
});
