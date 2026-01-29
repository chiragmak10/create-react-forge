import type { ProjectConfig } from '../config/schema.js';
import type { PluginContext, ReactSetupPlugin } from './types.js';

export class PluginManager {
  private plugins: ReactSetupPlugin[] = [];

  register(plugin: ReactSetupPlugin) {
    this.plugins.push(plugin);
  }

  async runHook(
    hookName: Exclude<keyof NonNullable<ReactSetupPlugin['hooks']>, 'beforeCreate'>,
    context: PluginContext
  ): Promise<void> {
    for (const plugin of this.plugins) {
      const hook = plugin.hooks?.[hookName];
      if (hook) {
        try {
          await hook(context);
        } catch (error) {
          console.warn(`Plugin ${plugin.name} failed at hook ${hookName}:`, error);
        }
      }
    }
  }

  async runBeforeCreate(config: ProjectConfig): Promise<ProjectConfig> {
    let currentConfig = { ...config };
    for (const plugin of this.plugins) {
      if (plugin.hooks?.beforeCreate) {
        try {
          const result = await plugin.hooks.beforeCreate(currentConfig);
          if (result) {
            currentConfig = result;
          }
        } catch (error) {
           console.warn(`Plugin ${plugin.name} failed at hook beforeCreate:`, error);
        }
      }
    }
    return currentConfig;
  }
}

