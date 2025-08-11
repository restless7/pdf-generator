import * as Handlebars from 'handlebars';
import { promises as fs } from 'fs';
import * as path from 'path';
import { TemplateEngineInterface } from './index';

export class HandlebarsEngine implements TemplateEngineInterface {
  private instance: typeof Handlebars;
  private compiledTemplates: Map<string, HandlebarsTemplateDelegate> = new Map();
  private registeredPartials: Set<string> = new Set();

  constructor() {
    this.instance = Handlebars.create();
    this.registerHelpers();
  }

  private registerHelpers(): void {
    // Date formatting helpers
    this.instance.registerHelper('formatDate', (date: string | Date, format?: string) => {
      const d = new Date(date);
      if (format === 'long') {
        return d.toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
      return d.toLocaleDateString('es-ES');
    });

    // Currency formatting
    this.instance.registerHelper('currency', (amount: number, currency = 'EUR') => {
      return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: currency
      }).format(amount);
    });

    // Format currency (USD format for business plans)
    this.instance.registerHelper('formatCurrency', (amount: number) => {
      if (amount == null || isNaN(Number(amount))) return '$0';
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(Number(amount));
    });

    // Current date helper
    this.instance.registerHelper('currentDate', () => {
      return new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    });

    // Format content helper for HTML content
    this.instance.registerHelper('formatContent', (content: string) => {
      if (!content) return '';
      // Return as safe HTML (this content is already formatted)
      return new this.instance.SafeString(content);
    });

    // Percentage formatting
    this.instance.registerHelper('percentage', (value: number, decimals = 1) => {
      return `${(value * 100).toFixed(decimals)}%`;
    });

    // Math helpers
    this.instance.registerHelper('add', (a: number, b: number) => a + b);
    this.instance.registerHelper('subtract', (a: number, b: number) => a - b);
    this.instance.registerHelper('multiply', (a: number, b: number) => a * b);
    this.instance.registerHelper('divide', (a: number, b: number) => b !== 0 ? a / b : 0);

    // Conditional helpers
    this.instance.registerHelper('gt', (a: any, b: any) => a > b);
    this.instance.registerHelper('gte', (a: any, b: any) => a >= b);
    this.instance.registerHelper('lt', (a: any, b: any) => a < b);
    this.instance.registerHelper('lte', (a: any, b: any) => a <= b);
    this.instance.registerHelper('eq', (a: any, b: any) => a === b);
    this.instance.registerHelper('neq', (a: any, b: any) => a !== b);

    // String helpers
    this.instance.registerHelper('uppercase', (str: string) => str?.toUpperCase() || '');
    this.instance.registerHelper('lowercase', (str: string) => str?.toLowerCase() || '');
    this.instance.registerHelper('capitalize', (str: string) => {
      if (!str) return '';
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    });

    // Array helpers
    this.instance.registerHelper('length', (array: any[]) => array?.length || 0);
    this.instance.registerHelper('first', (array: any[]) => array?.[0]);
    this.instance.registerHelper('last', (array: any[]) => array?.[array.length - 1]);

    // Index helper for loops
    this.instance.registerHelper('index', function(this: any) {
      return this['@index'] + 1;
    });

    // Safe string helper
    this.instance.registerHelper('safe', (str: string) => new this.instance.SafeString(str));

    // Default value helper
    this.instance.registerHelper('default', (value: any, defaultValue: any) => {
      return value != null ? value : defaultValue;
    });

    // JSON stringify helper
    this.instance.registerHelper('json', (obj: any) => {
      return JSON.stringify(obj, null, 2);
    });

    // String manipulation helpers
    this.instance.registerHelper('substring', (str: string, start: number, end?: number) => {
      if (!str) return '';
      return end !== undefined ? str.substring(start, end) : str.substring(start);
    });

    // Join array helper
    this.instance.registerHelper('join', (array: any[], separator: string = ', ') => {
      if (!Array.isArray(array)) return '';
      return array.join(separator);
    });

