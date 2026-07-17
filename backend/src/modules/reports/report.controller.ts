import type { Request, Response } from 'express';
import type { AnalyticsRole } from '../analytics/analytics.types.js';
import { resolveDateRange } from '../analytics/analytics.validation.js';
import { successResponse } from '../../utils/apiResponse.js';
import { reportService } from './report.service.js';
import { renderReportPdf } from './pdf.service.js';

function rangeFor(request: Request, cadence: 'weekly' | 'monthly') {
  return resolveDateRange({ ...request.query, period: cadence === 'weekly' ? '7d' : '30d' });
}

export const reportController = {
  json: (role: AnalyticsRole, cadence: 'weekly' | 'monthly') => async (request: Request, response: Response) => {
    const report = await reportService.generate(role, cadence, rangeFor(request, cadence), request.currentUser);
    successResponse(response, `${cadence} report generated`, report);
  },
  pdf: (role: AnalyticsRole, cadence: 'weekly' | 'monthly') => async (request: Request, response: Response) => {
    const report = await reportService.generate(role, cadence, rangeFor(request, cadence), request.currentUser);
    const pdf = await renderReportPdf(report);
    const date = report.period.start.slice(0, 10);
    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader('Content-Disposition', `attachment; filename="campuscare-${role}-${cadence}-report-${date}.pdf"`);
    response.setHeader('Content-Length', pdf.length);
    response.send(pdf);
  }
};
