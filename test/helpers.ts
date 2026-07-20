import { Buffer } from 'node:buffer';
import { Probot, ProbotOctokit } from 'probot';
import YAML from 'yaml';
import app from '../src/app';
import { type IConfig } from '../src/constants/config';

export const OWNER = 'amitsingh-007';
export const REPO = 'webext-bot';
export const GITHUB_API = 'https://api.github.com';

// `githubToken` avoids the installation-token exchange (no `/access_tokens` mock).
export const newProbot = async () => {
  const probot = new Probot({
    githubToken: 'test',
    // Function form so `enabled: false` survives probot's shallow throttle merge,
    // otherwise the throttle plugin spaces writes ~1s apart.
    Octokit: ProbotOctokit.defaults((options: Record<string, unknown>) => ({
      ...options,
      retry: { enabled: false },
      throttle: { enabled: false },
    })),
  });
  await probot.load(app);
  return probot;
};

export const defaultConfig: IConfig = {
  'branches-ignore': ['dependabot/**'],
  'comment-threshold': 100,
  'auto-assign': ['reviewer1'],
  manifest: { name: 'manifest.json', dir: './' },
  workflow: { name: 'Build', artifact: 'extension' },
};

// The base64 file envelope `getContent` returns and `extractFile` expects.
export const fileEnvelope = (content: string) => ({
  type: 'file' as const,
  content: Buffer.from(content).toString('base64'),
  encoding: 'base64' as const,
});

// Octokit percent-encodes the file path (`.github/webext.yml` → `.github%2Fwebext.yml`).
export const contentsPath = (filePath: string) =>
  `/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(filePath)}`;

export const configEnvelope = (config: Partial<IConfig> = {}) =>
  fileEnvelope(YAML.stringify({ ...defaultConfig, ...config }));

export const manifestEnvelope = (version: string) =>
  fileEnvelope(JSON.stringify({ version }));
