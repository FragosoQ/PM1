const dotTextureLoader = new THREE.TextureLoader();

function createFallbackDotTexture() {
	const size = 64;
	const canvas = document.createElement('canvas');
	canvas.width = size;
	canvas.height = size;
	const ctx = canvas.getContext('2d');

	const gradient = ctx.createRadialGradient(
		size * 0.5,
		size * 0.5,
		size * 0.08,
		size * 0.5,
		size * 0.5,
		size * 0.5
	);

	gradient.addColorStop(0, 'rgba(255,255,255,1)');
	gradient.addColorStop(0.25, 'rgba(0,210,255,0.95)');
	gradient.addColorStop(0.6, 'rgba(0,130,255,0.55)');
	gradient.addColorStop(1, 'rgba(0,130,255,0)');

	ctx.fillStyle = gradient;
	ctx.beginPath();
	ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
	ctx.fill();

	const texture = new THREE.CanvasTexture(canvas);
	texture.minFilter = THREE.LinearFilter;
	texture.magFilter = THREE.LinearFilter;
	texture.needsUpdate = true;
	return texture;
}

const dotTexture = createFallbackDotTexture();

function setDotTexture(texture) {
	if (!texture) return;
	texture.minFilter = THREE.LinearFilter;
	texture.magFilter = THREE.LinearFilter;
	if (Dot.sharedMaterial) {
		Dot.sharedMaterial.map = texture;
		Dot.sharedMaterial.needsUpdate = true;
	}
}

dotTextureLoader.load(
	config.urls.pointTexture,
	(loadedTexture) => setDotTexture(loadedTexture),
	undefined,
	() => {
		dotTextureLoader.load(
			'https://static.wixstatic.com/media/a6967f_034c4bb41e814fc7b03969408024e9a1~mv2.png',
			(loadedTexture) => setDotTexture(loadedTexture),
			undefined,
			() => {}
		);
	}
);

class Dots {
	constructor() {
		this.total = config.dots.total;

		groups.lineDots = new THREE.Group();
		groups.lineDots.name = 'LineDots';

		this.create();
	}

	create() {
		for(let i = 0; i < config.dots.total; i++) {
			const dot = new Dot();
			dot.assignToLine();
			groups.lineDots.add(dot.mesh);
			elements.lineDots.push(dot);
		}
	}
}

class Dot {
	constructor() {
		if (!Dot.sharedMaterial) {
			Dot.sharedMaterial = new THREE.SpriteMaterial({
				map: dotTexture,
				transparent: true,
				opacity: 1.0,
				color: 0xffffff,
				blending: THREE.NormalBlending,
				depthTest: false,
				depthWrite: false
			});
		}

		this.mesh = new THREE.Sprite(Dot.sharedMaterial);
		this.mesh.scale.set(16, 16, 1);
		this.mesh.renderOrder = 1001;
		this.mesh.visible = false;

		this._path = null;
		this._pathIndex = 0;
	}

	assignToLine() {
		if(countries.selected) {
			const lines = countries.selected.children
			if (!lines || lines.length === 0) return;
			const index = Math.floor(Math.random() * lines.length);
			const line = lines[index];
			this._path = line._path;
			this._pathIndex = 0;
		}
	}

	animate() {
		if(!this._path) {
			this.assignToLine();
		} else if(this._path && this._pathIndex < this._path.length - 1) {
			if(!this.mesh.visible) {
				this.mesh.visible = true;
			}

			const {x, y, z} = this._path[this._pathIndex];
			this.mesh.position.set(x, y, z);
			this._pathIndex += 2;
		} else {
			this.mesh.visible = false;
			this._path = null;
			this._pathIndex = 0;
		}
	}
}
