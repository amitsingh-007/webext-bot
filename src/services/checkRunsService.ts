import bytes from 'bytes';
import { type Context } from 'probot';
import { getEmoji, getExtSizeChangeComment } from '../utils/message';
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
  const { pull_requests: pullRequests } = ctx.payload.workflow_run;
  const prNumbers = (pullRequests ?? []).flatMap((pullRequest) =>
    pullRequest?.number === undefined ? [] : [pullRequest.number]
  );
  await Promise.all(prNumbers.map(async (number) => commentOnPullRequest(ctx, message, number)));
};

const updateCheck = async (
  ctx: Context<'workflow_run.completed'>,
  check: ICreateCheckOutput,
  checkOutput: ICheckOutput
) => {
  const { repository, workflow_run } = ctx.payload;
  try {
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
  } catch (error: any) {
    ctx.log.info(error);
  }
};

export const addChecksAndComment = async (
  context: Context<'workflow_run.completed'>,
  req: {
    headSha: string;
    check: ICreateCheckOutput;
    config: IConfig;
  }
) => {
  const { id } = context.payload.workflow_run;
  const { headSha, check, config } = req;
  const currentExtSize = await fetchCurrentArtifactSize(context, id, config.workflow.artifact);
  if (!currentExtSize) {
    context.log.info('Current extension size not found');
    return;
  }

  const latestReleaseExtSize = await fetchLatestReleaseExtensionSize(context);
  if (!latestReleaseExtSize) {
    context.log.info('Latest extension size not found');
    return;
  }

  const actualSizeDiff = currentExtSize - latestReleaseExtSize;
  const absoluteSizeDiff = Math.abs(actualSizeDiff);
  const message = getExtSizeChangeComment(currentExtSize, latestReleaseExtSize, headSha);
  if (absoluteSizeDiff >= config['comment-threshold']) {
    await commentOnPullRequests(context, message);
  }

  await updateCheck(context, check, {
    conclusion: 'success',
    title: `Total size difference: ${bytes(absoluteSizeDiff)} ${getEmoji(actualSizeDiff)}`,
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
  ctx: Context<'workflow_run.completed'>,
  commitId: string
): Promise<ICreateCheckOutput | undefined> => {
  try {
    const { repository } = ctx.payload;
    const response = await ctx.octokit.rest.checks.create({
      owner: repository.owner.login,
      repo: repository.name,
      name: CHECK_NAME,
      head_sha: commitId,
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
  } catch (error: any) {
    ctx.log.info(error);
    return undefined;
  }
};
