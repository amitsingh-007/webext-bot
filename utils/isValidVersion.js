import { valid, gte } from "semver";

const isValidVersion = (oldVersion, newVersion) =>
  valid(newVersion) && gte(newVersion, oldVersion);

export default isValidVersion;
