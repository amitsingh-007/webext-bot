class Workflow {
  name: any;
  artifact: any;

  constructor(workflow: any) {
    const { name = "CI", artifact = "extension" } = workflow || {};
    this.name = name;
    this.artifact = artifact;
  }
}

export default Workflow;
