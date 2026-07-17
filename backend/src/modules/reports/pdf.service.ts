import PDFDocument from 'pdfkit';
import type { Report } from './report.service.js';

export function renderReportPdf(report: Report): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50, info: { Title: report.title, Author: 'CampusCare' } });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      doc.rect(0, 0, 595, 92).fill('#0b1d35');
      doc.fillColor('#67e3d6').fontSize(13).text('CAMPUSCARE', 50, 28);
      doc.fillColor('#ffffff').fontSize(21).text(report.title, 50, 50);
      doc.fillColor('#0b1d35').fontSize(10).text(`Period: ${report.period.start.slice(0, 10)} to ${report.period.end.slice(0, 10)}`, 50, 115);
      doc.text(`Generated: ${report.generatedAt}`, 50, 131);
      doc.moveDown(2).fontSize(15).fillColor('#0d9e8a').text('Summary');
      doc.fillColor('#26384d').fontSize(10);
      report.summary.forEach((line) => doc.text(`• ${line}`, { paragraphGap: 6 }));
      doc.moveDown().fontSize(15).fillColor('#0d9e8a').text('Key metrics');
      doc.fillColor('#26384d').fontSize(9);
      Object.entries(report.analytics.metrics).forEach(([key, value]) => doc.text(`${key.replace(/([A-Z])/g, ' $1')}: ${value ?? 'Not available'}`));
      doc.moveDown().fontSize(15).fillColor('#0d9e8a').text('Activity by module');
      const modules = report.analytics.distributions.moduleUsage ?? [];
      if (!modules.length) doc.fillColor('#64748b').fontSize(9).text('No activity recorded in this period.');
      else modules.forEach((item) => doc.fillColor('#26384d').fontSize(9).text(`${item.label}: ${item.value}`));
      doc.moveDown(2).fontSize(8).fillColor('#64748b').text(report.disclaimer);
      doc.end();
    } catch (error) { reject(error); }
  });
}
