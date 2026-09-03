import { Button } from 'antd';
import React from 'react';

// 运行时配置

// 全局初始化数据配置，用于 Layout 用户信息和权限初始化
// 更多信息见文档：https://umijs.org/docs/api/runtime-config#getinitialstate
export async function getInitialState(): Promise<{ name: string }> {
  return { name: localStorage.getItem('slag_user') || '' };
}

export const layout = () => {
  return {
    title: 'Slag Mode',
    logo: false,
    menu: {
      locale: false,
    },
    rightRender: () =>
      localStorage.getItem('slag_user')
        ? React.createElement(
            Button,
            {
              type: 'primary',
              danger: true,
              size: 'small',
              onClick: () => {
                localStorage.removeItem('slag_user');
                localStorage.removeItem('slag_user_id');
                window.location.href = '/access';
              },
              style: { borderRadius: 8 },
            },
            'Выйти',
          )
        : null,
  };
};
