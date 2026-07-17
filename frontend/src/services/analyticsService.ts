import { apiClient, type ApiResponse } from './apiClient';
import type { UserRole } from '../types/roles';
import type { AnalyticsOverview } from '../types/analytics';

export const analyticsService = {
  async overview(role: UserRole, period = role === 'student' ? '7d' : '30d') {
    const response = await apiClient.get<ApiResponse<AnalyticsOverview>>(`/analytics/${role}/overview`, { params: { period } });
    return response.data.data;
  },
  async downloadPdf(role: UserRole, cadence: 'weekly' | 'monthly') {
    const response = await apiClient.get(`/reports/${role}/${cadence}/pdf`, { responseType: 'blob' });
    const contentType = String(response.headers['content-type'] ?? '');
    if (!contentType.toLowerCase().startsWith('application/pdf')) {
      throw new Error('The report service returned an invalid PDF response.');
    }
    const disposition = String(response.headers['content-disposition'] ?? '');
    const filename = disposition.match(/filename="?([^";]+)"?/i)?.[1] ?? `campuscare-${role}-${cadence}-report.pdf`;
    const url = URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url; link.download = filename; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }
};
