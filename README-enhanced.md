# Enhanced PDF Generator v2.0

A comprehensive, enterprise-grade PDF generation system with multi-engine template support, intelligent caching, asset management, and professional workflows.

## 🚀 Features

### Core Capabilities
- **Multi-Engine Templates**: Support for Handlebars, EJS, and Pug template engines
- **Intelligent Caching**: Advanced caching system with LRU eviction and size management
- **Asset Management**: Centralized handling of logos, fonts, images, and stylesheets
- **Schema Validation**: Robust data validation using Zod schemas
- **Job Management**: Asynchronous PDF generation with progress tracking
- **Quality Control**: Multiple quality levels (draft, standard, high)
- **Internationalization**: Multi-language support with locale-aware formatting

### Professional Features
- **Watermarking**: Dynamic watermark application with customizable opacity
- **Template Versioning**: Version control for templates and backward compatibility
- **Asset Optimization**: Automatic asset loading and optimization
- **Error Handling**: Comprehensive error reporting and recovery
- **Performance Monitoring**: Generation time tracking and performance metrics
- **Memory Management**: Efficient resource usage with cleanup routines

## 📦 Installation

```bash
# Install the package
npm install @planmaestro/pdf-generator

# Install peer dependencies
npm install express puppeteer
```

## 🏗 Architecture

```
src/
├── config/
│   └── templates.ts          # Template registry and schemas
├── engines/
│   ├── index.ts             # Engine factory
│   ├── handlebars.ts        # Handlebars engine implementation
│   ├── ejs.ts               # EJS engine implementation
│   └── pug.ts               # Pug engine implementation
├── services/
│   ├── pdf-generator.ts     # Main PDF generator service
│   ├── cache-manager.ts     # Intelligent caching system
│   ├── asset-manager.ts     # Asset management system
│   └── validation-service.ts # Data validation service
├── templates/
│   └── business-plan/       # Template files
├── api/
│   └── pdf-routes.ts        # Express API routes
└── index.ts                 # Main exports
```

## 🚀 Quick Start

### Basic Usage

```typescript
import { EnhancedPDFGenerator } from '@planmaestro/pdf-generator';

// Initialize the generator
const pdfGenerator = new EnhancedPDFGenerator();
await pdfGenerator.initialize();

// Generate a business plan PDF
const job = await pdfGenerator.generatePDF({
  templateId: 'business-plan',
  data: {
    businessName: 'Mi Empresa',
    businessType: 'Tecnología',
    location: 'Madrid, España',
    targetAudience: 'Jóvenes profesionales',
    sections: [
      {
        title: 'Resumen Ejecutivo',
        content: 'Una empresa innovadora...'
      }
    ],
    generationDate: new Date().toISOString()
  },
  quality: 'high',
  locale: 'es'
});

// Check job status
const status = await pdfGenerator.getJobStatus(job.id);
console.log(`PDF generation status: ${status}`);
```

### Express API Integration

```typescript
import express from 'express';
import { pdfRoutes } from '@planmaestro/pdf-generator';

const app = express();
app.use(express.json());

// Mount PDF generation routes
app.use('/api/pdf', pdfRoutes);

app.listen(3000, () => {
  console.log('PDF generation API ready on port 3000');
});
```

## 🎯 API Endpoints

### Generate PDF (Async)
```http
POST /api/pdf/generate
Content-Type: application/json

{
  "templateId": "business-plan",
  "data": { ... },
  "quality": "high",
  "locale": "es"
}
```

### Generate PDF (Sync)
```http
POST /api/pdf/generate-sync
Content-Type: application/json

{
  "templateId": "business-plan",
  "data": { ... },
  "returnBuffer": true
}
```

### Job Status
```http
GET /api/pdf/jobs/{jobId}
```

### Download PDF
```http
GET /api/pdf/jobs/{jobId}/download
```

### List Templates
```http
GET /api/pdf/templates
```

### Legacy Compatibility
```http
POST /api/plans/generate-pdf-from-data
```

## 📋 Templates

### Business Plan Template

The enhanced business plan template supports:

- **Multi-language**: Spanish and English localization
- **Responsive Design**: Optimized for both screen and print
- **Asset Integration**: Dynamic logo and branding insertion
- **Quality Variations**: Different styling based on quality setting
- **Professional Layout**: Table of contents, structured sections, highlights

#### Required Data Schema

