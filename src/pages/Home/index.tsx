import HistoryTooltip from '@/components/HistoryTooltip';
import defaultInput from '@/data/defaultInput.json';
import {
  calculate,
  deleteCalculation,
  getBlastFurnaces,
  getHistory,
  getMaterials,
  getOldInput,
  saveCalculation,
} from '@/services/slagMode';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { history } from '@umijs/max';
import {
  Button,
  Card,
  Checkbox,
  Col,
  Form,
  Input,
  InputNumber,
  List,
  message,
  Modal,
  Row,
  Select,
  Space,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import { useEffect, useState } from 'react';
import styles from './index.less';

const materialFields = [
  'fe',
  'siO2',
  'al2O3',
  'caO',
  'mgO',
  's',
  'mnO',
  'tiO2',
];
const variantParameterFields = [
  'variantID',
  'userID',
  'dateVariant',
  'blastFurnaceID',
  'variantName',
  'ironProduction',
  'cokeConsumption',
  'slagOutput',
  'dustRemoval',
  'blowPressure',
  'blowTemperature',
  'blowMoisture',
  'blowO2',
  'naturalGasConsumption',
  'ironTemperature',
  'ironSi',
  'ironS',
  'ironMn',
  'ironC',
  'ironP',
  'ironTi',
  'ironCr',
  'slagSiO2',
  'slagCaO',
  'slagAl2O3',
  'slagMgO',
  'slagS',
  'slagTiO2',
  'cokeAsh',
  'cokeS',
  'cokeVolatile',
  'cokeAshFe',
  'cokeAshCaO',
  'cokeAshSiO2',
  'cokeAshAl2O3',
  'cokeAshMgO',
  'cokeAshP',
];

const showCalculationResult = (response: any) => {
  const resultData = response?.data ?? response ?? {};
  Modal.info({
    title: 'Результаты расчёта',
    width: 720,
    okText: 'Закрыть',
    closable: true,
    centered: true,
    content: resultData,
  });
};

const getParameterDefaults = () =>
  Object.fromEntries(variantParameterFields.map((key) => [key, 0]));

const toNumber = (value: any) => {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
};

const buildParametersFromForm = (formValues: any) => {
  const iron = formValues?.iron ?? {};
  const slag = formValues?.slag ?? {};
  const coke = formValues?.coke ?? {};

  return {
    UserID: Number(localStorage.getItem('slag_user_id') || 0),
    VariantName:
      (document.getElementById('calc-name') as HTMLInputElement)?.value ||
      'Без названия',
    DateVariant: new Date().toISOString(),
    BlastFurnaceID: Number(formValues?.parameters?.blastFurnaceID ?? 0),

    IronSi: Number(iron?.si ?? 0),
    IronS: Number(iron?.s ?? 0),
    IronMn: Number(iron?.mn ?? 0),
    IronC: Number(iron?.c ?? 0),
    IronP: Number(iron?.p ?? 0),
    IronTi: Number(iron?.ti ?? 0),
    IronCr: Number(iron?.cr ?? 0),
    IronTemperature: Number(iron?.temp ?? 0),

    SlagSiO2: Number(slag?.siO2 ?? 0),
    SlagCaO: Number(slag?.caO ?? 0),
    SlagAl2O3: Number(slag?.al2O3 ?? 0),
    SlagMgO: Number(slag?.mgO ?? 0),
    SlagS: Number(slag?.s ?? 0),
    SlagTiO2: Number(slag?.tiO2 ?? 0),

    CokeConsumption: Number(coke?.consumption ?? 0),
    CokeS: Number(coke?.sulfur ?? 0),
    CokeAsh: Number(coke?.ashAmount ?? 0),
    CokeAshCaO: Number(coke?.ashCaOFraction ?? 0),
    CokeAshSiO2: Number(coke?.ashSiO2Fraction ?? 0),
    CokeAshAl2O3: Number(coke?.ashAl2O3Fraction ?? 0),
    CokeAshMgO: Number(coke?.ashMgOFraction ?? 0),
  };
};

const getMaterialDefaults = (item: any = {}) => {
  const defaults: Record<string, any> = {
    sourcename: item?.nameShihta || item?.ruNameShihta || undefined,
    customComposition: false,
  };

  materialFields.forEach((field) => {
    const value = item?.[field];
    defaults[field] = value === undefined || value === null ? 0 : Number(value);
  });

  return defaults;
};

const normalizeOldInput = (response: any, materialsList: any[] = []) => {
  const payload = response?.data ?? response ?? {};
  const parameters = payload.parameters ?? payload.variantParameters ?? {};
  const variantData = Array.isArray(payload.charges)
    ? payload.charges
    : Array.isArray(payload.components)
    ? payload.components
    : [];

  const components = variantData.map((item: any) => {
    const materialName =
      item?.sourcename ?? item?.nameShihta ?? item?.ruNameShihta;
    const material =
      materialsList.find(
        (entry: any) =>
          (entry.nameShihta || entry.ruNameShihta) === materialName,
      ) || {};
    const defaults = getMaterialDefaults(material);
    return {
      ...defaults,
      ...item,
      sourcename: materialName ?? item?.sourcename ?? defaults.sourcename,
      consumption: item?.consumption ?? defaults.consumption ?? 0,
      customComposition: Boolean(item?.customComposition ?? false),
      ...Object.fromEntries(
        materialFields.map((field) => [
          field,
          item?.[field] ?? defaults[field] ?? 0,
        ]),
      ),
    };
  });

  const furnaceId =
    payload.furnaceID ??
    payload.blastFurnaceID ??
    parameters.furnaceID ??
    parameters.blastFurnaceID ??
    payload.parameters?.furnaceID ??
    payload.parameters?.blastFurnaceID ??
    payload.variantParameters?.furnaceID ??
    payload.variantParameters?.blastFurnaceID;
  const normalizedParameters = {
    ...getParameterDefaults(),
    ...(payload.parameters ?? payload.variantParameters ?? {}),
    ...(payload.variantName !== undefined
      ? { variantName: payload.variantName }
      : {}),
    ...(parameters?.variantName !== undefined
      ? { variantName: parameters.variantName }
      : {}),
    ...(furnaceId !== undefined && furnaceId !== null
      ? { blastFurnaceID: Number(furnaceId) }
      : {}),
    ...(payload.furnaceID !== undefined && payload.furnaceID !== null
      ? { blastFurnaceID: Number(payload.furnaceID) }
      : {}),
  };

  return {
    ...defaultInput,
    ...payload,
    coke: { ...defaultInput.coke, ...(payload.coke ?? {}) },
    iron: { ...defaultInput.iron, ...(payload.iron ?? {}) },
    slag: { ...defaultInput.slag, ...(payload.slag ?? {}) },
    parameters: normalizedParameters,
    components: components.length ? components : defaultInput.components,
  };
};

const HomePage: React.FC = () => {
  const [form] = Form.useForm();
  const [materials, setMaterials] = useState<any[]>([]);
  const [furnaces, setFurnaces] = useState<any[]>([]);
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>();
  const [result, setResult] = useState<any>();
  const [loadingHistory, setLoadingHistory] = useState(false);
  const furnaceValue = Form.useWatch(['parameters', 'blastFurnaceID'], form);
  const componentValues = Form.useWatch('components', form) || [];
  useEffect(() => {
    if (!localStorage.getItem('slag_user')) {
      history.replace('/access');
      return;
    }
    form.setFieldsValue(defaultInput);
    Promise.all([getMaterials(), getBlastFurnaces(), getOldInput(1)])
      .then(([m, f, oldInput]) => {
        const materialList = m?.data || m || [];
        const furnaceList = f?.data || f || [];
        setMaterials(materialList);
        setFurnaces(furnaceList);
        form.setFieldsValue(normalizeOldInput(oldInput, materialList));
      })
      .catch(() => {
        message.warning('Справочники пока недоступны');
      });
  }, []);
  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await getHistory(
        Number(localStorage.getItem('slag_user_id')),
      );
      setHistoryItems(data?.data || data || []);
    } catch {
      message.error('Не удалось загрузить историю');
    } finally {
      setLoadingHistory(false);
    }
  };
  const addComponent = () =>
    form.setFieldValue('components', [
      ...(form.getFieldValue('components') || []),
      {
        sourcename: undefined,
        consumption: 0,
        customComposition: false,
        ...Object.fromEntries(materialFields.map((field) => [field, 0])),
      },
    ]);

  const submit = async (values: any) => {
    try {
      const response = await calculate(values);
      const resultData = response?.data || response;
      setResult(resultData);
      showCalculationResult(resultData);
      message.success('Расчёт выполнен');
    } catch {
      message.error('Ошибка расчёта');
    }
  };

  const save = () =>
    Modal.confirm({
      title: 'Сохранить расчёт',
      content: <Input id="calc-name" placeholder="Название расчёта" />,
      okText: 'Сохранить',
      cancelText: 'Закрыть',
      onOk: async () => {
        const formValues = form.getFieldsValue(true);
        const parameters = buildParametersFromForm(formValues);

        const charges = (formValues.components || []).map((component: any) => {
          const material =
            materials.find(
              (item: any) =>
                (item.nameShihta || item.ruNameShihta) ===
                component?.sourcename,
            ) || {};
          return {
            ComponentID: Number(
              material.componentID ?? component?.componentID ?? 0,
            ),
            Consumption: toNumber(component?.consumption ?? 0),
            ShihtaFe: toNumber(component?.fe ?? 0),
            ShihtaSiO2: toNumber(component?.siO2 ?? 0),
            ShihtaAl2O3: toNumber(component?.al2O3 ?? 0),
            ShihtaCaO: toNumber(component?.caO ?? 0),
            ShihtaMgO: toNumber(component?.mgO ?? 0),
            ShihtaS: toNumber(component?.s ?? 0),
            ShihtaMnO: toNumber(component?.mnO ?? 0),
            ShihtaTiO2: toNumber(component?.tiO2 ?? 0),
            Sourcename:
              component?.sourcename ||
              material?.nameShihta ||
              material?.ruNameShihta ||
              '',
          };
        });

        await saveCalculation({
          parameters,
          Charges: charges,
        });
        message.success('Расчёт сохранён');
      },
    });
  const fields = [
    ['iron', 'Чугун'],
    ['slag', 'Шлак'],
    ['coke', 'Кокс'],
  ];

  return (
    <div className={styles.page}>
      <Typography.Title level={2}>Расчёт Шлака</Typography.Title>
      <Row gutter={24}>
        <Col xs={24} xl={17}>
          <Form form={form} layout="vertical" onFinish={submit}>
            <Card title="Параметры расчёта" bordered={false}>
              <Row gutter={16} className={styles.paramRow}>
                <Col span={12}>
                  <Form.Item
                    name={['parameters', 'blastFurnaceID']}
                    label="Доменная печь"
                  >
                    <Select
                      value={furnaceValue ?? undefined}
                      onChange={(value) =>
                        form.setFieldValue(
                          ['parameters', 'blastFurnaceID'],
                          Number(value),
                        )
                      }
                      options={furnaces.map((item) => ({
                        value: Number(
                          item.furnaceID ??
                            item.blastFurnaceID ??
                            item.id ??
                            item.componentID,
                        ),
                        label:
                          item.name ||
                          item.nameBlastFurnace ||
                          item.ruName ||
                          item.ruNameBlastFurnace ||
                          item.nameShihta ||
                          item.ruNameShihta,
                      }))}
                      showSearch
                      optionFilterProp="label"
                    />
                  </Form.Item>
                </Col>
              </Row>
              <div className={styles.materialRow}>
                {fields.map(([group, title]) => (
                  <div key={group} className={styles.paramBlock}>
                    <Typography.Text strong>{title}</Typography.Text>
                    {Object.keys((defaultInput as any)[group]).map((key) => (
                      <Form.Item
                        key={key}
                        name={[group, key]}
                        label={key}
                        className={styles.compactField}
                      >
                        <InputNumber style={{ width: '100%' }} />
                      </Form.Item>
                    ))}
                  </div>
                ))}
              </div>
            </Card>
            <Space className={styles.actions}>
              <Button icon={<PlusOutlined />} onClick={addComponent}>
                Добавить компонент
              </Button>
              <Button type="primary" htmlType="submit">
                Рассчитать
              </Button>
              <Button onClick={save}>Сохранить</Button>
            </Space>
            <Form.List name="components">
              {(items, { remove }) => (
                <Row gutter={[16, 16]}>
                  {items.map(({ key, name, ...rest }) => (
                    <Col xs={24} md={12} lg={8} key={key}>
                      <Card
                        title={
                          <Form.Item
                            {...rest}
                            name={[name, 'sourcename']}
                            noStyle
                          >
                            <Select
                              placeholder="Компонент"
                              options={materials.map((item) => ({
                                value: item.nameShihta || item.ruNameShihta,
                                label: item.ruNameShihta || item.nameShihta,
                              }))}
                              onSelect={(value) => {
                                const selectedMaterial = materials.find(
                                  (item: any) =>
                                    (item.nameShihta || item.ruNameShihta) ===
                                    value,
                                );
                                if (!selectedMaterial) return;
                                const currentComponents =
                                  form.getFieldValue('components') || [];
                                currentComponents[name] = {
                                  ...currentComponents[name],
                                  sourcename: value,
                                  ...getMaterialDefaults(selectedMaterial),
                                  customComposition: false,
                                  consumption:
                                    currentComponents[name]?.consumption ?? 0,
                                };
                                form.setFieldValue(
                                  'components',
                                  currentComponents,
                                );
                              }}
                            />
                          </Form.Item>
                        }
                        extra={
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => remove(name)}
                          />
                        }
                      >
                        <Form.Item
                          {...rest}
                          name={[name, 'customComposition']}
                          valuePropName="checked"
                          initialValue={false}
                        >
                          <Checkbox
                            onChange={(e) => {
                              const currentComponents =
                                form.getFieldValue('components') || [];
                              const selectedName =
                                currentComponents[name]?.sourcename;
                              const selectedMaterial = materials.find(
                                (item: any) =>
                                  (item.nameShihta || item.ruNameShihta) ===
                                  selectedName,
                              );
                              currentComponents[name] = {
                                ...currentComponents[name],
                                customComposition: e.target.checked,
                              };
                              if (!e.target.checked && selectedMaterial) {
                                currentComponents[name] = {
                                  ...currentComponents[name],
                                  ...getMaterialDefaults(selectedMaterial),
                                  customComposition: false,
                                };
                              }
                              form.setFieldValue(
                                'components',
                                currentComponents,
                              );
                            }}
                          >
                            Другой состав
                          </Checkbox>
                        </Form.Item>
                        <Form.Item
                          {...rest}
                          name={[name, 'consumption']}
                          label="Расход"
                          className={styles.compactField}
                        >
                          <InputNumber style={{ width: '100%' }} />
                        </Form.Item>
                        {materialFields.map((field) => (
                          <Form.Item
                            {...rest}
                            key={field}
                            name={[name, field]}
                            label={field}
                            className={styles.compactField}
                          >
                            <InputNumber
                              style={{ width: '100%' }}
                              disabled={
                                componentValues[name]?.customComposition !==
                                true
                              }
                            />
                          </Form.Item>
                        ))}
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Form.List>
            {result && (
              <Card title="Результат" className={styles.result}>
                <pre>{JSON.stringify(result, null, 2)}</pre>
              </Card>
            )}
          </Form>
        </Col>
        <Col xs={24} xl={7}>
          <Card
            title="История расчётов"
            extra={
              <Button loading={loadingHistory} onClick={loadHistory}>
                Загрузить историю
              </Button>
            }
          >
            <List
              className={styles.history}
              dataSource={historyItems}
              locale={{ emptyText: 'История не загружена' }}
              renderItem={(item) => (
                <Tooltip
                  placement="left"
                  title={<HistoryTooltip calculation={item} />}
                  overlayInnerStyle={{
                    background: '#fff',
                    color: '#000',
                    border: '1px solid #d9d9d9',
                  }}
                >
                  <List.Item onClick={() => setSelected(item)}>
                    <Typography.Text>
                      {item.variantName ||
                        item.parameters?.variantName ||
                        'Без названия'}
                    </Typography.Text>
                    {selected === item && <Tag color="blue">Выбран</Tag>}
                  </List.Item>
                </Tooltip>
              )}
            />
          </Card>
          {selected && (
            <Space className={styles.historyActions}>
              <Button
                onClick={() => {
                  form.setFieldsValue(selected.parameters || selected);
                  message.success('Данные загружены');
                }}
              >
                Загрузить
              </Button>
              <Button
                danger
                onClick={() =>
                  Modal.confirm({
                    title: 'Удалить расчёт?',
                    onOk: async () => {
                      const calcId = Number(
                        selected.variantID ??
                          selected.parameters?.variantID ??
                          selected.id ??
                          0,
                      );
                      if (!calcId) {
                        message.error('Не найден ID расчёта');
                        return;
                      }
                      await deleteCalculation(calcId);
                      setHistoryItems((items) =>
                        items.filter((item) => item !== selected),
                      );
                      setSelected(undefined);
                    },
                  })
                }
              >
                Удалить
              </Button>
            </Space>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default HomePage;
