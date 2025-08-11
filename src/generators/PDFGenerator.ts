import puppeteer, { Browser, Page } from 'puppeteer';
import * as showdown from 'showdown';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';

export interface PDFOptions {
  format?: 'A4' | 'Letter';
  displayHeaderFooter?: boolean;
  printBackground?: boolean;
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
}

export interface DocumentData {
  [key: string]: any; // Allow any data to be passed to the template
}

export class PDFGenerator {
  private browser: Browser | null = null;
  private isBrowserInUse = false;
  private templateCache = new Map<string, HandlebarsTemplateDelegate>();

  constructor() {
    this.registerHandlebarsHelpers();
    this.initBrowser().catch(err => console.error('Failed to initialize browser on startup', err));
  }

  private async initBrowser(): Promise<void> {
    if (this.browser) return;
    
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding'
      ],
      executablePath: '/usr/bin/google-chrome',
      timeout: 60000 // 60s timeout for launch
    });
    
    this.browser.on('disconnected', () => {
      console.warn('Puppeteer browser disconnected. It will be restarted on next use.');
      this.browser = null;
    });
  }

  async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  private registerHandlebarsHelpers(): void {
    handlebars.registerHelper('add', (a: number, b: number) => a + b);

    // Create a markdown converter instance for this helper
    const converter = new showdown.Converter({
      tables: true,
      strikethrough: true,
      tasklists: true,
      simpleLineBreaks: true
    });

    handlebars.registerHelper('formatContent', (content: string) => {
      if (!content) return '';
      // Convert Markdown to HTML using Showdown
      const html = converter.makeHtml(content);
      return new handlebars.SafeString(html);
    });

    handlebars.registerHelper('formatDate', (date: Date) => {
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    });
  }

  private async loadTemplate(templateName: string): Promise<HandlebarsTemplateDelegate> {
    // Clear cache for debugging (remove this line in production)
    this.templateCache.clear();
    
    if (this.templateCache.has(templateName)) {
      return this.templateCache.get(templateName)!;
    }

    // Try multiple paths to find the template
    const possiblePaths = [
      path.join(__dirname, '..', 'templates', `${templateName}.hbs`), // dist/templates
      path.join(__dirname, '..', '..', 'src', 'templates', `${templateName}.hbs`), // src/templates
    ];
    
    let templatePath = '';
    for (const possiblePath of possiblePaths) {
      console.log(`Checking template path: ${possiblePath} - exists: ${fs.existsSync(possiblePath)}`);
      if (fs.existsSync(possiblePath)) {
        templatePath = possiblePath;
        break;
      }
    }
    
    if (!templatePath) {
      throw new Error(`Template not found: ${templateName}.hbs in paths: ${possiblePaths.join(', ')}`);
    }

    console.log(`✅ Using template: ${templatePath}`);
    const templateContent = fs.readFileSync(templatePath, 'utf-8');
    console.log(`Template content preview: ${templateContent.substring(0, 200)}...`);
    const compiledTemplate = handlebars.compile(templateContent);
    
    this.templateCache.set(templateName, compiledTemplate);
    return compiledTemplate;
  }

  async generatePDF(
    templateName: string,
    data: DocumentData, 
    options: PDFOptions = {}
  ): Promise<Buffer> {
    if (this.isBrowserInUse) {
      throw new Error('Browser is currently in use. Please try again.');
    }
    
    this.isBrowserInUse = true;
    let page: Page | null = null;
    
    try {
      if (!this.browser) {
        console.log('🔄 Restarting Puppeteer browser...');
        await this.initBrowser();
      }

      if (!this.browser) {
        throw new Error('Browser could not be initialized');
      }

      page = await this.browser.newPage();

      await page.setViewport({ width: 1240, height: 1754 });

      const template = await this.loadTemplate(templateName);
      const html = template(data);

      await page.setContent(html, { 
        waitUntil: ['networkidle0', 'domcontentloaded'],
        timeout: 60000 // 60s timeout
      });

      const defaultOptions: PDFOptions = {
        format: 'A4',
        printBackground: true,
        margin: { top: '2cm', right: '1.5cm', bottom: '2cm', left: '1.5cm' }
      };

      const pdfOptions = { ...defaultOptions, ...options };

      const pdfBuffer = await page.pdf({
        format: pdfOptions.format,
        printBackground: pdfOptions.printBackground,
        margin: pdfOptions.margin,
        preferCSSPageSize: true
      });

      return Buffer.from(pdfBuffer);

    } catch (error) {
      console.error('Error during PDF generation:', error);
      // Attempt to restart browser on critical errors
      if (error instanceof Error && (error.message.includes('Protocol error') || error.message.includes('Target closed'))) {
        await this.closeBrowser();
      }
      throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      if (page) {
        await page.close();
      }
      this.isBrowserInUse = false;
    }
  }
}
