import { Descriptions } from 'antd';

const HistoryTooltip: React.FC<{ calculation: Record<string, any> }> = ({ calculation }) => (
  <Descriptions size="small" column={1} bordered>
    {Object.entries(calculation)
      .filter(([, value]) => value !== null && typeof value !== 'object')
      .map(([key, value]) => <Descriptions.Item key={key} label={key}>{String(value)}</Descriptions.Item>)}
  </Descriptions>
);

export default HistoryTooltip;
