class Workflow {
  constructor(workflow) {
    const { name = "CI", artifact = "extension" } = workflow || {};
    this.name = name;
    this.artifact = artifact;
  }
}

module.exports = Workflow;
