// Export main classes and interfaces
export { EnhancedPDFGenerator, GenerationOptions } from './services/pdf-generator';
export { CacheManager } from './services/cache-manager';
export { AssetManager } from './services/asset-manager';
export { ValidationService } from './services/validation-service';

// Export template engine system
export { TemplateEngineFactory, TemplateEngineInterface } from './engines';
export { HandlebarsEngine } from './engines/handlebars';
export { EjsEngine } from './engines/ejs';
export { PugEngine } from './engines/pug';

// Export configuration and types
export {
  TemplateConfig,
  TemplateEngine,
  AssetConfig,
  GenerationJob,
  JobStatus,
  TEMPLATE_REGISTRY,
  ASSET_REGISTRY,
  BusinessPlanSchema,
  ProposalSchema
} from './config/templates';

// Export API routes
export { default as pdfRoutes } from './api/pdf-routes';

// Export legacy classes for backward compatibility (if they exist)
// export { PDFGenerator, PDFOptions, DocumentData } from './generators/PDFGenerator';
// export { BusinessPlanGenerator, BusinessPlanData } from './generators/BusinessPlanGenerator';

// Version
export const version = '2.0.0';

// Default export for convenience
import { EnhancedPDFGenerator } from './services/pdf-generator';
export default EnhancedPDFGenerator;
