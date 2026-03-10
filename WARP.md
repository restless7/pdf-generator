# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is the **PDF Generator Service v2.0** - A professional PDF generation microservice for the PlanMaestro ecosystem. It provides multi-engine template support (Handlebars, EJS, Pug), smart caching with SHA-256, asset management, and quality control modes.

## Common Development Commands

### Core Development
```bash
# Install dependencies
npm install

# Build the project (includes copying templates)
npm run build

# Build specifically for server deployment
npm run build:server

# Start development server with TypeScript watch mode
npm run dev

# Start development server with ts-node (hot reload)
npm run start:dev

# Start production server (requires build first)
npm start

# Clean build artifacts
npm run clean

# Run tests
npm test
```

### Railway Deployment
```bash
# Build for Railway deployment
npm run railway:build

# Start Railway production server
npm run railway:start
```

### Service Management
```bash
# Check service health
curl http://localhost:4000/api/health

# List available templates
curl http://localhost:4000/api/pdf/templates

# Get generation statistics
curl http://localhost:4000/api/pdf/stats
```

## Architecture Overview

### Core Structure
The service follows a modular microservice architecture:

```
src/
├── api/pdf-routes.ts          # Express routes for PDF operations
├── services/
│   ├── pdf-generator.ts       # Main PDF generation service with Puppeteer
│   ├── cache-manager.ts       # SHA-256 based caching system
│   ├── asset-manager.ts       # Centralized asset management
│   └── validation-service.ts  # Zod-based data validation
├── engines/
│   ├── handlebars.ts         # Handlebars template engine
│   ├── ejs.ts                # EJS template engine
│   └── pug.ts                # Pug template engine
├── config/templates.ts        # Template registry and schemas
└── server.ts                 # Express server with CORS and timeout config
```

### Key Design Patterns

**Service Layer**: All business logic is encapsulated in service classes (`EnhancedPDFGenerator`, `CacheManager`, `AssetManager`, `ValidationService`)

**Template Engine Factory**: Multi-engine support through a factory pattern that abstracts template rendering

**Job-based Processing**: Asynchronous PDF generation with job tracking and status polling

**Smart Caching**: Content-based caching using SHA-256 hashing for efficient cache key generation

### Data Flow
1. Request received → Validation → Cache check
2. If cache miss: Asset loading → Template rendering → PDF generation
3. Result caching → Response (buffer or file path)

## Key Technologies

- **Express.js**: Web server with 10-minute timeouts for PDF operations
- **Puppeteer**: PDF generation with Railway/Docker-compatible Chromium configuration
- **TypeScript**: Full type safety with strict compiler options
- **Template Engines**: Handlebars, EJS, and Pug support
- **Zod**: Runtime data validation for template inputs
- **UUID**: Job ID generation

## Environment Configuration

### Development
```bash
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:3000
```

### Production (Railway)
```bash
NODE_ENV=production
PORT=${{ PORT }}  # Auto-set by Railway
FRONTEND_URL=https://apex-website-seven.vercel.app
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium  # Set by Dockerfile
```

## API Endpoints

### Core Generation
- `POST /api/pdf/generate-sync` - Synchronous PDF generation (returns PDF buffer)
- `POST /api/pdf/generate-template` - Template-specific generation
- `GET /api/pdf/jobs/:jobId` - Check generation job status
- `GET /api/pdf/jobs/:jobId/download` - Download generated PDF

### Admin/Monitoring
- `GET /api/health` - Service health check
- `GET /api/pdf/templates` - List available templates with metadata
- `GET /api/pdf/stats` - Generation statistics and performance metrics
- `POST /api/pdf/test-templates` - Get test data for templates

### Legacy Compatibility
- `POST /api/plans/generate-pdf-from-data` - Compatible with business-plan-api

## Deployment Configuration

### Railway
- Uses Dockerfile-based deployment
- Health check endpoint: `/api/health`
- Auto-restart on failure (max 10 retries)
- 10-minute timeout for long-running PDF operations

### Docker
- Node.js 20 with Chromium pre-installed
- Production-optimized with dev dependencies pruned
- Health check with curl

### Nixpacks (Alternative)
- Chromium package included in nixPkgs
- Puppeteer configured to skip Chromium download

## Testing and Debugging

### Common Test Cases
```bash
# Test service health
curl http://localhost:4000/api/health

# Generate test PDF (business plan)
curl -X POST http://localhost:4000/api/pdf/generate-sync \
  -H "Content-Type: application/json" \
  -d '{"templateId":"business-plan","data":{"businessName":"Test Co"},"returnBuffer":true}'

# Check available templates
curl http://localhost:4000/api/pdf/templates
```

### Debug Considerations
- Puppeteer requires specific Chrome flags for Railway/containerized environments
- Template rendering errors often stem from invalid data structure vs schema
- Memory limits may need adjustment for complex PDFs
- Cache performance can be monitored via `/api/pdf/stats`

## Integration Points

### PlanMaestro Ecosystem
- Designed to integrate with admin panels via REST API
- Compatible with existing business-plan-api endpoints
- Supports the broader PlanMaestro monorepo structure

### Frontend Integration
```typescript
// Frontend environment variable
NEXT_PUBLIC_PDF_GENERATOR_URL=https://your-pdf-generator.railway.app
```

## Performance Characteristics

- **Generation Time**: 2-5 seconds per PDF
- **Cache Hit Rate**: ~67% for similar content
- **Concurrent Jobs**: Supports multiple simultaneous generations
- **Memory**: Optimized for cloud deployment with cleanup
- **Timeout**: 10 minutes maximum per generation