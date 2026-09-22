import { apiClient, type ApiResponse } from './apiClient';

export type ActivityItem = { id: string; action: string; entityType?: string; context?: Record<string, unknown>; createdAt: string };
export type AuditItem = { id: string; timestamp: string; actor: string; role?: string; action: string; entity?: string; context?: Record<string, unknown> };

export const securityService = {
  async activity() { return (await apiClient.get<ApiResponse<{ items: ActivityItem[]; total: number }>>('/security/activity')).data.data; },
  async twoFactorStatus() { return (await apiClient.get<ApiResponse<{ enabled: boolean }>>('/security/2fa/status')).data.data; },
  async setupTwoFactor() { return (await apiClient.post<ApiResponse<{ qrCodeDataUrl: string; manualSecret: string }>>('/security/2fa/setup')).data.data; },
  async enableTwoFactor(code: string) { return (await apiClient.post<ApiResponse<{ enabled: boolean }>>('/security/2fa/enable', { code })).data.data; },
  async disableTwoFactor(code: string) { return (await apiClient.post<ApiResponse<{ enabled: boolean }>>('/security/2fa/disable', { code })).data.data; },
  async auditLogs(params: Record<string, string | number>) { return (await apiClient.get<ApiResponse<{ items: AuditItem[]; page: number; limit: number; total: number }>>('/security/audit-logs', { params })).data.data; }
};
