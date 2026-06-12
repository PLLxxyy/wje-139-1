import { request } from '../utils/request';
import { apiPaths } from '../constants/apiPaths';
export const inboundApi = {
  list: <T>() => request<T[]>(apiPaths.inbound),
  create: <T>(data: unknown) => request<T>(apiPaths.inbound, { method: 'POST', body: JSON.stringify(data) })
};
