import { type Context } from 'probot';
import { formatBytes, getEmoji, getExtSizeChangeComment } from '../utils/message';
import { fetchCurrentArtifactSize, fetchLatestReleaseExtensionSize } from '../utils/fetch';
import { commentOnPullRequest } from '../utils/github';
import { type IConfig } from '../constants/config';

const CHECK_NAME = 'Web Ext';

interface ICheckOutput {
  title: string;
  message: string;
  conclusion: 'success' | 'failure';
}

export interface ICreateCheckOutput {
  checkId: number;
  detailsUrl: string | undefined;
}

const commentOnPullRequests = async (ctx: Context<'workflow_run.completed'>, message: string) => {
  const prNumbers =
    ctx.payload.workflow_run.pull_requests
      ?.map((pullRequest) => pullRequest?.number)
      .filter((number) => number !== undefined) ?? [];
  await Promise.all(prNumbers.map(async (number) => commentOnPullRequest(ctx, message, number)));
};

const updateCheck = async (
  ctx: Context<'workflow_run.completed'>,
  check: ICreateCheckOutput,
  checkOutput: ICheckOutput
) => {
  const { repository, workflow_run } = ctx.payload;
  await ctx.octokit.rest.checks.update({
    owner: repository.owner.login,
    repo: repository.name,
    check_run_id: check.checkId,
    name: CHECK_NAME,
    head_sha: workflow_run.head_commit.id,
    status: 'completed',
    conclusion: checkOutput.conclusion,
    completed_at: new Date().toISOString(),
    details_url: check.detailsUrl,
    output: {
      title: checkOutput.title,
      summary: checkOutput.message,
    },
  });
};

export const addChecksAndComment = async (
  context: Context<'workflow_run.completed'>,
  check: ICreateCheckOutput,
  config: IConfig
) => {
  const { id, head_commit } = context.payload.workflow_run;
  const [currentExtSize, latestReleaseExtSize] = await Promise.all([
    fetchCurrentArtifactSize(context, id, config.workflow.artifact),
    fetchLatestReleaseExtensionSize(context),
  ]);
  if (!currentExtSize) {
    context.log.info('Current extension size not found');
    return;
  }

  if (!latestReleaseExtSize) {
    context.log.info('Latest extension size not found');
    return;
  }

  const actualSizeDiff = currentExtSize - latestReleaseExtSize;
  const absoluteSizeDiff = Math.abs(actualSizeDiff);
  const message = getExtSizeChangeComment(currentExtSize, latestReleaseExtSize, head_commit.id);
  if (absoluteSizeDiff >= config['comment-threshold']) {
    await commentOnPullRequests(context, message);
  }

  await updateCheck(context, check, {
    conclusion: 'success',
    title: `Total size difference: ${formatBytes(absoluteSizeDiff)} ${getEmoji(actualSizeDiff)}`,
    message,
  });
};

export const addFailedCheck = async (
  context: Context<'workflow_run.completed'>,
  check: ICreateCheckOutput
) => {
  await updateCheck(context, check, {
    conclusion: 'failure',
    title: 'Build failed. Make sure your CI build is passing.',
    message:
      'Your CI build failed. Please check and make sure it passes. If CI build passes then only this check is executed.',
  });
};

export const createCheckRun = async (
  ctx: Context<'workflow_run.completed'>
): Promise<ICreateCheckOutput> => {
  const { repository, workflow_run } = ctx.payload;
  const response = await ctx.octokit.rest.checks.create({
    owner: repository.owner.login,
    repo: repository.name,
    name: CHECK_NAME,
    head_sha: workflow_run.head_commit.id,
    status: 'in_progress',
    started_at: new Date().toISOString(),
    output: {
      title: 'Check is in progress',
      summary: 'Waiting...',
    },
  });
  return {
    checkId: response.data.id,
    detailsUrl: response.data.html_url ?? undefined,
  };
};
