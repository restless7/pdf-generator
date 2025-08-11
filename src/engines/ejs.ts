import * as ejs from 'ejs';
import { promises as fs } from 'fs';
import * as path from 'path';
import { TemplateEngineInterface } from './index';

export class EjsEngine implements TemplateEngineInterface {
  private compiledTemplates: Map<string, any> = new Map();
  private helpers: Record<string, Function> = {};

  constructor() {
    this.setupHelpers();
  }

  private setupHelpers(): void {
    this.helpers = {
      // Date formatting helpers
      formatDate: (date: string | Date, format?: string) => {
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
      },

      // Currency formatting
      currency: (amount: number, currency = 'EUR') => {
        return new Intl.NumberFormat('es-ES', {
          style: 'currency',
          currency: currency
        }).format(amount);
      },

      // Percentage formatting
      percentage: (value: number, decimals = 1) => {
        return `${(value * 100).toFixed(decimals)}%`;
      },

      // Math helpers
      add: (a: number, b: number) => a + b,
      subtract: (a: number, b: number) => a - b,
      multiply: (a: number, b: number) => a * b,
      divide: (a: number, b: number) => b !== 0 ? a / b : 0,

      // Conditional helpers
      gt: (a: any, b: any) => a > b,
      gte: (a: any, b: any) => a >= b,
      lt: (a: any, b: any) => a < b,
      lte: (a: any, b: any) => a <= b,
      eq: (a: any, b: any) => a === b,
      neq: (a: any, b: any) => a !== b,

      // String helpers
      uppercase: (str: string) => str?.toUpperCase() || '',
      lowercase: (str: string) => str?.toLowerCase() || '',
      capitalize: (str: string) => {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
      },

      // Array helpers
      length: (array: any[]) => array?.length || 0,
      first: (array: any[]) => array?.[0],
      last: (array: any[]) => array?.[array.length - 1],

      // Default value helper
      default: (value: any, defaultValue: any) => {
        return value != null ? value : defaultValue;
      },

      // JSON stringify helper
      json: (obj: any) => {
        return JSON.stringify(obj, null, 2);
      }
    };
  }

  async render(templatePath: string, data: any, options?: any): Promise<string> {
    try {
      const absolutePath = path.resolve(templatePath);
      
      // Check if template is already compiled
      if (!this.compiledTemplates.has(absolutePath)) {
        const templateContent = await fs.readFile(absolutePath, 'utf-8');
        const compiled = ejs.compile(templateContent, {
          filename: absolutePath,
          cache: true,
          compileDebug: false,
          ...options
        });
        this.compiledTemplates.set(absolutePath, compiled);
      }

      const template = this.compiledTemplates.get(absolutePath)!;
      
      // Enhance data with helper functions
      const enhancedData = {
        ...data,
        ...options,
        // Make helpers available in templates
        ...this.helpers,
        _timestamp: new Date().toISOString(),
        _templatePath: templatePath
      };

      return template(enhancedData);
    } catch (error) {
      throw new Error(`Failed to render EJS template: ${error}`);
    }
  }

  async renderPartials(partialPaths: string[]): Promise<void> {
    // EJS handles includes differently - they're resolved at template compile time
    // We don't need to pre-register partials like with Handlebars
    // Just ensure the partial files exist
    for (const partialPath of partialPaths) {
      try {
        const absolutePath = path.resolve(partialPath);
        await fs.access(absolutePath);
      } catch (error) {
        console.warn(`Warning: Partial file not accessible ${partialPath}:`, error);
      }
    }
  }

  async cleanup(): Promise<void> {
    this.compiledTemplates.clear();
    // Clear EJS cache if needed
    ejs.clearCache();
  }
}
