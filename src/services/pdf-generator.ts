import puppeteer, { Browser, Page, PDFOptions } from 'puppeteer';
import { promises as fs } from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { TemplateConfig, GenerationJob, JobStatus, TEMPLATE_REGISTRY, ASSET_REGISTRY } from '../config/templates';
import { TemplateEngineFactory } from '../engines';
import { CacheManager } from './cache-manager';
import { AssetManager } from './asset-manager';
import { ValidationService } from './validation-service';

export interface GenerationOptions {
  templateId: string;
  data: any;
  format?: 'A4' | 'Letter';
  margins?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  printBackground?: boolean;
  displayHeaderFooter?: boolean;
  headerTemplate?: string;
  footerTemplate?: string;
  watermark?: {
    enabled: boolean;
    text?: string;
    opacity?: number;
  };
  locale?: string;
  outputPath?: string;
  returnBuffer?: boolean;
  quality?: 'draft' | 'standard' | 'high';
}

export class EnhancedPDFGenerator {
  private browser: Browser | null = null;
  private jobs: Map<string, GenerationJob> = new Map();
  private cacheManager: CacheManager;
  private assetManager: AssetManager;
  private validationService: ValidationService;
  private readonly outputDir: string;
  private readonly tempDir: string;

  constructor(
    outputDir: string = './output',
    cacheDir: string = './cache',
    tempDir: string = './temp'
  ) {
    this.outputDir = outputDir;
    this.tempDir = tempDir;
    this.cacheManager = new CacheManager(cacheDir);
    this.assetManager = new AssetManager(ASSET_REGISTRY);
    this.validationService = new ValidationService();
  }

