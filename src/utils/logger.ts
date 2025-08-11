export interface Logger {
  info(message: string, meta?: any): void;
  error(message: string, error?: any): void;
  warn(message: string, meta?: any): void;
  logPDFGeneration(filename: string, size: number, duration: number): void;
}

class SimpleLogger implements Logger {
  private formatMessage(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level}: ${message}${metaStr}`;
  }

  info(message: string, meta?: any): void {
    console.log(this.formatMessage('INFO', message, meta));
  }

  error(message: string, error?: any): void {
    const errorInfo = error instanceof Error ? { message: error.message, stack: error.stack } : error;
    console.error(this.formatMessage('ERROR', message, errorInfo));
  }

  warn(message: string, meta?: any): void {
    console.warn(this.formatMessage('WARN', message, meta));
  }

  logPDFGeneration(filename: string, size: number, duration: number): void {
    this.info('PDF generated successfully', {
      filename,
      size: `${Math.round(size / 1024)} KB`,
      duration: `${duration}ms`
    });
  }
}

export const logger = new SimpleLogger();
