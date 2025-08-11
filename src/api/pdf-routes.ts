import { Router, Request, Response } from 'express';
import { EnhancedPDFGenerator, GenerationOptions } from '../services/pdf-generator';
import { ValidationService } from '../services/validation-service';
import { TEMPLATE_REGISTRY } from '../config/templates';
import * as path from 'path';

const router = Router();
const validationService = new ValidationService();

// Initialize PDF generator
const pdfGenerator = new EnhancedPDFGenerator(
  path.join(__dirname, '../../output'),
  path.join(__dirname, '../../cache'),
  path.join(__dirname, '../../temp')
);

// Initialize the generator
pdfGenerator.initialize().catch(console.error);

/**
 * POST /api/pdf/generate
 * Generate a PDF from template and data
 */
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const options: GenerationOptions = req.body;

    // Validate basic options
    validationService.validateTemplateOptions(options);

    // Generate PDF
    const job = await pdfGenerator.generatePDF(options);

    res.status(202).json({
      success: true,
      jobId: job.id,
      status: job.status,
      message: 'PDF generation started',
      estimatedTime: '30-60 seconds'
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/pdf/generate-sync
 * Generate a PDF synchronously (wait for completion)
 */
router.post('/generate-sync', async (req: Request, res: Response) => {
  try {
    const options: GenerationOptions = req.body;

    // Validate basic options
    validationService.validateTemplateOptions(options);

    // Generate PDF
    const job = await pdfGenerator.generatePDF(options);

    // Poll for completion
    const maxWaitTime = 120000; // 2 minutes
    const pollInterval = 1000; // 1 second
    let elapsedTime = 0;

    while (job.status !== 'completed' && job.status !== 'failed' && elapsedTime < maxWaitTime) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      elapsedTime += pollInterval;
      
      const updatedJob = await pdfGenerator.getJob(job.id);
      if (updatedJob) {
        Object.assign(job, updatedJob);
      }
    }

    if (job.status === 'completed') {
      if (options.returnBuffer && job.result?.pdfBuffer) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${job.id}.pdf"`);
        res.send(job.result.pdfBuffer);
      } else {
        res.json({
          success: true,
          jobId: job.id,
          status: job.status,
          result: {
            pdfPath: job.result?.pdfPath,
            metadata: job.result?.metadata
          }
        });
      }
    } else if (job.status === 'failed') {
      res.status(500).json({
        success: false,
        jobId: job.id,
        error: job.error || 'PDF generation failed'
      });
    } else {
      res.status(408).json({
        success: false,
        jobId: job.id,
        error: 'PDF generation timeout'
      });
    }

  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/pdf/jobs/:jobId
 * Get job status and result
 */
router.get('/jobs/:jobId', async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const job = await pdfGenerator.getJob(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    const response: any = {
      success: true,
      jobId: job.id,
      status: job.status,
      progress: job.progress,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt
    };

    if (job.status === 'completed' && job.result) {
      response.result = {
        pdfPath: job.result.pdfPath,
        metadata: job.result.metadata
      };
    }

    if (job.status === 'failed') {
      response.error = job.error;
    }

    res.json(response);

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/pdf/jobs/:jobId/download
 * Download the generated PDF
 */
router.get('/jobs/:jobId/download', async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const job = await pdfGenerator.getJob(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    if (job.status !== 'completed' || !job.result?.pdfPath) {
      return res.status(400).json({
        success: false,
        error: 'PDF not ready for download'
      });
    }

    const filename = `${job.templateId}_${jobId}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.sendFile(path.resolve(job.result.pdfPath));

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/pdf/jobs
 * List all jobs (with optional status filter)
 */
router.get('/jobs', async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const jobs = await pdfGenerator.listJobs(status as any);

    const jobsSummary = jobs.map(job => ({
      id: job.id,
      templateId: job.templateId,
      status: job.status,
      progress: job.progress,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      hasResult: !!job.result
    }));

    res.json({
      success: true,
      jobs: jobsSummary,
      total: jobs.length
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * DELETE /api/pdf/jobs/:jobId
 * Cancel a job
 */
router.delete('/jobs/:jobId', async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const cancelled = await pdfGenerator.cancelJob(jobId);

    if (cancelled) {
      res.json({
        success: true,
        message: 'Job cancelled successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Job cannot be cancelled (not found or already completed)'
      });
    }

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/pdf/templates
 * List available templates
 */
router.get('/templates', (req: Request, res: Response) => {
  try {
    const templates = Object.values(TEMPLATE_REGISTRY).map(template => ({
      id: template.id,
      name: template.name,
      description: template.description,
      version: template.version,
      engine: template.engine,
      category: template.category,
      localization: template.localization
    }));

    res.json({
      success: true,
      templates
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/pdf/templates/:templateId/schema
 * Get template schema for validation
 */
router.get('/templates/:templateId/schema', (req: Request, res: Response) => {
  try {
    const { templateId } = req.params;
    const template = TEMPLATE_REGISTRY[templateId];

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }

    // Convert Zod schema to JSON schema (simplified)
    res.json({
      success: true,
      templateId,
      schema: {
        type: 'object',
        description: `Schema for ${template.name}`,
        // This would need a proper Zod to JSON Schema converter
        // For now, return the template info
        template: {
          id: template.id,
          name: template.name,
          description: template.description,
          requiredFields: ['businessName', 'businessType', 'location', 'targetAudience', 'sections']
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/plans/generate-pdf-from-data
 * Legacy endpoint for business plan generator compatibility
 */
router.post('/plans/generate-pdf-from-data', async (req: Request, res: Response) => {
  try {
    // Transform legacy request to new format
    const legacyData = req.body;
    
    const options: GenerationOptions = {
      templateId: 'business-plan',
      data: legacyData,
      returnBuffer: true,
      quality: 'standard'
    };

    // Generate PDF synchronously for compatibility
    const job = await pdfGenerator.generatePDF(options);

    // Wait for completion
    const maxWaitTime = 120000;
    const pollInterval = 1000;
    let elapsedTime = 0;

    while (job.status !== 'completed' && job.status !== 'failed' && elapsedTime < maxWaitTime) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      elapsedTime += pollInterval;
      
      const updatedJob = await pdfGenerator.getJob(job.id);
      if (updatedJob) {
        Object.assign(job, updatedJob);
      }
    }

    if (job.status === 'completed' && job.result?.pdfBuffer) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${legacyData.businessName || 'business-plan'}.pdf"`);
      res.send(job.result.pdfBuffer);
    } else {
      throw new Error(job.error || 'PDF generation failed');
    }

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
