import { promises as fs } from 'fs';
import * as path from 'path';
import { AssetConfig } from '../config/templates';

export class AssetManager {
  private assetRegistry: Record<string, AssetConfig[]>;
  private loadedAssets: Map<string, any> = new Map();
  private readonly assetBaseDir: string;

  constructor(
    assetRegistry: Record<string, AssetConfig[]>,
    assetBaseDir: string = './assets'
  ) {
    this.assetRegistry = assetRegistry;
    this.assetBaseDir = assetBaseDir;
  }

  async initialize(): Promise<void> {
    // Ensure asset directory exists
    await fs.mkdir(this.assetBaseDir, { recursive: true });
    
    // Pre-load commonly used assets
    await this.preloadAssets();
  }

  async loadAssets(assetGroups: string[]): Promise<void> {
    for (const group of assetGroups) {
      if (this.assetRegistry[group]) {
        for (const asset of this.assetRegistry[group]) {
          await this.loadAsset(asset);
        }
      }
    }
  }

  async loadAsset(asset: AssetConfig): Promise<void> {
    const assetKey = `${asset.type}_${asset.name}`;
    
    // Skip if already loaded
    if (this.loadedAssets.has(assetKey)) {
      return;
    }

    try {
      switch (asset.type) {
        case 'logo':
        case 'image':
          await this.loadImageAsset(asset);
          break;
        case 'font':
          await this.loadFontAsset(asset);
          break;
        case 'stylesheet':
          await this.loadStylesheetAsset(asset);
          break;
        default:
          console.warn(`Unknown asset type: ${asset.type}`);
      }
    } catch (error) {
      console.error(`Failed to load asset ${asset.name}:`, error);
    }
  }

  private async loadImageAsset(asset: AssetConfig): Promise<void> {
    const assetKey = `${asset.type}_${asset.name}`;
    const assetData: any = {
      type: asset.type,
      name: asset.name,
      metadata: asset.metadata
    };

    // Load main image
    const mainPath = path.resolve(this.assetBaseDir, asset.path);
    try {
      const stats = await fs.stat(mainPath);
      assetData.main = {
        path: mainPath,
        relativePath: asset.path,
        size: stats.size,
        exists: true
      };
    } catch (error) {
      assetData.main = {
        path: mainPath,
        relativePath: asset.path,
        exists: false
      };
    }

    // Load variants if available
    if (asset.variants) {
      assetData.variants = {};
      for (const [variant, variantPath] of Object.entries(asset.variants)) {
        const fullPath = path.resolve(this.assetBaseDir, variantPath);
        try {
          const stats = await fs.stat(fullPath);
          assetData.variants[variant] = {
            path: fullPath,
            relativePath: variantPath,
            size: stats.size,
            exists: true
          };
        } catch (error) {
          assetData.variants[variant] = {
            path: fullPath,
            relativePath: variantPath,
            exists: false
          };
        }
      }
    }

    // Load different formats if specified
    if (asset.formats) {
      assetData.formats = {};
      for (const format of asset.formats) {
        const formatPath = `${asset.path}.${format}`;
        const fullPath = path.resolve(this.assetBaseDir, formatPath);
        try {
          const stats = await fs.stat(fullPath);
          assetData.formats[format] = {
            path: fullPath,
            relativePath: formatPath,
            size: stats.size,
            exists: true
          };
        } catch (error) {
          assetData.formats[format] = {
            path: fullPath,
            relativePath: formatPath,
            exists: false
          };
        }
      }
    }

    this.loadedAssets.set(assetKey, assetData);
  }

  private async loadFontAsset(asset: AssetConfig): Promise<void> {
    const assetKey = `${asset.type}_${asset.name}`;
    const assetData: any = {
      type: asset.type,
      name: asset.name,
      formats: {}
    };

    // Load different font formats
    if (asset.formats) {
      for (const format of asset.formats) {
        const fontPath = `${asset.path}.${format}`;
        const fullPath = path.resolve(this.assetBaseDir, fontPath);
        try {
          const stats = await fs.stat(fullPath);
          assetData.formats[format] = {
            path: fullPath,
            relativePath: fontPath,
            size: stats.size,
            exists: true
          };
        } catch (error) {
          assetData.formats[format] = {
            path: fullPath,
            relativePath: fontPath,
            exists: false
          };
        }
      }
    } else {
      // Try to load the main font file
      const fullPath = path.resolve(this.assetBaseDir, asset.path);
      try {
        const stats = await fs.stat(fullPath);
        assetData.main = {
          path: fullPath,
          relativePath: asset.path,
          size: stats.size,
          exists: true
        };
      } catch (error) {
        assetData.main = {
          path: fullPath,
          relativePath: asset.path,
          exists: false
        };
      }
    }

    this.loadedAssets.set(assetKey, assetData);
  }

