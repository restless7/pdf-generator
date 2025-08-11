import { z } from 'zod';

export class ValidationService {
  async validateData(data: any, schema: z.ZodSchema<any>): Promise<any> {
    try {
      const validatedData = await schema.parseAsync(data);
      return validatedData;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = this.formatZodErrors(error);
        throw new Error(`Data validation failed: ${formattedErrors}`);
      }
      throw error;
    }
  }

  private formatZodErrors(error: z.ZodError): string {
    return error.issues
      .map((err: any) => {
        const path = err.path.length > 0 ? err.path.join('.') : 'root';
        return `${path}: ${err.message}`;
      })
      .join(', ');
  }

  validateTemplateOptions(options: any): boolean {
    // Basic validation for template options
    const requiredFields = ['templateId', 'data'];
    
    for (const field of requiredFields) {
      if (!options[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate format if provided
    if (options.format && !['A4', 'Letter'].includes(options.format)) {
      throw new Error(`Invalid format: ${options.format}. Must be 'A4' or 'Letter'`);
    }

    // Validate quality if provided
    if (options.quality && !['draft', 'standard', 'high'].includes(options.quality)) {
      throw new Error(`Invalid quality: ${options.quality}. Must be 'draft', 'standard', or 'high'`);
    }

    // Validate margins if provided
    if (options.margins) {
      const validMarginUnits = ['px', 'cm', 'mm', 'in'];
      for (const [key, value] of Object.entries(options.margins)) {
        if (typeof value === 'string') {
          const hasValidUnit = validMarginUnits.some(unit => (value as string).endsWith(unit));
          if (!hasValidUnit) {
            throw new Error(`Invalid margin unit for ${key}: ${value}. Must end with px, cm, mm, or in`);
          }
        }
      }
    }

    return true;
  }
}
