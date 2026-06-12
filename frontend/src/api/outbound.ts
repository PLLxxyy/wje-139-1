import { request } from '../utils/request';
import { apiPaths } from '../constants/apiPaths';
export const outboundApi = {
  list: <T>() => request<T[]>(apiPaths.outbound),
  create: <T>(data: unknown) => request<T>(apiPaths.outbound, { method: 'POST', body: JSON.stringify(data) })
};