    // Number formatting helpers
    this.instance.registerHelper('number', (value: number, decimals: number = 2) => {
      if (value == null || isNaN(Number(value))) return '0';
      return new Intl.NumberFormat('es-ES', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(Number(value));
    });

    // Conditional helpers for complex conditions
    this.instance.registerHelper('and', function(...args: any[]) {
      // Remove the Handlebars options object from the end
      const values = args.slice(0, -1);
      return values.every(val => !!val);
    });

    this.instance.registerHelper('or', function(...args: any[]) {
      // Remove the Handlebars options object from the end
      const values = args.slice(0, -1);
      return values.some(val => !!val);
    });

    // Template-specific helpers
    this.instance.registerHelper('statusClass', (status: string) => {
      const statusMap: Record<string, string> = {
        'paid': 'success',
        'pending': 'warning',
        'overdue': 'error',
        'completed': 'success',
        'processing': 'info',
        'failed': 'error',
        'critical': 'error',
        'high': 'warning',
        'medium': 'info',
        'low': 'success'
      };
      return statusMap[status] || 'info';
    });

    // Format file size helper
    this.instance.registerHelper('fileSize', (bytes: number) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    });

    // Duration formatting helper
    this.instance.registerHelper('duration', (ms: number) => {
      if (ms < 1000) return `${ms}ms`;
      const seconds = ms / 1000;
      if (seconds < 60) return `${seconds.toFixed(1)}s`;
      const minutes = seconds / 60;
      if (minutes < 60) return `${minutes.toFixed(1)}m`;
      const hours = minutes / 60;
      return `${hours.toFixed(1)}h`;
    });

    // Increment helper (useful for numbering)
    this.instance.registerHelper('inc', (value: number) => {
      return value + 1;
    });

    // Decrement helper
    this.instance.registerHelper('dec', (value: number) => {
      return value - 1;
    });

    // Range helper for creating numbered lists or iterations
    this.instance.registerHelper('range', (from: number, to: number, options: any) => {
      let result = '';
      for (let i = from; i <= to; i++) {
        result += options.fn({ index: i, value: i });
      }
      return result;
    });

    // Even/odd helpers for styling
    this.instance.registerHelper('isEven', (value: number) => {
      return value % 2 === 0;
    });

    this.instance.registerHelper('isOdd', (value: number) => {
      return value % 2 !== 0;
    });

    // Truncate text helper
    this.instance.registerHelper('truncate', (str: string, length: number = 50, suffix: string = '...') => {
      if (!str || str.length <= length) return str;
      return str.substring(0, length) + suffix;
    });
  }

  async render(templatePath: string, data: any, options?: any): Promise<string> {
    try {
      const absolutePath = path.resolve(templatePath);
      
      // Check if template is already compiled
      if (!this.compiledTemplates.has(absolutePath)) {
        const templateContent = await fs.readFile(absolutePath, 'utf-8');
        const compiled = this.instance.compile(templateContent);
        this.compiledTemplates.set(absolutePath, compiled);
      }

      const template = this.compiledTemplates.get(absolutePath)!;
      
      // Enhance data with helper functions if needed
      const enhancedData = {
        ...data,
        ...options,
        _timestamp: new Date().toISOString(),
        _templatePath: templatePath
      };

      return template(enhancedData);
    } catch (error) {
      throw new Error(`Failed to render Handlebars template: ${error}`);
    }
  }

  async renderPartials(partialPaths: string[]): Promise<void> {
    for (const partialPath of partialPaths) {
      try {
        const absolutePath = path.resolve(partialPath);
        
        // Skip if already registered
        if (this.registeredPartials.has(absolutePath)) {
          continue;
        }

        const partialContent = await fs.readFile(absolutePath, 'utf-8');
        const partialName = path.basename(partialPath, path.extname(partialPath));
        
        this.instance.registerPartial(partialName, partialContent);
        this.registeredPartials.add(absolutePath);
      } catch (error) {
        console.warn(`Warning: Failed to register partial ${partialPath}:`, error);
      }
    }
  }

  async cleanup(): Promise<void> {
    this.compiledTemplates.clear();
    this.registeredPartials.clear();
    // Note: Handlebars doesn't provide a way to unregister all helpers/partials
    // So we create a new instance if needed
    this.instance = Handlebars.create();
    this.registerHelpers();
  }
}
