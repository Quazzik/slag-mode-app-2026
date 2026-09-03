import { request } from '@umijs/max';

export type NumberMap = Record<string, number>;
export type InputKal = {
  coke: NumberMap;
  iron: NumberMap;
  slag: NumberMap;
  components: Array<Record<string, string | number>>;
};
export type Calculation = {
  variantID?: number;
  parameters?: Record<string, string | number>;
  charges?: Array<Record<string, string | number>>;
  variantName?: string;
  [key: string]: unknown;
};

const api = '/api/SlagMode';

export const login = (data: { userName: string; password: string }) =>
  request<any>(`${api}/Login`, { method: 'POST', data });
export const calculate = (data: InputKal) =>
  request<any>(`${api}/Calculate`, { method: 'POST', data });
export const getMaterials = () => request<any>(`${api}/GetMaterials`);
export const getBlastFurnaces = () => request<any>(`${api}/GetBlastFurnaces`);
export const getHistory = (userID?: number) =>
  request<any>(`${api}/GetAllInputsForUser`, {
    method: 'GET',
    params: userID === undefined ? undefined : { userID },
  });
export const deleteCalculation = (calcID: number) =>
  request<any>(`${api}/DeleteOldInput`, { method: 'DELETE', params: { calcID } });
export const saveCalculation = (data: Calculation) =>
  request<any>(`${api}/AddInput`, { method: 'PUT', data });
export const editMaterial = (data: Record<string, unknown>) =>
  request<any>(`${api}/EditGuide`, { method: 'POST', data });
