import { defineConfig } from '@umijs/max';

export default defineConfig({
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
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
      name: 'Авторизация',
      path: '/access',
      component: './Access',
    },
    {
      name: 'Справочники',
      path: '/guides',
      component: './Guides',
    },
  ],
  npmClient: 'npm',
  utoopack: {},
});

