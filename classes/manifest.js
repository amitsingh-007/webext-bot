class Manifest {
  constructor(manifest) {
    const { name = "manifest.json", dir = "./" } = manifest || {};
    this.name = name;
    this.dir = dir;
  }
}

export default Manifest;
