import HistoryTooltip from '@/components/HistoryTooltip';
import defaultInput from '@/data/defaultInput.json';
import { calculate, deleteCalculation, getBlastFurnaces, getHistory, getMaterials, saveCalculation } from '@/services/slagMode';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { history } from '@umijs/max';
import { Button, Card, Checkbox, Col, Form, InputNumber, List, message, Modal, Row, Select, Space, Tag, Tooltip, Typography } from 'antd';
import { useEffect, useState } from 'react';
import styles from './index.less';

const HomePage: React.FC = () => {
  const [form] = Form.useForm();
  const [materials, setMaterials] = useState<any[]>([]);
  const [furnaces, setFurnaces] = useState<any[]>([]);
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>();
  const [result, setResult] = useState<any>();
  const [loadingHistory, setLoadingHistory] = useState(false);
  const componentValues = Form.useWatch('components', form) || [];
  useEffect(() => {
    if (!localStorage.getItem('slag_user')) { history.replace('/access'); return; }
    form.setFieldsValue(defaultInput);
    Promise.all([getMaterials(), getBlastFurnaces()]).then(([m, f]) => { setMaterials(m?.data || m || []); setFurnaces(f?.data || f || []); }).catch(() => message.warning('Справочники пока недоступны'));
  }, []);
  const loadHistory = async () => { setLoadingHistory(true); try { const data = await getHistory(Number(localStorage.getItem('slag_user_id'))); setHistoryItems(data?.data || data || []); } catch { message.error('Не удалось загрузить историю'); } finally { setLoadingHistory(false); } };
  const addComponent = () => form.setFieldValue('components', [...(form.getFieldValue('components') || []), { sourcename: undefined, consumption: 0 }]);
  const submit = async (values: any) => { try { const response = await calculate(values); setResult(response?.data || response); message.success('Расчёт выполнен'); } catch { message.error('Ошибка расчёта'); } };
  const save = () => Modal.confirm({ title: 'Сохранить расчёт', content: <Input id="calc-name" placeholder="Название расчёта" />, onOk: async () => { const name = (document.getElementById('calc-name') as HTMLInputElement)?.value; await saveCalculation({ parameters: { ...(form.getFieldsValue(true)), variantName: name }, charges: form.getFieldValue('components') }); message.success('Расчёт сохранён'); } });
  const fields = [['iron', 'Чугун'], ['slag', 'Шлак'], ['coke', 'Кокс']];
  return (
    <div className={styles.page}><Typography.Title level={2}>Расчёт шихты</Typography.Title>
      <Row gutter={24}><Col xs={24} xl={17}><Form form={form} layout="vertical" onFinish={submit}>
        <Card title="Параметры расчёта" bordered={false}><Row gutter={16}>
          <Col span={12}><Form.Item name={['parameters', 'blastFurnaceID']} label="Доменная печь"><Select options={furnaces.map(item => ({ value: item.id || item.blastFurnaceID, label: item.name || item.nameBlastFurnace || item.ruName }))} /></Form.Item></Col>
          {fields.map(([group, title]) => <Col span={8} key={group}><Typography.Text strong>{title}</Typography.Text>{Object.keys((defaultInput as any)[group]).map(key => <Form.Item key={key} name={[group, key]} label={key}><InputNumber style={{ width: '100%' }} /></Form.Item>)}</Col>)}
        </Row></Card>
        <Space className={styles.actions}><Button icon={<PlusOutlined />} onClick={addComponent}>Добавить компонент</Button><Button type="primary" htmlType="submit">Рассчитать</Button><Button onClick={save}>Сохранить</Button></Space>
        <Form.List name="components">{(items, { remove }) => <Row gutter={[16, 16]}>{items.map(({ key, name, ...rest }) => <Col xs={24} md={12} lg={8} key={key}><Card title={<Form.Item {...rest} name={[name, 'sourcename']} noStyle><Select placeholder="Компонент" options={materials.map(item => ({ value: item.nameShihta || item.ruNameShihta, label: item.ruNameShihta || item.nameShihta }))} /></Form.Item>} extra={<Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(name)} />}><Form.Item {...rest} name={[name, 'enabled']} valuePropName="checked" initialValue={true}><Checkbox>Используется</Checkbox></Form.Item><Form.Item {...rest} name={[name, 'consumption']} label="Расход"><InputNumber style={{ width: '100%' }} disabled={componentValues[name]?.enabled === false} /></Form.Item>{['fe','siO2','al2O3','caO','mgO','s','mnO','tiO2'].map(field => <Form.Item {...rest} key={field} name={[name, field]} label={field}><InputNumber style={{ width: '100%' }} disabled={componentValues[name]?.enabled === false} /></Form.Item>)}</Card></Col>)}</Row>}</Form.List>
        {result && <Card title="Результат" className={styles.result}><pre>{JSON.stringify(result, null, 2)}</pre></Card>}
      </Form></Col><Col xs={24} xl={7}><Card title="История расчётов" extra={<Button loading={loadingHistory} onClick={loadHistory}>Загрузить историю</Button>}><List className={styles.history} dataSource={historyItems} locale={{ emptyText: 'История не загружена' }} renderItem={(item) => <Tooltip placement="left" title={<HistoryTooltip calculation={item} />}><List.Item onClick={() => setSelected(item)}><Typography.Text>{item.variantName || item.parameters?.variantName || 'Без названия'}</Typography.Text>{selected === item && <Tag color="blue">Выбран</Tag>}</List.Item></Tooltip>} /></Card>{selected && <Space className={styles.historyActions}><Button onClick={() => { form.setFieldsValue(selected.parameters || selected); message.success('Данные загружены'); }}>Загрузить</Button><Button danger onClick={() => Modal.confirm({ title: 'Удалить расчёт?', onOk: async () => { await deleteCalculation(selected.variantID); setHistoryItems(items => items.filter(item => item !== selected)); setSelected(undefined); } })}>Удалить</Button></Space>}</Col></Row></div>
  );
};

export default HomePage;
