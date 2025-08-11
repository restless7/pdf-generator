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
  projectTitle: z.string().min(1),
  proposalDate: z.string(),
  validUntil: z.string(),
  services: z.array(z.object({
    name: z.string(),
    description: z.string(),
    price: z.number(),
    quantity: z.number().optional().default(1)
  })),
  totalAmount: z.number(),
  terms: z.string().optional(),
  companyInfo: z.object({
    name: z.string(),
    address: z.string(),
    email: z.string(),
    phone: z.string(),
    website: z.string().optional()
  })
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

// Template Registry
export const TEMPLATE_REGISTRY: Record<string, TemplateConfig> = {
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