```typescript
{
  businessName: string;
  businessType: string;
  location: string;
  targetAudience: string;
  businessDescription?: string;
  sections: Array<{
    title: string;
    content: string;
    highlights?: string;
    order?: number;
  }>;
  generationDate: string;
  metadata?: {
    plan: 'free' | 'professional' | 'premium' | 'enterprise';
    branding?: {
      logo?: string;
      colors?: {
        primary?: string;
        secondary?: string;
      };
      companyName?: string;
    };
  };
}
```

## 🎨 Template Engines

### Handlebars
- **Helpers**: Extensive collection of formatting helpers
- **Partials**: Reusable template components
- **Localization**: Built-in date and currency formatting

### EJS
- **JavaScript Integration**: Full JavaScript expression support
- **Includes**: Template composition and reuse
- **Performance**: Compiled template caching

### Pug
- **Clean Syntax**: Minimal, indentation-based templates
- **Mixins**: Reusable template functions
- **Filters**: Content transformation filters

## 🗄 Caching System

### Features
- **Intelligent Caching**: SHA-256 based cache keys
- **Size Management**: Automatic LRU eviction when cache limit exceeded
- **TTL Support**: Configurable time-to-live for cache entries
- **Persistence**: File-based cache persistence across restarts

### Configuration
```typescript
const cacheManager = new CacheManager(
  './cache',           // Cache directory
  100 * 1024 * 1024,   // Max size: 100MB
  24 * 60 * 60 * 1000  // TTL: 24 hours
);
```

## 🎯 Asset Management

### Supported Asset Types
- **Logos**: SVG, PNG with variants (light, dark, color)
- **Fonts**: WOFF2, WOFF, TTF format support
- **Images**: Dynamic image loading and optimization
- **Stylesheets**: CSS asset management

### Asset Registry
```typescript
const ASSET_REGISTRY = {
  logos: [
    {
      type: 'logo',
      name: 'company-logo',
      path: 'assets/logos/logo.svg',
      variants: {
        light: 'assets/logos/logo-light.svg',
        dark: 'assets/logos/logo-dark.svg'
      }
    }
  ]
};
```

## 📊 Job Management

### Job Lifecycle
1. **Pending**: Job created and queued
2. **Processing**: PDF generation in progress
3. **Completed**: PDF successfully generated
4. **Failed**: Error occurred during generation

### Progress Tracking
Jobs provide real-time progress updates:
- Data validation (20%)
- Template rendering (50%)
- PDF generation (90%)
- Cleanup and caching (100%)

## ⚙️ Configuration Options

### Generation Options
```typescript
interface GenerationOptions {
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
```

## 🔧 Advanced Usage

### Custom Template Engine
```typescript
class CustomEngine implements TemplateEngineInterface {
  async render(templatePath: string, data: any): Promise<string> {
    // Custom rendering logic
  }
}

TemplateEngineFactory.registerEngine('custom', CustomEngine);
```

### Custom Asset Loader
```typescript
const assetManager = new AssetManager(customAssetRegistry);
await assetManager.loadAsset({
  type: 'font',
  name: 'custom-font',
  path: 'fonts/custom.woff2'
});
```

## 📈 Performance Optimization

### Best Practices
- **Template Compilation**: Templates are compiled once and cached
- **Asset Preloading**: Common assets loaded at startup
- **Memory Management**: Automatic cleanup of expired jobs
- **Browser Pool**: Efficient Puppeteer browser management

### Monitoring
```typescript
// Get cache statistics
const stats = await cacheManager.getStats();
console.log(`Cache hit rate: ${stats.hitRate}%`);

// Get asset loading statistics
const assetStats = assetManager.getLoadedAssetStats();
console.log(`Assets loaded: ${assetStats.totalAssets}`);
```

## 🛠 Development

### Local Development
```bash
# Install dependencies
npm install

# Build the package
npm run build

# Run development server
npm run dev

# Run tests
npm test
```

### Creating New Templates

1. Define template configuration in `templates.ts`
2. Create template files in appropriate engine format
3. Add validation schema using Zod
4. Register in `TEMPLATE_REGISTRY`

## 🤝 Migration from v1.0

The enhanced system maintains backward compatibility through legacy endpoints:

```typescript
// Legacy endpoint still supported
POST /api/plans/generate-pdf-from-data

// New recommended approach
POST /api/pdf/generate-sync
```

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For technical support and feature requests, please open an issue in the GitHub repository.
