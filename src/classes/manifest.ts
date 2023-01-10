class Manifest {
  name: any;
  dir: any;

  constructor(manifest: any) {
    const { name = "manifest.json", dir = "./" } = manifest || {};
    this.name = name;
    this.dir = dir;
  }
}

export default Manifest;
