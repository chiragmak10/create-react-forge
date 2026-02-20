import { mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { describe, expect, it } from 'vitest';
import { PluginLoader } from '../plugins';

describe('PluginLoader', () => {
  it('should load plugin default export', async () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'forge-plugin-default-'));
    const pluginPath = join(tempDir, 'default-plugin.mjs');

    writeFileSync(
      pluginPath,
      `export default { name: 'default-plugin', version: '1.0.0', hooks: {} };`,
      'utf-8'
    );

    const loader = new PluginLoader();
    const plugin = await loader.loadPlugin(pluginPath);

    expect(plugin.name).toBe('default-plugin');
    expect(plugin.version).toBe('1.0.0');

    rmSync(tempDir, { recursive: true, force: true });
  });

  it('should load plugin named exports when default is missing', async () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'forge-plugin-named-'));
    const pluginPath = join(tempDir, 'named-plugin.mjs');

    writeFileSync(pluginPath, `export const name = 'named-plugin'; export const version = '2.0.0';`, 'utf-8');

    const loader = new PluginLoader();
    const plugin = await loader.loadPlugin(pluginPath);

    expect(plugin.name).toBe('named-plugin');
    expect(plugin.version).toBe('2.0.0');

    rmSync(tempDir, { recursive: true, force: true });
  });

  it('should throw a friendly error when plugin cannot be loaded', async () => {
    const loader = new PluginLoader();

    await expect(loader.loadPlugin('/tmp/does-not-exist-plugin.mjs')).rejects.toThrow(
      'Failed to load plugin at /tmp/does-not-exist-plugin.mjs:'
    );
  });
});
