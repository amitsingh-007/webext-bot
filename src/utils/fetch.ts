import path from 'node:path';
import { Buffer } from 'node:buffer';
import { type Context } from 'probot';
import YAML from 'yaml';
import { ConfigSchema, ManifestSchema, type IConfig } from '../constants/config';

export const fetchFile = async (ctx: Context, filePath: string, ref?: string): Promise<unknown> => {
  try {
    const { data } = await ctx.octokit.rest.repos.getContent(ctx.repo({ path: filePath, ref }));
    // `getContent` only returns an array for a directory path; every caller passes a file.
    if (Array.isArray(data) || data.type !== 'file') {
      return null;
    }

    return YAML.parse(Buffer.from(data.content, 'base64').toString());
  } catch (error: any) {
    ctx.log.info(error);
    return null;
  }
};

export const fetchConfig = async (context: Context, commitId?: string) => {
  const response = await fetchFile(context, '.github/webext.yml', commitId);
  return ConfigSchema.parse(response);
};

export const fetchManifest = async (context: Context, config: IConfig, commitId?: string) => {
  const { manifest } = config;
  const response = await fetchFile(context, path.posix.join(manifest.dir, manifest.name), commitId);
  return ManifestSchema.parse(response);
};

export const fetchCurrentArtifactSize = async (
  ctx: Context<'workflow_run.completed'>,
  workflowRunId: number,
  artifactName: string
): Promise<number | undefined> => {
  const { repository } = ctx.payload;
  const { data } = await ctx.octokit.rest.actions.listWorkflowRunArtifacts({
    owner: repository.owner.login,
    repo: repository.name,
    run_id: workflowRunId,
  });
  return data?.artifacts.find((artifact) => artifact.name === artifactName)?.size_in_bytes;
};

export const fetchLatestReleaseExtensionSize = async (ctx: Context<'workflow_run.completed'>) => {
  try {
    const res = await ctx.octokit.rest.repos.getLatestRelease(ctx.repo({}));
    return res.data.assets[0]?.size ?? null;
  } catch (error: any) {
    ctx.log.info(error);
    return null;
  }
};
