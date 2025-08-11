import { promises as fs } from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export interface CacheEntry {
  key: string;
  data: any;
  timestamp: number;
  expiresAt: number;
  size: number;
  metadata?: {
    templateId: string;
    version: string;
    generatedAt: Date;
  };
}

export class CacheManager {
  private readonly cacheDir: string;
  private readonly maxSize: number; // Maximum cache size in bytes
  private readonly defaultTTL: number; // Time to live in milliseconds
  private cacheIndex: Map<string, CacheEntry> = new Map();

  constructor(
    cacheDir: string = './cache',
    maxSize: number = 100 * 1024 * 1024, // 100MB
    defaultTTL: number = 24 * 60 * 60 * 1000 // 24 hours
  ) {
    this.cacheDir = cacheDir;
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
  }

  async initialize(): Promise<void> {
    // Create cache directory
    await fs.mkdir(this.cacheDir, { recursive: true });
    
    // Load existing cache index
    await this.loadCacheIndex();
    
    // Clean up expired entries
    await this.cleanupExpired();
  }

  generateCacheKey(templateId: string, data: any, options: any): string {
    // Create a deterministic hash from template ID, data, and options
    const payload = {
      templateId,
      data: this.sortObjectKeys(data),
      options: this.sortObjectKeys(options)
    };
    
    const hash = crypto
      .createHash('sha256')
      .update(JSON.stringify(payload))
      .digest('hex');
    
    return `${templateId}_${hash.substring(0, 16)}`;
  }

  async get(key: string): Promise<any | null> {
    const entry = this.cacheIndex.get(key);
    
    if (!entry) {
      return null;
    }
    
    // Check if expired
    if (Date.now() > entry.expiresAt) {
      await this.delete(key);
      return null;
    }
    
    try {
      // Load data from file
      const filePath = this.getCacheFilePath(key);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(fileContent);
    } catch (error) {
      // File might be corrupted or missing, remove from index
      await this.delete(key);
      return null;
    }
  }

  async set(
    key: string,
    data: any,
    ttl: number = this.defaultTTL,
    metadata?: any
  ): Promise<void> {
    const serializedData = JSON.stringify(data);
    const size = Buffer.byteLength(serializedData, 'utf-8');
    
    // Check if we need to make space
    await this.ensureSpace(size);
    
    // Create cache entry
    const entry: CacheEntry = {
      key,
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
      size,
      metadata
    };
    
    // Write to file
    const filePath = this.getCacheFilePath(key);
    await fs.writeFile(filePath, serializedData, 'utf-8');
    
    // Update index
    this.cacheIndex.set(key, entry);
    
    // Save index
    await this.saveCacheIndex();
  }

  async delete(key: string): Promise<boolean> {
    const entry = this.cacheIndex.get(key);
    
    if (!entry) {
      return false;
    }
    
    try {
      // Delete file
      const filePath = this.getCacheFilePath(key);
      await fs.unlink(filePath);
    } catch (error) {
      // File might not exist, continue anyway
    }
    
    // Remove from index
    this.cacheIndex.delete(key);
    
    // Save index
    await this.saveCacheIndex();
    
    return true;
  }

  async clear(): Promise<void> {
    // Delete all cache files
    for (const key of this.cacheIndex.keys()) {
      try {
        const filePath = this.getCacheFilePath(key);
        await fs.unlink(filePath);
      } catch (error) {
        // Ignore errors for individual files
      }
    }
    
    // Clear index
    this.cacheIndex.clear();
    
    // Save empty index
    await this.saveCacheIndex();
  }

  async getStats(): Promise<{
    totalEntries: number;
    totalSize: number;
    hitRate: number;
    oldestEntry: Date | null;
    newestEntry: Date | null;
  }> {
    let totalSize = 0;
    let oldest: number | null = null;
    let newest: number | null = null;
    
    for (const entry of this.cacheIndex.values()) {
      totalSize += entry.size;
      
      if (oldest === null || entry.timestamp < oldest) {
        oldest = entry.timestamp;
      }
      
      if (newest === null || entry.timestamp > newest) {
        newest = entry.timestamp;
      }
    }
    
    return {
      totalEntries: this.cacheIndex.size,
      totalSize,
      hitRate: 0, // Would need to track hits/misses for accurate calculation
      oldestEntry: oldest ? new Date(oldest) : null,
      newestEntry: newest ? new Date(newest) : null
    };
  }

  async cleanup(): Promise<void> {
    await this.cleanupExpired();
  }

  private async loadCacheIndex(): Promise<void> {
    const indexPath = path.join(this.cacheDir, 'index.json');
    
    try {
      const indexContent = await fs.readFile(indexPath, 'utf-8');
      const indexData = JSON.parse(indexContent);
      
      // Convert plain objects back to Map
      for (const [key, entry] of Object.entries(indexData)) {
        this.cacheIndex.set(key, entry as CacheEntry);
      }
    } catch (error) {
      // Index file doesn't exist or is corrupted, start fresh
      this.cacheIndex.clear();
    }
  }

  private async saveCacheIndex(): Promise<void> {
    const indexPath = path.join(this.cacheDir, 'index.json');
    
    // Convert Map to plain object for JSON serialization
    const indexData = Object.fromEntries(this.cacheIndex.entries());
    
    await fs.writeFile(indexPath, JSON.stringify(indexData, null, 2), 'utf-8');
  }

  private async cleanupExpired(): Promise<void> {
    const now = Date.now();
    const expiredKeys: string[] = [];
    
    for (const [key, entry] of this.cacheIndex.entries()) {
      if (now > entry.expiresAt) {
        expiredKeys.push(key);
      }
    }
    
    for (const key of expiredKeys) {
      await this.delete(key);
    }
  }

  private async ensureSpace(newEntrySize: number): Promise<void> {
    let currentSize = 0;
    
    // Calculate current total size
    for (const entry of this.cacheIndex.values()) {
      currentSize += entry.size;
    }
    
    // If adding new entry would exceed max size, remove oldest entries
    while (currentSize + newEntrySize > this.maxSize && this.cacheIndex.size > 0) {
      // Find oldest entry
      let oldestKey: string | null = null;
      let oldestTimestamp = Number.MAX_SAFE_INTEGER;
      
      for (const [key, entry] of this.cacheIndex.entries()) {
        if (entry.timestamp < oldestTimestamp) {
          oldestTimestamp = entry.timestamp;
          oldestKey = key;
        }
      }
      
      if (oldestKey) {
        const removedEntry = this.cacheIndex.get(oldestKey);
        await this.delete(oldestKey);
        
        if (removedEntry) {
          currentSize -= removedEntry.size;
        }
      }
    }
  }

  private getCacheFilePath(key: string): string {
    return path.join(this.cacheDir, `${key}.json`);
  }

  private sortObjectKeys(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.sortObjectKeys(item));
    }
    
    const sortedKeys = Object.keys(obj).sort();
    const sortedObj: any = {};
    
    for (const key of sortedKeys) {
      sortedObj[key] = this.sortObjectKeys(obj[key]);
    }
    
    return sortedObj;
  }
}
