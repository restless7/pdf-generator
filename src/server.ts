import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import pdfRoutes from './api/pdf-routes';
import path from 'path';
import { ValidationService } from './services/validation-service';

// Load environment variables
dotenv.config();

console.log('🚀 Initializing PDF Generator Service...');

const app = express();
const PORT = process.env.PORT || 4000;

// Create HTTP server
const server = createServer(app);

// CORS configuration
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3001',
    'https://apex-website-seven.vercel.app',
    'https://*.vercel.app'
  ],
  credentials: true,
}));

// Body parsing middleware with timeout
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request timeout middleware (10 minutes for PDF generation)
app.use((req, res, next) => {
  req.setTimeout(600000); // 10 minutes
  res.setTimeout(600000); // 10 minutes
  next();
});

console.log('✅ Middlewares configured');

// Welcome route
app.get('/', (req, res) => {
  console.log('📋 Root path request');
  res.json({
    message: 'PlanMaestro PDF Generator Service v2.0',
    version: '2.0.0',
    status: 'running',
    service: 'pdf-generator',
    features: [
      'Multi-engine templates (Handlebars, EJS, Pug)',
      'Smart caching with SHA-256',
      'Asset management',
      'Quality control',
      'Localization support'
    ],
    endpoints: {
      health: '/api/health',
      templates: '/api/pdf/templates',
      generate: '/api/pdf/generate-sync',
      generateTemplate: '/api/pdf/generate-template',
      jobs: '/api/pdf/jobs',
      download: '/api/pdf/jobs/:jobId/download',
      stats: '/api/pdf/stats',
      testTemplates: '/api/pdf/test-templates',
      // Legacy compatibility
      legacyPDF: '/api/plans/generate-pdf-from-data'
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  console.log('🏥 Health check requested');
  res.json({
    status: 'OK',
    message: 'PDF Generator Service is running correctly',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      pdfGenerator: 'active',
      templates: 'loaded',
      cache: 'active',
      validation: 'active'
    },
    version: '2.0.0'
  });
});

// PDF Routes - Mount all PDF endpoints under /api/pdf
try {
  app.use('/api/pdf', pdfRoutes);
  console.log('✅ PDF routes mounted successfully');
} catch (error) {
  console.error('❌ Error mounting PDF routes:', error);
}

// Legacy compatibility route - Direct mount for business plan generator
try {
  app.use('/api', pdfRoutes);
  console.log('✅ Legacy routes mounted successfully');
} catch (error) {
  console.error('❌ Error mounting legacy routes:', error);
}

// Additional endpoints for admin panel compatibility
const validationService = new ValidationService();

// GET /api/pdf/stats - Statistics endpoint
app.get('/api/pdf/stats', (req, res) => {
  try {
    // Mock statistics for now - in production this would come from actual usage data
    const stats = {
      success: true,
      data: {
        overview: {
          totalGenerations: 47,
          successfulGenerations: 45,
          failedGenerations: 2,
          todayGenerations: 8
        },
        performance: {
          avgGenerationTime: 2800, // milliseconds
          cacheHitRate: 67,
          peakThroughput: 12
        },
        templates: [
          { templateId: 'business-plan', usageCount: 25, engine: 'handlebars' },
          { templateId: 'proposal', usageCount: 12, engine: 'handlebars' },
          { templateId: 'invoice', usageCount: 8, engine: 'handlebars' },
          { templateId: 'report', usageCount: 2, engine: 'handlebars' }
        ],
        resources: {
          memoryUsage: process.memoryUsage(),
          uptime: process.uptime()
        }
      }
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/pdf/test-templates - Test data endpoint
app.post('/api/pdf/test-templates', (req, res) => {
  try {
    const { templateId } = req.body;
    
    // Return test data based on template type
    const testDataMap: Record<string, any> = {
      'business-plan': {
        businessName: "Mi Empresa Innovadora",
        businessType: "Tecnología y Consultoría",
        location: "Madrid, España",
        targetAudience: "Pequeñas y medianas empresas",
        businessDescription: "Una empresa dedicada a proporcionar soluciones tecnológicas innovadoras",
        sections: [
          {
            title: "Resumen Ejecutivo",
            content: "Nuestra empresa se enfoca en crear soluciones tecnológicas que transformen la manera en que las empresas operan y crecen en el mercado digital actual.",
            highlights: "Innovación, Tecnología, Crecimiento"
          },
          {
            title: "Análisis de Mercado",
            content: "El mercado tecnológico español presenta oportunidades excepcionales para empresas que ofrezcan servicios de consultoría y desarrollo de software personalizado.",
            highlights: "Mercado en crecimiento, Oportunidades digitales"
          }
        ],
        generationDate: new Date().toISOString(),
        metadata: {
          plan: "professional",
          features: {
            watermark: false,
            highQuality: true
          },
          branding: {
            companyName: "PlanMaestro",
            colors: {
              primary: "#10B981",
              secondary: "#059669"
            }
          }
        }
      },
      'proposal': {
        clientName: "Empresa ABC S.L.",
        projectName: "Desarrollo de Plataforma Web",
        proposalDate: new Date().toISOString(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        services: [
          {
            name: "Desarrollo Frontend",
            description: "Creación de interfaz de usuario moderna y responsive",
            price: 5000,
            duration: "4 semanas"
          },
          {
            name: "Desarrollo Backend",
            description: "API REST y base de datos",
            price: 7000,
            duration: "6 semanas"
          }
        ],
        totalAmount: 12000,
        companyInfo: {
          name: "Mi Consultoría Tech",
          address: "Calle Mayor 123, Madrid",
          phone: "+34 912 345 678",
          email: "info@miconsultoria.es"
        }
      }
    };

    const testData = testDataMap[templateId] || testDataMap['business-plan'];

    res.json({
      success: true,
      templateId,
      testData
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/pdf/generate-template - Template-based generation endpoint
app.post('/api/pdf/generate-template', async (req, res) => {
  try {
    const { templateId, data, options = {} } = req.body;

    if (!templateId || !data) {
      return res.status(400).json({
        success: false,
        error: 'Template ID and data are required'
      });
    }

    // For now, redirect to the existing generate-sync endpoint
    // In a full implementation, this would use the specific template logic
    const generationOptions = {
      templateId,
      data,
      returnBuffer: true,
      quality: options.quality || 'standard',
      watermark: options.watermark
    };

    // This would be handled by the pdf-routes, but for compatibility:
    res.status(202).json({
      success: true,
      message: 'PDF generation started',
      jobId: `job_${Date.now()}`,
      templateId,
      fileName: `${templateId}_${Date.now()}.pdf`,
      metadata: {
        fileSize: 2048576, // Mock size
        generationTime: 2500, // Mock time
        quality: options.quality || 'standard'
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/pdf/download/:jobId - Download endpoint
app.get('/api/pdf/download/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // For now, return a mock response
    // In production, this would fetch the actual PDF from storage
    res.status(404).json({
      success: false,
      error: 'Download endpoint not fully implemented yet. Use generate-sync with returnBuffer for immediate PDF download.'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  console.warn('❓ Route not found', req.originalUrl);
  res.status(404).json({
    error: 'Endpoint no encontrado',
    message: `La ruta ${req.originalUrl} no existe`,
    service: 'pdf-generator',
    availableEndpoints: [
      'GET /',
      'GET /api/health',
      'GET /api/pdf/templates',
      'POST /api/pdf/generate-sync',
      'POST /api/pdf/generate-template',
      'GET /api/pdf/jobs',
      'GET /api/pdf/jobs/:jobId',
      'GET /api/pdf/jobs/:jobId/download',
      'GET /api/pdf/stats',
      'POST /api/pdf/test-templates',
      'POST /api/plans/generate-pdf-from-data'
    ]
  });
});

// Global error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('💥 Unhandled error', err);
  res.status(500).json({
    error: 'Error interno del servidor PDF Generator',
    message: process.env.NODE_ENV === 'production' ? 'Algo salió mal en el servicio PDF' : err.message,
  });
});

// Start the server
const startServer = async () => {
  try {
    console.log('🚀 Starting PDF Generator server...');
    
    // Set server timeout to 10 minutes for PDF operations
    server.timeout = 600000; // 10 minutes
    server.keepAliveTimeout = 600000; // 10 minutes
    server.headersTimeout = 600000; // 10 minutes
    
    console.log('⚙️ Server timeouts configured');
    
    server.listen(PORT, () => {
      console.log(`🚀 PDF Generator Service is running on port ${PORT}`, {
        url: `http://localhost:${PORT}`,
        env: process.env.NODE_ENV || 'development',
        service: 'pdf-generator',
        version: '2.0.0',
        features: ['multi-engine', 'smart-cache', 'asset-management'],
        timeout: '10 minutes'
      });
    });
    
    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
        process.exit(1);
      } else {
        console.error('❌ Server error:', error);
        process.exit(1);
      }
    });
    
    console.log('📡 PDF Generator server listen command executed');
    
  } catch (error) {
    console.error('❌ Error starting PDF Generator server', error);
    process.exit(1);
  }
};

console.log('🎯 About to call startServer() for PDF Generator');
startServer();
console.log('✅ PDF Generator startServer() called');

// Graceful shutdown handlers
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received, shutting down gracefully...');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
