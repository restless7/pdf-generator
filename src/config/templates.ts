import { z } from 'zod';

// Template engine types
export type TemplateEngine = 'handlebars' | 'ejs' | 'pug';

// Template configuration interface
export interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  version: string;
  engine: TemplateEngine;
  category: 'business-plan' | 'proposal' | 'invoice' | 'report' | 'contract';
  templatePath: string;
  stylePath?: string;
  partials?: string[];
  assets?: string[];
  schema: z.ZodSchema<any>;
  defaultOptions: {
    format: 'A4' | 'Letter';
    margins: {
      top: string;
      right: string;
      bottom: string;
      left: string;
    };
    printBackground: boolean;
    displayHeaderFooter: boolean;
    watermark?: {
      enabled: boolean;
      text?: string;
      opacity?: number;
    };
  };
  localization?: {
    supported: string[];
    defaultLocale: string;
  };
}

// Business Plan Data Schema
export const BusinessPlanSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  businessType: z.string().min(1, 'Business type is required'),
  location: z.string().min(1, 'Location is required'),
  targetAudience: z.string().min(1, 'Target audience is required'),
  businessDescription: z.string().optional(),
  sections: z.array(z.object({
    title: z.string(),
    content: z.string(),
    highlights: z.string().optional(),
    order: z.number().optional()
  })),
  generationDate: z.string(),
  metadata: z.object({
    plan: z.enum(['free', 'professional', 'premium', 'enterprise']),
    features: z.record(z.string(), z.boolean()).optional(),
    branding: z.object({
      logo: z.string().optional(),
      colors: z.object({
        primary: z.string().optional(),
        secondary: z.string().optional()
      }).optional(),
      companyName: z.string().optional()
    }).optional()
  }).optional()
});

// Proposal Data Schema
export const ProposalSchema = z.object({
  clientName: z.string().min(1),
  companyName: z.string().min(1),
  clientEmail: z.string().optional().or(z.literal('')),
  clientPhone: z.string().optional().or(z.literal('')),
  proposalType: z.string().min(1),
  serviceName: z.string().min(1),
  serviceDescription: z.string().optional().or(z.literal('')),
  capabilities: z.array(z.string()).optional(),
  techStack: z.array(z.string()).optional(),
  tierName: z.string().optional().or(z.literal('')),
  tierDescription: z.string().optional().or(z.literal('')),
  price: z.string().optional().or(z.literal('')),
  priceRange: z.string().optional().or(z.literal('')),
  currency: z.string().optional().or(z.literal('')),
  timeline: z.string().optional().or(z.literal('')),
  features: z.array(z.string()).optional(),
  deliverables: z.array(z.string()).optional(),
  excludedFeatures: z.array(z.string()).optional(),
  successMetrics: z.array(z.string()).optional(),
  addOnOptions: z.array(z.string()).optional(),
  validUntil: z.string().min(1),
  generatedDate: z.string().min(1),
  proposalToken: z.string().optional(),
  proposalUrl: z.string().optional().or(z.literal(''))
});

// Invoice Data Schema
export const InvoiceSchema = z.object({
  invoiceNumber: z.string().min(1),
  clientName: z.string().min(1),
  invoiceDate: z.string(),
  dueDate: z.string(),
  items: z.array(z.object({
    description: z.string(),
    quantity: z.number(),
    rate: z.number(),
    amount: z.number()
  })),
  subtotal: z.number(),
  tax: z.number().optional().default(0),
  total: z.number(),
  notes: z.string().optional(),
  paymentMethod: z.string().optional(),
  companyInfo: z.object({
    name: z.string(),
    address: z.string(),
    email: z.string(),
    phone: z.string(),
    website: z.string().optional(),
    taxId: z.string().optional()
  })
});

// Report Data Schema
export const ReportSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  author: z.string().min(1),
  reportDate: z.string(),
  executiveSummary: z.string().min(1),
  sections: z.array(z.object({
    title: z.string(),
    content: z.string(),
    subsections: z.array(z.object({
      title: z.string(),
      content: z.string()
    })).optional()
  })),
  metrics: z.array(z.object({
    name: z.string(),
    value: z.union([z.string(), z.number()]),
    unit: z.string().optional(),
    trend: z.enum(['up', 'down', 'stable']).optional()
  })).optional(),
  findings: z.array(z.string()).optional(),
  recommendations: z.array(z.string()).optional(),
  appendices: z.array(z.object({
    title: z.string(),
    content: z.string(),
    type: z.enum(['table', 'chart', 'code', 'text']).optional()
  })).optional(),
  companyInfo: z.object({
    name: z.string(),
    logo: z.string().optional()
  }).optional()
});

