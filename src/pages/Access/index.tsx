import { login } from '@/services/slagMode';
import { history } from '@umijs/max';
import { Button, Card, Form, Input, message, Typography } from 'antd';
import { useEffect } from 'react';

const AccessPage: React.FC = () => {
  const [form] = Form.useForm();
  useEffect(() => { if (localStorage.getItem('slag_user')) history.replace('/home'); }, []);
  const submit = async (values: { userName: string; password: string }) => {
    try {
      const result = await login(values);
      const token = result?.token || result?.jwt || result?.data?.token || values.userName;
      localStorage.setItem('slag_user', String(token));
      localStorage.setItem('slag_user_id', String(result?.userID || result?.data?.userID || 0));
      message.success('Вход выполнен');
      history.replace('/home');
    } catch { message.error('Не удалось выполнить вход'); }
  };
  return (
    <main style={{ maxWidth: 420, margin: '12vh auto', padding: 24 }}>
      <Typography.Title level={1}>Slag Mode</Typography.Title>
      <Typography.Paragraph type="secondary">Расчёт шихты и управление справочниками</Typography.Paragraph>
      <Card><Form form={form} layout="vertical" onFinish={submit}>
        <Form.Item name="userName" label="Логин" rules={[{ required: true, message: 'Введите логин' }]}><Input autoComplete="username" /></Form.Item>
        <Form.Item name="password" label="Пароль" rules={[{ required: true, message: 'Введите пароль' }]}><Input.Password autoComplete="current-password" /></Form.Item>
        <Button type="primary" htmlType="submit" block>Войти</Button>
      </Form></Card>
    </main>
  );
};

export default AccessPage;
