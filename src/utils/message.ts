/* eslint-disable indent */
import bytes from "bytes";

interface ITableRow {
  title: string;
  values: {
    text: string;
    noHighlight?: boolean;
  }[];
}

const byteOptions = {
  decimalPlaces: 2,
  fixedDecimals: true,
};

const COMMENT_HEADING = "Web Extension Change Summary";

export const getEmoji = (sizeDiff: number) => {
  if (sizeDiff > 0) {
    return "🔼";
  }
  if (sizeDiff < 0) {
    return "🔽";
  }
  return "⏸";
};

const getMarkdownTable = (
  heading: string,
  tableRows: ITableRow[],
  footerText: string
) => `
### ${heading}
| | |
| --- | --- |
${tableRows
  .map((row) => {
    const texts = row.values.map(({ text, noHighlight }) =>
      noHighlight ? text : `\`${text}\``
    );
    return `| **${row.title}** | ${texts.join(" \\| ")} |`;
  })
  .join("\n")}
---
**${footerText}**`;

export const getMessage = (
  currentSize: number,
  latestReleaseSize: number,
  commitId: string
) => {
  const sizeDiff = currentSize - latestReleaseSize;
  const percentChange = (sizeDiff / latestReleaseSize) * 100;
  const tableRows: ITableRow[] = [
    {
      title: "Commit",
      values: [{ text: commitId, noHighlight: true }],
    },
    {
      title: "Latest Release Size",
      values: [
        { text: bytes(latestReleaseSize, byteOptions) },
        { text: `${latestReleaseSize} Bytes` },
      ],
    },
    {
      title: "Current Size",
      values: [
        { text: bytes(currentSize, byteOptions) },
        { text: `${currentSize} Bytes` },
      ],
    },
    {
      title: "Size Difference",
      values: [
        { text: bytes(sizeDiff, byteOptions) },
        { text: `${sizeDiff} Bytes` },
      ],
    },
    {
      title: "Percent Change",
      values: [
        { text: `${percentChange.toFixed(2)}%` },
        { text: getEmoji(sizeDiff) },
      ],
    },
  ];
  const footerText =
    sizeDiff > 10 * 1024
      ? "There is a significant size increase in this commit.🤔"
      : "This commit looks good. Cheers 🙌";
  return getMarkdownTable(COMMENT_HEADING, tableRows, footerText);
};