// Operations Manual Data Schema
export const OperationsManualSchema = z.object({
  documentTitle: z.string().min(1, 'Document title is required'),
  subtitle: z.string().optional(),
  version: z.string(),
  effectiveDate: z.string(),
  confidentialityNotice: z.string().optional(),
  companyInfo: z.object({
    name: z.string(),
    logo: z.string().optional(),
    website: z.string().optional(),
    supportEmail: z.string().optional()
  }).optional(),
  branding: z.object({
    primaryColor: z.string().optional(),
    secondaryColor: z.string().optional(),
    accentColor: z.string().optional()
  }).optional(),
  parts: z.array(z.object({
    partNumber: z.string(),
    partTitle: z.string(),
    sections: z.array(z.object({
      sectionNumber: z.string(),
      title: z.string(),
      content: z.string(),
      tables: z.array(z.object({
        headers: z.array(z.string()),
        rows: z.array(z.array(z.string()))
      })).optional(),
      callout: z.object({
        title: z.string(),
        content: z.string()
      }).optional()
    }))
  }))
});


// Template Registry
export const TEMPLATE_REGISTRY: Record<string, TemplateConfig> = {
  'security-portfolio': {
    id: 'security-portfolio',
    name: 'SECURITY PORTFOLIO',
    description: 'Template for security-portfolio',
    version: '1.0.0',
    engine: 'handlebars',
    category: 'report',
    templatePath: 'templates/security-portfolio.hbs',
    schema: z.any(),
    defaultOptions: {
      format: 'A4',
      margins: { top: '1.5cm', right: '1.5cm', bottom: '1.5cm', left: '1.5cm' },
      printBackground: true,
      displayHeaderFooter: false
    }
  },
  'brand-book': {
    id: 'brand-book',
    name: 'BRAND BOOK',
    description: 'Template for brand-book',
    version: '1.0.0',
    engine: 'handlebars',
    category: 'report',
    templatePath: 'templates/brand-book.hbs',
    schema: z.any(),
    defaultOptions: {
      format: 'A4',
      margins: { top: '1.5cm', right: '1.5cm', bottom: '1.5cm', left: '1.5cm' },
      printBackground: true,
      displayHeaderFooter: false
    }
  },
  'psychology-guide': {
    id: 'psychology-guide',
    name: 'PSYCHOLOGY GUIDE',
    description: 'Template for psychology-guide',
    version: '1.0.0',
    engine: 'handlebars',
    category: 'report',
    templatePath: 'templates/psychology-guide.hbs',
    schema: z.any(),
    defaultOptions: {
      format: 'A4',
      margins: { top: '1.5cm', right: '1.5cm', bottom: '1.5cm', left: '1.5cm' },
      printBackground: true,
      displayHeaderFooter: false
    }
  },
  'ice-visa-rescheduler-bot': {
    id: 'ice-visa-rescheduler-bot',
    name: 'ICE VISA RESCHEDULER BOT',
    description: 'Template for ice-visa-rescheduler-bot',
    version: '1.0.0',
    engine: 'handlebars',
    category: 'report',
    templatePath: 'templates/ice-visa-rescheduler-bot.hbs',
    schema: z.any(),
    defaultOptions: {
      format: 'A4',
      margins: { top: '1.5cm', right: '1.5cm', bottom: '1.5cm', left: '1.5cm' },
      printBackground: true,
      displayHeaderFooter: false
    }
  },
  'apex-partner-documentation': {
    id: 'apex-partner-documentation',
    name: 'APEX PARTNER DOCUMENTATION',
    description: 'Template for apex-partner-documentation',
    version: '1.0.0',
    engine: 'handlebars',
    category: 'report',
    templatePath: 'templates/apex-partner-documentation.hbs',
    schema: z.any(),
    defaultOptions: {
      format: 'A4',
      margins: { top: '1.5cm', right: '1.5cm', bottom: '1.5cm', left: '1.5cm' },
      printBackground: true,
      displayHeaderFooter: false
    }
  },
  'fujiyama-proposal': {
    id: 'fujiyama-proposal',
    name: 'FUJIYAMA PROPOSAL',
    description: 'Template for fujiyama-proposal',
    version: '1.0.0',
    engine: 'handlebars',
    category: 'report',
    templatePath: 'templates/fujiyama-proposal.hbs',
    schema: z.any(),
    defaultOptions: {
      format: 'A4',
      margins: { top: '1.5cm', right: '1.5cm', bottom: '1.5cm', left: '1.5cm' },
      printBackground: true,
      displayHeaderFooter: false
    }
  },
  'sales-manual': {
    id: 'sales-manual',
    name: 'SALES MANUAL',
    description: 'Template for sales-manual',
    version: '1.0.0',
    engine: 'handlebars',
    category: 'report',
    templatePath: 'templates/sales-manual.hbs',
    schema: z.any(),
    defaultOptions: {
      format: 'A4',
      margins: { top: '1.5cm', right: '1.5cm', bottom: '1.5cm', left: '1.5cm' },
      printBackground: true,
      displayHeaderFooter: false
    }
  },
  'sales-manual-mx': {
    id: 'sales-manual-mx',
    name: 'SALES MANUAL MX',
    description: 'Template for sales-manual-mx',
    version: '1.0.0',
    engine: 'handlebars',
    category: 'report',
    templatePath: 'templates/sales-manual-mx.hbs',
    schema: z.any(),
    defaultOptions: {
      format: 'A4',
      margins: { top: '1.5cm', right: '1.5cm', bottom: '1.5cm', left: '1.5cm' },
      printBackground: true,
      displayHeaderFooter: false
    }
  },
  'roi-report': {
    id: 'roi-report',
    name: 'ROI REPORT',
    description: 'Template for roi-report',
    version: '1.0.0',
    engine: 'handlebars',
    category: 'report',
    templatePath: 'templates/roi-report.hbs',
    schema: z.any(),
    defaultOptions: {
      format: 'A4',
      margins: { top: '1.5cm', right: '1.5cm', bottom: '1.5cm', left: '1.5cm' },
      printBackground: true,
      displayHeaderFooter: false
    }
  },
  'partnership-proposal': {
    id: 'partnership-proposal',
    name: 'PARTNERSHIP PROPOSAL',
    description: 'Template for partnership-proposal',
    version: '1.0.0',
    engine: 'handlebars',
    category: 'report',
    templatePath: 'templates/partnership-proposal.hbs',
    schema: z.any(),
    defaultOptions: {
      format: 'A4',
      margins: { top: '1.5cm', right: '1.5cm', bottom: '1.5cm', left: '1.5cm' },
      printBackground: true,
      displayHeaderFooter: false
    }
  },
  'jessica-content-calendar': {
    id: 'jessica-content-calendar',
    name: 'JESSICA CONTENT CALENDAR',
    description: 'Template for jessica-content-calendar',
    version: '1.0.0',
    engine: 'handlebars',
    category: 'report',
    templatePath: 'templates/jessica-content-calendar.hbs',
    schema: z.any(),
    defaultOptions: {
      format: 'A4',
      margins: { top: '1.5cm', right: '1.5cm', bottom: '1.5cm', left: '1.5cm' },
      printBackground: true,
      displayHeaderFooter: false
    }
  },
  'creditos-nv-proposal': {
    id: 'creditos-nv-proposal',
    name: 'CREDITOS NV PROPOSAL',
    description: 'Template for creditos-nv-proposal',
    version: '1.0.0',
    engine: 'handlebars',
    category: 'report',
    templatePath: 'templates/creditos-nv-proposal.hbs',
    schema: z.any(),
    defaultOptions: {
      format: 'A4',
      margins: { top: '1.5cm', right: '1.5cm', bottom: '1.5cm', left: '1.5cm' },
      printBackground: true,
      displayHeaderFooter: false
    }
  },
  'good-energy-funnel': {
    id: 'good-energy-funnel',
    name: 'GOOD ENERGY FUNNEL',
    description: 'Template for good-energy-funnel',
    version: '1.0.0',
    engine: 'handlebars',
    category: 'report',
    templatePath: 'templates/good-energy-funnel.hbs',
    schema: z.any(),
    defaultOptions: {
      format: 'A4',
      margins: { top: '1.5cm', right: '1.5cm', bottom: '1.5cm', left: '1.5cm' },
      printBackground: true,
      displayHeaderFooter: false
    }
  },
  'business-plan': {
    id: 'business-plan',
    name: 'Business Plan Template',
    description: 'Comprehensive business plan with financial projections',
    version: '2.0.0',
    engine: 'handlebars',
    category: 'business-plan',
    templatePath: 'templates/business-plan/index.hbs',
    stylePath: 'templates/business-plan/styles.css',
    partials: ['header', 'footer', 'financial-table'],
    assets: ['logos', 'charts'],
    schema: BusinessPlanSchema,
    defaultOptions: {
      format: 'A4',
      margins: {
        top: '2cm',
        right: '1.5cm',
        bottom: '2cm',
        left: '1.5cm'
      },
      printBackground: true,
      displayHeaderFooter: false,
      watermark: {
        enabled: false,
        text: 'CONFIDENTIAL',
        opacity: 0.1
      }
    },
    localization: {
      supported: ['es', 'en'],
      defaultLocale: 'es'
    }
  },
  'proposal': {
    id: 'proposal',
    name: 'Business Proposal Template',
    description: 'Professional service proposal with pricing',
    version: '1.5.0',
    engine: 'handlebars',
    category: 'proposal',
    templatePath: 'templates/proposal/index.hbs',
    stylePath: 'templates/proposal/styles.css',
    partials: ['header', 'footer', 'service-item'],
    assets: ['logos'],
    schema: ProposalSchema,
    defaultOptions: {
      format: 'A4',
      margins: {
        top: '2cm',
        right: '1.5cm',
        bottom: '2cm',
        left: '1.5cm'
      },
      printBackground: true,
      displayHeaderFooter: true,
      watermark: {
        enabled: false
      }
    },
    localization: {
      supported: ['es', 'en'],
      defaultLocale: 'es'
    }
  },
  'invoice': {
    id: 'invoice',
    name: 'Professional Invoice Template',
    description: 'Modern invoice template with payment details',
    version: '1.0.0',
    engine: 'handlebars',
    category: 'invoice',
    templatePath: 'templates/invoice/index.hbs',
    stylePath: 'templates/invoice/styles.css',
    partials: ['header', 'footer'],
    assets: ['logos'],
    schema: InvoiceSchema,
    defaultOptions: {
      format: 'A4',
      margins: {
        top: '2cm',
        right: '1.5cm',
        bottom: '2cm',
        left: '1.5cm'
      },
      printBackground: true,
      displayHeaderFooter: false,
      watermark: {
        enabled: false
      }
    },
    localization: {
      supported: ['es', 'en'],
      defaultLocale: 'es'
    }
  },
  'report': {
    id: 'report',
    name: 'Technical Report Template',
    description: 'Comprehensive technical report with metrics and analysis',
    version: '1.0.0',
    engine: 'handlebars',
    category: 'report',
    templatePath: 'templates/report/index.hbs',
    stylePath: 'templates/report/styles.css',
    partials: ['header', 'footer'],
    assets: ['logos'],
    schema: ReportSchema,
    defaultOptions: {
      format: 'A4',
      margins: {
        top: '2cm',
        right: '1.5cm',
        bottom: '2cm',
        left: '1.5cm'
      },
      printBackground: true,
      displayHeaderFooter: true,
      watermark: {
        enabled: false
      }
    },
    localization: {
      supported: ['es', 'en'],
      defaultLocale: 'es'
    }
  },
  'technical-proposal': {
    id: 'technical-proposal',
    name: 'Technical Development Proposal Template',
    description: 'Comprehensive software development proposal with technical specifications',
    version: '1.0.0',
    engine: 'handlebars',
    category: 'proposal',
    templatePath: 'templates/technical-proposal/index.hbs',
    partials: [],
    assets: ['logos'],
    schema: ReportSchema,
    defaultOptions: {
      format: 'A4',
      margins: {
        top: '1.5cm',
        right: '1.5cm',
        bottom: '1.5cm',
        left: '1.5cm'
      },
      printBackground: true,
      displayHeaderFooter: false,
      watermark: {
        enabled: false
      }
    },
    localization: {
      supported: ['es', 'en'],
      defaultLocale: 'es'
    }
  },
  'operations-manual': {
    id: 'operations-manual',
    name: 'Operations Manual Template',
    description: 'Comprehensive operational manual for franchise replication',
    version: '1.0.0',
    engine: 'handlebars',
    category: 'report',
    templatePath: 'templates/operations-manual/index.hbs',
    partials: [],
    assets: ['logos'],
    schema: OperationsManualSchema,
    defaultOptions: {
      format: 'A4',
      margins: {
        top: '1.5cm',
        right: '1.5cm',
        bottom: '1.5cm',
        left: '1.5cm'
      },
      printBackground: true,
      displayHeaderFooter: true,
      watermark: {
        enabled: false,
        text: 'CONFIDENTIAL',
        opacity: 0.05
      }
    },
    localization: {
      supported: ['es', 'en'],
      defaultLocale: 'es'
    }
  },
  'ice-operations-manual': {
    id: 'ice-operations-manual',
    name: 'ICE Operations Manual',
    description: 'ICE specific manual',
    version: '1.0.0',
    engine: 'handlebars',
    category: 'report',
    templatePath: 'templates/ice-operations-manual.hbs',
    partials: [],
    assets: ['logos'],
    schema: OperationsManualSchema,
    defaultOptions: {
      format: 'A4',
      margins: {
        top: '1.5cm',
        right: '1.5cm',
        bottom: '1.5cm',
        left: '1.5cm'
      },
      printBackground: true,
      displayHeaderFooter: true,
      watermark: {
        enabled: false
      }
    },
    localization: {
      supported: ['es', 'en'],
      defaultLocale: 'es'
    }
  },
  'onlysafe-architecture': {
    id: 'onlysafe-architecture',
    name: 'OnlySafe Technical Architecture',
    description: 'Comprehensive documentation of the OnlySafe backend and business architecture',
    version: '1.0.0',
    engine: 'handlebars',
    category: 'report',
    templatePath: 'templates/onlysafe-architecture.hbs',
    partials: [],
    assets: ['logos'],
    schema: ReportSchema,
    defaultOptions: {
      format: 'A4',
      margins: {
        top: '1.5cm',
        right: '1.5cm',
        bottom: '1.5cm',
        left: '1.5cm'
      },
      printBackground: true,
      displayHeaderFooter: false,
      watermark: {
        enabled: false
      }
    },
    localization: {
      supported: ['es', 'en'],
      defaultLocale: 'es'
    }
  }
};


