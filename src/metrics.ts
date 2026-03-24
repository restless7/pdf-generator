import { collectDefaultMetrics, Counter, Histogram, Registry } from 'prom-client';
import { Request, Response, NextFunction } from 'express';

const register = new Registry();
// Export default Node.js/process metrics
collectDefaultMetrics({ register });

// Example business metrics – tweak names/labels as you like
export const pdfGenerationCounter = new Counter({
  name: 'pdf_generation_total',
  help: 'Total number of PDFs generated',
  labelNames: ['status'], // success / error
  registers: [register],
});

export const pdfGenerationDuration = new Histogram({
  name: 'pdf_generation_duration_seconds',
  help: 'Duration of PDF generation',
  buckets: [0.1, 0.5, 1, 2, 5],
  registers: [register],
});

// Express middleware to expose /metrics
export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    res.set('Content-Type', register.contentType);
    res.send(register.metrics());
  } catch (err) {
    next(err);
  }
}