import bytes, { BytesOptions } from "bytes";
import json2md from "json2md";

json2md.converters.collapsible = (input: {
  summary: string;
  description: string;
}) => `
<details>
<summary>${input.summary}</summary>
</br>

${input.description}
</details>`;

const byteOptions: BytesOptions = {
  decimalPlaces: 2,
  fixedDecimals: true,
  unitSeparator: " ",
};
const formatBytes = (byte: number) => bytes(byte, byteOptions) || "";

export const getExtSizeChangeComment = async (
  currentSize: number,
  latestReleaseSize: number,
  commitId: string
) => {
  const sizeDiff = currentSize - latestReleaseSize;
  const percentChange = (sizeDiff / latestReleaseSize) * 100;

  return json2md([
    {
      collapsible: {
        summary: `Extension Size Change: &nbsp ${formatBytes(
          sizeDiff
        )} ${getEmoji(sizeDiff)}`,
        description: json2md({
          table: {
            headers: ["", ""],
            rows: [
              ["Commit", commitId],
              ["Latest release size", formatBytes(latestReleaseSize)],
              ["Current size", formatBytes(currentSize)],
              ["Percent change", `${percentChange.toFixed(2)} %`],
            ],
          },
        }),
      },
    },
    { hr: "" },
    {
      h4:
        sizeDiff > 10 * 1024 //10KB
          ? "Significant size increase in this commit ⚠️"
          : "This commit looks good, cheers 👏",
    },
  ]);
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
