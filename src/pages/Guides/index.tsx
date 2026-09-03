import { editMaterial, getMaterials } from '@/services/slagMode';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { history } from '@umijs/max';
import { Button, Card, Form, Input, List, Modal, message } from 'antd';
import { useEffect, useState } from 'react';

const GuidesPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>();
  const [form] = Form.useForm();
  const load = async () => {
    try {
      const data = await getMaterials();
      setItems(data?.data || data || []);
    } catch {
      message.error('Не удалось загрузить справочник');
    }
  };
  useEffect(() => {
    if (!localStorage.getItem('slag_user')) {
      history.replace('/access');
      return;
    }
    load();
  }, []);
  const open = (item?: any) => {
    setEditing(item || {});
    form.setFieldsValue(item || {});
  };
  const submit = async (values: any) => {
    try {
      await editMaterial({ ...editing, ...values });
      message.success('Элемент сохранён');
      setEditing(undefined);
      load();
    } catch {
      message.error('Не удалось сохранить элемент');
    }
  };
  return (
    <PageContainer title="Справочники">
      <Card style={{ marginTop: 16 }}>
        <List
          dataSource={items}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button
                  key="edit"
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => open(item)}
                />,
                <Button
                  key="delete"
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() =>
                    Modal.confirm({
                      title: 'Удалить элемент?',
                      onOk: () => submit({ ...item, deleted: true }),
                    })
                  }
                />,
              ]}
            >
              <List.Item.Meta
                title={
                  item.ruNameShihta ||
                  item.nameShihta ||
                  `Элемент ${item.componentID}`
                }
                description={Object.entries(item)
                  .filter(
                    ([key]) => !['ruNameShihta', 'nameShihta'].includes(key),
                  )
                  .slice(0, 5)
                  .map(([key, value]) => `${key}: ${value}`)
                  .join(' | ')}
              />
            </List.Item>
          )}
        />
      </Card>
      <Modal
        open={editing !== undefined}
        title={
          editing?.componentID ? 'Редактировать элемент' : 'Добавить элемент'
        }
        onCancel={() => setEditing(undefined)}
        onOk={() => form.submit()}
        okText="Сохранить"
        cancelText="Закрыть"
      >
        <Form form={form} layout="vertical" onFinish={submit}>
          <Form.Item
            name="ruNameShihta"
            label="Название"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          {[
            'fe',
            'feO',
            'fe2O3',
            'siO2',
            'al2O3',
            'caO',
            'mgO',
            's',
            'mnO',
            'zn',
            'pmpp',
            'h2O',
            'tiO2',
            'cr',
          ].map((key) => (
            <Form.Item key={key} name={key} label={key}>
              <Input />
            </Form.Item>
          ))}
        </Form>
      </Modal>
    </PageContainer>
  );
};
export default GuidesPage;