  private async loadStylesheetAsset(asset: AssetConfig): Promise<void> {
    const assetKey = `${asset.type}_${asset.name}`;
    const fullPath = path.resolve(this.assetBaseDir, asset.path);
    
    try {
      const content = await fs.readFile(fullPath, 'utf-8');
      const stats = await fs.stat(fullPath);
      
      const assetData = {
        type: asset.type,
        name: asset.name,
        path: fullPath,
        relativePath: asset.path,
        content: content,
        size: stats.size,
        exists: true
      };
      
      this.loadedAssets.set(assetKey, assetData);
    } catch (error) {
      const assetData = {
        type: asset.type,
        name: asset.name,
        path: fullPath,
        relativePath: asset.path,
        exists: false
      };
      
      this.loadedAssets.set(assetKey, assetData);
    }
  }

  getAsset(type: string, name: string): any | null {
    const assetKey = `${type}_${name}`;
    return this.loadedAssets.get(assetKey) || null;
  }

  getAssetPaths(assetGroups: string[]): Record<string, any> {
    const paths: Record<string, any> = {};
    
    for (const group of assetGroups) {
      if (this.assetRegistry[group]) {
        paths[group] = {};
        for (const asset of this.assetRegistry[group]) {
          const loadedAsset = this.getAsset(asset.type, asset.name);
          if (loadedAsset) {
            paths[group][asset.name] = this.getAssetUrls(loadedAsset);
          }
        }
      }
    }
    
    return paths;
  }

  private getAssetUrls(assetData: any): any {
    const urls: any = {};
    
    if (assetData.main && assetData.main.exists) {
      urls.main = `file://${assetData.main.path}`;
    }
    
    if (assetData.variants) {
      urls.variants = {};
      for (const [variant, variantData] of Object.entries(assetData.variants as any)) {
        if (variantData && (variantData as any).exists) {
          urls.variants[variant] = `file://${(variantData as any).path}`;
        }
      }
    }
    
    if (assetData.formats) {
      urls.formats = {};
      for (const [format, formatData] of Object.entries(assetData.formats as any)) {
        if (formatData && (formatData as any).exists) {
          urls.formats[format] = `file://${(formatData as any).path}`;
        }
      }
    }
    
    return urls;
  }

  async preloadAssets(): Promise<void> {
    // Pre-load commonly used assets like logos
    if (this.assetRegistry.logos) {
      for (const logo of this.assetRegistry.logos) {
        await this.loadAsset(logo);
      }
    }
    
    if (this.assetRegistry.fonts) {
      for (const font of this.assetRegistry.fonts) {
        await this.loadAsset(font);
      }
    }
  }

  getLoadedAssetStats(): {
    totalAssets: number;
    assetsByType: Record<string, number>;
    totalSize: number;
    missingAssets: number;
  } {
    let totalSize = 0;
    let missingAssets = 0;
    const assetsByType: Record<string, number> = {};
    
    for (const assetData of this.loadedAssets.values()) {
      // Count by type
      if (!assetsByType[assetData.type]) {
        assetsByType[assetData.type] = 0;
      }
      assetsByType[assetData.type]++;
      
      // Calculate total size and count missing assets
      if (assetData.main) {
        if (assetData.main.exists) {
          totalSize += assetData.main.size || 0;
        } else {
          missingAssets++;
        }
      }
      
      if (assetData.variants) {
        for (const variantData of Object.values(assetData.variants as any)) {
          if ((variantData as any).exists) {
            totalSize += (variantData as any).size || 0;
          } else {
            missingAssets++;
          }
        }
      }
      
      if (assetData.formats) {
        for (const formatData of Object.values(assetData.formats as any)) {
          if ((formatData as any).exists) {
            totalSize += (formatData as any).size || 0;
          } else {
            missingAssets++;
          }
        }
      }
    }
    
    return {
      totalAssets: this.loadedAssets.size,
      assetsByType,
      totalSize,
      missingAssets
    };
  }

  async cleanup(): Promise<void> {
    this.loadedAssets.clear();
  }
}
