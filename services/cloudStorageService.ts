import { CloudFile, CloudProvider } from '../types';

/**
 * Open Mobile Hub (OMH) Style Unified Storage Client
 * Abstraction layer for Google Drive and OneDrive
 * Now with simulated real-world error conditions.
 */
export class UnifiedStorageClient {
  private currentProvider: CloudProvider = 'none';

  setProvider(provider: CloudProvider) {
    this.currentProvider = provider;
  }

  /**
   * Unified list function - works for any provider
   */
  async listFiles(folderId: string = 'root'): Promise<CloudFile[]> {
    console.debug(`[OMH] Fetching files from ${this.currentProvider} in folder ${folderId}`);
    
    // Simulating API latency
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Simulate random connectivity or permission errors (approx 15% failure rate)
    const random = Math.random();
    if (this.currentProvider !== 'none' && random < 0.15) {
      if (random < 0.05) {
        throw new Error('NETWORK_TIMEOUT: Core connection lost to cloud node.');
      } else if (random < 0.10) {
        throw new Error('AUTH_EXPIRED: Neural handshake failed. Please re-authenticate.');
      } else {
        throw new Error('PERMISSION_DENIED: Access restricted by cloud provider.');
      }
    }

    // Mock unified response data
    const mockFiles: Record<string, CloudFile[]> = {
      google: [
        { id: 'g1', name: 'Interstellar.2014.2160p.mkv', size: '64.1 GB', mimeType: 'video/x-matroska', provider: 'google' },
        { id: 'g2', name: 'Oppenheimer.HDR.mp4', size: '42.5 GB', mimeType: 'video/mp4', provider: 'google' },
        { id: 'g3', name: 'The.Last.of.Us.S01E01.mkv', size: '4.2 GB', mimeType: 'video/x-matroska', provider: 'google' }
      ],
      microsoft: [
        { id: 'm1', name: 'Succession.S04E10.4K.mkv', size: '8.2 GB', mimeType: 'video/x-matroska', provider: 'microsoft' },
        { id: 'm2', name: 'The.Bear.S02E03.HDR.mp4', size: '2.4 GB', mimeType: 'video/mp4', provider: 'microsoft' },
        { id: 'm3', name: 'Blade.Runner.2049.2160p.mkv', size: '55.2 GB', mimeType: 'video/x-matroska', provider: 'microsoft' }
      ],
      none: []
    };

    return mockFiles[this.currentProvider] || [];
  }

  /**
   * Unified search function
   */
  async searchFiles(query: string): Promise<CloudFile[]> {
    try {
      const allFiles = await this.listFiles();
      const filtered = allFiles.filter(f => f.name.toLowerCase().includes(query.toLowerCase()));
      if (filtered.length === 0 && query.length > 0) {
        throw new Error('NOT_FOUND: No neural matches for current query.');
      }
      return filtered;
    } catch (e) {
      throw e;
    }
  }

  /**
   * Unified stream generator
   */
  async getStreamUri(fileId: string): Promise<string> {
    // In a real app, this would return a pre-signed URL or OAuth-authorized stream link
    return `https://storage.provider.com/stream/${this.currentProvider}/${fileId}?token=authorized`;
  }
}

export const storageClient = new UnifiedStorageClient();