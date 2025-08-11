import * as pug from 'pug';
import { promises as fs } from 'fs';
import * as path from 'path';
import { TemplateEngineInterface } from './index';

export class PugEngine implements TemplateEngineInterface {
  private compiledTemplates: Map<string, pug.compileTemplate> = new Map();
  private filters: Record<string, Function> = {};

  constructor() {
    this.setupFilters();
  }

  private setupFilters(): void {
    // Pug uses filters rather than helpers
    this.filters = {
      // Date formatting filter
      formatDate: (text: string, options: any) => {
        const date = new Date(text);
        const format = options?.format;
        if (format === 'long') {
          return date.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
        }
        return date.toLocaleDateString('es-ES');
      },

      // Currency formatting filter
      currency: (text: string, options: any) => {
        const amount = parseFloat(text);
        const currency = options?.currency || 'EUR';
        return new Intl.NumberFormat('es-ES', {
          style: 'currency',
          currency: currency
        }).format(amount);
      },

      // Percentage formatting filter
      percentage: (text: string, options: any) => {
        const value = parseFloat(text);
        const decimals = options?.decimals || 1;
        return `${(value * 100).toFixed(decimals)}%`;
      },

      // String transformations
      uppercase: (text: string) => text.toUpperCase(),
      lowercase: (text: string) => text.toLowerCase(),
      capitalize: (text: string) => {
        if (!text) return '';
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
      }
    };

    // Register filters with Pug (if filters exist)
    try {
      for (const [name, filter] of Object.entries(this.filters)) {
        if ((pug as any).filters) {
          (pug as any).filters[name] = filter;
        }
      }
    } catch (error) {
      console.warn('Could not register Pug filters:', error);
    }
  }

  async render(templatePath: string, data: any, options?: any): Promise<string> {
    try {
      const absolutePath = path.resolve(templatePath);
      
      // Check if template is already compiled
      if (!this.compiledTemplates.has(absolutePath)) {
        const templateContent = await fs.readFile(absolutePath, 'utf-8');
        const compiled = pug.compile(templateContent, {
          filename: absolutePath,
          cache: true,
          compileDebug: false,
          pretty: false,
          ...options
        });
        this.compiledTemplates.set(absolutePath, compiled);
      }

      const template = this.compiledTemplates.get(absolutePath)!;
      
      // Create helper functions for Pug templates
      const helpers = {
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

      // Enhance data with helper functions
      const enhancedData = {
        ...data,
        ...options,
        // Make helpers available in templates
        h: helpers,
        _timestamp: new Date().toISOString(),
        _templatePath: templatePath
      };

      return template(enhancedData);
    } catch (error) {
      throw new Error(`Failed to render Pug template: ${error}`);
    }
  }

  async renderPartials(partialPaths: string[]): Promise<void> {
    // Pug handles includes and mixins differently - they're resolved at template compile time
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
    // Pug doesn't provide a direct way to clear compiled template cache
    // The cache is managed internally
  }
}
