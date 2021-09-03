const Manifest = require("./manifest");
const Workflow = require("./workflow");

class Config {
  constructor(config = {}) {
    const { manifest, workflow } = config;
    this.manifest = new Manifest(manifest);
    this.workflow = new Workflow(workflow);
    this.branchesIgnore = config["branches-ignore"] || [];
    this.commentThreshold = config["comment-threshold"] || 0;
    this.autoAssign = config["auto-assign"];
  }
}

module.exports = Config;
