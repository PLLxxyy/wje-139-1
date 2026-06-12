import { ElMessage } from 'element-plus';

type CreditExceededData = { name: string; debt: number; creditLimit: number };

const parseErrorBody = (e: unknown): any => {
  if (e instanceof Error) {
    try { return JSON.parse(e.message); } catch { /* ignore */ }
  }
  if (typeof e === 'string') {
    try { return JSON.parse(e); } catch { /* ignore */ }
  }
  if (e && typeof e === 'object') return e;
  return null;
};

const formatCreditExceeded = (data: CreditExceededData): string =>
  `货主【${data.name}】当前欠款 ${data.debt} 已超过授信额度 ${data.creditLimit}，禁止创建单据`;

export function useApiError() {
  const extractMessage = (e: unknown): string => {
    const body = parseErrorBody(e);
    if (body?.code === 'OWNER_CREDIT_EXCEEDED' && body?.data) {
      return formatCreditExceeded(body.data as CreditExceededData);
    }
    if (body?.message) {
      return Array.isArray(body.message) ? body.message.join('；') : String(body.message);
    }
    if (e instanceof Error) return e.message;
    if (typeof e === 'string') return e;
    try { return JSON.stringify(e); } catch { return '请求失败'; }
  };

  const showError = (e: unknown, fallback = '操作失败') => {
    const msg = extractMessage(e);
    ElMessage.error(msg || fallback);
  };

  return { extractMessage, showError };
}
