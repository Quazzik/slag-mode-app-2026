import { Descriptions } from 'antd';

const historyLabels: Record<string, string> = {
  id: 'ID расчёта',
  username: 'Имя пользователя',
  variantName: 'Название варианта',
  dateVariant: 'Дата расчёта',
  bfName: 'Доменная печь',
};

const HistoryTooltip: React.FC<{ calculation: Record<string, any> }> = ({ calculation }) => (
  <Descriptions size="small" column={1} bordered>
    {Object.entries(calculation)
      .filter(([, value]) => value !== null && typeof value !== 'object')
      .map(([key, value]) => (
        <Descriptions.Item key={key} label={historyLabels[key] || key}>
          {String(value)}
        </Descriptions.Item>
      ))}
  </Descriptions>
);

export default HistoryTooltip;
