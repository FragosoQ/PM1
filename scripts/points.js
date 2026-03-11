class Points {
  constructor(grid) {
    this.grid = grid;
    this.total = grid.length;
    this.radius = config.sizes.globe + config.sizes.globe * config.scale.points;

    groups.points = new THREE.Group();
    groups.points.name = 'Points';

    this.create();

    elements.globePoints = this.points;
    groups.points.add(this.points);
  }

  create() {
    const color = new THREE.Color();
    const positions = new Float32Array(this.total * 3);
    const colors = new Float32Array(this.total * 3);
    const sizes = new Float32Array(this.total);

    for(let i = 0; i < this.grid.length; i++) {
      const {lat, lon} = this.grid[i];
      const {x, y, z} = toSphereCoordinates(lat, lon, this.radius);

      const positionIndex = i * 3;
      positions[positionIndex] = -x;
      positions[positionIndex + 1] = -y;
      positions[positionIndex + 2] = -z;
      sizes[i] = config.sizes.globeDotSize;

      color.set(config.colors.globeDotColor);
      color.toArray(colors, i * 3);
    }

    this.geometry = new THREE.BufferGeometry();
    this.material = new THREE.PointsMaterial({
      color: config.colors.globeDotColor,
      size: config.sizes.globeDotSize
    });

    this.geometry.addAttribute('position', new THREE.BufferAttribute( positions, 3 ));
    this.geometry.addAttribute('customColor', new THREE.BufferAttribute( colors, 3 ));
    this.geometry.addAttribute('size', new THREE.BufferAttribute( sizes, 1 ));
  
    this.points = new THREE.Points( this.geometry,  this.material );
  }

  updateColor(col) {
    const color = new THREE.Color();
    const colorsArray = new Float32Array(this.total * 3);

    for(let i = 0; i < this.grid.length; i++) {
      color.set(col);
      color.toArray(colorsArray, i * 3);
    }

    const colors = new THREE.BufferAttribute( colorsArray, 3 );
    this.geometry.attributes.customColor = colors;
  }
}