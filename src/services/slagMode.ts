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

// Use relative API path so dev server proxy can forward requests to backend
const api = `/api/SlagMode`;

const clearExpiredSession = () => {
  localStorage.removeItem('slag_user');
  localStorage.removeItem('slag_user_id');
  if (window.location.pathname !== '/access') {
    window.location.replace('/access');
  }
};

const containsExpiredTokenMessage = (value: unknown): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'object') {
    return Object.values(value as Record<string, unknown>).some(
      containsExpiredTokenMessage,
    );
  }
  const text = String(value).toLowerCase();
  return (
    text.includes('token expired') ||
    text.includes('jwt expired') ||
    text.includes('токен истек') ||
    text.includes('токен истёк')
  );
};

const isExpiredTokenError = (error: any) =>
  error?.response?.status === 401 ||
  error?.status === 401 ||
  containsExpiredTokenMessage(error?.response?.data) ||
  containsExpiredTokenMessage(error?.data) ||
  containsExpiredTokenMessage(error?.message);

const authenticatedRequest = async <T>(
  url: string,
  options: Record<string, unknown> = {},
): Promise<T> => {
  try {
    const response = await request<T>(url, options);
    if (containsExpiredTokenMessage(response)) {
      clearExpiredSession();
    }
    return response;
  } catch (error) {
    if (isExpiredTokenError(error)) {
      clearExpiredSession();
    }
    throw error;
  }
};

const getAuthHeaders = (): Record<string, string> => {
  try {
    const token = localStorage.getItem('slag_user');
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
};

export const login = (data: { userName: string; password: string }) =>
  // login should not include Authorization header
  request<any>(`${api}/Login`, { method: 'POST', data });

export const calculate = (data: InputKal) =>
  authenticatedRequest<any>(`${api}/Calculate`, {
    method: 'POST',
    data,
    headers: getAuthHeaders(),
  });

export const getMaterials = () =>
  authenticatedRequest<any>(`${api}/GetMaterials`, {
    headers: getAuthHeaders(),
  });

export const getBlastFurnaces = () =>
  authenticatedRequest<any>(`${api}/GetBlastFurnaces`, {
    headers: getAuthHeaders(),
  });

export const decodeJwt = async (jwt: string) => {
  const token = jwt || localStorage.getItem('slag_user') || '';
  if (!token) return 0;

  try {
    const result = await request<any>(
      `${api}/Decodejwt/${encodeURIComponent(token)}`,
      { method: 'GET' },
    );
    const payload = result?.data ?? result ?? {};
    const userId =
      payload.userID ??
      payload.userId ??
      payload.UserID ??
      payload.id ??
      payload.sub ??
      payload.nameid ??
      payload.value;
    if (userId !== undefined && userId !== null && userId !== '')
      return Number(userId);
  } catch {
    // ignore and fallback to local JWT parsing
  }

  try {
    const payload = token.split('.')[1];
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(normalized));
    const userId =
      decoded.userID ??
      decoded.userId ??
      decoded.UserID ??
      decoded.sub ??
      decoded.nameid;
    return Number(userId || 0);
  } catch {
    return 0;
  }
};

export const getHistory = (userID?: number) =>
  authenticatedRequest<any>(`${api}/GetAllInputsForUser`, {
    method: 'GET',
    params: userID === undefined ? undefined : { userID },
    headers: getAuthHeaders(),
  });

export const getOldInput = (variantId: number) =>
  authenticatedRequest<any>(`${api}/GetOldInput`, {
    method: 'GET',
    params: { variantId },
    headers: getAuthHeaders(),
  });

export const deleteCalculation = (calcID: number) =>
  authenticatedRequest<any>(`${api}/DeleteOldInput`, {
    method: 'DELETE',
    params: { calcID },
    headers: getAuthHeaders(),
  });

export const saveCalculation = (data: Calculation) => {
  const normalized = { ...data };
  if (normalized.parameters && typeof normalized.parameters === 'object') {
    const parameters = {
      ...(normalized.parameters as Record<string, string | number>),
    };
    delete parameters.variantID;
    normalized.parameters = parameters;
  }
  if (Array.isArray(normalized.charges)) {
    normalized.charges = normalized.charges.map((charge: any) => {
      if (charge && typeof charge === 'object') {
        const cleanedCharge = { ...charge };
        delete cleanedCharge.variantID;
        if (
          cleanedCharge.variantParameters &&
          typeof cleanedCharge.variantParameters === 'object'
        ) {
          const variantParameters = { ...cleanedCharge.variantParameters };
          delete variantParameters.variantID;
          cleanedCharge.variantParameters = variantParameters;
        }
        return cleanedCharge;
      }
      return charge;
    });
  }
  return authenticatedRequest<any>(`${api}/AddInput`, {
    method: 'PUT',
    data: normalized,
    headers: getAuthHeaders(),
  });
};

export const editMaterial = (data: Record<string, unknown>) =>
  authenticatedRequest<any>(`${api}/EditGuide`, {
    method: 'POST',
    data,
    headers: getAuthHeaders(),
  });

  // SostavOfAglom API
const aglomApi = `/api/SostavOfAglom`;

export const calculateAglom = (data: any) =>
  request<any>(`${aglomApi}/Calculate`, {
    method: 'POST',
    data,
    headers: getAuthHeaders(),
  });

export const getAglomDefaultPreset = (userId?: number) =>
  request<any>(`${aglomApi}/GetDefaultPreset`, {
    method: 'GET',
    params: userId === undefined ? undefined : { userId },
    headers: getAuthHeaders(),
  });

export const getAglomPreset = (id: number) =>
  request<any>(`${aglomApi}/GetPreset`, {
    method: 'GET',
    params: { id },
    headers: getAuthHeaders(),
  });

export const getAglomHistory = (userId?: number) =>
  request<any>(`${aglomApi}/GetHistory`, {
    method: 'GET',
    params: userId === undefined ? undefined : { userId },
    headers: getAuthHeaders(),
  });

export const deleteAglomPreset = (presetId: number) =>
  request<any>(`${aglomApi}/DeletePreset`, {
    method: 'DELETE',
    params: { presetId },
    headers: getAuthHeaders(),
  });
