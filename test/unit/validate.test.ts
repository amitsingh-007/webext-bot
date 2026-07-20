import { describe, it, expect } from 'vitest';
import { shouldIgnoreBranch, shouldSkipWorkflow, isValidVersion } from '../../src/utils/validate';
import { defaultConfig } from '../helpers';

describe('shouldIgnoreBranch', () => {
  it('ignores a null branch', () => {
    expect(shouldIgnoreBranch(defaultConfig, null)).toBe(true);
  });

  it('ignores a branch matching a glob in branches-ignore', () => {
    expect(shouldIgnoreBranch(defaultConfig, 'dependabot/npm/foo')).toBe(true);
  });

  it('does not ignore a normal branch', () => {
    expect(shouldIgnoreBranch(defaultConfig, 'feature/awesome')).toBe(false);
  });

  it('ignores nothing when branches-ignore is empty', () => {
    const config = { ...defaultConfig, 'branches-ignore': [] };
    expect(shouldIgnoreBranch(config, 'dependabot/npm/foo')).toBe(false);
  });
});

describe('shouldSkipWorkflow', () => {
  type Workflow = Parameters<typeof shouldSkipWorkflow>[0];
  type Run = Parameters<typeof shouldSkipWorkflow>[1];
  const workflow = (name: string) => ({ name }) as unknown as Workflow;
  const run = (headBranch: string) => ({ head_branch: headBranch }) as unknown as Run;

  it('skips when the workflow name does not match the config', () => {
    expect(shouldSkipWorkflow(workflow('Other'), run('feature/awesome'), defaultConfig)).toBe(true);
  });

  it('skips when the run branch is ignored', () => {
    expect(shouldSkipWorkflow(workflow('Build'), run('dependabot/npm/foo'), defaultConfig)).toBe(
      true
    );
  });

  it('does not skip a matching workflow on a normal branch', () => {
    expect(shouldSkipWorkflow(workflow('Build'), run('feature/awesome'), defaultConfig)).toBe(
      false
    );
  });
});

describe('isValidVersion', () => {
  it('accepts an equal version (gte)', () => {
    expect(isValidVersion('1.0.0', '1.0.0')).toBeTruthy();
  });

  it('accepts a higher version', () => {
    expect(isValidVersion('1.0.0', '1.1.0')).toBeTruthy();
  });

  it('rejects a lower version', () => {
    expect(isValidVersion('1.1.0', '1.0.0')).toBeFalsy();
  });

  it('rejects an invalid new version', () => {
    expect(isValidVersion('1.0.0', 'not-a-version')).toBeFalsy();
  });

  it('throws when the existing version is invalid semver', () => {
    // Semver.gte rejects the invalid old version; the caller's try/catch handles it.
    expect(() => isValidVersion('not-a-version', '1.0.0')).toThrow();
  });
});
