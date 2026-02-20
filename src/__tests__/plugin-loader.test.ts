import { mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { describe, expect, it } from 'vitest';
import { PluginLoader } from '../plugins/loader';

describe('PluginLoader', () => {
  it('should load plugin with default export', async () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'forge-plugin-default-'));
    const pluginPath = join(tempDir, 'plugin.mjs');
    writeFileSync(pluginPath, `export default { name: 'plugin-a', version: '1.0.0' };`, 'utf-8');

    const loader = new PluginLoader();
    const plugin = await loader.loadPlugin(pluginPath);

    expect(plugin.name).toBe('plugin-a');
    expect(plugin.version).toBe('1.0.0');

    rmSync(tempDir, { recursive: true, force: true });
  });

  it('should fallback to module object when default export is absent', async () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'forge-plugin-named-'));
    const pluginPath = join(tempDir, 'plugin.mjs');
    writeFileSync(pluginPath, `export const name = 'plugin-b'; export const version = '2.0.0';`, 'utf-8');

    const loader = new PluginLoader();
    const plugin = await loader.loadPlugin(pluginPath);

    expect(plugin.name).toBe('plugin-b');
    expect(plugin.version).toBe('2.0.0');

    rmSync(tempDir, { recursive: true, force: true });
  });

  it('should throw readable error for invalid plugin path', async () => {
    const loader = new PluginLoader();

    await expect(loader.loadPlugin('/tmp/does-not-exist-plugin.mjs')).rejects.toThrow(
      'Failed to load plugin at /tmp/does-not-exist-plugin.mjs:'
    );
  });
});
