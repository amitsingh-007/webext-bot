const Manifest = require("./manifest");
const Workflow = require("./workflow");

class Config {
  constructor(config) {
    const {
      manifest,
      workflow,
      branchesIgnore = [],
      commentThreshold = 0,
    } = config || {};
    this.manifest = new Manifest(manifest);
    this.workflow = new Workflow(workflow);
    this.branchesIgnore = branchesIgnore;
    this.commentThreshold = commentThreshold;
  }
}

module.exports = Config;
