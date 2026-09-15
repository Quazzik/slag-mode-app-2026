import {
  calculateAglom,
  deleteAglomPreset,
  getAglomDefaultPreset,
  getAglomHistory,
  getAglomPreset,
} from '@/services/slagMode';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { history } from '@umijs/max';
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  List,
  Modal,
  Row,
  Col,
  Space,
  Table,
  message,
  Typography,
} from 'antd';
import { useEffect, useState } from 'react';

const componentFields = [
  'name',
  'weight',
  'wet',
  'pmpp',
  'fe',
  'feO',
  'caO',
  'siO2',
  'mgO',
  'al2O3',
  'tiO2',
  's',
  'p',
  'cr',
  'zn',
  'mnO',
];

const formatTableValue = (value: any) => {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

const getResultTableRows = (data: any): Array<Record<string, any>> => {
  if (Array.isArray(data)) {
    return data.filter((row) => row && typeof row === 'object');
  }

  if (!data || typeof data !== 'object') {
    return [];
  }

  const candidateKeys = ['components', 'shihtaComponents', 'rows', 'items', 'data', 'result'];
  for (const key of candidateKeys) {
    const value = (data as Record<string, any>)[key];
    if (Array.isArray(value)) {
      return value.filter((row) => row && typeof row === 'object');
    }
  }

  const nestedArray = Object.values(data).find((value) => Array.isArray(value));
  if (nestedArray) {
    return (nestedArray as any[]).filter((row) => row && typeof row === 'object');
  }

  return [data];
};

const getResultTableColumns = (rows: Array<Record<string, any>>) => {
  const columns = new Set<string>();
  rows.forEach((row) => Object.keys(row).forEach((key) => columns.add(key)));
  return Array.from(columns);
};

const AglomPage: React.FC = () => {
  const [form] = Form.useForm();
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [resultData, setResultData] = useState<any>(null);

  useEffect(() => {
    if (!localStorage.getItem('slag_user')) {
      history.replace('/access');
      return;
    }
    // initialize empty structure
    form.setFieldsValue({
      zolaOfCocksick: {},
      cocksick: {},
      fluxAdditions: {},
      shihtaComponents: [],
      startEnter: {},
      createPreset: false,
    });
  }, []);

  const submit = async (createPreset = false) => {
    try {
      const values = await form.validateFields();
      const payload = { ...values };
      payload.userId = Number(localStorage.getItem('slag_user_id') || 0);
      payload.createPreset = Boolean(createPreset);
      const res = await calculateAglom(payload);
      const nextResult = res?.data ?? res ?? {};
      setResultData(nextResult);
      setResultModalVisible(true);
      message.success('Расчёт выполнен');
    } catch (e: any) {
      if (e?.errorFields) {
        message.error('Проверьте обязательные поля');
      } else {
        message.error('Ошибка расчёта');
      }
    }
  };

  const loadDefault = async () => {
    try {
      const res = await getAglomDefaultPreset(Number(localStorage.getItem('slag_user_id')) || undefined);
      const data = res?.data ?? res ?? {};
      form.setFieldsValue(data);
      message.success('Стандартные данные загружены');
    } catch {
      message.error('Не удалось загрузить стандартные данные');
    }
  };

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await getAglomHistory(Number(localStorage.getItem('slag_user_id')) || undefined);
      setHistoryItems(res?.data || res || []);
      message.success('История загружена');
    } catch {
      message.error('Не удалось загрузить историю');
    } finally {
      setLoadingHistory(false);
    }
  };

  const loadPreset = async (id: number) => {
    try {
      const res = await getAglomPreset(id);
      const data = res?.data ?? res ?? {};
      form.setFieldsValue(data);
      message.success('Пресет загружен');
    } catch {
      message.error('Не удалось загрузить пресет');
    }
  };

  const removePreset = async (presetId: number) => {
    try {
      await deleteAglomPreset(presetId);
      setHistoryItems((items) => items.filter((it) => it.id !== presetId && it.presetId !== presetId));
      message.success('Пресет удалён');
    } catch {
      message.error('Ошибка удаления пресета');
    }
  };

  return (
    <PageContainer title="Расчёт аглошихты">
      <Form form={form} layout="vertical">
        <Card title="Характеристики золы кокса" style={{ marginTop: 16 }}>
          <Row gutter={12}>
            <Col span={4}>
              <Form.Item name={[ 'zolaOfCocksick', 'fe' ]} label="Fe">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name={[ 'zolaOfCocksick', 'caO' ]} label="CaO">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name={[ 'zolaOfCocksick', 'siO2' ]} label="SiO2">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name={[ 'zolaOfCocksick', 'al2O3' ]} label="Al2O3">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name={[ 'zolaOfCocksick', 'mgO' ]} label="MgO">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name={[ 'zolaOfCocksick', 'p' ]} label="P">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card title="Характеристики кокса" style={{ marginTop: 16 }}>
          <Row gutter={12}>
            <Col span={6}>
              <Form.Item name={[ 'cocksick', 'weight' ]} label="Вес">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name={[ 'cocksick', 'percentZola' ]} label="% золы">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name={[ 'cocksick', 'percentSera' ]} label="% S">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name={[ 'cocksick', 'percentValotiles' ]} label="% volatiles">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card title="Характеристики флюсовых добавок" style={{ marginTop: 16 }}>
          <Row gutter={12}>
            <Col span={6}>
              <Form.Item name={[ 'fluxAdditions', 'izvestnyakCaO' ]} label="Известняк CaO">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name={[ 'fluxAdditions', 'izvestnyakSiO2' ]} label="Известняк SiO2">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name={[ 'fluxAdditions', 'dolomyteCaO' ]} label="Доломит CaO">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name={[ 'fluxAdditions', 'dolomyteSiO2' ]} label="Доломит SiO2">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card title="Компоненты шихты" style={{ marginTop: 16 }}>
          <Form.List name="shihtaComponents">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...rest }) => (
                  <Card size="small" key={key} style={{ marginBottom: 12 }}>
                    <Row gutter={12}>
                      {componentFields.map((field) => (
                        <Col span={6} key={field}>
                          <Form.Item {...rest} name={[name, field]} label={field}>
                            {field === 'name' ? (
                              <Input />
                            ) : (
                              <InputNumber style={{ width: '100%' }} />
                            )}
                          </Form.Item>
                        </Col>
                      ))}
                    </Row>
                    <Button danger onClick={() => remove(name)}>
                      Удалить компонент
                    </Button>
                  </Card>
                ))}
                <Form.Item>
                  <Button icon={<PlusOutlined />} onClick={() => add({})}>
                    Добавить компонент
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Card>

        <Card title="Исходные параметры" style={{ marginTop: 16 }}>
          <Row gutter={12}>
            <Col span={6}>
              <Form.Item name={[ 'startEnter', 'osnovnost' ]} label="Основность">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name={[ 'startEnter', 'feOinAgl' ]} label="FeO in Agl">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name={[ 'startEnter', 'dolomyteInAgl' ]} label="Dolomyte in Agl">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Space style={{ marginTop: 16 }}>
          <Button type="primary" onClick={() => submit(false)}>
            Рассчитать
          </Button>
          <Button onClick={() => submit(true)}>Сохранить</Button>
          <Button onClick={loadDefault}>Загрузить стандартные данные</Button>
          <Button loading={loadingHistory} onClick={loadHistory}>Загрузить историю</Button>
        </Space>
      </Form>

      <Card title="История пресетов" style={{ marginTop: 16 }}>
        <List
          dataSource={historyItems}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button key="load" type="link" onClick={() => loadPreset(item.id ?? item.presetId)}>
                  Загрузить
                </Button>,
                <Button key="delete" type="text" danger icon={<DeleteOutlined />} onClick={() =>
                  Modal.confirm({ title: 'Удалить пресет?', onOk: () => removePreset(item.id ?? item.presetId) })
                } />,
              ]}
            >
              <List.Item.Meta
                title={item.name || item.variantName || item.id || item.presetId}
                description={item.date || item.createdAt || JSON.stringify(item).slice(0, 80)}
              />
            </List.Item>
          )}
        />
      </Card>

      <Modal
        title="Результат расчёта"
        open={resultModalVisible}
        onCancel={() => setResultModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setResultModalVisible(false)}>
            Закрыть
          </Button>,
        ]}
        width={900}
      >
        {(() => {
          const rows = getResultTableRows(resultData);
          const columns = getResultTableColumns(rows);

          if (!rows.length) {
            return <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{typeof resultData === 'string' ? resultData : 'Нет данных'}</pre>;
          }

          return (
            <Table
              size="small"
              pagination={false}
              scroll={{ x: 'max-content' }}
              columns={columns.map((column) => ({
                title: column,
                dataIndex: column,
                key: column,
                render: (value: any) => formatTableValue(value),
              }))}
              dataSource={rows.map((row, index) => ({ ...row, key: index }))}
            />
          );
        })()}
      </Modal>
    </PageContainer>
  );
};

export default AglomPage;
