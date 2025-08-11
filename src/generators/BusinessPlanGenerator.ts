import { PDFGenerator, DocumentData, PDFOptions } from './PDFGenerator';
import { logger } from '../utils/logger';

export interface BusinessPlanData extends DocumentData {
  businessName: string;
  businessType: string;
  location: string;
  targetAudience: string;
  businessDescription?: string;
  sections: Array<{
    title: string;
    content: string;
    highlights?: string;
  }>;
  generationDate: string;
}

export class BusinessPlanGenerator extends PDFGenerator {
  async generateBusinessPlanPDF(
    data: BusinessPlanData, 
    options: PDFOptions = {}
  ): Promise<Buffer> {
    const startTime = Date.now();
    
    try {
      logger.info('Generating business plan PDF', {
        businessName: data.businessName,
        sectionsCount: data.sections.length
      });

      // Apply business plan specific formatting to content
      const formattedData = this.formatBusinessPlanData(data);
      
      const pdfBuffer = await this.generatePDF('business-plan', formattedData, options);
      
      const duration = Date.now() - startTime;
      logger.logPDFGeneration(
        `${data.businessName}_Business_Plan.pdf`,
        pdfBuffer.length,
        duration
      );

      return pdfBuffer;

    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Failed to generate business plan PDF', error);
      throw error;
    }
  }

  private formatBusinessPlanData(data: BusinessPlanData): BusinessPlanData {
    return {
      ...data,
      sections: data.sections.map(section => ({
        ...section,
        content: this.formatContent(section.content)
      }))
    };
  }

  private formatContent(content: string): string {
    if (!content) return '';

    // Escape HTML for security
    const escapeHtml = (text: string) => {
      const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      };
      return text.replace(/[&<>"']/g, (m) => map[m]);
    };
    
    let formattedHtml = content
      .split('\n')
      .map(line => {
        line = line.trim();
        if (!line) return '<div class="spacer"></div>';
        
        // SISTEMA COMPLETO DE MARKDOWN
        
        // Títulos H1: # Título
        if (line.startsWith('# ')) {
          return `<h1 class="content-h1">${escapeHtml(line.slice(2).trim())}</h1>`;
        }
        
        // Títulos H2: ## Subtítulo
        if (line.startsWith('## ')) {
          return `<h2 class="content-h2">${escapeHtml(line.slice(3).trim())}</h2>`;
        }
        
        // Títulos H3: ### Subtítulo nivel 3
        if (line.startsWith('### ')) {
          return `<h3 class="content-h3">${escapeHtml(line.slice(4).trim())}</h3>`;
        }
        
        // Títulos principales con **texto** (mantener compatibilidad)
        if (line.startsWith('**') && line.endsWith('**')) {
          return `<h3 class="section-subtitle">${escapeHtml(line.slice(2, -2))}</h3>`;
        }
        
        // Elementos de lista - procesar formato antes del escape
        if (line.startsWith('*') || line.startsWith('-')) {
          let listContent = line.slice(1).trim();
          
          // Aplicar negrilla **texto**
          listContent = listContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          
          // Aplicar cursiva *texto*
          listContent = listContent.replace(/\*([^*]+?)\*/g, '<em>$1</em>');
          
          // Escapar HTML pero preservar las etiquetas de formato
          listContent = escapeHtml(listContent)
            .replace(/&lt;strong&gt;(.*?)&lt;\/strong&gt;/g, '<strong>$1</strong>')
            .replace(/&lt;em&gt;(.*?)&lt;\/em&gt;/g, '<em>$1</em>');
          
          return `<li class="list-item">${listContent}</li>`;
        }
        
        // Párrafos con contenido especial
        let paragraph = line;
        
        // APLICAR FORMATO MARKDOWN COMPLETO
        // Negrilla **texto**
        paragraph = paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // NUEVO: Manejar formato inconsistente de Gemini: texto: * (texto seguido de dos puntos y un asterisco)
        paragraph = paragraph.replace(/([^*\n]+):\s*\*/g, '<strong>$1:</strong>');
        
        // Cursiva *texto* (solo si no está dentro de strong y no termina en ":")
        paragraph = paragraph.replace(/(?!<strong>.*?)\*([^*:]+?)\*(?!.*?<\/strong>)/g, '<em>$1</em>');
        
        // Escapar HTML pero preservar las etiquetas de formato
        paragraph = escapeHtml(paragraph)
          .replace(/&lt;strong&gt;(.*?)&lt;\/strong&gt;/g, '<strong>$1</strong>')
          .replace(/&lt;em&gt;(.*?)&lt;\/em&gt;/g, '<em>$1</em>');
        
        // Destacar cifras importantes (números con €, %, años)
        paragraph = paragraph.replace(/(\d+[,.]?\d*\s*[€%])/g, '<span class="highlight-number">$1</span>');
        paragraph = paragraph.replace(/(\d{4})/g, '<span class="highlight-year">$1</span>');
        
        // Destacar palabras clave importantes
        paragraph = paragraph.replace(/\b(estrategia|objetivo|meta|crecimiento|inversión|rentabilidad|competencia|mercado|innovación)\b/gi, '<span class="highlight-keyword">$1</span>');
        
        return `<p class="content-paragraph">${paragraph}</p>`;
      })
      .join('');
    
    // Agrupar elementos de lista
    formattedHtml = formattedHtml.replace(/((<li[^>]*>.*?<\/li>\s*)+)/g, '<ul class="styled-list">$1</ul>');
    
    return formattedHtml;
  }
}
