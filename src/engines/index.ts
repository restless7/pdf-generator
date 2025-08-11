import { TemplateEngine } from '../config/templates';
import { HandlebarsEngine } from './handlebars';
import { EjsEngine } from './ejs';
import { PugEngine } from './pug';

export interface TemplateEngineInterface {
  render(templatePath: string, data: any, options?: any): Promise<string>;
  renderPartials?(partialPaths: string[]): Promise<void>;
  cleanup?(): Promise<void>;
}

export class TemplateEngineFactory {
  private static engines: Map<TemplateEngine, TemplateEngineInterface> = new Map();

  static getEngine(engineType: TemplateEngine): TemplateEngineInterface {
    if (!this.engines.has(engineType)) {
      switch (engineType) {
        case 'handlebars':
          this.engines.set(engineType, new HandlebarsEngine());
          break;
        case 'ejs':
          this.engines.set(engineType, new EjsEngine());
          break;
        case 'pug':
          this.engines.set(engineType, new PugEngine());
          break;
        default:
          throw new Error(`Unsupported template engine: ${engineType}`);
      }
    }
    return this.engines.get(engineType)!;
  }

  static async cleanup(): Promise<void> {
    for (const engine of this.engines.values()) {
      if (engine.cleanup) {
        await engine.cleanup();
      }
    }
    this.engines.clear();
  }
}

export { HandlebarsEngine, EjsEngine, PugEngine };
