import { describe, it, expect } from 'vitest';
import { ConfigSchema, ManifestSchema } from '../../src/constants/config';

const minimalConfig = {
  manifest: { name: 'manifest.json', dir: './' },
  workflow: { name: 'Build', artifact: 'extension' },
};

describe('ConfigSchema', () => {
  it('applies defaults for optional fields', () => {
    const config = ConfigSchema.parse(minimalConfig);
    expect(config['branches-ignore']).toEqual([]);
    expect(config['comment-threshold']).toBe(0);
    expect(config['auto-assign']).toBeUndefined();
  });

  it('accepts a fully specified config', () => {
    const config = ConfigSchema.parse({
      ...minimalConfig,
      'branches-ignore': ['dependabot/**'],
      'comment-threshold': 100,
      'auto-assign': ['reviewer1'],
    });
    expect(config['auto-assign']).toEqual(['reviewer1']);
  });

  it('rejects unknown top-level keys (strict)', () => {
    expect(() =>
      ConfigSchema.parse({ ...minimalConfig, unknown: true })
    ).toThrow();
  });

  it('rejects unknown keys inside nested manifest/workflow (strict)', () => {
    expect(() =>
      ConfigSchema.parse({
        ...minimalConfig,
        manifest: { name: 'manifest.json', dir: './', extra: 1 },
      })
    ).toThrow();
  });

  it('requires manifest and workflow', () => {
    expect(() => ConfigSchema.parse({})).toThrow();
  });
});

describe('ManifestSchema', () => {
  it('requires a version string', () => {
    expect(ManifestSchema.parse({ version: '1.2.3' })).toEqual({
      version: '1.2.3',
    });
  });

  it('allows extra keys (not strict)', () => {
    const manifest = ManifestSchema.parse({
      version: '1.2.3',
      name: 'My Extension',
    });
    expect(manifest.version).toBe('1.2.3');
  });

  it('rejects a missing version', () => {
    expect(() => ManifestSchema.parse({})).toThrow();
  });
});
