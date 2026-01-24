import { resolve } from 'path';
import { pathToFileURL } from 'url';
import type { ReactSetupPlugin } from './types.js';

export class PluginLoader {
  async loadPlugin(path: string): Promise<ReactSetupPlugin> {
    try {
      // dynamic import requires file URL
      const pluginUrl = pathToFileURL(resolve(path)).href;
      const module = await import(pluginUrl);
      return module.default || module;
    } catch (error) {
      throw new Error(`Failed to load plugin at ${path}: ${error}`);
    }
  }
}

