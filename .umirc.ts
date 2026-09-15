import { defineConfig } from '@umijs/max';

export default defineConfig({
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  proxy: {
    '/api/SlagMode': {
      target: 'https://localhost:7258',
      changeOrigin: true,
      secure: false,
    },
    '/api/SostavOfAglom': {
      target: 'http://localhost:5296',
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
      name: 'Расчёт шлака',
      path: '/home',
      component: './Home',
    },
    {
      name: 'Расчёт аглошихты',
      path: '/aglom',
      component: './Aglom',
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
