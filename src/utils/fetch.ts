import path from 'node:path';
import { Buffer } from 'node:buffer';
import { type ProbotOctokit, type Context } from 'probot';
import YAML from 'yaml';
import normalize from 'normalize-path';
import {
  ConfigSchema,
  ManifestSchema,
  type IConfig,
} from '../constants/config';

const extractFile = (
  data: Awaited<ReturnType<ProbotOctokit['repos']['getContent']>>['data']
) => {
  if (!Array.isArray(data)) {
    if (data.type !== 'file') {
      return undefined;
    }

    return {
      content: data.content,
      encoding: data.encoding,
    };
  }

  const file = data.find((item) => item.type === 'file');
  if (!file) {
    return undefined;
  }

  return {
    content: file.content ?? '',
    encoding: 'encoding' in file ? file.encoding : 'base64',
  };
};

export const fetchFile = async (
  context: Context,
  path: string,
  ref?: string
): Promise<unknown> => {
  try {
    const params = context.repo({ path, ref });
    const response = await context.octokit.repos.getContent(params);

    const file = extractFile(response.data);
    if (!file) {
      return null;
    }

    const decodedContent = Buffer.from(
      file.content,
      file.encoding as BufferEncoding
    ).toString();
    return YAML.parse(decodedContent);
  } catch (error: any) {
    context.log.info(error);
    return null;
  }
};

export const fetchConfig = async (context: Context, commitId?: string) => {
  const response = await fetchFile(context, '.github/webext.yml', commitId);
  return ConfigSchema.parse(response);
};

export const fetchManifest = async (
  context: Context,
  config: IConfig,
  commitId?: string
) => {
  const { manifest } = config;
  const manifestFilePath = normalize(
    path.normalize(path.join(manifest.dir, manifest.name))
  );
  const response = await fetchFile(context, manifestFilePath, commitId);
  return ManifestSchema.parse(response);
};

export const fetchCurrentArtifactSize = async (
  context: Context<'workflow_run.completed'>,
  workflowRunId: number,
  artifactName: string
): Promise<number | undefined> => {
  const { repository } = context.payload;
  const { data } = await context.octokit.actions.listWorkflowRunArtifacts({
    owner: repository.owner.login,
    repo: repository.name,
    run_id: workflowRunId,
  });
  const extension = data?.artifacts.find(
    (artifact) => artifact.name === artifactName
  );
  return extension?.size_in_bytes;
};

export const fetchLatestReleaseExtensionSize = async (
  context: Context<'workflow_run.completed'>
) => {
  try {
    const { octokit } = context;
    const params = context.repo({});
    const res = await octokit.repos.getLatestRelease(params);
    if (!res?.data?.assets) {
      return null;
    }

    const [latestReleasedExtension] = res.data.assets;
    return latestReleasedExtension ? latestReleasedExtension.size : null;
  } catch (error: any) {
    context.log.info(error);
    return null;
  }
};
