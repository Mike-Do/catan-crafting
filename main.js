import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const smallHexGeometry = new THREE.CylinderGeometry( 0.95, 0.95, 1, 6 );
const smallHexMaterial = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );

// Array to hold smaller hexagon meshes
const smallHexagons = [];

// Function to create a single small hexagon
function createSmallHexagon(x, y, z) {
    const smallHexagonMesh = new THREE.Mesh(smallHexGeometry, smallHexMaterial);
    smallHexagonMesh.position.set(x, y, z);
    return smallHexagonMesh;
}

// Function to create the larger hexagon tile
function createHexagonTile() {
    const hexagonGroup = new THREE.Group();

    // Define positions for smaller hexagons forming the larger hexagon
    const positions = [
        // [0, 0, 0],
        // [1, 0, 0],
        // [2, 0, 0],
        // [0, 0, 1],
        // [1, 0, 1],
        // [2, 0, 1],
        // [0, 0, 2],
        // [1, 0, 2],
        // [2, 0, 2]
		// [0, 0, 0],
		// [-1, 0, 0],
		// [-2, 0, 0],

		// [-0.5, 0, -1.5],
		// [-0.5, 0, 1.5]

		// GOOD NUMBERS
		// [0, 0, 0],
		// [1.5, 0, -0.866],
		// [-1.5, 0, -0.866],
		// [-3, 0, 0],
		// [-1.5, 0, 0.866],
		// [1.5, 0, 0.866],
		// [3, 0, 0]

		//
		[-Math.sqrt(3), 0, 0],
		[0, 0, 0],
		[Math.sqrt(3)/2, 0, 1.5],
		[-Math.sqrt(3)/2, 0, 1.5],
		[Math.sqrt(3), 0, 0],
		[Math.sqrt(3)/2, 0, -1.5],
		[-Math.sqrt(3)/2, 0, -1.5]

		// [-2, 0, -3],
		// [2, 0, -3],

    ];

    // Create smaller hexagons at specified positions
    for (let i = 0; i < positions.length; i++) {
        const [x, y, z] = positions[i];
        const smallHexagon = createSmallHexagon(x, y, z);
        smallHexagons.push(smallHexagon);
        hexagonGroup.add(smallHexagon);
    }

    return hexagonGroup;
}

// Add the larger hexagon tile to the scene
const largerHexagon = createHexagonTile();
scene.add(largerHexagon);

// const cube = new THREE.Mesh( hexGeomgetry, material );
// scene.add( cube );

camera.position.z = 10;

largerHexagon.rotation.x += 5;
largerHexagon.rotation.y += 5;

function animate() {
	requestAnimationFrame( animate );

	largerHexagon.rotation.x += 0.009;
    largerHexagon.rotation.y += 0.009;

	renderer.render( scene, camera );
}

animate();
