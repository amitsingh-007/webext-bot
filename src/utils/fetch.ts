import { Context } from "probot";
import YAML from "yaml";
import { ConfigSchema } from "../constants/config";

export const fetchFile = async (
  context: Context,
  path: string,
  ref?: string
) => {
  try {
    const params = context.repo({ path, ref });
    const response = await context.octokit.repos.getContent(params);
    const { content, encoding } = response.data as any;
    const decodedContent = Buffer.from(content, encoding).toString();
    return YAML.parse(decodedContent);
  } catch (error: any) {
    context.log.info(error);
    return null;
  }
};

export const fetchConfig = async (context: Context, commitId?: string) => {
  const response = await fetchFile(context, ".github/webext.yml", commitId);
  return ConfigSchema.parse(response);
};

export const fetchCurrentArtifactSize = async (
  context: Context<"workflow_run.completed">,
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
  context: Context<"workflow_run.completed">
) => {
  try {
    const { octokit } = context;
    const params = context.repo({});
    const res = await octokit.repos.getLatestRelease(params);
    if (!res || !res.data || !res.data.assets) {
      return null;
    }
    const [latestReleasedExtension] = res.data.assets;
    return latestReleasedExtension ? latestReleasedExtension.size : null;
  } catch (error: any) {
    context.log.info(error);
    return null;
  }
};
