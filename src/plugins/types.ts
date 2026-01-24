import type { ProjectAssembler } from '../assembler/index.js';
import type { ProjectConfig } from '../config/schema.js';

export interface PluginContext {
  config: ProjectConfig;
  assembler?: ProjectAssembler;
}

export interface ReactSetupPlugin {
  name: string;
  version: string;
  hooks?: {
    beforeCreate?: (config: ProjectConfig) => Promise<ProjectConfig | void>;
    afterTemplateApply?: (context: PluginContext) => Promise<void>;
    beforeInstall?: (context: PluginContext) => Promise<void>;
    afterInstall?: (context: PluginContext) => Promise<void>;
  };
}

