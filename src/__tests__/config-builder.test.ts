import { describe, expect, it } from 'vitest';
import { ConfigBuilder, mergeConfigs } from '../config/builder';
import { DEFAULT_CONFIG } from '../config/schema';

describe('ConfigBuilder', () => {
  it('should create a config with default values', () => {
    const builder = new ConfigBuilder();
    const config = builder.build();

    expect(config.name).toBe(DEFAULT_CONFIG.name);
    expect(config.runtime).toBe('vite');
    expect(config.language).toBe('typescript');
  });

  it('should set config properties using fluent API', () => {
    const config = new ConfigBuilder()
      .setName('test-app')
      .setRuntime('nextjs')
      .setLanguage('javascript')
      .build();

    expect(config.name).toBe('test-app');
    expect(config.runtime).toBe('nextjs');
    expect(config.language).toBe('javascript');
  });

  it('should validate config before building', () => {
    const builder = new ConfigBuilder();
    builder.setName('invalid project'); // Invalid: has space

    const result = builder.validate();
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
  });

  it('should merge configurations correctly', () => {
    const config1 = { name: 'app1', runtime: 'vite' as const };
    const config2 = { language: 'javascript' as const };

    const merged = mergeConfigs(config1, config2);
    expect(merged.name).toBe('app1');
    expect(merged.runtime).toBe('vite');
    expect(merged.language).toBe('javascript');
  });

  it('should reject invalid project names', () => {
    const validation = new ConfigBuilder().setName('Invalid Name With Spaces').validate();

    expect(validation.success).toBe(false);
  });

  it('should accept valid project names', () => {
    const validation = new ConfigBuilder().setName('my-awesome-app-2024').validate();

    expect(validation.success).toBe(true);
  });
});
