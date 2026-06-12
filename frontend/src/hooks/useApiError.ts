import { ElMessage } from 'element-plus';

export function useApiError() {
  const extractMessage = (e: unknown): string => {
    if (e instanceof Error) {
      try {
        const parsed = JSON.parse(e.message);
        if (parsed.message) {
          return Array.isArray(parsed.message) ? parsed.message.join('；') : String(parsed.message);
        }
      } catch {
        // ignore
      }
      return e.message;
    }
    if (typeof e === 'string') return e;
    try { return JSON.stringify(e); } catch { return '请求失败'; }
  };

  const showError = (e: unknown, fallback = '操作失败') => {
    const msg = extractMessage(e);
    ElMessage.error(msg || fallback);
  };

  return { extractMessage, showError };
}
