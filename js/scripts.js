// From darkest to lightest
var colours = [
	// '#02071C',
	// '#010824',
	// '#011E41',
	// '#042846',
	// '#02294B',
	'#073553',
	// '#06374D',
	'#094C5F',
	// '#064C5C',
	'#064B51',
	// '#085152',
	'#1B6D6B',
	'#456A58',
	'#7C8B7B'
];

var scene, camera, renderer;

function setupScene() {

	scene = new THREE.Scene();
	renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);

	document.body.appendChild(renderer.domElement);

	addCamera();
	addLayers();
	animate();

}

function addCamera() {
	camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 10000);
	camera.position.x = 100 / 2;
	camera.position.y = 100 / 2;
	camera.position.z = 600;
}

var group;

function addLayers() {

	var loader = new THREE.TextureLoader();
	loader.setCrossOrigin(true);

	group = new THREE.Group();

	var layerSizes = {
		depth: 10,
		size: 100
	};

	var extrudeSettings = {
		amount: layerSizes.depth,
		bevelEnabled: false
	};

	var svgElement = document.getElementsByTagName('svg')[0];
	var svgPaths = document.getElementsByTagName('path');

	var returnLayer = function(depth, material) {

		try {

			var offsetX = svgElement.getAttribute('width') / 2;
			var offsetY = svgElement.getAttribute('height') / 2;

			// Construct the main shape
			var shape = new THREE.Shape();
			shape.absarc(offsetX, offsetY, layerSizes.size, 0, Math.PI * 2, false);

			// Try loading the path, otherwise return an error
			var path = $d3g.transformSVGPath(svgPaths[depth].getAttribute('d')).currentPath;

			// Add the SVG path to the shape holes array
			shape.holes.push(path);

			// Construct the layer geometry from the shape and an extrude
			var geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

			// Construct the mesh and adjust its z-position based on loop index
			var mesh = new THREE.Mesh(geometry, material);
			mesh.position.z = depth * layerSizes.depth;

			return mesh;

		}
		catch(error) {

			console.error(error);
			console.error(svgPaths[depth]);

			return null;

		}

	};

	loader.load('https://s3-us-west-2.amazonaws.com/s.cdpn.io/617753/paper_4.png', function(texture) {

		var repeat = 0.01;

		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set(repeat, repeat);

		for (var i = 0; i < svgPaths.length; i++) {

			var material = new THREE.MeshBasicMaterial({
				map: texture,
				overdraw: 10,
				color: new THREE.Color(colours[i])
			});

			var layer = returnLayer(i, material);

			if (layer !== null) {
				group.add(layer);
			}

		}

	});

	scene.add(group);

}

function animate() {

	requestAnimationFrame(animate);

	group.rotation.y += 0.01;

	renderer.render(scene, camera);

}

setupScene();