  async initialize(): Promise<void> {
    // Ensure directories exist
    await this.ensureDirectories();

    // Initialize browser with Railway-compatible configuration
    const puppeteerConfig: any = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-default-apps',
        '--disable-extensions',
        '--disable-accelerated-2d-canvas',
        '--no-zygote',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ],
      timeout: 60000
    };

    // Use Nixpacks Chromium on Railway in production
    if (process.env.NODE_ENV === 'production') {
      if (process.env.PUPPETEER_EXECUTABLE_PATH) {
        puppeteerConfig.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
        console.log('🔧 Using Railway Chromium:', process.env.PUPPETEER_EXECUTABLE_PATH);
      } else {
        // Fallback paths to try
        const fallbackPaths = [
          '/usr/bin/chromium',
          '/usr/bin/chromium-browser', 
          '/usr/bin/google-chrome',
          '/usr/bin/google-chrome-stable'
        ];
        
        for (const execPath of fallbackPaths) {
          try {
            // Check if file exists using fs
            await fs.access(execPath);
            puppeteerConfig.executablePath = execPath;
            console.log('🎯 Found Chromium at:', execPath);
            break;
          } catch {
            // File doesn't exist, continue to next path
            continue;
          }
        }
        
        if (!puppeteerConfig.executablePath) {
          console.log('⚠️  Warning: No Chromium executable found, using Puppeteer default');
        }
      }
    }

    this.browser = await puppeteer.launch(puppeteerConfig);

    // Initialize services
    await this.cacheManager.initialize();
    await this.assetManager.initialize();
  }

  private async ensureDirectories(): Promise<void> {
    const dirs = [this.outputDir, this.tempDir];
    for (const dir of dirs) {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  async generatePDF(options: GenerationOptions): Promise<GenerationJob> {
    const jobId = uuidv4();
    const templateConfig = TEMPLATE_REGISTRY[options.templateId];

    if (!templateConfig) {
      throw new Error(`Template '${options.templateId}' not found`);
    }

    // Create job
    const job: GenerationJob = {
      id: jobId,
      templateId: options.templateId,
      status: 'pending',
      progress: 0,
      data: options.data,
      options: options,
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    };

    this.jobs.set(jobId, job);

    // Process job asynchronously
    this.processJob(job, templateConfig, options).catch(error => {
      job.status = 'failed';
      job.error = error.message;
      job.updatedAt = new Date();
    });

    return job;
  }

  private async processJob(
    job: GenerationJob,
    templateConfig: TemplateConfig,
    options: GenerationOptions
  ): Promise<void> {
    try {
      // Update job status
      job.status = 'processing';
      job.progress = 10;
      job.updatedAt = new Date();

      const startTime = Date.now();

      // Step 1: Validate data
      await this.validationService.validateData(options.data, templateConfig.schema);
      job.progress = 20;

      // Step 2: Check cache
      const cacheKey = this.cacheManager.generateCacheKey(options.templateId, options.data, options);
      const cachedResult = await this.cacheManager.get(cacheKey);
      
      if (cachedResult) {
        job.result = cachedResult;
        job.status = 'completed';
        job.progress = 100;
        job.updatedAt = new Date();
        return;
      }

      job.progress = 30;

      // Step 3: Load and process assets
      await this.assetManager.loadAssets(templateConfig.assets || []);
      job.progress = 40;

      // Step 4: Render template
      const engine = TemplateEngineFactory.getEngine(templateConfig.engine);
      
      // Load partials if needed
      if (templateConfig.partials && engine.renderPartials) {
        const partialPaths = templateConfig.partials.map(partial => 
          path.resolve(path.dirname(templateConfig.templatePath), `${partial}.${this.getTemplateExtension(templateConfig.engine)}`)
        );
        await engine.renderPartials(partialPaths);
      }

      job.progress = 50;

      // Prepare template data
      const templateData = this.prepareTemplateData(options.data, templateConfig, options);
      
      // Render template
      const html = await engine.render(templateConfig.templatePath, templateData, {
        locale: options.locale || templateConfig.localization?.defaultLocale || 'es'
      });

      job.progress = 70;

      // Step 5: Generate PDF
      const pdfBuffer = await this.renderHTMLToPDF(html, templateConfig, options);
      job.progress = 90;

      // Step 6: Save or return result
      const result = await this.handleOutput(pdfBuffer, options, job.id);
      
      // Cache result
      await this.cacheManager.set(cacheKey, result);

      // Update job with result
      job.result = {
        ...result,
        metadata: {
          ...result.metadata,
          generationTime: Date.now() - startTime,
          version: templateConfig.version
        }
      };
      job.status = 'completed';
      job.progress = 100;
      job.updatedAt = new Date();

    } catch (error) {
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : 'Unknown error';
      job.updatedAt = new Date();
      throw error;
    }
  }

  private prepareTemplateData(data: any, templateConfig: TemplateConfig, options: GenerationOptions): any {
    return {
      ...data,
      _template: {
        id: templateConfig.id,
        name: templateConfig.name,
        version: templateConfig.version
      },
      _generation: {
        date: new Date().toISOString(),
        locale: options.locale || templateConfig.localization?.defaultLocale || 'es',
        quality: options.quality || 'standard'
      },
      _assets: this.assetManager.getAssetPaths(templateConfig.assets || []),
      _branding: data.metadata?.branding || {}
    };
  }

  private async renderHTMLToPDF(
    html: string,
    templateConfig: TemplateConfig,
    options: GenerationOptions
  ): Promise<Buffer> {
    if (!this.browser) {
      throw new Error('Browser not initialized');
    }

    const page = await this.browser.newPage();

    try {
      // Set viewport for consistent rendering
      await page.setViewport({ width: 1200, height: 1600 });

      // Load CSS if available
      if (templateConfig.stylePath) {
        const css = await fs.readFile(templateConfig.stylePath, 'utf-8');
        await page.addStyleTag({ content: css });
      }

      // Set content
      await page.setContent(html, { 
        waitUntil: ['networkidle0', 'domcontentloaded'],
        timeout: 30000
      });

      // Apply watermark if needed
      if (options.watermark?.enabled) {
        await this.applyWatermark(page, options.watermark);
      }

      // Configure PDF options
      const pdfOptions: PDFOptions = {
        format: options.format || templateConfig.defaultOptions.format,
        margin: {
          top: options.margins?.top || templateConfig.defaultOptions.margins.top,
          right: options.margins?.right || templateConfig.defaultOptions.margins.right,
          bottom: options.margins?.bottom || templateConfig.defaultOptions.margins.bottom,
          left: options.margins?.left || templateConfig.defaultOptions.margins.left
        },
        printBackground: options.printBackground ?? templateConfig.defaultOptions.printBackground,
        displayHeaderFooter: options.displayHeaderFooter ?? templateConfig.defaultOptions.displayHeaderFooter,
        headerTemplate: options.headerTemplate || '',
        footerTemplate: options.footerTemplate || ''
      };

      // Adjust quality settings
      if (options.quality === 'high') {
        pdfOptions.preferCSSPageSize = true;
      } else if (options.quality === 'draft') {
        pdfOptions.scale = 0.8;
      }

      return Buffer.from(await page.pdf(pdfOptions));

    } finally {
      await page.close();
    }
  }

  private async applyWatermark(
    page: Page,
    watermark: { text?: string; opacity?: number }
  ): Promise<void> {
    const watermarkCSS = `
      body::before {
        content: "${watermark.text || 'CONFIDENTIAL'}";
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-45deg);
        font-size: 72px;
        font-weight: bold;
        color: rgba(0, 0, 0, ${watermark.opacity || 0.1});
        z-index: 1000;
        pointer-events: none;
        white-space: nowrap;
      }
    `;
    
    await page.addStyleTag({ content: watermarkCSS });
  }

  private async handleOutput(
    pdfBuffer: Buffer,
    options: GenerationOptions,
    jobId: string
  ): Promise<any> {
    const result: any = {
      metadata: {
        fileSize: pdfBuffer.length,
        pageCount: await this.getPageCount(pdfBuffer),
        generationTime: 0, // Will be set by caller
        version: ''        // Will be set by caller
      }
    };

    if (options.returnBuffer) {
      result.pdfBuffer = pdfBuffer;
    }

    if (options.outputPath) {
      await fs.writeFile(options.outputPath, pdfBuffer);
      result.pdfPath = options.outputPath;
    } else {
      // Save to output directory
      const filename = `${jobId}.pdf`;
      const filepath = path.join(this.outputDir, filename);
      await fs.writeFile(filepath, pdfBuffer);
      result.pdfPath = filepath;
    }

    return result;
  }

  private async getPageCount(pdfBuffer: Buffer): Promise<number> {
    // Simple page count estimation by counting PDF page objects
    const pdfString = pdfBuffer.toString('latin1');
    const pageMatches = pdfString.match(/\/Type\s*\/Page\b/g);
    return pageMatches ? pageMatches.length : 1;
  }

  private getTemplateExtension(engine: string): string {
    switch (engine) {
      case 'handlebars': return 'hbs';
      case 'ejs': return 'ejs';
      case 'pug': return 'pug';
      default: return 'html';
    }
  }

  // Public API methods
  async getJob(jobId: string): Promise<GenerationJob | null> {
    return this.jobs.get(jobId) || null;
  }

  async getJobStatus(jobId: string): Promise<JobStatus | null> {
    const job = this.jobs.get(jobId);
    return job?.status || null;
  }

  async cancelJob(jobId: string): Promise<boolean> {
    const job = this.jobs.get(jobId);
    if (job && job.status === 'pending') {
      job.status = 'failed';
      job.error = 'Job cancelled';
      job.updatedAt = new Date();
      return true;
    }
    return false;
  }

  async listJobs(status?: JobStatus): Promise<GenerationJob[]> {
    const allJobs = Array.from(this.jobs.values());
    return status ? allJobs.filter(job => job.status === status) : allJobs;
  }

  async cleanup(): Promise<void> {
    // Clean up expired jobs
    const now = new Date();
    for (const [jobId, job] of this.jobs.entries()) {
      if (job.expiresAt && job.expiresAt < now) {
        this.jobs.delete(jobId);
      }
    }

    // Cleanup services
    await TemplateEngineFactory.cleanup();
    await this.cacheManager.cleanup();
    await this.assetManager.cleanup();

    // Close browser
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

export default EnhancedPDFGenerator;
