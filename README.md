# PDF Generator Service v2.0

Professional PDF generation service for PlanMaestro ecosystem with multi-engine template support, smart caching, and advanced asset management.

## Features

- 🔄 **Multi-Engine Templates**: Support for Handlebars, EJS, and Pug
- 💾 **Smart Caching**: SHA-256 based content caching with automatic cleanup
- 🎨 **Asset Management**: Centralized management of logos, fonts, and images  
- 🌍 **Localization**: Multi-language support
- ⚡ **Quality Control**: Draft, Standard, and High quality modes
- 🛡️ **Validation**: Zod-based data validation for templates

## Architecture

```
pdf-generator/
├── server.ts              # Express server entry point
├── src/
│   ├── api/
│   │   └── pdf-routes.ts   # PDF generation endpoints
│   ├── services/
│   │   ├── pdf-generator.ts     # Core PDF generation service
│   │   ├── cache-manager.ts     # Smart caching system
│   │   ├── asset-manager.ts     # Asset management
│   │   └── validation-service.ts # Data validation
│   ├── engines/
│   │   ├── handlebars.ts        # Handlebars engine
│   │   ├── ejs.ts               # EJS engine
│   │   └── pug.ts               # Pug engine
│   ├── templates/
│   │   └── business-plan/       # Business plan templates
│   └── utils/
│       └── logger.ts            # Simple logging utility
└── dist/                   # Compiled output
```

## API Endpoints

### Core Endpoints
- `GET /` - Service information and available endpoints
- `GET /api/health` - Health check and service status
- `GET /api/pdf/templates` - List available templates with metadata
- `POST /api/pdf/generate-sync` - Generate PDF synchronously
- `POST /api/pdf/generate-template` - Generate PDF from specific template
- `GET /api/pdf/jobs` - List generation jobs
- `GET /api/pdf/jobs/:jobId` - Get job status
- `GET /api/pdf/jobs/:jobId/download` - Download generated PDF
- `DELETE /api/pdf/jobs/:jobId` - Cancel a job

### Admin Panel Support
- `GET /api/pdf/stats` - Generation statistics
- `POST /api/pdf/test-templates` - Get test data for templates
- `GET /api/pdf/templates/:templateId/schema` - Template validation schema

### Legacy Compatibility  
- `POST /api/plans/generate-pdf-from-data` - Compatible with business-plan-api

## Development

### Prerequisites
- Node.js 18+
- TypeScript 5+
- Puppeteer for PDF generation

### Local Development
```bash
# Install dependencies
npm install

# Build the project
npm run build:server

# Start development server
npm run start:dev

# Or start compiled version
npm start
```

### Environment Variables
```bash
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:3000
```

## Railway Deployment

### Quick Deploy
1. Connect this repository to Railway
2. Set the root directory to `packages/pdf-generator`
3. Railway will automatically detect the `railway.json` configuration

### Manual Deployment
```bash
# Build for production
npm run railway:build

# Start production server  
npm run railway:start
```

### Railway Configuration
The service is configured with:
- **Build Command**: `npm run railway:build`
- **Start Command**: `npm run railway:start`
- **Auto-restart**: On failure (max 10 retries)
- **Timeout**: 10 minutes for PDF generation

### Environment Variables (Railway)
```bash
NODE_ENV=production
PORT=${{ PORT }}  # Automatically set by Railway
FRONTEND_URL=https://apex-website-seven.vercel.app
```

## Usage Examples

### Generate Business Plan PDF
```javascript
const response = await fetch('https://your-railway-url/api/pdf/generate-sync', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    templateId: 'business-plan',
    data: {
      businessName: 'Mi Empresa',
      businessType: 'Tecnología',
      location: 'Madrid, España',
      targetAudience: 'Empresas B2B',
      sections: [
        {
          title: 'Resumen Ejecutivo',
          content: 'Descripción del negocio...'
        }
      ],
      generationDate: new Date().toISOString()
    },
    returnBuffer: true,
    quality: 'standard'
  })
});

// Response will be PDF buffer for download
```

### Get Available Templates
```javascript
const response = await fetch('https://your-railway-url/api/pdf/templates');
const { templates } = await response.json();
```

### Check Service Health
```javascript
const response = await fetch('https://your-railway-url/api/health');
const status = await response.json();
```

## Integration with Admin Panel

The PDF Generator is designed to work seamlessly with the admin panel. Ensure your frontend environment variables point to the deployed Railway URL:

```bash
# In your frontend .env
NEXT_PUBLIC_PDF_GENERATOR_URL=https://your-pdf-generator.railway.app
```

## Performance

- **Generation Time**: 2-5 seconds per PDF
- **Cache Hit Rate**: ~67% for similar content
- **Concurrent Jobs**: Supports multiple simultaneous generations
- **Memory Usage**: Optimized for cloud deployment
- **Timeout**: 10 minutes maximum per generation

## Monitoring

The service provides detailed statistics at `/api/pdf/stats`:
- Total generations
- Success/failure rates  
- Average generation times
- Cache performance
- Memory usage

## Troubleshooting

### Common Issues
1. **Puppeteer Installation**: Ensure Puppeteer is properly installed
2. **Memory Limits**: Increase Railway memory if needed for complex PDFs
3. **Timeout Errors**: Adjust timeout settings for large documents
4. **Template Errors**: Verify template syntax and data structure

### Logs
The service provides structured logging for debugging:
- Request/response logging
- Generation progress tracking
- Error details with stack traces
- Performance metrics

## Support

For issues related to PDF generation, check:
1. Service health endpoint
2. Generation logs
3. Template validation errors
4. Memory and timeout settings

---

**Version**: 2.0.0  
**Service**: pdf-generator  
**Architecture**: Microservice  
**Deployment**: Railway  
**Status**: Production Ready
