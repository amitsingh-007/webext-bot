import bytes, { BytesOptions } from "bytes";
const markdownTable = require("markdown-table");

const byteOptions: BytesOptions = {
  decimalPlaces: 2,
  fixedDecimals: true,
  unitSeparator: " ",
};

export const getEmoji = (sizeDiff: number) => {
  if (sizeDiff > 0) {
    return "🔺";
  }
  if (sizeDiff < 0) {
    return "✅";
  }
  return "0️⃣";
};

export const getExtSizeChangeComment = async (
  currentSize: number,
  latestReleaseSize: number,
  commitId: string
) => {
  const sizeDiff = currentSize - latestReleaseSize;
  const percentChange = (sizeDiff / latestReleaseSize) * 100;

  const summary = `Extension Size Change: &nbsp ${bytes(
    sizeDiff,
    byteOptions
  )} ${getEmoji(sizeDiff)}`;
  const description = markdownTable([
    ["", ""],
    ["Commit", commitId],
    ["Latest release size", bytes(latestReleaseSize, byteOptions)],
    ["Current size", bytes(currentSize, byteOptions)],
    ["Percent change", `${percentChange.toFixed(2)} %`],
  ]);
  const footerText =
    sizeDiff > 10 * 1024 //10KB
      ? "Significant size increase in this commit ⚠️"
      : "This commit looks good, cheers 👏";

  return `
  <details>
  <summary>${summary}</summary>
  </br>

  ${description}
  </details/>

  **${footerText}**
  `;
};