// Asset configuration
export interface AssetConfig {
  type: 'logo' | 'font' | 'image' | 'stylesheet';
  name: string;
  path: string;
  variants?: {
    light?: string;
    dark?: string;
    color?: string;
  };
  formats?: string[];
  metadata?: {
    width?: number;
    height?: number;
    description?: string;
  };
}

export const ASSET_REGISTRY: Record<string, AssetConfig[]> = {
  logos: [
    {
      type: 'logo',
      name: 'apex-logo',
      path: 'assets/logos/apex-logo.svg',
      variants: {
        light: 'assets/logos/apex-logo-light.svg',
        dark: 'assets/logos/apex-logo-dark.svg',
        color: 'assets/logos/apex-logo-color.svg'
      },
      formats: ['svg', 'png'],
      metadata: {
        width: 200,
        height: 60,
        description: 'Apex Agency Logo'
      }
    }
  ],
  fonts: [
    {
      type: 'font',
      name: 'inter',
      path: 'assets/fonts/Inter',
      formats: ['woff2', 'woff', 'ttf']
    }
  ]
};

// Generation job status
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface GenerationJob {
  id: string;
  templateId: string;
  status: JobStatus;
  progress: number;
  data: any;
  options: any;
  result?: {
    pdfPath?: string;
    pdfBuffer?: Buffer;
    downloadUrl?: string;
    metadata: {
      fileSize: number;
      pageCount: number;
      generationTime: number;
      version: string;
    };
  };
  error?: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}
