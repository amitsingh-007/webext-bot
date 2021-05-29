const semver = require("semver");

const isValidVersion = (oldVersion, newVersion) =>
  semver.valid(newVersion) && semver.gte(newVersion, oldVersion);

module.exports = isValidVersion;
